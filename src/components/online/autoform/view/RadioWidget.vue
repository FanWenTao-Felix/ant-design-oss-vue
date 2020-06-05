<template>
  <formitem-wapper :formitem="formitem">
    <a-radio-group v-bind="widgetAttrs" v-decorator="[formitem.key,formitem.fieldDecoratorOptions]">
      <a-radio
        v-for="(item,index) in formitem.listSource"
        :key="index"
        :value="item.value"
        v-if="!formitem.ui.button">
        {{ item.label }}
      </a-radio>
      <a-radio-button
        v-for="(item,index) in formitem.listSource"
        :key="index"
        :value="item.value"
        v-if="formitem.ui.button">
        {{ item.label }}
      </a-radio-button>
    </a-radio-group>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'

  export default {
    name: 'RadioWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper
    },

  }
</script>

<style scoped>

</style>