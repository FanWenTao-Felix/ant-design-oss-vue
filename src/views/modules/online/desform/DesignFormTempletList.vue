<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="模板名称">
              <a-input placeholder="请输入模板名称" v-model="queryParam.templetName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="模板编码">
              <a-input placeholder="请输入模板编码" v-model="queryParam.templetCode"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a v-if="false" @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('表单设计器模板表')">导出</a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
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
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        <span>已选择</span>
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>
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

        <template slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical"/>
          <a @click="handleDesignForm(record)">
            <a-icon type="setting"/>
            <span style="padding-left: 4px;">设计模板</span>
          </a>


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
        </template>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <designFormTemplet-modal ref="modalForm" @ok="modalFormOk" />

    <!-- 设计表单 -->
    <designForm-modal ref="designFormModal" :templet="true" @ok="modalFormOk"/>

  </a-card>
</template>

<script>
  import DesignFormTempletModal from './modules/DesignFormTempletModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import DesignFormModal from './modules/DesignFormModal'

  export default {
    name: 'DesignFormTempletList',
    mixins: [JeecgListMixin],
    components: {
      DesignFormModal,
      DesignFormTempletModal
    },
    data() {
      return {
        description: '表单设计器模板表管理页面',
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
            title: '模板名称',
            align: 'center',
            dataIndex: 'templetName'
          },
          {
            title: '模板编码',
            align: 'center',
            dataIndex: 'templetCode'
          },
          {
            title: '创建时间',
            width: 260,
            align: 'center',
            dataIndex: 'createTime'
          },
          {
            title: '修改时间',
            width: 260,
            align: 'center',
            dataIndex: 'updateTime'
          },
          {
            title: '操作',
            width: 240,
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/desform/templet/list',
          delete: '/desform/templet/delete',
          deleteBatch: '/desform/templet/deleteBatch',
          exportXlsUrl: '/desform/templet/exportXls',
          importExcelUrl: '/desform/templet/importExcel'
        }
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    methods: {


      handleDesignForm(record) {
        console.log('record', record)
        this.$refs.designFormModal.open(record)
      }


    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>