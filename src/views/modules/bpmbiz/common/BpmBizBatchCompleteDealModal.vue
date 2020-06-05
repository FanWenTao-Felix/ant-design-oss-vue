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
        <a-divider orientation="left">已选择的单据</a-divider>
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
          <a-divider orientation="left">处理意见</a-divider>
          <a-row>
            <a-col :span="24">
              <a-list-item>
                <div style="width: 100%;">
                  <div style="margin-bottom: 5px">
                    处理意见：
                    <a-select style="width: 300px" placeholder="常用审批语" @change="handleChangeSelect">
                      <a-icon slot="suffixIcon" type="smile" />
                      <a-select-option v-for="(item, key) in remarksDictOptions" :key="key" :value="item.value">{{ item.text }}</a-select-option>
                    </a-select>
                  </div>
                  <a-textarea rows="3" v-model="model.reason" />
                </div>
              </a-list-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <div style="text-align:center;">
              <a-button type="primary" :disabled="disabledButton" @click="handleBatchComplete">确认提交</a-button>
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

  import { getAction,putAction,postAction } from '@/api/manage'
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'


  export default {
    name: 'BpmBizBatchCompleteDealModal',
    components: {
    },
    props: ['paramData'],
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
          getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
          processComplete:'/act/task/processComplete',
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
          {
            title: '描述',
            align:"center",
            dataIndex: 'msg'
          },
        ],
        remarksDictOptions:[],
        dealStatus:false,
        disabledButton:false,
        model:{
          taskId:"",
          nextnode:"",
          nextCodeCount:"",
          reason:"",
          processModel:1,
          rejectModelNode:"",
          nextUserName:"",
          nextUserId:"",
          ccUserIds:"",
          ccUserRealNames:"",
          fileList:"",
        },
      }
    },
    created() {
      this.initDictConfig();
    },
    methods: {
      handleChangeSelect (value) {
        this.model.reason = value;
      },
      initDictConfig() {
        //初始化字典 - 性别
        initDictOptions('approval_remarks').then((res) => {
          if (res.success) {
            this.remarksDictOptions = res.result;
          }
        });
      },
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(param){
        this.dealStatus = false;
        this.model.reason ="";
        this.dataSource = [];
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
            data[i].taskName = taskName;
            data[i].taskId = taskId;
            var params2 = {taskId:taskId};//查询条件
            let res2 = await getAction(this.url.getProcessTaskTransInfo,params2);
            if (res2.success) {
              if(res2.result.nextCodeCount==1){
                data[i].status  = '-1';//待处理
                data[i].nextnode =res2.result.transitionList[0].nextnode;
                continue;
              }else if(res2.result.nextCodeCount>1){
                data[i].msg = "多流转分支不能进行提交处理";
              }
            }
          }
          data[i].status  = '0';
        }
        this.loading = false;
        this.dataSource = data;
        console.log("------数据初始化--------",this.dataSource);
      },
      handleBatchComplete(){
        var that = this;
        if(!that.model.reason || that.model.reason.length==0){
          that.$message.warning("请填写处理意见");
          return
        }
        this.$confirm({
          title: "确认提交",
          content: "是否提交选中数据?",
          onOk: function () {
            that.handleProcessComplete();
          }
        });
      },

      async handleProcessComplete () {
        const that = this;
        that.confirmLoading = true;
        that.disabledButton = true;
        var data = that.dataSource;
        for (var i = 0; i < data.length; i++) {
          if(data[i].taskClaimFlag){
            //未签收，不做处理
            data[i].msg = "未签收不能进行提交处理";
            data[i].status  = '0';
            continue;
          }
          if(data[i].status=="-1"){
            var param ={
              taskId:data[i].taskId ,
              nextnode:data[i].nextnode,
              nextCodeCount:"1",
              reason:this.model.reason,
              processModel:1,
              rejectModelNode:"",
              nextUserName:"",
              nextUserId:"",
              ccUserIds:"",
              ccUserRealNames:"",
              fileList:"",
            };
            console.log("流程办理数据：",param);
            let res = await postAction(that.url.processComplete,param)
            if(res.success){
              data[i].status  = '1';
              continue;
            }
          }
          data[i].status  = '0';
        }
        that.dealStatus = true;
        that.dataSource2 = data;
        that.confirmLoading = false;
        that.$emit('ok');
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