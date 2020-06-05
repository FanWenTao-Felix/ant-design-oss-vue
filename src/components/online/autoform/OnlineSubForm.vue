<template>
  <a-form style="margin-top: 8px" :form="form">
    <online-form-item :properties="properties"></online-form-item>
  </a-form>
</template>

<script>
  import pick from 'lodash.pick'
  import OnlineFormItem from './OnlineFormItem.vue'
  import { getAction } from '@/api/manage'
  import { getUploadFileList,getFilePaths } from './model/UploadFile'

  export default {
    name: 'OnlineSubForm',
    components:{
      OnlineFormItem,
    },
    data(){
      return {
        form: this.$form.createForm(this),
        rootProperties:[],
        model:"",
        showFields:[],
        url:"/online/cgform/api/subform",
        submitMethod:"",
        fileFields:[]
      }
    },
    props:{
      properties:{
        type: Array,
        default:()=>[],
        required: true
      },
      mainId:{
        type:String,
        default:"",
        required: false
      },
      table:{
        type:String,
        default:"",
        required: false
      }
    },

    created(){
      if(this.table){
        this.$bus.$on('pcm'+this.table, (row)=>{
          this.form.setFieldsValue(row)
        });
      }
    },
    beforeDestroy () {
      this.$bus.$off('pcm'+this.table);
    },
    mounted(){
      console.log("subform--mounted",this.mainId)
      this.loadFormData();
    },
    watch:{
      table(val){
        if(val){
          this.$bus.$on('pcm'+this.table, (row)=>{
            this.form.setFieldsValue(row)
          });
        }
        this.loadFormData();
      },
      mainId(){
        console.log("subform--watch",this.mainId)
        this.loadFormData();
      },
      properties:{
        immediate:true,
        handler(){
          this.show()
        }
      }
    },
    methods:{
      loadFormData(){
        this.model="";
        this.form.resetFields();
        // update-begin--author:sunjianlei --- date:20191111 --- for: 每次加载数据的时候都重新执行一遍填值规则 -----------
        this.$emit('executeFillRule', {form:this.form, target: this})
        // update-end--author:sunjianlei --- date:20191111 --- for: 每次加载数据的时候都重新执行一遍填值规则 -----------
        if(!this.table || !this.mainId){
          return;
        }
        getAction(`${this.url}/${this.table}/${this.mainId}`).then(res=>{
          if(res.success){
            this.model = res.result
            this.$nextTick(() => {
              this.form.setFieldsValue(pick(this.model,...this.showFields))
              this.initFileFieldsValue(res.result)
            });
          }else{
            console.log(res.message)
          }
        })
      },
      show(){
        this.showFields=[];
        let currFormShowFields = []
        let currFileFields = []
        for(let item of this.properties){
          if(item.type.indexOf("upload")>=0||item.type.indexOf("file")>=0||item.type.indexOf("image")>=0){
            currFileFields.push(item.key)
          }else{
            currFormShowFields.push(item.key)
          }
        }
        this.fileFields = [...currFileFields]
        this.showFields = [...currFormShowFields]
      },
      getAll(){
        return new Promise((resolve, reject) => {
          this.form.validateFields((err, values) => {
            if (!err) {
              this.transFileListToString(values)
              let formData = Object.assign({},this.model,values)
              let arr=[]
              arr.push(formData)
              let obj = {}
              obj[this.table] = arr
              resolve(obj)
            }else{
              reject()
            }
          })
        })
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

    }
  }
</script>
