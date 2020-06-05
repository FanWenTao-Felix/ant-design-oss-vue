<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <!--<div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="监听器名称">
              <a-input placeholder="请输入监听器名称" v-model="queryParam.listenerName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="监听类型 1执行监听 2任务监听">
              <a-input placeholder="请输入监听类型 1执行监听 2任务监听" v-model="queryParam.listenerType"></a-input>
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
          <a-popconfirm title="确定启用吗?" v-if="record.listenerStatus==0" @confirm="() => handleStatus(record.id)">
            <a>启用</a>
          </a-popconfirm>
          <a-popconfirm title="确定禁用吗?" v-if="record.listenerStatus==1" @confirm="() => handleStatus(record.id)">
            <a>禁用</a>
          </a-popconfirm>
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
    <extActListener-modal ref="modalForm" @ok="modalFormOk"></extActListener-modal>
  </a-card>
</template>

<script>
  import ExtActListenerModal from './modules/ExtActListenerModal'
  import { filterObj } from '@/utils/util'
  import { deleteAction,getAction,putAction } from '@/api/manage'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "ExtActListenerList",
    mixins: [JeecgListMixin],
    components: {
      ExtActListenerModal
    },
    data () {
      return {
        description: '流程监听表管理页面',
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
            width:180,
            dataIndex: 'listenerName',
            ellipsis: true
          },
		  {
            title: '监听类型',
            align:"center",
            width:100,
            dataIndex: 'listenerType',
            customRender:function (text) {
              if(text==1){
                return "执行监听";
              }else if(text==2){
                return "任务监听";
              }else{
                return text;
              }
            }
          },
		  {
            title: '事件',
            align:"center",
            width:100,
            dataIndex: 'listenerEvent'
          },
		  {
            title: '执行类型',
            align:"center",
            width:150,
            dataIndex: 'listenerValueType',
            customRender:function (text) {
              if(text=="expression"){
                return "表达式";
              }else if(text=="javaClass"){
                return "JAVA类";
              }else if(text=="delegateExpression"){
                return "Spring表达式";
              }else{
                return text;
              }
            }
          },
		  {
            title: '执行内容',
            align:"center",
            width:360,
            dataIndex: 'listenerValue',
            ellipsis: true
          },
		  {
            title: '状态',
            align:"center",
            width:100,
            dataIndex: 'listenerStatus',
            customRender:function (text) {
              if(text=="0"){
                return "已禁用";
              }else if(text=="1"){
                return "已启用";
              }else{
                return text;
              }
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width:200,
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/process/extActListener/list",
          delete: "/process/extActListener/delete",
          deleteBatch: "/process/extActListener/deleteBatch",
          changeStatus:"/process/extActListener/changeStatus",
        },
        
      }
    },
    methods: {
      handleStatus: function(id) {
        var that = this;
        putAction(that.url.changeStatus, { id: id }).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        })
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