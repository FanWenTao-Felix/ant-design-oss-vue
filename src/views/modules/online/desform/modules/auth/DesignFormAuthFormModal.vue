<template>
  <j-modal
    ref="jModal"
    :title="title"
    :visible="visible"
    :width="800"
    :okClose="false"
    :maskClosable="false"
    :confirmLoading="loading"
    v-on="$listeners"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-form-item>
          <a-checkbox-group v-decorator="['authScopeIsAll']">
            <a-checkbox value="Y" @change="handleCheckboxChange">授权给所有人</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="用户权限">
          <j-select-multi-user :disabled="disabled" v-decorator="['authScopeUsersVal']"/>
        </a-form-item>
        <a-form-item label="角色权限">
          <j-select-role :disabled="disabled" v-decorator="['authScopeRolesVal']"/>
        </a-form-item>
        <a-form-item label="部门权限">
          <j-select-depart :disabled="disabled" v-decorator="['authScopeDepartsVal']"/>
        </a-form-item>
      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>
  import JSelectDepart from '@/components/jeecgbiz/JSelectDepart'
  import JSelectMultiUser from '@/components/jeecgbiz/JSelectMultiUser'
  import JSelectRole from '@/components/jeecgbiz/JSelectRole'

  export default {
    name: 'DesignFormAuthFormModal',
    components: { JSelectDepart, JSelectMultiUser, JSelectRole },
    props: {
      record: Object,
      loading: Boolean,
      visible: Boolean,
      title: {
        type: String,
        default: '授权',
      },
    },
    data() {
      return {
        form: this.$form.createForm(this),
        model: {},
        disabled: false,
      }
    },
    watch: {
      record: {
        deep: true,
        immediate: true,
        handler() {
          if (this.record) {
            let { authScopeIsAll, authScopeUsersVal, authScopeRolesVal, authScopeDepartsVal } = this.record
            // 转换 checkbox 的值
            if (authScopeIsAll === 'Y') {
              this.disabled = true
              authScopeIsAll = [authScopeIsAll]
            } else {
              this.disabled = false
              authScopeIsAll = []
            }
            this.form.setFieldsValue({ authScopeIsAll, authScopeUsersVal, authScopeRolesVal, authScopeDepartsVal })
          }
        },
      }
    },
    methods: {

      handleCheckboxChange(event) {
        this.disabled = event.target.checked
      },

      validateFields(handler) {
        this.form.validateFields((error, values) => {
          if (typeof handler === 'function') {
            if (!error) {
              if (values.authScopeIsAll) {
                values.authScopeIsAll = values.authScopeIsAll[0] === 'Y' ? 'Y' : 'N'
              }
            }
            handler(error, values)
          }
        })
      },

    },
  }
</script>

<style scoped>

</style>