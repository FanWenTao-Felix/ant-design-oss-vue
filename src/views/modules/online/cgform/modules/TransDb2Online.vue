<template>
  <a-modal
    title="从数据库导入表单"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    cancelText="关闭"
    wrapClassName="ant-modal-cust-warp"
    style="top:5%;height:90%;">

    <template slot="footer">
      <a-button @click="handleCancel">关闭</a-button>
      <a-button @click="handleTrans" type="primary" icon="swap" :loading="btnLoading">生成表单</a-button>
    </template>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper" style="padding-bottom: 0;margin-bottom: 0">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :span="24">
            <a-form-item label="表名" style="padding-bottom: 0;margin-bottom: 0">
              <a-input placeholder="请输入表名按回车查询" v-model="filterId" @pressEnter="searchFilter"></a-input>
            </a-form-item>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <div class="ant-alert ant-alert-info" style="margin:5px 0;height: 30px;padding:6px 10px;font-size: 12px">
      <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
      <a style="margin-left: 24px" @click="onClearSelected">清空</a>
    </div>

    <a-spin :spinning="confirmLoading">
      <a-table
        ref="table"
        size="small"
        bordered
        rowKey="id"
        :pagination="false"
        :columns="columns"
        :dataSource="dataSource"
        :locale="{'emptyText':emptyText}"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}">
      </a-table>
    </a-spin>
  </a-modal>
</template>

<script>
  import { getAction,postAction } from '@/api/manage'

  export default {
    name: 'TransDb2Online',
    data(){
      return {
        modalWidth:426,
        visible:false,
        emptyText:'暂无数据',
        confirmLoading:false,
        btnLoading:false,
        queryUrl:'/online/cgform/head/queryTables/',
        transUrl:'/online/cgform/head/transTables/',
        metaSource:[],
        dataSource:[],
        filterId:'',
        columns:[{
          title: '#',
          dataIndex: '',
          key:'rowIndex',
          width:60,
          align:"center",
          customRender:function (t,r,index) {
            return parseInt(index)+1;
          }
        },{
          title: '表名',
          align:"left",
          dataIndex: 'id'
        }],
        selectedRowKeys:[]
      }
    },
    methods:{
      show(){
        this.visible=true
        this.btnLoading=false
        this.filterId=''
        this.emptyText='暂无数据'
        this.selectedRowKeys=[]
        this.queryTables()
      },
      onSelectChange(selectedRowKeys) {
        this.selectedRowKeys = selectedRowKeys;
      },
      onClearSelected(){
        this.selectedRowKeys = []
      },
      queryTables(){
        this.confirmLoading=true
        getAction(this.queryUrl).then(res=>{
          this.confirmLoading=false
          if(res.success){
            this.dataSource = res.result
            this.metaSource = [...res.result]
          }else{
            if(res.message=='noadminauth'){
              this.$message.warning('非admin用户无权限操作!')
              this.emptyText='非admin用户无权限操作!'
            }else{
              this.$message.warning(res.message)
            }
          }
        })
      },
      searchFilter(){
        if(!this.filterId){
          this.dataSource = [...this.metaSource]
        }else{
          this.dataSource = this.metaSource.filter((item) => item.id.indexOf(this.filterId)>=0)
        }
      },
      searchReset(){
        this.filterId=''
        this.searchFilter()
      },
      handleCancel(){
        this.visible=false
      },
      handleSuccess(){
        this.visible=false
        this.$emit('ok')
      },
      handleTrans(){
        if(!this.selectedRowKeys || this.selectedRowKeys.length==0){
          this.$message.warning("请选择一张表")
          return
        }else{
          this.btnLoading=true
          let tbnames = this.selectedRowKeys.join(",")
          postAction(this.transUrl+tbnames).then(res=>{
            this.btnLoading=false
            if(res.success){
              this.$message.success(res.message)
              this.handleSuccess()
            }else{
              this.$message.warning(res.message)
            }
          })
        }
      }
    }
  }
</script>

<style scoped>
  .ant-modal-cust-warp {
    height: 100%
  }

  .ant-modal-cust-warp .ant-modal-body {
    height: calc(100% - 110px) !important;
    overflow-y: auto
  }

  .ant-modal-cust-warp .ant-modal-content {
    height: 90% !important;
    overflow-y: hidden
  }
</style>