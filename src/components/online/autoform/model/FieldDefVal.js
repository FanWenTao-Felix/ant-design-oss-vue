import store from '@/store'
import moment from 'moment'
import { replaceAll } from '@/utils/util'
import { httpAction } from '@/api/manage'

import * as CustomExpression from '@/utils/desform/CustomExpression'
// 获取所有用户自定义表达式的Key
const ceKeys = Object.keys(CustomExpression)
// 将key用逗号拼接，可以拼接成方法参数，例：a,b,c --> function(a,b,c){}
const ceJoin = ceKeys.join(',')
// 将用户自定义的表达式按key的顺序放到数组中，可以使用 apply 传递给方法直接调用
const $CE$ = ceKeys.map(key => CustomExpression[key])

/** 普通规则表达式 #{...} */
const normalRegExp = /#{([^}]+)?}/g
/** 用户自定义规则表达式 {{...}} */
const customRegExp = /{{([^}]+)?}}/g
/** 填值规则表达式 ${...} */
const fillRuleRegExp = /\${([^}]+)?}/g

/** action 类型 */
export const ACTION_TYPES = { ADD: 'add', EDIT: 'edit', DETAIL: 'detail', RELOAD: 'reload' }

/**
 * 加载form组件默认值
 * @param form Form对象
 * @param properties 字段配置
 * @param action 操作类型（ACTION_TYPES），除填值规则外，其他表达式只在add下才执行
 * @param getFormData 获取数据的方法，用于填值规则向后台传值
 */
export function loadFieldDefVal({ form, properties, action, getFormData }) {
  if (Array.isArray(properties) && properties.length > 0) {
    properties.forEach(async prop => {
      let { key, defVal, type } = prop._formSchem
      eachHandler(key, defVal, action, (value) => {
        if('number'===type){
          if(isNaN(value) && value.indexOf('.')>0){
            value = parseFloat(value);
          }else{
            value = parseInt(value);
          }
        }
        form.setFieldsValue({ [key]: value })
      }, getFormData)
    })
  }
}

/** 加载JEditableTable组件默认值 */
export function loadFieldDefValForSubTable({ subForms, subTable, row, action, getFormData }) {
  if (subTable && Array.isArray(subTable.columns) && subTable.columns.length > 0) {
    subTable.columns.forEach(async column => {
      let { key, fieldDefaultValue: defVal } = column
      eachHandler(key, defVal, action, (value) => {
        if (subForms.form) {
          subForms.form.setFieldsValue({ [key]: value })
        } else {
          let a = [{ rowKey: row.id, values: { [key]: value } }]
          subForms.jet.setValues(a)
        }
      }, getFormData)
    })
  }
}

async function eachHandler(key, defVal, action, callback, getFormData) {
  if (defVal != null) {
    // 检查类型，如果类型错误则不继续运行
    if (checkExpressionType(defVal)) {
      let value = await getDefaultValue(defVal, action, getFormData)
      if (value != null) {
        callback(value)
      }
    } else {
      // 不合法的表达式直接返回不解析
      callback(defVal)
    }
  }
}

/**
 * 检查表达式类型是否合法，规则：
 * 1、填值规则表达式不能和其他表达式混用
 * 2、每次只能填写一个填值规则表达式
 * 3、普通表达式和用户自定义表达式可以混用
 */
export function checkExpressionType(defVal) {
  // 获取各个表达式的数量
  let normalCount = 0, customCount = 0, fillRuleCount = 0
  defVal.replace(fillRuleRegExp, () => fillRuleCount++)
  if (fillRuleCount > 1) {
    logWarn(`表达式[${defVal}]不合法：只能同时填写一个填值规则表达式！`)
    return false
  }
  defVal.replace(normalRegExp, () => normalCount++)
  defVal.replace(customRegExp, () => customCount++)
  // 除填值规则外其他规则的数量
  let fillRuleOtherCount = normalCount + customCount
  if (fillRuleCount > 0 && fillRuleOtherCount > 0) {
    logWarn(`表达式[${defVal}]不合法：填值规则表达式不能和其他表达式混用！`)
    return false
  }
  return true
}

