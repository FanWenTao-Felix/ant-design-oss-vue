<template>
  <component :is="comp" :formData="formData" v-if="comp"></component>
</template>
<script>
  export default {
    name: 'biz-dynamic-link',
    data() {
      return {
        compName: this.path
      }
    },
    computed: {
      comp: function () {
        console.log('组件名称：', this.compName);
        console.log('组件数据：', this.formData)
        return () => import(`@/views/${this.compName}.vue`)
      }
    },
    props: ['path', 'formData']
  }
</script>
