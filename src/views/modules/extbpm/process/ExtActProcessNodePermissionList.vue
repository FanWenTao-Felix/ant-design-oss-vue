<template>
  <a-drawer
    title="节点页面权限"
    :width="drawerWidth"
    @close="onClose"
    :visible="visible">
    <!-- 抽屉内容的border -->
    <div
      :style="{
          padding:'10px',
          border: '1px solid #e9e9e9',
          background: '#fff',
        }">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="8" :sm="8">
            <a-form-item label="表单类型">
              <a-select v-model="queryParam.formType"placeholder="请选择表单类型">
                <a-select-option value="1">Online表单</a-select-option>
                <a-select-option value="2">自定义表单</a-select-option>
                <a-select-option value="3">自定义开发</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        <a-col :md="8" :sm="8">
            <a-form-item label="规则编码">
              <a-input placeholder="请输入规则编码" v-model="queryParam.ruleCode"></a-input>
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
    <div class="table-operator" style="margin-bottom: 10px">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <!--<a-button type="primary" icon="download" @click="handleExportXls">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>-->
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
        :scroll="{x: 1000}"
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
    </div>
    <!-- 表单区域 -->
    <extActProcessNodePermission-modal ref="modalForm" @ok="modalFormOk"></extActProcessNodePermission-modal>
  </a-drawer>
</template>

<script>
  import ExtActProcessNodePermissionModal from './modules/ExtActProcessNodePermissionModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  export default {
    name: "ExtActProcessNodePermissionList",
    mixins:[JeecgListMixin],
    components: {
      ExtActProcessNodePermissionModal
    },
    data () {
      return {
        description: '流程节点权限管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            align:"center",
            width: 50,
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
           },
          {
            title: '规则名称',
            align:"center",
            dataIndex: 'ruleName',
            ellipsis: true
          },
		     {
            title: '规则编码',
            align:"center",
            dataIndex: 'ruleCode',
            ellipsis: true
           },
          {
            title: '表单类型',
            align:"center",
            dataIndex: 'formType',
            customRender:function (text) {
              if(text=='1'){
                return "online表单";
              }else if(text=='2'){
                return "自定义表单";
              }else if(text=='3'){
                return "自定义开发";
              }else{
                return text;
              }
            }
          },
		      {
            title: '策略',
            align:"center",
            dataIndex: 'ruleType',
             customRender:function (text) {
               if(text==1){
                 return "显示";
               }else if(text==2){
                 return "禁用";
               }else{
                 return text;
               }
             }
           },
		   {
            title: '状态',
            align:"center",
            dataIndex: 'status',
             customRender:function (text) {
               if(text==1){
                 return "正向有效";
               }else if(text==0){
                 return "反向有效";
               }else{
                 return text;
               }
             }
           },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width: 150,
            fixed: 'right',
            scopedSlots: { customRender: 'action' },
          }
        ],
        drawerWidth: 900,
        visible: false,
        record:{},
		url: {
          list: "/process/extActProcessNodePermission/list",
          delete: "/process/extActProcessNodePermission/delete",
          deleteBatch: "/process/extActProcessNodePermission/deleteBatch",
          exportXlsUrl: "process/extActProcessNodePermission/exportXls",
          importExcelUrl: "process/extActProcessNodePermission/importExcel",
       },
    }
  },
  computed: {
    importExcelUrl: function(){
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
    methods: {
      onClose() {
        this.visible = false
      },
      // 根据屏幕变化,设置抽屉尺寸
      resetScreenSize() {
        let screenWidth = document.body.clientWidth;
        if (screenWidth < 500) {
          this.drawerWidth = screenWidth
        } else {
          this.drawerWidth = 900
        }
      },
      ruleSettings(record){
        this.record = record;
        this.queryParam = {};
        this.queryParam.processId = record.processId;
        this.queryParam.processNodeCode = record.processNodeCode;
        this.visible = true;
        this.loadData();
        this.resetScreenSize();
      },
      handleAdd: function () {
        this.$refs.modalForm.add(this.record);
        this.$refs.modalForm.title = "新增";
      },
    }
  }
</script>
<style lang="less" scoped>
/** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
</style>