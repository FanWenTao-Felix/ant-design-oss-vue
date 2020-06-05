<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="创建人名称">
              <a-input placeholder="请输入创建人名称" v-model="queryParam.createName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="更新人名称">
              <a-input placeholder="请输入更新人名称" v-model="queryParam.updateName"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="更新日期">
                <a-input placeholder="请输入更新日期" v-model="queryParam.updateDate"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="8">
              <a-form-item label="所属部门">
                <a-input placeholder="请输入所属部门" v-model="queryParam.sysOrgCode"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="8">
              <a-form-item label="所属公司">
                <a-input placeholder="请输入所属公司" v-model="queryParam.sysCompanyCode"></a-input>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
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
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
        selectedRowKeys.length }}</a>项
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
    <joaDocReceiving-modal ref="modalForm" @ok="modalFormOk"></joaDocReceiving-modal>
  </a-card>
</template>

<script>
  import JoaDocReceivingModal from './modules/JoaDocReceivingModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  export default {
    name: 'JoaDocReceivingList',
    mixins: [JeecgListMixin],
    components: {
      JoaDocReceivingModal
    },
    data() {
      return {
        description: '收文表管理页面',
        // 表头
        columns: [
          {
            title: '来文标题',
            align: 'center',
            dataIndex: 'title'
          },
          {
            title: '登记人',
            align: 'center',
            dataIndex: 'booker'
          },
          {
            title: '文种',
            align: 'center',
            dataIndex: 'classification',
            customRender:function(text){
              if(text==1){
                return "公告";
              }else if(text==2){
                return "通知";
              }else{
                return text;
              }
            }
          },
          {
            title: '缓急程度',
            align: 'center',
            dataIndex: 'urgency',
            customRender:function(text){
              if(text==1){
                return "普通";
              }else if(text==2){
                return "紧急";
              }else if(text==3){
                return "特急";
              }else{
                return text;
              }
            }
          },
          {
            title: '机密度',
            align: 'center',
            dataIndex: 'confidentiality',
            customRender:function(text){
              if(text==1){
                return "普通";
              }else if(text==2){
                return "特急";
              }else if(text==3){
                return "紧急";
              }else{
                return text;
              }

            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/joa/joaDocReceiving/list',
          delete: '/joa/joaDocReceiving/delete',
          deleteBatch: '/joa/joaDocReceiving/deleteBatch'
        }
      }
    },
    methods: {}
  }
</script>
<style lang="less" scoped>
  .ant-card-body .table-operator {
    margin-bottom: 18px;
  }

  .anty-row-operator button {
    margin: 0 5px
  }

  .ant-btn-danger {
    background-color: #ffffff
  }

  .ant-modal-cust-warp {
    height: 100%
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden
  }
</style>