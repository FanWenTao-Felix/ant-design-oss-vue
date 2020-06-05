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
          <task-notify-me-list ref="taskNotifyMeList" :procInstId="procInstId"></task-notify-me-list>
        </a-tab-pane>

      </a-tabs>
    </a-modal>
</template>

<script>

  import { getAction } from '@/api/manage'
  import { isURL } from '@/utils/validate'
  import MyTaskNotifyList from "./modules/MyTaskNotifyList";
  import TaskNotifyMeList from "./modules/TaskNotifyMeList";
  import ExtActTaskNotificationModal from "./modules/ExtActTaskNotificationModal";

  export default {
    name: 'TaskNotifyMeModal',
    components: {
      ExtActTaskNotificationModal,
      TaskNotifyMeList,
      MyTaskNotifyList
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
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      notify(record){
        this.procInstId = record.processInstanceId;
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