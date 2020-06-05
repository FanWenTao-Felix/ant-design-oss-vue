<template>
  <a-modal
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :bodyStyle ="bodyStyle"
    width="100%"
    :style="{ top: '0', padding: '0' }"
    destroyOnClose
    :footer="null"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <iframe  :id="id" :src="url" frameborder="0" width="100%" :height="iframeHeight" scrolling="auto"></iframe>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  export default {
    name: "ExtActProcessModal",
    data () {
      return {
        title:"操作",
        modalWidth:800,
        visible: false,
        iframeHeight:(window.innerHeight-5)+"px",
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
          height:(window.innerHeight-25)+"px"
        },
        confirmLoading: false,
        id:"processDesign",
        url: this.iframeurl(),
      }
    },
    created () {
    },
    mounted(){
      window.addEventListener('message', this.handleMessage);
    },
    methods: {
      iframeurl () {
        //console.log('window._CONFIG[domianURL] : '+ window._CONFIG['domianURL'])
        return window._CONFIG['domianURL']+"/designer";
      },
      designer (id) {
        this.modalWidth = window.innerWidth;
        let token = Vue.ls.get(ACCESS_TOKEN)
        if(id!=null&&id!=undefined&&id!=""){
          this.url = this.iframeurl()+"?id="+id+"&token="+token;
        }else{
          this.url = this.iframeurl()+"?token="+token;
        }
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
      handleMessage (event) {
        // 根据上面制定的结构来解析iframe内部发回来的数据
        const data = event.data;
        console.log('iframe message', data);
        if(data.cmd=="saveProcessDef"){
          console.log('保存流程', data);
          this.$emit('loadTable', data);
          //this.visible = false;
        }
      },

    }
  }
</script>

<style lang="less" scoped>
  .ant-modal-header{
    padding: 0 !important;
  }
</style>