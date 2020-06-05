<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :title="title"
    :visible="visible"
    width="100%"
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
            <span>审批记录</span>
          </span>
          <br>
          <br>
          <biz-his-task-module :formData="formData"></biz-his-task-module>
          <br>
        </a-tab-pane>
        <a-tab-pane key="2">
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

  export default {
    name: 'BpmProcessTrackModal',
    components: {
      BizProcessModule,
      BizHisTaskModule,
      BizTaskRejectModule,
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
        opt:"",
        formData:{},
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