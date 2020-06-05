<template>
  <a-col v-bind="colAttrs" v-show="showItem">
    <a-form-item v-bind="itemAttrs" :label="label" v-if="loadItem">
      <slot></slot>
    </a-form-item>
  </a-col>
</template>
<script>

import {FormItemMixin} from './FormItenMixin'
export default {
    name: 'FormitemWapper',
    mixins:[FormItemMixin],
    inject: ['sh'],
    computed: {
      showItem:{
        get(){
          if(this.formitem.type=='hidden'){
            return false
          }else{
            if(!this.formitem.subKey){
              return this.sh[this.formitem.key]
            }else{
              return this.sh[this.formitem.subKey][this.formitem.key]
            }
          }
        }
      },
      loadItem:{
        get(){
          if(!this.formitem.subKey){
            return this.sh[this.formitem.key+"_load"]
          }else{
            return this.sh[this.formitem.subKey][this.formitem.key+"_load"]
          }

        }
      }
    },
    data(){
      return {

      }
    }
}
</script>

<style scoped>

</style>