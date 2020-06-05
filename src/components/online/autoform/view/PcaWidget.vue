<template>
  <formitem-wapper :formitem="formitem">
    <j-area-linkage
      type="cascader"
      v-bind="widgetAttrs"
      v-decorator="[formitem.key]"
      :placeholder="placeholder">
    </j-area-linkage>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JAreaLinkage from '@comp/jeecg/JAreaLinkage'

  export default {
    name: 'PcaWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JAreaLinkage
    }
  }
</script>
