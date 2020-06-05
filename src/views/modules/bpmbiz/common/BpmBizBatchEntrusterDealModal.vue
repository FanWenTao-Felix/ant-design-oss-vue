<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :visible="visible"
    :title="title"
    width="100%"
    :bodyStyle ="bodyStyle"
    style="top: 0px;"
    :footer="null"
    destroyOnClose
    @cancel="handleModalCancel">
    <a-spin :spinning="confirmLoading">

      <div style="width: 60%;margin:0 auto;">
        <a-divider orientation="left">已选择的单据数据</a-divider>
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="dataId"
          :pagination="false"
          :columns="columns"
          :dataSource="dataSource"
          :loading="loading">
        </a-table>
      </div>


      <div style="width: 60%;margin:0 auto;">
          <a-divider orientation="left">选择委托人</a-divider>
          <a-row>
            <a-col :span="18">
              <a-form-item label="用户名：" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                <a-input-search placeholder="点击选择用户" readOnly @search="handleSelect" v-model="model.userName">
                  <a-button slot="enterButton" icon="search">选择</a-button>
                </a-input-search>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item >
              <a-button type="primary" :disabled="disabledButton" @click="handleBatchEntruster">确认委托</a-button>
              </a-form-item>
            </a-col>
          </a-row>
      </div>

      <div style="width: 60%;margin:0 auto;" v-show="dealStatus">
        <a-divider orientation="left">处理结果</a-divider>
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="dataId"
          :pagination="false"
          :columns="columns2"
          :dataSource="dataSource2"
          :loading="loading">
        </a-table>
      </div>

    </a-spin>
    <biz-select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></biz-select-single-user-modal>
  </a-modal>
</template>

<script>

  import { getAction,putAction } from '@/api/manage'
  import BizSelectSingleUserModal from "../BizSelectSingleUserModal.vue";


  export default {
    name: 'BpmBizBatchEntrusterDealModal',
    components: {
      BizSelectSingleUserModal
    },
    props: ['formData'],
    data() {
      return {
        loading: false,
        title: "批量处理",
        visible: false,
        confirmLoading:false,
        currTask:{},
        bodyStyle:{
          padding: "0",
          height:(window.innerHeight)+"px",
          "overflow-y":"auto"
        },
        url: {
          getBizProcessNodeInfo:"/process/extActProcessNode/getBizProcessNodeInfo",
          taskEntrust:"/act/task/taskEntrust",
        },
        dataSource:[],
        dataSource2:[],
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
            title: '标题',
            align:"center",
            dataIndex: 'bizTitle'
          },
          {
            title: '流程编码',
            align:"center",
            dataIndex: 'flowCode'
          },
          {
            title: '业务key',
            align:"center",
            dataIndex: 'dataId'
          },
          {
            title: '当前环节',
            align:"center",
            dataIndex: 'taskName'
          },
        ],
        columns2: [
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
            title: '标题',
            align:"center",
            dataIndex: 'bizTitle'
          },
          {
            title: '流程编码',
            align:"center",
            dataIndex: 'flowCode'
          },
          {
            title: '业务key',
            align:"center",
            dataIndex: 'dataId'
          },
          {
            title: '当前环节',
            align:"center",
            dataIndex: 'taskName'
          },
          {
            title: '处理状态',
            align:"center",
            dataIndex: 'status',
            customRender:function(text){
              if(text=='1'){
                return "处理成功";
              }else if(text=='0'){
                return "处理失败";
              }else{
                return "待处理";
              }
            }
          },
        ],
        model:{
          userName:""
        },
        userInfo:{},
        dealStatus:false,
        disabledButton:false,
      }
    },
    created() {
    },
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(param){
        this.dealStatus = false;
        this.dataSource =[];
        this.dataSource2 = [];
        this.disabledButton = false;
        this.model.userName='';
        this.userInfo ={};
        this.visible = true;
        this.initFlowData(param.data);
      },
      completeProcess(){
        this.visible = false;
        this.$emit('ok');
      },
      handleSelect: function(){
        this.$refs.selectSingleUserModal.select();
      },
      selectUserOK: function(data){
        this.model.userName = data.realname;
        this.userInfo = data;
      },

      async initFlowData(data){
        this.loading = true;
        for (var i = 0; i < data.length; i++) {
          var params = {flowCode:data[i].flowCode,dataId:data[i].dataId};//查询条件
          let res = await getAction(this.url.getBizProcessNodeInfo,params);
          if(res.success){
            var  currTask = res.result.bizTaskList[0];
            var taskId = currTask.id;
            var taskName = currTask.taskName;
            data[i].taskClaimFlag = currTask.taskClaimFlag;
            data[i].taskName = taskName;
            data[i].taskId = taskId;
            data[i].status  = '-1';//待处理
            continue;
          }
          data[i].status  = '0';
        }
        this.loading = false;
        this.dataSource = data;
        console.log("------数据初始化--------",this.dataSource);
      },

      handleBatchEntruster(){
        var that = this;
        if(that.model.userName==''){
          that.$message.warning('请选择委托人！');
          return;
        }
        this.$confirm({
          title: "确认委托",
          content: "是否委托选中数据?",
          onOk: function () {
            that.batchEntruster();
          }
        });
      },
      async batchEntruster(){
        this.confirmLoading = true;
        this.disabledButton = true;
        var data = this.dataSource;
        for (var i = 0; i < data.length; i++) {
          if(data[i].taskClaimFlag){
            //未签收，不做处理
            data[i].msg = "未签收不能进行委托处理";
            data[i].status  = '0';
            continue;
          }
          if(data[i].status=="-1"){
            var params = {
              taskId:data[i].taskId,
              taskAssignee:this.userInfo.username
            };//查询条件
            console.log("委托",params);
            let res = await putAction(this.url.taskEntrust, params);
            if (res.success) {
              data[i].status  = '1';
              continue;
            }
          }
          data[i].status  = '0';
        }
        this.dealStatus = true;
        this.dataSource2 = data;
        this.confirmLoading = false;
        this.$emit('ok');
      },
    }

  }
</script>

<style  lang="less" scoped>
  .ant-tabs-left-content{
    padding-top: 10px !important;
  }
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
</style>