/*
* design form util
* 已开放：通过 online 生成表单接口，并支持通过online配置动态生成不同的组件
*/

/** 忽略生成的字段 */
const IGNORES = ['id', 'create_by', 'create_time', 'update_by', 'update_time','sys_org_code']

/** 字段类型对应数组 */
const FIELD_TYPES = [
  //  desform: null = 暂未支持该组件
  {cgform: 'text', desform: 'input', remarks: '文本框'},
  {cgform: 'radio', desform: 'radio', remarks: '单选框'},
  {cgform: 'checkbox', desform: 'checkbox', remarks: '多选'},
  {cgform: 'date', desform: 'date', remarks: '日期(yyyy-MM-dd)'},
  {cgform: 'datetime', desform: 'datetime', remarks: '日期（yyyy-MM-dd HH:mm:ss）'},
  {cgform: 'textarea', desform: 'textarea', remarks: '多行文本'},
  {cgform: 'list', desform: 'select', remarks: '下拉框'},
  {cgform: 'popup', desform: 'table-dict', remarks: 'popup弹出框'},
  {cgform: 'sel_search', desform: 'table-dict_select', remarks: '下拉搜索'},
  {cgform: 'umeditor', desform: 'editor', remarks: '富文本编辑器'},
  {cgform: 'sel_depart', desform: 'select-depart', remarks: '部门选择器'},
  {cgform: 'sel_user', desform: 'select-user', remarks: '用户选择器'},
  {cgform: 'image', desform: 'imgupload', remarks: '图片'},
  {cgform: 'file', desform: 'file-upload', remarks: '文件'},
]

/**
 * 子表支持的类型
 * @type {string[]}
 */
export const subTableSupportTypes = ['input', 'number', 'select', 'time', 'date', 'radio', 'checkbox', 'textarea']

/**
 * 检查是否是子表支持的类型
 * @returns {boolean}
 */
export function subTableCheckType(checkType) {
  // 检查拖入的组件是否已被支持
  for (let type of subTableSupportTypes) {
    if (`${checkType}`.toLowerCase() === type.toLowerCase()) {
      return true
    }
  }
  return false
}

/** 根据 online cgform 生成表单
 *
 * @param json 表单生成器的 json 对象，传 null 则自动生成一个
 * @param onlineForms 要生成的 online 表单 head表 数组，下标 0 一定是主表，大于 0 的为附表，若没有大于 0 的则代表没有附表
 * @param onlineFields 要生成的 online 表单 field表 数组，下标与 onlineForms 一一对应
 * @param templetJson 模板json，不使用模板就传 null
 */
export function generateFormBaseCgform(json, onlineForms, onlineFields, templetJson) {

  let jsonObject = json ? json : {
    list: [],
    config: {labelWidth: 100, labelPosition: 'top', size: 'small'}
  }

  // 指定向那些项里面填充表单
  let fullObject = [jsonObject.list]

  // 判断是否使用了模板
  if (templetJson != null) {
    let templet = JSON.parse(templetJson)
    if (templet && templet.list) {
      jsonObject = templet
      fullObject = []
      // 遍历判断模板中是否有栅格布局
      templet.list.forEach(item => {
        if (item.type === 'grid') {
          // 当前是栅格布局，并将每个column放入填充对象
          item.columns.forEach(column => fullObject.push(column.list))
        }
      })
      // 如果没有栅格布局，则填充到父list中
      if (fullObject.length === 0) {
        fullObject = [jsonObject.list]
      }

    } else {
      console.warn('GenerateFormBaseCgform: 模板数据异常，已忽略……')
    }
  }

  /* -- 生成主表 --  */

  let mainField = onlineFields[0]
  // 当前已填充的下标
  let fullIndex = 0
  mainField.forEach(item => {
    if (item.isShowForm === 1) {
      let component = packageAuto(item)
      if (!!component) {
        // 这里由于存的是内存地址，所以直接 push 就能改变 jsonObject
        fullObject[fullIndex].push(component)
        if (++fullIndex >= fullObject.length) {
          fullIndex = 0
        }
      }
    }
  })

  /* -- 生成附表 -- */

  //jsonObject
  if (onlineForms.length > 1) {
    for (let i = 1; i < onlineForms.length; i++) {
      let subForm = onlineForms[i]
      let subField = onlineFields[i]

      if (subForm) {
        let subTableAfter = packageSubTable(subForm.tableTxt, subForm.tableName)
        let nextIndex = 0
        subField.forEach(item => {
          let { dbFieldName, isShowForm } = item
          if (isShowForm === 1 && !isIgnoreField(dbFieldName)) {
            let list = subTableAfter.columns[nextIndex].list
            let component = packageAuto(item, true)
            component['isSubItem'] = true
            list.push(component)
            if (++nextIndex >= subTableAfter.columns.length) {
              nextIndex = 0
            }
          }
        })
        jsonObject.list.push(subTableAfter)
      } else {
        console.warn('GenerateFormBaseCgform: 已忽略不存在的子表: ', subForm, '; ', subField)
      }
    }
  }

  return jsonObject
}

