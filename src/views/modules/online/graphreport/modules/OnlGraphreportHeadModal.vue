<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    style="top:30px"
    fullscreen switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <!-- 第一行 -->
        <a-row :gutter="8">
          <a-col :span="layout.three.span">
            <a-form-item
              :labelCol="layout.three.label"
              :wrapperCol="layout.three.wrapper"
              label="图表名称">
              <a-input placeholder="请输入图表名称" v-decorator="['name', validatorRules.name ]"/>
            </a-form-item>
          </a-col>
          <a-col :span="layout.three.span">
            <a-form-item
              :labelCol="layout.three.label"
              :wrapperCol="layout.three.wrapper"
              label="编码">
              <a-input placeholder="请输入编码" v-decorator="['code', validatorRules.code ]"/>
            </a-form-item>
          </a-col>
          <a-col :span="layout.three.span">
            <a-form-item
              :labelCol="layout.three.label"
              :wrapperCol="layout.three.wrapper"
              label="展示模板">

              <a-select
                placeholder="请选择展示模板"
                :options="dicts.displayTemplate"
                :getPopupContainer="node => node.parentNode"
                v-decorator="[ 'displayTemplate',{initialValue:'tab'}]"/>
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 第二行 -->
        <a-row :gutter="8">
          <a-col :span="layout.three.span">
            <a-form-item
              :labelCol="layout.three.label"
              :wrapperCol="layout.three.wrapper"
              label="X轴字段">
              <a-input placeholder="请输入X轴字段" v-decorator="['xaxisField', validatorRules.xaxisField ]"/>
            </a-form-item>
          </a-col>
          <!--<a-col :span="layout.three.span">-->
          <!--<a-form-item-->
          <!--:labelCol="layout.three.label"-->
          <!--:wrapperCol="layout.three.wrapper"-->
          <!--label="Y轴字段">-->
          <!--<a-input placeholder="请输入Y轴字段" v-decorator="['yaxisField', validatorRules.yaxisField ]"/>-->
          <!--</a-form-item>-->
          <!--</a-col>   -->
          <a-col :span="24-24/3">
            <a-form-item
              :labelCol="{xs: { span: 24 },sm: { span: 3 }}"
              :wrapperCol="{xs: { span: 24 },sm: { span: 24-3 }}"
              label="Y轴字段">
              <!--<a-input placeholder="请输入Y轴字段" />-->

              <a-select
                ref="selectYaxisField"
                mode="tags"
                :open="false"
                style="width: 100%"
                placeholder="请输入Y轴字段"
                v-decorator="['yaxisField', validatorRules.yaxisField ]"
                @inputKeydown="handleKeydownYaxisField"
              />

            </a-form-item>
          </a-col>
          <a-col :span="layout.three.span" v-if="false">
            <a-form-item
              :labelCol="layout.three.label"
              :wrapperCol="layout.three.wrapper"
              label="Y轴文字">
              <a-input placeholder="请输入Y轴文字" v-decorator="['yaxisText', validatorRules.yaxisText ]"/>
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 第三行 -->
        <a-row :gutter="8">
          <a-col :span="layout.three.span">
            <a-form-item
              :labelCol="layout.three.label"
              :wrapperCol="layout.three.wrapper"
              label="数据类型">

              <a-select
                :options="dicts.dataType"
                placeholder="请选择数据类型"
                :getPopupContainer="node => node.parentNode"
                v-decorator="[ 'dataType',{initialValue:'sql'}]"
                @change="handleChangeDataType"/>
            </a-form-item>
          </a-col>
          <a-col :span="layout.three.span" v-if="false">
            <a-form-item
              :labelCol="layout.three.label"
              :wrapperCol="layout.three.wrapper"
              label="是否组合">

              <a-select
                placeholder="请选择是否组合"
                :getPopupContainer="node => node.parentNode"
                v-decorator="[ 'isCombination', {initialValue:'combination'}]"
                @change="handleChangeIsCombination">
                <a-select-option value="combination">组合</a-select-option>
                <a-select-option value="single">单图表</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24-24/3">
            <a-form-item
              :labelCol="{xs: { span: 24 },sm: { span: 3 }}"
              :wrapperCol="{xs: { span: 24 },sm: { span: 24-3 }}"
              label="图表类型">

              <a-select
                :options="dicts.graphType"
                placeholder="请选择图表类型"
                :mode="isCombination==='single'?'default':'multiple'"
                :getPopupContainer="node => node.parentNode"
                v-decorator="[ 'graphType', {initialValue:['bar']}]"/>
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 第四行 -->
        <a-row :gutter="8">
          <a-col :span="layout.one.span">
            <a-form-item
              :labelCol="layout.one.label"
              :wrapperCol="layout.one.wrapper"
              label="描述">

              <a-input placeholder="请输入描述" v-decorator="['content', {}]"/>
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 第五行 -->
        <a-row :gutter="8">
          <a-col :span="layout.one.span">
            <a-form-item
              :labelCol="layout.one.label"
              :wrapperCol="layout.one.wrapper"
              :label="(formInfo.cgrSql[dataType]||{}).label"
              style="margin-bottom: 4px">

              <!-- 代码编辑器 -->
              <j-code-editor
                ref="cgrSql"
                :lineNumbers="false"
                :placeholder="(formInfo.cgrSql[dataType]||{}).placeholder"
                :language="(formInfo.cgrSql[dataType]||{}).language"
                :fullScreen="true"
                style=""
                @input="handleInputCgrSql"/>
              <!-- 只是为了校验表单（代码编辑器） -->
              <a-textarea :hidden="true" v-decorator="['cgrSql', cgrSqlValidateRules]"/>

            </a-form-item>

          </a-col>
          <a-col :span="layout.one.span" style="padding-left: 12px;text-align: right;margin-bottom: 24px">
            <a-button v-if="dataType==='sql'" type="primary" @click="handleSQLAnalyze">SQL解析</a-button>
          </a-col>
        </a-row>
        <!-- 第五行 -->
        <a-row :gutter="8">
          <a-col :span="layout.one.span">
            <a-form-item
              :labelCol="layout.one.label"
              :wrapperCol="layout.one.wrapper"
              label="JS增强"
              style="margin-bottom: 4px">

              <!-- 代码编辑器 -->
              <j-code-editor
                ref="extendJs"
                :lineNumbers="false"
                placeholder="JS增强"
                language="javascript"
                :fullScreen="true"
                @input="handleInputExtendJs"/>
              <!-- 只是为了校验表单（代码编辑器） -->
              <a-textarea :hidden="true" v-decorator="['extendJs', {}]"/>

            </a-form-item>

          </a-col>
        </a-row>
      </a-form>

      <!-- 子表单区域 -->
      <a-tabs v-model="activeKey" @change="handleChangeTabs">
        <a-tab-pane tab="列表字段" :key="refKeys[0]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[0]"
            :loading="onlGraphreportItemTable.loading"
            :columns="onlGraphreportItemTable.columns"
            :dataSource="onlGraphreportItemTable.dataSource"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true">

            <template #buttonAfter="props">
              <a-dropdown>
                <a-menu slot="overlay">
                  <a-menu-item key="1" @click="fieldNameConvertCase('Upper','大写',props)">
                    <a-icon type="sort-descending"/>
                    <span>转换为大写</span>
                  </a-menu-item>
                  <a-menu-item key="2" @click="fieldNameConvertCase('Lower','小写',props)">
                    <a-icon type="sort-ascending"/>
                    <span>转换为小写</span>
                  </a-menu-item>
                </a-menu>
                <a-button icon="down">转换字段名</a-button>
              </a-dropdown>
            </template>

          </j-editable-table>
        </a-tab-pane>
      </a-tabs>

    </a-spin>
  </j-modal>
