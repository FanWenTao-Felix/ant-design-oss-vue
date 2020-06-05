<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
      
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="名称">
          <a-input placeholder="请输入名称" v-decorator="['listenerName', {}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="监听类型">
          <a-select v-decorator="[ 'listenerType', {}]" placeholder="请选择监听类型" @change="handleListenerTypeChange" >
            <a-select-option :value="1">执行监听</a-select-option>
            <a-select-option :value="2">任务监听</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="Event属性">
          <a-select v-decorator="[ 'listenerEvent', {}]" placeholder="请选择Event属性">
            <a-select-option v-for="listenerEvent in listenerEvents" :key="listenerEvent">{{listenerEvent}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="值类型">
          <a-radio-group :defaultValue="'javaClass'" @change="handleListenerValueTypeChange" v-decorator="[ 'listenerValueType', {}]" placeholder="请选择监听类型">
            <a-radio :value="'javaClass'">JAVA类</a-radio>
            <a-radio :value="'expression'">表达式</a-radio>
            <a-radio :value="'delegateExpression'">Spring表达式</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          :label="listenerValuelabel">
          <a-input :placeholder="listenerValueplaceholder" v-decorator="['listenerValue', {}]" />
        </a-form-item>
		
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"

  const listenerEventData = {
    "1": ["start", "end","take"],
    "2": ["create", "assignment", "complete"],
  };
  export default {
    name: "ExtActListenerModal",
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

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
        },
        listenerEvents: listenerEventData["1"],
        listenerValuelabel:"类路径",
        listenerValueplaceholder:"请输入类路径",
        url: {
          add: "/process/extActListener/add",
          edit: "/process/extActListener/edit",
        },
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({"listenerValueType":"javaClass"});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.listenerEvents = listenerEventData[record.listenerType];
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'listenerName','listenerType','listenerEvent','listenerValueType','listenerValue','listenerStatus'))
		  //时间格式化
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
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            //时间格式化
            
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
      handleListenerTypeChange(value){
        console.log(value)
        this.listenerEvents = listenerEventData[value];
        //this.model.listenerEvent = "";
        this.form.setFieldsValue({listenerEvent:""});
      },
      handleListenerValueTypeChange(e){
        console.log(e.target.value)
        if(e.target.value === "javaClass"){
          this.listenerValuelabel = "类路径";
          this.listenerValueplaceholder = "请输入类路径";
        }else{
          this.listenerValuelabel = "表达式";
          this.listenerValueplaceholder = "请输入表达式";
        }
        //this.model.listenerValue = "";
        this.form.setFieldsValue({listenerValue:""});
      }

    }
  }
</script>

<style scoped>

</style>