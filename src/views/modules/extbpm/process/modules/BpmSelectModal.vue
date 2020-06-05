<template>
  <a-modal
    title="选择流程"
    :width="width"
    :visible="visible"
    :confirmLoading="loading"
    cancelText="取消"
    @ok="handleOk()"
    @cancel="close()"
  >
    <a-spin :spinning="loading">
      <template v-if="processTypeDictOptions.length>0">
        <template v-for="item of processTypeDictOptions">
          <h4 style="margin-bottom: 16px;">
            <a-icon type="appstore" /> {{ item.text }}
          </h4>
          <div>
            <template v-for="des of desformList">
              <template v-if="des.procType == item.value">
                <a-tag style="margin-bottom: 16px;line-height: 30px;height: 30px;" color="#108ee9" @click="handleOk(des)">
                  <span>{{ des.procName }}-{{ des.desformName }}</span>
                </a-tag>
              </template>
            </template>
          </div>
        </template>
      </template>
      <template v-else>
        <span>没有找到配置的流程！</span>
      </template>

    </a-spin>
  </a-modal>
</template>

<script>
  import { getAction } from '@/api/manage'
  import {initDictOptions} from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'BpmSelectModal',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      width: {
        type: Number,
        default: 800
      }
    },
    data() {
      return {
        loading: false,
        desformList: [],
        processTypeDictOptions:[],
        current: '',
        url: {
          desformList: '/process/extActDesignFlowData/getDesFormFlows'
        }
      }
    },
    created() {
      this.loadDesformList()
    },
    methods: {

      /** 加载desform */
      async loadDesformList() {
        this.loading = true
        var processTypeDict = [];
        let dictRes =  await initDictOptions('bpm_process_type');
        if (dictRes.success) {
          processTypeDict = dictRes.result;
        }
        let res =   await getAction(this.url.desformList, {});
        if (res.success) {
          this.desformList = res.result
        }
        this.processTypeDictOptions = processTypeDict.filter(item => {
          for (var item2 of this.desformList) {
              if(item2.procType == item.value){
                  return true;
              }
          }
          return false;
        });
        this.loading = false;
      },

      handleOk(value) {
        if (value) this.current = value
        this.$emit('ok', this.current)
        this.close()
      },

      close() {
        this.current = ''
        this.$emit('update:visible', false)
      }

    }
  }
</script>

<style lang="less" scoped>

</style>