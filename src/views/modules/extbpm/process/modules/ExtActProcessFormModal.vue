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
      

        <!--<a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="业务名称">
          <a-input placeholder="请输入业务名称" v-decorator="['bizName', {}]" />
        </a-form-item>-->
        <!--<a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="流程ID">
          <a-input placeholder="请输入流程ID" v-decorator="['processId', validatorRules.processId ]" />
        </a-form-item>-->
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="表单类型">
          <a-select v-decorator="[ 'formType', {}]" placeholder="请输入表单类型" @change="handleFormTypeChange">
            <a-select-option value="1">Online表单</a-select-option>
            <a-select-option value="2">自定义表单(设计器)</a-select-option>
            <a-select-option value="3">自定义开发</a-select-option>
          </a-select>
        </a-form-item>

        <template v-if="formTypeValue == '1'">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="表名">
            <a-input placeholder="请输入表名" v-decorator="['formTableName', validatorRules.formTableName]" @change="handleFormTableName"/>
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="唯一编码">
            <a-input placeholder="请输入唯一编码" v-decorator="['relationCode', validatorRules.relationCode ]" :readOnly="relationCodeReadonly" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="流程状态列名">
            <a-input placeholder="请输入流程状态字段" v-decorator="['flowStatusCol', validatorRules.flowStatusCol]" :readOnly="relationCodeReadonly" />
          </a-form-item>
        </template>
        <template  v-else-if="formTypeValue == '2'">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="表单编码">
            <a-input placeholder="请输入表单编码" v-decorator="['formTableName', validatorRules.formTableName]" @change="handleDesignFormTableName"/>
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="唯一编码">
            <a-input placeholder="请输入唯一编码" v-decorator="['relationCode', validatorRules.relationCode ]" :readOnly="relationCodeReadonly" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="流程状态列名">
            <a-input placeholder="请输入流程状态字段" v-decorator="['flowStatusCol', validatorRules.flowStatusCol]" :readOnly="relationCodeReadonly" />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="表名">
            <a-input placeholder="请输入表名" v-decorator="['formTableName', validatorRules.formTableName]" @blur="genDefaultCode" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="唯一编码">
            <a-input placeholder="请输入唯一编码" v-decorator="['relationCode', validatorRules.relationCode ]" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="流程状态列名">
            <a-input placeholder="请输入流程状态字段" v-decorator="['flowStatusCol', validatorRules.flowStatusCol]" />
          </a-form-item>
        </template>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="标题表达式">
          <a-input placeholder="请输入标题表达式" v-decorator="['titleExp', validatorRules.titleExp]" />
          <span style="color: red;font-size: 12px">参考：XXXX【${busname}】-XXXX【${name}】；其中${}表达式取流程变量的值</span>
        </a-form-item>
		
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction,getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"

  export default {
    name: "ExtActProcessFormModal",
    props:{
      processId:{
        type: String,
        default: ''
      }
    },
    data () {
      return {
        title:"操作",
        visible: false,
        relationCodeReadonly:true,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        formTypeValue:"1",
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
          relationCode:{rules: [{ required: true, message: '请输入唯一编码!' }]},
          formTableName:{rules: [{ required: true, message: '请输入表名!' }]},
          flowStatusCol:{rules: [{ required: true, message: '请输入流程状态字段!' }]},
          titleExp:{rules: [{ required: true, message: '请输入标题表达式!' }]},
          processId:{rules: [{ required: true, message: '请输入流程ID!' }]},
        },
        url: {
          add: "/process/extActProcessForm/add",
          edit: "/process/extActProcessForm/edit",
          genDefaultCode:"/process/extActProcessForm/genDefaultCode",
        },
      }
    },
    created () {
    },
    mounted(){
    },
    methods: {
      genDefaultCode(){
        var tabeName = this.form.getFieldValue("formTableName");
        if(tabeName!=null&&tabeName!=''&&tabeName!=undefined){
          var relationCode = this.form.getFieldValue("relationCode");
          if(relationCode==null||relationCode==''||relationCode==undefined){
            var params = {
              tabeName:tabeName
            };//查询条件
            getAction(this.url.genDefaultCode,params).then((res)=>{
              if(res.success){
                var flowCode = res.result;
                this.form.setFieldsValue({relationCode:flowCode});
              }
            })
          }
        }else{
          this.$message.success("请填写表名！");
        }
      },
      handleFormTableName(e){
        var value = e.target.value;
        console.log(value);
        if(value!=null&&value!=''&&value!=undefined){
          var flowCode = "onl_"+value;
          this.form.setFieldsValue({relationCode:flowCode});
        }else{
          this.form.setFieldsValue({relationCode:""});
        }
      },
      handleDesignFormTableName(e){
        var value = e.target.value;
        console.log(value);
        if(value!=null&&value!=''&&value!=undefined){
          var flowCode = "desform_"+value;
          this.form.setFieldsValue({relationCode:flowCode});
        }else{
          this.form.setFieldsValue({relationCode:""});
        }
      },
      handleFormTypeChange(value){
        this.formTypeValue = value;
        //this.model.listenerValue = "";
        this.form.setFieldsValue({formTableName:""});
        this.form.setFieldsValue({relationCode:""});
      },
      add () {
        this.edit({formType:"1",formDealStyle:"default",flowStatusCol:"bpm_status"});
      },
      edit (record) {
        this.form.resetFields();
        this.formTypeValue = record.formType;
          this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'relationCode','bizName','processId','formTableName','formType','titleExp','formDealStyle','flowStatusCol'))
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
            if(this.processId){
              formData.processId=this.processId;
            }
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

<style scoped>

</style>