<template>

  <j-editable-table
    ref="editableTable"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :rowNumber="true"
    :maxHeight="319"
    :disabledRows="{ dbFieldName:'id'}"/>

</template>

<script>

  import JEditableTable from '@/components/jeecg/JEditableTable'
  import { FormTypes } from '@/utils/JEditableTableUtil'
  import { syncAllTable } from '../util/TableUtils'

  const commonPageOptions = [
    { title: '文本框', value: 'text' },
    { title: '密码', value: 'password' },
    { title: '下拉框', value: 'list' },
    { title: '单选框', value: 'radio' },
    { title: '多选框', value: 'checkbox' },
    { title: '开关', value: 'switch' },
    { title: '日期(yyyy-MM-dd)', value: 'date' },
    { title: '日期（yyyy-MM-dd HH:mm:ss）', value: 'datetime' },
    { title: '文件', value: 'file' },
    { title: '图片', value: 'image' },
    { title: '多行文本', value: 'textarea' },
    { title: '下拉多选框', value: 'list_multi' },
    { title: '下拉搜索框', value: 'sel_search' },
    { title: 'Popup弹框', value: 'popup' },
    { title: '分类字典树', value: 'cat_tree' },
    { title: '部门选择', value: 'sel_depart' },
    { title: '用户选择', value: 'sel_user' },
    { title: '富文本', value: 'umeditor' },
    { title: 'MarkDown', value: 'markdown' },
    { title: '省市区组件', value: 'pca' },
    { title: '联动组件', value: 'link_down' },
    { title: '自定义树控件', value: 'sel_tree' },

  ];
  const subTablePageOptions = [
    { title: '文本框', value: 'text' },
    { title: '单选框', value: 'radio' },
    { title: '开关', value: 'switch' },
    { title: '日期(yyyy-MM-dd)', value: 'date' },
    { title: '日期（yyyy-MM-dd HH:mm:ss）', value: 'datetime' },
    { title: '文件', value: 'file' },
    { title: '图片', value: 'image' },
    { title: '下拉框', value: 'list' },
    { title: '下拉多选框', value: 'list_multi' },
    { title: '下拉搜索框', value: 'sel_search' },
    { title: 'popup弹出框', value: 'popup' }
  ];

  export default {
    name: 'PageAttributeTable',
    components: {
      JEditableTable
    },
    inject: ['getAllTable'],
    data() {
      return {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '字段名称', // 只读
            key: 'dbFieldName',
            // width: '9%',
            width: '100px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true }
          },
          {
            title: '字段备注', // 只读
            key: 'dbFieldTxt',
            // width: '9%',
            width: '100px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true }
          },
          {
            title: '表单显示',
            key: 'isShowForm',
            // width: '3%',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: true
          },
          {
            title: '列表显示', // 多选框、默认true
            key: 'isShowList',
            // width: '3%',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: true
          },
          {
            title: '是否排序',
            key: 'sortFlag',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false
          },
          {
            title: '是否只读',
            key: 'isReadOnly',
            // width: '3%',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false
          },
          {
            title: '控件类型',
            key: 'fieldShowType',
            // width: '16%',
            width: '170px',
            type: FormTypes.select,
            options:commonPageOptions,
            defaultValue: 'text',
            placeholder: '请选择${title}',
            validateRules: [
              { required: true, message: '请选择${title}' },
              {
                handler: (type, value, row, column, callback, target) => {
                  if (type !== 'blur') {
                    this.getAllTable().then(tables => {
                      let [table1] = tables
                      // 获取到 table1（数据库属性） 中的数据
                      let dbType = table1.$refs.editableTable.getValuesSync({
                        validate: false,
                        rowIds: [row.id]
                      }).values[0].dbType
                      // 当控件类型类型为日期时，数据库类型必须是Date类型
                      if ((value === 'date' || value === 'datetime') && dbType !== 'Date') {
                        callback(false, '当控件类型类型为日期时，数据库属性里的字段类型必须是Date！')
                      } else {
                        callback(true)
                      }
                    }).catch(error => {
                      console.error(error)
                      callback(false, '校验出错')
                    })
                  } else {
                    callback()
                  }
                },
                message: '${title}校验失败',
              },
            ]
          },
          {
            title: '控件长度', // 数值
            key: 'fieldLength',
            // width: '9%',
            width: '100px',
            type: FormTypes.inputNumber,
            defaultValue: '120',
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '是否查询',
            key: 'isQuery',
            // width: '5%',
            width: '60px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false
          },
          {
            title: '查询类型',
            key: 'queryMode',
            // width: '10%',
            width: '110px',
            type: FormTypes.select,
            options: [
              { title: '普通查询', value: 'single' },
              { title: '范围查询', value: 'group' }

            ],
            defaultValue: 'single',
            placeholder: '请选择${title}',
            validateRules: [{ required: true, message: '请选择${title}' }]
          },
          {
            title: '控件默认值',
            key: 'fieldDefaultValue',
            // width: '15%',
            width: '180px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '扩展参数',
            key: 'fieldExtendJson',
            // width: '15%',
            width: '160px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '自定义转换器',
            key: 'converter',
            // width: '15%',
            width: '160px',
            type: FormTypes.input,
            defaultValue: ''
          }
        ]
      }
    },
    methods: {

      /** 同步列表 */
      async syncTable(table1) {
        await syncAllTable(this, table1)
      },

      /** 同步控件类型 */
      syncFieldShowType(row) {
        let table = this.$refs.editableTable
        table.setValues([{
          rowKey: row.id,
          values: { 'fieldShowType': 'date' }
        }])
      },
      changePageType(flag){
        for(let col of this.columns){
          if(col.key == 'fieldShowType'){
            col.options = !flag?commonPageOptions:subTablePageOptions
            break;
          }
        }
       // !flag//正常
      },
      enableQuery(id){
        this.$refs.editableTable.setValues([{
          rowKey: id,
          values: { 'isQuery': true }
        }]);
      }

    }
  }
</script>

<style scoped>

</style>