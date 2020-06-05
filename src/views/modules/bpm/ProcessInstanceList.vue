<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="8" :sm="12">
            <a-form-item label="流程实例ID">
              <a-input placeholder="请输入名称查询" v-model="queryParam.processInstanceId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label="流程发起人">
              <a-input-search placeholder="请选择任务发起人" readOnly @search="handleSelect" v-model="model.userName">
                <a-button slot="enterButton" icon="search">选择</a-button>
              </a-input-search>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- table区域-begin -->
    <a-table
      ref="table"
      size="middle"
      bordered
      rowKey="processInstanceId"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      :scroll="{ x: 1500}"
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      @change="handleTableChange">


        <span slot="action" slot-scope="text, record">
            <a-popconfirm v-if="record.isSuspended!=''&& record.isSuspended==='true'" title="确定激活吗?" @confirm="() => handleRestart(record.id)"><a>启动</a></a-popconfirm>
            <a-popconfirm v-if="record.isSuspended!=''&& record.isSuspended==='false'" title="确定挂起吗?" @confirm="() => handleSuspend(record.id)"><a>挂起</a></a-popconfirm>

            <a-divider type="vertical"/>
            <a-dropdown>
              <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
              <a-menu slot="overlay">
                <a-menu-item v-if="record.isSuspended!=''&& record.isSuspended!='finished'">
                  <a-popconfirm title="确定关闭吗?" @confirm="() => handleClose(record.id)"><a>关闭</a></a-popconfirm>
                </a-menu-item>
                <a-menu-item v-if="record.isSuspended!=''&& record.isSuspended==='false'&& record.isSuspended!='finished'"><a @click="selectEntruster(record)">委派</a></a-menu-item>
                <a-menu-item v-if="record.isSuspended!=''"><a @click="handleSkipNode(record.taskId)">跳转</a></a-menu-item>
                <a-menu-item v-if="record.isSuspended!=''"><a @click="showHistory(record)">历史</a></a-menu-item>
              </a-menu>
            </a-dropdown>
        </span>

        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <j-ellipsis :value="text"/>
        </span>

    </a-table>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <upload-process ref="uploadProcess" @ok="okCallback"></upload-process>
    <select-task-node ref="selectTaskNode" @ok="skipNodeCallback" :taskId="selectTaskId"></select-task-node>
    <select-entruster-modal ref="selectEntrusterModal" @selectFinished="handleEntruster"></select-entruster-modal>
    <my-task-form ref="myTaskForm"></my-task-form>
    <!-- 弹出框 -->
    <his-task-deal-modal ref="taskDealModal" :path="path" :formData="formData"></his-task-deal-modal>
    <select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></select-single-user-modal>
  </a-card>
</template>