</template>

<script>

  import pick from 'lodash.pick'
  import { FormTypes } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { initDictOptions } from '@/components/dict/JDictSelectUtil'
  import { duplicateCheck } from '@/api/api'
  import JCodeEditor from '@/components/jeecg/JCodeEditor.vue'
  import { getAction } from '@/api/manage'


  export default {
    name: 'OnlGraphreportHeadModal',
    mixins: [JEditableTableMixin],
    components: { JCodeEditor },
    data() {
      return {
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
          name: { rules: [{ required: true, message: '请输入图表名称!' }] },
          code: { rules: [{ required: true, message: '请输入编码!' }, { validator: this.validateCode }] },
          xaxisField: { rules: [{ required: true, message: '请输入X轴字段!' }] },
          yaxisField: { rules: [{ required: true, message: '请输入Y轴字段!' }] },
          yaxisText: { rules: [{ required: true, message: '请输入Y轴文字!' }] },
          cgrSql: { rules: [{ required: true, message: '请输入查询SQL!' }] }
        },
        // 根据不同的值展示不同的form
        formInfo: {
          cgrSql: {
            sql: { label: '查询SQL', placeholder: '请输入查询SQL', language: 'sql' },
            json: { label: '数据JSON', placeholder: '请输入数据JSON', language: 'javascript' }
          }
        },
        dataType: 'sql',
        isCombination: 'combination',
        // 表单布局
        layout: {
          // 一列布局
          one: {
            span: 24,
            label: {
              xs: { span: 24 },
              sm: { span: 2 }
            },
            wrapper: {
              xs: { span: 24 },
              sm: { span: 24 - 2 }
            }
          },
          // 三列布局
          three: {
            span: 24 / 3,
            label: {
              xs: { span: 24 },
              sm: { span: 6 }
            },
            wrapper: {
              xs: { span: 24 },
              sm: { span: 24 - 6 }
            }
          }
        },
        // 字典
        dicts: {},
        refKeys: ['onlGraphreportItem'],
        activeKey: 'onlGraphreportItem',
        // 图表报告项
        onlGraphreportItemTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '字段名',
              key: 'fieldName',
              width: '14%',
              type: FormTypes.input,
              defaultValue: '',
              placeholder: '${title}',
              validateRules: [{ required: true, message: '${title}不能为空' }]
            },
            {
              title: '字段文本',
              key: 'fieldTxt',
              width: '13%',
              type: FormTypes.input,
              defaultValue: '',
              placeholder: '${title}'
            },
            {
              title: '排序',
              key: 'orderNum',
              width: '6%',
              isOrder: true,
              type: FormTypes.inputNumber,
              defaultValue: 0,
              placeholder: '${title}'
            },
            {
              title: '字段类型',
              key: 'fieldType',
              width: '13%',
              type: FormTypes.select,
              options: [
                { title: '数值类型', value: 'Integer' },
                { title: '日期类型', value: 'Date' },
                { title: '字符类型', value: 'String' },
                { title: '长整型', value: 'Long' }
              ],
              defaultValue: '',
              placeholder: '请选择'
            },
            {
              title: '是否显示',
              key: 'isShow',
              width: '7%',
              type: FormTypes.checkbox,
              defaultChecked: true,
              customValue: ['Y', 'N']
            },
            {
              title: '计算总计',
              key: 'isTotal',
              width: '7%',
              type: FormTypes.checkbox,
              defaultChecked: false,
              customValue: ['Y', 'N']
            },
            {
              title: '是否查询',
              key: 'searchFlag',
              width: '7%',
              type: FormTypes.checkbox,
              defaultChecked: false,
              customValue: ['Y', 'N']
            },
            {
              title: '查询模式',
              key: 'searchMode',
              width: '13%',
              type: FormTypes.select,
              options: [
                { title: '单条件查询', value: 'single' },
                { title: '范围查询', value: 'group' }
              ],
              defaultValue: '',
              placeholder: '请选择'
            },
            {
              title: '字典Code',
              key: 'dictCode',
              width: '12%',
              type: FormTypes.input,
              defaultValue: '',
              placeholder: '${title}'
            }
          ]
        },
        url: {
          add: '/online/graphreport/head/add',
          edit: '/online/graphreport/head/edit',
          sql: '/online/cgreport/head/parseSql',
          onlGraphreportItem: {
            list: '/online/graphreport/head/queryOnlGraphreportItemByMainId'
          }
        }
      }
    },
    computed: {
      // cgrSql 的验证规则
      cgrSqlValidateRules() {
        return {
          rules: [{
            required: true,
            // 根据数据类型的不同显示不同的错误信息
            message: (this.formInfo.cgrSql[this.dataType] || {}).placeholder
          }, {
            // 自定义校验：校验JSON字符串格式是否正确
            validator: this.validatorJSON,
            message: 'JSON格式不正确！'
          }]
        }
      }
    },
    created() {
      this.initDictConfig()
    },
    methods: {

      // 验证编码
      validateCode(rule, value, callback) {
        if (/[\u4E00-\u9FA5]/g.test(value)) {
          callback('编码不能为汉字')
        } else {
          var params = {
            tableName: 'onl_graphreport_head',
            fieldName: 'code',
            fieldVal: value,
            dataId: this.model.id
          }
          duplicateCheck(params).then((res) => {
            if (res.success) {
              callback()
            } else {
              callback(res.message)
            }
          })
        }
      },
      // 初始化字典
      initDictConfig() {
        let initDicts = (name, key, callback) => {
          initDictOptions(name).then((res) => {
            if (res.success) {
              // 给 a-select 需要 label 字段赋值
              this.dicts[key] = res.result.map(item => Object.assign({ label: item.text }, item))
              if (typeof callback === 'function') callback(this.dicts[key])
            } else {
              this.dicts[key] = []
              console.error(`字典“${name}”初始化失败：`, res.message)
            }
          })
        }
        // 图表类型
        initDicts('online_graph_type', 'graphType')
        // 数据类型
        initDicts('online_graph_data_type', 'dataType')
        // 展示模板
        initDicts('online_graph_display_template', 'displayTemplate', (dict) => {
          // 单个数据源只展示前三种布局
          this.dicts.displayTemplate = dict.splice(0, 3)
        })
      },

      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {

        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,
            'name',
            'code',
            'cgrSql',
            'xaxisField',
            'yaxisField',
            // 'yaxisText',
            'content',
            'extendJs',
            'graphType',
            // 'isCombination',
            'displayTemplate',
            'dataType'
          ))

          this.dataType = this.model.dataType || 'sql'
          // this.isCombination = this.model.isCombination || 'combination'
          // 如果是组合模式，那么就分割字符串成数组
          if (this.isCombination === 'combination' && typeof this.model.graphType === 'string') {
            this.form.setFieldsValue({ graphType: this.model.graphType.split(',') })
          }
          if (typeof this.model.yaxisField === 'string') {
            this.form.setFieldsValue({ yaxisField: this.model.yaxisField.split(',') })
          }
          this.$refs.cgrSql.setCodeContent(this.model.cgrSql || '')
          this.$refs.extendJs.setCodeContent(this.model.extendJs || '')
        })

        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.onlGraphreportItem.list, params, this.onlGraphreportItemTable)
        }
      },

      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        if (main.graphType instanceof Array) {
          main.graphType = main.graphType.join(',')
        }
        if (main.yaxisField instanceof Array) {
          main.yaxisField = main.yaxisField.join(',')
        }
        //时间格式化
        return {
          ...main, // 展开
          onlGraphreportItemList: allValues.tablesValue[0].values
        }
      },

      /** SQL 解析 */
      handleSQLAnalyze() {
        // this.$message.warn('暂未开放')
        this.confirmLoading = true

        let reportSql = this.form.getFieldValue('cgrSql') || ''
        let param = { 'sql': reportSql }
        getAction(this.url.sql, param).then(res => {
          console.log(res)
          if (res.success) {
            this.$message.success('解析成功')
            let dataSource = (res.result.fields || [])
            this.onlGraphreportItemTable.dataSource = dataSource.map(item => {
              item.isShow = item.isShow === 1 ? 'Y' : 'N'
              return item
            })
          }else{
            this.$message.error(res.message)
          }
        }).finally(() => {
          this.confirmLoading = false
        })

      },

      /** 校验JSON */
      validatorJSON(rule, value, callback) {
        if (value && this.dataType === 'json') {
          try {
            JSON.parse(value)
            callback()
          } catch {
            callback(false)
          }
        } else {
          callback()
        }
      },

      /** 数据类型变化 */
      handleChangeDataType(value) {
        this.dataType = value
        let cgrValue = this.form.getFieldValue('cgrSql')
        this.form.setFields({ cgrSql: { value: cgrValue, errors: null } })
      },

      /** 是否组合变化 */
      handleChangeIsCombination(value) {
        this.isCombination = value

        this.$nextTick(() => {
          let val = this.form.getFieldValue('graphType')
          // 选择器 多选和单选 所需的数据类型不一致，需要转换一下
          if (value === 'single') {
            this.form.setFields({ graphType: { value: (val || [])[0] } })
          } else {
            this.form.setFields({ graphType: { value: val ? [val] : [] } })
          }

        })

      },

      handleKeydownYaxisField(event) {
        let { key } = event
        if (key === 'Enter') {
          let { $data } = this.$refs.selectYaxisField.$refs.vcSelect
          let { _value, _inputValue } = $data
          _value = (_value || [])
          _inputValue = (_inputValue || '')

          if (_inputValue.length > 0) {
            let idx = _value.indexOf(_inputValue)
            if (idx !== -1) {
              _value.splice(idx, 1)
            }
            let values = _value.concat(_inputValue.split(','))
            this.form.setFieldsValue({ yaxisField: values })
            $data._inputValue = ''
          }
        }
      },
      handleInputCgrSql(value) {
        this.form.setFieldsValue({ cgrSql: value })
      },
      handleInputExtendJs(value) {
        this.form.setFieldsValue({ extendJs: value })
      },

      /** 字段名转换大小写 */
      fieldNameConvertCase(convertCase, name, props) {
        let { target } = props
        let fn = `to${convertCase}Case`

        this.$confirm({
          title: '转换字段名',
          content: `确定要将所有的字段名都转换为${name}吗？`,
          onOk() {
            // console.log('fieldNameConvertCase: ', 'aBcD'[fn]())
            let { values } = target.getValuesSync({ validate: false })
            let newValues = values.map(item => {
              return {
                rowKey: item.id,
                values: {
                  'fieldName': item['fieldName'][fn]()
                }
              }
            })
            target.setValues(newValues)
          },
        })
      }

    }
  }
</script>

<style lang="less" scoped></style>