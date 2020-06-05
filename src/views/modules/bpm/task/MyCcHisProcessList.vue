<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="流程编号">
              <a-input placeholder="请输入流程编号查询" v-model="queryParam.processDefinitionId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入流程名称查询" v-model="queryParam.processDefinitionName"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: right;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->

    <!-- table区域-begin -->
    <div>
      <a-table
        ref="table"
        bordered
        :scroll="{x: 1800}"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <a  @click="showHistory(record)">
                查看审批
            </a>
        </span>

        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <j-ellipsis :value="text" :length="15"/>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 弹出框 -->
    <his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util'
  import { getAction,postAction } from '@/api/manage'
  import HisTaskDealModal from "./HisTaskDealModal";
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {BpmNodeInfoMixin} from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'

  export default {
    name: 'MyCcHisProcessList',
    mixins: [JeecgListMixin,BpmNodeInfoMixin],
    components: {
      HisTaskDealModal,
      JEllipsis
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {},
        dataSource: [],
        loading: false,
        columns: [
          {
            title: '#',
            dataIndex: '',
            width: 60,
            key: 'rowIndex',
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '业务标题',
            align: 'center',
            dataIndex: 'bpmBizTitle',
            scopedSlots: { customRender: 'bpmBizTitle' }
          }, {
            title: '流程编号',
            align: 'center',
            dataIndex: 'processDefinitionId'
          },{
            title: '流程名称',
            align: 'center',
            dataIndex: 'processDefinitionName'
          },{
            title: '流程实例',
            align: 'center',
            dataIndex: 'processInstanceId'
          },{
            title: '任务名称',
            align: 'center',
            dataIndex: 'taskName'
          },{
            title: '发起人',
            align: 'center',
            dataIndex: 'processApplyUserName'
          }, {
            title: '办理人',
            align: 'center',
            dataIndex: 'taskAssigneeName'
          }, {
            title: '开始时间',
            align: 'center',
            dataIndex: 'taskBeginTime'
          }, {
            title: '结束时间',
            align: 'center',
            dataIndex: 'taskEndTime'
          }, {
            title: '耗时',
            align: 'center',
            dataIndex: 'durationStr'
          },
          {
            title: '操作',
            dataIndex: 'action',
            fixed: 'right',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 100
          }

        ],
        url: {
          list:"/act/task/taskAllCcHistoryList",
        },
        path:"modules/bpm/task/form/FormLoading",
        formData:{},

      }
    },
    methods: {
      // 历史
      showHistory(record){
        this.getHisProcessNodeInfo(record);
      },
    }

  }
</script>
<style scoped>
  .ant-card-body {
    margin-bottom: 18px;
  }

  .table-operator button {
    margin-bottom: 18px;
    margin-right: 5px;
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

  .anty-img-wrap {
    height: 25px;
    position: relative;
  }

  .anty-img-wrap > img {
    max-height: 100%;
  }
</style>