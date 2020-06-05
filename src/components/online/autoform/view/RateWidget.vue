<template>
  <formitem-wapper :formitem="formitem">
    <a-rate v-bind="widgetAttrs" v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"/>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'

  export default {
    name: 'RateWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper
    },

  }
</script>

<style scoped>

</style>