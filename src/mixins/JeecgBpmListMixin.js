/**
 * 新增修改完成调用 modalFormOk方法 编辑弹框组件ref定义为modalForm
 * 高级查询按钮调用 superQuery方法  高级查询组件ref定义为superQueryModal
 * data中url定义 list为查询列表  delete为删除单条记录  deleteBatch为批量删除
 */
import { filterObj,showDealBtn } from '@/utils/util';
import { deleteAction, getAction,downFile,postAction,putAction,getFileAccessHttpUrl } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN } from "@/store/mutation-types"

export const JeecgBpmListMixin = {
  data(){
    return {
      //token header
      tokenHeader: {'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)},
      /* 查询条件-请不要在queryParam中声明非字符串值的属性 */
      queryParam: {bizTaskType:'1'},
      /* 数据源 */
      dataSource:[],
      /* 分页参数 */
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
      /* 排序参数 */
      isorter:{
        column: 'createTime',
        order: 'desc',
      },
      /* 筛选参数 */
      filters: {},
      /* table加载状态 */
      loading:false,
      /* table选中keys*/
      selectedRowKeys: [],
      /* table选中records*/
      selectionRows: [],
      /* 查询折叠 */
      toggleSearchStatus:false,
      /* 高级查询条件生效状态 */
      superQueryFlag:false,
      /* 高级查询条件 */
      superQueryParams:"",
      /** 高级查询拼接方式 */
      superQueryMatchType: 'and',
      flowCode:"",
      formUrl:"",
      path:"",
      formUrlMobile:"",
      formData:{},
      url: {
        startProcess: "/process/extActProcess/startMutilProcess",
        getBizProcessNodeInfo:"/process/extActProcessNode/getBizProcessNodeInfo",
        invalidProcess:"/act/task/invalidBizProcess",
        queryFlowDataByCodeAndId:"/process/extActFlowData/queryFlowDataByCodeAndId",
        checkNotify:"/process/extActFlowData/checkNotify",
      },
    }
  },
  created() {
    if(!this.disableMixinCreated){
      console.log(' -- mixin created -- ')
      this.loadData();
      //初始化字典配置 在自己页面定义
      this.initDictConfig();
    }
  },
  methods:{
    loadData(arg) {
      if(!this.url.list){
        this.$message.error("请设置url.list属性!")
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      var params = this.getQueryParams();//查询条件
      this.loading = true;
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          this.dataSource = res.result.records;
          this.ipagination.total = res.result.total;
        }
        this.loading = false;
      })
    },
    initDictConfig(){
      console.log("--这是一个假的方法!")
    },
    handleSuperQuery(arg) {
      //高级查询方法
      if(!arg){
        this.superQueryParams=''
        this.superQueryFlag = false
      }else{
        this.superQueryFlag = true
        this.superQueryParams=JSON.stringify(arg)
        this.superQueryMatchType = matchType
      }
      this.loadData(1)
    },
    getQueryParams() {
      //获取查询条件
      let sqp = {}
      if(this.superQueryParams){
        sqp['superQueryParams']=encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      var param = Object.assign(sqp, this.queryParam, this.isorter ,this.filters);
      param.field = this.getQueryField();
      param.pageNo = this.ipagination.current;
      param.pageSize = this.ipagination.pageSize;
      return filterObj(param);
    },
    getQueryField() {
      //TODO 字段权限控制
      var str = "id,";
      this.columns.forEach(function (value) {
        str += "," + value.dataIndex;
      });
      return str;
    },

    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectionRows = selectionRows;
    },
    onClearSelected() {
      this.selectedRowKeys = [];
      this.selectionRows = [];
    },
    searchQuery() {
      this.loadData(1);
    },
    superQuery() {
      this.$refs.superQueryModal.show();
    },
    searchReset() {
      this.queryParam = {bizTaskType:'1'};
      this.loadData(1);
    },
    batchDel: function () {
      if(!this.url.deleteBatch){
        this.$message.error("请设置url.deleteBatch属性!")
        return
      }
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！');
        return;
      } else {
        var ids = "";
        for (var a = 0; a < this.selectedRowKeys.length; a++) {
          ids += this.selectedRowKeys[a] + ",";
        }
        var that = this;
        this.$confirm({
          title: "确认删除",
          content: "是否删除选中数据?",
          onOk: function () {
            deleteAction(that.url.deleteBatch, {ids: ids}).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              } else {
                that.$message.warning(res.message);
              }
            });
          }
        });
      }
    },
    handleDelete: function (id) {
      if(!this.url.delete){
        this.$message.error("请设置url.delete属性!")
        return
      }
      var that = this;
      deleteAction(that.url.delete, {id: id}).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.loadData();
        } else {
          that.$message.warning(res.message);
        }
      });
    },
    handleEdit: function (record) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "编辑";
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAdd: function () {
      this.$refs.modalForm.add();
      this.$refs.modalForm.title = "新增";
      this.$refs.modalForm.disableSubmit = false;
    },
    handleTableChange(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field;
        this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
      }
      this.ipagination = pagination;
      this.loadData();
    },
    handleToggleSearch(){
      this.toggleSearchStatus = !this.toggleSearchStatus;
    },
    modalFormOk() {
      // 新增/修改 成功时，重载列表
      this.loadData();
    },
    handleDetail:function(record){
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title="详情";
      this.$refs.modalForm.disableSubmit = true;
    },
    /* 导出 */
    handleExportXls2(){
      let paramsStr = encodeURI(JSON.stringify(this.getQueryParams()));
      let url = `${window._CONFIG['domianURL']}/${this.url.exportXlsUrl}?paramsStr=${paramsStr}`;
      window.location.href = url;
    },
    handleExportXls(fileName){
      if(!fileName || typeof fileName != "string"){
        fileName = "导出文件"
      }
      let param = {...this.queryParam};
      if(this.selectedRowKeys && this.selectedRowKeys.length>0){
        param['selections'] = this.selectedRowKeys.join(",")
      }
      console.log("导出参数",param)
      downFile(this.url.exportXlsUrl,param).then((data)=>{
        if (!data) {
          this.$message.warning("文件下载失败")
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data]), fileName+'.xls')
        }else{
          let url = window.URL.createObjectURL(new Blob([data]))
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName+'.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link); //下载完成移除元素
          window.URL.revokeObjectURL(url); //释放掉blob对象
        }
      })
    },
    /* 导入 */
    handleImportExcel(info){
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if(info.file.response.success){
          this.$message.success(`${info.file.name} 文件上传成功`);
          this.loadData();
        } else {
          this.$message.error(`${info.file.name} ${info.file.response.message}.`);
        }
      } else if (info.file.status === 'error') {
        this.$message.error(`文件上传失败: ${info.file.msg} `);
      }
    },
    /* 图片预览 */
    getImgView(text){
      if(text && text.indexOf(",")>0){
        text = text.substring(0,text.indexOf(","))
      }
      return getFileAccessHttpUrl(text)
    },
    /* 文件下载 */
    uploadFile(text){
      if(!text){
        this.$message.warning("未知的文件")
        return;
      }
      if(text.indexOf(",")>0){
        text = text.substring(0,text.indexOf(","))
      }
      let url = getFileAccessHttpUrl(text)
      window.open(url);
    },

    onBizTaskTypeChange (e) {
      this.queryParam.bizTaskType = e.target.value;
      this.handleSuperQuery();
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
            formUrl:that.formUrl,
            formUrlMobile:that.formUrlMobile
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
    handleProcess(record){
      this.getBizProcessNodeInfo(record);
    },
    handleOk(){
      this.loadData();
      this.onClearSelected();
    },
    getBizProcessNodeInfo(record){
      var params = {flowCode:this.flowCode,dataId:record.id};//查询条件
      getAction(this.url.getBizProcessNodeInfo,params).then((res)=>{
        if(res.success){
          console.log("获取流程节点信息",res);
          var  data = {
            dataId:res.result.dataId,
            taskId:res.result.taskId,
            taskDefKey:res.result.taskDefKey,
            procInsId:res.result.procInsId,
            tableName:res.result.tableName,
            permissionList:res.result.permissionList,
            bizTaskList:res.result.bizTaskList,
            vars:res.result.records
          }
          this.formData = data;
          console.log("------获取流程节点信息",this.formData);
          this.path = res.result.formUrl;
          console.log("获取流程节点信息",this.path);
          this.$refs.taskDealModal.deal(data);
          this.$refs.taskDealModal.title="流程办理";
        }
      })
    },
    // 流程作废
    invalidProcess(record) {
      var that = this;
      var params = {flowCode:this.flowCode,dataId:record.id};//查询条件
      console.log("流程作废",params)
      putAction(that.url.invalidProcess, params).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.loadData();
        } else {
          that.$message.warning(res.message);
          that.loadData();
        }
      })
    },
    handleTrack(record){
      var params = {flowCode:this.flowCode,dataId:record.id};//查询条件
      this.$refs.bpmProcessTrackModal.handleTrack(params);
      this.$refs.bpmProcessTrackModal.title="审批跟踪记录";
    },
    showBtn(bpmStatus){
      return showDealBtn(bpmStatus);
    },
    //催办
    taskNotify(flowCode,dataId){
      var params = {flowCode:flowCode,dataId:dataId};//查询条件
      getAction(this.url.queryFlowDataByCodeAndId,params).then((res)=>{
        if(res.success){
          this.$refs.taskNotifyModal.notify(res.result.processInstId);
          this.$refs.taskNotifyModal.title="催办提醒";
        }
      })

    },
    //提醒我的
    taskNotifyMe(flowCode,dataId){
      var params = {flowCode:flowCode,dataId:dataId};//查询条件
      getAction(this.url.queryFlowDataByCodeAndId,params).then((res)=>{
        if(res.success){
          this.$refs.taskNotifyMeModal.notify(res.result.processInstId);
          this.$refs.taskNotifyMeModal.title="催办提醒";
        }
      })
    },
  }

}