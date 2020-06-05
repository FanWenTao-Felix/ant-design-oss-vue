<template>

  <j-editable-table
    ref="editableTable"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :rowNumber="true"
    :maxHeight="340"
    :disabledRows="{ dbFieldName:'id'}"/>


</template>

<script>

  import JEditableTable from '@/components/jeecg/JEditableTable'
  import { FormTypes } from '@/utils/JEditableTableUtil'

  import { syncAllTable } from '../util/TableUtils'

  export default {
    name: 'CheckDictTable',
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
            title: '字段Href',
            key: 'fieldHref',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '验证规则',
            key: 'fieldValidType',
            // width: '16%',
            width: '170px',
            type: FormTypes.select,
            allowInput: true,
            options: [
              { title: '空', value: '' },
              { title: '唯一校验', value: 'only' },
              { title: '6到16位数字', value: 'n6-16' },
              { title: '6到16位任意字符', value: '*6-16' },
              { title: '网址', value: 'url' },
              { title: '电子邮件', value: 'e' },
              { title: '手机号码', value: 'm' },
              { title: '邮政编码', value: 'p' },
              { title: '字母', value: 's' },
              { title: '数字', value: 'n' },
              { title: '整数', value: 'z' },
              { title: '非空', value: '*' },
              { title: '6到18位字符串', value: 's6-18' },
              { title: '金额', value: 'money' }

            ],
            defaultValue: ''
          },
          {
            title: '校验必填',
            key: 'fieldMustInput',
            // width: '7%',
            width: '80px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false
          },
          {
            title: '字典Table',
            key: 'dictTable',
            // width: '12%',
            width: '130px',
            type: FormTypes.input_pop,
            defaultValue: ''
          },
          {
            title: '字典Code',
            key: 'dictField',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '字典Text',
            key: 'dictText',
            // width: '12%',
            width: '130px',
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
      }

    }
  }
</script>

<style scoped>

</style>