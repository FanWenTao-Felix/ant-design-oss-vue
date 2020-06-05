<template>
  <a-card :bordered="false" style="height: 100%">
    <onldf-component ref="compo" :tb-name="tbName" :data-id="dataId" :taskId="taskId" :show-footer="true"></onldf-component>
  </a-card>
</template>

<script>
import  OnldfComponent from '@/views/modules/online/cgform/auto/OnldfComponent'
  export default {
    name: 'OnlineFormOpt',
    props: ['formData'],
    components:{
      OnldfComponent
    },
    data(){
      return {
        tbName:"",
        dataId:"",
        taskId:"",
      }
    },
    created(){
      console.log("OnlineFormDetail start");
      console.log("formdata",this.formData);
      //update--begin--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
      //节点配置表单URL，VUE组件类型对应的拓展参数
      let extendUrlParams = this.formData.extendUrlParams;
      if(extendUrlParams && extendUrlParams.view){
        this.tbName = extendUrlParams.view;
      }else{
        this.tbName = this.formData.tableName;
      }
      //update--end--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
      this.dataId = this.formData.dataId;
      this.taskId = this.formData.taskDefKey;
      this.$nextTick(() => {
        this.$refs.compo.loadFormItems()
      });

    }

  }
</script>