<script>
  import {filterObj} from '@/utils/util'
  import {deleteAction, getAction,putAction} from '@/api/manage'
  import UploadProcess from './form/UploadProcess'
  import SelectTaskNode from './form/SelectTaskNode'
  import MyTaskForm from '@/views/modules/bpm/task/form/MyTaskForm'
  import SelectEntrusterModal from "./task/form/SelectEntrusterModal.vue";
  import HisTaskDealModal from "./task/HisTaskDealModal";
  import qs from 'qs';
  import JEllipsis from '@/components/jeecg/JEllipsis';
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {BpmNodeInfoMixin} from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'
  import SelectSingleUserModal from "./task/form/SelectSingleUserModal.vue";

  export default {
    name: "ProcessInstanceList",
    mixins: [JeecgListMixin,BpmNodeInfoMixin],
    components: {
      SelectSingleUserModal,
      UploadProcess,
      SelectTaskNode,
      SelectEntrusterModal,
      MyTaskForm,
      HisTaskDealModal,
      JEllipsis
    },
    data() {
      return {
        description: '流程实例管理',
        selectTaskId: '',
        // 查询条件
        queryParam: {},
        model:{
          userName:""
        },
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: "center",
            customRender: function (t, r, index) {
              return parseInt(index) + 1;
            }
          },
          {
            title: '流程名称',
            align: "center",
            dataIndex: 'prcocessDefinitionName',
          },
          {
            title: '业务标题',
            dataIndex: 'bpmBizTitle',
            scopedSlots: { customRender: 'bpmBizTitle' }
          },
          {
            title: '流程ID',
            align: "center",
            dataIndex: 'processDefinitionId',
          },
          {
            title: '流程实例',
            align: "center",
            dataIndex: 'processInstanceId',
          },
          {
            title: '发起人',
            align: "center",
            dataIndex: 'startUserName',
          },
          {
            title: '当前任务',
            align: "center",
            dataIndex: 'name',
          },
          {
            title: '办理人',
            align: "center",
            dataIndex: 'assigneeName',
          },
          {
            title: '开始时间',
            align: "center",
            dataIndex: 'startTime',
          },
          {
            title: '耗时',
            align: "center",
            dataIndex: 'spendTimes',
          },
          {
            title: '状态',
            align: "center",
            dataIndex: 'isSuspended',
            customRender: function (t, r, index) {
              if(t==='true'){
                return '已暂停';
              }else{
                return '已启动';
              }
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            scopedSlots: {customRender: 'action'},
            width: 120,
            fixed: 'right',
          }
        ],
        path:"modules/bpm/task/form/FormLoading",
        formData:{},
        taskId:"",
        url: {
          list: "/act/processInstance/list",
          reassign: "/act/processInstance/reassign",
          suspend: "/act/processInstance/suspend",
          restart: "/act/processInstance/restart",
          close: "/act/processInstance/close",
          skipNode: "/act/processInstance/skipNode",
          taskEntrust:"/act/task/taskEntrust",
        },

      }
    },
    methods: {
      searchReset() {
        this.queryParam = {};
        this.model.userName ="";
        this.loadData(1);
      },
      selectUserOK: function(data){
        this.model.userName = data.realname;
        this.queryParam.startUserId = data.username;
      },
      handleSelect: function(){
        this.$refs.selectSingleUserModal.select();
      },
      okCallback() {
        //重载列表
        this.loadData();
      },
      handleRestart(id) {
        let params = {
          "processInstanceId": id
        }
        getAction(this.url.restart, params).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handleClose(id) {
        let params = {
          "processInstanceId": id
        }
        getAction(this.url.close, params).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handleSuspend(id) {
        let params = {"processInstanceId":id};
        getAction(this.url.suspend,params).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      reassignCallack(userKeys, taskId) {
        let params = {
          taskId: taskId,
          userName: userKeys
        }
        console.log(params)

        getAction(this.url.reassign, params).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      skipNodeCallback(taskNodeValue, taskId) {
        let params = {
          taskId: taskId,
          skipTaskNode: taskNodeValue
        }
        console.log(params)

        getAction(this.url.skipNode, params).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData(1);
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      selectEntruster(record){
        this.taskId = record.taskId;
        this.$refs.selectEntrusterModal.select(record);
        this.$refs.selectEntrusterModal.title="选择委托人提交流程";
      },
      handleEntruster(data){
        var that = this;
        var params = {
          taskId:this.taskId,
          taskAssignee:data.username
        };//查询条件
        console.log("委托",params)
        putAction(that.url.taskEntrust, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
            that.loadData();
          }
        })

      },
      handleSkipNode: function (taskId) {
        this.$refs.selectTaskNode.taskId=taskId;
        this.$refs.selectTaskNode.open();
        this.$refs.selectTaskNode.title = "请选择节点";
      },
      // 历史
      showHistory(record){
        this.getHisProcessNodeInfo(record);
      },
    }
  }
</script>
<style scoped>
  .ant-card-body .table-operator {
    margin-bottom: 18px;
  }

  .ant-table-tbody .ant-table-row td {
    padding-top: 15px;
    padding-bottom: 15px;
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