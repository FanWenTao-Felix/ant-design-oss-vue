<template>
  <a-modal
    title="JS增强"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    wrapClassName="ant-modal-cust-warp"
    style="top:5%;height: 95%;">

    <a-form style="height: 100%;">
      <j-code-editor
        ref="codeEditor"
        :value="cgJs"
        language="javascript"
        :fullScreen="true"
        :lineNumbers="false"
        @input="handleCodeChange"
        :language-change="false"></j-code-editor>
      <a-select
        :class="{'valid-error-cust':validError,'js-type-select':true}"
        size="small"
        v-model="cgJsType"
        placeholder="请选择增强类型"
        @change="handleChangeType"
        :getPopupContainer="node => node.parentNode">
        <a-select-option value="form">form</a-select-option>
        <a-select-option value="list">list</a-select-option>
      </a-select>
    </a-form>

    <template slot="footer">

      <a-button key="back" @click="handleCancel">关闭</a-button>

      <a-button key="submit" type="primary" @click="handleSubmit">确定</a-button>

      <a-button v-if="showHistory" type="link" style="float: left" @click="handleWatchHistory">查看历史版本</a-button>
    </template>

    <enhance-history ref="historyModal"></enhance-history>
  </a-modal>
</template>

<script>
  import { postAction,getAction,putAction } from '@/api/manage'
  import JCodeEditor from '@/components/jeecg/JCodeEditor.vue'
  import EnhanceHistory from './EnhanceHistory'

  export default {
    name: 'EnhanceJs',
    components: { JCodeEditor, EnhanceHistory },
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
        url:'/online/cgform/head/enhanceJs/',
        model:{},
        cgJsType:[],
        cgJs:'',
        code:'',
        validError: false,
        showHistory: false,
        codeChange: false
      }
    },
    methods:{
      handleSubmit(){
        if(!this.cgJsType || this.cgJsType.length==0){
          this.$message.warning("请选择增强类型！")
          this.validError = true
          return false
        }
        this.validError = false
        let formData = {
          cgJs:this.$refs.codeEditor.getCodeContent(),
          cgJsType:this.cgJsType
        }
        let promiseForm;
        if(!this.model.id){
          promiseForm = postAction(this.url+this.code,formData)
        }else{
          let updateFormData = Object.assign({},this.model,formData)
          promiseForm = putAction(this.url+this.code,updateFormData)
        }
        promiseForm.then(res=>{
          this.confirmLoading = false;
          if(res.success){
            this.addLocalRecord(formData);
            this.visible = false
            this.$message.success(res.message)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      handleCancel(){
        this.visible = false
      },
      show(code){
        this.cgJs=''
        this.validError = false
        this.codeChange = false
        this.code = code
        let arr = this.$store.getters.enhanceJs(code)
        console.log("enhance js show ",arr)
        if(arr && arr.length>0){
          this.cgJsType = arr[arr.length-1].type
          this.showHistory = true
        }else{
          this.showHistory = false
        }
        this.visible=true
        if(!this.cgJsType || this.cgJsType.length==0){
          this.handleChangeType('list')
        }else{
          this.handleChangeType(this.cgJsType)
        }
        /*this.$nextTick(() => {
          this.$refs.codeEditor.setCodeContent('')
        });*/

      },
      handleChangeType(val){
        const that = this
        that.cgJsType = val
        getAction(that.url+that.code,{type:val}).then((res)=>{
          if(res.success){
            that.model = res.result
            that.$nextTick(() => {
              that.cgJs=that.model.cgJs
              this.$refs.codeEditor.setCodeContent( that.cgJs)
            });
          }else{
            that.model ={}
            that.$nextTick(() => {
              that.cgJs=''
              this.$refs.codeEditor.setCodeContent(that.cgJs)
            });
          }
        })
      },
      addLocalRecord(formData){
        if(this.codeChange === true){
          let record = {
            code: this.code,
            str: formData.cgJs,
            type: formData.cgJsType,
            date: new Date().getTime()
          }
          this.$store.dispatch("addEhanceRecord",record);
        }
      },
      handleWatchHistory(){
        this.$refs.historyModal.show(this.code, this.cgJsType)
      },
      handleCodeChange(value){
        if(this.cgJs != value){
          this.codeChange = true
          this.cgJs = value
        }

      }
    }
  }

</script>

<style scoped>
  .js-type-select{
    position:absolute;
    z-index:10;
    right:58px;
    top:80px;
    max-width:146px;
  }
</style>