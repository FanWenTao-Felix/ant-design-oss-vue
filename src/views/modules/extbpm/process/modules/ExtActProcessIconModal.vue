<template>
  <j-modal
    :title="title"
    :width="700"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item label="表单图标(PC)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="点击选择表单图标" v-decorator="[ 'pcIcon']" :readOnly="true">
            <a-icon slot="addonAfter" type="setting" @click="iconChooseVisible=true"/>
          </a-input>
          <!-- 图标选择组件 -->
          <icons @choose="handleIconChoose" @close="iconChooseVisible=false" :iconChooseVisible="iconChooseVisible"></icons>
        </a-form-item>

        <a-form-item label="表单图标(APP)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="点击选择移动表单图标" v-decorator="[ 'appIcon']">
            <a-icon slot="addonAfter" type="setting" @click="iconChooseVisible2=true"/>
          </a-input>
          <!-- 图标选择组件 -->
          <icons @choose="handleIconChoose2" @close="iconChooseVisible2=false" :iconChooseVisible="iconChooseVisible2"></icons>
        </a-form-item>

      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>
  import {httpAction, putAction} from '@/api/manage'
  import {ACCESS_TOKEN} from '@/store/mutation-types'
  import Icons from '@views/system/modules/icon/Icons'
  import pick from 'lodash.pick'

  export default {
    name: "ExtActProcessIconModal",
    components: {Icons},
    data() {
      return {
        form: this.$form.createForm(this),
        iconChooseVisible: false,
        iconChooseVisible2: false,
        processId: '',
        title: "操作",
        visible: false,
        labelCol: {
          xs: {span: 24},
          sm: {span: 5},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 19},
        },
        confirmLoading: false,
        url: {
          edit: "/process/extActProcess/edit",
        },
      }
    },
    created() {
    },
    methods: {
      close() {
        this.$emit('close');
        this.visible = false;
      },
      /** 选择图标 */
      handleIconChoose(value) {
        this.iconChooseVisible = false
        this.form.setFieldsValue({pcIcon: value})
      },
      /** 选择图标 */
      handleIconChoose2(value) {
        this.iconChooseVisible2 = false
        this.form.setFieldsValue({appIcon: value})
      },
      add(record) {
        this.form.resetFields();
        this.processId = record.id
        this.visible = true;

        this.$nextTick(() => {
          this.form.setFieldsValue(pick(record, 'pcIcon', 'appIcon'))
        })
      },
      handleOk() {
        const that = this;
        var params = {
          id: this.processId,
          pcIcon: this.form.getFieldValue("pcIcon"),
          appIcon: this.form.getFieldValue("appIcon")
        };
        putAction(that.url.edit, params).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
          }
        });
        that.$emit('ok');
        that.visible = false;
      },
      handleCancel() {
        this.close()
      },
    }
  }
</script>