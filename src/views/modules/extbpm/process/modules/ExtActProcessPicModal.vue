<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    destroyOnClose
    :bodyStyle ="bodyStyle"
    :footer="null"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <img :src="picUrl" />

    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import qs from 'qs';

  export default {
    name: "ExtActProcessPicModal",
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
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
          "overflow-y":"auto",
          "overflow-x":"auto",
          height:(window.innerHeight-280)+"px",
        },
        confirmLoading: false,
        picUrl:"",
      }
    },
    created () {
    },
    methods: {
      preview(id, name){
        this.picUrl =  this.getResourceURL(id,name);
        console.log("---流程图----",this.picUrl)
        this.visible = true;
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleCancel () {
        this.close()
      },
      // 获取静态资源访问地址
      getResourceURL(id, name) {
        var params = qs.stringify({
          //'token': Cookies.get('token'),
          '_t': Date.parse(new Date())/1000,
          'deploymentId': id,
          'resourceName': name
        })
        return `${window._CONFIG['domianURL']}/act/process/resource?${params}`
      },
    }
  }
</script>

<style scoped>

</style>