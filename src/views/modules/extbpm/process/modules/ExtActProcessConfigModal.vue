<template>
  <j-modal
    :title="title"
    width="90%"
    :visible="visible"
    fullscreen switch-fullscreen
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :bodyStyle ="bodyStyle"
    style="top: 0px;"
    destroyOnClose
    :footer="null"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <a-card class="card" :bordered="false">
        <a-tabs :activeKey="activeKey" tabPosition="left" @tabClick="tabClick">
          <a-tab-pane tab="流程节点" key="1">
            <ext-act-process-node-list :process-id="processId"></ext-act-process-node-list>
          </a-tab-pane>

          <a-tab-pane tab="业务关联" key="2">
            <ext-act-process-form-list :process-id="processId"></ext-act-process-form-list>
          </a-tab-pane>
        </a-tabs>

      </a-card>
    </a-spin>
  </j-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import ExtActProcessFormList from '../ExtActProcessFormList'
  import pick from 'lodash.pick'
  import moment from "moment"
  import ExtActProcessNodeList from "../ExtActProcessNodeList";


  export default {
    name: "ExtActProcessConfigModal",
    components: {
      ExtActProcessNodeList,
      ExtActProcessFormList
    },
    data () {
      return {
        title:"操作",
        modalWidth:800,
        visible: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        bodyStyle:{
          padding: "0",
          height:(window.innerHeight-80)+"px"
        },
        confirmLoading: false,
        activeKey:"1",
        processId:""
      }
    },
    created () {
    },
    methods: {
      config (id) {
        //this.modalWidth = window.innerWidth-20;
        this.processId = id;
        this.visible = true;
      },

      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        that.$emit('ok');
      },
      handleCancel () {
        this.close()
      },
      tabClick(key){
        this.activeKey = key;
      },
    }
  }
</script>

<style lang="less" scoped>
  .ant-modal-header{
    //padding: 0 !important;
  }
</style>