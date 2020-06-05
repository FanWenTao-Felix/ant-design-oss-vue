<template>
  <div id="printContent">
    <a-card v-bind="chartCardProps">

      <div slot="extra" :ignore-print="true">
        <a-button v-if="!component" ghost type="primary" v-print="'#printContent'">打印</a-button>
        <a-button v-if="component" ghost type="primary" @click="handleGoToInfo">详情</a-button>
      </div>

      <!-- 展示双列数据并排序 -->
      <a-row v-for="(type,index) of graphTypes" :key="index">
        <template v-for="idx of [index,index+1]" v-if="index%2===0">
          <a-col :span="buildSpan(idx)" :key="idx" v-if="idx<graphTypes.length">
            <template v-if="graphTypes[idx]==='line'">
              <line-chart-multid v-bind="lineProps" v-on="lineListeners"/>
            </template>
            <template v-if="graphTypes[idx]==='bar'">
              <bar-multid v-bind="barProps" v-on="barListeners"/>
            </template>
            <template v-if="graphTypes[idx]==='pie'">
              <pie v-bind="pieProps" v-on="pieListeners"/>
            </template>
          </a-col>
        </template>
      </a-row>
    </a-card>

    <a-card v-if="isTable" v-bind="tableCardProps">
      <a-row>
        <a-col :ignore-print="true">
          <a-button v-bind="exportButtonProps" @click="handleClickExportXls">{{ exportButtonProps.text }}</a-button>
          <a-switch v-bind="pageSwitchProps" v-model="pageSwitch"/>
        </a-col>
        <a-col>
          <a-table v-bind="tableProps"/>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>
  import ChartTemplateMixins from '../mixins/ChartTemplateMixins'

  export default {
    name: 'ChartSingleTemplate',
    mixins: [ChartTemplateMixins],
    methods: {
      buildSpan(idx) {
        let length = this.graphTypes.length
        // 如果当前项是最后一个且length是奇数，则扩展到全屏
        return (idx + 1 === length) && (length % 2 !== 0) ? 24 : 12
      }
    }
  }
</script>

<style lang="less" scoped></style>