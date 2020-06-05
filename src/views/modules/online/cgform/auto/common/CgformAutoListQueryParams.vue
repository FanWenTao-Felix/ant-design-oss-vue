<template>
  <div class="table-page-search-wrapper">
    <a-form layout="inline" @keyup.enter.native="handleSearchQuery">
      <a-row :gutter="24" v-if="queryInfo && queryInfo.length > 0">
        <template v-for="(item, index) in queryInfo">
          <a-col :key="`query${index}`" :xl="6" :lg="7" :md="8" :sm="24" v-show="item.hidden !== '1' || showMoreQueryParams">
            <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"/>
          </a-col>
        </template>
        <a-col :xl="6" :lg="7" :md="8" :sm="24">
          <div class="table-page-search-submitButtons table-operator">
            <a-button type="primary" icon="search" @click="handleSearchQuery">查询</a-button>
            <a-button type="primary" icon="reload" @click="handleSearchReset">重置</a-button>
            <a-button type="link" @click="handleToggleSearch">
              {{ showMoreQueryParams ? '收起' : '展开' }}
              <a-icon :type="showMoreQueryParams ? 'up' : 'down'"/>
            </a-button>
          </div>
        </a-col>

      </a-row>
    </a-form>
  </div>
</template>

<script>
  import { getAction } from '@/api/manage'
  import OnlineQueryFormItem from '@/components/online/autoform/OnlineQueryFormItem'

  export default {
    name: 'CgformAutoListQueryParams',
    inject: ['handleSearchQuery', 'handleSearchReset'],
    components: { OnlineQueryFormItem, },
    props: {
      url: {
        type: Object,
        required: true,
      },
      queryParam: Object,
      dictOptions: Object,
    },
    data() {
      return {
        queryInfo: [],
        showMoreQueryParams: false,
      }
    },
    watch: {
      'url.getQueryInfo': {
        immediate: true,
        handler() {
          this.initial()
        },
      }
    },
    methods: {

      initial() {
        this.loadQueryInfo()
        this.showMoreQueryParams = false
      },

      loadQueryInfo() {
        getAction(this.url.getQueryInfo).then(res => {
          if (res.success) {
            this.queryInfo = res.result
          } else {
            this.$message.warning(res.message)
          }
        })
      },

      handleToggleSearch() {
        this.showMoreQueryParams = !this.showMoreQueryParams
      },

    }
  }
</script>

<style scoped>

</style>