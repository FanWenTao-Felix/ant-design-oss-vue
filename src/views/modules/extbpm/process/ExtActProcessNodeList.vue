<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <!--<div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="formId">
              <a-input placeholder="请输入formId" v-model="queryParam.formId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="流程ID">
              <a-input placeholder="请输入流程ID" v-model="queryParam.processId"></a-input>
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
                <a href="javascript:;" @click="handleRule(record)">权限设置</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

        <span slot="nodeTimeoutRender" slot-scope="text">
            <template v-if="text === null || text === 0">
            </template>
            <template v-else>
                {{ text +' 小时' }}
            </template>
        </span>

        <!-- 字符串超长截取省略号显示-->
        <span slot="modelAndViewRender" slot-scope="text, record">
          <j-ellipsis :value="text" :length="50"/>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <extActProcessNode-modal ref="modalForm" @ok="modalFormOk"></extActProcessNode-modal>
    <ext-act-process-node-permission-list ref="extActProcessNodePermissionList"></ext-act-process-node-permission-list>
  </a-card>
</template>

<script>
  import ExtActProcessNodeModal from './modules/ExtActProcessNodeModal'
  import { filterObj } from '@/utils/util'
  import { deleteAction,getAction } from '@/api/manage'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import ExtActProcessNodePermissionList from "./ExtActProcessNodePermissionList";
  import JEllipsis from '@/components/jeecg/JEllipsis'

  export default {
    name: "ExtActProcessNodeList",
    mixins: [JeecgListMixin],
    components: {
      ExtActProcessNodePermissionList,
      ExtActProcessNodeModal,
      JEllipsis
    },
    props:{
      processId:{
        type: String,
        default: ''
      }
    },
    data () {
      return {
        description: '流程节点表管理页面',
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
            title: '节点名称',
            align:"center",
            dataIndex: 'processNodeName'
          },
		      {
            title: '节点编码',
            align:"center",
            dataIndex: 'processNodeCode'
          },
		      {
            title: 'PC表单地址',
            align:"center",
            dataIndex: 'modelAndView',
            scopedSlots: { customRender: 'modelAndViewRender' },
          },
		      {
            title: '移动表单地址',
            align:"center",
            dataIndex: 'modelAndViewMobile'
          },
		      {
            title: '超时提醒（时）',
            align:"center",
            dataIndex: 'nodeTimeout',
            scopedSlots: { customRender: 'nodeTimeoutRender' },
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
          list: "/process/extActProcessNode/list",
          delete: "/process/extActProcessNode/delete",
          deleteBatch: "/process/extActProcessNode/deleteBatch",
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
      handleAdd: function () {
        this.$refs.modalForm.add(this.processId);
        this.$refs.modalForm.title = "新增";
      },
      // 打开权限设置
      handleRule(record) {
        this.$refs.extActProcessNodePermissionList.ruleSettings(record);
      }
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