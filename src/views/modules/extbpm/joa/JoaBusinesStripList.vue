<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="出差人">
              <a-input placeholder="请输入出差人" v-model="queryParam.applyUserName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8" >
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
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
              <a-menu-item  v-else  @click="handlePreviewPic(record)">审批进度</a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <jOaBusinesStrip-modal ref="modalForm" @ok="modalFormOk"></jOaBusinesStrip-modal>
    <ext-act-process-inst-pic-modal ref="extActProcessInstPicModal"></ext-act-process-inst-pic-modal>
  </a-card>
</template>

<script>
  import JOaBusinesStripModal from './modules/JoaBusinesStripModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { postAction } from '@/api/manage'
  import ExtActProcessInstPicModal from "../process/modules/ExtActProcessInstPicModal";
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: "JoaBusinesStripList",
    mixins:[JeecgListMixin],
    components: {
      JOaBusinesStripModal,
      ExtActProcessInstPicModal
    },
    data () {
      return {
        description: '出差表管理页面',
        bpmStatusDictOptions:[],
        // 表头
        columns: [{
            title: '出差人',
            align:"center",
            dataIndex: 'applyUserName'
           },{
            title: '部门名称',
            align:"center",
            dataIndex: 'departName'
           },{
            title: '项目名称',
            align:"center",
            dataIndex: 'projectName'
           },{
            title: '目的地',
            align:"center",
            dataIndex: 'destination'
           },{
            title: '出发时间',
            align:"center",
            dataIndex: 'departureTime'
           },{
            title: '出差天数',
            align:"center",
            dataIndex: 'dayNum'
           },{
            title: '出行工具',
            align:"center",
            dataIndex: 'travelTool',
            customRender:function(text){
              if(text==1){
                return "客车"
              }else if(text==2){
                return "火车";
              }else if(text==3){
                return "飞机"
              }else{
                return text;
              }
            }
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
        flowCode:"joa_biz_trip_01",
		    url: {
          list: "/joa/joaBusinesStrip/list",
          delete: "/joa/joaBusinesStrip/delete",
          deleteBatch: "/joa/joaBusinesStrip/deleteBatch",
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
              formUrl:"modules/extbpm/joa/modules/JoaBusinesStripForm",
              formUrlMobile:"applyform/businesStrip"
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