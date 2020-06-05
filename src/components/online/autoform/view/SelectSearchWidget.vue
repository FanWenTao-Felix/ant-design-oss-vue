<template>
  <formitem-wapper :formitem="formitem">
    <j-search-select-tag
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :dict="getDictInfo"
      :trigger-change="true"
      :placeholder="placeholder">
    </j-search-select-tag>

  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import { FormItemMixin } from './../FormItenMixin'
  import JSearchSelectTag from '@/components/dict/JSearchSelectTag'

  export default {
    name: 'SelectSearchWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JSearchSelectTag
    },
    computed: {
      // update-start -- author:sunjianlei -- date:20200115 -- for: 下拉搜索表字典参数配置有误时会导致页面崩溃，换成计算属性就没事
      getDictInfo(){
        if(!this.formitem.dictTable || !this.formitem.dictCode ||!this.formitem.dictText){
          this.$message.warning("表字典搜索组件参数接收有误,请检查字典配置!");
          return
        }

        let tableName = ''
        let sql = ''
        if(this.formitem.dictTable.indexOf('where')>0){
          let arr = this.formitem.dictTable.split('where')
          sql = ','+ encodeURIComponent(arr[1])
          tableName = arr[0].trim()
        }else{
          tableName = this.formitem.dictTable
        }
        return tableName+","+this.formitem.dictText+","+this.formitem.dictCode+sql
      }
      // update-end -- author:sunjianlei -- date:20200115 -- for: 下拉搜索表字典参数配置有误时会导致页面崩溃，换成计算属性就没事
    }
  }
</script>
