<template>
  <a-modal
    class="design-form-modal"
    :title="title"
    width="100%"
    :visible="visible"
    :style="{ top: '0', padding: '0' }"
    :bodyStyle="{padding: '0'}"
    :maskClosable="false"
    :destroyOnClose="true"
    :footer="null"
    :closable="false"
    :keyboard="false">

    <a-button
      v-if="loading && showCloseButton"
      class="btn-loading-close"
      type="danger"
      @click="close()"
    >
      <span>关闭</span>
    </a-button>

    <a-spin :spinning="loading">
      <iframe ref="iframe" v-bind="iframeProps"></iframe>
    </a-spin>
  </a-modal>
</template>

<script>
  import Vue from 'vue'
  import { httpAction } from '@/api/manage'
  import { randomString } from '@/utils/util'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  export default {
    name: 'DesignFormModal',
    props: {
      templet: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        model: null,
        visible: false,
        loading: true,
        showCloseButton: false,
        title: '表单设计器',
        messageId: randomString('16'),
        // 用来判断是否已保存
        savedJson: null,
        // 是否已更改JSON且已保存过
        changed: false,
      }
    },
    computed: {
      iframeProps() {
        let domainURL = window._CONFIG['domianURL']
        let url = '/desform/index'
        let src = domainURL + url
        if (this.model != null) {
          src += '/' + this.model.id
        }
        src += `?token=${Vue.ls.get(ACCESS_TOKEN)}&messageId=${this.messageId}`
        src += `&isTemplet=${this.templet}`
        return {
          src,
          style: {
            'width': '100%',
            'min-height': 'calc(100vh - 52px)'
          },
          frameborder: '0'
        }
      },
      jsonName() {
        return this.templet ? 'templetJson' : 'desformDesignJson'
      },
      url() {
        return this.templet ? {
          add: '/desform/templet/add',
          edit: '/desform/templet/edit'
        } : {
          add: '/desform/add',
          edit: '/desform/edit'
        }
      }
    },
    created() {
      const _this = this
      window.addEventListener('message', function(event) {
        let { messageId, type, data } = event.data

        if (`${_this.messageId}` !== messageId) {
          return
        }

        switch (type) {
          case 'created':
            _this.loading = false
            _this.showCloseButton = false
            break
          case 'mounted':
            _this.sendEvent('load-data', { token: Vue.ls.get(ACCESS_TOKEN) })
            break
          case 'closing':
            _this.handleClosing(data)
            break
          case 'modal':
            _this.showModal(data)
            break
          case 'request':
            _this.request(data)
            break
          case 'request-save':
            _this.request(data, false)
            break
        }
      }, false)
    },
    methods: {

      open(record) {
        this.model = record

        if (record) {
          this.savedJson = record[this.jsonName]
        }
        this.changed = false
        this.loading = true
        // 如果超过2秒还没有得到子组件的反馈，就显示关闭按钮，让用户可手动关闭
        setTimeout(() => {
          if (this.loading) {
            this.showCloseButton = true
          }
        }, 2000)
        this.visible = true
      },
      close() {
        this.savedJson = null
        this.visible = false
        this.showCloseButton = false
        if (this.changed) this.$emit('ok')
      },

      /** 显示模态弹窗 */
      showModal(data) {
        let modal = null
        if (data.type === 'alert-warning') {
          modal = this.$warning
        } else if (data.type === 'alert-error') {
          modal = this.$error
        } else if (data.type === 'alert-info') {
          modal = this.$info
        }

        if (modal != null) {
          if (data.options == null) data.options = {}
          modal({
            title: data.title,
            content: data.content,
            ...data.options
          })
        }

      },
      handleClosing(data) {
        if (data.list.length === 0) {
          this.close()
        } else if (JSON.stringify(data) === (this.savedJson || (this.model || {})[this.jsonName])) {
          this.close()
        } else this.$confirm({
          title: '警告',
          content: '系统可不会保存您的更改，确定要关闭吗？',
          okText: '关闭',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => {
            this.close()
          }
        })
      },

      request(data, okClose = true) {
        this.loading = true
        let onlineForm = JSON.parse(data).config.onlineForm
        httpAction(this.url.edit, {
          id: this.model.id,
          [this.jsonName]: data,
          cgformCode: onlineForm ? onlineForm : undefined
        }, 'PUT').then(res => {
          if (res.success) {
            this.$message.success('保存成功')
            this.savedJson = data
            this.changed = true
          } else {
            this.$error({ title: '保存失败', content: res.message })
          }
        }).finally(() => {
          this.loading = false
        })
      },

      sendEvent(type, data) {
        this.$refs.iframe.contentWindow.postMessage({ type, data }, '*')
      }

    }
  }
</script>

<style lang="less" scoped>
  .btn-loading-close {
    width: 80px;
    height: 36px;
    position: absolute;
    z-index: 999;
    top: 300px;
    left: calc(50% - 36px);

    color: #ff4d4f;
    background-color: #fff;
    border-color: #ff4d4f;

    &:hover {
      color: #fff;
      background-color: #ff4d4f;
      border-color: #ff4d4f;
    }
    &:active {
      color: #fff;
      background-color: #cf1322;
      border-color: #cf1322;
    }

  }
</style>
<style>
  .design-form-modal .ant-modal-header {
    padding: 12px 18px;
  }
</style>