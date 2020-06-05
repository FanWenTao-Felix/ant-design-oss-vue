<template>
  <div class="cust-onl-form">
    <a-spin :spinning="formLoading">
      <online-df-comp
        ref="df"
        @onSuccess="handleSuccess"
        :form-schema="schema"
        :showFooter="showFooter"
        :single="single">
      </online-df-comp>
    </a-spin>
  </div>
</template>

<script>
  import OnlineDfComp from '@/components/online/autoform/OnlineDfComp.vue';
  import { getAction } from '@/api/manage'
  export default {
    name: 'OnldfComponent',
    components:{
      OnlineDfComp
    },
    props:{
      showFooter:{
        type:Boolean,
        default:false,
        required: false
      },
      dataId:{
        type: String,
        default:"",
        required: true
      },
      tbName:{
        type: String,
        default:"",
        required: true
      },
      taskId:{
        type: String,
        default:"",
        required: false
      }
    },
    data(){
      return {
        formLoading:false,
        optMethod:"post",
        url:{
          loadFormItems:"/online/cgform/api/getFormItemBytbname/",
          loadEnhanceJs:"/online/cgform/api/getEnhanceJs/",
          optPre:"/online/cgform/api/form/"
        },
        schema:{},
        uiSchema:{
        },
        EnhanceJS:'',
        single:true
      }
    },
    created(){
      //this.loadFormItems()
    },
    mounted(){

    },
    methods:{
      loadFormItems(){
        getAction(`${this.url.loadFormItems}${this.tbName}`,{taskId:this.taskId}).then((res)=>{
          console.log("动态表单查询结果是：",res)
          if(res.success){
            this.single = res.result.head.tableType==1
            let otherProp = {
              formTemplate:res.result.head.formTemplate,
              method:"put",
              url:this.url.optPre+res.result.head.id
            }
            this.schema = Object.assign({},res.result.schema,otherProp)
            let getDataUrl = this.url.optPre+res.result.head.id+"/"+this.dataId
            this.edit(getDataUrl)
          }
        });
      },
      edit (url) {
        getAction(url).then((res)=>{
          if(res.success){
            let record = res.result
            this.$refs.df.edit(record)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      handleSuccess(values){
        console.log("数据提交完成",values)
        // this.$refs.df.edit(values)
      }
    }
  }
</script>

<style scoped>
  .cust-onl-form .ant-input-disabled {
    background-color: #fff;
    color: #000;
  }
  .cust-onl-form .ant-select-disabled .ant-select-selection {
    background: #fff;
    color: #000;
  }
  .cust-onl-form .ant-input-number-disabled {
    background-color: #fff;
    color: #000;
  }
</style>