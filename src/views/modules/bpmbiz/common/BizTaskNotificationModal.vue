<template>
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="催办类型">
          <a-checkbox-group v-model="notifyTypeValue" @change="onChangeNotifyType">
              <a-checkbox value="1">页面通知</a-checkbox>
              <a-checkbox value="2">邮件</a-checkbox>
          </a-checkbox-group>
          <!--<j-dict-select-tag  v-decorator="['notifyType', {}]" placeholder="请选择催办类型" :triggerChange="true" :type="'radio'" dictCode="notify_type"/>-->
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="催办内容">
          <a-textarea rows="3" placeholder="请输入催办内容"  v-decorator="['remarks', { rules: [{ required: true, message: '催办内容不允许为空!' }] }]" />
        </a-form-item>
        <a-form-item>
          <div style="text-align:center;margin-top: 10px">
            <a-button type="primary" @click="handleOk()">保存</a-button>
          </div>
        </a-form-item>
      </a-form>

    </a-spin>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: "BizTaskNotificationModal",
    props: ['procInstId'],
    data () {
      return {
        title:"操作",
        visible: false,
        notifyTypeValue:[],
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
        },
        url: {
          taskNotification: "/process/extActTaskNotification/taskNotification",
        },
      }
    },
    created () {
      this.add();
    },
    methods: {
      onChangeNotifyType(checkedValues){
        this.model.notifyType = checkedValues.join(',');
        console.log('checked = ', this.model.notifyType);
      },
      add() {
        this.notifyTypeValue = ['1','2'];
        var procInstId = this.procInstId;
        console.log("------procInstId-------",procInstId)
        this.edit({notifyType:"1,2",procInstId:procInstId});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'notifyType','remarks'))
        });

      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            httpurl+=this.url.taskNotification;
            method = 'post';
            let formData = Object.assign(this.model, values);
            //时间格式化
            formData.opTime = formData.opTime?formData.opTime.format('YYYY-MM-DD HH:mm:ss'):null;
            formData.createDate = formData.createDate?formData.createDate.format('YYYY-MM-DD HH:mm:ss'):null;
            formData.updateDate = formData.updateDate?formData.updateDate.format('YYYY-MM-DD HH:mm:ss'):null;
            
            console.log(formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
        })
      },
      handleCancel () {
        this.close()
      },


    }
  }
</script>

<style lang="less" scoped>

</style>