<template>
  <a-card :bordered="false">
    <a-spin :spinning="loading">
      <template v-if="processTypeDictOptions.length>0">
        <a-button type="primary" @click="handleSetUse" icon="setting">设置常用流程</a-button>
        <template v-if="commUseList.length>0">
          <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
            <a-card :loading="loading" title="常用流程" :style="{ marginTop: '24px',height:'auto' }" :headStyle="{ backgroundColor:'#eaeaea' }">
              <template v-for="des of commUseList">
                <a-card-grid :style="{width:cardWidth}" @click="handleOk(des)">
                  <span class="bsSpan" v-if="screenWidth>700">
                    <a-icon v-if="des.desformIcon" :type="des.desformIcon" :style="style"/>
                    <a-icon v-else type="file-text" :style="style"/>
                    <j-ellipsis :value="des.desformName" :length="6"/>
                  </span>
                  <div v-else class="mobName">
                    <a-icon v-if="des.appIcon" :type="des.appIcon" :style="style"/>
                    <a-icon v-else type="file-text" :style="style"/>
                    {{des.desformName.length>4?des.desformName.substr(0,4):des.desformName}}
                  </div>
                </a-card-grid>
              </template>
            </a-card>
          </a-col>
        </template>
        <template v-for="item of processTypeDictOptions">
            <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
              <a-card :loading="loading"  :title="item.text" :style="{ marginTop: '24px',height:'auto' }" :headStyle="{ backgroundColor:'#eaeaea' }">
                <!--<a @click="viewMore(item.value)" slot="extra">查看更多</a>-->
                <template v-for="des of desformList">
                  <template v-if="des.procType == item.value">
                    <a-card-grid :style="{width:cardWidth}" @click="handleOk(des)">
                      <a-icon v-if="des.desformIcon" :type="des.desformIcon" :style="style"/>
                      <a-icon v-else type="file-text" :style="style"/>
                      <span class="bsSpan" v-if="screenWidth>700">
                        <j-ellipsis :value="des.desformName" :length="6"/>
                      </span>
                      <div v-else class="mobName">
                        {{des.desformName.length>4?des.desformName.substr(0,4):des.desformName}}
                      </div>
                    </a-card-grid>
                  </template>
                </template>
              </a-card>
            </a-col>
        </template>
      </template>
      <template v-else>
        <span>没有找到配置的流程！</span>
      </template>
    </a-spin>
    <auto-desform-data-modal ref="desformModal" :dialogOptions="dialogOptions"  @added="handleDesformDataAdded"></auto-desform-data-modal>
    <bpm-auto-desform-set-use ref="setUse" @reload="reload"></bpm-auto-desform-set-use>
  </a-card>
</template>

<script>
  import { getAction,httpAction } from '@/api/manage'
  import {initDictOptions} from '@/components/dict/JDictSelectUtil'
  import AutoDesformDataModal from "./modules/AutoDesformDataModal.vue";
  import BpmAutoDesformSetUse from './modules/BpmAutoDesformSetUse'
  import JEllipsis from '@/components/jeecg/JEllipsis'

  export default {
    components: { JEllipsis, BpmAutoDesformSetUse, AutoDesformDataModal},
    name: 'BpmAutoDesformApply',
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
        commUseList: [],
        loading: false,
        desformList: [],
        processTypeDictOptions:[],
        current: '',
        flowCodePre:"desform_",
        dialogOptions: { top: 60, width: 1000, padding: { top: 25, right: 25, bottom: 30, left: 25 } },
        url: {
          add: '/process/extActDesignFlowData/add',
          queryByCode: '/desform/queryByCode',
          roleDegisnList:"/designform/designFormCommuse/roleDegisnList",
          commUseList:"/designform/designFormCommuse/getCommuseByUserId"
        },
        cardWidth:'20%',
        screenWidth:'',
      }
    },
    created() {
      this.loadDesformList()
      this.loadCommUseList()
      // 当页面初始化时,根据屏幕大小来给设置card宽度
      this.resetCardSize();
    },
    computed:{
      style() {
        let style = { 'vertical-align': 'middle' }
        if(this.screenWidth>700){
          style['font-size'] = '30px'
        }else{
          style['font-size'] = '25px'
          style['margin-left'] = '30%'
        }
        return style
      }
    },
    methods: {
      viewMore(type){
        this.$router.push({
          path: '/extbpm/process/BpmAutoDesformApplyMore',
          query: {
            procType: type
          }
        })
      },
      /** 加载desform */
      async loadDesformList() {
        this.loading = true
        var processTypeDict = [];
        let dictRes =  await initDictOptions('bpm_process_type');
        if (dictRes.success) {
          processTypeDict = dictRes.result;
        }
        let res =   await getAction(this.url.roleDegisnList, {});
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
      async loadCommUseList() {
        this.loading = true
        let res =   await getAction(this.url.commUseList, {});
        if (res.success) {
          this.commUseList = res.result
        }
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
      handleSetUse(){
        this.$refs.setUse.edit();
      },
      reload() {
        getAction(this.url.commUseList).then((res) => {
          if (res.success) {
            this.commUseList = res.result
          }
        });
      },
      resetCardSize() {
        let screenWidth = document.body.clientWidth;
        this.screenWidth = screenWidth;
        if (screenWidth <= 1350) {
          this.cardWidth = '33.3%';
        }
      },
    }
  }
</script>

<style lang="less" scoped>
  .bsSpan{
    vertical-align:middle;margin-left:20px;
  }
  .mobName{
    text-align: center;font-size: 12px;margin-top:2px;
  }
</style>