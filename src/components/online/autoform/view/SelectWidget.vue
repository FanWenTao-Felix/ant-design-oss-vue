<template>
  <formitem-wapper :formitem="formitem">
    <a-select :getPopupContainer="getModalAsContainer" :placeholder="placeholder" v-bind="widgetAttrs" v-decorator="[formitem.key,formitem.fieldDecoratorOptions]" allowClear>
      <a-select-option
        v-for="(item,index) in formitem.listSource"
        :key="index"
        :value="item.value">
        <span style="display: inline-block;width: 100%" :title="item.label">
          {{ item.label }}
        </span>
      </a-select-option>
    </a-select>
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
    },

  }
</script>

<style scoped>

</style>