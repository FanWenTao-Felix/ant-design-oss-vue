<template>
  <a-modal
    :title="modalTitle"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="loading"
    :width="800"
    :bodyStyle="{padding:'40px'}"
    @ok="handleOk"
    @cancel="()=>close(false)">

    <a-spin :spinning="loading">
      <a-form :form="form">

        <a-form-item
          label="表单名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">

          <a-input
            placeholder="请输入表单名称"
            v-decorator="[ 'desformName', rules.desformName]"/>
        </a-form-item>

        <a-form-item label="表单编码" :labelCol="labelCol" :wrapperCol="wrapperCol">

          <a-input
            placeholder="请输入表单编码"
            :disabled="isEditing"
            v-decorator="[ 'desformCode', rules.desformCode]"/>
        </a-form-item>

     <!--   <a-form-item label="表单图标" :labelCol="labelCol" :wrapperCol="wrapperCol">

          <a-input placeholder="点击选择表单图标" v-decorator="[ 'desformIcon']" :readOnly="true">
            <a-icon slot="addonAfter" type="setting" @click="iconChooseVisible=true"/>
          </a-input>

          <icons @choose="handleIconChoose" @close="iconChooseVisible=false" :iconChooseVisible="iconChooseVisible"></icons>

        </a-form-item>-->
        <a-form-item v-if="showSetMobileView" label="设为移动视图" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-checkbox-group v-decorator="['izMobileView']">
            <a-checkbox :value="1"/>
          </a-checkbox-group>
          <span>（注：只能有一个移动视图）</span>
        </a-form-item>

        <a-form-item v-if="!isEditing && !isCopying && !isCopyView" label="Online表单" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-switch checkedChildren="开启" unCheckedChildren="关闭" v-model="cgformSwitch"/>
          <span style="position: relative;left: 8px;top: 2px;">开启后将自动根据选择的Online表单生成</span>
        </a-form-item>

        <template v-if="cgformSwitch">
          <a-form-item label="选择表单" :labelCol="labelCol" :wrapperCol="wrapperCol">

            <a-select
              showSearch
              :filterOption="filterCgformOption"
              :options="cgformOptions"
              placeholder="请选择Online表单"
              :getPopupContainer="node => node.parentNode"
              v-decorator="[ 'cgformCode', rules.cgformCode]"/>
          </a-form-item>

          <a-form-item label="表单模板" :labelCol="labelCol" :wrapperCol="wrapperCol">

            <a-select
              :options="templetOptions"
              placeholder="请选择表单模板"
              :getPopupContainer="node => node.parentNode"
              v-model="templetValue"
              @change="(v,t)=>templetJson = t.data.props.templetJson"/>
          </a-form-item>
        </template>

      </a-form>
    </a-spin>

  </a-modal>
</template>

