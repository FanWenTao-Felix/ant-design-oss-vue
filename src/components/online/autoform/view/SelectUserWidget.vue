<template>
  <formitem-wapper :formitem="formitem">
    <j-select-user-by-dep
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :trigger-change="true"
      :placeholder="placeholder">
    </j-select-user-by-dep>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JSelectUserByDep from '@/components/jeecgbiz/JSelectUserByDep'

  export default {
    name: 'SelectUserWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JSelectUserByDep
    }
  }
</script>
