<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="名称">
              <a-input placeholder="请输入名称" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="申请日期">
              <a-input placeholder="请输入申请日期" v-model="queryParam.applyDate"></a-input>
            </a-form-item>
          </a-col>
        <template v-if="toggleSearchStatus">
        <a-col :md="6" :sm="8">
            <a-form-item label="职务">
              <a-input placeholder="请输入职务" v-model="queryParam.duty"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="请假类别">
              <a-input placeholder="请输入请假类别" v-model="queryParam.leaveCategory"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="请假原因">
              <a-input placeholder="请输入请假原因" v-model="queryParam.leaveReason"></a-input>
            </a-form-item>
          </a-col>
        </template>
          <a-col :md="6" :sm="8" >
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

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
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item v-if="record.bpmStatus === '1'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item  v-else @click="handlePreviewPic(record)">审批进度</a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <joaEmployeeLeave-modal ref="modalForm" @ok="modalFormOk"></joaEmployeeLeave-modal>
    <ext-act-process-inst-pic-modal ref="extActProcessInstPicModal"></ext-act-process-inst-pic-modal>
  </a-card>
</template>

<script>
  import JoaEmployeeLeaveModal from './modules/JoaEmployeeLeaveModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { postAction } from '@/api/manage'
  import ExtActProcessInstPicModal from "../process/modules/ExtActProcessInstPicModal";
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: "JoaEmployeeLeaveList",
    mixins:[JeecgListMixin],
    components: {
      ExtActProcessInstPicModal,
      JoaEmployeeLeaveModal
    },
    data () {
      return {
        description: '请假申请表管理页面',
        bpmStatusDictOptions:[],
        // 表头
        columns: [{
            title: '申请编号',
            align:"center",
            dataIndex: 'applyNo'
          }, {
            title: '名称',
            align:"center",
            dataIndex: 'name'
           }, {
            title: '申请日期',
            align:"center",
            dataIndex: 'applyDate'
           },{
            title: '请假类别',
            align:"center",
            dataIndex: 'leaveCategory',
            customRender:function(text){
              if(text==1){
                return "病假";
              }else if(text==2){
                return "事假";
              }else if(text==3){
                return "年假";
              }else if(text==4){
                return "婚假";
              }else if(text==5){
                return "产假";
              }else if(text==6){
                return "丧假";
              }else if(text==7){
                return "探亲假";
              }else if(text==8){
                return "护理假";
              }else if(text==9){
                return "其他";
              }else{
                return text;
              }
            }
           },{
            title: '请假开始时间',
            align:"center",
            dataIndex: 'leaveStartDate'
           },{
            title: '请假结束时间',
            align:"center",
            dataIndex: 'leaveEndDate'
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
        flowCode:"joa_leave_01",
		    url: {
          list: "/joa/joaEmployeeLeave/list",
          delete: "/joa/joaEmployeeLeave/delete",
          deleteBatch: "/joa/joaEmployeeLeave/deleteBatch",
          startProcess: "/process/extActProcess/startMutilProcess",
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
      startProcess: function(record){
        var that = this;
        this.$confirm({
          title:"提示",
          content:"确认提交流程吗?",
          onOk: function(){
            var param = {
              flowCode:that.flowCode,
              id:record.id,
              formUrl:"modules/extbpm/joa/modules/JoaEmployeeLeaveForm",
              formUrlMobile:"applyform/leave"
            }
            postAction(that.url.startProcess,param).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              }else{
                that.$message.warning(res.message);
              }
            });
          }
        });
      },
      handlePreviewPic: function(record){
        var flowCode = this.flowCode;
        var dataId = record.id;
        this.$refs.extActProcessInstPicModal.preview(flowCode,dataId);
        this.$refs.extActProcessInstPicModal.title="流程图";
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