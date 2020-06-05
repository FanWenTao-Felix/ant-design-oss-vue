<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="formId">
              <a-input placeholder="请输入formId" v-model="queryParam.formId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="流程ID">
              <a-input placeholder="请输入流程ID" v-model="queryParam.processId"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="8" >
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

      </a-table>
    </div>
    <!-- table区域-end -->
  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util'
  import { deleteAction,getAction } from '@/api/manage'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "ExtActProcessNodeDeploymentList",
    mixins: [JeecgListMixin],
    components: {
    },
    data () {
      return {
        description: '流程节点部署表管理页面',
        // 查询条件
        queryParam: {},
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
		  {
            title: 'formId',
            align:"center",
            dataIndex: 'formId'
          },
		  {
            title: '流程ID',
            align:"center",
            dataIndex: 'processId'
          },
		  {
            title: '节点CODE',
            align:"center",
            dataIndex: 'processNodeCode'
          },
		  {
            title: '节点名称',
            align:"center",
            dataIndex: 'processNodeName'
          },
		  {
            title: 'modelAndView',
            align:"center",
            dataIndex: 'modelAndView'
          },
		  {
            title: '外部表单跳转方法(移动端)',
            align:"center",
            dataIndex: 'modelAndViewMobile'
          },
		  {
            title: '节点任务超时设置（单位时）',
            align:"center",
            dataIndex: 'nodeTimeout'
          },
		  {
            title: '流程状态',
            align:"center",
            dataIndex: 'nodeBpmStatus'
          },
		  {
            title: '部署id',
            align:"center",
            dataIndex: 'deploymentId'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
		    url: {
          list: "/process/extActProcessNodeDeployment/list",
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