<template>
  <formitem-wapper :formitem="formitem">
    <j-select-depart
      :multi="true"
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :trigger-change="true"
      :placeholder="placeholder">
    </j-select-depart>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JSelectDepart from '@/components/jeecgbiz/JSelectDepart'

  export default {
    name: 'SelectDepartWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JSelectDepart
    }
  }
</script>
