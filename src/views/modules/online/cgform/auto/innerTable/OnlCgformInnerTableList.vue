<template>
  <a-card class="j-inner-table-wrapper" :bordered="false">

    <!-- 查询条件区域 -->
    <cgform-auto-list-query-params
      :url="url"
      :queryParam="queryParam"
      :dictOptions="dictOptions"
      @query=""
      @reset="handleSearchReset"
    />

    <!-- 操作按钮区域 -->
    <cgform-auto-list-buttons
      :url="url"
      :table="table"
      :buttonList="cgButtonList"
      :buttonSwitch="buttonSwitch"
      :superQuery="superQuery"
    />

    <!-- 列表区域 -->
    <cgform-auto-list-table
      :url="url"
      :table="table"
      :isorter="isorter"
      :buttonSwitch="buttonSwitch"
      :cgButtonLinkList="cgButtonLinkList"
      :currentTableName="currentTableName"
      :checkboxFlag="checkboxFlag"
      :hasBpmStatus="hasBpmStatus"
      :scrollFlag="scrollFlag"
      :expandedRowKeys="expandedRowKeys"
      @expand="handleExpand"
    >

      <template  slot="expandedRowRender" slot-scope="record">
<!--      <template v-slot:expandedRowRender="{record}">-->

        <a-tabs tabPosition="top">
          <a-tab-pane v-for="subTable of subTableList" :tab="subTable.tab" :key="subTable.key" forceRender>
            <auto-inner-sub-table :record="record" :subTable="subTable"/>
          </a-tab-pane>
        </a-tabs>
      </template>


    </cgform-auto-list-table>

    <!-- 弹窗表单区域 -->
    <onl-cgform-auto-modal ref="modal" :code="code" @success="handleFormSuccess" @schema="handleSchema"/>

  </a-card>
</template>

<script>

  import AutoInnerSubTable from './AutoInnerSubTable'
  import OnlCgformAutoModal from '../OnlCgformAutoModal'
  import CgformAutoListMixins from '../common/CgformAutoListMixins'

  export default {
    name: 'OnlCgFormAutoList',
    mixins: [CgformAutoListMixins],
    components: { OnlCgformAutoModal, AutoInnerSubTable },
    data() {
      return {
        description: '在线表单内嵌子表功能测试页面',
        subTableList: [],
        expandedRowKeys: [],
      }
    },
    methods: {

      // 获取子表列表
      handleSchema(schema) {
        if (schema && schema.properties) {
          let subTableList = []
          Object.keys(schema.properties).forEach(key => {
            let field = schema.properties[key]
            // tab = 子表
            if (field.view === 'tab') {
              subTableList.push({
                id: field.id,
                tab: field.describe,
                key: field.key,
                columns: field.columns,
                order: field.order,
              })
            }
          })
          // 根据 order 排序
          this.subTableList = _.sortBy(subTableList, (item) => item.order)
        }

        this.handleGetSchema(schema)
      },

      handleExpand(expanded, record) {
        this.expandedRowKeys = []
        if (expanded === true) {
          this.expandedRowKeys.push(record.id)
        }
      },
    }
  }
</script>
<style lang="less">
  @import '~@assets/less/common.less';
  @import '~@/assets/less/TableExpand.less';
</style>