<template>
  <div v-if="visible" class="j-auto-desform-data-full-screen" :style="{backgroundColor:bgColor}">
    <desform-view
      class="desform-view"
      :mode="mode"
      :desformCode="desformCode"
      :dataId="dataId"
      height="100vh"
      :innerDialog="true"
      @close="close"
      @success="handleSuccess"
      @reload="handleReload"
    />
  </div>
</template>

<script>
  import DesformView from '@/components/online/desform/DesformView'

  export default {
    name: 'AutoDesformDataFullScreen',
    components: { DesformView },
    props: [],
    data() {
      return {
        mode: 'add',
        title: '操作',
        visible: false,
        desformCode: null,
        dataId: null,
        bodyOverflow: null,
        bgColor: 'rgba(0,0,0,0.6)'
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
        // 禁止body滚动，防止滚动穿透
        this.bodyOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      },

      /** 开始关闭动画 */
      close() {
        this.bgColor = 'rgba(0,0,0,0)'
        setTimeout(() => {
          this.closed()
        }, 150)
      },

      /** 完全关闭，并初始化所有的字段 */
      closed() {
        this.visible = false
        this.$emit('close')
        this.bgColor = 'rgba(0,0,0,0.6)'
        // 恢复body的滚动
        document.body.style.overflow = this.bodyOverflow
        this.bodyOverflow = null
      },

      handleSuccess() {
        this.$emit('ok')
        this.close()
      },
      handleReload() {
        this.$emit('ok')
      },

    }
  }
</script>

<style lang="less" scoped>
  .j-auto-desform-data-full-screen {
    position: fixed;
    z-index: 999;
    transition: background-color 150ms;

    &, .desform-view {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .desform-view {
      position: absolute;
    }

  }
</style>