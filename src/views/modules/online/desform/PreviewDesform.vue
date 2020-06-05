<template>
  <a-card :bordered="false">
    <desform-view v-bind="viewProps" @success="handleSuccess"/>
  </a-card>
</template>

<script>
  import DesformView from '@/components/online/desform/DesformView'

  export default {
    name: 'PreviewDesform',
    components: { DesformView },
    data() {
      return {
        desformCode: this.$route.params.desformId,
        dataId: this.$route.query.did || null
      }
    },
    watch: {
      '$route'() {
        this.desformCode = this.$route.params.desformId
        this.dataId = this.$route.query.did || null
      }
    },
    computed: {
      viewProps() {
        return {
          mode: this.dataId == null ? 'add' : 'edit',
          desformCode: this.desformCode,
          dataId: this.dataId
        }
      }
    },
    created(){
      console.log(this.$route)
    },
    methods: {
      handleSuccess(event) {
        event.target.reload()
      }
    }
  }
</script>

<style scoped>

</style>