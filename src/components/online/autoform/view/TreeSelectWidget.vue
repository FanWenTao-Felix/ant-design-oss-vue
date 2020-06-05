<template>
  <formitem-wapper :formitem="formitem">
    <j-tree-select
      ref="jTreeSelect"
      :placeholder="placeholder"
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :dict="formitem.dict"
      :pidField="formitem.pidField"
      :pidValue="formitem.pidValue"
      :hasChildField="formitem.hasChildField"
      @change="handleTreeChange">
    </j-tree-select>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JTreeSelect from '@/components/jeecg/JTreeSelect'

  export default {
    name: 'TreeSelectWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JTreeSelect
    },
    data(){
      return {
        expandedRowKeys:[]
      }
    },
    created(){
      this.expandedRowKeys = []
    },
    methods:{
      handleTreeChange(value){
        if(this.formitem.isPidComponent===true){
          //如果是 树形列表的表单 pid组件 需要找到所有展开的列表
          let all = this.$refs.jTreeSelect.getCurrTreeData();
          this.expandedRowKeys=[]
          this.getExpandKeysByPid(value, all, all);
          let obj = {
            type: 'treeListAddEvent',
            expandedRowKeys: this.expandedRowKeys.reverse()
          }
          this.$bus.$emit('popupCallbackMinitor', obj);
        }
      },
      getExpandKeysByPid(pid,arr,all){
        if(pid && arr && arr.length>0){
          for(let i=0;i<arr.length;i++){
            if(arr[i].key==pid){
              this.expandedRowKeys.push(arr[i].key)
              this.getExpandKeysByPid(arr[i]['parentId'],all,all)
            }else{
              this.getExpandKeysByPid(pid,arr[i].children,all)
            }
          }
        }
      },
    }
  }
</script>
