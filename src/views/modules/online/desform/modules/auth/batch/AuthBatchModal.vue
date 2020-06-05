<template>
  <j-modal
    :title="title"
    :visible.sync="visible"
    :width="900"
    :maskClosable="false"
    fullscreen
    switch-fullscreen
    :confirmLoading="confirmLoading"
  >

    <a-row type="flex" :gutter="10" style="height: 100%;">
      <a-col :md="16" :sm="24" style="flex: 1;">
        <a-table
          ref="tableLeft"
          v-bind="tableProps"
          style="height: 100%;"
          @change="handleTableChange"
        />
      </a-col>
      <a-col :md="8" :sm="24" class="col-right" style="flex: 1;">
        <a-spin :spinning="confirmLoading">
          <a-tabs>
            <a-tab-pane tab="数据权限" key="data" forceRender>
              <auth-batch-transfer
                permissionType="data"
                :loading.sync="loadings.right"
                v-bind="transferProps"
              />
            </a-tab-pane>
            <a-tab-pane tab="按钮权限" key="button" forceRender>
              <auth-batch-transfer
                permissionType="button"
                :loading.sync="loadings.right"
                v-bind="transferProps"
              />
            </a-tab-pane>
            <a-tab-pane tab="字段权限" key="field" forceRender>
              <auth-batch-transfer
                permissionType="field"
                :loading.sync="loadings.right"
                v-bind="transferProps"
              />
            </a-tab-pane>
          </a-tabs>
        </a-spin>
        <p style="margin: 8px 0 0 0;">
          <a-icon type="eye-invisible" style="margin-right:8px;"/>
          <span>符号开头的字段代表已勾选“授权给所有人”</span>
        </p>
      </a-col>
    </a-row>

  </j-modal>
</template>

<script>
  import { getAction } from '@/api/manage'
  import AuthBatchTransfer from './AuthBatchTransfer'
  import { depart, role } from './AuthBatchScopeType'


  export default {
    name: 'AuthBatchModal',
    components: { AuthBatchTransfer },
    props: {
      // 权限范围类型（role、depart）
      authScopeType: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        visible: false,
        modal: {},
        // 授权范围类型
        scopeTypes: {
          role: { ...role },
          depart: { ...depart }
        },
        //加载中，左侧和右侧的状态分别存储
        loadings: {
          left: false,
          right: false
        },
        // 数据源
        dataSource: [],
        // 分页参数
        pagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        // 选中的行
        selectionRows: [],
        // 选中的行 keys
        selectedRowKeys: [],
      }
    },
    computed: {
      confirmLoading() {
        return this.loadings.left || this.loadings.right
      },
      currentAuthScope() {
        let scope = this.scopeTypes[this.authScopeType]
        if (scope) {
          return scope
        } else {
          throw new Error('未知的 authScopeType 值：' + this.authScopeType)
        }
      },
      title() {
        return this.currentAuthScope.name + '批量授权'
      },
      url() {
        return this.currentAuthScope.url
      },
      tableProps() {
        return {
          rowKey: 'id',
          size: 'small',
          bordered: true,
          loading: this.confirmLoading,
          columns: this.currentAuthScope.columns,
          dataSource: this.dataSource,
          pagination: this.pagination,
          rowSelection: {
            type: 'radio',
            selectedRowKeys: this.selectedRowKeys,
            onChange: (keys, rows) => this.onSelectChange(keys, rows),
          },
          rowClassName: () => 'j-row-select',
          customRow: this.customRow
        }
      },
      transferProps() {
        return {
          authScopeCode: this.authScopeCode,
          authScopeType: this.authScopeType,
          desformId: this.modal.id,
          desformCode: this.modal.desformCode,
          currentAuthScope: this.currentAuthScope
        }
      },
      // 选中的授权范围 code
      authScopeCode() {
        if (this.selectionRows.length > 0) {
          return this.selectionRows[0][this.currentAuthScope.codeName]
        }
        return ''
      },
    },
    created() {
    },
    methods: {

      open(record) {
        this.visible = true
        this.modal = { ...record }
        this.loadScopeData()
      },

      customRow(record) {
        return {
          props: {},
          on: {
            click: () => {
              this.onSelectChange([record.id], [record])
            }
          }
        }
      },

      loadScopeData(pageNum) {
        // 页码
        if (typeof pageNum === 'number' && pageNum >= 1) {
          this.pagination.current = pageNum
        }
        let params = {
          pageNo: this.pagination.current,
          pageSize: this.pagination.pageSize,
        }
        this.loading = true
        getAction(this.url.list, params).then(res => {
          const { success, message, result } = res
          if (success) {
            this.dataSource = result.records
            this.pagination.total = result.total
            // 默认选中第一行
            if (this.dataSource.length > 0) {
              let firstRow = this.dataSource[0]
              this.onSelectChange([firstRow.id], [firstRow])
            }
          } else {
            this.$message.warning(message)
          }
        }).finally(() => {
          this.loading = false
        })
      },

      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectionRows = selectionRows
        this.selectedRowKeys = selectedRowKeys
      },

      handleTableChange(pagination) {
        this.pagination = pagination
        this.loadScopeData()
      },

    }

  }
</script>

<style lang="less" scoped>

  /deep/ .ant-table {
    .ant-table-body {
      margin: 0 !important;
    }

    .j-row-select {
      cursor: pointer !important;
    }
  }

  /deep/ .col-right {
    height: 100%;

    .ant-spin-nested-loading {
      height: calc(100% - 25px);
    }

    .ant-spin-container,
    .ant-tabs {
      height: 100%;
    }

    .ant-tabs-content {
      height: calc(100% - 60px);
    }

    .ant-transfer-list {
      height: 400px;
    }

  }

  /* 在JModal全屏模式下样式特殊处理 */
  .j-modal-box.fullscreen .col-right {
    /deep/ .ant-transfer-list {
      height: calc(100% - 8px);
    }
  }

</style>