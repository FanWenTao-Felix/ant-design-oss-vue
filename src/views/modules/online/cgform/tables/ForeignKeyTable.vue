<template>

  <j-editable-table
    ref="editableTable"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :rowNumber="true"
    :maxHeight="340"
    :disabled="!actionButton"
    :disabledRows="{ dbFieldName:'id'}"/>

</template>

<script>

  import JEditableTable from '@/components/jeecg/JEditableTable'
  import { FormTypes } from '@/utils/JEditableTableUtil'

  import { syncAllTable } from '../util/TableUtils'

  export default {
    name: 'ForeignKeyTable',
    components: {
      JEditableTable
    },
    props:{
      actionButton:{
        type:Boolean,
        default:true,
        required:false
      }
    },
    data() {
      return {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '字段名称',
            key: 'dbFieldName',
            // width: '15%',
            width: '160px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true } // 只读
          },
          {
            title: '字段备注',
            key: 'dbFieldTxt',
            // width: '15%',
            width: '160px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true } // 只读
          },
          {
            title: '主表名',
            key: 'mainTable',
            // width: '30%',
            width: '120px',
            type: FormTypes.input,
            defaultValue: ''
          },
          {
            title: '主表字段',
            key: 'mainField',
            // width: '30%',
            width: '120px',
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