<template>
  <formitem-wapper :formitem="formitem">
    <a-input-number
      :placeholder="placeholder"
      v-bind="getAttrs()"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"/>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'

  export default {
    name: 'NumberWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper
    },
    methods:{
      getAttrs(){
        let curWidgetAttr = this.widgetAttrs;
        let attr = {
          style:{
            width:"100%"
          },
          ...curWidgetAttr
        }
        if(this.formitem.onlyInteger){
          attr['precision']=0
        }
        return attr
      }
    }

  }
</script>

<style scoped>

</style>