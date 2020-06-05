<template>
  <div id="printContent">
    <a-card v-bind="chartCardProps">

      <div slot="extra" :ignore-print="true">
        <a-button v-if="!component" ghost type="primary" v-print="'#printContent'">打印</a-button>
        <a-button v-if="component" ghost type="primary" @click="handleGoToInfo">详情</a-button>
      </div>

      <!-- 排序显示图表 -->
      <template v-for="(type,index) of graphTypes">
        <template v-if="type==='line'">
          <line-chart-multid :key="index" v-bind="lineProps" v-on="lineListeners"/>
        </template>
        <template v-if="type==='bar'">
          <bar-multid :key="index" v-bind="barProps" v-on="barListeners"/>
        </template>
        <template v-if="type==='pie'">
          <pie :key="index" v-bind="pieProps" v-on="pieListeners"/>
        </template>
      </template>

    </a-card>
    <!-- 数据列表 -->
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
    mixins: [ChartTemplateMixins]
  }
</script>

<style lang="less" scoped></style>