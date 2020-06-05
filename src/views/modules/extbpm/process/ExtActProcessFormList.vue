<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <!--<div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="唯一编码">
              <a-input placeholder="请输入唯一编码" v-model="queryParam.relationCode"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="业务名称描述">
              <a-input placeholder="请输入业务名称描述" v-model="queryParam.bizName"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="8" >
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>-->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>

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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <extActProcessForm-modal ref="modalForm" :process-id="processId" @ok="modalFormOk"></extActProcessForm-modal>
  </a-card>
</template>

<script>
  import ExtActProcessFormModal from './modules/ExtActProcessFormModal'
  import { filterObj } from '@/utils/util'
  import { deleteAction,getAction } from '@/api/manage'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "ExtActProcessFormList",
    mixins: [JeecgListMixin],
    components: {
      ExtActProcessFormModal
    },
    props:{
      processId:{
        type: String,
        default: ''
      }
    },
    data () {
      return {
        description: '流程业务关联表管理页面',
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
            title: '唯一编码',
            align:"center",
            dataIndex: 'relationCode'
          },
		      /*{
            title: '业务名称',
            align:"center",
            dataIndex: 'bizName'
          },*/
		      {
            title: '表名/自定义表单CODE',
            align:"center",
            dataIndex: 'formTableName'
          },
		      {
            title: '表单类型',
            align:"center",
            dataIndex: 'formType',
            customRender:function (text) {
              if(text==1){
                return "Online表单";
              }else if(text==2){
                return "自定义表单";
              }else if(text==3){
                return "自定义开发";
              }else{
                return text;
              }
            }
          },
		      {
            title: '业务标题表达式',
            align:"center",
            dataIndex: 'titleExp'
          },
		    /*  {
            title: '办理风格',
            align:"center",
            dataIndex: 'formDealStyle'
          },*/
		      {
            title: '流程状态列名',
            align:"center",
            dataIndex: 'flowStatusCol'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        isorter:{
          column: 'id',
          order: 'desc',
        },
		    url: {
          list: "/process/extActProcessForm/list",
          delete: "/process/extActProcessForm/delete",
          deleteBatch: "/process/extActProcessForm/deleteBatch",
        },
        
      }
    },
    methods: {
      getQueryParams(){
        var param = Object.assign({}, this.queryParam,this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        param.processId = this.processId;
        return filterObj(param);
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