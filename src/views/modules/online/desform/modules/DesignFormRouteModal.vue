<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="close()"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <!-- 路由名称 -->
        <a-form-item label="路由名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入路由名称" v-decorator="['routeName', validatorRules.routeName]"/>
        </a-form-item>
        <!-- 路由跳转类型 -->
        <a-form-item label="跳转类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag dictCode="desform_route_type" placeholder="请选择路由跳转类型" triggerChange v-decorator="['routeType', validatorRules.routeType]"/>
        </a-form-item>
        <!-- 下一步路由地址（表单跳转时填表单的code；菜单跳转填菜单路径；外部跳转填全链接） -->
        <a-form-item label="路由地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入路由地址" v-decorator="['routePath', validatorRules.routePath]"/>
        </a-form-item>
      </a-form>

    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'

  export default {
    name: 'DesignFormRouteDrawer',
    props: {
      desformId: String,
      desformCode: String,
    },
    data() {
      return {
        title: '新增路由配置',
        visible: false,
        form: this.$form.createForm(this),
        model: {},
        loading: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        validatorRules: {
          routeName: { rules: [{ required: true, message: '请输入路由名称！' }] },
          routeType: { rules: [{ required: true, message: '请选择路由跳转类型！' }] },
          routePath: { rules: [{ required: true, message: '请输入路由地址！' }] },
        },
        url: {
          add: '/desform/route/add',
          edit: '/desform/route/edit',
        },
      }
    },
    created() {
    },
    methods: {
      add() {
        this.edit({})
      },

      edit(record) {

        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(_.pick(this.model, 'routeName', 'routeType', 'routePath'))
        })
      },
      close() {
        if (!this.loading) {
          this.visible = false
          this.$emit('close')
        }
      },
      forceClose() {
        this.loading = false
        this.close()
      },
      handleOk() {
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            let httpUrl = this.url.add, method = 'post'
            if (this.model.id) {
              httpUrl = this.url.edit
              method = 'put'
            }
            let formData = Object.assign(this.model, values, {
              desformId: this.desformId,
              desformCode: this.desformCode,
            })
            console.log(formData)
            this.loading = true
            httpAction(httpUrl, formData, method).then(({ success, message }) => {
              if (success) {
                this.$message.success(message)
                this.$emit('ok')
                this.forceClose()
              } else {
                this.$message.warning(message)
              }
            }).finally(() => {
              this.loading = false
            })
          }
        })
      },
      handleCancel() {
        this.close()
      },
    }
  }
</script>

<style lang="less" scoped>
</style>