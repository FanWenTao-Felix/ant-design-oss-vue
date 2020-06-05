<template>
  <a-modal
    :title="title"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :bodyStyle ="bodyStyle"
    style="top: 0px;"
    destroyOnClose
    :footer="null"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <a-card class="card" :bordered="false">
        <ext-act-process-deployment-list :processKey = "processKey"></ext-act-process-deployment-list>
      </a-card>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import ExtActProcessDeploymentList from "../ExtActProcessDeploymentList";


  export default {
    name: "ExtActProcessDeploymentModal",
    components: {
      ExtActProcessDeploymentList

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
        processKey:""
      }
    },
    created () {
    },
    methods: {
      deploymentList (processKey) {
        this.modalWidth = window.innerWidth;
        this.processKey = processKey;
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

    }
  }
</script>

<style lang="less" scoped>
  .ant-modal-header{
    //padding: 0 !important;
  }
</style>