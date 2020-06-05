<template>
  <formitem-wapper :formitem="formitem">
    <a-input
      :placeholder="placeholder"
      v-bind="widgetAttrs"
      type="password"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"/>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'

  export default {
    name: 'PasswordWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper
    },

  }
</script>

<style scoped>

</style>