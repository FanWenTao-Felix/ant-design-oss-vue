<template>

  <j-editable-table
    ref="editableTable"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :rowNumber="true"
    :maxHeight="340"
    @valueChange="handleChange"
    :disabledRows="{ dbFieldName:'id'}"/>


</template>

<script>

  import JEditableTable from '@/components/jeecg/JEditableTable'
  import { FormTypes } from '@/utils/JEditableTableUtil'

  import { syncAllTable } from '../util/TableUtils'

  const pageQueryOptions = [
    { title: '文本框', value: 'text' },
    { title: '日期(yyyy-MM-dd)', value: 'date' },
    { title: '日期（yyyy-MM-dd HH:mm:ss）', value: 'datetime' },
    { title: '下拉框', value: 'list' },
    { title: '下拉多选框', value: 'list_multi' },
    { title: '下拉搜索框', value: 'sel_search' },
    { title: '分类字典树', value: 'cat_tree' },
    { title: 'Popup弹框', value: 'popup' },
    { title: '部门选择', value: 'sel_depart' },
    { title: '用户选择', value: 'sel_user' },
    { title: '省市区组件', value: 'pca' },
    { title: '自定义树控件', value: 'sel_tree' },

  ];


  export default {
    name: 'QueryTable',
    components: {
      JEditableTable
    },
    data() {
      return {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '字段名称', // 只读
            key: 'dbFieldName',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true }
          },
          {
            title: '字段备注', // 只读
            key: 'dbFieldTxt',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true }
          },
          {
            title: '控件类型',
            key: 'queryShowType',
            // width: '16%',
            width: '170px',
            type: FormTypes.select,
            options:pageQueryOptions,
            defaultValue: 'text',
            placeholder: '请选择${title}'
          },
          {
            title: '字典Table',
            key: 'queryDictTable',
            // width: '12%',
            width: '130px',
            type: FormTypes.input_pop,
            defaultValue: ''
          },
          {
            title: '字典Code',
            key: 'queryDictField',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '字典Text',
            key: 'queryDictText',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '默认值',
            key: 'queryDefVal',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '是否启用',
            key: 'queryConfigFlag',
            // width: '7%',
            width: '80px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false
          },
        ]

      }
    },
    methods: {

      /** 同步列表 */
      async syncTable(table1) {
        await syncAllTable(this, table1)
      },
      handleChange({row, column, value}){
        if(column.key === 'queryConfigFlag'){
          if(value===true){
            this.$emit('query',row.id)

          }
        }

      }

    }
  }
</script>

<style scoped>

</style>