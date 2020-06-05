<template>
  <a-modal
    :width="fullScreenProps.modalWidth"
    :visible="visible"
    :destroyOnClose="true"
    :maskClosable="false"
    :bodyStyle="fullScreenProps.bodyStyle"
    :style="fullScreenProps.style"
    :footer="null"
    :closable="!forceFullScreen"
    @cancel="close()">

    <template slot="title">
      <div v-if="!forceFullScreen" style="width: 100%;height:20px;padding-right:32px;">
        <div style="float: left;">{{ title }}</div>
        <div v-if="!forceFullScreen" style="float: right;">
          <a-button :icon="buttonIcon" style="width:56px;height:100%;border:0" @click="toggleFullScreen"/>
        </div>
      </div>
    </template>


    <desform-view
      :mode="mode"
      :desformCode="desformCode"
      :dataId="dataId"
      :height="fullScreenProps.height"
      @success="handleSuccess"
      @dialogChange="handleDialogChange"/>

  </a-modal>
</template>

<script>
  import DesformView from '@/components/online/desform/DesformView'
  import {cssExpand} from '@/utils/util'

  export default {
    name: 'AutoDesformDataModal',
    components: { DesformView },
    props: ['dialogOptions'],
    data() {
      return {
        mode: 'add',
        title: '操作',
        visible: false,
        fullScreen: false,
        buttonIcon: 'fullscreen',
        modalWidth: '800px',

        desformCode: null,
        dataId: null,

        // 强制全屏
        forceFullScreen: false

      }
    },
    computed: {
      fullScreenProps() {
        let props = {
          height: null,
          modalWidth: this.modalWidth,
          style: { top: '40px' },
          bodyStyle: { padding: '0' }
        }
        let { dialogOptions: options } = this
        if (options != null) {
          if (!this.fullScreen) {
            props.modalWidth = options.width + 'px'
          }
          props.style.top = options.top + 'px'
          // let { top, right, bottom, left } = options.padding
          // props.bodyStyle = { padding: `${top}px ${right}px ${bottom}px ${left}px` }
        }
        if (this.forceFullScreen) {
          props.height = '100vh'
          props.style.top = '0px'
          props.style.padding = '0'
          props.bodyStyle.lineHeight = '0'
          props.modalWidth = '100%'
          cssExpand('.ant-modal-wrap { overflow: initial !important; }','auto-desform-data-model')
        } else {
          cssExpand('','auto-desform-data-model')
        }
        return props
      }
    },
    methods: {

      /** 开启表单 */
      open(mode, desformCode, dataId, title) {
        this.mode = mode
        this.title = title
        this.dataId = dataId
        this.desformCode = desformCode
        this.visible = true
      },

      /** 关闭窗口，并初始化所有的表 */
      close() {
        this.visible = false
        // 初始化
        this.model = null
        this.forceFullScreen = false
        this.$emit('close')
      },

      /** 切换全屏显示 */
      toggleFullScreen() {
        if (this.fullScreen) {
          this.modalWidth = '800px'
          this.buttonIcon = 'fullscreen'
        } else {
          this.modalWidth = '100%'
          this.buttonIcon = 'fullscreen-exit'
        }
        this.fullScreen = !this.fullScreen
      },

      handleSuccess() {
        this.close()
      },

      handleDialogChange(data) {
        this.forceFullScreen = data
      }

    }
  }
</script>

<style scoped></style>