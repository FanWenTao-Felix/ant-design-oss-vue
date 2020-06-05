<template>
  <j-modal
    :title="title"
    :width="1100"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    fullscreen switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <a-row>
          <a-col :span="24/3" :gutter="8">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="组合报表名">
              <a-input placeholder="请输入组合报表名" v-decorator="['templetName', validatorRules.templetName]"/>
            </a-form-item>
          </a-col>
          <a-col :span="24/3" :gutter="8">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="报表编码">
              <a-input placeholder="请输入组合报表编码" v-decorator="['templetCode', validatorRules.templetCode]"/>
            </a-form-item>
          </a-col>
          <a-col :span="24/3" :gutter="8">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="组合风格">
              <a-select
                placeholder="请输入报表风格"
                :options="dicts.displayTemplate"
                v-decorator="[ 'templetStyle',{initialValue:'tab'}]"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <!-- 子表单区域 -->
      <a-tabs v-model="activeKey" @change="handleChangeTabs">
        <a-tab-pane tab="图表配置" :key="refKeys[0]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[0]"
            :loading="templetItemTable.loading"
            :columns="templetItemTable.columns"
            :dataSource="templetItemTable.dataSource"
            :maxHeight="380"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true"
            @added="handleAdded"
            @valueChange="handleValueChange"/>
        </a-tab-pane>
      </a-tabs>

    </a-spin>
  </j-modal>
</template>

