<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="8" :sm="12">
            <a-form-item label="类型">
              <a-radio-group v-model="queryParam.bizTaskType" @change="onBizTaskTypeChange">
                <a-radio value="1">待我审批</a-radio>
                <a-radio value="2">我发起的申请</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label="请假人">
              <a-input placeholder="请输入请假人" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <template v-if="queryParam.bizTaskType=='2'">
      <div class="table-operator">
        <a-button @click="handleAdd" type="primary"  icon="plus">新增</a-button>

        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
        </a-dropdown>
      </div>
    </template>
    <template v-else>
      <div class="table-operator">
        <a-button @click="batchComplete" type="primary"  icon="caret-right">批量发送</a-button>
        <a-button @click="batchReject" type="primary"  icon="rollback">批量退回</a-button>
        <a-button @click="batchEntruster" type="primary"  icon="user">批量委托</a-button>
        <a-button @click="batchSuspend" type="primary"  icon="lock">批量挂起</a-button>
        <a-button @click="batchRestart" type="primary"  icon="unlock">批量解挂</a-button>
      </div>
    </template>


    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <template v-if="record.bpmStatus === '1'">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical"/>
            <a @click="startProcess(record)">提交流程</a>
            <a-divider type="vertical"/>
          </template>
          <template v-else-if="showBtn(record.bpmStatus)&&queryParam.bizTaskType=='1'">
            <a @click="handleProcess(record)">办理</a>
            <a-divider type="vertical"/>
          </template>
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <template v-if="queryParam.bizTaskType=='2'">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              </template>
              <template v-if="record.bpmStatus === '1'">
              <a-menu-item v-if="record.bpmStatus === '1'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              </template>
              <template v-else>
                <!--<a-menu-item v-else @click="handlePreviewPic(record)">审批进度</a-menu-item>-->
                <a-menu-item v-if="queryParam.bizTaskType=='2'" @click="taskNotify(flowCode,record.id)">催办</a-menu-item>
                <a-menu-item  @click="handleTrack(record)">审批进度</a-menu-item>
                <a-menu-item v-if="showBtn(record.bpmStatus)&&queryParam.bizTaskType=='2'">
                  <a-popconfirm title="确定要作废吗?" @confirm="() => invalidProcess(record)">
                    <a>
                      作废流程
                    </a>
                  </a-popconfirm>
                </a-menu-item>
              </template>

            </a-menu>
          </a-dropdown>
        </span>

        <span slot="notify" slot-scope="text, record">
          <a-icon title="催办提醒" v-if="record.taskUrge" theme="twoTone" twoToneColor="#eb2f96"  @click="taskNotifyMe(flowCode,record.id)" type="notification"/>
          {{ text }}
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <extBizLeave-modal ref="modalForm" @ok="modalFormOk"></extBizLeave-modal>
    <ext-act-process-inst-pic-modal ref="extActProcessInstPicModal"></ext-act-process-inst-pic-modal>
    <bpm-process-track-modal ref="bpmProcessTrackModal"></bpm-process-track-modal>
    <bpm-biz-task-deal-modal ref="taskDealModal" :path="path" :formData="formData" @ok="handleOk"></bpm-biz-task-deal-modal>
    <biz-task-notify-modal ref="taskNotifyModal"></biz-task-notify-modal>
    <biz-task-notify-me-modal ref="taskNotifyMeModal"></biz-task-notify-me-modal>
    <bpm-biz-batch-entruster-deal-modal ref="batchEntrusterDealModal" @ok="handleOk"></bpm-biz-batch-entruster-deal-modal>
    <bpm-biz-batch-complete-deal-modal ref="batchCompleteDealModal" @ok="handleOk"></bpm-biz-batch-complete-deal-modal>
    <bpm-biz-batch-reject-deal-modal ref="batchRejectDealModal" @ok="handleOk"></bpm-biz-batch-reject-deal-modal>
    <bpm-biz-batch-suspend-deal-modal ref="batchSuspendDealModal" @ok="handleOk"></bpm-biz-batch-suspend-deal-modal>
    <bpm-biz-batch-restart-deal-modal ref="batchRestartDealModal" @ok="handleOk"></bpm-biz-batch-restart-deal-modal>
  </a-card>
</template>

