<template>
  <div id="printContent">
    <a-card v-bind="chartCardProps">

      <div slot="extra" :ignore-print="true">
        <a-button v-if="!component" ghost type="primary" v-print="'#printContent'">打印</a-button>
        <a-button v-if="component" ghost type="primary" @click="handleGoToInfo">详情</a-button>
      </div>

      <div>
        <a-radio-group buttonStyle="solid" v-model="activeKey">
          <!-- 排序显示图标 -->
          <template v-for="(type,index) of graphTypes">
            <template v-if="type==='line'">
              <a-radio-button v-if="isLine" value="line" :key="index">曲线图</a-radio-button>
            </template>
            <template v-if="type==='bar'">
              <a-radio-button v-if="isBar" value="bar" :key="index">柱状图</a-radio-button>
            </template>
            <template v-if="type==='pie'">
              <a-radio-button v-if="isPie" value="pie" :key="index">饼图</a-radio-button>
            </template>
          </template>
        </a-radio-group>


        <a-tabs v-model="activeKey" size="small" :tabBarStyle="{display:'none'}">
          <a-tab-pane v-if="isLine" tab="曲线图" key="line">
            <line-chart-multid v-bind="lineProps" v-on="lineListeners"/>
          </a-tab-pane>
          <a-tab-pane v-if="isBar" tab="柱状图" key="bar">
            <bar-multid v-bind="barProps" v-on="barListeners"/>
          </a-tab-pane>
          <a-tab-pane v-if="isPie" tab="饼图" key="pie">
            <pie v-bind="pieProps" v-on="pieListeners"/>
          </a-tab-pane>
        </a-tabs>
      </div>

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
    name: 'ChartTabTemplate',
    mixins: [ChartTemplateMixins]
  }
</script>

<style lang="less" scoped></style>