<template>
  <div>
    <j-modal
      centered
      :title="title"
      :visible="visible"
      width="90%"
      fullscreen
      switchFullscreen
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="关闭">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="6">

          <a-card title="组织机构" :bordered=true>
            <a-alert type="info" :showIcon="true">
              <div slot="message">
                当前选择：<span v-if="this.currOrgSelected.title">{{ getCurrOrgSelectedTitle() }}</span>
                <a v-if="this.currOrgSelected.title" style="margin-left: 10px" @click="onClearSelected">取消选择</a>
              </div>
            </a-alert>
            <!--组织机构-->
            <a-directory-tree
              selectable
              :selectedKeys="orgSelectedKeys"
              :checkStrictly="true"
              @select="this.onOrgSelect"
              :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
              :treeData="departTree"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="10">
          <a-card title="选择人员" :bordered=true>
            <!-- 查询区域 -->
            <div class="table-page-search-wrapper">
              <a-form layout="inline">
                <a-row :gutter="24">

                  <a-col :lg="8" :sm="24">
                    <a-form-item label="用户姓名">
                      <a-input placeholder="请输入姓名" v-model="queryParam.realname"></a-input>
                    </a-form-item>
                  </a-col>
                  <a-col :lg="8" :sm="24">
                    <a-form-item label="用户账号">
                      <a-input placeholder="请输入账号" v-model="queryParam.username"></a-input>
                    </a-form-item>
                  </a-col>
                  <a-col :lg="8" :sm="24">
                    <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                      <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                      <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                    </span>
                  </a-col>

                </a-row>
              </a-form>
            </div>
            <!-- table区域-begin -->
            <div>
              <a-table
                size="small"
                bordered
                rowKey="id"
                :columns="columns1"
                :dataSource="dataSource1"
                :pagination="ipagination"
                :loading="loading"
                :rowSelection="{selectedRowKeys: selectedRowKeys,onSelectAll:onSelectAll,onSelect:onSelect,onChange: onSelectChange}"
                @change="handleTableChange">

                <span slot="username" slot-scope="text, record">
                  <ellipsis :length="12" >{{text}}</ellipsis>
                </span>
                <span slot="realname" slot-scope="text, record">
                  <ellipsis :length="10">{{text}}</ellipsis>
                </span>
              </a-table>
            </div>
            <!-- table区域-end -->
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-card title="已选用户" :bordered=true>
            <!-- table区域-begin -->
            <div>
              <a-table
                size="small"
                bordered
                rowKey="id"
                :columns="columns2"
                :dataSource="dataSource2"
                :loading="loading"
                :scroll="{ y: 400 }"
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
    </j-modal>
  </div>
</template>

