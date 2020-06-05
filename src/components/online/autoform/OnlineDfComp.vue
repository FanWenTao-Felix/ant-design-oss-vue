<template>
  <a-form style="margin-top: 8px" :form="form">
    <online-form-item :properties="rootProperties"></online-form-item>

    <a-tabs defaultActiveKey="0" v-if="subTabInfo && subTabInfo.length>0">
      <a-tab-pane v-for="(sub,index) in subTabInfo" :tab="sub.describe" :key="index+''" :forceRender="true">
        <div style="overflow-y:auto;overflow-x:hidden;max-height: 300px;" v-if="sub.relationType==1">
          <j-form-container disabled>
            <online-sub-form
              slot="detail"
              :ref="sub.key"
              :main-id="model.id"
              :table="sub.key"
              :properties="subProperties[sub.key]"/>
          </j-form-container>
        </div>

        <j-editable-table
          v-else
          :ref="sub.key"
          :loading="false"
          :columns="sub.columns"
          :dataSource="subDataSource[sub.key]"
          :maxHeight="300"
          :rowNumber="true"
          :rowSelection="true"
          :actionButton="true"/>
      </a-tab-pane>
    </a-tabs>

    <div style="width: 100%;text-align: center;margin-top:5px" v-if="showFooter">
      <a-button icon="check" style="width: 126px" type="primary" @click="handleSubmit" :loading="submiting">
        提交
      </a-button>
    </div>

  </a-form>
</template>

