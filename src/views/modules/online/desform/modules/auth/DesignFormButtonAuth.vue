<template>
  <div>
    <a-table
      bordered
      rowKey="id"
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false"
    >

      <template slot="switch" slot-scope="text,record">
        <a-switch size="small" :loading="record.loading" :checked="record.status === 1" @change="handleUpdateStatus(record)"/>
      </template>

      <template slot="action" slot-scope="text, record">
        <a @click="handleAuth(record)">授权</a>
      </template>

    </a-table>

    <design-form-auth-form-modal
      ref="authForm"
      :title="modal.title"
      :record="modal.model"
      :loading="modal.loading"
      :visible.sync="modal.visible"
      @ok="handleModalOk"
    />

  </div>
</template>

<script>
  import { getAction } from '@api/manage'
  import DesignFormAuthFormModal from './DesignFormAuthFormModal'
  import DesignFormAuthMixins from './DesignFormAuthMixins'

  export default {
    name: 'DesignFormButtonAuth',
    mixins: [DesignFormAuthMixins],
    components: { DesignFormAuthFormModal },
    data() {
      return {
        description: '表单设计按钮权限管理页面',
        permissionType: 'button',
        columns: [
          {
            title: '启用',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            scopedSlots: { customRender: 'switch' },
          },
          {
            title: '名称',
            dataIndex: 'authTitle',
            align: 'center',
          },
          {
            title: '字段名',
            dataIndex: 'authField',
            align: 'center',
          },
          {
            title: '已授权给',
            dataIndex: 'authScopeIsAll',
            align: 'center',
            customRender: (text, record) => {
              let style = 'color: #CCCCCC;'
              if (text === 'N') {
                return <span title="已有生效的用户、角色或部门配置">固定人群</span>
              } else {
                let { authScopeUsersVal, authScopeRolesVal, authScopeDepartsVal } = record
                if (authScopeUsersVal || authScopeRolesVal || authScopeDepartsVal) {
                  return <span title="已有生效的用户、角色或部门配置，但未生效，因为勾选了授权给所有人">所有人<span style={style}>（人群配置）</span></span>
                } else {
                  return <span title="已授权给所有人" style={style}>所有人</span>
                }
              }
            }
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' },
          },
        ],
        // 按钮权限固定数据
        dataSource: [],
        modal: {
          model: {},
          loading: false,
          visible: false,
        },
        // 当前正在编辑、授权的按钮
        currentAuthButton: {},
      }
    },
    methods: {

      loadData() {
        this.loading = true
        this.dataSource = []
        let params = this.getQueryParams()
        params.pageSize = -1
        getAction(`${this.url.list}/${this.record.desformCode}`, params).then(({ success, message, result }) => {
          if (success) {
            this.pagination = result.total
            this.dataSource = result.records
          } else {
            this.$warning({ title: '查询失败', content: message })
          }
        }).finally(() => {
          this.loading = false
        })
      },

      // 加载授权信息
      loadAuthData() {
        this.modal.loading = true
        this.modal.model = {}
        let params = this.getQueryParams()
        params['authField'] = this.currentAuthButton.authField
        getAction(`${this.url.list}/${this.record.desformCode}`, params).then(({ success, message, result }) => {
          if (success) {
            if (result.records.length === 0) {
              this.modal.model = { authScopeIsAll: 'Y' }
            } else {
              this.modal.model = result.records[0]
            }
          } else {
            this.$warning({ title: '查询失败', content: message })
          }
        }).finally(() => {
          this.modal.loading = false
        })
      },

      openModal(title) {
        this.openModalCommon(this.modal, title, {})
        this.loadAuthData()
      },

      handleAuth(record) {
        this.currentAuthButton = record
        const { authTitle, authField } = record
        this.openModal(`按钮授权：${authTitle}（${authField}）`)
      },

      handleModalOk() {
        this.addOrEdit(this.modal, {
          form: this.$refs.authForm,
          url: this.url.edit,
          method: 'put',
          formData: {
            authField: this.currentAuthButton.authField,
          }
        })
      },

      handleUpdateStatus(record) {
        this.updateStatus(record, { authField: record.authField })
      },

    },
  }
</script>

<style scoped>

</style>