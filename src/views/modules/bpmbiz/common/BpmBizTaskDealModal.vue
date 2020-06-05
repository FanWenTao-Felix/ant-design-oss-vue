<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :visible="visible"
    width="100%"
    destroyOnClose
    :bodyStyle ="bodyStyle"
    style="top: 0px;"
    :footer="null"
    @cancel="handleModalCancel">
    <a-spin :spinning="confirmLoading">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        当前任务环节：
        <a-select style="width:300px" :defaultValue="currTask.id">
          <a-select-option :value="currTask.id">{{ currTask.taskName }}</a-select-option>
        </a-select>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <template v-if="!currTask.suspendFlag">
          <template v-if="currTask.taskClaimFlag">
            <a-button @click="handleClaim()" type="primary" icon="caret-right">签收</a-button>
          </template>
          <template v-else>
            <a-button @click="handleOpt('submit')" type="primary" icon="caret-right">发送</a-button>
            <a-button @click="handleOpt('reject')" type="primary" icon="rollback">退回</a-button>
            <a-button @click="selectEntruster()" type="primary" icon="user">委托</a-button>
            <a-button @click="handleSuspend()" type="primary" icon="lock">挂起</a-button>
          </template>
        </template>
        <template v-else>
          <a-button @click="handleActive()" type="primary" icon="unlock">解挂</a-button>
        </template>
        &nbsp;&nbsp;
        <span style="color: red" v-if="currTask.suspendFlag">当前流程已挂起，需要进行解挂，再进行办理！</span>
      </div>
        <div>
        <template v-if="isComp">
          <biz-dynamic-link :path="path" :formData="formData"></biz-dynamic-link>
        </template>
        <template v-else>
          <iframe :src="iframeUrl" frameborder="0" width="100%" :height="height" scrolling="auto"></iframe>
        </template>
        </div>
    </a-spin>
    <bpm-biz-task-opt-modal ref="bpmBizTaskOptModal" :formData="formData" @ok="completeProcess"></bpm-biz-task-opt-modal>
    <biz-task-select-entruster-modal ref="selectEntrusterModal" @selectFinished="handleEntruster"></biz-task-select-entruster-modal>
  </a-modal>
</template>

<script>

  import { getAction,putAction } from '@/api/manage'
  import { isURL } from '@/utils/validate'
  import BpmBizTaskOptModal from "./BpmBizTaskOptModal.vue";
  import BizTaskSelectEntrusterModal from "./BizTaskSelectEntrusterModal.vue";
  import BizDynamicLink from "../BizDynamicLink.vue";
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  export default {
    name: 'BpmBizTaskDealModal',
    components: {
      BizDynamicLink,
      BizTaskSelectEntrusterModal,
      BpmBizTaskOptModal
    },
    props: ['path','formData'],
    computed: {
      isComp: function () {
        console.log("isComp组件名称：",this.path);
        var TOKEN = Vue.ls.get(ACCESS_TOKEN);
        var DOMAIN_URL = window._CONFIG['domianURL'];
        var TASKID = this.formData.taskDefKey;
        var URL = (this.path|| '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
        console.log("isComp组件名称：",URL);
        if (isURL(URL)) {
          this.iframeUrl = URL;
          return false;
        }
        return true;
      }
    },
    data() {
      return {
        loading: false,
        title: "流程",
        visible: false,
        confirmLoading:false,
        currTask:{},
        bodyStyle:{
          padding: "0",
          height:(window.innerHeight)+"px",
          "overflow-y":"auto"
        },
        iframeUrl:"",
        url: {
          claim: "/act/task/claim",
          taskEntrust:"/act/task/taskEntrust",
          suspend: "/act/processInstance/suspend",
          restart: "/act/processInstance/restart",
        },
      }
    },
    created() {
    },
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(data){
        console.log("-----任务办理组件数据：-------",data);
        this.currTask = data.bizTaskList[0];
        this.visible = true;
      },
      completeProcess(){
        this.visible = false;
        this.$emit('ok');
      },
      handleOpt(opt){
        console.log("handleOpt")
        this.$refs.bpmBizTaskOptModal.deal(opt);
        var title = "办理";
        if(opt == "submit"){
          title = "发送";
        }else if(opt == "reject"){
          title = "退回";
        }
        this.$refs.bpmBizTaskOptModal.title=title;
      },
      //签收
      handleClaim(){
        var that = this;
        var params = {taskId:this.currTask.id};//查询条件
        this.$confirm({
          title:"确认签收吗",
          content:"是否签收该任务?",
          onOk: function(){
            that.confirmLoading = true;
            putAction(that.url.claim, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.completeProcess();
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
        });
      },
      //委托
      selectEntruster(){
        this.$refs.selectEntrusterModal.select();
        this.$refs.selectEntrusterModal.title="选择委托人";
      },
      handleEntruster(data){
        var that = this;
        var params = {
          taskId:this.currTask.id,
          taskAssignee:data.username
        };//查询条件
        console.log("委托",params)
        putAction(that.url.taskEntrust, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.completeProcess();
          } else {
            that.$message.warning(res.message);
          }
        })

      },
      //挂起
      handleSuspend(){
        var that = this;
        var params = {"processInstanceId":this.currTask.procInstId};
        this.$confirm({
          title:"确认挂起吗",
          content:"是否挂起该任务?",
          onOk: function(){
            that.confirmLoading = true;
            getAction(that.url.suspend,params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.completeProcess();
              } else {
                that.$message.warn(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
        });
      },
      //激活
      handleActive(){
        var that = this;
        var params = {"processInstanceId":this.currTask.procInstId};
        this.$confirm({
          title:"确认解挂吗",
          content:"是否解挂该任务?",
          onOk: function(){
            that.confirmLoading = true;
            getAction(that.url.restart, params).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.completeProcess();
              } else {
                that.$message.warn(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }
        });
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