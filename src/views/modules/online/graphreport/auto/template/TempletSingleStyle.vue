<template>
  <div>
    <!-- 遍历分组 -->
    <div v-for="group of groups" :key="group.groupNum" style="margin-bottom: 10px">

      <!-- 判断分组模式 -->
      <!--<a-card v-if="group.groupStyle==='card'" v-bind="groupCardProps">-->

      <!--</a-card>-->
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

    </div>
  </div>
</template>

<script>
  import TempletStyleMixins from '../mixins/TempletStyleMixins'

  export default {
    name: 'TempletSingleStyle',
    mixins: [TempletStyleMixins]
  }
</script>

<style scoped>

</style>