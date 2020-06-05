<template>
  <a-modal
    title="JAVA增强"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="关闭"
    wrapClassName="ant-modal-cust-warp"
    style="top:5%;height: 95%;">

    <a-form :form="form">

      <a-form-item label="页面按钮" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select :getPopupContainer="node => node.parentNode" v-decorator="[ 'buttonCode']" placeholder="请选择页面控件" @change="(v)=>{handleChangeEhjava('buttonCode',v)}">
          <a-select-option value="add">新增</a-select-option>
          <a-select-option value="edit">编辑</a-select-option>
          <a-select-option value="delete">删除</a-select-option>
          <a-select-option value="import">导入</a-select-option>
          <a-select-option value="export">导出</a-select-option>
          <a-select-option value="query">查询</a-select-option>
          <template v-for="(item,index) in btnList">
            <a-select-option :key="index" :value="item.buttonCode">{{ item.buttonName }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="事件状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group name="radioGroup" v-decorator="[ 'event']" @change="(e)=>{handleChangeEhjava('event',e.target.value)}">
          <a-radio value="start">开始</a-radio>
          <a-radio value="end">结束</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group name="radioGroup" v-decorator="[ 'cgJavaType']" @change="(e)=>{handleChangeEhjava('cgJavaType',e.target.value)}">
          <a-radio value="spring">spring-key</a-radio>
          <a-radio value="class">java-class</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input placeholder="请输入内容" v-decorator="[ 'cgJavaValue',{rules: [{ required: true, message: '请输入内容!' }]}]"></a-input>
      </a-form-item>

      <a-form-item label="是否生效" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group name="radioGroup" v-decorator="[ 'activeStatus']" @change="(e)=>{handleChangeEhjava2('activeStatus',e.target.value)}">
          <a-radio value="1">有效</a-radio>
          <a-radio value="0">无效</a-radio>
        </a-radio-group>
      </a-form-item>

    </a-form>
  </a-modal>
</template>

<script>
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import { postAction,getAction,putAction } from '@/api/manage'
  import pick from 'lodash.pick'

  export default {
    name: 'EnhanceJava',
    components: { ATextarea },

    data(){
      return {
        modalWidth:800,
        visible:false,
        confirmLoading:false,
        form:this.$form.createForm(this),
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        code:'',
        btnUrl:'/online/cgform/head/enhanceButton/',
        btnList:[],
        url:'/online/cgform/head/enhanceJava/',
        urlByButtonCode:'/online/cgform/head/enhanceJavaByButtonCode/',
        model:{
          buttonCode:'add',
          event:'end',
          cgJavaType:'spring',
          activeStatus:'1'
        }
      }
    },
    methods:{
      handleSubmit(){
        this.form.validateFields((err, values) => {
          if (!err) {
            this.confirmLoading = true;
            let promiseForm;
            if(!this.model.id){
              promiseForm = postAction(this.url+this.code,values)
            }else{
              let formData = Object.assign(this.model,values)
              promiseForm = putAction(this.url+this.code,formData)
            }
            promiseForm.then(res=>{
              this.confirmLoading = false;
              if(res.success){
                this.visible = false
                this.$message.success(res.message)
              }else{
                this.$message.warning(res.message)
              }
            })
          }
        })
      },
      handleCancel(){
        this.visible = false
      },
      show(code){
        this.code = code
        this.visible=true
        this.model = {
          buttonCode:'add',
          event:'end',
          cgJavaType:'spring',
          activeStatus:'1'
        }
        this.loadBtnList()
        this.handleQueryEnhjava('buttonCode')
      },
      loadBtnList(){
        getAction(this.btnUrl+this.code).then((res)=>{
          if(res.success){
            if(!res.result || res.result.length==0){
              this.btnList = []
            }else{
              //按钮过滤 java增强只看action按钮
              this.btnList = res.result.filter(item=>item.optType=='action')
            }
          }
        })
      },
      handleQueryEnhjava(field){
        const that = this
        let reqUrl = that.url;

        //判断是否切换了button
        if (field == 'buttonCode') {
          reqUrl = that.urlByButtonCode;
        }
        getAction(reqUrl+that.code,that.model).then((res)=>{
          if(res.success){
            that.model = res.result
          }else{
            that.model.id=''
            that.model.cgJavaValue=''
          }
          that.$nextTick(() => {
            that.form.setFieldsValue(pick(that.model,'cgJavaValue','buttonCode','event','cgJavaType','activeStatus'))
          });

        })
      },
      handleChangeEhjava(field,val){
        this.model[field] = val
        this.handleQueryEnhjava(field);
      },
      handleChangeEhjava2(field,val){
        this.model[field] = val
      }
    }
  }
</script>

<style scoped>

</style>