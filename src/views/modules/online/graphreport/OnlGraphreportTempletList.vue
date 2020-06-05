<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="组合报表名称">
              <a-input placeholder="请输入组合报表名称" v-model="queryParam.templetName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('在线图表模板')">导出</a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete"/>
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        <span>已选择</span>
        <a style="font-weight: 600">
          {{ selectedRowKeys.length }}
        </a>
        <span>项</span>
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item @click="() =>handleClickPopReportURL(record.id)">配置地址</a-menu-item>
              <a-menu-item @click="() =>handleClickOpenAutoChart(record.id)">功能测试</a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <onlGraphreportTemplet-modal ref="modalForm" @ok="modalFormOk"/>

  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import OnlGraphreportTempletModal from './modules/OnlGraphreportTempletModal'
  import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'OnlGraphreportTempletList',
    mixins: [JeecgListMixin],
    components: {
      OnlGraphreportTempletModal
    },
    data() {
      return {
        description: 'Online报表多数据源主表管理页面',
        displayTemplate: [],
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '组合报表名称',
            align: 'center',
            dataIndex: 'templetName'
          },
          {
            title: '组合报表编码',
            align: 'center',
            dataIndex: 'templetCode'
          },
          {
            title: '组合报表风格',
            align: 'center',
            dataIndex: 'templetStyle',
            customRender: (text) => {
              return filterDictText(this.displayTemplate, text)
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
        // 请求参数
        url: {
          list: '/online/graphreport/templet/list',
          delete: '/online/graphreport/templet/delete',
          deleteBatch: '/online/graphreport/templet/deleteBatch',
          exportXlsUrl: '/online/graphreport/templet/exportXls',
          importExcelUrl: '/online/graphreport/templet/importExcel'
        }
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    methods: {

      initDictConfig() {
        //初始化字典 - 性别
        initDictOptions('online_graph_display_template').then((res) => {
          if (res.success) {
            this.displayTemplate = res.result
          }
        })
      },

      /** 配置地址 */
      handleClickPopReportURL(id) {
        this.$info({
          width: 600,
          title: '配置地址',
          content: this.getReportURL(id),
          okText: '确定',
          maskClosable: true
        })
      },
      handleClickOpenAutoChart(id) {
        this.$router.push({ path: this.getReportURL(id) })
      },
      getReportURL(id) {
        return `/online/graphreport/templet/${id}`
      }

    }
  }
</script>
<style lang="less" scoped>
  @import '~@assets/less/common.less';
</style>