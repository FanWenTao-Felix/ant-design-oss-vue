<template>

  <j-editable-table
    ref="editableTable"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :rowNumber="true"
    :rowSelection="true"
    :actionButton="actionButton"
    :maxHeight="300"/>

</template>

<script>


  import JEditableTable from '@/components/jeecg/JEditableTable'
  import { FormTypes } from '@/utils/JEditableTableUtil'


  export default {
    name: 'IndexTable',
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
            title: '索引名称', // 必填
            key: 'indexName',
            // width: '30%',
            width: '330px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '索引栏位', // 必填
            key: 'indexField',
            // width: '30%',
            width: '330px',
            type: FormTypes.list_multi,
            options: [],
            defaultValue: '',
            placeholder: '请选择${title}',
            validateRules: [{ required: true, message: '请选择${title}' }],
            props: {
              'notFoundContent': '没有什么好选择的'
              // 'mode': 'multiple'
            }
          },
          {
            title: '索引类型', // 必填
            key: 'indexType',
            // width: '30%',
            width: '330px',
            type: FormTypes.select,
            options: [
              { title: 'normal', value: 'normal' },
              { title: 'unique', value: 'unique' }
            ],
            defaultValue: 'normal',
            placeholder: '请选择${title}',
            validateRules: [{ required: true, message: '请选择${title}' }]
          }
        ]
      }
    },
    methods: {

      /** 同步列表 */
      async syncTable(table1) {
        await table1.$refs.editableTable.getValuesPromise(false).then((values) => {
          let options = []
          values.forEach(value => {
            if (value.dbFieldName) {
              options.push({
                title: value.dbFieldName,
                value: value.dbFieldName
              })
            }
          })
          this.columns[1].options = options
        })
      }

    }
  }
</script>

<style scoped>

</style>