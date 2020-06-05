<template>

  <!-- 遍历分组 -->
  <a-tabs :defaultActiveKey="0">
    <a-tab-pane v-for="group of groups" :key="group.groupNum" :tab="group.groupTxt">

      <!-- 判断分组模式 -->
      <template v-if="group.groupStyle==='card'">
        <a-card
          v-for="chart of group.charts"
          :key="chart.head.id"
          :title="chart.head.name"
          v-bind="chartCardProps">

          <auto-chart :chartData="chart" :component="true"/>
        </a-card>
      </template>
      <!-- tabs 模式 -->
      <a-tabs v-else>
        <a-tab-pane
          v-for="chart of group.charts"
          :key="chart.head.id"
          :tab="chart.head.name">

          <auto-chart :chartData="chart" :component="true"/>
        </a-tab-pane>
      </a-tabs>

    </a-tab-pane>
  </a-tabs>

</template>

<script>
  import TempletStyleMixins from '../mixins/TempletStyleMixins'

  export default {
    name: 'TempletTabStyle',
    mixins: [TempletStyleMixins]
  }
</script>

<style scoped>

</style>