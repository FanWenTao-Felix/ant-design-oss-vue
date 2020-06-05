<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">


          <a-col :md="6" :sm="8">
            <a-form-item label="申请编号">
              <a-input placeholder="请输入申请编号" v-model="queryParam.applyNo"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="名称">
              <a-input placeholder="请输入名称" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="请假类别">
              <a-select v-model="queryParam.leaveCategory" placeholder="请选择请假类别">
                <a-select-option value="">请选择</a-select-option>
                <a-select-option class="radioGroup" value="1">病假</a-select-option>
                <a-select-option class="radioGroup" value="2">事假</a-select-option>
                <a-select-option class="radioGroup" value="3">年假</a-select-option>
                <a-select-option class="radioGroup" value="4">婚假</a-select-option>
                <a-select-option class="radioGroup" value="5">产假</a-select-option>
                <a-select-option class="radioGroup" value="6">丧假</a-select-option>
                <a-select-option class="radioGroup" value="7">探亲假</a-select-option>
                <a-select-option class="radioGroup" value="8">护理假</a-select-option>
                <a-select-option class="radioGroup" value="9">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8" >
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
          <a v-if="showClaimButton(record.assignee)" @click="handleClaim(record)">签收</a>
          <a v-else @click="handleProcess(record)">办理</a>
          <a-divider type="vertical" />
          <a @click="handlePreviewPic(record)">审批进度</a>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <joaEmployeeLeave-modal ref="modalForm" @ok="modalFormOk"></joaEmployeeLeave-modal>
    <ext-act-process-inst-pic-modal ref="extActProcessInstPicModal"></ext-act-process-inst-pic-modal>


    <bpm-biz-task-deal-modal :path="path" :formData="formData" ref="taskDealModal" @ok="taskOk" />
  </a-card>
</template>

<script>
  import JoaEmployeeLeaveModal from './modules/JoaEmployeeLeaveModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { postAction,putAction,getAction } from '@/api/manage'
  import ExtActProcessInstPicModal from "../process/modules/ExtActProcessInstPicModal";
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'

  import BpmBizTaskDealModal from '@/views/modules/bpmbiz/common/BpmBizTaskDealModal'

  export default {
    name: "JoaEmployeeLeaveList",
    mixins:[JeecgListMixin],
    components: {
      ExtActProcessInstPicModal,
      JoaEmployeeLeaveModal,
      BpmBizTaskDealModal
    },
    data () {
      return {
        description: '请假申请表管理页面',
        bpmStatusDictOptions:[],
        // 表头
        columns: [{
          title: '任务名称',
          align:"center",
          dataIndex: 'taskName'
        },{
            title: '申请编号',
            align:"center",
            dataIndex: 'applyNo'
          }, {
            title: '名称',
            align:"center",
            dataIndex: 'name'
           }, {
            title: '申请日期',
            align:"center",
            dataIndex: 'applyDate'
           },{
            title: '请假类别',
            align:"center",
            dataIndex: 'leaveCategory',
            customRender:function(text){
              if(text==1){
                return "病假";
              }else if(text==2){
                return "事假";
              }else if(text==3){
                return "年假";
              }else if(text==4){
                return "婚假";
              }else if(text==5){
                return "产假";
              }else if(text==6){
                return "丧假";
              }else if(text==7){
                return "探亲假";
              }else if(text==8){
                return "护理假";
              }else if(text==9){
                return "其他";
              }else{
                return text;
              }
            }
           },{
            title: '请假开始时间',
            align:"center",
            dataIndex: 'leaveStartDate'
           },{
            title: '请假结束时间',
            align:"center",
            dataIndex: 'leaveEndDate'
           },
          {
            title: '流程状态',
            align:"center",
            dataIndex: 'bpmStatus',
            customRender: (text) => {
              //字典值替换通用方法
              console.log(this.bpmStatusDictOptions)
              return filterDictText(this.bpmStatusDictOptions, text);
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        flowCode:"joa_leave_01",
        url: {
          list: "/joa/joaEmployeeLeave/taskList",
          delete: "/joa/joaEmployeeLeave/delete",
          deleteBatch: "/joa/joaEmployeeLeave/deleteBatch",
          startProcess: "/process/extActProcess/startMutilProcess",
        },
        path:"",
        formData:{}
      }
    },
    methods: {
      initDictConfig() {
        //初始化字典
        initDictOptions('bpm_status').then((res) => {
          if (res.success) {
            this.bpmStatusDictOptions = res.result;
          }
        });
      },
      startProcess: function(record){
        var that = this;
        this.$confirm({
          title:"提示",
          content:"确认提交流程吗?",
          onOk: function(){
            var param = {
              flowCode:that.flowCode,
              id:record.id,
              formUrl:"modules/extbpm/joa/modules/JoaEmployeeLeaveForm",
              formUrlMobile:"applyform/leave"
            }
            postAction(that.url.startProcess,param).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              }else{
                that.$message.warning(res.message);
              }
            });
          }
        });
      },
      handlePreviewPic: function(record){
        var flowCode = this.flowCode;
        var dataId = record.id;
        this.$refs.extActProcessInstPicModal.preview(flowCode,dataId);
        this.$refs.extActProcessInstPicModal.title="流程图";
      },

      showClaimButton(assignee){
        if(!assignee){
          return true;
        }
        return false;
      },
      //签收
      handleClaim(record){
        var that = this;
        this.$confirm({
          title:"确认签收吗",
          content:"是否签收该任务?",
          onOk: function(){
            let url = "/act/task/claim"
            putAction(url, {taskId:record.taskId}).then((res) => {
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

      //办理
      handleProcess(record){
        this.loading=true;
        this.getBizProcessNodeInfo(record);
      },
      getBizProcessNodeInfo(record){
        let url = "/process/extActProcessNode/getBizProcessNodeInfo"
        var params = {flowCode:this.flowCode,dataId:record.id};//查询条件
        getAction(url,params).then((res)=>{
          if(res.success){
            console.log("获取流程节点信息",res);
            console.log("表单数据",res.result.records)
            var  data = {
              dataId:res.result.dataId,
              taskId:res.result.taskId,
              flowCode:this.flowCode,
              taskDefKey:res.result.taskDefKey,
              procInsId:res.result.procInsId,
              tableName:res.result.tableName,
              permissionList:res.result.permissionList,
              bizTaskList:res.result.bizTaskList,
              vars:res.result.records
            }
            this.formData = data;
            this.path = res.result.formUrl;
            console.log("------获取流程节点信息>>",data);
            console.log("------流程表单地址>>",this.formUrl);
            this.$refs.taskDealModal.deal(data,this.formUrl);
            this.loading=false;
          }
        })
      },
      taskOk(){
        console.log("流程办理完成")
        this.loadData()
      },


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