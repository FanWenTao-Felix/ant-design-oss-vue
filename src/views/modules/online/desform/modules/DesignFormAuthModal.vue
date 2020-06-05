<template>
  <a-drawer
    title="权限管理"
    :width="800"
    :visible="visible"
    @close="close()">

    <a-tabs>
      <a-tab-pane tab="数据权限" key="data" forceRender>
        <design-form-data-auth :visible="visible" :record="model"/>
      </a-tab-pane>
      <a-tab-pane tab="按钮权限" key="button" forceRender>
        <design-form-button-auth :visible="visible" :record="model"/>
      </a-tab-pane>
      <a-tab-pane tab="字段权限" key="field" forceRender>
        <a-alert type="info" showIcon style="margin-bottom: 16px;">
          <template slot="message">
            <span>已选择</span>
            <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
            <span>项</span>
            <template v-if="selectedRowKeys.length>0">
              <a-divider type="vertical"/>
              <a @click="handleClearSelection()">清空</a>
              <a-divider type="vertical"/>
              <a-popconfirm :title="`确定要删除这 ${selectedRowKeys.length} 项吗?`" placement="bottom" @confirm="handleClickDeleteBatch()">
                <a>批量删除</a>
              </a-popconfirm>
            </template>
          </template>
        </a-alert>

        <a-table
          rowKey="id"
          :loading="loading"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="false"
          :rowSelection="{selectedRowKeys, onChange: handleTableSelectChange}"
        >

          <template v-slot:action="record">
            <div style="height: 32px;line-height: 32px;">
              <a @click="handleClickEditAuth(record)">编辑权限</a>
              <a-divider type="vertical"/>
              <a-popconfirm title="确定要删除吗?" placement="left" @confirm="handleClickDelete(record)">
                <a>删除</a>
              </a-popconfirm>
            </div>
          </template>

        </a-table>

        <a-tabs v-if="subTableList.length > 0" style="margin-top: 20px;">
          <template v-for="subItem of subTableList">
            <a-tab-pane :tab="subItem.title" :key="subItem.key" forceRender>
              <a-alert type="info" showIcon style="margin-bottom: 16px;">
                <template slot="message">
                  <span>已选择</span>
                  <a style="font-weight: 600;padding: 0 4px;">{{ subItem.selectedRowKeys.length }}</a>
                  <span>项</span>
                  <template v-if="subItem.selectedRowKeys.length>0">
                    <a-divider type="vertical"/>
                    <a @click="handleClearSelection(subItem)">清空</a>
                    <a-divider type="vertical"/>
                    <a-popconfirm :title="`确定要删除这 ${subItem.selectedRowKeys.length} 项吗?`" placement="bottom" @confirm="handleClickDeleteBatch(subItem)">
                      <a>批量删除</a>
                    </a-popconfirm>
                  </template>
                </template>
              </a-alert>
              <a-table
                rowKey="id"
                :loading="loading"
                :columns="columns"
                :dataSource="subItem.list"
                :pagination="false"
                :rowSelection="{selectedRowKeys:subItem.selectedRowKeys, onChange: (i,j)=>handleTableSelectChange(i,j,subItem)}"
              >

                <template v-slot:action="record">
                  <div style="height: 32px;line-height: 32px;">
                    <a @click="handleClickEditAuth(record)">编辑权限</a>
                    <a-divider type="vertical"/>
                    <a-popconfirm title="确定要删除吗?" placement="left" @confirm="handleClickDelete(record)">
                      <a>删除</a>
                    </a-popconfirm>
                  </div>
                </template>

              </a-table>
            </a-tab-pane>
          </template>
        </a-tabs>

        <design-form-auth-edit-modal
          :visible.sync="authEditModal.visible"
          :authComKey="authEditModal.authComKey"
          :desformCode="authEditModal.desformCode"
        />

        <div v-if="false" class="drawer-bottom">
          <a-button style="margin-right: 8px" @click="close()">取消</a-button>
          <a-button @click="handleOk" type="primary" :loading="loading">确定</a-button>
        </div>

      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script>
  import { getAction, deleteAction, httpAction } from '@/api/manage'
  import DesignFormAuthEditModal from './DesignFormAuthEditModal'
  import DesignFormDataAuth from './auth/DesignFormDataAuth'
  import DesignFormButtonAuth from './auth/DesignFormButtonAuth'

  export default {
    name: 'DesignFormAuthModal',
    components: { DesignFormDataAuth, DesignFormButtonAuth, DesignFormAuthEditModal },
    data() {
      return {
        visible: false,
        model: {},
        authEditModal: {
          visible: false,
          authComKey: '',
          desformCode: ''
        },
        loading: false,
        columns: [
          { title: '#', key: 'rowIndex', width: 50, align: 'center', customRender: (t, r, i) => ++i },
          { title: '权限名称', dataIndex: 'authTitle', width: 240 },
          { title: '权限字段', dataIndex: 'authField', width: 240 },
          { title: '操作', key: 'action', scopedSlots: { customRender: 'action' } }
        ],
        // 主表dataSource
        dataSource: [],
        // 子表 tabs
        subTableList: {},
        selectedRowKeys: [],
        url: {
          query: (desformCode) => `/desform/auth/query/${desformCode}`,
          updateBatch: '/desform/auth/updateBatch',
          deleteByComKey: '/desform/auth/deleteByComKey',
          deleteBatchByAuthComKey: '/desform/auth/deleteBatchByAuthComKey'
        }
      }
    },
    computed: {},
    created() {
    },
    methods: {

      loadAuthList() {
        this.loading = true
        getAction(this.url.query(this.model.desformCode), { group: true }).then((res) => {
          if (res && res.success) {
            // 分出子表、主表
            let mainList = [], subMaps = {}
            for (let item of res.result) {
              if (item.subTable) {
                let subInfo = subMaps[item.subKey] || { title: item.subTitle, key: item.subKey, list: [], selectedRowKeys: [], selectionRows: [] }
                subInfo.list.push(item)
                subMaps[item.subKey] = subInfo
              } else {
                mainList.push(item)
              }
            }
            // 将子表封装成数组
            let subTableList = []
            for (let key in subMaps) {
              if (subMaps.hasOwnProperty(key)) {
                subTableList.push(subMaps[key])
              }
            }
            this.dataSource = mainList
            this.subTableList = subTableList
          }
        }).finally(() => {
          this.loading = false
        })
      },

      open(record) {
        this.visible = true
        this.dataSource = []

        this.model = record

        this.loadAuthList()
      },

      close() {
        this.visible = false
        setTimeout(() => {
          this.dataSource = []
          this.subTableList = []
          this.handleClearSelection()
        }, 300)
      },

      handleOk() {
        this.close()
      },

      handleClickEditAuth(record) {
        let { authComKey, desformCode } = record
        Object.assign(this.authEditModal, { authComKey, desformCode, visible: true })
      },

      handleClickDelete(record) {
        this.__deleteCommonThen(httpAction(this.url.deleteByComKey, { desformCode: this.model.desformCode, authComKey: record.authComKey }, 'DELETE'))
      },

      handleClickDeleteBatch(subItem) {
        let selectionRows = subItem ? subItem.selectionRows : this.selectionRows
        let authComKeys = selectionRows.map(item => item.authComKey).join(',')
        this.__deleteCommonThen(deleteAction(this.url.deleteBatchByAuthComKey, {
          desformCode: this.model.desformCode, authComKeys
        }))
      },

      __deleteCommonThen(promise) {
        this.loading = true
        let success = false
        promise.then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            success = true
            this.loadAuthList()
          } else {
            console.error(res)
            this.$message.warn('删除失败：' + res.message)
          }
        }).catch(e => {
          console.error(e)
          this.$message.error('删除失败')
        }).finally(() => {
          if (!success) this.loading = false
        })
      },

      handleClearSelection(subItem) {
        if (subItem) {
          subItem.selectionRows = []
          subItem.selectedRowKeys = []
        } else {
          this.selectionRows = []
          this.selectedRowKeys = []
        }
      },

      handleTableSelectChange(selectedRowKeys, selectionRows, subItem) {
        if (subItem) {
          subItem.selectionRows = selectionRows
          subItem.selectedRowKeys = selectedRowKeys
        } else {
          this.selectionRows = selectionRows
          this.selectedRowKeys = selectedRowKeys
        }
      },

    },
  }
</script>

<style lang="less" scoped>
  .drawer-bottom {
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 4px 4px;
  }
</style>