<script>
 import { filterObj } from '@/utils/util'
 import { getAction } from '@/api/manage'
 import {  queryUserByDepId,queryDepartTreeList } from '@/api/api'
 import Ellipsis from '@/components/Ellipsis'

  export default {
    name: "SelectUserModal",
    components: {
      Ellipsis
    },
    data () {
      return {
        title: "用户列表",
        names: [],
        visible: false,
        placement: 'right',
        description: '人员管理页面',
        // 查询条件
        queryParam: {},
        // 表头
        columns1: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width: 30,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title: '用户账号',
            align: "center",
            dataIndex: 'username',
            scopedSlots: { customRender: 'username' },
            width: 130
          },
          {
            title: '用户姓名',
            align: "center",
            width: 150,
            dataIndex: 'realname',
            scopedSlots: { customRender: 'realname' },
          },
          {
            title: '部门',
            align: "center",
            width: 150,
            dataIndex: 'orgCode'
          },
        ],
        columns2: [

          {
            title: '用户姓名',
            align:"center",
            width: "60%",
            dataIndex: 'realname'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width: "40%",
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
        orgSelectedKeys:[],
        currOrgSelected: {},
        departTree: [],
        url: {
          list: "/sys/user/list",
        },

      }
    },
    created() {
      this.currOrgSelected = {};
      this.orgSelectedKeys = [];
      this.loadData();
      this.queryDepartTree();
    },
    methods: {
      searchQuery(){
        this.loadData(1);
      },
      searchReset(){
        this.currOrgSelected = {};
        this.orgSelectedKeys = [];
        this.selectedRowKeys=[]
        this.dataSource2=[]

        this.queryParam={};
        this.loadData(1);
        this.$emit("selectFinished",this.dataSource2);
      },
      handleCancel() {
        this.visible = false;
      },
      handleOk() {
          if(this.dataSource2.length<=0){
            this.$message.warning("请选用户信息");
            return;
          }
          this.$emit("selectFinished",this.dataSource2);
          this.visible = false;
      },
      add() {
        this.visible = true;
      },
      loadData (arg){
        //加载数据 若传入参数1则加载第一页的内容
        if(arg===1){
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        //选中的部门keys
        if(this.orgSelectedKeys!=null && this.orgSelectedKeys.length>0){
            this.queryUserByDepId(this.orgSelectedKeys); // 调用方法根据选选择的id查询用户信息
        }else{
          getAction(this.url.list,params).then((res)=>{
            if(res.success){
              this.dataSource1 = res.result.records;
              this.ipagination.total = res.result.total;
            }
          })
        }
      },
      getQueryParams(){
        let param = Object.assign({}, this.queryParam,this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      getQueryField(){
        //TODO 字段权限控制
      },
      onSelectAll (selected, selectedRows, changeRows) {
        if(selected===true){
          for(var a = 0;a<changeRows.length;a++){
            this.dataSource2.push(changeRows[a]);
          }
        }else{
          for(var b = 0;b<changeRows.length;b++){
            this.dataSource2.splice(this.dataSource2.indexOf(changeRows[b]),1);
          }
        }
       // console.log(selected, selectedRows, changeRows);
      },
      onSelect (record,selected) {
        if(selected===true){
          this.dataSource2.push(record);
        }else{
          var index = this.dataSource2.indexOf(record);
          //console.log();
          if(index >=0 ){
            this.dataSource2.splice(this.dataSource2.indexOf(record),1);
          }

        }
      },
      onSelectChange (selectedRowKeys,selectedRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectedRows;
      },
      onClearSelected(){
        this.currOrgSelected = {};
        this.orgSelectedKeys = [];
        this.loadData(1);
      },
      handleDelete: function(record){
        this.dataSource2.splice(this.dataSource2.indexOf(record),1);
        this.selectedRowKeys.splice(this.selectedRowKeys.findIndex(key => key === record.id), 1);
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
      // 点击树节点,筛选出对应的用户
      onOrgSelect(selectedKeys,e) {
        if (selectedKeys[0] != null) {
          this.queryUserByDepId(selectedKeys); // 调用方法根据选选择的id查询用户信息
          if (this.orgSelectedKeys[0] !== selectedKeys[0]) {
            this.orgSelectedKeys = [selectedKeys[0]];
            let record = e.node.dataRef
            //console.log('onSelect-record', record)
            this.currOrgSelected = Object.assign({}, record)
          }
        }
      },
      // 根据选择的id来查询用户信息
      queryUserByDepId(selectedKeys) {
        var params = this.getQueryParams();//查询条件
        queryUserByDepId({ id: selectedKeys.toString(),realname:params.realname }).then((res) => {
          if (res.success) {
            if (this.queryParam.username) {
              this.dataSource1 = res.result.filter((item) => {
                return item.username.indexOf(this.queryParam.username) != -1;
              });
            } else {
              this.dataSource1 = res.result
            }
            this.ipagination.total = res.result.length;
          }
        })
      },
      queryDepartTree() {
        queryDepartTreeList().then((res) => {
          if (res.success) {
            this.departTree = res.result;
          }
        })
      },
      getCurrOrgSelectedTitle() {
        return !this.currOrgSelected.title ? '' : this.currOrgSelected.title
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