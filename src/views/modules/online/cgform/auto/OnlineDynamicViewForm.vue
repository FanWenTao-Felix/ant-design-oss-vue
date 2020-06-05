<template>
  <a-card :bordered="false" style="height: 100%">
    <onldf-component ref="onldf" :tb-name="tbName" :data-id="dataId" :show-footer="false"></onldf-component>
  </a-card>
</template>

<script>
import  OnldfComponent from './OnldfComponent.vue'
  export default {
    name: 'OnlineDynamicViewForm',
    components:{
      OnldfComponent
    },
    data(){
      return {
        tbName:"",
        dataId:""
      }
    },
    created(){
      this.tbName = this.$route.params.table
      this.dataId = this.$route.params.id
      //TODO 可以考虑不通过prop传参 而是通过方法传参
      this.$nextTick(() => {
        this.$refs.onldf.loadFormItems()
      });
    }

  }
</script>
