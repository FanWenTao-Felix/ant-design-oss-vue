<template>
  <div id="printContent">

    <a-card v-bind="chartCardProps">

      <div slot="extra" :ignore-print="true">
        <a-button v-if="!component" ghost type="primary" v-print="'#printContent'">打印</a-button>
        <a-dropdown v-if="component">
          <a-menu slot="overlay">
            <template v-for="(data,idx) of dataSources">
              <a-menu-item :key="idx" @click="goToInfo(data)">{{data.head.name}}</a-menu-item>
            </template>
          </a-menu>
          <a-button ghost type="primary">
            <span>详情</span>
            <a-icon type="down"/>
          </a-button>
        </a-dropdown>
      </div>

      <bar-and-line v-bind="barAndLineProps" v-on="barAndLineListeners"/>

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
  import BarAndLine from '@/components/chart/BarAndLine'

  export default {
    name: 'ChartCombinationTemplate',
    mixins: [ChartTemplateMixins],
    components: { BarAndLine }
  }
</script>

<style lang="less" scoped></style>