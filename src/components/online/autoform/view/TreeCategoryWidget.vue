<template>
  <formitem-wapper :formitem="formitem">
    <j-tree-select
      :pidValue="formitem.pidValue"
      :placeholder="placeholder"
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      dict="SYS_CATEGORY,NAME,ID"
      pidField="PID"
      hasChildField="HAS_CHILD"
      @change="handCatTreeChange"
      load-triggle-change>
    </j-tree-select>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JTreeSelect from '@/components/jeecg/JTreeSelect'

  export default {
    name: 'TreeCategoryWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JTreeSelect
    },
    methods:{
      handCatTreeChange(value,label){
        let res = {}

        res[this.formitem.textField] = label
        //console.log("eee",res)
        this.$bus.$emit('popupCallbackMinitor', res);
      }

    }
  }
</script>
