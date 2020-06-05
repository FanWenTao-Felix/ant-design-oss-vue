<template>
  <formitem-wapper :formitem="formitem">
    <j-markdown-editor v-decorator="[formitem.key,{initialValue:''}]" :id="formitem.key"></j-markdown-editor>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JMarkdownEditor from '@/components/jeecg/JMarkdownEditor/index'

  export default {
    name: 'MarkdownWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,
      JMarkdownEditor
    }
  }
</script>
