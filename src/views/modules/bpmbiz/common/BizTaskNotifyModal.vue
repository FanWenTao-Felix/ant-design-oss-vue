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
            <a-icon type="file-text"/>
            <span>催办</span>
          </span>
          <biz-task-notification-modal ref="extActTaskNotificationModal" :procInstId="procInstId" @ok="handleOk"></biz-task-notification-modal>
          <p></p>
        </a-tab-pane>

        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="user"/>
            <span>我提醒的</span>
          </span>
          <my-biz-task-notify-list ref="myTaskNotifyList" :procInstId="procInstId"></my-biz-task-notify-list>
        </a-tab-pane>

        <!--<a-tab-pane key="3">
          <span slot="tab">
            <a-icon type="sliders"/>
            <span>提醒我的</span>
          </span>
          <task-notify-me-list ref="taskNotifyMeList" :procInstId="procInstId"></task-notify-me-list>
        </a-tab-pane>-->

      </a-tabs>
    </a-modal>
</template>

<script>

  import { getAction } from '@/api/manage'
  import { isURL } from '@/utils/validate'
  import MyBizTaskNotifyList from "./MyBizTaskNotifyList";
  import BizTaskNotificationModal from "./BizTaskNotificationModal";

  export default {
    name: 'BizTaskNotifyModal',
    components: {
      BizTaskNotificationModal,
      MyBizTaskNotifyList
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