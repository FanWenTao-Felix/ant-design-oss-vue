<template>
  <a-card :bordered="false">

    <a-spin v-if="pageLoading" :spinning="pageLoading" style="width:100%;height: 48px;">

    </a-spin>

    <template v-else-if="error.notDesignForm">
      <h1 style="text-align: center">你还没有设计任何表单项，不能查看表单数据！</h1>
    </template>

    <template v-else>

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <a-button v-if="buttonsAuth.add" @click="handleAdd" type="primary" icon="plus">新增</a-button>

        <a-button v-if="buttonsAuth.export" type="primary" icon="download" @click="handleExportXls">导出</a-button>
        <a-button v-if="buttonsAuth.import" type="primary" icon="upload" @click="handleImportXls">导入</a-button>

        <!-- 高级查询 -->
        <j-super-query v-if="buttonsAuth.superQuery" :fieldList="squeryFieldList" :saveCode="superQuerySaveCode" :loading="loading" @handleSuperQuery="handleSuperQuery"/>

        <!-- 批量操作 -->
        <a-dropdown v-if="buttonsAuth.batchAction && selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="handleDeleteBatch">
              <a-icon type="delete"/>
              <span>删除</span>
            </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            <span>批量操作</span>
            <a-icon type="down"/>
          </a-button>
        </a-dropdown>

      </div>

      <!-- table区域-begin -->
      <div>

        <a-alert type="info" showIcon style="margin-bottom: 16px;">

          <a-row slot="message">
            <a-col :span="12">
              <span>已选择</span>
              <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
              <span>项</span>
              <a v-show="selectedRowKeys.length>0" style="margin-left: 12px" @click="selectedRowKeys=[]">清空</a>
            </a-col>
            <a-col :span="12" style="text-align: right">
              <a @click="handleClickReload">
                <a-icon type="sync"/>
                <span v-show="!isMobile" style="margin-left:4px;">刷新</span>
              </a>
              <template v-if="buttonsAuth.customColumn">
                <a-divider type="vertical"/>
                <a-popover title="自定义列" trigger="click" placement="leftTop">
                  <a-checkbox-group slot="content" :value="selectedColumnKeys" @change="handleCustomColumnChange">
                    <a-row :style="{maxWidth: '360px'}">
                      <a-col :md="8" :sm="24" style="width: 120px;">
                        <a-checkbox value="$selection$">选择列</a-checkbox>
                      </a-col>
                      <a-col :md="8" :sm="24" style="width: 120px;">
                        <a-checkbox value="$rowNumber$">行号列</a-checkbox>
                      </a-col>
                      <a-col :md="8" :sm="24" style="width: 120px;">
                        <a-checkbox value="$action$">操作列</a-checkbox>
                      </a-col>
                      <a-col :md="8" :sm="24" v-for="column in allColumns" :key="column.dataIndex" style="width: 120px;">
                        <a-checkbox :value="column.dataIndex">
                          <ellipsis :length="10">{{ column.title }}</ellipsis>
                        </a-checkbox>
                      </a-col>
                    </a-row>
                  </a-checkbox-group>
                  <a>
                    <a-icon type="setting"/>
                    <span v-show="!isMobile" style="margin-left:4px;">自定义列</span>
                  </a>
                </a-popover>
              </template>
            </a-col>
          </a-row>


        </a-alert>

        <a-table
          class="j-table-force-nowrap"
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          :scroll="tableScroll"
          :rowSelection="rowSelection"
          @change="handleTableChange">

          <template slot="view-picture" slot-scope="text, record, index">
            <div v-if="Array.isArray(text) && text.length > 0" class="j-table-slot-view">
              <img v-for="(item,imgIndex) of text" :src="item.url" alt=" " :preview="index" v-show="imgIndex===0"/>
            </div>
          </template>

          <template slot="view-file" slot-scope="text">
            <div v-if="Array.isArray(text) && text.length > 0" class="j-table-slot-view">
              <a-button type="primary" icon="download" size="small" ghost @click="downloadRowFile(text)">下载</a-button>
            </div>
          </template>

          <template slot="view-color" slot-scope="text">
            <a-tooltip
              v-if="text"
              placement="top"
              :title="text"
              :getPopupContainer="node=>node.parentNode"
            >
              <div class="j-table-slot-view-color" :style="{backgroundColor: text}"></div>
            </a-tooltip>
          </template>

          <template slot="action" slot-scope="text, record">
            <template v-if="buttonsAuth.detail">
              <a @click="handleView(record)">查看</a>
              <a-divider type="vertical"/>
            </template>
            <template v-if="buttonsAuth.edit">
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical"/>
            </template>
            <template v-if="buttonsAuth.getUrl">
              <a @click="handleGetEditUrl(record)">获取编辑地址</a>
              <a-divider type="vertical"/>
            </template>
            <template v-if="buttonsAuth.delete">
              <a-dropdown>
                <a class="ant-dropdown-link">更多
                  <a-icon type="down"/>
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                      <a>删除</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
          </template>

        </a-table>
      </div>
      <!-- table区域-end -->

      <!-- 表单区域 -->
      <auto-desform-data-full-screen ref="desformModal" @ok="handleAutoModalOk"/>
    </template>

    <j-import-modal ref="importModal" :url="url.importXls(desformCode)" @ok="handleImportOk"/>

  </a-card>
