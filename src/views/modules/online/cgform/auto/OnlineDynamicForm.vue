<template>
  <a-card :bordered="false" style="height: 100%">
    <onldf-component ref="compo" :tb-name="tbName" :data-id="dataId" :show-footer="true"></onldf-component>
  </a-card>
</template>

<script>
import  OnldfComponent from './OnldfComponent.vue'
  export default {
    name: 'OnlineDynamicForm',
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
      this.$nextTick(() => {
        this.$refs.compo.loadFormItems()
      });

    }

  }
</script>
