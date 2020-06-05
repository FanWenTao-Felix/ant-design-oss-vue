<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="表单名称">
              <j-dict-select-tag v-model="queryParam.desformCode" placeholder="请选择表单名称"
                                 dictCode="design_form,desform_name,desform_code"/>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="流程编码">
              <a-input placeholder="请输入流程编码" v-model="queryParam.flowCode"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入流程名称" v-model="queryParam.processName"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <!--<a-col :md="6" :sm="8">-->
            <!--</a-col>-->
          </template>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <!--<a @click="handleToggleSearch" style="margin-left: 8px">-->
              <!--{{ toggleSearchStatus ? '收起' : '展开' }}-->
              <!--<a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>-->
              <!--</a>-->
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
   <!-- <div class="table-operator">
      <a-button @click="handleAddBpm" type="primary" icon="plus">发起流程</a-button>
    </div>-->

    <!-- table区域-begin -->
    <div>
      <!--<div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        <span>已选择 <a><b>{{ selectedRowKeys.length }}</b></a> 项</span>
        <a style="margin-left: 8px" @click="onClearSelected">清空</a>
      </div>-->

      <a-table
        ref="table"
        :scroll="{x: 1800}"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <template v-if="record.bpmStatus === '1'">
            <a @click="startProcess(record)">提交流程</a>
            <a-divider type="vertical"/>
          </template>
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
            <a-menu slot="overlay">
              <template v-if="record.bpmStatus === '1'">
                <a-menu-item>
                  <a @click="handleEdit(record)">编辑</a>
                </a-menu-item>
              </template>
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item v-if="record.bpmStatus === '1'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item  v-else  @click="handleTrack(record)">审批进度</a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

        <span slot="desformName" slot-scope="text, record">
          <j-ellipsis :value="'工单【'+text+'】'" :length="15"/>
        </span>
        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <j-ellipsis :value="text" :length="15"/>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 选择区域 -->
    <bpm-select-modal :visible.sync="selectModalVisible" @ok="handleOkBpmSelect"/>

    <!-- 表单区域 -->
    <auto-desform-data-modal ref="desformModal" @added="handleDesformDataAdded" @edited="handleDesformDataEdited" @close="handleClose"/>
    <bpm-process-form-track-modal ref="bpmProcessTrackModal"></bpm-process-form-track-modal>
  </a-card>
</template>

<script>
  import { httpAction,postAction,getAction } from '@/api/manage'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import BpmSelectModal from './modules/BpmSelectModal'
  import AutoDesformDataModal from './modules/AutoDesformDataModal'
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'
  import BpmProcessFormTrackModal from "../../bpmbiz/common/BpmProcessFormTrackModal.vue";
  import JEllipsis from '@/components/jeecg/JEllipsis'

  export default {
    name: 'ExtActDesignFlowDataList',
    mixins: [JeecgListMixin],
    components: {
      BpmProcessFormTrackModal,
      BpmSelectModal,
      AutoDesformDataModal,
      JEllipsis
    },
    data() {
      return {
        description: '表单设计器对接流程管理页面',
        bpmStatusDictOptions:[],
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '业务申请',
            align: 'center',
            dataIndex: 'bpmTitle',
            scopedSlots: { customRender: 'bpmBizTitle' }
          },
          {
            title: '表单',
            align: 'center',
            dataIndex: 'desformName',
            scopedSlots: { customRender: 'desformName' }
          },
          {
            title: '表单编码',
            align: 'center',
            dataIndex: 'desformCode'
          },
          {
            title: '流程名称',
            align: 'center',
            dataIndex: 'processName'
          },
          {
            title: '流程编码',
            align: 'center',
            dataIndex: 'flowCode'
          },
          {
            title: '创建时间',
            align: 'center',
            dataIndex: 'createTime'
          },
          {
            title: '状态',
            align: 'center',
            dataIndex: 'bpmStatus',
            customRender: (text, record, index) => {
              //字典值替换通用方法
              return filterDictText(this.bpmStatusDictOptions, text);
            }
          },
          {
            title: '操作',
            width: 150,
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            scopedSlots: { customRender: 'action' }
          }
        ],
        selectModalVisible: false,
        flowCodePre:"desform_",
        url: {
          add: '/process/extActDesignFlowData/add',
          edit: '/process/extActDesignFlowData/edit',
          list: '/process/extActDesignFlowData/list',
          delete: '/process/extActDesignFlowData/delete',
          queryFormDataById: '/desform/data/queryById',
          deleteBatch: '/process/extActDesignFlowData/deleteBatch',
          startProcess: "/process/extActProcess/startDesFormMutilProcess",
        }
      }
    },
    computed: {
    },
    methods: {

      initDictConfig() {
        //初始化字典
        initDictOptions('bpm_status').then((res) => {
          if (res.success) {
            this.bpmStatusDictOptions = res.result;
          }
        });
      },

      startProcess (record){
        var that = this;
        this.$confirm({
          title:"提示",
          content:"确认提交流程吗?",
          onOk: function(){
            //根据desformDataId查询数据对象
            that.startDesFormProcess(record);
          }
        });
      },

      async  startDesFormProcess (record){
            //根据desformDataId查询数据对象
            let res =  await getAction(this.url.queryFormDataById, {id:record.desformDataId});
            if(!res.success){
              this.$message.warning(res.message);
              return;
            }
            //var jsonData = JSON.stringify(res.result.desformDataJson);
            var jsonData = res.result.desformDataJson;
            var param = {
              flowCode:this.flowCodePre+record.desformCode,
              id:record.id,
              formUrl:"{{DOMAIN_URL}}/desform/detail/"+record.desformCode+"/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}",
              formUrlMobile:"{{DOMAIN_URL}}/desform/detail/"+record.desformCode+"/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}",
              jsonData:jsonData,
            }
            postAction(this.url.startProcess,param).then((res)=>{
              if(res.success){
                this.$message.success(res.message);
                this.loadData();
                this.onClearSelected();
              }else{
                this.$message.warning(res.message);
              }
            });
      },

      handleTrack(record){
        var flowCode = this.flowCodePre+record.desformCode;
        var params = {flowCode:flowCode,dataId:record.id};//查询条件
        this.$refs.bpmProcessTrackModal.handleTrack(params);
        this.$refs.bpmProcessTrackModal.title="审批跟踪记录";
      },

      handleDetail(record) {
        var title = "【"+record.desformName+"】详情";
        this.openDesformModal('detail', record, title)
      },

      handleEdit(record) {
        var title = "编辑【"+record.desformName+"】";
        this.openDesformModal('edit', record, title)
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
        this.$refs.desformModal.open(mode, desform, dataId, title)
      },

      /** 发起流程 */
      handleAddBpm() {
        this.selectModalVisible = true
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
          }
          this.loadData();
        }).finally(() => this.loading = false)
      },
      /** 流程数据更新成功后触发该事件 */
      handleDesformDataEdited(event) {
        // 将流程保存至后台
        let { desform, dataId } = event;
        this.loading = true;
        httpAction(this.url.edit, {
          desformDataId: dataId
        }, 'PUT').then(res => {
          if (!res.success) {
            this.$message.error(res.message);
          }
          this.loadData();
        }).finally(() => this.loading = false)
      },
      handleClose() {
        this.loadData()
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>