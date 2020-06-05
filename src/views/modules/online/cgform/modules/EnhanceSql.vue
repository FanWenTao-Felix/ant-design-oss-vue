<template>
  <a-modal
    title="SQL增强"
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
        <a-select v-decorator="[ 'buttonCode']" placeholder="请选择页面控件" @change="handleChangeType" :getPopupContainer="node => node.parentNode">
          <a-select-option value="add">新增</a-select-option>
          <a-select-option value="edit">编辑</a-select-option>
          <a-select-option value="delete">删除</a-select-option>
          <template v-for="(item,index) in btnList">
            <a-select-option :key="index" :value="item.buttonCode">{{ item.buttonName }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="增强SQL" :labelCol="labelCol" :wrapperCol="wrapperCol" >
        <div class="coder-cust-height">
          <j-code-editor
            ref="codeEditor"
            language="sql"
            placeholder="请输入SQL语句"
            :language-change="false"
            :lineNumbers="false"
            :fullScreen="true"
            @input="handleInputCgbSql"></j-code-editor>
        </div>
        <a-textarea :hidden="true" v-decorator="['cgbSql']"/>
      </a-form-item>

      <a-form-item label="描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea :rows="2" placeholder="请输入描述" v-decorator="[ 'content']" ></a-textarea>
      </a-form-item>

    </a-form>
  </a-modal>
</template>

<script>
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import { postAction,getAction,putAction } from '@/api/manage'
  import JCodeEditor from '@/components/jeecg/JCodeEditor.vue'
  import pick from 'lodash.pick'

  export default {
    name: 'EnhanceSql',
    components: { ATextarea,JCodeEditor },

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
        url:'/online/cgform/head/enhanceSql/',
        model:{}
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
        this.handleChangeType('add')
        this.loadBtnList()

      },
      loadBtnList(){
        getAction(this.btnUrl+this.code).then((res)=>{
          if(res.success){
            if(!res.result || res.result.length==0){
              this.btnList = []
            }else{
              //按钮过滤 SQL增强只看action按钮
              this.btnList = res.result.filter(item=>item.optType=='action')
            }
          }
        })
      },
      handleInputCgbSql(value) {
        this.form.setFieldsValue({ cgbSql: value })
      },
      handleChangeType(val){
        const that = this
        getAction(that.url+that.code,{buttonCode:val}).then((res)=>{
          if(res.success){
            that.model = res.result
            console.log("this.model",this.model)
            that.$nextTick(() => {
              that.form.setFieldsValue(pick(that.model,'buttonCode','content','cgbSql'))
              this.$refs.codeEditor.setCodeContent(this.model.cgbSql || '')
            });
          }else{
            that.model ={}
            that.$nextTick(() => {
              that.form.setFieldsValue({'content':'','cgbSql':'','buttonCode':val})
              this.$refs.codeEditor.setCodeContent('')
            });
          }

        })
      }
    }
  }
</script>

<style scoped>
.coder-cust-height {
  height:330px
}
.coder-cust-height .full-screen-parent{
  height: 100%;
}
</style>