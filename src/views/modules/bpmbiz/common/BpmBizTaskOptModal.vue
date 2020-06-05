<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <a-modal
    :title="title"
    :visible="visible"
    width="90%"
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
            <span>任务处理</span>
          </span>
          <br>
        <br>
        <template v-if="opt=='submit'">
          <biz-task-module :formData="formData" @complete = "completeProcess"></biz-task-module>
        </template>
        <template v-else-if="opt=='reject'">
          <biz-task-reject-module :formData="formData" @complete = "completeProcess"></biz-task-reject-module>
        </template>
        <br>
        </a-tab-pane>
        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="sliders"/>
            <span>流程图</span>
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
  import BizProcessModule from "../BizProcessModule.vue";

  export default {
    name: 'BpmBizTaskOptModal',
    components: {
      BizProcessModule,
      BizTaskRejectModule,
      BizTaskModule
    },
    props: ['formData'],
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
      }
    },
    created() {
    },
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(opt){
        this.opt = opt;
        this.visible = true;
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