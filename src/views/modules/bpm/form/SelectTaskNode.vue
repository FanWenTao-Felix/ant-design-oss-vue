<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel">

    <a-spin :spinning="confirmLoading">
      <a-form>
        <a-form-item label="请选择跳转节点" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" has-feedback>
          <a-select placeholder="请选择跳转到那个节点"  v-model="taskNodeValue">
            <a-select-option v-for="(item, key) in options" :key="key" :value="item.taskKey">{{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import {getAction} from '@/api/manage'
  import AdvancedForm from "../../../form/advancedForm/AdvancedForm.vue";

  export default {
    components: {AdvancedForm},
    name: "SelectTaskNode",
    props: ['taskId'],
    data() {
      return {
        title: "操作",
        visible: false,
        taskNodeValue: '',
        options: [],
        confirmLoading: false,
        url: {
          getAllTask: "/act/processInstance/getAllTask",
        },
      }
    },
    created() {
    },
    methods: {
      open() {
        this.visible = true;
        this.initSelNodes();
      },
      initSelNodes() {
        console.log('taskId: ' + this.taskId)
        let params = {
          'taskId': this.taskId
        }
        getAction(this.url.getAllTask, params).then((res) => {
          if (res.success) {
            this.options = res.result;
          }
        })

      },
      close() {
        this.$emit('close');
        this.visible = false;
      },
      handleChange(info) {
        let file = info.file;
        if (file.response.success) {
          this.$message.success(file.response.message);
          this.$emit('ok');
          this.close()
        } else {
          this.$message.warn(file.response.message);
          this.close()
        }

      },
      handleCancel() {
        this.close()
      },
      handleSubmit() {
        this.$emit('ok',this.taskNodeValue,this.taskId);
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