<script>
  import OnlineFormItem from './OnlineFormItem.vue'
  import OnlineSubForm from './OnlineSubForm.vue'
  import FormProperty from './model/FormProperty'
  import { httpAction } from '@/api/manage'
  import { getUploadFileList,getFilePaths } from './model/UploadFile'
  import pick from 'lodash.pick'
  import JCheckbox from '@/components/jeecg/JCheckbox'
  import JEditableTable from '@/components/jeecg/JEditableTable'
  import { getRefPromise,validateFormAndTables } from '@/utils/JEditableTableUtil'
  import JFormContainer from '@/components/jeecg/JFormContainer'

  export default {
    name: 'OnlineDfComp',
    components:{
      OnlineFormItem,JCheckbox,JEditableTable,OnlineSubForm,JFormContainer
    },
    provide(){
      return {
        sh:this.sh
      }
    },
    data(){
      return {
        form:this.$form.createForm(this),
        rootProperties:[],
        submiting:false,
        url:"",
        submitMethod:"",
        model:"",
        showFields:[],
        fileFields:[],
        hasTab:false,
        subTabInfo:[],
        subDataSource:{

        },
        sh:{},
        subProperties:{}
      }
    },
    props:{
      formSchema:{
        type: Object,
        default:()=>{},
        required: true
      },
      showFooter:{
        type:Boolean,
        default:false,
        required: false
      },
      single:{
        type:Boolean,
        default:true,
        required: false
      }

    },
    created(){
      this.$bus.$on('popupCallbackMinitor', (row)=>{
        this.form.setFieldsValue(row)
      });
    },
    beforeDestroy () {
      this.$bus.$off('popupCallbackMinitor');
    },
    mounted(){
      console.log("表单的formschema1",this.formSchema)
      //this.footerItemattr = this.uiSchema.footerItemattr
    },
    watch:{
      formSchema:{
        handler(){
          this.createRootProperties();
        },
        deep:true
      }
    },
    methods:{
      createRootProperties(){
        const properties = this.formSchema.properties;
        if(!properties){
          console.error("表单formSchema.properties不存在")
          return false
        }
        const formTemplate = this.formSchema.formTemplate
        let rootProperties = []
        let subInfo=[]
        let wdattr = {}
        if(!this.showFooter){
          wdattr = {
            widgetattrs:{
              disabled:true
            }
          }
        }
        Object.keys(properties).map((key) => {
          const item = properties[key];
          if(item.view=='tab'){
            this.subDataSource[key]=[]
            subInfo.push(item)
            console.log(item)
            if(item.relationType==1){
              this.initSubProperties(item,key)
            }

          }else{
            this.$set(this.sh,key,true)
            this.$set(this.sh,key+"_load",true)
            rootProperties.push(new FormProperty(key, item, wdattr, this.formSchema.required,formTemplate))
          }
        });
        if(subInfo.length>0){
          this.hasTab=true
          subInfo.sort((one,next)=>{return one.order-next.order; })
          this.subTabInfo=[...subInfo]
        }else{
          this.hasTab=false
          this.subTabInfo=[]
        }
        console.log("this.subDataSource",this.subDataSource);
        console.log("this.subTabInfo",this.subTabInfo);
        rootProperties.sort((one,next)=>{return one.formSchema.order-next.formSchema.order; })
        this.rootProperties = rootProperties
      },
      clearForm(){
        this.form.resetFields();
        this.model="";
        this.showFields=[];
        this.fileFields=[];
        //this.subTabInfo=[];
        //this.subDataSource={}
        //this.hasTab=false
      },
      show(){
       // this.clearForm()
        this.form.resetFields();
        this.model="";
        this.showFields=[];
        this.fileFields=[];

        this.url = this.formSchema.url
        this.submitMethod = this.formSchema.method
        let currFormShowFields = [],currFileFields=[];
        const properties = this.formSchema.properties;
        Object.keys(properties).forEach(function(key){
          const item = properties[key];
          if(item.view.indexOf("upload")>=0||item.view.indexOf("file")>=0||item.view.indexOf("image")>=0){
            currFileFields.push(key)
          }else if(!item.hidden){
            if(item.view!='tab'){
              currFormShowFields.push(key)
            }
          }
        })
        this.showFields = [...currFormShowFields]
        this.fileFields = [...currFileFields]
        console.log("show")
      },
      edit(record){
        this.show();
        this.model = Object.assign({}, record);
        console.log("<<<<<====================>>>>>")
        console.log(this.showFields);
        console.log(this.model);
        console.log("<<<<<====================>>>>>")
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,...this.showFields))
          this.initFileFieldsValue(record)
          console.log("123",this.subDataSource)
          Object.keys(this.subDataSource).forEach(key=>{
            this.subDataSource[key] = this.model[key]
          });
          console.log("this.subDataSource123===>>>",this.subDataSource)
        });
      },

      initFileFieldsValue(record){
        if(this.fileFields && this.fileFields.length>0){
          for(var a=0;a<this.fileFields.length;a++){
            let fieldKey = this.fileFields[a];
            let fileVal = {}
            fileVal[fieldKey] = getUploadFileList(record[fieldKey])
            this.form.setFieldsValue(fileVal);
          }
        }
      },
      transFileListToString(values){
        if(this.fileFields && this.fileFields.length>0){
          for(var a=0;a<this.fileFields.length;a++){
            let fieldKey = this.fileFields[a];
            let path = getFilePaths(values[fieldKey])
            values[fieldKey] = path
          }
        }
      },
      detail(record){
        this.show();
        this.model = Object.assign({}, record);
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,...this.showFields))
          this.initFileFieldsValue(record)
        });
      },
      handleApplyRequest(formData){
        this.submiting = true
        httpAction(this.url,formData,this.submitMethod).then((res)=>{
          console.log(res)
          this.submiting = false
          if(res.success){
            this.$emit("onSuccess",formData)
            this.$message.success(res.message)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      handleOne2ManySubmit(){
        this.getAllTable().then(tables => {
          let arr = []
          if(tables && tables.length>0){
            tables.forEach(item=>{
              if(Array.isArray(item)){
                arr.push(item[0])
              }else{
                arr.push(item)
              }
            })
          }
          return validateFormAndTables(this.form, arr)
        }).then(allValues => {
          let formData = Object.assign({},this.model,allValues.formValue)
          this.transFileListToString(formData)
          let keys = Object.keys(this.subDataSource);
          for(let a=0;a<keys.length;a++){
            formData[keys[a]] = allValues.tablesValue[a].values
          }
          console.log("提交的表单数据为",formData)
          this.handleApplyRequest(formData)
        })
      },
      handleSingleSubmit(){
        this.form.validateFields((err, values) => {
          if (!err) {
            this.transFileListToString(values)
            let formData = Object.assign(this.model,values)
            console.log("提交的表单数据为",formData)
            this.handleApplyRequest(formData)
          }
        })
      },
      handleSubmit(){
        if(this.single){
          this.handleSingleSubmit()
        }else{
          this.handleOne2ManySubmit()
        }
      },
      getAllTable() {
        let arr = [];
        const that = this
        Object.keys(that.subDataSource).forEach(key=>{
          arr.push(getRefPromise(that, key))
        });
        console.log(arr);
        return Promise.all(arr)
      },

      initSubProperties(formSchema,tbname){
        const formTemplate = formSchema.formTemplate
        let subProperties=[]
        let showOrHidden = {}
        Object.keys(formSchema.properties).map((key) => {
          const item = formSchema.properties[key];
          showOrHidden[key]=true
          showOrHidden[key+"_load"]=true
          let fp = new FormProperty(key, item, '', formSchema.required,formTemplate)
          fp.subKey=tbname
          subProperties.push(fp)
        });
        this.$set(this.sh,tbname,showOrHidden)
        subProperties.sort((one,next)=>{return one.formSchema.order-next.formSchema.order; })
        this.subProperties[tbname] = subProperties
        this.aaaca = [...subProperties]
      },

    }
  }
</script>

<style scoped>

</style>