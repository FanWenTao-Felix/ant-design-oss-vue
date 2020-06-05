<template>
  <a-drawer
    :title="title"
    :width="800"
    :visible="visible"
    placement="right"
    :closable="false"
    @close="handleCancel"
  >

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="8" :sm="24">
            <a-form-item label="路由名称">
              <a-input placeholder="请输入路由名称" v-model="queryParam.routeName"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="跳转类型">
              <j-dict-select-tag dictCode="desform_route_type" placeholder="请选择跳转类型" v-model="queryParam.routeType"/>
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
      <a-alert type="info" showIcon style="margin-bottom: 16px;">
        <template slot="message">
          <span>已选择</span>
          <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
          <span>项</span>
          <a v-if="selectedRowKeys.length" style="margin-left: 12px" @click="onClearSelected">清空</a>
        </template>
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
        :rowSelection="{selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >

        <template slot="switch" slot-scope="text,record">
          <a-switch size="small" :checked="record['status'] === 1" @change="handleUpdateStatus(record)"/>
        </template>

        <template slot="ellipsis" slot-scope="text">
          <ellipsis :length="18">{{text}}</ellipsis>
        </template>

        <template slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗？" placement="left" @confirm="handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </template>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <design-form-route-modal ref="modalForm" :desformId="desformId" :desformCode="desformCode" @ok="modalFormOk"/>

    <div class="drawer-bottom">
      <a-button :disabled="loading" @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="loading" @click="handleOk">确定</a-button>
    </div>

  </a-drawer>
</template>

<script>
  import Ellipsis from '@/components/Ellipsis'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import DesignFormRouteModal from './DesignFormRouteModal'

  export default {
    name: 'DesignFormRouteDrawer',
    mixins: [JeecgListMixin],
    components: { Ellipsis, DesignFormRouteModal },
    data() {
      return {
        description: '下一步路由配置列表页面',
        disableMixinCreated: true,
        title: '下一步路由配置',
        visible: false,
        desformId: '',
        desformCode: '',
        // 表头
        columns: [
          {
            title: '启用',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            scopedSlots: { customRender: 'switch' },
          },
          {
            title: '路由名称',
            align: 'center',
            dataIndex: 'routeName'
          },
          {
            title: '跳转类型',
            align: 'center',
            dataIndex: 'routeType_dictText'
          },
          {
            title: '路由地址',
            align: 'center',
            dataIndex: 'routePath',
            scopedSlots: { customRender: 'ellipsis' }
          },
          {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
      }
    },
    computed: {
      // 请求地址
      url() {
        let prefix = '/desform/route'
        return {
          list: `${prefix}/list?desformCode=${this.desformCode}`,
          delete: `${prefix}/delete`,
          deleteBatch: `${prefix}/deleteBatch`,
          edit: `${prefix}/edit`,
        }
      },
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      },

    },
    created() {
    },
    methods: {

      open(record) {
        this.desformId = record.id
        this.desformCode = record.desformCode
        this.loadData(1)
        this.visible = true
      },
      close() {
        if (!this.loading) {
          this.visible = false
          this.$emit('close')
        }
      },
      handleOk() {
        this.close()
      },
      handleCancel() {
        this.close()
      },

      handleUpdateStatus(record) {
        this.loading = true
        this.$http.put(this.url.edit, {
          id: record.id,
          status: (record.status === 1 ? 0 : 1),
          desformId: this.desformId,
          desformCode: this.desformCode,
        }).then(({ success, message }) => {
          if (success) {
            this.loadData()
          } else {
            this.$warning({ title: '操作失败', content: message })
          }
        }).catch(e => {
          console.error(e)
          this.$error({ title: '操作失败', content: (e.message || e) })
        }).finally(() => {
          this.loading = false
        })
      },

    }
  }
</script>
<style lang="less" scoped>
  .drawer-bottom {
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 4px 4px;

    /deep/ .ant-btn {
      margin-right: 8px;
    }
  }
</style>
<style scoped>
  @import '~@assets/less/common.less';
</style>