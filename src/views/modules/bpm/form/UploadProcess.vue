<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :footer="null">

    <a-spin :spinning="confirmLoading">
      <a-upload-dragger name="processFile" accept=".zip,.xml,.bpmn" :multiple="false" :action="uploadUrl" @change="handleChange">
        <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
        <p class="ant-upload-text">点击或者拖拽文件到这个区域上传</p>
        <p class="ant-upload-hint">只支持zip、xml、bpmn格式文件！</p>
      </a-upload-dragger>
    </a-spin>
  </a-modal>
</template>

<script>
  export default {
    name: "UploadProcess",
    data () {
      return {
        title:"操作",
        visible: false,
        uploadUrl:'',
        model: {},
        confirmLoading: false,
        url: {
          add: "/act/model/create",
        },
      }
    },
    created () {
      this.uploadUrl= `${window._CONFIG['domianURL']}/act/process/deploy`;
    },
    methods: {
      add () {
        this.visible = true;
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleChange (info) {
        let file = info.file;
        if(file.response.success){
          this.$message.success(file.response.message);
          this.$emit('ok');
          this.close()
        }else{
          this.$message.warn(file.response.message);
          this.close()
        }

      },
      handleCancel () {
        this.close()
      },
    }
  }
</script>

<style scoped>

</style>