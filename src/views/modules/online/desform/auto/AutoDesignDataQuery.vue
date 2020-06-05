<template>
  <a-card :bordered="false">
    <template v-if="error.notDesignForm">
      <h1 style="text-align: center">你还没有设计任何表单项，不能查看表单数据！</h1>
    </template>

    <template v-else>
      <!-- 操作按钮区域 -->
      <div class="table-operator" style="margin-bottom: 18px;">
        <!-- 查询页面暂时屏蔽操作
        <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
        -->
        <span style="color:#060606">请选择工单： </span>
        <a-select
          class="search-input"
          showSearch
          :showArrow="false"
          placeholder="搜索表单"
          optionFilterProp="children"
          :filterOption="filterOption"
          @change="desFormChange"
          v-model="desFormValue">
          <a-select-option v-for="(site,index) in desFormOptions" :key="index" :value="site.value">{{site.text}}</a-select-option>
        </a-select>
        <!-- 高级查询 -->
        <j-super-query style="margin-left: 10px;" ref="supQuery" :fieldList="squeryFieldList" :saveCode="superQuerySaveCode" :loading="loading" @handleSuperQuery="handleSuperQuery"/>

        <!-- 批量操作 -->
        <!-- 查询页面暂时屏蔽操作
        <a-dropdown v-if="selectedRowKeys.length > 0">
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
        -->

      </div>

      <!-- table区域-begin -->
      <div>

        <a-alert type="info" showIcon style="margin-bottom: 16px;">

          <a-row slot="message">
            <a-col :span="12">
              <span>已选择</span>
              <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
              <span>项</span>
              <a style="margin-left: 12px" @click="selectedRowKeys=[]">清空</a>
            </a-col>
            <a-col :span="12" style="text-align: right">
              <a @click="handleClickReload">
                <a-icon type="sync"/>
                <span style="margin-left:4px;">刷新</span>
              </a>
              <a-divider type="vertical"/>
              <a-popover title="自定义列" trigger="click" placement="leftBottom">
                <a-checkbox-group slot="content" :value="selectedColumnKeys" @change="handleCustomColumnChange">
                  <a-row style="width: 700px;">
                    <a-col :span="24/3">
                      <a-checkbox value="$selection$">选择列</a-checkbox>
                    </a-col>
                    <a-col :span="24/3">
                      <a-checkbox value="$rowNumber$">行号列</a-checkbox>
                    </a-col>
                    <a-col :span="24/3">
                      <a-checkbox value="$action$">操作列</a-checkbox>
                    </a-col>
                    <a-col :span="24/3" v-for="column in allColumns" :key="column.dataIndex">
                      <a-checkbox :value="column.dataIndex">{{ column.title }}</a-checkbox>
                    </a-col>
                  </a-row>
                </a-checkbox-group>
                <a>
                  <a-icon type="setting"/>
                  <span style="margin-left:4px;">自定义列</span>
                </a>
              </a-popover>
            </a-col>
          </a-row>


        </a-alert>

        <a-table
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

          <template slot="action" slot-scope="text, record">
            <a @click="handleView(record)">查看</a>

            <!--  查询页面暂时屏蔽操作
            <a-divider type="vertical"/>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical"/>
            <a @click="handleGetEditUrl(record)">获取编辑地址</a>
            <a-divider type="vertical"/>
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
            -->
          </template>

        </a-table>
      </div>
      <!-- table区域-end -->

      <!-- 表单区域 -->
      <auto-desform-data-modal ref="desformModal" :dialogOptions="dialogOptions" @close="handleClose"/>
    </template>

  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util'
  import { getAction, deleteAction } from '@/api/manage'
  import JSuperQuery from '@/components/jeecg/JSuperQuery'
  import AutoDesformDataModal from './modules/AutoDesformDataModal'
  import {initDictOptions} from '@/components/dict/JDictSelectUtil'
  import { recursiveAllWidget } from '../util/desformUtil'

  export default {
    name: 'AutoDesignDataForm',
    components: { AutoDesformDataModal, JSuperQuery },
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
            fixed: 'left',
            customRender: (t, r, i) => ++i
          },
          action: {
            title: '操作',
            key: 'action',
            width: 180,
            align: 'center',
            fixed: 'right',
            scopedSlots: { customRender: 'action' }
          }
        },
        fixedColumnKeys: ['$selection$', '$rowNumber$', '$action$'],
        tableColumnWidth: 200,
        tableScroll: { x: false },

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
        superQuerySaveCode: this.desformCode,
        // 请求参数
        url: {
          queryById: '/desform/queryById',
          list: '/desform/data/list',
          queryByCode: '/desform/queryByCode',
          delete: '/desform/data/delete',
          deleteBatch: '/desform/data/deleteBatch'
        },
        error: {
          notDesignForm: false
        },
        desFormOptions:[],
        desFormValue:''
      }
    },
    watch: {
      '$route'(val) {
        // 刷新参数放到这里去触发，就可以刷新相同界面了
        if (val.path.indexOf('/online/desform/list/') === 0) {
          // console.log('/online/desform/list/ 是当前页面，更新路由')
          this.reload()
        }
      }
    },
    computed: {
      rowSelection() {
        return this.showRowSelection ? {
          selectedRowKeys: this.selectedRowKeys,
          onChange: (rowKeys) => this.selectedRowKeys = rowKeys
        } : null
      },
    },
    created() {
      this.initDictConfig()
    },
    mounted() {
      this.reload()
    },

    methods: {
      initDictConfig() {
        //初始化字典 - 表单数据
        initDictOptions('design_form,desform_name,desform_code').then((res) => {
          if (res.success) {
            this.desFormOptions = res.result
            let code = this.desFormOptions[0].value;
            this.desFormValue = code;
            this.reload(code);
          }
        });
      },
      reload(val) {
        // 初始化
        this.pageLoading = true
        this.columns = []
        this.dataSource = []
        this.selectedRowKeys = []
        this.ipagination.current = 1
        this.superQueryParams = ''
        this.superQueryFlag = false
        // 加载新数据
        let code = val;//this.$route.params.code
        this.desformCode = null
        this.addressCode = code
        if (this.addressCode) {
          this.loadColumnsInfo(code)
        }else{
          this.pageLoading = false
        }
      },

      loadColumnsInfo(code) {
        this.loading = true
        return getAction(this.url.queryByCode, {
          desformCode: code
        }).then(res => {
          if (res.success) {
            let { result } = res
            this.desformCode = result.desformCode
            // 判断是否是子表
            if (result.desformType === 2) {
              this.desformCode = result.parentCode
              return this.loadColumnsInfo(result.parentCode)
            }
            let designJson = result.desformDesignJson
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

            /** 封装column，同时封装高级查询条件 */
            const packageColumn = (item) => {
              // 忽略部分显示
              let ignores = ['button', 'buttons', 'grid', 'card', 'tabs', 'text', 'sub-table-design', 'divider']
              if (ignores.indexOf(item.type) === -1) {
                let name = (item.name.trim()) || item.model
                let column = {
                  title: name,
                  align: 'center',
                  dataIndex: item.model
                }
                // 判断是否为 select 就自定义输出内容（可输出字典
                if (item.type === 'select' && item.options.showLabel) {
                  column.customRender = (text, record, index) => {
                    for (let option of item.options.options) {
                      if ((option.value || '').toString() === (text || '').toString()) {
                        return option.label
                      }
                    }
                    return text
                  }
                }

                // column 只显示五个
                if (selectedColumnKeys.length < 5) {
                  selectedColumnKeys.push(column.dataIndex)
                }
                allColumns.push(column)

                superQuery.push({
                  type: item.type,
                  value: item.model,
                  text: name,
                  dictCode: item.options.dictCode,
                  dictTable: item.options.dictTable,
                  customReturnField: item.options.customReturnField
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
            this.dataSource = res.result.records.map(item => {
              return {
                id: item.id,
                ...JSON.parse(item.desformDataJson)
              }
            })
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

      handleAdd() {
        if(this.addressCode){
          this.$refs.desformModal.open('add', this.addressCode, null, '新增数据')
        }else{
          this.$message.warn("请选择类型!")
        }
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

      handleClose() {
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
        if(!this.desformCode){
          return;
        }
        if (!params || params.length === 0) {
          this.superQueryParams = ''
          this.superQueryFlag = false
        } else {
          this.superQueryFlag = true
          this.superQueryParams = JSON.stringify(params)
        }
        this.superQueryMatchType = matchType
        this.ipagination.current = 1
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
        return this.desformCode + '$ColumnSetting'
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
        if(this.desformCode){
          this.loadDataThis()
        }else{
          this.$message.warn("请选择类型!")
        }
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
        this.tableScroll.x = this.columns.length * this.tableColumnWidth
        // 处理特殊字段
        this.showRowSelection = fixed.includes('$selection$')
      },
      desFormChange(val){
        this.desformCode = val;
        if(this.desformCode){
          this.selectedColumnKeys = this.getColumnSetting()
          this.$refs.supQuery.handleReset();
        }
        this.reload(val)
      },
      filterOption(input, option) {
        return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      },
    }
  }
</script>
<style lang="less" scoped>
  .table-operator .search-input {
    width: 180px;
  }

</style>
<style scoped>
  @import '~@assets/less/common.less';
</style>