/** 判断当前字段是否是被忽略的字段 */
export function isIgnoreField(fieldName) {
  for (let ignore of IGNORES) {
    if (fieldName.toLowerCase() === ignore.toLowerCase()) {
      return true
    }
  }
  return false
}

/** 自动判断生成的表单类型 */
function packageAuto(onlineField, subTable = false) {
  let { dbFieldName, fieldShowType } = onlineField

  // 判断字段是否被忽略
  if (isIgnoreField(dbFieldName)) {
    return null
  }

  // cgform 字段与 desform 字段一一对应
  let desformType = ''
  for (let field of  FIELD_TYPES) {
    if (field.cgform === fieldShowType && field.desform) {
      desformType = field.desform
      break
    }
  }

  // 判断是否是子表，并且判断类型是否支持
  if (subTable && !subTableCheckType(desformType)) {
    return packageInput(onlineField)
  }

  // 根据不同的字段封装不同的组件
  if (desformType === 'date') {
    return packageDate(onlineField)
  } else if (desformType === 'datetime') {
    return packageDateTime(onlineField)
  } else if (desformType === 'textarea') {
    return packageTextarea(onlineField)
  } else if (desformType === 'select') {
    return packageSelect(onlineField)
  } else if (desformType === 'select-user') {
    return packageSelectUser(onlineField)
  } else if (desformType === 'select-depart') {
    return packageSelectDepart(onlineField)
  } else if (desformType === 'table-dict') {
    return packageTableDict(onlineField)
  } else if (desformType === 'table-dict_select') {
    return packageTableDictSelect(onlineField)
  } else if (desformType === 'imgupload') {
    return packagePicture(onlineField)
  } else if (desformType === 'file-upload') {
    return packageFileUpload(onlineField)
  } else if (desformType === 'editor') {
    return packageEditor(onlineField)
  } else if (desformType === 'radio') {
    return packageRadio(onlineField)
  } else if (desformType === 'checkbox') {
    return packageCheckbox(onlineField)
  } else {
    return packageInput(onlineField)
  }

}

/** 获取组件的基础参数 */
function getBaseComponent(onlineField, params) {
  let {
    dbFieldName: model,
    dbFieldTxt: name,
    dbDefaultVal: defaultValue,
    dbIsNull: required
  } = onlineField
  required = (required === 0)
  let key = model + '_' + Math.ceil(Math.random() * 99999)
  return [
    {
      'type': params.type, 'name': name,
      'className': params.className, 'icon': params.icon,
      'options': {
        'defaultValue': defaultValue, 'required': required,
      },
      'key': key, 'model': model,
      'rules': [
        {'required': required, 'message': `${name}必须填写`}
      ]
    },
    {key, model, name, defaultValue, required}
  ]
}

/** 封装 input 组件 */
function packageInput(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'input',
    className: 'form-input',
    icon: 'icon-input',
    hideTitle: false,
  })

  Object.assign(base.options, {
    width: '100%',
    dataType: null,
    pattern: '',
    placeholder: '请输入' + params.name
  })
  // base.rules.push({type: 'string', message: params.name + '格式不正确'})

  return base
}

/** 封装 textarea 组件 */
function packageTextarea(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'textarea',
    className: 'form-textarea',
    icon: 'icon-textarea',
    hideTitle: false,
  })

  Object.assign(base.options, {
    width: '100%', disabled: false, pattern: '', readonly: false,
    placeholder: '请输入' + params.name,
  })

  return base
}

