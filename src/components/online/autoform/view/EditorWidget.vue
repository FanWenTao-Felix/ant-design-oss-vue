<template>
  <formitem-wapper :formitem="formitem">
    <j-editor
      v-decorator="[formitem.key,{rules:formitem.rules,trigger:'input'}]">
      :disabled="disabled"
      @onClick="onClick"
      ref="editor"></j-editor>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import JEditor from '@/components/jeecg/JEditor.vue';


  export default {
    name: 'EditorWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper,JEditor
    },
    data(){
      return {
        msg: 'Welcome to Use Tinymce Editor',
        disabled: false
      }
    },
    mounted(){

    },
    methods:{
      //鼠标单击的事件
      onClick(e, editor) {
        console.log('Element clicked')
        console.log(e)
        console.log(editor)
      },
      //清空内容
      clear() {
        this.$refs.editor.clear()
      }
    }

  }
</script>

<style scoped>

</style>