<template>
  <a-spin :spinning="pageLoading || loading">
    <iframe v-if="show" v-bind="iframeProps" :height="height"></iframe>
  </a-spin>
</template>

<script>
  import Vue from 'vue'
  import { httpAction } from '@/api/manage'
  import { randomString } from '@/utils/util'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { cloneObject } from '@/utils/util'
  import { DESFORM_ROUTE_TYPE, DESFORM_ROUTE_DATA_ID } from '@/utils/desform/DesformRouteUtils'

  /* desform 动态表单页面 */
  export default {
    name: 'DesformView',
    props: {
      // add = 新增，edit = 修改，detail = 只读查看
      mode: {
        type: String,
        required: true
      },
      desformCode: {
        type: String,
        default: ''
      },
      dataId: {
        type: String,
        default: null
      },
      alert: {
        type: Boolean,
        default: true
      },
      height: {
        type: String,
        default: null
      },
      innerDialog: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
        show: true,
        pageLoading: true,
        loading: false,
        // 为了防止多个页面混淆的id
        messageId: randomString('16'),
        iframeHeight: 300,
        innerDesformCode: this.desformCode,
        otherParams: '',
        url: {
          add: '/desform/data/add',
          edit: '/desform/data/edit',
          online: '/online/cgform/api/crazyForm'
        }
      }
    },
    computed: {
      iframeProps() {
        let domianURL = window._CONFIG['domianURL']
        let dataId = this.dataId == null ? 'add' : this.dataId
        // 拼接 iframe 的 src 属性
        let src = `${domianURL}/desform/${this.mode}/${this.innerDesformCode}`
        //  - 修改和查看都需要传递 dataId 参数
        if (this.mode === 'edit' || this.mode === 'detail') {
          src += `/${dataId}`
        }
        src += `?messageId=${this.messageId}&token=${Vue.ls.get(ACCESS_TOKEN)}`
        src += `&innerDialog=${this.innerDialog}` // 内部展示对话框
        if (this.innerDialog) {
          src += `&skip=false` // 是否跳转到成功页面，如果不跳转就触发success事件
        }
        src += `&innerRequest=false` // 关闭iframe的内部请求
        src += `&disableScroll=true` // 关闭iframe的内部滚动
        src += this.otherParams // 其他参数
        return {
          src,
          style: {
            'width': '100%',
            'height': this.height || this.iframeHeight + 'px',
            // 'height': (typeof this.height === 'number') ? `${this.height}px` : this.height
            'overflow': 'hidden',
            'transition': this.height ? null : 'height 0.3s'
          },
          frameborder: '0'
        }
      }
    },
    watch: {
      desformCode() {
        this.innerDesformCode = this.desformCode
      },
    },
    created() {
      const _this = this
      window.addEventListener('message', function (event) {
        let { messageId, type, data } = event.data

        if (`${_this.messageId}` !== messageId) {
          return
        }

        switch (type) {
          case 'close':
            _this.handleClose()
            break
          case 'success':
            _this.$emit('success', { target: _this })
            break
          case 'reload':
            _this.handleReload()
            break
          case 'route-jump':
            _this.handleRouteJump(data)
            break
          case 'save':
            _this.saveAllData(data)
            break
          case 'height-change':
            _this.iframeHeight = data + 10
            _this.pageLoading = false
            break
          case 'dialog-change':
            _this.$emit('dialogChange', data)
            break
          case 'show-message':
            _this.$message[data.type](data.message)
            break
        }

      }, false)

      // 如果超过6秒还没有得到子组件的反馈，就自动停止
      setTimeout(() => {
        if (this.pageLoading) {
          this.pageLoading = false
        }
      }, 6000)

    },
    methods: {
      reload() {
        this.show = false
        this.$nextTick(() => {
          this.show = true
        })
      },
      saveAllData(params) {
        const _this = this

        let url = _this.url.add, method = 'POST'
        let formData = {
          desformCode: _this.desformCode,
          desformDataJson: JSON.stringify(params.json)
        }
        if (_this.dataId != null) {
          url = _this.url.edit
          method = 'PUT'
          formData['id'] = _this.dataId
        }

        _this.loading = true;
        (() => {
          // 如果存在 onlineForm 就首先提交给online表单，获取到 id 后再提交到数据表
          if (params.onlineForm) {
            formData['onlineFormCode'] = params.onlineForm
            if (_this.dataId != null) {
              params.json.id = params.onlineDataId
            }
            let onlineUrl = `${_this.url.online}/${params.onlineForm}`

            // online 特殊处理，防止因为java的toString破坏了格式
            let onlinePostJson = cloneObject(params.json)
            for (let key in onlinePostJson) {
              if (onlinePostJson.hasOwnProperty(key)) {
                let item = onlinePostJson[key]
                if (typeof item === 'object') {
                  onlinePostJson[key] = JSON.stringify(item)
                }
              }
            }

            return httpAction(onlineUrl, onlinePostJson, method)
          } else {
            return Promise.resolve(null)
          }
        })().then((res) => {
          if (res == null) {
            // 没有提交到online表单
            // do nothing
          } else if (res.success) {
            // 提交到了onlineForm，获取到新增的uuid，且只有在新增时才提交
            if (_this.dataId == null) {
              formData['onlineFormDataId'] = res.result
            }
          } else {
            if (_this.alert === true) _this.$error({ title: '保存失败', content: res.message })
            return Promise.reject()
          }
          // 提交到数据表
          return httpAction(url, formData, method)
        }).then(res => {
          if (res.success) {
            // 保存到用户自定义url
            let { formConfig: { customRequestURL: curl } } = params
            if ((curl instanceof Array) && curl[0] && curl[0].url) {
              formData.dataId = res.result
              return httpAction(curl[0].url, formData, method)
            }
          }
          return res
        }).then(res => {
          if (res.success) {
            this.$emit('success', { res, dataId: res.result, target: _this })
            if (_this.alert === true) _this.$message.success('保存成功')
          } else {
            _this.$emit('error', { res, target: _this })
            if (_this.alert === true) _this.$error({ title: '保存失败', content: res.message })
          }
        }).finally(() => {
          _this.loading = false
        })
      },

      handleClose(data) {
        this.$emit('close', { target: this })
      },

      handleReload(data) {
        this.$emit('reload', { target: this })
      },

      /** 处理路由跳转 */
      handleRouteJump(data) {
        this.handleReload()
        let { nextRouteConfig: { routeType, routePath }, dataId } = data
        let params = `?${DESFORM_ROUTE_DATA_ID}=${dataId}`
        if (routeType === DESFORM_ROUTE_TYPE.form) {
          this.innerDesformCode = routePath
          this.otherParams = '&' + params.substring(1)
        } else if (routeType === DESFORM_ROUTE_TYPE.menu) {
          this.routeJumpNextTick(() => {
            this.$router.push(routePath + params)
          })
        } else if (routeType === DESFORM_ROUTE_TYPE.href) {
          this.routeJumpNextTick(() => {
            window.open(routePath + params, '_blank')
          })
        }
      },
      routeJumpNextTick(callback) {
        this.handleClose()
        return this.$nextTick(callback)
      },
    }
  }
</script>

<style scoped></style>