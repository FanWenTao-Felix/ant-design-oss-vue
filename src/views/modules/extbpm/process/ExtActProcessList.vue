<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入流程名字" v-model="queryParam.processName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="流程编码">
              <a-input placeholder="请输入流程编码" v-model="queryParam.processKey"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="流程类型">
              <j-dict-select-tag v-model="queryParam.processType" dict-code="bpm_process_type" />
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
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新建流程</a-button>
<!--      <a-button @click="handleEdit" type="primary" icon="plus">编辑流程</a-button>-->
      <!--<a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>-->
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
          <a-upload :showUploadList="false"
                    :action="uploadAction(record.id)"
                    :data="{'isup':1}"
                    :headers="tokenHeader"
                    @change="handleChange">
             <a>上传流程</a>
          </a-upload>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)">设计流程</a>
          <a-divider type="vertical" />
          <a @click="handleProcessConfig(record)">流程配置</a>
          <a-divider type="vertical" />
          <a @click="handlePublish(record.id)">发布</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.processStatus === 0">
                <a-popconfirm title="确定删除流程吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.processStatus === 1">
                  <a @click="handleDeploymentList(record)">版本监控</a>
              </a-menu-item>
               <a-menu-item>
                  <a @click="copyProcess(record.id)">流程复制</a>
              </a-menu-item>
                <a-menu-item>
                  <a @click="setProcessIcon(record)">表单图标</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 流程设计区域 -->
    <extActProcess-modal ref="extActProcessModal" @loadTable="loadTable"></extActProcess-modal>
    <!-- 流程配置区域 -->
    <extActProcessConfig-modal ref="extActProcessConfigModal"></extActProcessConfig-modal>
    <!-- 版本监控区域 -->
    <ext-act-process-deployment-modal ref="extActProcessDeploymentModal"></ext-act-process-deployment-modal>
    <!-- 表单图标设置-->
    <ext-act-process-icon-modal ref="extActProcessIconModal" @ok="loadTable"></ext-act-process-icon-modal>
  </a-card>
</template>

<script>
  import ExtActProcessModal from './modules/ExtActProcessModal'
  import ExtActProcessConfigModal from './modules/ExtActProcessConfigModal'
  import { filterObj } from '@/utils/util'
  import { deleteAction,getAction,putAction } from '@/api/manage'
  import ExtActProcessDeploymentModal from "./modules/ExtActProcessDeploymentModal";
  import ExtActProcessIconModal from "./modules/ExtActProcessIconModal";
  import {initDictOptions, filterDictText} from '@/components/dict/JDictSelectUtil'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "ExtActProcessList",
    mixins: [JeecgListMixin],
    components: {
      ExtActProcessDeploymentModal,
      ExtActProcessModal,
      ExtActProcessConfigModal,
      ExtActProcessIconModal
    },
    data () {
      return {
        description: '流程设计管理',
        // 查询条件
        queryParam: {},
        processTypeDictOptions:[],
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width: 60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title: '流程名称',
            align:"center",
            dataIndex: 'processName',
            sorter: true
          },
		      {
            title: '流程编码',
            align:"center",
            dataIndex: 'processKey',
            sorter: true
          },
          {
            title: '流程类型',
            align:"center",
            dataIndex: 'processType',
            sorter: true,
            customRender: (text, record, index) => {
              //字典值替换通用方法
              return filterDictText(this.processTypeDictOptions, text);
            }
          },
		      {
            title: '发布状态',
            align:"center",
            sorter: true,
            dataIndex: 'processStatus',
            customRender:function (text) {
              if(text==1){
                return "已发布";
              }else if(text==0){
                return "未发布";
              }else{
                return text;
              }
            }
          },
		      {
            title: '创建时间',
            align:"center",
            dataIndex: 'createTime',
            sorter: true
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 360,
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
		    url: {
          list: "/process/extActProcess/list",
          delete: "/process/extActProcess/delete",
          deleteBatch: "/process/extActProcess/deleteBatch",
          deployProcess: "/process/extActProcess/deployProcess",
          uploadProcess: "/process/extActProcess/uploadProcess",
          copyProcess: "/process/extActProcess/copyProcess",
        },
        
      }
    },
    methods: {
      loadTable(data){
        this.loadData();
      },
      initDictConfig() {
        //初始化字典 - 性别
        initDictOptions('bpm_process_type').then((res) => {
          if (res.success) {
            this.processTypeDictOptions = res.result;
          }
        });
      },
      handlePublish: function(id){
        var that = this;
        this.$confirm({
          title:"确认发布流程",
          content:"是否发布该流程?",
          onOk: function(){
            putAction(that.url.deployProcess, { id: id }).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
              } else {
                that.$message.warning(res.message);
              }
            })
          }
        });
      },
      handleProcessConfig:function(record){
        var id = record.id;
        var processName = record.processName;
        this.$refs.extActProcessConfigModal.config(id);
        this.$refs.extActProcessConfigModal.title="流程【"+processName+"】配置";
      },
      handleEdit: function(record){
        //if(this.selectedRowKeys.length!=1){
        //  this.$message.warning('请选择一条记录！');
        //  return ;
       // }else{
          //var id = this.selectedRowKeys[0];
          var id = record.id;
          this.$refs.extActProcessModal.designer(id);
          this.$refs.extActProcessModal.title="编辑";
       // }
      },
      handleAdd: function(){
        this.$refs.extActProcessModal.designer();
        this.$refs.extActProcessModal.title="新增";
      },
      handleDeploymentList: function(record){
        var processKey = record.processKey;
        var processName = record.processName;
        this.$refs.extActProcessDeploymentModal.deploymentList(processKey);
        this.$refs.extActProcessDeploymentModal.title="流程【"+processName+"】版本监控";
      },
      setProcessIcon: function(record){
        this.$refs.extActProcessIconModal.add(record);
        this.$refs.extActProcessIconModal.title="流程【"+ record.processName +"】图标设置";
      },
      uploadAction:function (id) {
        return window._CONFIG['domianURL'] + this.url.uploadProcess+"?id="+id;
      },
      handleChange(info) {
        if (info.file.status === 'done') {
          if (info.file.response.success) {
            this.$message.success(`流程上传成功`);
          } else {
            this.$message.error(`${info.file.name} ${info.file.response.message}.`);
          }
        } else if (info.file.status === 'error') {
          this.$message.error(`流程上传失败: ${info.file.msg} `);
        }
      },
      copyProcess: function(id){
        var that = this;
        this.$confirm({
          title:"确认复制流程",
          content:"是否复制该流程?",
          onOk: function(){
            getAction(that.url.copyProcess, { id: id }).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
              } else {
                that.$message.warning(res.message);
              }
            })
          }
        });
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
<style lang="less" scoped>
  /** 横向滚动设置配合样式 */
  .ant-table td,th { white-space: nowrap; }

  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>