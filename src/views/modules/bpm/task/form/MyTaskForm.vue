<template>
  <!-- 弹出框 -->
  <a-modal
    :title="title"
    :visible="visible"
    width="90%"
    :confirmLoading="confirmLoading"
    style="width: calc(100% - 100px);top: 20px;"
    @cancel="handleCancel">

    <template slot="footer">
      <a-button @click="handleCancel">关闭</a-button>
    </template>

    <a-tabs defaultActiveKey="1">

      <a-tab-pane key="1">
        <span slot="tab">
          <a-icon type="file-text"/>
          <span>附加单据</span>
        </span>
        <dynamic-link path="modules/bpm/task/form/FormModule" />
      </a-tab-pane>

      <a-tab-pane key="2">
        <span slot="tab">
          <a-icon type="user"/>
          <span>任务处理</span>
        </span>
        <task-module/>
      </a-tab-pane>

      <a-tab-pane key="3">
        <span slot="tab">
          <a-icon type="sliders"/>
          <span>流程图</span>
        </span>
        <process-module/>
      </a-tab-pane>

    </a-tabs>

  </a-modal>
</template>

<script>
  import {getAction} from '@/api/manage'
  import TaskModule from './TaskModule'
  import ProcessModule from './ProcessModule'
  import DynamicLink from '@/views/modules/bpm/task/form/DynamicLink.vue'

  export default {
    components: {
      TaskModule,
      ProcessModule,
      DynamicLink
    },
    name: "MyTaskForm",
    data() {
      return {
        title: "操作",
        visible: false,
        confirmLoading: false,
      }
    },
    created() {
    },
    methods: {
      open() {
        this.visible = true;
      },
      close() {
        this.$emit('close');
        this.visible = false;
      },
      handleCancel() {
        this.close()
      },
      handleSubmit() {
        this.$emit('ok');
        this.close()
      },
    }
  }
</script>

<style scoped>
  #components-form-demo-validate-other .dropbox {
    height: 180px;
    line-height: 1.5;
  }
</style>