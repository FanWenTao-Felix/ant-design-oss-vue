<template>
    <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
    <!-- 弹出框 -->
    <a-modal
      :title="title"
      :visible="visible"
      width="100%"
      destroyOnClose
      :bodyStyle ="bodyStyle"
      style="top: 0px;"
      :footer="null"
      @cancel="handleModalCancel">

      <a-tabs defaultActiveKey="1" tabPosition="left">

        <a-tab-pane key="1">
          <span slot="tab">
            <a-icon type="file-text"/>
            <span>附加单据</span>
          </span>
          <div  class="component_div">
          <template v-if="isComp">
            <dynamic-link :path="path" :formData="formData"></dynamic-link>
          </template>
          <template v-else>
            <iframe :src="iframeUrl" frameborder="0" width="100%" :height="height" scrolling="auto"></iframe>
          </template>
          </div>
        </a-tab-pane>

        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="user"/>
            <span>任务处理</span>
          </span>
          <his-task-module :formData="formData"></his-task-module>
        </a-tab-pane>

        <a-tab-pane key="3">
          <span slot="tab">
            <a-icon type="sliders"/>
            <span>流程图</span>
          </span>
          <process-module :formData="formData"></process-module>
        </a-tab-pane>

      </a-tabs>

    </a-modal>
</template>

<script>

  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import TaskModule from './form/TaskModule'
  import ProcessModule from './form/ProcessModule'
  import { getAction } from '@/api/manage'
  import DynamicLink from "./form/DynamicLink.vue";
  import HisTaskModule from "./form/HisTaskModule.vue";
  import { isURL } from '@/utils/validate'

  export default {
    name: 'HisTaskDealModal',
    components: {
      HisTaskModule,
      DynamicLink,
      TaskModule,
      ProcessModule
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
        bodyStyle:{
          padding: "0",
           height:(window.innerHeight-80)+"px",
          "overflow-y":"auto"
        },
        height:(window.innerHeight-120)+"px",
        iframeUrl:"",
      }
    },
    methods: {
      // 关闭模态框
      handleModalCancel() {
        this.visible = false
      },
      deal(record){
        this.visible = true;
      }

    }

  }
</script>

<style scoped>
  .component_div{
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>