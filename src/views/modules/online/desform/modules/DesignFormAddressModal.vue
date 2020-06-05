<template>

  <!-- 配置地址 -->
  <a-modal
    :width="750"
    title="配置地址"
    :visible="configAddress.visible"
    @ok="handleOk"
    @cancel="()=>configAddress.visible=false">

    <a-row style="margin-bottom: 8px;">
      <a-col :span="21">
        <a-input
          :readOnly="true"
          addonBefore="数据列表地址"
          :value="configListAddress">
          <template slot="addonAfter">
            <a :href="configListAddress" target="_blank">打开</a>
          </template>
        </a-input>
      </a-col>
    </a-row>

    <a-row v-if="false" style="margin-bottom: 8px;">
      <a-col :span="21">
        <a-input
          :readOnly="true"
          addonBefore="普通表单地址"
          :value="configFormAddress">
          <template slot="addonAfter">
            <a :href="configFormAddress" target="_blank">打开</a>
          </template>
        </a-input>
      </a-col>
    </a-row>

    <a-row style="margin-bottom: 8px;">
      <a-col :span="21">
        <a-input
          :readOnly="true"
          addonBefore="后台新增地址"
          :value="configRearFormAddress.add">

          <template slot="addonAfter">
            <a :href="configRearFormAddress.add + '?token=' + accessToken" target="_blank">打开</a>
          </template>

        </a-input>
      </a-col>
      <a-col :span="3" style="text-align: center;">
        <a-switch v-model="model.add.checked" :loading="model.add.loading" checkedChildren="有效" unCheckedChildren="无效"/>
      </a-col>
    </a-row>

    <a-row style="margin-bottom: 8px;">
      <a-col :span="21">
        <a-input
          :readOnly="true"
          addonBefore="后台修改地址"
          :value="configRearFormAddress.edit">

          <template slot="addonAfter">
            <a @click="openPage(configRearFormAddress.edit)">打开</a>
          </template>

        </a-input>
      </a-col>
      <a-col :span="3" style="text-align: center;">
        <a-switch v-model="model.edit.checked" :loading="model.edit.loading" checkedChildren="有效" unCheckedChildren="无效"></a-switch>
      </a-col>
    </a-row>

    <a-row style="margin-bottom: 8px;">
      <a-col :span="21">
        <a-input
          :readOnly="true"
          addonBefore="后台详情地址"
          :value="configRearFormAddress.detail">

          <template slot="addonAfter">
            <a @click="openPage(configRearFormAddress.detail)">打开</a>
          </template>

        </a-input>
      </a-col>
      <a-col :span="3" style="text-align: center;">
        <a-switch v-model="model.detail.checked" :loading="model.detail.loading" checkedChildren="有效" unCheckedChildren="无效"></a-switch>
      </a-col>
    </a-row>
    <div style="text-align: right;color: red;">注意：<span style="font-weight: bold;">{dataId}</span> 为数据id</div>

    <!-- 让用户输入 dataId 的弹窗 -->
    <a-modal
      title="请输入dataId"
      v-model="dataIdVisible"
      @ok="dataIdVisible=false"
      @cancel="dataIdVisible=false"
    >
      <a-input placeholder="请输入dataId" v-model="dataIdInput"></a-input>

      <template slot="footer">
        <a class="ant-btn ant-btn-primary" :href="dataIdHref" target="_blank" @click="dataIdVisible=false">确定</a>
      </template>
    </a-modal>

  </a-modal>
</template>

<script>
  import Vue from 'vue'
  import { getAction, putAction } from '@/api/manage'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  const defaultModel = {
    add: {
      checked: false,
      loading: true
    },
    edit: {
      checked: false,
      loading: true
    },
    detail: {
      checked: false,
      loading: true
    }
  }

  export default {
    name: 'DesignFormAddressModal',
    props: ['configAddress', 'configListAddress', 'configFormAddress', 'configRearFormAddress'],
    data() {
      return {
        dataIdBase: '',
        dataIdInput: '',
        dataIdVisible: false,
        model: defaultModel,
        url: {
          queryAllStatus: '/desform/url/queryAllStatus',
          editAllStatus: '/desform/url/editAllStatus'
        }
      }
    },
    computed: {
      accessToken() {
        return Vue.ls.get(ACCESS_TOKEN)
      },
      dataIdHref() {
        return this.dataIdInput ? (this.dataIdBase.replace(/{dataId}/, this.dataIdInput) + '?token=' + this.accessToken) : null
      },
    },
    watch: {
      configAddress: {
        deep: true,
        handler(val) {
          if (val.visible) {
            this.request(val.code)
          }else{
            setTimeout(() => this.model = defaultModel, 300)
          }
        }
      }
    },
    created() {
    },
    methods: {
      request(desformCode) {
        getAction(this.url.queryAllStatus, {
          desformCode
        }).then((res) => {
          let model = {}
          res.result.forEach(item => {
            model[item.urlType] = {
              checked: item.urlStatus === 1,
              loading: false
            }
          })
          this.model = model

        })
      },

      handleOk() {
        this.$set(this.configAddress, 'visible', false)

        let params = {
          desformCode: this.configAddress.code,
          add: this.model.add.checked === true ? 1 : 2,
          edit: this.model.edit.checked === true ? 1 : 2,
          detail: this.model.detail.checked === true ? 1 : 2,
        }

        putAction(this.url.editAllStatus, params)

        console.log('handleOk: ', params)
      },

      openPage(baseUrl) {
        this.dataIdInput = ''
        this.dataIdBase = baseUrl
        this.dataIdVisible = true
      }

    }
  }
</script>

<style scoped>

</style>