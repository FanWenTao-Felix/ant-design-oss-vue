<template>
  <a-modal
    title="编辑权限"
    :width="800"
    :visible="innerVisible"
    :maskClosable="false"
    :confirm-loading="loading"
    :afterClose="handleAfterClose"
    @ok="handleOk"
    @cancel="close()">
    <a-spin :spinning="loading">
      <a-tabs v-model="tabActiveKey">
        <a-tab-pane v-for="aty of authTypes" :tab="aty.text" :key="aty.value" forceRender>

          <a-form :form="aty.form">
            <a-form-item>
              <a-checkbox-group v-decorator="['authScopeIsAll']">
                <a-checkbox value="Y" @change="handleCheckboxChange">授权给所有人</a-checkbox>
              </a-checkbox-group>
            </a-form-item>

            <a-form-item label="用户权限">
              <j-select-multi-user :disabled="aty.disabled" v-decorator="['authScopeUsersVal']"/>
            </a-form-item>
            <a-form-item label="角色权限">
              <j-select-role :disabled="aty.disabled" v-decorator="['authScopeRolesVal']"/>
            </a-form-item>
            <a-form-item label="部门权限">
              <j-select-depart :disabled="aty.disabled" v-decorator="['authScopeDepartsVal']"/>
            </a-form-item>
          </a-form>

        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-modal>

</template>

<script>
  import { getAction, postAction } from '@/api/manage'

  import JSelectDepart from '@/components/jeecgbiz/JSelectDepart'
  import JSelectMultiUser from '@/components/jeecgbiz/JSelectMultiUser'
  import JSelectRole from '@/components/jeecgbiz/JSelectRole'

  export default {
    name: 'DesignFormAuthEditModal',
    components: { JSelectDepart, JSelectMultiUser, JSelectRole },
    props: {
      visible: { type: Boolean, default: false },
      desformCode: { type: String, default: '' },
      authComKey: { type: String, default: '' },
    },
    data() {
      return {
        loading: true,
        innerVisible: false,
        tabActiveKey: '1',

        authTypes: [
          { text: '可见', value: '1', form: this.$form.createForm(this), disabled: false },
          { text: '可编辑', value: '2', form: this.$form.createForm(this), disabled: false },
        ]
      }
    },
    computed: {
      url() {
        let { desformCode, authComKey } = this
        let before = '/desform/auth'

        return {
          query: `${before}/query/${desformCode}`,
          queryByCodeAndAuthComKey: `${before}/query/${desformCode}/${authComKey}`,

          updateBatch: '/desform/auth/updateBatch',
        }
      }
    },
    watch: {
      visible(val) {
        if (val) {
          this.innerVisible = true
          this.requestData()
        }
      }
    },
    created() {
    },
    methods: {

      requestData() {
        this.loading = true
        // this.form.resetFields()
        getAction(this.url.queryByCodeAndAuthComKey).then(res => {
          // console.log('requestData: ', res)
          let { success, message, result } = res
          if (success) {
            for (let aty of this.authTypes) {
              for (let auth of result) {
                let { authType, authScopeIsAll, authScopeUsersVal, authScopeRolesVal, authScopeDepartsVal } = auth
                if (aty.value === authType) {

                  // 转换 checkbox 的值
                  if (authScopeIsAll === 'Y') {
                    aty.disabled = true
                    authScopeIsAll = [authScopeIsAll]
                  } else {
                    aty.disabled = false
                    authScopeIsAll = []
                  }

                  aty.form.setFieldsValue({ authScopeIsAll, authScopeUsersVal, authScopeRolesVal, authScopeDepartsVal })
                  break
                }
              }
            }
          } else {
            this.$message.warn('查询失败：' + message)
          }
        }).finally(() => {
          this.loading = false
        })
      },

      close() {
        this.innerVisible = false
      },
      handleAfterClose() {
        this.$emit('update:visible', false)
      },

      handleOk() {
        this.loading = true

        let { desformCode, authComKey } = this
        let values = []
        for (let aty of this.authTypes) {
          let value = Object.assign({ desformCode, authComKey, authType: aty.value }, aty.form.getFieldsValue())
          value.authScopeIsAll = value.authScopeIsAll[0] === 'Y' ? 'Y' : 'N'
          values.push(value)
        }
        // console.log(' handleOk: ', values)
        postAction(this.url.updateBatch, values).then(res => {
          if (res && res.success) {
            this.$message.success('修改成功')
            this.close()
          } else {
            this.$message.error('修改失败：' + res.message)
          }
        }).finally(() => {
          this.loading = false
        })
      },

      handleCheckboxChange(event) {
        this.authTypes.filter(i => i.value === this.tabActiveKey)[0].disabled = event.target.checked
      }

    }
  }
</script>

<style lang="less" scoped>
</style>