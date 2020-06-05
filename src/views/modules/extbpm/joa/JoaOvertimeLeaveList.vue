<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="申请人">
              <a-input placeholder="请输入申请人" v-model="queryParam.applyUser"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="部门">
              <a-input placeholder="请输入部门" v-model="queryParam.department"></a-input>
            </a-form-item>
          </a-col>
        <template v-if="toggleSearchStatus">
        <a-col :md="6" :sm="8">
            <a-form-item label="申请时间">
              <a-input placeholder="请输入申请时间" v-model="queryParam.applyTime"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="调休时长(天/小时)">
              <a-input placeholder="请输入调休时长(天/小时)" v-model="queryParam.leaveTime"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="调休开始时间">
              <a-input placeholder="请输入调休开始时间" v-model="queryParam.beginTime"></a-input>
            </a-form-item>
          </a-col>
        </template>
          <a-col :md="6" :sm="8" >
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
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
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

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
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
    <joaOvertimeLeave-modal ref="modalForm" @ok="modalFormOk"></joaOvertimeLeave-modal>
  </a-card>
</template>

<script>
  import JoaOvertimeLeaveModal from './modules/JoaOvertimeLeaveModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  export default {
    name: "JoaOvertimeLeaveList",
    mixins:[JeecgListMixin],
    components: {
      JoaOvertimeLeaveModal
    },
    data () {
      return {
        description: '调休申请表管理页面',
        // 表头
        columns: [
          {
            title: '申请人',
            align:"center",
            dataIndex: 'applyUser'
           },
          {
            title: '部门',
            align:"center",
            dataIndex: 'department'
           },
          {
            title: '申请时间',
            align:"center",
            dataIndex: 'applyTime',
           },
          {
            title: '调休时长',
            align:"center",
            dataIndex: 'leaveTime'
           },
          {
            title: '调休开始时间',
            align:"center",
            dataIndex: 'beginTime'
           },
          {
            title: '调休结束时间',
            align:"center",
            dataIndex: 'endTime'
           },
          {
            title: '调休期间联系方式',
            align:"center",
            dataIndex: 'contactWay'
           },
          {
            title: '工作代理人',
            align:"center",
            dataIndex: 'workAgent'
           },
          {
            title: '工作安排',
            align:"center",
            dataIndex: 'workPlan'
           },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
		url: {
          list: "/joa/joaOvertimeLeave/list",
          delete: "/joa/joaOvertimeLeave/delete",
          deleteBatch: "/joa/joaOvertimeLeave/deleteBatch",
        },
      }
    },
    methods: {

    }
  }
</script>
<style lang="less" scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>