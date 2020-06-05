<template>
  <div>
    <!-- 遍历分组 -->
    <div v-for="group of groups" :key="group.groupNum" style="margin-bottom: 10px">

      <a-card v-bind="chartCardProps">
        <auto-chart :chartDatas="group.charts" :component="true" :isCombination="true"/>
      </a-card>

    </div>
  </div>
</template>

<script>
  import TempletStyleMixins from '../mixins/TempletStyleMixins'

  export default {
    name: 'TempletCombinationStyle',
    mixins: [TempletStyleMixins]
  }
</script>

<style scoped>

</style>