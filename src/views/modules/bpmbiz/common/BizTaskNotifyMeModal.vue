<template>
    <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
    <!-- 弹出框 -->
    <a-modal
      :title="title"
      :visible="visible"
      width="60%"
      destroyOnClose
      :bodyStyle ="bodyStyle"
      :footer="null"
      @cancel="handleModalCancel">
      <a-tabs defaultActiveKey="1" tabPosition="top">

        <a-tab-pane key="1">
          <span slot="tab">
            <a-icon type="sliders"/>
            <span>提醒我的</span>
          </span>
          <biz-task-notify-me-list ref="taskNotifyMeList" :procInstId="procInstId"></biz-task-notify-me-list>
        </a-tab-pane>

      </a-tabs>
    </a-modal>
</template>

<script>

  import { getAction } from '@/api/manage'
  import { isURL } from '@/utils/validate'
  import BizTaskNotifyMeList from "./BizTaskNotifyMeList";

  export default {
    name: 'BizTaskNotifyMeModal',
    components: {
      BizTaskNotifyMeList
    },
    data() {
      return {
        loading: false,
        title: "催办",
        visible: false,
        bodyStyle:{
          padding: "0 5px",
          "overflow-y":"auto"
        },
        procInstId:"",
      }
    },
    created() {
    },
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      notify(procInstId){
        this.procInstId = procInstId;
        console.log("------procInstId-------",this.procInstId)
        this.visible = true;
      },
      handleOk(){
        this.visible = false;
        this.$emit('ok');
      }

    }

  }
</script>

<style  lang="less" scoped>
</style>