<script>
  import Icons from '../../../../system/modules/icon/Icons'

  import {duplicateCheck} from '@/api/api'
  import _desformUtil from '../util/desformUtil'
  import { getAction, httpAction } from '@/api/manage'
  import * as $DFConstant from '../util/DesformConstant'

  const noUseTemplet = '_______no_use_templet_______'
  export default {
    name: 'AddDesignFormModal',
    components: { Icons },
    data() {
      return {
        form: this.$form.createForm(this),
        model: {},
        visible: false,
        currentAction: 'add',
        loading: false,
        templetOptions: [{ label: '请选择模板', value: noUseTemplet, templetJson: null }],
        noUseTemplet,
        templetJson: null,
        templetValue: noUseTemplet,
        // 是否使用Online表单自动生成模板
        cgformSwitch: false,
        cgformValue: noUseTemplet,
        cgformOptions: [],
        allTables: {},
        rules: {
          cgformCode: { rules: [{ required: true, message: '请选择Online表单!' }] },
          desformName: { rules: [{ required: true, message: '请输入表单名称!' }] },
          desformCode: {
            rules: [
              {required: true, message: '请输入表单编码!'},
              {validator: this.validateDesformCode}
            ]
          }
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 18 }
        },
        iconChooseVisible: false,
        url: {
          add: '/desform/add',
          edit: '/desform/edit',
          cgform: {
            headList: '/online/cgform/head/list',
            // 通过 headId 查询字段
            fieldListByHeadId: '/online/cgform/field/listByHeadId',
            fieldListByHeadCode: '/online/cgform/field/listByHeadCode'
          },
          templet: '/desform/templet/packageOptions'
        }
      }
    },
    computed: {
      isAdding() {
        return (this.currentAction === 'add')
      },
      isEditing() {
        return (this.currentAction === 'edit')
      },
      isCopying() {
        return (this.currentAction === 'copy')
      },
      isCopyView() {
        return (this.currentAction === 'copy-view')
      },
      modalTitle() {
        return this.isEditing ? '编辑表单' : (this.isCopying ? '复制表单' : this.isCopyView ? '创建子表' : '新增表单')
      },
      showSetMobileView() {
        let { desformType } = this.model
        // 当前为新增，且
        if (!desformType) {
          return false
        }
        if (this.isCopyView) {
          return true
        }
        return desformType !== $DFConstant.DESFORM_TYPE_MV
      },
    },
    created() {
    },
    methods: {

      /** 检验 desformCode */
      validateDesformCode(rule, value, callback) {
        let pattern = /^[a-z|A-Z][a-z|A-Z\d_-]{0,}$/
        if (!pattern.test(value)) {
          callback('编码必须以字母开头，可包含数字、下划线、横杠')
        } else {
          duplicateCheck({
            tableName: 'design_form',
            fieldName: 'desform_code',
            fieldVal: value,
            dataId: (this.model || {}).id
          }).then((res) => {
            res.success ? callback() : callback(res.message)
          })
        }
      },

      open(action = 'add', record) {
        this.requestTemplet()
        this.currentAction = action
        if (this.isEditing || this.isCopying || this.isCopyView) {
          this.model = record
          this.$nextTick(() => {
            let after = this.isCopying ? '_copy' : this.isCopyView ? '_view' : ''
            let izMobileView = this.model['izMobileView']
            this.form.setFieldsValue({
              desformName: this.model['desformName'] + after,
              desformCode: this.model['desformCode'] + after,
              desformIcon: this.model['desformIcon'],
              izMobileView: izMobileView === 1 ? [1] : [],
            })
          })
        } else {
          this.model = {}
        }
        this.visible = true
      },
      close(ok) {
        this.visible = false
        if (ok) this.$emit('ok')
        setTimeout(() => {
          this.form.resetFields()
          this.templetJson = null
          this.cgformSwitch = false
          this.templetValue = this.noUseTemplet
        }, 100)
      },

      /** 选择图标 */
      handleIconChoose(value) {
        this.iconChooseVisible = false
        this.form.setFieldsValue({ desformIcon: value })
      },

      handleOk() {
        this.form.validateFields((error, values) => {
          if (!error) {
            let url = this.url.add, method = 'POST'
            let params = Object.assign({}, values)
            let izMobileView = params['izMobileView'] || []
            params['izMobileView'] = izMobileView && izMobileView.length > 0 ? izMobileView[0] : 0
            if (this.isEditing) {
              url = this.url.edit
              method = 'PUT'
              params['id'] = this.model.id
            } else if (this.isCopying) {
              params['desformDesignJson'] = this.model['desformDesignJson']
            } else if (this.isCopyView) {
              params['parentId'] = this.model['id']
              params['parentCode'] = this.model['desformCode']
              params['desformType'] = $DFConstant.DESFORM_TYPE_SV
              params['desformDesignJson'] = this.model['desformDesignJson']
              // return;
            } else if (this.templetJson != null) {
              params['desformDesignJson'] = this.templetJson
            }
            //

            // 查询cgform的field
            let cgformCode = params['cgformCode']
            if (cgformCode && cgformCode !== this.noUseTemplet) {
              this.loading = true

              // 调用该方法可关闭加载
              let messageLoading = this.$message.loading('正在通过Online表单生成中')
              const hideLoading = (type, content) => {
                messageLoading()
                this.loading = false
                if (type) {
                  this.$message[type](content)
                }
              }

              // 包含所有要生成在页面中的表，index0一定是主表，往后都是附表
              let onlineForms = [this.allTables[cgformCode]]
              // 包含所有要查询的cgform，和 onlineForms 一一对应
              let allp = [getAction(this.url.cgform.fieldListByHeadCode, { headCode: cgformCode })]
              // 判断是否包含子表
              let subTables = (onlineForms[0]['subTableStr'] || '').split(',')
              if (subTables[0]) {
                onlineForms = onlineForms.concat(subTables.map(code => {
                  allp.push(getAction(this.url.cgform.fieldListByHeadCode, {
                    headCode: code
                  }))
                  return this.allTables[code]
                }))
              }

              Promise.all(allp).then(results => {
                let main = results[0]
                // 根据 online 生成 表单
                if (main.success) {

                  let onlineFields = results.map(i => i.result)
                  let jsonObject = _desformUtil.generateFormBaseCgform(null, onlineForms, onlineFields, this.templetJson)
                  // 将online表单保存至config
                  jsonObject.config.onlineForm = cgformCode

                  // 请求修改数据
                  params['desformDesignJson'] = JSON.stringify(jsonObject)

                  this.requestChange(url, params, method, hideLoading)

                } else {
                  hideLoading('error', '生成失败: ' + main.message)
                }
              }).catch((e) => {
                console.error(e)
                hideLoading('error', '生成失败!')
              })
            } else {
              // 请求修改数据
              this.requestChange(url, params, method)
            }
          }
        })
      },

      /** 请求修改 */
      requestChange(url, params, method, hideLoading) {
        this.loading = true
        httpAction(url, params, method).then(res => {
          if (res.success) {
            if (typeof hideLoading === 'function') {
              hideLoading('success', '生成成功!')
            } else {
              this.$message.success('保存成功')
            }
            this.close(true)
          } else {
            this.$error({ title: '保存失败', content: res.message })
          }
        }).finally(() => {
          this.loading = false
        })
      },

      /** 请求查询模板 */
      requestTemplet() {
        this.loading = true

        Promise.all([
          getAction(this.url.cgform.headList, { pageNo: 1, pageSize: 9999 }),
          getAction(this.url.templet, { returnJson: true })
        ]).then((results) => {
          let [cgforms, templets] = results

          if (cgforms.success) {

            let cgformOptions = []
            let allTables = {}
            cgforms.result.records.forEach(item => {
              allTables[item.tableName] = item

              let { tableType, copyType } = item
              // 不显示附表
              if (tableType.toString() === '3') {
                return
              }
              // 不显示视图
              if (copyType.toString() === '1') {
                return
              }
              cgformOptions.push({ label: item['tableTxt'] + `（${item['tableName']}）`, value: item['tableName'] })
            })

            cgformOptions.unshift({ label: '请选择表单', value: this.noUseTemplet })
            this.cgformOptions = cgformOptions
            this.allTables = allTables
          } else {
            this.$notification['warning']({ message: '模板查询失败', description: templets.message })
          }

          if (templets.success) {
            templets.result.unshift({ label: '请选择模板', value: this.noUseTemplet, templetJson: null })
            this.templetOptions = templets.result
          } else {
            this.$notification['warning']({ message: '模板查询失败', description: templets.message })
          }

        }).finally(() => {
          this.loading = false
        })

        // getAction(this.url.templet, {
        //   returnJson: true
        // }).then(res => {
        //
        // }).finally(() => {
        //   this.loading = false
        // })
      },

      filterCgformOption(input, option) {
        return option.componentOptions.children[0].text.indexOf(input) >= 0
      }

    }
  }
</script>

<style scoped></style>