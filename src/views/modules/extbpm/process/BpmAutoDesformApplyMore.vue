<template>
  <a-card :bordered="false">
    <a-spin :spinning="loading">
      <template v-if="processTypeDictOptions.length>0">
        <template v-for="item of processTypeDictOptions">
            <!--<a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
              <a-card :loading="loading"  :title="item.text" :style="{ marginTop: '24px',height:'auto' }" :headStyle="{ backgroundColor:'#eaeaea' }">
                <template v-for="des of desformList">
                  <template v-if="des.procType == item.value">
                    <a-card-grid style="width:20%;" @click="handleOk(des)"><a-icon type="file-text" style="fontSize:30px;vertical-align: middle;"/><span class="bsSpan" >{{ des.desformName }}</span></a-card-grid>
                  </template>
                </template>
              </a-card>
            </a-col>-->

          <!--<h4 style="margin-bottom: 16px;">
            <template v-if="item.value == 'oa'">
              <a-icon type="laptop" :style="{ color: '#eba43a','font-size': '16px' }"/> {{ item.text }}
            </template>
            <template v-else-if="item.value == 'test'">
              <a-icon type="experiment" :style="{ color: '#26eb8a','font-size': '16px' }"/> {{ item.text }}
            </template>
            <template v-else>
              <a-icon type="appstore" :style="{ color: '#1890ff','font-size': '16px' }"/> {{ item.text }}
            </template>
          </h4>
          <a-divider orientation="left">{{ item.text }}</a-divider>-->
          <a-tabs defaultActiveKey="1" tabPosition="top">
            <a-tab-pane :tab="item.text" key="1">
              <div>
                <template v-for="des of desformList">
                  <template v-if="des.procType == item.value">
                    <a-tag style="margin-bottom: 16px;line-height: 30px;height: 30px;" color="#2db7f5" @click="handleOk(des)">
                      <span>{{ des.desformName }}</span>
                    </a-tag>
                    <!--<a-button type="primary" ghost @click="handleOk(des)">{{ des.procName }}-{{ des.desformName }}</a-button>
                    -->
                  </template>
                </template>
              </div>
            </a-tab-pane>
          </a-tabs>
        </template>
      </template>
      <template v-else>
        <span>没有找到配置的流程！</span>
      </template>
    </a-spin>
    <auto-desform-data-modal ref="desformModal" :dialogOptions="dialogOptions"  @added="handleDesformDataAdded"></auto-desform-data-modal>
  </a-card>
</template>

<script>
  import { getAction,httpAction } from '@/api/manage'
  import {initDictOptions} from '@/components/dict/JDictSelectUtil'
  import AutoDesformDataModal from "./modules/AutoDesformDataModal.vue";

  export default {
    components: {AutoDesformDataModal},
    name: 'BpmAutoDesformApplyMore',
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
        flowCodePre:"desform_",
        dialogOptions: { top: 60, width: 1000, padding: { top: 25, right: 25, bottom: 30, left: 25 } },
        url: {
          add: '/process/extActDesignFlowData/add',
          queryByCode: '/desform/queryByCode',
          roleDegisnList:"/sys/permission/roleDegisnList"
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
        var procType = this.$route.query.procType;
        let res =   await getAction(this.url.roleDegisnList, {procType:procType});
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
        this.handleOkBpmSelect(this.current);
        this.close()
      },
      close() {

      },
      /** bmp 选择 ok */
      handleOkBpmSelect(desform) {
        var title = "表单【"+desform.desformName+"】发起申请";
        this.openDesformModal('add', desform, title)
      },

      openDesformModal(mode, record, title) {
        let desform = record, dataId = null
        if (mode === 'edit' || mode === 'detail') {
          let { desformId: id, desformCode, desformDataId } = record
          dataId = desformDataId
          desform = { id, desformCode }
        }
        getAction(this.url.queryByCode, {
          desformCode: desform.desformCode
        }).then(res => {
          if (res.success) {
            let designJson = res.result.desformDesignJson;
            let json = JSON.parse(designJson)
            // 保存 dialogConfig
            let dialogOptions = json.config.dialogOptions
            if (dialogOptions) {
              this.dialogOptions = dialogOptions
            }
            this.$refs.desformModal.open(mode, desform, dataId, title)
          }

        })

      },

      /** 流程数据保存成功后触发该事件 */
      handleDesformDataAdded(event) {
        // 将流程保存至后台
        let { desform, dataId } = event;
        this.loading = true;
        httpAction(this.url.add, {
          desformId: desform.id,
          desformCode: desform.desformCode,
          desformDataId: dataId,
          desformName: desform.desformName,
          processName: desform.procName,
          flowCode: this.flowCodePre+desform.desformCode,
          titleExp: desform.titleExp
        }, 'POST').then(res => {
          if (!res.success) {
            this.$message.error(res.message);
            return;
          }
          this.$router.push({ path: '/extbpm/process/ExtActDesignFlowDataList'})
        }).finally(() => this.loading = false)
      },

    }
  }
</script>

<style lang="less" scoped>
  .bsSpan{
    vertical-align:middle;margin-left:20px;
  }
</style>