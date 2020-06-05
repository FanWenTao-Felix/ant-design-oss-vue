<template>
  <formitem-wapper :formitem="formitem">
    <j-switch v-decorator="[formitem.key]" :options="formitem.switchOptions"></j-switch>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JSwitch from '@/components/jeecg/JSwitch'

  export default {
    name: 'SwitchWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JSwitch
    },

  }
</script>

<style scoped>

</style>