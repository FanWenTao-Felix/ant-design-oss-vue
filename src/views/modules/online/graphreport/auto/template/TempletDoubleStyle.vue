<template>
  <a-row :gutter="10">
    <!-- 遍历出两列 -->
    <a-col v-for="plus of [0,1]" :key="plus" :span="12">
      <!-- 遍历分组 -->
      <template v-for="(g,index) of groups" v-if="index % 2 === 0">
        <div v-if="isShow(index, plus)" :key="index">
          <!-- 判断分组模式 -->
          <a-card
            v-if="getGroupStyle(index, plus) === 'card'"
            v-for="chart of getCharts(index, plus)"
            :key="chart.head.id"
            v-bind="groupCardProps">

            <auto-chart :chartData="chart" :component="true"/>
          </a-card>
          <!-- tabs 模式 -->
          <a-tabs v-else>
            <a-tab-pane
              v-for="chart of getCharts(index, plus)"
              :key="chart.head.id"
              :tab="chart.head.name">

              <auto-chart :chartData="chart" :component="true"/>
            </a-tab-pane>
          </a-tabs>
        </div>
      </template>
    </a-col>
  </a-row>
</template>

<script>
  import TempletStyleMixins from '../mixins/TempletStyleMixins'

  export default {
    name: 'TempletDoubleStyle',
    mixins: [TempletStyleMixins],
    methods: {
      // isShow(index, plus) {
      //   return index + plus < this.chartsData.length
      // },
      isShow(index, plus) {
        return index + plus < this.groups.length
      },

      // getTitle(index, plus) {
      //   return this.getItem(index, plus).head.name
      // },

      // getItem(index, plus) {
      //   return this.isShow(index, plus) ? this.chartsData[index + plus] : {}
      // },

      getGroupStyle(index, plus) {
        return this.getGroup(index, plus).groupStyle
      },
      getCharts(index, plus) {
        return this.getGroup(index, plus).charts
      },

      getGroup(index, plus) {
        return this.isShow(index, plus) ? this.groups[index + plus] : {}
      }

    }
  }
</script>

<style scoped></style>