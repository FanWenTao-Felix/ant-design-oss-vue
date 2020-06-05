<template>
  <formitem-wapper :formitem="formitem">
    <j-checkbox
      :trigger-change="true"
      :options="formitem.listSource"
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]">
    </j-checkbox>
  </formitem-wapper>
</template>

<script>
  import JCheckbox from '@/components/jeecg/JCheckbox.vue';
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'

  export default {
    name: 'CheckboxWidget',
    mixins:[FormItemMixin],
    components:{
      JCheckbox,
      FormitemWapper
    },
    methods:{
      getAttrs(){
        let curWidgetAttr = this.widgetAttrs;
        return {
          ...curWidgetAttr
        }
      }
    }
  }
</script>

<style scoped>

</style>