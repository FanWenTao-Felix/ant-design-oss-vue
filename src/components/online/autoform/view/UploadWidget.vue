<template>
  <formitem-wapper :formitem="formitem">
    <a-upload
      name="file"
      :multiple="true"
      :action="uploadAction"
      :data="{'isup':1}"
      :headers="headers"
      v-decorator="[formitem.key, {valuePropName: 'fileList',getValueFromEvent: normFile,rules:formitem.rules}]"
      :beforeUpload="beforeUpload"
      @change="handleChange"
      v-bind="getAttrs()">
      <a-button :disabled="btn_status">
        <a-icon type="upload" />{{ text }}
      </a-button>
    </a-upload>
  </formitem-wapper>
</template>

<script>
  import Vue from 'vue'
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import { FormItemMixin } from './../FormItenMixin'
  import FormitemWapper from './../FormitemWapper.vue'

  const FILE_TYPE_ALL = "all"
  const FILE_TYPE_IMG = "image"
  const FILE_TYPE_TXT = "file"
  export default {
    name: 'UploadWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper
    },
    props:{
      text:{
        type:String,
        required:false,
        default:"点击上传"
      },
      bizPath:{
        type:String,
        required:false,
        default:"temp"
      }
    },
    created(){
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = {"X-Access-Token":token}
      if(this.widgetAttrs){
        if(!this.widgetAttrs.disabled){
          this.btn_status =false
        }else{
          this.btn_status = true
        }
      }
    },
    data(){
      return{
        uploadAction: window._CONFIG['domianURL']+"/sys/common/upload",
        headers:{},
        btn_status:false,
        fileType:FILE_TYPE_ALL
      }
    },
    methods:{
      beforeUpload(file){
        var fileType = file.type;
        if(fileType===FILE_TYPE_IMG){
          if(fileType.indexOf('image')<0){
            this.$message.warning('请上传图片');
            return false;
          }
        }else if(fileType===FILE_TYPE_TXT){
          if(fileType.indexOf('image')>=0){
            this.$message.warning('请上传文件');
            return false;
          }
        }
        //TODO 验证文件大小
        return true

      },
      handleChange(info) {
        console.log("文件列表改变")
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          //let url = info.file.response.message
          //this.$message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          this.$message.error(`${info.file.name} file upload failed.`);
        }else if(info.file.status === 'removed'){
          this.handleDelete(info.file)
        }
      },
      handleDelete(file){
        //如有需要新增 删除逻辑
        console.log(file)
      },
      normFile(e){
        if (Array.isArray(e)) {
          return e;
        }
        return e && e.fileList;
      },
      getAttrs(){
        let curWidgetAttr = this.widgetAttrs;
        let viewType = this.formitem.type
        if(FILE_TYPE_IMG==viewType){
          this.fileType = FILE_TYPE_IMG
          return {
            listType:"picture",
            ...curWidgetAttr
          }
        }else{
          return curWidgetAttr
        }
      }

    }
  }
</script>

<style scoped>

</style>