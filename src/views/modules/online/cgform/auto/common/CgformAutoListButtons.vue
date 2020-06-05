<template>
  <div class="table-operator">
    <a-button v-if="buttonSwitch.add" @click="handleAdd" type="primary" icon="plus">新增</a-button>
    <a-button v-if="buttonSwitch.import" @click="handleImportXls" type="primary" icon="upload">导入</a-button>
    <a-button v-if="buttonSwitch.export" @click="handleExportXls" type="primary" icon="download">导出</a-button>

    <template v-if="buttonList">
      <a-button
        v-for="(item,index) in buttonList"
        :key="`cg-btn-${index}`"
        type="primary"
        :icon="item.buttonIcon"
        @click="handleClickCgButton(item)"
      >
        {{ item.buttonName }}
      </a-button>
    </template>

    <!-- 高级查询 -->
    <j-super-query
      ref="superQuery"
      :fieldList="superQuery.fieldList"
      :saveCode="$route.fullPath"
      :loading="table.loading"
      @handleSuperQuery="handleSuperQuery"
    />

    <a-button
      v-if="buttonSwitch.batch_delete"
      @click="handleDelBatch"
      v-show="table.selectedRowKeys.length > 0"
      ghost
      type="primary"
      icon="delete"
    >
      批量删除
    </a-button>

  </div>
</template>

<script>
  import JSuperQuery from '@comp/jeecg/JSuperQuery'

  export default {
    name: 'CgformAutoListButtons',
    inject: ['handleAdd', 'handleImportXls', 'handleExportXls', 'cgButtonJsHandler', 'cgButtonActionHandler', 'handleSuperQuery', 'handleDelBatch'],
    components: { JSuperQuery },
    props: {
      url: {
        type: Object,
        required: true,
      },
      table: Object,
      buttonList: Array,
      buttonSwitch: Object,
      superQuery: Object,
    },
    watch: {},
    data() {
      return {}
    },
    methods: {

      handleClickCgButton(button) {
        if (button.optType === 'action') {
          this.cgButtonActionHandler(button.buttonCode)
        } else if (button.optType === 'js') {
          this.cgButtonJsHandler(button.buttonCode)
        }
      },

    },
  }
</script>

<style scoped>

</style>