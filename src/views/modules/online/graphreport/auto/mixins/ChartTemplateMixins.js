import { cloneObject, jsExpand } from '@/utils/util'
import BarMultid from '@/components/chart/BarMultid'
import Pie from '@/components/chart/Pie'
import LineChartMultid from '@/components/chart/LineChartMultid'
import { downFile } from '@/api/manage'
import { filterDictText } from '@comp/dict/JDictSelectUtil'


export default {
  name: 'ChartTabTemplate',
  components: { BarMultid, Pie, LineChartMultid },
  props: {
    // 是否运行在组件模式
    component: {
      type: Boolean,
      default: false
    },
    // 图表标题
    title: {
      type: String,
      default: null
    },
    // Y轴显示文字
    // yaxisText: {
    //   type: String,
    //   default: 'y'
    // },
    // 数据源
    dataSource: {
      type: Object,
      default: null
    },
    // 如果是组合显示，那么就需要传入多个数据源
    dataSources: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      headId: null,
      // 图表的高度
      height: 400,
      // 是否显示数据表格
      isTable: false,
      // 当前显示的图表
      activeKey: 'bar',
      // 图表类型
      graphTypes: [],
      bar: {
        fields: [],
        dataSource: []
      },
      barAndLine: {
        dataSource: []
      },
      line: {
        fields: [],
        dataSource: []
      },
      pie: {
        dataSource: []
      },
      table: {
        // 固定的列数据
        fixedColumns: [
          {
            title: '#',
            key: 'rowIndex',
            width: '10%',
            align: 'center',
            customRender: function(t, r, index) {
              if (r.isTotal === true) {
                return '总计'
              } else {
                return parseInt(index) + 1
              }
            }
          }
        ],
        columns: [],
        dataSource: []
      },
      pageSwitch: true,
      // 线形图监听事件
      lineListeners: {
        click: (event, chart) => {
          // console.log('barListeners-click: ', event)
          let target = event.target
          let data = null
          // 点击触点时触发
          if (target.name === 'point') {
            data = event.data._origin || {}

            // 点击线时触发
          } else if (target.name === 'line') {
            data = event.data[0]._origin || {}
            delete data.type
            delete data.y
          }

          if (data != null) {
            let { x: yField, type: xField, y: value } = data
            this.emitExtendJsEvent({ type: 'line', yField, xField, value, target })
          }

        }
      },
      // 柱状图监听事件
      barListeners: {
        click: (event, chart) => {
          // console.log('barListeners-click: ', event)
          let target = event.target
          // 点击柱时触发
          if (target.name === 'interval') {
            let data = event.data._origin || {}
            let { type: yField, x: xField, y: value } = data
            this.emitExtendJsEvent({ type: 'bar', yField, xField, value, target })
          }
        }
      },
      // 饼图监听事件
      pieListeners: {
        click: (event, chart) => {
          // console.log('pieListeners-click: ', event)
          let target = event.target
          // 点击饼块时触发
          if (target.name === 'interval') {
            let data = event.data._origin || {}
            let { item, count: value } = data
            this.emitExtendJsEvent({ type: 'pie', item, value, target })
          }
        }
      },
      // 柱状图和线形图合并的监听事件
      barAndLineListeners: {
        click: (event, chart) => {
          console.log('chart-click: ', event, chart)
        }
      },
      // 用户JS增强的事件暂存处
      extendJsHandlerIsolation: {},
    }
  },
  computed: {

    extendJsHandler: {
      get() {
        if (this.headId == null) {
          return null
        } else {
          return this.extendJsHandlerIsolation[this.headId]
        }
      },
      set(obj) {
        if (this.headId != null) {
          this.$set(this.extendJsHandlerIsolation, this.headId, obj)
        }
      },
    },

    isLine() {
      return this.graphTypes.indexOf('line') !== -1
    },
    isBar() {
      return this.graphTypes.indexOf('bar') !== -1
    },
    isPie() {
      return this.graphTypes.indexOf('pie') !== -1
    },

    lineProps() {
      return {
        height: this.height,
        fields: this.line.fields,
        dataSource: this.line.dataSource,
        aliases: this.getAliases(this.line.fields)
      }
    },
    barAndLineProps() {
      return {
        height: this.height,
        dataSource: this.barAndLine.dataSource
      }
    },
    barProps() {
      return {
        height: this.height,
        fields: this.bar.fields.map(f => f.alias),
        dataSource: this.bar.dataSource,
        aliases: this.getAliases(this.bar.dataSource.map(i => i.type))
      }
    },
    pieProps() {
      return {
        height: this.height,
        dataSource: this.pie.dataSource
      }
    },

    // 图表区域<a-card/>标签的固定属性
    chartCardProps() {
      return {
        title: this.title,
        headStyle: { paddingLeft: '20px' },
        bodyStyle: { padding: '10px' },
        bordered: !this.component
      }
    },
    // 数据表格区域<a-card/>标签的固定属性
    tableCardProps() {
      return {
        title: '数据明细',
        headStyle: { paddingLeft: '20px' },
        bodyStyle: { padding: '0' },
        style: { marginTop: '20px' },
        bordered: !this.component
      }
    },
    // 导出按钮固定属性
    exportButtonProps() {
      return {
        type: 'primary',
        icon: 'download',
        text: '导出',
        style: { margin: '12px' }
      }
    },
    /** 分页开关固定属性 */
    pageSwitchProps() {
      return {
        checkedChildren: '分页',
        unCheckedChildren: '分页',
        style: {
          position: 'absolute',
          top: '17px',
          right: '12px'
        }
      }
    },
    // 数据表格的固定属性
    tableProps() {
      return {
        size: 'middle',
        rowKey: 'id',
        // bordered: true,
        pagination: this.pageSwitch ? { pageSize: 10 } : false,
        columns: this.table.columns,
        dataSource: this.table.dataSource,
        style: { borderTop: '1px solid #e8e8e8' }
      }
    }
  },
  watch: {
    dataSource: {
      // 立即以当前值触发回调
      immediate: true,
      handler(newVal) {
        this.parseDataSource(newVal)
      }
    },
    dataSources: {
      // 立即以当前值触发回调
      immediate: true,
      handler(newVal) {
        this.parseDataSources(newVal)
      }
    }
  },
  methods: {

    // 根据columns配置获取别名
    getAliases(fields) {
      return fields.map(field => {
        let item = { field, alias: field }
        for (let col of this.table.columns) {
          if (field === col.dataIndex) {
            item.alias = col.title
            break
          }
        }
        return item
      })
    },

    /** 执行JS扩展 */
    executeExtendJs(headId, jsCode) {
      if (!jsCode || !headId) {
        return;
      }
      let onClick = { line: null, bar: null, pie: null }
      let code = `
        ;(function (headId, onClick) {
          ${jsCode}
        })(globalEvent.headId, globalEvent.onClick);
      `
      jsExpand({ event: { headId, onClick }, jsCode: code })
      if (this.extendJsHandler == null) {
        this.extendJsHandler = { click: onClick }
      } else {
        this.extendJsHandler.click = onClick
      }
    },

    /** 触发JS增强里定义的事件 */
    emitExtendJsEvent(event) {
      if (this.extendJsHandler != null) {
        let fn = this.extendJsHandler.click[event.type]
        if (typeof fn === 'function') {
          fn.call(this, event)
        }
      }
    },

    /** 解析 chartData */
    parseDataSource(dataSource) {
      if (dataSource == null) return null
      let { head, data, items, dictOptions } = dataSource
      if (head == null) return

      let { id, xaxisField, yaxisField, dataType, cgrSql, graphType, extendJs } = head

      this.headId = id
      this.executeExtendJs(id, extendJs)

      try {
        data = (dataType === 'sql') ? data : JSON.parse(cgrSql)
      } catch {
        this.error.jsonFormattingFailed = true
        return
      }

      let dictList = dictOptions[xaxisField]
      let graphTypes = graphType.split(',')

      // 判断是否定义了数据表格，如果定义了则删除该项，不参与动态渲染，只显示在最底部
      let index = graphTypes.indexOf('table')
      this.isTable = index !== -1
      if (this.isTable) {
        graphTypes.splice(index, 1)
      }
      this.activeKey = graphTypes[0]
      this.graphTypes = graphTypes

      let yaxisFields = yaxisField.split(',')

      // 根据用户配置构造出 barDataSource
      let barFields = data.map(d => {
        let field = d[xaxisField]
        let opt = { field, alias: field }
        // 判断是否有字典
        if (dictList) {
          opt.alias = filterDictText(dictList, field)
        }
        return opt
      })
      let barDataSource = []
      for (let yField of yaxisFields) {
        let obj = {
          type: yField
        }
        barFields.forEach(xaxis => {
          obj[xaxis.alias] = (() => {
            for (let d of data) {
              if (d[xaxisField] === xaxis.field) {
                return d[yField]
              }
            }
            return null
          })()
        })
        barDataSource.push(obj)
      }
      this.bar.fields = barFields
      this.bar.dataSource = barDataSource

      // 根据用户配置构造出 lineDataSource
      this.line.fields = yaxisFields
      this.line.dataSource = data.map(d => {
        let item = { type: d[xaxisField] }
        // 判断是否有字典
        if (dictList) {
          item.type = filterDictText(dictList, item.type)
        }
        this.line.fields.forEach(field => {
          item[field] = d[field]
        })
        return item
      })

      // 根据用户配置构造出 tableDataSource 和 pieDataSource
      let pieDataSource = []
      this.table.dataSource = data.map((item, index) => {
        item.id = index
        let pieData = {
          item: item[xaxisField],
          count: item[yaxisFields[0]]
        }
        // 判断是否有字典
        if (dictList) {
          pieData.item = filterDictText(dictList, pieData.item)
        }
        pieDataSource.push(pieData)
        return item
      })
      this.pie.dataSource = pieDataSource

      // 根据用户配置构造出 tableColumns
      let tableColumns = cloneObject(this.table.fixedColumns)
      // 由于 cloneObject() 方法无法克隆function，所以需手动赋值
      tableColumns[0].customRender = this.table.fixedColumns[0].customRender
      let isTotals = []
      let searchField = []
      items.forEach(item => {
        if (item.isShow === 'Y') {
          let column = {
            align: 'center',
            width: '10%',
            title: item.fieldTxt,
            dataIndex: item.fieldName
          }
          if (item.dictCode) {
            column.customRender = (text) => filterDictText(dictOptions[item.dictCode], text)
          }
          tableColumns.push(column)
          // 判断是否计算总数
          if (item.isTotal === 'Y') isTotals.push(item.fieldName)
          // 判断是否查询
          if (item.searchFlag === 'Y') searchField.push(item)
        }
      })
      this.table.columns = tableColumns
      this.$emit('searchFieldChange', searchField)

      // 如果有计算需要的值就进行计算
      if (isTotals.length > 0) {
        let totalRow = { id: this.table.dataSource.length, isTotal: true }
        isTotals.forEach(column => {
          let count = 0
          this.table.dataSource.forEach(row => {
            count += parseFloat(row[column])
          })
          totalRow[column] = isNaN(count) ? '包含非数字内容' : count.toFixed(2)
        })
        this.table.dataSource.push(totalRow)
      }
    },

    parseDataSources(dataSources) {
      if (dataSources == null) return

      let hasBar = false
      let bar = {}
      let line = {}

      dataSources.forEach(dataSource => {

        if (dataSource == null) return null
        let { head, data } = dataSource
        if (head == null) return

        let { xaxisField, yaxisField, dataType, cgrSql, graphType } = head

        try {
          data = (dataType === 'sql') ? data : JSON.parse(cgrSql)
        } catch {
          this.error.jsonFormattingFailed = true
          return
        }

        let graphTypes = graphType.split(',')

        let type = ''

        if (graphTypes.indexOf('bar') !== -1) {
          if (hasBar) {
            type = 'line'
          } else {
            hasBar = true
            type = 'bar'
          }
        } else if (graphTypes.indexOf('line') !== -1) {
          type = 'line'
        } else if (hasBar) {
          type = 'line'
        } else {
          type = 'bar'
        }

        let yaxisFields = yaxisField.split(',')

        if (type === 'bar') {
          // 根据用户配置构造出 barDataSource
          let barFields = data.map(d => d[xaxisField])
          let barDataSource = []
          for (let field of yaxisFields) {
            let obj = {
              type: field
            }
            barFields.forEach(x => {
              obj[x] = (() => {
                for (let d of data) {
                  if (d[xaxisField] === x) {
                    return d[field]
                  }
                }
                return null
              })()
            })
            barDataSource.push(obj)
          }
          bar.fields = barFields
          bar.dataSource = barDataSource

        } else {
          // 根据用户配置构造出 lineDataSource
          line.fields = yaxisFields
          line.dataSource = data.map(d => {
            let item = { 'type': d[xaxisField] }
            line.fields.forEach(field => {
              item[field] = d[field]
            })
            return item
          })
        }


      })

      // 整理
      let data = []


      if (bar.fields) {
        bar.fields.forEach((field, index) => {
          // console.log('bar.fields')
          let record = { type: field }
          record.bar = bar.dataSource[0][field]

          if (line.dataSource) {
            record.line = line.dataSource.length > index ? line.dataSource[index][line.fields[0]] : 0
          }
          data.push(record)
        })

      } else if (line.dataSource) {
        // console.log('line.dataSource')
        line.dataSource.forEach(item => {
          let { type } = item

          let record = { type }
          record.line = item[line.fields[0]]

          if (bar.dataSource) {
            record.bar = bar.dataSource[0][type]
          }
          data.push(record)
        })
      }
      // console.log('data:', data)

      this.barAndLine.dataSource = data

    },
    handleClickExportXls() {
      // 整理列
      let columns = this.table.columns.map(item => {
        if (item.key === 'rowIndex') {
          return { key: 'table_left_num_index', alias: '#' }
        } else {
          return { key: item.dataIndex, alias: item.title }
        }
      })
      // 整理数据
      let data = this.table.dataSource.map((item, index) => {
        let temp = {}
        columns.forEach((entity, entityIndex) => {
          temp[entity.key] = entityIndex === 0 ? (item.isTotal ? '总计' : (index + 1)) : item[entity.key]
        })
        return temp
      })
      // 编码转换
      let dataSource = encodeURIComponent(JSON.stringify(data))
      let entitys = encodeURIComponent(JSON.stringify(columns))
      // 拼接请求参数
      let url = `${window._CONFIG['domianURL']}/online/graphreport/api/exportXls`
      let fileName = this.title
      let params = {
        name: fileName,
        fieldName: fileName,
        entitys: entitys,
        dataSource: dataSource
      }
      downFile(url, params).then((data) => {
        if (!data) {
          this.$message.warning('文件下载失败')
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data]), fileName + '.xls')
        } else {
          let url = window.URL.createObjectURL(new Blob([data]))
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link) //下载完成移除元素
          window.URL.revokeObjectURL(url) //释放掉blob对象
        }
      })
    },

    /** 跳转到详情页 */
    handleGoToInfo() {
      this.goToInfo(this.dataSource)
    },

    goToInfo(data) {
      let url = `/online/graphreport/chart/${data.head.id}`
      this.$router.push({ path: url })
    },

  }
}