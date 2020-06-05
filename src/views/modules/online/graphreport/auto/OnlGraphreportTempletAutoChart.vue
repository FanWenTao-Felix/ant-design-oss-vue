<template>
  <a-spin :spinning="loading">
    <a-card
      :title="templetName"
      :headStyle="{ paddingLeft: '20px' }"
      :bodyStyle="{ padding: '10px' }">

      <a-button slot="extra" ghost type="primary" v-print="'#printTemplate'">打印</a-button>

      <div id="printTemplate">
        <div v-if="loading && groups.length===0" style="min-height: 300px;">
        </div>
        <templet-tab-style v-else-if="isTab" :groups="groups"/>
        <templet-single-style v-else-if="isSingle" :groups="groups"/>
        <templet-double-style v-else-if="isDouble" :groups="groups"/>
        <templet-combination-style v-else-if="isCombination" :groups="groups"/>
        <h2 v-else :style="error.style">未识别的布局模式</h2>
      </div>

    </a-card>
  </a-spin>
</template>

<script>
  import { getAction } from '@/api/manage'
  import TempletTabStyle from './template/TempletTabStyle'
  import TempletSingleStyle from './template/TempletSingleStyle'
  import TempletDoubleStyle from './template/TempletDoubleStyle'
  import TempletCombinationStyle from './template/TempletCombinationStyle'

  export default {
    name: 'OnlGraphreportTempletAutoChart',
    components: { TempletTabStyle, TempletSingleStyle, TempletDoubleStyle, TempletCombinationStyle },
    data() {
      return {
        code: '46a14bee5780f2c0cc7a785c94a0b6a7',
        loading: false,
        templetName: '',
        templetStyle: '',
        groups: [],
        url: {
          getTempletAllData: '/online/graphreport/api/getTempletAllData'
        },
        error: {
          style: {
            textAlign: 'center',
            background: 'white',
            padding: '20px'
          }
        }
      }
    },
    computed: {
      isTab() {
        return (this.templetStyle === 'tab')
      },
      isSingle() {
        return (this.templetStyle === 'single')
      },
      isDouble() {
        return (this.templetStyle === 'double')
      },
      isCombination() {
        return (this.templetStyle === 'combination')
      }
    },
    watch: {
      '$route'() {
        this.loadAllData()
      }
    },
    created() {
      this.loadAllData()
    },
    methods: {

      // 加载所有数据
      loadAllData() {
        if(!this.$route.params.code){
          return false
        }
        this.loading = true
        let code = this.$route.params.code
        if (!code) code = this.code
        getAction(this.url.getTempletAllData, {
          id: code
        }).then((res) => {
          let { success, message, result } = res
          if (success) {
            // console.log('result:', result)
            // return
            let { groups, templet: { templetName, templetStyle } } = result
            this.groups = groups
            this.templetName = templetName
            this.templetStyle = templetStyle
          } else {
            this.$message.error('查询失败: ' + message)
          }
        }).finally(() => {
          this.loading = false
        })
      }

    }
  }
</script>

<style scoped>

</style>