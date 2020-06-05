<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :title="title"
    :visible="visible"
    width="80%"
    style="top: 20px;"
    destroyOnClose
    :bodyStyle ="bodyStyle"
    :footer="null"
    @cancel="handleModalCancel">
    <a-spin :spinning="confirmLoading">
      <a-tabs defaultActiveKey="1" tabPosition="left">
        <a-tab-pane key="1">
          <span slot="tab">
            <a-icon type="file-text"/>
            <span>附加单据</span>
          </span>
          <div>
            <template v-if="isComp=='comp'">
              <dynamic-link :path="path" :formData="formData"></dynamic-link>
            </template>
            <template v-else="isComp=='iframe'">
              <iframe :src="iframeUrl" frameborder="0" width="100%" :height="height" scrolling="auto"></iframe>
            </template>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="file-text"/>
            <span>审批记录</span>
          </span>
          <br>
          <br>
          <biz-his-task-module :formData="formData"></biz-his-task-module>
          <br>
        </a-tab-pane>
        <a-tab-pane key="3">
          <span slot="tab">
            <a-icon type="sliders"/>
            <span>流程跟踪</span>
          </span>
          <biz-process-module :formData="formData"></biz-process-module>
        </a-tab-pane>

      </a-tabs>
    </a-spin>
  </a-modal>
</template>

<script>

  import { getAction } from '@/api/manage'
  import BizTaskModule from "./BizTaskModule.vue";
  import BizTaskRejectModule from "./BizTaskRejectModule.vue";
  import BizHisTaskModule from "./BizHisTaskModule.vue";
  import BizProcessModule from "../BizProcessModule.vue";
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { isURL } from '@/utils/validate'
  import DynamicLink from "@/views/modules/bpm/task/form/DynamicLink";

  export default {
    name: 'BpmProcessFormTrackModal',
    components: {
      BizProcessModule,
      BizHisTaskModule,
      BizTaskRejectModule,
      DynamicLink,
      BizTaskModule
    },
    data() {
      return {
        loading: false,
        title: "流程",
        visible: false,
        confirmLoading:false,
        bodyStyle:{
          padding: "0",
          "overflow-y":"auto"
        },
        iframeUrl:"",
        height:(window.innerHeight-120)+"px",
        opt:"",
        formData:{},
        isComp:"",
        path:"",
        url: {
          getBizHisProcessNodeInfo:"/process/extActProcessNode/getBizHisProcessNodeInfo",
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
      handleTrack(params){
        getAction(this.url.getBizHisProcessNodeInfo,params).then((res)=>{
          if(res.success){
            console.log("获取流程节点信息",res);
            var  data = {
              dataId:res.result.dataId,
              procInsId:res.result.procInsId,
              tableName:res.result.tableName,
              vars:res.result.records
            }
            this.formData = data;
            console.log("------获取流程节点信息",this.formData);
            this.path = res.result.formUrl;
            console.log("获取流程节点信息",this.path);
            var TOKEN = Vue.ls.get(ACCESS_TOKEN);
            var DOMAIN_URL = window._CONFIG['domianURL'];
            var TASKID = this.formData.taskDefKey;
            var URL = (this.path|| '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
            console.log("isComp组件名称：",URL);
            if (isURL(URL)) {
              this.iframeUrl = URL;
              this.isComp = "iframe";
            }else{
              this.isComp = "comp";
            }
            this.visible = true;
          }
        })
      },
      completeProcess(){
        this.visible = false;
        this.$emit('ok');
      },

    }

  }
</script>

<style  lang="less" scoped>
  .ant-tabs-left-content{
    padding-top: 10px !important;
  }
</style>