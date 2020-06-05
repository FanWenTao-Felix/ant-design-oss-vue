<template>
  <div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="流程编号">
              <a-input placeholder="请输入流程编号" v-model="queryParam.processDefinitionId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入流程名称" v-model="queryParam.processDefinitionName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label="任务发起人">
              <a-input-search placeholder="选择任务发起人" readOnly @search="handleSelect" v-model="model.userName">
                <a-button slot="enterButton" icon="search">选择</a-button>
              </a-input-search>
            </a-form-item>
          </a-col>

          <a-col :md="4" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- table区域-begin -->
    <div>

      <a-table
        :scroll="{x: 1800}"
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <template v-if="record.taskAssigneeName&&record.taskAssigneeName!=''">
            <a  @click="handleProcess(record)">
              办理
            </a>
            <a-divider type="vertical" />
            <a  @click="selectEntruster(record)">
              委托
            </a>
          </template>
          <template v-else>
            <a  @click="handleClaim(record)" >
              签收
            </a>
          </template>

        </span>
        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <a-icon title="催办提醒" v-if="record.taskUrge" theme="twoTone" twoToneColor="#eb2f96"  @click="taskNotify(record)" type="notification"/>
          <j-ellipsis :value="text" :length="15"/>
        </span>

      </a-table>
    </div>
    <!-- 弹出框 -->
    <task-deal-modal ref="taskDealModal" :path="path" :formData="formData" @ok="handleOk"></task-deal-modal>
    <select-entruster-modal ref="selectEntrusterModal" @selectFinished="handleEntruster"></select-entruster-modal>
    <task-notify-me-modal ref="taskNotifyMeModal"></task-notify-me-modal>
    <select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></select-single-user-modal>
  </div>
</template>

<script>
  import { filterObj } from '@/utils/util'
  import { deleteAction,getAction,postAction,putAction } from '@/api/manage'
  import TaskDealModal from "./TaskDealModal";
  import SelectEntrusterModal from "./form/SelectEntrusterModal";
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {BpmNodeInfoMixin} from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'
  import TaskNotifyMeModal from "../../extbpm/process/TaskNotifyMeModal.vue";
  import SelectSingleUserModal from "./form/SelectSingleUserModal.vue";

  export default {
    name: "MyRunningTaskList",
    mixins: [JeecgListMixin,BpmNodeInfoMixin],
    components: {
      SelectSingleUserModal,
      TaskNotifyMeModal,
      SelectEntrusterModal,
      TaskDealModal,
      JEllipsis
    },
    data () {
      return {
        description: '我的任务',
        // 查询条件
        queryParam: {},
        model:{
          userName:""
        },
        // 表头
        columns: [
          {
            title: '#',
            width: 60,
            dataIndex: '',
            key: 'rowIndex',
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          }, {
            title: '业务标题',
            align: 'center',
            dataIndex: 'bpmBizTitle',
            scopedSlots: { customRender: 'bpmBizTitle' }
          },{
            title: '流程编号',
            align: 'center',
            dataIndex: 'processDefinitionId'
          }, {
            title: '任务ID',
            align: 'center',
            dataIndex: 'taskId'
          }, {
            title: '流程名称',
            align: 'center',
            dataIndex: 'processDefinitionName'
          }, {
            title: '流程实例',
            align: 'center',
            dataIndex: 'processInstanceId'
          }, {
            title: '发起人',
            align: 'center',
            dataIndex: 'processApplyUserName'
          }, {
            title: '开始时间',
            align: 'center',
            dataIndex: 'taskBeginTime'
          }, {
            title: '当前环节',
            align: 'center',
            dataIndex: 'taskName'
          },{
            title: '操作',
            align: 'center',
            dataIndex: 'action',
            fixed: 'right',
            width:150,
            scopedSlots: {customRender: 'action'}
          }
        ],
        path:"modules/bpm/task/form/FormLoading",
        formData:{},
		    url: {
          list: "/act/task/list",
          claim: "/act/task/claim",
          taskEntrust:"/act/task/taskEntrust",
        },
        taskId:'',
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
        this.queryParam.userName = data.username;
      },
      handleSelect: function(){
        this.$refs.selectSingleUserModal.select();
      },
      handleProcess(record){
        this.getProcessNodeInfo(record);
      },
      handleClaim(record){
        var that = this;
        var params = {taskId:record.id};//查询条件
        this.$confirm({
          title:"确认签收吗",
          content:"是否签收该任务?",
          onOk: function(){
            putAction(that.url.claim, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
              } else {
                that.$message.warning(res.message);
                that.loadData();
              }
            })
          }
        });
      },
      handleOk(){
        this.loadData();
      },
      selectEntruster(record){
        this.taskId = record.id;
        this.$refs.selectEntrusterModal.select(record);
        this.$refs.selectEntrusterModal.title="选择委托人";
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
      //催办
      taskNotify(record){
        this.$refs.taskNotifyMeModal.notify(record);
        this.$refs.taskNotifyMeModal.title="催办提醒";
      },
    }
  }
</script>
<style lang="less" scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
</style>