/** 封装 date 组件 */
function packageDate(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'date',
    className: 'form-date',
    icon: 'icon-date',
    hideTitle: false,
  })

  Object.assign(base.options, {
    type: 'date', timestamp: false, width: '', clearable: true,
    defaultValueType: 1, readonly: false, disabled: false, editable: true,
    startPlaceholder: '', endPlaceholder: '', format: 'yyyy-MM-dd',
    placeholder: '请选择' + params.name,
  })

  return base
}

/** 封装 datetime 组件 */
function packageDateTime(onlineField) {
  let date = packageDate(onlineField)
  date.options.type = 'datetime'
  date.options.format = 'yyyy-MM-dd HH:mm:ss'
  return date
}

/** 封装 用户 组件 */
function packageSelectUser(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'select-user',
    className: 'form-select-user',
    icon: 'icon-user-circle',
    hideTitle: false,
  })

  Object.assign(base.options, {
    keyMaps: [], width: '100%', disabled: false,
    placeholder: '请选择' + params.name,
  })

  return base
}

/** 封装 部门 组件 */
function packageSelectDepart(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'select-depart',
    className: 'form-select-depart',
    icon: 'icon-depart',
    hideTitle: false,
  })

  Object.assign(base.options, {
    keyMaps: [], width: '100%', disabled: false,
    placeholder: '请选择' + params.name,
  })

  return base
}

/** 封装 表字典 下拉样式 组件 */
function packageTableDictSelect(onlineField) {
  let comp = packageTableDict(onlineField)
  comp.options.style = 'select'
  return comp
}

/** 封装 表字典 组件 */
function packageTableDict(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'table-dict',
    className: 'form-dict',
    icon: 'icon-dict',
    hideTitle: false,
  })

  Object.assign(base.options, {
    // -
    width: '100%', showIcon: true, iconName: 'icon-popup',
    disabled: false, style: 'popup',
    // -
    dictTable: onlineField['dictTable'],
    dictCode: onlineField['dictField'],
    dictText: onlineField['dictText'],
    placeholder: '请选择' + params.name,
  })

  return base
}

/** 封装 图片上传 组件 */
function packagePicture(onlineField) {
  let [base] = getBaseComponent(onlineField, {
    type: 'imgupload',
    className: 'form-tupian',
    icon: 'icon-tupian',
    hideTitle: false,
  })

  Object.assign(base.options, {
    // -
    width: '', tokenFunc: 'funcGetToken',
    size: {width: 100, height: 100}, token: '',
    domain: 'http://img.h5huodong.com',
    disabled: false, length: 9, multiple: true, defaultValue: [],
    // -
  })

  return base
}

/** 封装 文件上传 组件 */
function packageFileUpload(onlineField) {
  let [base] = getBaseComponent(onlineField, {
    type: 'file-upload',
    className: 'form-file-upload',
    icon: 'icon-shangchuan',
    hideTitle: false,
  })

  Object.assign(base.options, {
    // -
    drag: false, buttonText: '点击上传文件', tokenFunc: 'funcGetToken',
    disabled: false, length: 1, multiple: false, defaultValue: [], token: '',
    // -
  })

  return base
}

/** 封装 编辑器 组件 */
function packageEditor(onlineField) {
  let [base] = getBaseComponent(onlineField, {
    type: 'editor',
    className: 'form-editor',
    icon: 'icon-fuwenbenkuang',
    hideTitle: false,
  })

  Object.assign(base.options, {
    // -
    defaultValue: '', width: '', disabled: false,
    // -
  })

  return base
}

/** 封装 下拉选择 组件 */
function packageSelect(onlineField) {
  let {dictField} = onlineField
  // 只生成数据字典的配置，非数据字典的配置生成 input
  if (dictField) {
    let [base, params] = getBaseComponent(onlineField, {
      type: 'select',
      className: 'form-select',
      icon: 'icon-select',
      hideTitle: false,
    })

    Object.assign(base.options, {
      // -
      options: [{'value': '下拉框1'}, {'value': '下拉框2'}, {'value': '下拉框3'}],
      filterable: false, width: '', clearable: false,
      remoteOptions: [], showLabel: true, disabled: false, multiple: false,
      props: {'value': 'value', 'label': 'label'}, remote: 'dict',
      // -
      placeholder: '请选择' + params.name,
      dictCode: dictField,
    })

    return base
  } else {
    return packageInput(onlineField)
  }
}

