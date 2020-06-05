<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="图表名称">
              <a-input placeholder="请输入图表名称" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="编码">
              <a-input placeholder="请输入编码" v-model="queryParam.code"></a-input>
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
      <a-button type="primary" icon="download" @click="handleExportXls('在线图表')">导出</a-button>
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

        <template slot="cgrSql" slot-scope="text">
          <j-ellipsis :value="text" :length="80"/>
        </template>

        <template slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">更多
              <a-icon type="down"/>
            </a>
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
        </template>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <onl-graphreport-head-modal ref="modalForm" @ok="modalFormOk"/>

    <!-- 图表配置地址弹框 -->
    <a-modal
      :title="onlineUrlTitle"
      :visible="onlineUrlVisible"
      @cancel="handleOnlineUrlClose">
      <template slot="footer">
        <a-button @click="handleOnlineUrlClose">关闭</a-button>
        <a-button type="primary" class="copy-this-text" :data-clipboard-text="onlineUrl" @click="onCopyUrl">复制</a-button>
      </template>
      <p>{{ onlineUrl }}</p>
    </a-modal>
  </a-card>
</template>

<script>

  import JEllipsis from '@/components/jeecg/JEllipsis'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import OnlGraphreportHeadModal from './modules/OnlGraphreportHeadModal'
  import Clipboard from 'clipboard'

  export default {
    name: 'OnlGraphreportHeadList',
    mixins: [JeecgListMixin],
    components: {
      JEllipsis,
      OnlGraphreportHeadModal
    },
    data() {
      return {
        description: '图表报告管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 50,
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '图表名称',
            align: 'center',
            dataIndex: 'name'
          },
          {
            title: '编码',
            align: 'center',
            dataIndex: 'code'
          },
          {
            title: '数据',
            align: 'left',
            dataIndex: 'cgrSql',
            scopedSlots: { customRender: 'cgrSql' }
          },
          {
            title: 'Y轴文字',
            align: 'center',
            dataIndex: 'yaxisText'
          },
          {
            title: 'X轴字段',
            align: 'center',
            dataIndex: 'xaxisField'
          },
          {
            title: '操作',
            width: 120,
            key: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
        // 请求参数
        url: {
          list: '/online/graphreport/head/list',
          delete: '/online/graphreport/head/delete',
          deleteBatch: '/online/graphreport/head/deleteBatch',
          exportXlsUrl: '/online/graphreport/head/exportXls',
          importExcelUrl: '/online/graphreport/head/importExcel'
        },
        onlineUrlTitle: '',
        onlineUrlVisible: false,
        onlineUrl: '',
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },


    methods: {

      initDictConfig() {
      },

      /** 配置地址 */
      handleClickPopReportURL(id) {
        this.onlineUrl = this.getReportURL(id),
        this.onlineUrlVisible = true
        this.onlineUrlTitle = '配置地址'
      },

      /** 功能测试 */
      handleClickOpenAutoChart(id) {
        this.$router.push({ path: this.getReportURL(id) })
      },

      getReportURL(id) {
        return `/online/graphreport/chart/${id}`
      },
      //关闭配置地址弹框
      handleOnlineUrlClose() {
        this.onlineUrlTitle = ''
        this.onlineUrlVisible = false
      },
      //复制链接
      onCopyUrl(){
        var clipboard = new Clipboard('.copy-this-text')
        clipboard.on('success', () => {
          clipboard.destroy()
          this.$message.success('复制成功')
          this.handleOnlineUrlClose()
        })
        clipboard.on('error', () => {
          this.$message.error('该浏览器不支持自动复制')
          clipboard.destroy()
        })
      },

    }
  }
</script>
<style lang="less" scoped>
  @import '~@assets/less/common.less';
</style>