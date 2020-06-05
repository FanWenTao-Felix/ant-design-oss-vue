<template>
  <formitem-wapper :formitem="formitem">
    <input v-decorator="[formitem.key,formitem.hiddenProp]"/>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'

  export default {
    name: 'InputWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper
    }

  }
</script>

<style scoped>

</style>