/** 封装 单选 组件 */
function packageRadio(onlineField) {
  let {dictField} = onlineField
  // 只生成数据字典的配置，非数据字典的配置生成 input
  if (dictField) {
    let [base, params] = getBaseComponent(onlineField, {
      type: 'radio',
      className: 'form-radio',
      icon: 'icon-radio-active',
      hideTitle: false,
    })

    Object.assign(base.options, {
      // -
      props: {'value': 'value', 'label': 'label'}, remote: 'dict',
      options: [{'value': '下拉框1'}, {'value': '下拉框2'}, {'value': '下拉框3'}],
      inline: true, showLabel: true, disabled: false, width: '', remoteOptions: [],
      // -
      placeholder: '请选择' + params.name,
      dictCode: dictField,
    })

    return base
  } else {
    return packageInput(onlineField)
  }
}

/** 封装 多选 组件 */
function packageCheckbox(onlineField) {
  let {dictField} = onlineField
  // 只生成数据字典的配置，非数据字典的配置生成 input
  if (dictField) {
    let [base, params] = getBaseComponent(onlineField, {
      type: 'checkbox',
      className: 'form-checkbox',
      icon: 'icon-checkbox',
      hideTitle: false,
    })

    Object.assign(base.options, {
      // -
      props: {'value': 'value', 'label': 'label'}, remote: 'dict',
      options: [{'value': '下拉框1'}, {'value': '下拉框2'}, {'value': '下拉框3'}],
      inline: true, showLabel: true, disabled: false, width: '', remoteOptions: [],
      // -
      placeholder: '请选择' + params.name,
      dictCode: dictField,
    })

    return base
  } else {
    return packageInput(onlineField)
  }
}

/** 封装 子表 组件 */
function packageSubTable(name, subTableName) {
  return {
    type: 'sub-table-design',
    name: name,
    icon: 'icon-table',
    hideTitle: false,
    class: ['data-j-editable-design'],
    isContainer: true, // 容器组件
    className: 'form-sub-table',
    columns: [
      {span: 12, list: (() => [])()},
      {span: 12, list: (() => [])()}
    ],
    options: {
      gutter: 0, columnNumber: 2, justify: 'start',
      align: 'top', defaultValue: '[]', subTableName: subTableName,
      defaultRows: 0, showCheckbox: true, showNumber: true,
      showRowButton: false, allowAdd: true, autoHeight: true
    },
    key: subTableName + '_' + Math.ceil(Math.random() * 99999),
    model: `sub-table-design_${subTableName}`,
    rules: []
  }
}

export default {
  generateFormBaseCgform, isIgnoreField
}

/**
 * 递归调用处理所有的组件（包括栅格或其他容器组件内的组件）
 * 注：这是一个同步方法
 */
export function recursiveAllWidget(dataList, handler) {
  const recursive = (array, parent) => {
    for (let item of array) {
      // 判断是否是栅格或其他容器组件
      if (item.isContainer === true) {
        if (item.columns) {
          for (let column of item.columns) {
            recursive(column.list, item)
          }
        } else if (item.type === 'card') {// 卡片和tab需要特殊处理
          recursive(item.list, item)
        } else if (item.type === 'tabs') {
          for (let pane of item.panes) {
            recursive(pane.list, item)
          }
        }
      }

      // 执行处理回调
      if (typeof handler === 'function') handler(item, parent)
    }
  }
  recursive(dataList, null)
}

export const loadColumnsIgnores = ['button', 'buttons', 'grid', 'card', 'tabs', 'text', 'sub-table-design', 'divider']

export function generateColumns({ dataList, generateSubTable = false, handler }) {
  let columns = []
  recursiveAllWidget(dataList, (item, parent) => {
    if (loadColumnsIgnores.includes(item.type.toLowerCase())) {
      return
    }
    if (parent && parent.type === 'sub-table-design' && !generateSubTable) {
      return
    }
    // 生成 name，如果没有name就使用model
    let name = (item.name.trim()) || item.model
    let column = {
      title: name,
      align: 'center',
      dataIndex: item.model
    }
    // 判断是否为 select 就自定义输出内容（可输出字典
    if (item.type === 'select' && item.options.showLabel) {
      column.customRender = (text, record, index) => {
        for (let option of item.options.options) {
          if ((option.value || '').toString() === (text || '').toString()) {
            return option.label
          }
        }
        return text
      }
    }

    columns.push(column)

    if (typeof handler === 'function') {
      handler(item, parent, dataList)
    }

  })
  return columns
}