<script>

  import pick from 'lodash.pick'
  import { FormTypes } from '@/utils/JEditableTableUtil'
  import { initDictOptions } from '@/components/dict/JDictSelectUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { getAction } from '@/api/manage'

  export default {
    name: 'OnlGraphreportTempletModal',
    mixins: [JEditableTableMixin],
    data() {
      return {
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
          templetName: { rules: [{ required: true, message: '请输入报表名称!' }] },
          templetCode: { rules: [{ required: true, message: '请输入报表编码!' }] }
        },
        // 字典
        dicts: {},
        refKeys: ['templetItem'],
        activeKey: 'templetItem',
        // Online报表多数据源次表
        templetItemTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '图表',
              key: 'graphreportCode',
              width: '22%',
              type: FormTypes.select,
              options: [],
              defaultValue: '',
              placeholder: '请选择${title}',
              validateRules: [{ required: true, message: '请选择${title}！' }]
            },
            {
              // 默认为空；渲染的时候如果为空则继承源配置，如果有值则显示只显示一个配置的图表，并可以单击“查看详情”，跳转到详情页面
              title: '图表类型',
              key: 'graphreportType',
              width: '15%',
              type: FormTypes.select,
              // 饼状图、曲线图、柱状图、数据列表等
              options: [{ title: '不配置', value: 'normal' }],
              defaultValue: 'normal',
              placeholder: '请选择${title}'
            },
            {
              // ，默认值0 非必填
              title: '组合编号',
              key: 'groupNum',
              width: '8%',
              type: FormTypes.inputNumber,
              defaultValue: 0,
              placeholder: '请输入${title}',
              validateRules: [{ required: true, message: '${title}不能为空' }]
            },
            {
              title: '组合描述',
              key: 'groupTxt',
              width: '20%',
              type: FormTypes.input,
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [{ required: false, message: '${title}不能为空' }]
            },
            {
              // （1 卡片，2 tab）非必填
              title: '组合展示风格',
              key: 'groupStyle',
              width: '15%',
              type: FormTypes.select,
              options: [
                { title: '卡片', value: 'card' },
                { title: '标签页', value: 'tabs' }
              ],
              defaultValue: 'card',
              placeholder: '请选择${title}'
            },
            {
              //  1显示 0不显示，默认1
              title: '是否显示',
              key: 'isShow',
              width: '8%',
              type: FormTypes.checkbox,
              customValue: ['1', '0'],
              defaultChecked: true
            },
            {
              title: '排序',
              key: 'orderNum',
              width: '8%',
              isOrder: true,
              type: FormTypes.inputNumber,
              defaultValue: '',
              placeholder: '请输入${title}'
            }
          ]
        },
        url: {
          add: '/online/graphreport/templet/add',
          edit: '/online/graphreport/templet/edit',
          head: {
            list: '/online/graphreport/head/list'
          },
          templetItem: {
            list: '/online/graphreport/templet/queryTempletItemByMainId'
          }
        }
      }
    },
    created() {
      this.initDictConfig()
    },
    methods: {

      // 初始化字典
      initDictConfig() {
        let initDicts = (name, key) => {
          return initDictOptions(name).then((res) => {
            if (res.success) {
              // 给 a-select 需要 label 字段赋值
              this.dicts[key] = res.result.map(item => Object.assign({ label: item.text, title: item.text }, item))
              return Promise.resolve(this.dicts[key])
            } else {
              this.dicts[key] = []
              let err = `字典“${name}”初始化失败`
              console.error(`${err}：`, res.message)
              return Promise.reject(err)
            }
          })
        }
        // 图表类型
        initDicts('online_graph_type', 'graphType').then(graphType => {
          let options = [{ title: '请选择', value: 'normal' }]
          this.templetItemTable.columns[1].options = options.concat(graphType)
        })
        // 数据类型
        initDicts('online_graph_data_type', 'dataType')
        // 展示模板
        initDicts('online_graph_display_template', 'displayTemplate')


      },

      /** 调用 edit() 方法之前会自动调用此方法 */
      editBefore() {
        this.queryCode()
      },

      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'templetCode', 'templetName', 'templetStyle'))
          // 时间格式化
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.templetItem.list, params, this.templetItemTable)
        }
      },

      /** 查询Code */
      queryCode() {
        getAction(this.url.head.list).then((res) => {
          let { success, message, result: { records } } = res
          if (success) {
            // 赋值给columns
            this.templetItemTable.columns[0].options = records.map(item => {
              return {
                title: item.name,
                value: item.code
              }
            })
          } else {
            this.$message.warn('code查询失败：' + message)
          }
        })
      },

      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        //时间格式化
        return {
          ...main, // 展开
          onlGraphreportTempletItemList: allValues.tablesValue[0].values
        }
      },

      /** 触发 valueChange 事件，联动 groupNum */
      handleValueChange(event) {
        let { row, column, value, target } = event

        if (column.key === 'groupStyle') {
          let { values } = target.getValuesSync({ validate: false })
          let setValues = []
          values.forEach(val => {
            if (`${val.groupNum}` === `${row.groupNum}`) {
              setValues.push({ rowKey: val.id, values: { 'groupStyle': value } })
            }
          })
          target.setValues(setValues)

        } else if (column.key === 'groupNum') {
          let { values } = target.getValuesSync({ validate: false })
          this.syncValues(target, values, 'groupNum', value, row.id, (val) => {
            return {
              rowKey: row.id,
              values: {
                'groupStyle': val.groupStyle,
                'groupTxt': val.groupTxt
              }
            }
          })

        } else if (column.key === 'groupTxt') {
          let { values } = target.getValuesSync({ validate: false })
          this.syncValues(target, values, 'groupNum', row.groupNum, row.id, (val) => {
            return {
              rowKey: val.id,
              values: { 'groupTxt': value }
            }
          })

        }
      },
      /** 同步输入表格中的内容 */
      syncValues(vm, values, a, b, rowId, sync) {
        let setValues = []
        for (let val of values) {

          if (`${val[a]}` === `${b}` && val.id !== rowId) {
            setValues.push(sync(val))
          }
        }
        vm.setValues(setValues)
      },

      handleAdded(event) {
        let { target, row } = event
        target.getValuesPromise(false).then(values => {
          // 找出最大的 groupNum
          let maxVal = values[0]
          let maxNum = Number.parseInt(maxVal.groupNum)
          for (let val of values) {
            let num = Number.parseInt(val.groupNum)
            if (num > maxNum) {
              maxNum = num
              maxVal = val
            }
          }
          if (maxVal.id !== row.id) {
            target.setValues([{
              rowKey: row.id,
              values: {
                'groupNum': maxVal.groupNum,
                'groupStyle': maxVal.groupStyle,
                'groupTxt': maxVal.groupTxt
              }
            }])
          }
        })
      }

    }
  }
</script>

<style scoped></style>