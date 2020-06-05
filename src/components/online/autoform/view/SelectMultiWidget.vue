<template>
  <formitem-wapper :formitem="formitem">
    <j-multi-select-tag
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :trigger-change="true"
      :placeholder="placeholder"
      :options="formitem.listSource">
    </j-multi-select-tag>
  </formitem-wapper>
</template>

<script>
  import { FormItemMixin } from './../FormItenMixin'
  import FormitemWapper from './../FormitemWapper.vue'
  import JMultiSelectTag from '@/components/dict/JMultiSelectTag'

  export default {
    name: 'SelectMultiWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JMultiSelectTag
    }
  }
</script>

<style scoped>

</style>