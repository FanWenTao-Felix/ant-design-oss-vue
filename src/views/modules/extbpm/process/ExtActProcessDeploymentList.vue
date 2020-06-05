<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <!-- 操作按钮区域 -->
    <!--<div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">部署流程</a-button>
      &lt;!&ndash;<a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>&ndash;&gt;
    </div>-->

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
          <a @click="handlePreviewPic(record)">流程图</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定激活吗?" v-if="record.suspensionState==0" @confirm="() => handleActive(record.id)">
            <a>激活</a>
          </a-popconfirm>
          <a-popconfirm title="确定挂起吗?" v-if="record.suspensionState==1" @confirm="() => handleSuspend(record.id)">
            <a>挂起</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a @click="handleNode(record)">流程节点</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.deploymentId)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
               <a-menu-item>
                  <a @click="downProcessXml(record)">下载</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <ext-act-process-pic-modal ref="extActProcessPicModal"></ext-act-process-pic-modal>
    <ext-act-process-node-deployment-modal ref="extActProcessNodeDeploymentModal"></ext-act-process-node-deployment-modal>
   </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util';
  import { deleteAction,getAction } from '@/api/manage';
  import ExtActProcessPicModal from "./modules/ExtActProcessPicModal";
  import ExtActProcessNodeDeploymentModal from "./modules/ExtActProcessNodeDeploymentModal";
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import Vue from 'vue'
  import { ACCESS_TOKEN } from "@/store/mutation-types"

  export default {
    name: "ExtActProcessDeploymentList",
    mixins: [JeecgListMixin],
    components: {
      ExtActProcessNodeDeploymentModal,
      ExtActProcessPicModal
    },
    props:{
      processKey:{
        type: String,
        default: ''
      }
    },
    data () {
      return {
        description: '流程节点部署表管理页面',
        // 查询条件
        queryParam: {},
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
            title: '名称',
            align:"center",
            dataIndex: 'name'
          },
		  {
            title: '流程KEY',
            align:"center",
            dataIndex: 'key'
          },
		  {
            title: '版本',
            align:"center",
            dataIndex: 'version'
          },

		  {
            title: '状态',
            align:"center",
            dataIndex: 'suspensionState',
            customRender:function (text) {
              if(text==1){
                return "已激活";
              }else if(text==0){
                return "挂起";
              }else{
                return text;
              }
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        isorter:{
          column: 'version',
          order: 'desc',
        },
		    url: {
          list: "/process/extActProcess/processDeploymentList",
          active: "/act/process/active/${id}",
          suspend: "/act/process/suspend/${id}",
          delete: "/process/extActProcess/deleteDeployment",
          downProcessXml: "/act/process/downProcessXml",
        },
        
      }
    },
    methods: {
      getQueryParams(){
        var param = Object.assign({}, this.queryParam,this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        param.processKey = this.processKey;
        return filterObj(param);
      },
      handleDelete: function (id) {
        var that = this;
        deleteAction(that.url.delete, {ids: id,processKey:that.processKey}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      handleNode: function(record){
        this.$refs.extActProcessNodeDeploymentModal.nodeList(record);
        this.$refs.extActProcessNodeDeploymentModal.title="流程节点";
      },
      handleActive(id) {
        let url = this.url.active.replace('${id}', id)
        getAction(url).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData();
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handleSuspend(id) {
        let url = this.url.suspend.replace('${id}', id)
        getAction(url).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData();
          } else {
            this.$message.warn(res.message);
          }
        })
      },
      handlePreviewPic: function(record){
        this.$refs.extActProcessPicModal.preview(record.deploymentId,record.diagramResourceName);
        this.$refs.extActProcessPicModal.title="流程图";
      },
      downProcessXml: function(record){
        let deploymentId = record.deploymentId
        let resourceName = record.resourceName
        const token = Vue.ls.get(ACCESS_TOKEN);
        let url = window._CONFIG['domianURL']+this.url.downProcessXml+"?deploymentId="+deploymentId+"&resourceName="+resourceName+"&token="+token
        window.location.href = url;
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