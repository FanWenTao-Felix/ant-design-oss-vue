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
          <a-divider orientation="left">挂起</a-divider>
          <a-row>
            <a-col :span="24">
              <div style="text-align:center;">
                <a-button type="primary" :disabled="disabledButton" @click="handleBatchSuspend">确认挂起</a-button>
              </div>
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
  </a-modal>
</template>

<script>

  import { getAction,putAction } from '@/api/manage'


  export default {
    name: 'BpmBizBatchSuspendDealModal',
    components: {
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
          suspend: "/act/processInstance/suspend",
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
        this.visible = true;
        this.initFlowData(param.data);
      },
      completeProcess(){
        this.visible = false;
        this.$emit('ok');
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
            data[i].procInstId = currTask.procInstId;
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

      handleBatchSuspend(){
        var that = this;
        this.$confirm({
          title: "确认挂起",
          content: "是否挂起选中数据?",
          onOk: function () {
            that.batchSuspend();
          }
        });
      },
      async batchSuspend(){
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
            var params = {"processInstanceId":data[i].procInstId};//查询条件
            let res = await getAction(this.url.suspend, params);
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