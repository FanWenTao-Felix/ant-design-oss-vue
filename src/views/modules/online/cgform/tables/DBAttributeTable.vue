<template>

  <j-editable-table
    ref="editableTable"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :dragSort="true"
    dragSortKey="orderNum"
    :rowNumber="true"
    :rowSelection="true"
    :actionButton="actionButton"
    :maxHeight="300"
    :disabledRows="{ dbFieldName:'id'}"
    @added="handleAdded"
    @deleted="handleDeleted"
    @dragged="handleDragged"
    @inserted="handleInserted"
    @valueChange="handleValueChange"/>

</template>

<script>

  import JEditableTable from '@/components/jeecg/JEditableTable'
  import { FormTypes } from '@/utils/JEditableTableUtil'

  const MySQLKeywords = ['ADD', 'ALL', 'ALTER', 'ANALYZE', 'AND', 'AS', 'ASC', 'ASENSITIVE', 'BEFORE', 'BETWEEN', 'BIGINT', 'BINARY', 'BLOB', 'BOTH', 'BY', 'CALL', 'CASCADE', 'CASE', 'CHANGE', 'CHAR', 'CHARACTER', 'CHECK', 'COLLATE', 'COLUMN', 'CONDITION', 'CONNECTION', 'CONSTRAINT', 'CONTINUE', 'CONVERT', 'CREATE', 'CROSS', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'CURRENT_USER', 'CURSOR', 'DATABASE', 'DATABASES', 'DAY_HOUR', 'DAY_MICROSECOND', 'DAY_MINUTE', 'DAY_SECOND', 'DEC', 'DECIMAL', 'DECLARE', 'DEFAULT', 'DELAYED', 'DELETE', 'DESC', 'DESCRIBE', 'DETERMINISTIC', 'DISTINCT', 'DISTINCTROW', 'DIV', 'DOUBLE', 'DROP', 'DUAL', 'EACH', 'ELSE', 'ELSEIF', 'ENCLOSED', 'ESCAPED', 'EXISTS', 'EXIT', 'EXPLAIN', 'FALSE', 'FETCH', 'FLOAT', 'FLOAT4', 'FLOAT8', 'FOR', 'FORCE', 'FOREIGN', 'FROM', 'FULLTEXT', 'GOTO', 'GRANT', 'GROUP', 'HAVING', 'HIGH_PRIORITY', 'HOUR_MICROSECOND', 'HOUR_MINUTE', 'HOUR_SECOND', 'IF', 'IGNORE', 'IN', 'INDEX', 'INFILE', 'INNER', 'INOUT', 'INSENSITIVE', 'INSERT', 'INT', 'INT1', 'INT2', 'INT3', 'INT4', 'INT8', 'INTEGER', 'INTERVAL', 'INTO', 'IS', 'ITERATE', 'JOIN', 'KEY', 'KEYS', 'KILL', 'LABEL', 'LEADING', 'LEAVE', 'LEFT', 'LIKE', 'LIMIT', 'LINEAR', 'LINES', 'LOAD', 'LOCALTIME', 'LOCALTIMESTAMP', 'LOCK', 'LONG', 'LONGBLOB', 'LONGTEXT', 'LOOP', 'LOW_PRIORITY', 'MATCH', 'MEDIUMBLOB', 'MEDIUMINT', 'MEDIUMTEXT', 'MIDDLEINT', 'MINUTE_MICROSECOND', 'MINUTE_SECOND', 'MOD', 'MODIFIES', 'NATURAL', 'NOT', 'NO_WRITE_TO_BINLOG', 'NULL', 'NUMERIC', 'ON', 'OPTIMIZE', 'OPTION', 'OPTIONALLY', 'OR', 'ORDER', 'OUT', 'OUTER', 'OUTFILE', 'PRECISION', 'PRIMARY', 'PROCEDURE', 'PURGE', 'RAID0', 'RANGE', 'READ', 'READS', 'REAL', 'REFERENCES', 'REGEXP', 'RELEASE', 'RENAME', 'REPEAT', 'REPLACE', 'REQUIRE', 'RESTRICT', 'RETURN', 'REVOKE', 'RIGHT', 'RLIKE', 'SCHEMA', 'SCHEMAS', 'SECOND_MICROSECOND', 'SELECT', 'SENSITIVE', 'SEPARATOR', 'SET', 'SHOW', 'SMALLINT', 'SPATIAL', 'SPECIFIC', 'SQL', 'SQLEXCEPTION', 'SQLSTATE', 'SQLWARNING', 'SQL_BIG_RESULT', 'SQL_CALC_FOUND_ROWS', 'SQL_SMALL_RESULT', 'SSL', 'STARTING', 'STRAIGHT_JOIN', 'TABLE', 'TERMINATED', 'THEN', 'TINYBLOB', 'TINYINT', 'TINYTEXT', 'TO', 'TRAILING', 'TRIGGER', 'TRUE', 'UNDO', 'UNION', 'UNIQUE', 'UNLOCK', 'UNSIGNED', 'UPDATE', 'USAGE', 'USE', 'USING', 'UTC_DATE', 'UTC_TIME', 'UTC_TIMESTAMP', 'VALUES', 'VARBINARY', 'VARCHAR', 'VARCHARACTER', 'VARYING', 'WHEN', 'WHERE', 'WHILE', 'WITH', 'WRITE', 'X509', 'XOR', 'YEAR_MONTH', 'ZEROFILL']

  let primaryKey = '_pk'
  export default {
    name: 'DBAttributeTable',
    components: {
      JEditableTable
    },
    inject: ['getAllTable'],
    props:{
      actionButton:{
        type:Boolean,
        default:true,
        required:false
      }
    },
    data() {
      return {
        primaryKey: primaryKey,
        deleteIds: [],
        loading: false,
        selectedRowKeys: [],
        dataSource: [],
        columns: [
          {
            title: '字段名称', // 必填
            key: 'dbFieldName',
            //width: '15%',
            width: '160px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '请输入${title}',
            validateRules: [
              { required: true, message: '${title}不能为空' },
              {
                pattern: /^[a-zA-Z]{1}(?!_)[a-zA-Z0-9_\\$]+$/,
                message: '命名规则:只能由字母、数字、下划线、$符号组成;必须以字母开头;不能以单个字母加下滑线开头'
              },
              {
                // 自定义函数校验 handler
                handler(type, value, row, column, callback, target) {
                  let findCount = 0
                  for (let item of target.inputValues) {
                    let val = item['dbFieldName']

                    /* 判断是否是关键字 */
                    //update-begin-author:taoyan date:20202422 for:TESTA-99 【Online表单】字段名关键字提示失效了
                    if (target.getCleanId(item.id) === row.id && MySQLKeywords.includes(val.toUpperCase())) {
                      callback(false, value + '是关键字，不能作为字段名称使用！')
                      return
                    }
                    //update-end-author:taoyan date:20202422 for:TESTA-99 【Online表单】字段名关键字提示失效了

                    /* 判断是否有重复的值 */
                    if (val === value && ++findCount >= 2) {
                      callback(false, value + '已存在，不能重复！')
                      return
                    }
                  }
                  callback(true) // true = 通过验证
                },
                message: '不能有重复的值'
              }
            ],
            props: { 'disabled': !this.actionButton }
          },
          {
            title: '字段备注', // 必填
            key: 'dbFieldTxt',
            // width: '13%',
            width: '140px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '字段长度', // 必填
            key: 'dbLength',
            // width: '9%',
            width: '100px',
            type: FormTypes.inputNumber,
            defaultValue: 32,
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }],
            props: { 'disabled': !this.actionButton }
          },
          {
            title: '小数点', // 必填
            key: 'dbPointLength',
            // width: '9%',
            width: '100px',
            type: FormTypes.inputNumber,
            defaultValue: 0,
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }],
            props: { 'disabled': !this.actionButton }
          },
          {
            title: '默认值',
            key: 'dbDefaultVal',
            // width: '12%',
            width: '130px',
            type: FormTypes.input,
            defaultValue: '',
            props: { 'disabled': !this.actionButton }
          },
          {
            title: '字段类型', // 下拉框，默认String
            key: 'dbType',
            // width: '13%',
            width: '140px',
            type: FormTypes.select,
            options: [ // 下拉选项
              { title: 'String', value: 'string' },
              { title: 'Integer', value: 'int' },
              { title: 'Double', value: 'double' },
              { title: 'Date', value: 'Date' },
              { title: 'BigDecimal', value: 'BigDecimal' },
              { title: 'Text', value: 'Text' },
              { title: 'Blob', value: 'Blob' }
            ],
            defaultValue: 'string',
            placeholder: '请选择${title}',
            props: { 'disabled': !this.actionButton },
            validateRules: [
              { required: true, message: '请选择${title}' },
              {
                handler: (type, value, row, column, callback, target) => {
                  if (type !== 'getValues') {
                    this.getAllTable().then(tables => {
                      let [table1, table2] = tables
                      // 获取到 table2（页面属性） 中的控件类型
                      let fieldShowType = table2.$refs.editableTable.getValuesSync({
                        validate: false, // 不校验数据，直接获取值
                        rowIds: [row.id] // 只获取当前校验行的数据
                      }).values[0].fieldShowType
                      // 当控件类型类型为日期时，数据库类型必须是Date类型
                      if ((fieldShowType === 'date' || fieldShowType === 'datetime')) {
                        // 重新校验table2
                        table2.$refs.editableTable.getValuesSync({
                          validate: true, // 校验数据
                          rowIds: [row.id] // 只校验当前行
                        })
                      }
                      callback()
                    }).catch(error => {
                      console.error(error)
                      callback(false, '校验出错')
                    })
                  } else {
                    callback()
                  }
                },
                message: '${title}校验失败',
              }
            ],
          },
          {
            title: '主键',
            key: 'dbIsKey',
            // width: '7%',
            width: '80px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false,
            props: { 'disabled': !this.actionButton }
          },
          {
            title: '允许空值',
            key: 'dbIsNull',
            // width: '7%',
            width: '80px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: true,
            props: { 'disabled': !this.actionButton }
          },
          {
            title: '排序',
            key: 'orderNum',
            isOrder: true, //  是否是排序字段，如果是排序字段，那么新增的默认值永远是最大值+1
            type: FormTypes.hidden,
            defaultValue: 0
          }
        ],
        addBatching: false
      }
    },
    created() {
      this.jet = null
    },
    mounted() {
      this.jet = this.$refs.editableTable
    },
    methods: {

      /* 初始化列表 */
      initialTable() {
        this.dataSource = []
        this.deleteIds = []
        this.selectedRowKeys = []
        this.$refs.editableTable.initialize()
      },

      handleAdded() {
        this.$emit('added', this)
      },
      handleDeleted() {
        this.$emit('deleted', this)
      },
      handleDragged(event) {
        this.$emit('dragged', {
          oldIndex: event.oldIndex,
          newIndex: event.newIndex,
          target: this
        })
      },
      handleInserted(event) {
        this.$emit('inserted', { ...event, target: this })
      },
      handleValueChange(event) {
        let { type, row, column, value, target } = event
        if (type === FormTypes.select && column.key === 'dbType') {
          // 当字段类型改为Date时触发同步事件，同步控件类型为日期选择器
          if (value === 'Date') {
            this.$emit('syncDbType', { row, value, target: this })
          }
          // 字段类型Blob、Date、Text 将字段长度改为0
          if (value === 'Blob' || value === 'Text'|| value === 'Date') {
            target.setValues([{ rowKey: row.id, values: { dbLength: '0' } }])
          } else if (value === 'int' || value === 'double'|| value === 'BigDecimal') {
            target.setValues([{ rowKey: row.id, values: { dbLength: '10' } }])
          } else if (row['dbLength'] === '0') {
            target.setValues([{ rowKey: row.id, values: { dbLength: '32' } }])
          }
        }
      },

      /** 新增一行，并反馈给父组件 */
      tableAddLine(newLine) {
        this.$refs.editableTable.push(newLine)
        // 正在批量添加数据，不单独反馈
        if (!this.addBatching) {
          this.$emit('added', this)
        }
      },
      tableDeleteLines(idArr){
        this.$refs.editableTable.removeRows(idArr)
      },
      /** 开始批量添加数据，在此期间添加的数据不会反馈给父组件进行同步 */
      addBatchBegin() {
        this.addBatching = true
        this.loading = true
      },
      /** 结束批量添加数据，会立即反馈给父组件进行同步数据 */
      addBatchEnd() {
        this.addBatching = false
        this.loading = false
        this.$emit('added', this)
      }

    }
  }
</script>

<style scoped>

</style>