</template>

<script>
  import { mapState } from 'vuex'
  import { filterObj, pushIfNotExist } from '@/utils/util'
  import { getAction, deleteAction, downloadFile, putAction, getFileAccessHttpUrl } from '@/api/manage'
  import JSuperQuery from '@/components/jeecg/JSuperQuery'
  import AutoDesformDataModal from './modules/AutoDesformDataModal'
  import AutoDesformDataFullScreen from './modules/AutoDesformDataFullScreen'
  import JImportModal from '@/components/jeecg/JImportModal'
  import { recursiveAllWidget } from '../util/desformUtil'
  import { getDictItems, filterDictText } from '@/components/dict/JDictSelectUtil'
  import { transitRESTful } from '@api/api'
  import Ellipsis from '@/components/Ellipsis'
  import Area from '@/components/_util/Area'
  import '@/assets/less/TableExpand.less'

  export default {
    name: 'AutoDesignDataForm',
    components: { Ellipsis, AutoDesformDataFullScreen, AutoDesformDataModal, JSuperQuery, JImportModal },
    data() {
      return {
        loading: false,
        pageLoading: true,
        // 固定columns
        fixedColumns: {
          rowIndex: {
            title: '#',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            // fixed: 'left',
            customRender: (t, r, i) => ++i
          },
          action: {
            title: '操作',
            key: 'action',
            width: 280,
            align: 'center',
            // fixed: 'right',
            scopedSlots: { customRender: 'action' }
          }
        },
        fixedColumnKeys: ['$selection$', '$rowNumber$', '$action$'],
        tableColumnWidth: 180,
        tableScroll: undefined,//{ x: false },
        // 按钮权限
        buttonsAuth: {
          add: false,
          import: false,
          export: false,
          superQuery: false,
          batchAction: false,
          customColumn: false,
          detail: false,
          edit: false,
          delete: false,
          getUrl: false,
        },

        // 所有可展示出来的表头
        allColumns: [],
        selectedColumnKeys: [],
        // 表头
        columns: [],
        /* 数据源 */
        dataSource: [],
        // 是否显示选择列
        showRowSelection: true,
        /* 分页参数 */
        ipagination: {
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
        // 地址栏的code
        addressCode: null,
        desformName: '表单设计器数据',
        desformCode: null,
        selectedRowKeys: [],
        dialogOptions: { top: 60, width: 1000, padding: { top: 25, right: 25, bottom: 30, left: 25 } },
        // 高级查询构造器
        squeryFieldList: [],
        // 高级查询条件生效状态
        superQueryFlag: false,
        // 高级查询条件
        superQueryParams: '',
        // 高级查询链接条件
        superQueryMatchType: '',
        superQuerySaveCode: this.$route.fullPath,
        // 字典选项
        dictOptions: {},
        // 翻译选项
        translateOptions: {},
        // 远程选项
        remoteOptionsMap: {},
        // 所有可翻译的组件
        allTranslateItem: [],
        // 请求参数
        url: {
          queryById: '/desform/queryById',
          list: '/desform/data/list',
          getColumns: '/desform/getColumns',
          queryByCode: '/desform/queryByCode',
          delete: '/desform/data/delete',
          deleteBatch: '/desform/data/deleteBatch',
          exportXls: (desformCode) => '/desform/data/exportXls/' + desformCode,
          importXls: (desformCode) => '/desform/data/importXls/' + desformCode,
          translateColumns: '/desform/translateColumns',
        },
        error: {
          notDesignForm: false
        },
        mixin_pca:''
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(val) {
          // 刷新参数放到这里去触发，就可以刷新相同界面了
          if (val.path.indexOf('/online/desform/list/') === 0) {
            this.reload()
          }
        },
      },
    },
    computed: {
      ...mapState({
        device: state => state.app.device,
      }),
      isMobile() {
        return this.device === 'mobile'
      },
      isDesktop() {
        return this.device === 'desktop'
      },
      rowSelection() {
        return this.showRowSelection ? {
          selectedRowKeys: this.selectedRowKeys,
          onChange: (rowKeys) => this.selectedRowKeys = rowKeys
        } : null
      },
    },
    created() {
      this.mixin_pca = new Area()
    },
    mounted() {
    },

    methods: {
      reload() {
        // 初始化
        this.pageLoading = true
        this.columns = []
        this.dataSource = []
        this.selectedRowKeys = []
        this.ipagination.current = 1
        this.superQueryParams = ''
        this.superQueryFlag = false
        // 加载新数据
        let code = this.$route.params.code
        this.desformCode = null
        this.addressCode = code
        if (this.addressCode) {
          this.loadColumnsInfo(code)
        }
        // 加载列配置
        this.selectedColumnKeys = this.getColumnSetting()
      },

      loadColumnsInfo(code) {
        this.loading = true
        return getAction(this.url.getColumns, {
          desformCode: code
        }).then(res => {
          if (res.success) {
            let { result: { designForm, buttonsAuth } } = res
            this.buttonsAuth = buttonsAuth
            this.desformCode = designForm.desformCode
            this.desformName = designForm.desformName
            // 判断是否是子表
            if (designForm.desformType === 2) {
              this.desformCode = designForm.parentCode
              return this.loadColumnsInfo(designForm.parentCode)
            }
            let designJson = designForm.desformDesignJson
            if (designJson == null) {
              this.pageLoading = false
              this.error.notDesignForm = true
              return
            }
            let json = JSON.parse(designJson)
            // 保存 dialogConfig
            let dialogOptions = json.config.dialogOptions
            if (dialogOptions) {
              this.dialogOptions = dialogOptions
            }

            let allColumns = []
            let selectedColumnKeys = []
            // 高级查询条件
            let superQuery = []
            // 允许使用字典的组件
            let dictWidgets = ['select', 'radio', 'checkbox']
            // 所有待加载的字典Code
            let allDictCode = []
            // 所有待加载的远程选项
            let allRemoteOptions = []
            // 所有可翻译的组件
            let allTranslateItem = []

            /** 封装column，同时封装高级查询条件 */
            const packageColumn = (item) => {
              // 忽略部分显示
              let ignores = ['button', 'buttons', 'grid', 'card', 'tabs', 'text', 'sub-table-design', 'divider']
              if (ignores.indexOf(item.type) === -1) {
                let options = item.options
                let name = (item.name.trim()) || item.model
                let column = {
                  title: name,
                  align: 'center',
                  dataIndex: item.model
                }

                // 判断是否使用了字典，是就做字典翻译（或远程数据）
                if (dictWidgets.includes(item.type)) {
                  for (let type of dictWidgets) {
                    let { remote, remoteFunc, dictCode, showLabel } = options
                    // 如果用户设置了不显示 label，就不翻译字典
                    if (!showLabel) {
                      continue
                    }
                    if (remote === 'dict' && dictCode) {
                      pushIfNotExist(allDictCode, dictCode)
                      column.customRender = (text, record, index) => {
                        return filterDictText(this.dictOptions[dictCode], text)
                      }
                    } else if (remote === true && remoteFunc) {
                      pushIfNotExist(allRemoteOptions, item)
                      column.customRender = (text, record, index) => {
                        return filterDictText(this.remoteOptionsMap[item.key], text)
                      }
                    } else {
                      options.options = options.options.map(item => ({ ...item, text: item.label }))
                      column.customRender = (text, record, index) => {
                        return filterDictText(options.options, text)
                      }
                    }
                  }
                }
                // 翻译省市区组件
                if (item.type === 'area-linkage') {
                  column.customRender = (text, record, index) => {
                    try {
                      return this.getPcaText(text)
                    } catch (e) {
                      console.error(e)
                      return text
                    }
                  }
                }
                // 翻译用户组件、部门组件
                if (item.type === 'select-user' || item.type === 'select-depart') {
                  // 只有当自定义返回字段是ID和Username的时候才翻译，因为只有这两个字段是唯一的
                  if (options.customReturnField === 'id' || options.customReturnField === 'username' || options.customReturnField === 'orgCode') {
                    allTranslateItem.push({
                      type: item.type,
                      key: item.key,
                      model: item.model,
                      customReturnField: options.customReturnField
                    })
                    column.customRender = (text, record, index) => {
                      return this.columnsTranslator(item.key, text)
                    }
                  }
                }
                // 图片特殊处理
                if (item.type === 'imgupload') {
                  column.scopedSlots = { customRender: 'view-picture' }
                }
                // 文件特殊处理
                if (item.type === 'file-upload') {
                  column.scopedSlots = { customRender: 'view-file' }
                }
                // 开关特殊处理
                if (item.type === 'switch') {
                  column.customRender = (text, record, index) => {
                    let activeValue = options.activeValue || true
                    return (<a-switch size="small" checked={text === activeValue} disabled/>)
                  }
                }
                // 滑块特殊处理
                if (item.type === 'slider') {
                  let { min, max } = options
                  column.customRender = (text, record, index) => {
                    return (<a-slider value={text} min={min} max={max} disabled style="margin:0;"/>)
                  }
                }
                if (item.type === 'rate') {
                  let { max, allowHalf } = options
                  column.customRender = (text, record, index) => {
                    return (<a-rate value={text} count={max} allowHalf={allowHalf} disabled style="margin:0;font-size: 16px;"/>)
                  }
                }
                if (item.type === 'color') {
                  column.scopedSlots = { customRender: 'view-color' }
                }

                // column 只显示五个
                if (selectedColumnKeys.length < 5) {
                  selectedColumnKeys.push(column.dataIndex)
                }
                allColumns.push(column)
                // 高级查询类型，可根据校验的不同生成不同的类型
                let superQueryType = item.type
                // 特殊处理 input 的类型
                if (item.type === 'input') {
                  if (Array.isArray(item.rules) && item.rules.length > 0) {
                    for (let rule of item.rules) {
                      // 如果校验是数字类型，那么高级查询的type也应该是number
                      let numberTypes = ['number', 'integer', 'float']
                      if (numberTypes.includes(rule.type)) {
                        superQueryType = 'number'
                        break
                      }
                    }
                  }
                }
                // 处理日期类型
                if (item.type === 'date') {
                  if (options.type === 'datetime') {
                    superQueryType = 'datetime'
                  }
                }
                // 处理下拉选项
                if (Array.isArray(options.options) && options.options.length > 0) {
                  options.options.forEach(opt => {
                    // 处理没有显示label的情况
                    opt.label = opt.label ? opt.label : opt.value
                  })
                }

                // 是否有远程下拉选项
                let hasRemote = (options.remote === true && options.remoteFunc)
                superQuery.push({
                  type: superQueryType,
                  value: item.model,
                  text: name,
                  // 当设置了字典的时候才传dictCode
                  dictCode: options.remote === 'dict' ? options.dictCode : null,
                  dictTable: options.dictTable,
                  // 当远程加载数据时，高级查询下拉选项是远程数据，否则就是静态数据
                  remoteOptionsKey: hasRemote ? item.key : null,
                  options: hasRemote ? [] : options.options,
                  customReturnField: options.customReturnField
                })
              }
            }

            recursiveAllWidget(json.list, (item, parent) => {
              if (parent && parent.type === 'sub-table-design') {
                // do nothing
              } else {
                packageColumn(item)
              }
            })
            this.allColumns = allColumns
            this.squeryFieldList = superQuery
            this.allTranslateItem = allTranslateItem
            this.loadDictOptions(allDictCode)
            this.loadRemoteOptions(allRemoteOptions)

            if (this.selectedColumnKeys.length <= 0) {
              this.selectedColumnKeys = [...this.fixedColumnKeys, ...selectedColumnKeys]
            }
            this.handleCustomColumnChange(this.selectedColumnKeys)

            return this.loadData(this.desformCode)
          } else {
            this.$error({ title: '查询失败', content: res.message })
          }
        }).finally(() => {
          this.loading = false
          this.pageLoading = false
        })
      },
      // 列组件翻译器，可以翻译用户组件、部门组件
      columnsTranslator(key, text) {
        return filterDictText(this.translateOptions[key], text)
      },

      loadDataThis() {
        this.loadData(this.desformCode)
      },

      loadData(desformCode) {
        let params = {
          desformCode,
          superQuery: this.getQueryParams(),
          pageNo: this.ipagination.current,
          pageSize: this.ipagination.pageSize
        }
        this.loading = true
        return getAction(this.url.list, params).then((res) => {
          if (res.success) {
            this.dataSource = []
            // 待翻译数据data
            let translDataMap = new Map()
            res.result.records.forEach(item => {
              let desformData = {
                ...JSON.parse(item.desformDataJson),
                id: item.id
              }
              this.dataSource.push(desformData)
              // 把待翻译的组件数据拿出来
              this.allTranslateItem.forEach(translItem => {
                let { key, model } = translItem
                let modelData = desformData[model]
                if (modelData) {
                  if (translDataMap.has(key)) {
                    translDataMap.get(key).dataList.push(modelData)
                  } else {
                    translDataMap.set(key, {
                      ...translItem,
                      dataList: [modelData],
                    })
                  }
                }
              })
            })
            // 提交到后台查询翻译结果
            this.loadTranslateOptions(translDataMap)

            this.ipagination.total = res.result.total
            if (res.message !== '查询成功') {
              this.$message.warn(res.message)
            }
          } else {
            this.$error({ title: '查询失败', content: res.message })
          }
        }).finally(() => {
          this.loading = false
          this.pageLoading = false
        })
      },
      loadTranslateOptions(translDataMap) {
        if (translDataMap.keys().length === 0) {
          return
        }
        // 将Map对象转成List
        let translDataList = []
        translDataMap.forEach(item => translDataList.push(item))
        putAction(this.url.translateColumns, translDataList).then(res => {
          if (res.success) {
            this.translateOptions = {
              ...this.translateOptions,
              ...res.result
            }
          } else {
            console.error(res.message)
          }
        })
      },

      /** 加载字典选项 */
      loadDictOptions(dictCodes = []) {
        dictCodes.forEach(async dictCode => {
          let options = await getDictItems(dictCode)
          this.$set(this.dictOptions, dictCode, options)
        })
      },
      /** 加载远程选项 */
      loadRemoteOptions(remoteOptions = []) {
        remoteOptions.forEach(async element => {
          let { key, options } = element
          let { remoteFunc, props } = options
          remoteFunc = remoteFunc.trim()
          // 内部请求直接请求，外部请求需要中转
          let response
          if (/^https?/.test(remoteFunc)) {
            response = await transitRESTful.get(remoteFunc)
          } else {
            response = await getAction(remoteFunc)
          }
          let remoteOptions = null
          // 返回值可能存在的情况：
          // 1、直接返回了个数组
          // 2、result是个数组
          // 3、result.records是个数组（后台包裹了分页对象）
          if (Array.isArray(response)) {
            remoteOptions = response
          } else if (response.success) {
            if (Array.isArray(response.result)) {
              remoteOptions = response.result
            } else if (response.result && Array.isArray(response.result.records)) {
              remoteOptions = response.result.records
            }
          }
          if (remoteOptions == null) {
            console.error('远端数据请求失败：', response)
            return Promise.reject(response)
          }
          remoteOptions = remoteOptions.map(item => {
            return {
              value: item[props.value],
              label: item[props.label],
              text: item[props.label],
              // children: item[options.props.children]
            }
          })
          this.$set(this.remoteOptionsMap, key, remoteOptions)
          // 由于可能在加载完高级查询时还没有加载出远程数据，所以需要同步更新下
          for (let field of this.squeryFieldList) {
            if (field.remoteOptionsKey === key) {
              field.options = remoteOptions
              break
            }
          }
        })
      },

      handleAdd() {
        this.$refs.desformModal.open('add', this.addressCode, null, '新增数据')
      },

      handleView(record) {
        this.$refs.desformModal.open('detail', this.addressCode, record.id, '查看数据')
      },
      handleEdit(record) {
        this.$refs.desformModal.open('edit', this.addressCode, record.id, '编辑数据')
      },
      handleGetEditUrl(record) {
        let url = `/online/desform/view/${this.addressCode}?did=${record.id}`
        this.$info({
          width: 800,
          title: '编辑地址',
          content: url,
          okText: '确定',
          maskClosable: true
        })
      },

      handleAutoModalOk() {
        this.loadDataThis()
      },

      handleDelete(id) {
        this.doDelete(this.url.delete, { id })
      },

      handleDeleteBatch() {
        if (this.selectedRowKeys.length === 0) {
          this.$message.warning('没有选中任何记录')
          return
        }
        let ids = this.selectedRowKeys.join(',')
        this.$confirm({
          title: '确认删除',
          content: '是否删除选中的数据？',
          onOk: () => {
            this.doDelete(this.url.deleteBatch, { ids })
          }
        })
      },

      doDelete(url, data) {
        return deleteAction(url, data).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.loadDataThis()
            this.selectedRowKeys = []
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      // 分页时触发
      handleTableChange(pagination) {
        this.ipagination = pagination
        this.loadDataThis()
      },
      // 高级查询
      handleSuperQuery(params, matchType) {
        if (!params || params.length === 0) {
          this.superQueryParams = ''
          this.superQueryFlag = false
        } else {
          this.superQueryFlag = true
          this.superQueryParams = JSON.stringify(params)
        }
        this.superQueryMatchType = matchType

        this.loadDataThis()
      },
      // 获取高级查询条件
      getQueryParams() {
        let sqp = {}
        if (this.superQueryParams) {
          sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        }
        let params = Object.assign(sqp, this.queryParam, this.isorter, this.filters)

        params.field = 'id'
        this.columns.forEach(function (column) {
          if (column.dataIndex) params.field += ',' + column.dataIndex
        })

        params.matchType = this.superQueryMatchType

        return filterObj(params)
      },

      getColumnSettingKey() {
        return this.$route.fullPath + '$ColumnSetting'
      },
      getColumnSetting() {
        const key = this.getColumnSettingKey()
        return this.$ls.get(key) || []
      },
      setColumnSetting(selectedKeys) {
        const key = this.getColumnSettingKey()
        this.$ls.set(key, selectedKeys, 7 * 24 * 60 * 60 * 1000)
      },

      handleClickReload() {
        this.loadDataThis()
      },

      handleCustomColumnChange(checkedValues) {
        // 去掉特殊列
        let fixed = checkedValues.filter(v => this.fixedColumnKeys.includes(v))
        let selected = checkedValues.filter(v => !this.fixedColumnKeys.includes(v))

        if (selected.length <= 0) {
          this.$message.warn('请至少留一项非特殊字段的列')
          return
        }
        this.setColumnSetting(checkedValues)
        this.selectedColumnKeys = checkedValues

        // 删选普通字段
        let columns = this.allColumns.filter(item => item.ignore ? false : selected.includes(item.dataIndex))

        if (fixed.includes('$rowNumber$')) {
          this.columns = [Object.assign({}, this.fixedColumns.rowIndex)].concat(columns)
        } else {
          this.columns = columns
        }
        if (fixed.includes('$action$')) {
          this.columns.push(Object.assign({}, this.fixedColumns.action))
        }
        // this.tableScroll.x = this.columns.length * this.tableColumnWidth
        // 处理特殊字段
        this.showRowSelection = fixed.includes('$selection$')
      },

      handleExportXls() {
        this.loading = true
        let fileName = this.desformName + '.xls'

        //支持选择行导出
        let selectionIds
        if(this.selectedRowKeys && this.selectedRowKeys.length>0){
          selectionIds = this.selectedRowKeys.join(",")
        }

        downloadFile(this.url.exportXls(this.desformCode), fileName, {
          desformCode: this.desformCode,
          superQuery: this.getQueryParams(),
          selectionIds: selectionIds,
          pageNo: this.ipagination.current,
          pageSize: this.ipagination.pageSize
        }).finally(() => {
          this.loading = false
        })
      },

      handleImportXls() {
        this.$refs.importModal.show()
      },

      handleImportOk() {
        this.loadDataThis()
      },

      getPictureSrc(pictureList) {
        return pictureList[0].url
      },

      downloadRowFile(fileList) {
        this.loading = true
        let count = 0
        for (let file of fileList) {
          let url = getFileAccessHttpUrl(file.url)
          count++
          downloadFile(url, file.name).finally(() => {
            if (--count === 0) {
              this.loading = false
            }
          })
        }
      },
      getPcaText(code){
        return this.mixin_pca.getText(code);
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
<style scoped lang="less">
  .j-table-slot-view {
    font-size: 12px;
    font-style: italic;

    img {
      max-width: 80px;
      max-height: 25px;
    }
  }

  .j-table-slot-view-color {
    width: 25px;
    height: 25px;
    margin: 0 auto;
  }

</style>