<script>
  import ExtBizLeaveModal from './modules/ExtBizLeaveModal'
  import ExtActProcessInstPicModal from "@/views/modules/extbpm/process/modules/ExtActProcessInstPicModal";
  import {JeecgBpmListMixin} from '@/mixins/JeecgBpmListMixin'
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'
  import FormCommonModal from "@/components/bpm/FormCommonModal.vue";
  import BpmBizTaskDealModal from "@/views/modules/bpmbiz/common/BpmBizTaskDealModal.vue";
  import BpmProcessTrackModal from "@/views/modules/bpmbiz/common/BpmProcessTrackModal.vue";
  import BizTaskNotifyModal from "@/views/modules/bpmbiz/common/BizTaskNotifyModal.vue";
  import BizTaskNotifyMeModal from "@/views/modules/bpmbiz/common/BizTaskNotifyMeModal.vue";
  import { getAction } from '@/api/manage'
  import BpmBizBatchEntrusterDealModal from "@/views/modules/bpmbiz/common/BpmBizBatchEntrusterDealModal.vue";
  import BpmBizBatchCompleteDealModal from "../../bpmbiz/common/BpmBizBatchCompleteDealModal.vue";
  import BpmBizBatchRejectDealModal from "../../bpmbiz/common/BpmBizBatchRejectDealModal.vue";
  import BpmBizBatchSuspendDealModal from "../../bpmbiz/common/BpmBizBatchSuspendDealModal.vue";
  import BpmBizBatchRestartDealModal from "../../bpmbiz/common/BpmBizBatchRestartDealModal.vue";

  export default {
    name: "ExtBizLeaveList",
    mixins: [JeecgBpmListMixin],
    components: {
      BpmBizBatchRestartDealModal,
      BpmBizBatchSuspendDealModal,
      BpmBizBatchRejectDealModal,
      BpmBizBatchCompleteDealModal,
      BpmBizBatchEntrusterDealModal,
      BizTaskNotifyMeModal,
      BizTaskNotifyModal,
      BpmProcessTrackModal,
      BpmBizTaskDealModal,
      FormCommonModal,
      ExtActProcessInstPicModal,
      ExtBizLeaveModal
    },
    data () {
      return {
        description: '请假单表管理页面',
        // 查询条件
        queryParam: {
        },
        bpmStatusDictOptions:[],

        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
		  {
            title: '请假人',
            align:"center",
            dataIndex: 'name',
            scopedSlots: { customRender: 'notify' }
          },
		  {
            title: '请假天数',
            align:"center",
            dataIndex: 'days'
          },
		  {
            title: '开始时间',
            align:"center",
            dataIndex: 'beginDate'
          },
		  {
            title: '结束时间',
            align:"center",
            dataIndex: 'endDate'
          },
		  {
            title: '请假原因',
            align:"center",
            dataIndex: 'reason'
          },
		  {
            title: '流程状态',
            align:"center",
            dataIndex: 'bpmStatus',
            customRender: (text, record, index) => {
              //字典值替换通用方法
              return filterDictText(this.bpmStatusDictOptions, text);
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        flowCode:"TEST001",
        formUrl:"modules/extbpm/biz/modules/ExtBizLeaveForm",
        formUrlMobile:"modules/extbpm/biz/modules/ExtBizLeaveForm",
		    url: {
          list: "/biz/extBizLeave/list",
          delete: "/biz/extBizLeave/delete",
          deleteBatch: "/biz/extBizLeave/deleteBatch",
        },
      }
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
      async loadData(arg) {
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        this.loading = true;
        let res =  await getAction(this.url.list, params)
        this.loading = false;
        if (res.success) {
          this.dataSource =res.result.records;
          this.ipagination.total = res.result.total;
          const data = [...this.dataSource];
          if(this.queryParam.bizTaskType=='1'){
            for (var i=0;i<data.length;i++){
              //item.taskUrge = false;
              var item = data[i];
              var params = {flowCode:this.flowCode,dataId:item.id};//查询条件
              let res2 = await getAction(this.url.checkNotify,params);
              if(res2.result){
                item.taskUrge = true;
              }
            }
          }
          this.dataSource = data;
        }
      },
      //批量挂起
      batchSuspend(){
        let that = this;
        let rows = that.selectionRows;
        if(rows.length<=0){
          this.$message.warning('请选择一条记录！');
          return;
        }
        let param = {data:[]};
        for (let i = 0; i < rows.length; i++) {
          let data = {dataId:rows[i].id,flowCode:that.flowCode,bizTitle:rows[i].name};
          param.data.push(data);
        }
        that.$refs.batchSuspendDealModal.deal(param);
        that.$refs.batchSuspendDealModal.title="批量挂起";
      },
      //批量解挂
      batchRestart(){
        let that = this;
        let rows = that.selectionRows;
        if(rows.length<=0){
          this.$message.warning('请选择一条记录！');
          return;
        }
        let param = {data:[]};
        for (let i = 0; i < rows.length; i++) {
          let data = {dataId:rows[i].id,flowCode:that.flowCode,bizTitle:rows[i].name};
          param.data.push(data);
        }
        that.$refs.batchRestartDealModal.deal(param);
        that.$refs.batchRestartDealModal.title="批量解挂";
      },
      //批量委托
      batchEntruster(){
        let that = this;
        let rows = that.selectionRows;
        if(rows.length<=0){
          this.$message.warning('请选择一条记录！');
          return;
        }
        let param = {data:[]};
        for (let i = 0; i < rows.length; i++) {
          let data = {dataId:rows[i].id,flowCode:that.flowCode,bizTitle:rows[i].name};
          param.data.push(data);
        }
        that.$refs.batchEntrusterDealModal.deal(param);
        that.$refs.batchEntrusterDealModal.title="批量委托";
      },
      //批量发送
      batchComplete(){
        let that = this;
        let rows = that.selectionRows;
        if(rows.length<=0){
          this.$message.warning('请选择一条记录！');
          return;
        }
        let param = {data:[]};
        for (let i = 0; i < rows.length; i++) {
          let data = {dataId:rows[i].id,flowCode:that.flowCode,bizTitle:rows[i].name};
          param.data.push(data);
        }
        that.$refs.batchCompleteDealModal.deal(param);
        that.$refs.batchCompleteDealModal.title="批量发送";
      },
      //批量退回
      batchReject(){
        let that = this;
        let rows = that.selectionRows;
        if(rows.length<=0){
          this.$message.warning('请选择一条记录！');
          return;
        }
        let param = {data:[]};
        for (let i = 0; i < rows.length; i++) {
          let data = {dataId:rows[i].id,flowCode:that.flowCode,bizTitle:rows[i].name};
          param.data.push(data);
        }
        that.$refs.batchRejectDealModal.deal(param);
        that.$refs.batchRejectDealModal.title="批量退回";
      },
    }
  }
</script>
<style lang="less" scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>