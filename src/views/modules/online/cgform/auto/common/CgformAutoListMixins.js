import { filterObj } from '@/utils/util'
import { deleteAction, downFile, getAction, postAction } from '@/api/manage'
import CgformAutoListTable from './CgformAutoListTable'
import CgformAutoListButtons from './CgformAutoListButtons'
import CgformAutoListQueryParams from './CgformAutoListQueryParams'
import { onlUtil } from '@/mixins/OnlineCommonUtil'
import { HrefJump } from '@/mixins/OnlAutoListMixin'

export default {
  mixins: [onlUtil, HrefJump],
  provide() {
    return {
      loadData: this.loadData,
      handleAdd: this.handleAdd,
      handleEdit: this.handleEdit,
      handleDetail: this.handleDetail,
      handleDelBatch: this.handleDelBatch,
      handleDeleteOne: this.handleDeleteOne,

      handleImportXls: this.handleImportXls,
      handleExportXls: this.handleExportXls,

      cgButtonJsHandler: this.cgButtonJsHandler,
      cgButtonLinkHandler: this.cgButtonLinkHandler,
      cgButtonActionHandler: this.cgButtonActionHandler,

      onClearSelected: this.onClearSelected,

      handleSuperQuery: this.handleSuperQuery,
      handleSearchQuery: this.handleSearchQuery,
      handleSearchReset: this.handleSearchReset,
    }
  },
  components: {
    CgformAutoListTable,
    CgformAutoListButtons,
    CgformAutoListQueryParams,
  },
  data() {
    return {
      code: '',
      schema: {},
      // 查询参数，多个页面的查询参数用 code 作为键来区分
      queryParamsMap: {},
      // 字典选项
      dictOptions: {},
      // online 自定义按钮
      cgButtonList: [],
      // online 自定义 table link 按钮
      cgButtonLinkList: [],
      // 是否对接了流程
      hasBpmStatus: false,
      // 高级查询
      superQuery: {
        // 字段列表
        fieldList: [],
        // 查询参数
        params: '',
        // 查询条件拼接方式 'and' or 'or'
        matchType: 'and'
      },
      // 表格相关参数
      table: {
        loading: true,
        scroll: { x: false },
        // 表头
        columns: [],
        //数据集
        dataSource: [],
        // 选择器
        selectedRowKeys: [],
        selectionRows: [],
        // 分页参数
        pagination: {}
      },
      // 表格排序字段
      isorter: {
        column: 'createTime',
        order: 'desc',
      },
      // 表格分页参数
      metaPagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      // 表格的操作列
      actionColumn: {
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' },
        // fixed:"right",
        align: 'center',
        width: 150
      },
      // 是否显示表格的复选框
      checkboxFlag: false,
      // 是否允许横向滚动表格
      scrollFlag: 0,
      // 控制按钮是否显示（按钮权限）
      buttonSwitch: {
        add: true,
        update: true,
        delete: true,
        batch_delete: true,
        import: true,
        export: true,
        detail: true
      },
      // JS 增强片段
      EnhanceJS: '',
      // 表单模板
      formTemplate: '99',
      // 当前列表名词
      currentTableName: '',
    }
  },
  computed: {
    queryParam: {
      get() {
        return this.queryParamsMap[this.code]
      },
      set(newVal) {
        this.$set(this.queryParamsMap, this.code, newVal)
      }
    },
    url() {
      const urlPrefix = '/online/cgform/api'
      return {
        getColumns: `${urlPrefix}/getColumns/${this.code}`,
        getData: `${urlPrefix}/getData/${this.code}`,
        optPre: `${urlPrefix}/form/${this.code}/`,
        exportXls: `${urlPrefix}/exportXls/`,
        buttonAction: `${urlPrefix}/doButton`,
        startProcess: `/process/extActProcess/startMutilProcess`,
        getQueryInfo: `${urlPrefix}/getQueryInfo/${this.code}`,
        importUrl: `${urlPrefix}/importXls/${this.code}`,
      }
    },

  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      handler() {
        // 刷新参数放到这里去触发，就可以刷新相同界面了
        this.initialAutoList()
      }
    }
  },
  mounted() {
    this.cgButtonJsHandler('mounted')
  },
  methods: {

    initialAutoList() {
      this.code = this.$route.params.code
      if (!this.code) {
        return false
      }
      // 清空查询条件
      if (!this.queryParam) {
        this.queryParam = {}
      }
      // 清空高级查询条件
      this.superQuery.params = ''
      if (this.$refs.superQuery) {
        this.$refs.superQuery.handleReset()
      }
      // 加载列和行数据
      this.loadAll()
    },
    async loadAll() {
      this.table.loading = true
      await this.loadColumns(false)
      await this.loadData(1, false)
      this.table.loading = false
    },
    async loadData(pageNum = 1, showLoading = true) {
      //查询条件
      let params = this.getQueryParams()
      // 判断是否启用了分页
      if (this.table.pagination) {
        this.table.pagination.current = pageNum
      } else {
        params['pageSize'] = -521
      }
      if (showLoading) {
        this.table.loading = true
      }
      const pro = getAction(this.url.getData, params)
      pro.then(res => {
        if (res.success) {
          let result = res.result
          if (this.table.pagination) {
            if (Number(result.total) > 0) {
              this.table.pagination.total = Number(result.total)
              this.table.dataSource = result.records
            } else {
              this.table.pagination.total = 0
              this.table.dataSource = []
            }
          }else{
            this.table.dataSource = !result.records?[]:result.records
          }

        } else {
          this.$message.warning(res.message)
        }
      })
      if (showLoading) {
        pro.finally(() => {
          this.table.loading = false
        })
      }
      return pro
    },
    async loadColumns(showLoading = true) {
      if (showLoading) {
        this.table.loading = true
      }
      const pro = getAction(this.url.getColumns)
      pro.then(res => {
        console.log('--onlineInnerTableList-加载动态列: ', res)
        if (res.success) {
          const { checkboxFlag, paginationFlag, fieldHrefSlots, dictOptions, formTemplate } = res.result
          const { currentTableName, cgButtonList, enhanceJs, hideColumns, columns, scrollFlag, description } = res.result

          this.checkboxFlag = checkboxFlag === 'Y'
          this.table.pagination = paginationFlag === 'Y' ? { ...this.metaPagination } : false
          this.scrollFlag = scrollFlag
          this.dictOptions = dictOptions
          this.description = description
          this.formTemplate = formTemplate
          this.currentTableName = currentTableName
          this.initCgEnhanceJs(enhanceJs)
          this.initButtonSwitch(hideColumns)
          this.initialCgButtonList(cgButtonList)
          // href 跳转
          const fieldHrefSlotKeysMap = {}
          fieldHrefSlots.forEach(item => fieldHrefSlotKeysMap[item.slotName] = item)
          // 遍历处理列
          columns.forEach(column => {
            Object.keys(column).map(key => {
              // 删掉空值的字段（不删除 空字符串('') 或 数字 0 ）
              if (column[key] == null) {
                delete column[key]
              }
            })
            // 处理列中的 href 跳转和 dict 字典，使两者可以兼容存在
            this.handleColumnHrefAndDict(column, fieldHrefSlotKeysMap)
          })
          //update-begin-author:taoyan date:20200430 for:【online表单】 功能测试 内嵌主子表，子表的更多操作项隐藏
          if(res.result.tableType==3){
            this.table.columns = [...columns]
          }else{
            this.table.columns = columns.concat([this.actionColumn])
          }
          //update-end-author:taoyan date:20200430 for:【online表单】 功能测试 内嵌主子表，子表的更多操作项隐藏
          this.table.selectedRowKeys = []
          // 判断是否对接了流程
          this.hasBpmStatus = columns.map(item => (item.dataIndex || '').toLowerCase()).includes('bpm_status')
        } else {
          this.$message.warning(res.message)
        }
      })
      if (showLoading) {
        pro.finally(() => {
          this.table.loading = false
        })
      }
      return pro
    },

    getQueryParams() {
      let params = Object.assign({}, this.queryParam, this.isorter)
      params.pageNo = this.table.pagination.current
      params.pageSize = this.table.pagination.pageSize
      params.superQueryMatchType = this.superQuery.matchType
      params.superQueryParams = encodeURIComponent(this.superQuery.params)
      return filterObj(params)
    },

    initialCgButtonList(buttonList) {
      this.cgButtonList = []
      this.cgButtonLinkList = []
      if (buttonList) {
        buttonList.forEach(button => {
          if (button.buttonStyle === 'button') {
            this.cgButtonList.push(button)
          } else if (button.buttonStyle === 'link') {
            this.cgButtonLinkList.push(button)
          }
        })
      }
    },

    handleAdd() {
      this.cgButtonJsHandler('beforeAdd')
      this.$refs.modal.add(this.formTemplate)
    },
    handleEdit(record) {
      this.cgButtonLinkHandler(record, 'beforeEdit', 'js')
      this.$refs.modal.edit(this.formTemplate, record.id)
    },
    handleDetail(record) {
      this.$refs.modal.detail(this.formTemplate, record.id)
    },
    handleDelete(id) {
      deleteAction(this.url.optPre + id).then(res => {
        if (res.success) {
          this.$message.success(res.message)
          this.loadData()
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    handleDeleteOne(record) {
      this.cgButtonLinkHandler(record, 'beforeDelete', 'js')
      this.handleDelete(record.id)
    },

    // 查询完 schema 后，生成高级查询的字段列表
    handleGetSchema(schema) {
      this.schema = schema
      if (schema && schema.properties) {
        let setField = (array, field) => {
          let type = field.view || (field.type || 'string')
          type = (type === 'inputNumber' ? 'number' : type)
          let params = {
            type: type,
            value: field.key,
            text: field.title,
            // 额外字典参数
            dictCode: field.dictCode,
            dictTable: field.dictTable,
            dictText: field.dictText,
            options: field.enum || field.options,
            order: field.order,
          }
          // 处理popup
          if (type === 'popup') {
            params['popup'] = {
              code: field.popupCode || field.code,
              field: field.orgFields.split(',')[0],
              orgFields: field.orgFields.split(',')[0],
              destFields: field.destFields.split(',')[0]
            }
          }
          array.push(params)
        }
        let fieldList = []
        for (let key in schema.properties) {
          if (!schema.properties.hasOwnProperty(key)) {
            continue
          }
          let field = schema.properties[key]
          // tab = 子表 一对多
          if (field.view === 'tab' && field.relationType==0) {
            let subTable = {
              type: 'sub-table',
              value: field.key,
              text: field.describe,
              children: []
            }
            if(field.columns){
              for (let column of field.columns) {
                setField(subTable.children, column)
              }
            }
            fieldList.push(subTable)
            // tab = 子表 一对一
          }  else if(field.view === 'tab' && field.relationType==1){
            let subTable = {
              type: 'sub-table',
              value: field.key,
              text: field.describe,
              children: []
            }
            Object.keys(field.properties).map(k=>{
              field.properties[k]['key'] = k;
              setField(subTable.children, field.properties[k]);
            })
            fieldList.push(subTable)
          } else {
            field.key = key
            setField(fieldList, field)
          }
        }
        // 冒泡排序
        for (let i = 0; i < fieldList.length; i++) {
          for (let j = i + 1; j < fieldList.length; j++) {
            let temp1 = fieldList[i]
            let temp2 = fieldList[j]
            if (temp1.order > temp2.order) {
              fieldList[i] = temp2
              fieldList[j] = temp1
            }
          }
        }
        this.superQuery.fieldList = fieldList
      }
    },

    handleFormSuccess() {
      this.loadData()
    },

    handleImportXls() {
      this.$refs.importModal.show()
    },
    handleExportXls() {
      let param = this.queryParam
      if (this.table.selectedRowKeys && this.table.selectedRowKeys.length > 0) {
        param['selections'] = this.table.selectedRowKeys.join(',')
      }
      console.log('导出参数', param)
      let paramsStr = JSON.stringify(filterObj(param))
      downFile(this.url.exportXls + this.code, { paramsStr: paramsStr }).then((data) => {
        if (!data || data.size===0) {
          this.$message.warning('文件下载失败')
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data]), this.description + '.xls')
        } else {
          let url = window.URL.createObjectURL(new Blob([data]))
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', this.description + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link) //下载完成移除元素
          window.URL.revokeObjectURL(url) //释放掉blob对象
        }
      })
    },
    cgButtonJsHandler(buttonCode) {
      if (this.EnhanceJS[buttonCode]) {
        this.EnhanceJS[buttonCode](this)
      }
    },


    // 高级查询
    handleSuperQuery(params, matchType) {
      if (!params || params.length === 0) {
        this.superQuery.params = ''
      } else {
        this.superQuery.params = JSON.stringify(params)
      }
      this.superQuery.matchType = matchType
      this.loadData(1)
    },
    handleSearchQuery() {
      this.loadData(1)
    },
    handleSearchReset() {
      this.queryParam = {}
      this.loadData(1)
    },


    initButtonSwitch(hideColumns) {
      Object.keys(this.buttonSwitch).forEach(key => {
        this.buttonSwitch[key] = true
      })
      if (hideColumns && hideColumns.length > 0) {
        Object.keys(this.buttonSwitch).forEach(key => {
          if (hideColumns.indexOf(key) >= 0) {
            this.buttonSwitch[key] = false
          }
        })
      }
    },

    /* ---------------------------- */
    /* ------- JS增强相关方法 ------- */
    /* ---------------------------- */

    initCgEnhanceJs(enhanceJs) {
      // console.log("--onlineList-js增强",enhanceJs)
      if (enhanceJs) {
        let Obj = eval('(' + enhanceJs + ')')
        this.EnhanceJS = new Obj(getAction, postAction, deleteAction)
        this.cgButtonJsHandler('created')
      } else {
        this.EnhanceJS = ''
      }
    },
    cgButtonLinkHandler(record, buttonCode, optType) {
      if (optType === 'js') {
        if (this.EnhanceJS[buttonCode]) {
          this.EnhanceJS[buttonCode](this, record)
        }
      } else if (optType === 'action') {
        let params = {
          formId: this.code,
          buttonCode: buttonCode,
          dataId: record.id
        }
        console.log('自定义按钮link请求后台参数：', params)
        postAction(this.url.buttonAction, params).then(res => {
          if (res.success) {
            this.loadData()
            this.$message.success('处理完成!')
          } else {
            this.$message.warning('处理失败!')
          }
        })
      }
    },
    cgButtonActionHandler(buttonCode) {
      //处理自定义button的 需要配置该button自定义sql
      if (!this.table.selectedRowKeys || this.table.selectedRowKeys.length === 0) {
        this.$message.warning('请先选中一条记录')
        return false
      }
      if (this.table.selectedRowKeys.length > 1) {
        this.$message.warning('请只选中一条记录')
        return false
      }
      let params = {
        formId: this.code,
        buttonCode: buttonCode,
        dataId: this.table.selectedRowKeys[0]
      }
      console.log('自定义按钮请求后台参数：', params)
      postAction(this.url.buttonAction, params).then(res => {
        if (res.success) {
          this.loadData()
          this.$message.success('处理完成!')
        } else {
          this.$message.warning('处理失败!')
        }
      })
    },

    /* -------------------------- */
    /* ------- 列表相关方法 ------- */
    /* -------------------------- */

    onClearSelected() {
      this.table.selectedRowKeys = []
      this.table.selectionRows = []
    },
    handleDelBatch() {
      if (this.table.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return false
      } else {
        this.$confirm({
          title: '确认删除',
          content: '是否删除选中数据？',
          onOk: () => {
            let ids = this.table.selectedRowKeys.join(',')
            this.handleDelete(ids)
            this.onClearSelected()
          }
        })
      }
    },


  }
}