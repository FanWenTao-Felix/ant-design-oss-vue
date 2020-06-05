<template>
  <div>

    <a-alert v-if="showAlertBar" type="info" showIcon style="margin-bottom: 16px;">
      <template slot="message">
        <span>已选择</span>
        <a style="font-weight: 600;padding: 0 4px;">{{ table.selectedRowKeys.length }}</a>
        <span>项</span>
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </template>
    </a-alert>

    <cgform-auto-list-table-wrap
      ref="cgformAutoList"
      bordered
      size="middle"
      rowKey="id"
      :columns="table.columns"
      :dataSource="table.dataSource"
      :pagination="table.pagination"
      :loading="table.loading"
      :rowSelection="rowSelectionConfig"
      :scroll="tableScroll"
      :class="{'j-table-force-nowrap': enableScrollBar}"
      :style="{minHeight: showAlertBar ? '300px': 'none'}"
      :scopedSlots="$scopedSlots"
      v-bind="$attrs"
      v-on="$listeners"
      @change="handleTableChange"
    >

      <template slot="dateSlot" slot-scope="text">
        <span>{{ getFormatDate(text) }}</span>
      </template>

      <template slot="htmlSlot" slot-scope="text">
        <div v-html="text"></div>
      </template>

      <template slot="pcaSlot" slot-scope="text">
        <div>{{ getPcaText(text) }}</div>
      </template>

      <template slot="imgSlot" slot-scope="text">
        <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
        <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
      </template>

      <template slot="fileSlot" slot-scope="text">
        <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
        <a-button
          v-else
          :ghost="true"
          type="primary"
          icon="download"
          size="small"
          @click="downloadRowFile(text)">
          下载
        </a-button>
      </template>

      <template slot="action" slot-scope="text, record">
        <template v-if="hasBpmStatus">
          <template v-if="record.bpm_status === '1'||record.bpm_status === ''|| record.bpm_status == null">
            <template v-if="buttonSwitch.update">
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical"/>
            </template>
          </template>
        </template>
        <template v-else>
          <template v-if="buttonSwitch.update">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical"/>
          </template>
        </template>
        <a-dropdown>
          <a class="ant-dropdown-link">
            更多
            <a-icon type="down"/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item v-if="buttonSwitch.detail">
              <a href="javascript:;" @click="handleDetail(record)">详情</a>
            </a-menu-item>
            <template v-if="hasBpmStatus">
              <template v-if="record.bpm_status === '1'||record.bpm_status === ''|| record.bpm_status == null">
                <a-menu-item>
                  <a href="javascript:;" @click="startProcess(record)">提交流程</a>
                </a-menu-item>
                <a-menu-item v-if="buttonSwitch.delete">
                  <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteOne(record)">
                    <a>删除</a>
                  </a-popconfirm>
                </a-menu-item>
              </template>
              <template v-else>
                <a-menu-item @click="handlePreviewPic(record)">审批进度</a-menu-item>
              </template>
            </template>
            <template v-else>
              <a-menu-item v-if="buttonSwitch.delete">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteOne(record)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </template>
            <template v-if="cgButtonLinkList && cgButtonLinkList.length>0" v-for="(btnItem,btnIndex) in cgButtonLinkList">
              <a-menu-item :key=" 'cgbtnLink'+btnIndex " v-if="showLinkButton(btnItem,record)">
                <a href="javascript:void(0);" @click="cgButtonLinkHandler(record,btnItem.buttonCode,btnItem.optType)">
                  <a-icon v-if="btnItem.buttonIcon" :type="btnItem.buttonIcon"/>
                  {{ btnItem.buttonName }}
                </a>
              </a-menu-item>
            </template>

          </a-menu>
        </a-dropdown>
      </template>

    </cgform-auto-list-table-wrap>

    <process-inst-pic-modal ref="processInstPicModal"/>

    <j-import-modal ref="importModal" :url="url.importUrl" @ok="handleImportOk"/>

    <!-- 跳转Href的动态组件方式 -->
    <a-modal v-bind="hrefComponent.model" v-on="hrefComponent.on">
      <component :is="hrefComponent.is" v-bind="hrefComponent.params"/>
    </a-modal>

  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { getFileAccessHttpUrl, postAction } from '@/api/manage'
  import ProcessInstPicModal from '@/components/bpm/ProcessInstPicModal'
  import { HrefJump } from '@/mixins/OnlAutoListMixin'
  import JImportModal from '@/components/jeecg/JImportModal'
  import ButtonExpHandler from '@/components/online/autoform/model/ButtonExpHandler'
  import CgformAutoListTableWrap from './CgformAutoListTableWrap'
  import { onlUtil } from '@/mixins/OnlineCommonUtil'

  export default {
    name: 'CgformAutoListTable',
    mixins: [HrefJump,onlUtil],
    inject: ['loadData', 'handleEdit', 'handleDetail', 'handleDeleteOne', 'onClearSelected', 'cgButtonLinkHandler'],
    components: { CgformAutoListTableWrap, ProcessInstPicModal, JImportModal },
    props: {
      url: {
        type: Object,
        required: true,
      },
      showAlertBar: {
        type: Boolean,
        default: true,
      },
      table: Object,
      isorter: Object,
      buttonSwitch: Object,
      cgButtonLinkList: Array,
      currentTableName: String,
      checkboxFlag: Boolean,
      hasBpmStatus: Boolean,
      scrollFlag: Number,
    },
    computed: {
      ...mapState({
        device: state => state.app.device,
      }),
      isMobile() {
        return this.device === 'mobile'
      },
      isDesktop() {
        return this.device === 'desktop'
      },
      flowCode() {
        return this.flowCodePre + this.currentTableName
      },
      rowSelectionConfig() {
        if (!this.checkboxFlag) {
          return null
        }
        return {
          // fixed:true,
          selectedRowKeys: this.table.selectedRowKeys,
          onChange: this.handleChangeInTableSelect
        }
      },
      enableScrollBar() {
        return this.scrollFlag === 1 || this.isMobile
      },
      tableScroll() {
        // 移动端模式下无论如何都开启横向滚动条
        if (this.enableScrollBar) {
          return undefined
        } else {
          return this.table.scroll
        }
      },
    },
    watch: {},
    data() {
      return {
        flowCodePre: 'onl_',
      }
    },
    methods: {

      handleChangeInTableSelect(selectedRowKeys, selectionRows) {
        this.table.selectionRows = selectionRows
        this.table.selectedRowKeys = selectedRowKeys
      },

      handleTableChange(pagination, filters, sorter) {
        //TODO 筛选
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field
          this.isorter.order = 'ascend' === sorter.order ? 'asc' : 'desc'
        }
        if(this.table.pagination){
          this.table.pagination = pagination;
        }
        this.loadData()
      },

      showLinkButton(item, record) {
        let btn = new ButtonExpHandler(item.exp, record)
        return btn.show
      },

      handleImportOk() {
        this.loadData(1)
      },

      startProcess(record) {
        this.$confirm({
          title: '提示',
          content: '确认提交流程吗?',
          onOk: () => {
            postAction(this.url.startProcess, {
              id: record.id,
              flowCode: this.flowCode,
              formUrl: 'modules/bpm/task/form/OnlineFormDetail',
              formUrlMobile: 'modules/bpm/task/form/OnlineFormDetail'
            }).then(res => {
              if (res.success) {
                this.$message.success(res.message)
                this.loadData()
                this.onClearSelected()
              } else {
                this.$message.warning(res.message)
              }
            })
          }
        })
      },

      handlePreviewPic(record) {
        this.$refs.processInstPicModal.title = '流程图'
        this.$refs.processInstPicModal.preview(this.flowCode, record.id)
      },

      getFormatDate(text) {
        if (text && text.length > 10) {
          return text.substring(0, 10)
        }
        return text
      },

      getImgView(text) {
        if (text && text.indexOf(',') > 0) {
          text = text.substring(0, text.indexOf(','))
        }
        return getFileAccessHttpUrl(text)
      },

      downloadRowFile(text) {
        if (!text) {
          this.$message.warning('未知的文件')
          return
        }
        if (text.indexOf(',') > 0) {
          text = text.substring(0, text.indexOf(','))
        }
        let url = getFileAccessHttpUrl(text)
        window.open(url)//TODO 下载的方法
      },

    },
  }
</script>

<style scoped>

</style>