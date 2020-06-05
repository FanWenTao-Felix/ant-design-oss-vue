<template>

  <cgform-auto-list-table
    :url="{}"
    :table="table"
    :isorter="isorter"
    :show-alert-bar="false"
    :buttonSwitch="{}" :cgButtonLinkList="[]" currentTableName="" :checkboxFlag="false" :hasBpmStatus="false" :scrollFlag="0"
  />

</template>

<script>
  import { getAction } from '@api/manage'
  import CgformAutoListTable from '../common/CgformAutoListTable'
  import CgformAutoListMixins from '../common/CgformAutoListMixins'

  export default {
    name: 'AutoInnerSubTable',
    mixins: [CgformAutoListMixins],
    components: { CgformAutoListTable },
    props: {
      record: {
        type: Object,
        default: () => ({}),
      },
      subTable: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        code: this.subTable.id,
      }
    },
    watch: {
      record: {
        immediate: true,
        handler() {
          if (this.record != null) {
            this.initialAutoList()
          }
        }
      }
    },
    methods: {

      initialAutoList() {
        this.code = this.subTable.id
        if (!this.code) {
          return false
        }
        // 加载列和行数据
        if (this.table.columns.length === 0) {
          this.loadAll()
        } else {
          this.loadData(1)
        }
      },

      loadData() {
        this.table.loading = true
        this.table.dataSource = []
        return getAction(`/online/cgform/api/subform/list/${this.subTable.key}/${this.record.id}`).then(res => {
          if (res.success) {
            this.table.dataSource = res.result
          }
        }).finally(() => {
          this.table.loading = false
        })
      }

    },
  }
</script>

<style scoped>
  @import '~@/assets/less/TableExpand.less';
</style>