/** 获取所有匹配的表达式 */
function getRegExpMap(text, exp) {
  let map = new Map()
  text.replace(exp, function (match, param, offset, string) {
    map.set(match, param.trim())
    return match
  })
  return map
}

/** 获取默认值，可以执行表达式，可以执行用户自定义方法，可以异步获取用户信息等 */
async function getDefaultValue(defVal, action, getFormData) {
  // 只有在 add 和 reload 模式下才执行填值规则
  if (action === ACTION_TYPES.ADD || action === ACTION_TYPES.RELOAD) {
    // 判断是否是填值规则表达式，如果是就执行填值规则
    if (fillRuleRegExp.test(defVal)) {
      return await executeRegExp(defVal, fillRuleRegExp, executeFillRuleExpression, [getFormData])
    }
  }
  // 只有在 add 模式下才执行其他表达式
  if (action === ACTION_TYPES.ADD) {
    // 获取并替换所有常规表达式
    defVal = await executeRegExp(defVal, normalRegExp, executeNormalExpression)
    // 获取并替换所有用户自定义表达式
    defVal = await executeRegExp(defVal, customRegExp, executeCustomExpression)
    return defVal
  }
  return null
}

async function executeRegExp(defVal, regExp, execFun, otherParams = []) {
  let map = getRegExpMap(defVal, regExp)
  for (let origin of map.keys()) {
    let exp = map.get(origin)
    let result = await execFun.apply(null, [exp, origin, ...otherParams])
    // 如果只有一个表达式，那么就不替换（因为一旦替换，类型就会被转成String），直接返回执行结果，保证返回的类型不变
    if (origin === defVal) {
      return result
    }
    defVal = replaceAll(defVal, origin, result)
  }
  return defVal
}

/** 执行【普通表达式】#{xxx} */
async function executeNormalExpression(expression, origin) {
  switch (expression) {
    case 'date':
      return moment().format('YYYY-MM-DD')
    case 'time':
      return moment().format('HH:mm:ss')
    case 'datetime':
      return moment().format('YYYY-MM-DD HH:mm:ss')
    default:
      // 获取当前登录用户的信息
      let result = getUserInfoByExpression(expression)
      if (result != null) {
        return result
      }
      // 没有符合条件的表达式，返回原始值
      return origin
  }
}

/** 根据表达式获取相应的用户信息 */
function getUserInfoByExpression(expression) {
  let userInfo = store.getters.userInfo
  if (userInfo) {
    switch (expression) {
      case 'sysUserId':
        return userInfo.id
      // 当前登录用户登录账号
      case 'sysUserCode':
        return userInfo.username
      // 当前登录用户真实名称
      case 'sysUserName':
        return userInfo.realname
      // 当前登录用户部门编号
      case 'sysOrgCode':
        return userInfo.orgCode
    }
  }
  return null
}

/** 执行【用户自定义表达式】 {{xxx}} */
async function executeCustomExpression(expression, origin) {
  // 利用 eval 生成一个方法，这个方法的参数就是用户自定义的所有的表达式
  let fn = eval(`(function (${ceJoin}){ return ${expression} })`)
  try {
    // 然后调用这个方法，并把表达式传递进去，从而完成表达式的执行
    return fn.apply(null, $CE$)
  } catch (e) {
    // 执行失败，输出错误并返回原始值
    logError(e)
    return origin
  }
}

/** 执行【填值规则表达式】 ${xxx} */
async function executeFillRuleExpression(expression, origin, getFormData) {
  let url = `/sys/fillRule/executeRuleByCode/${expression}`
  let formData = {}
  if (typeof getFormData === 'function') {
    formData = getFormData()
  }
  let { success, message, result } = await httpAction(url, formData, 'PUT')
  if (success) {
    return result
  } else {
    logError(`填值规则（${expression}）执行失败：${message}`)
    return origin
  }
}

function logWarn(message) {
  console.warn('[loadFieldDefVal]:', message)
}

function logError(message) {
  console.error('[loadFieldDefVal]:', message)
}
