<template>
  <a-card :bordered="false" :bodyStyle="bodyStyle">


    <a-tabs defaultActiveKey="1" tabPosition="left">
      <!-- 我的任务 -->
      <a-tab-pane key="1">
        <span slot="tab">
          <a-icon type="user"/>
          <span>我的任务</span>
        </span>
        <my-running-task-list></my-running-task-list>

      </a-tab-pane>
      <!-- 组任务 -->
      <a-tab-pane key="2" forceRender>
        <span slot="tab">
          <a-icon type="team"/>
          <span>组任务</span>
        </span>

        <my-group-task-list></my-group-task-list>

      </a-tab-pane>
      <!-- 历史任务 -->
      <a-tab-pane key="3">
        <span slot="tab">
          <a-icon type="clock-circle"/>
          <span>历史任务</span>
        </span>

        <my-his-task-list></my-his-task-list>
      </a-tab-pane>

    </a-tabs>
    <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
    <!-- 弹出框 -->

  </a-card>
</template>

<script>

  import {getAction} from '@/api/manage'
  import MyRunningTaskList from "./MyRunningTaskList";
  import MyGroupTaskList from "./MyGroupTaskList";
  import MyHisTaskList from "./MyHisTaskList";

  export default {
    name: 'MyTask',
    components: {
      MyHisTaskList,
      MyGroupTaskList,
      MyRunningTaskList
    },
    data() {
      return {
        bodyStyle:{
          "padding-left":"0px",
        },
      }
    },
    methods: {

    },

  }
</script>

<style scoped>

</style>