<template>
  <div>
    <a-modal
      centered
      :title="title"
      :width="1200"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
      destroyOnClose
      cancelText="关闭">
      <a-row :gutter="24">
        <a-col :span="16">
          <a-card title="选择表单权限字段" :bordered=true>
            <!-- 查询区域 -->
            <!-- table区域-begin -->
            <div>
              <a-table
                size="middle"
                bordered
                rowKey="id"
                :columns="columns1"
                :dataSource="dataSource1"
                :pagination="false"
                :loading="loading"
                :rowSelection="{selectedRowKeys: selectedRowKeys,onSelect:onSelect,onChange: onSelectChange,type: type}"
                @change="handleTableChange">

              </a-table>
            </div>
            <!-- table区域-end -->
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="权限选择" :bordered=true>
            <!-- table区域-begin -->
            <div>
              <a-table
                size="middle"
                bordered
                rowKey="id"
                :columns="columns2"
                :dataSource="dataSource2"
                :pagination="false"
                :loading="loading"
                :scroll="{ y: 240 }"
              >
                <span slot="action" slot-scope="text, record">
                  <a-button type="primary" size="small" @click="handleDelete(record)" icon="delete">删除</a-button>
                </span>
              </a-table>
            </div>
            <!-- table区域-end -->
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script>
 import { filterObj } from '@/utils/util'
 import { getAction } from '@/api/manage'

  export default {
    name: "SelectDesformAuthModal",
    data () {
      return {
        title: "权限列表",
        names: [],
        visible: false,
        placement: 'right',
        description: '权限管理页面',
        // 查询条件
        queryParam: {},
        // 表头
        columns1: [
          {
            title: '权限字段',
            align:"center",
            dataIndex: 'authTitle'
          },
          {
            title: '权限字段编码',
            align:"center",
            dataIndex: 'authField'
          },
        ],
        columns2: [
          {
            title: '权限字段',
            align:"center",
            width:100,
            dataIndex: 'authTitle'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width:100,
            scopedSlots: { customRender: 'action' },
          }
        ],
        //数据集
        dataSource1:[],
        dataSource2:[],
        // 分页参数
        ipagination:{
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 共" + total + "条"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        isorter:{
          column: 'createTime',
          order: 'desc',
        },
        loading:false,
        selectedRowKeys: [],
        selectedRows: [],
        type: "radio",
        url: {
          list: "/sys/user/list",
          query: (desformCode) => `/desform/auth/query/${desformCode}?group=true`,
        },
        desformCode:'',

      }
    },
    created() {
    },
    methods: {
      searchQuery(){
        this.loadData(1);
      },
      searchReset(){
        this.queryParam={};
        this.loadData(1);
      },
      handleCancel() {
        this.visible = false;
      },
      handleOk() {
          if(this.dataSource2.length<=0){
          this.$message.warning("请选用户信息");
          return;
        }
          this.$emit("selectFinished",this.dataSource2[0]);
          this.visible = false;
      },
      select(desformCode) {
        this.visible = true;
        console.log("desformCode:",desformCode)
        this.loadData(desformCode);
      },
      loadData (desformCode){
        getAction(this.url.query(desformCode)).then((res) => {
          console.log("desform res:",res)
          if (res && res.success) {
            this.dataSource1 = res.result
            //针对子表，特殊处理 authField编码
            this.dataSource1.map(function (e) {
              if (e.subTable) {
                e.authField = e.subKey + "::" + e.authField
                e.authTitle = e.subTitle + "::" + e.authTitle
                return e;
              }
            })
          }
        })
      },
      getQueryParams(){
        var param = Object.assign({}, this.queryParam,this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      getQueryField(){
        //TODO 字段权限控制
      },
      onSelect (record,selected) {
        if(selected===true){
          this.dataSource2 = [];
          this.dataSource2.push(record);
        }else{
          this.dataSource2 = [];
        }
      },
      onSelectChange (selectedRowKeys,selectedRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectedRows;
      },
      onClearSelected(){
        this.selectedRowKeys = [];
        this.selectionRows = [];
      },
      handleDelete: function(record){
        this.dataSource2 = [];
      },
      handleTableChange(pagination, filters, sorter){
        //分页、排序、筛选变化时触发
        console.log(sorter);
        //TODO 筛选
        if (Object.keys(sorter).length>0){
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend"==sorter.order?"asc":"desc"
        }
        this.ipagination = pagination;
        this.loadData();
      },

    }
  }
</script>
<style lang="less" scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }
  .ant-table-tbody .ant-table-row td{
    padding-top:15px;
    padding-bottom:15px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>