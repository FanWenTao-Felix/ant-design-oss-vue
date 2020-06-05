<template>
  <div>
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchByquery">
        <a-row :gutter="24" v-if="queryInfo && queryInfo.length>0">
          <template v-for="(item,index) in queryInfo">
            <template v-if=" item.hidden==='1' ">
              <a-col v-if="item.view=='datetime'" :md="12" :sm="16" :key=" 'query'+index " v-show="toggleSearchStatus">
                <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
              </a-col>
              <a-col v-else :md="6" :sm="8" :key=" 'query'+index " v-show="toggleSearchStatus">
                <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
              </a-col>
            </template>
            <template v-else>
              <a-col v-if="item.view=='datetime'" :md="12" :sm="16" :key=" 'query'+index ">
                <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
              </a-col>
              <a-col v-else :md="6" :sm="8" :key=" 'query'+index ">
                <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
              </a-col>
            </template>
          </template>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchByquery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>
    <div class="table-operator" v-if="showOperateButton">
      <a-button v-if="buttonSwitch.add" @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button v-if="buttonSwitch.import" @click="handleImportXls" type="primary" icon="upload">导入</a-button>
      <a-button v-if="buttonSwitch.export" @click="handleExportXls" type="primary" icon="download">导出</a-button>
      <template v-if="cgButtonList && cgButtonList.length>0" v-for="(item,index) in cgButtonList">
        <a-button
          v-if=" item.optType=='js' "
          :key=" 'cgbtn'+index "
          @click="cgButtonJsHandler(item.buttonCode)"
          type="primary"
          :icon="item.buttonIcon">
          {{ item.buttonName }}
        </a-button>
        <a-button
          v-else-if=" item.optType=='action' "
          :key=" 'cgbtn'+index "
          @click="cgButtonActionHandler(item.buttonCode)"
          type="primary"
          :icon="item.buttonIcon">
          {{ item.buttonName }}
        </a-button>
      </template>

      <!-- 高级查询 -->
      <j-super-query
        v-if="table.type!=3"
        ref="superQuery"
        :fieldList="superQuery.fieldList"
        :saveCode="$route.fullPath"
        :loading="table.loading"
        @handleSuperQuery="handleSuperQuery"/>

      <a-button
        v-if="buttonSwitch.batch_delete && table.type!=2"
        @click="handleDelBatch"
        v-show="table.selectedRowKeys.length > 0"
        ghost
        type="primary"
        icon="delete">批量删除</a-button>
    </div>

    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        已选择&nbsp;<a style="font-weight: 600">{{ table.selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>
      <a-table
        bordered
        size="middle"
        rowKey="id"
        :columns="table.columns"
        :dataSource="table.dataSource"
        :pagination="table.pagination"
        :loading="table.loading"
        :rowSelection="rowSelectionConfig"
        @change="handleTableChange"
        :scroll="tableScroll"
        :customRow="clickThenCheck"
        :class="{'j-table-force-nowrap': enableScrollBar}"
        style="min-height: 300px;max-width: 100%;">

        <template slot="dateSlot" slot-scope="text">
          <span>{{ getFormatDate(text) }}</span>
        </template>

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>

        <template slot="pcaSlot" slot-scope="text">
          <div>{{ getPcaText(text) }}</div>
        </template>

        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="加载失败" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>

        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="downloadRowFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <template v-if="hasBpmStatus">
            <template v-if="record.bpm_status == '1'||record.bpm_status == ''|| record.bpm_status == null">
              <template v-if="buttonSwitch.update">
                <a @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical"/>
              </template>
            </template>
          </template>

          <template v-else>
            <template v-if="buttonSwitch.update">
              <a @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical"/>
            </template>
          </template>

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="buttonSwitch.detail">
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>

              <template v-if="hasBpmStatus">
                <template v-if="record.bpm_status == '1'||record.bpm_status == ''|| record.bpm_status == null">
                  <a-menu-item>
                    <a href="javascript:;" @click="startProcess(record)">提交流程</a>
                  </a-menu-item>

                  <a-menu-item v-if="buttonSwitch.delete">
                    <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteOne(record)">
                      <a>删除</a>
                    </a-popconfirm>
                  </a-menu-item>
                </template>

                <template v-else>
                  <a-menu-item @click="handlePreviewPic(record)">审批进度</a-menu-item>
                </template>

              </template>

              <template v-else>
                <a-menu-item v-if="buttonSwitch.delete">
                  <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteOne(record)">
                    <a>删除</a>
                  </a-popconfirm>
                </a-menu-item>
              </template>

              <template v-if="cgButtonLinkList && cgButtonLinkList.length>0" v-for="(btnItem,btnIndex) in cgButtonLinkList">
                <a-menu-item :key=" 'cgbtnLink'+btnIndex " v-if="showLinkButton(btnItem,record)">
                  <a href="javascript:void(0);" @click="cgButtonLinkHandler(record,btnItem.buttonCode,btnItem.optType)">
                    <a-icon v-if="btnItem.buttonIcon" :type="btnItem.buttonIcon" />
                    {{ btnItem.buttonName }}
                  </a>
                </a-menu-item>
              </template>

            </a-menu>
          </a-dropdown>


        </span>

      </a-table>
    </div>

    <online-common-modal
      ref="modal"
      :code="code"
      :foreignKeys="foreignKeys"
      @success="handleFormSuccess"
      @schema="handleGetSchema">
    </online-common-modal>
    <j-import-modal ref="importModal" :url="getImportUrl()" @ok="importOk" biz="importSingleOnly"></j-import-modal>
    <process-inst-pic-modal ref="processInstPicModal"></process-inst-pic-modal>

    <!-- 跳转Href的动态组件方式 -->
    <a-modal v-bind="hrefComponent.model" v-on="hrefComponent.on">
      <component :is="hrefComponent.is" v-bind="hrefComponent.params"/>
    </a-modal>

  </div>
</template>

<script>
  import { postAction,getAction,deleteAction,downFile,getFileAccessHttpUrl } from '@/api/manage';
  import { filterMultiDictText } from '@/components/dict/JDictSelectUtil';
  import { filterObj } from '@/utils/util';

  import { mixinDevice } from '@/utils/mixin'
  import { HrefJump } from '@/mixins/OnlAutoListMixin'
  import JSuperQuery from '@comp/jeecg/JSuperQuery'
  import OnlineCommonModal from './OnlineCommonModal'
  import OnlineQueryFormItem from '@/components/online/autoform/OnlineQueryFormItem';
  import JImportModal from '@/components/jeecg/JImportModal'
  import ProcessInstPicModal from "@/components/bpm/ProcessInstPicModal";

  import ButtonExpHandler from '@/components/online/autoform/model/ButtonExpHandler'
  import { onlUtil } from '@/mixins/OnlineCommonUtil'
  import lodash_object from 'lodash'

  const metaPagination = {
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条'
    },
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0
  };

  export default {
    name: 'OnlineCommonList',
    mixins: [HrefJump, mixinDevice, onlUtil],
    components: {
      JSuperQuery,
      OnlineCommonModal,
      OnlineQueryFormItem,
      JImportModal,
      ProcessInstPicModal
    },
    props:{
      code:{
        type:String,
        required:false,
        default:''
      },
      model:{
        type:Object,
        required:false,
        default:()=>{}
      },
      main:{
        type:Object,
        required:false,
        default:()=>{}
      }
    },
    data(){
      return {
        /*
        * 1.列表渲染，数据加载
        * 数据字典值替换，
        * 2.查询条件
        * 3.自定义button 6.按钮权限
        * 4.js增强
        * 5.java增强
        * 7.流程提交
        * 8.导入导出
        *
        * */
        url: {
          getQueryInfo:'/online/cgform/api/getQueryInfo/',
          getColumns: '/online/cgform/api/getColumns/',
          getData: '/online/cgform/api/getData/',
          optPre:"/online/cgform/api/form/",
          exportXls:'/online/cgform/api/exportXls/',
          buttonAction:'/online/cgform/api/doButton',
          startProcess: "/process/extActProcess/startMutilProcess",
        },
        lodash: lodash_object,
        table: {
          loading: false,
          // 1单表、2主表、3附表
          type:1,
          scroll:{x:false},
          // 表头
          columns: [],
          //数据集
          dataSource: [],
          // 选择器
          selectedRowKeys: [],
          selectionRows: [],
          // 分页参数
          pagination: {}
        },
        // 查询参数，多个页面的查询参数用 code 作为键来区分
        queryParamsMap: {},
        // 高级查询
        superQuery: {
          // 字段列表
          fieldList: [],
          // 查询参数
          params: '',
          // 查询条件拼接方式 'and' or 'or'
          matchType: 'and'
        },

        isorter:{
          column: 'createTime',
          order: 'desc',
        },


        checkboxFlag:true,
        dictOptions:{},
        formTemplate:'',
        description:'',
        currentTableName:'',
        cgButtonLinkList:[],
        cgButtonList:[],
        EnhanceJS:{},
        buttonSwitch:{
          add:true,
          update:true,
          delete:true,
          batch_delete:true,
          import:true,
          export:true,
          detail:true
        },
        actionColumn:{
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },

          align:"center",
          width:150
        },
        hasBpmStatus:false,
        queryInfo:[],
        foreignKeys:[],
        toggleSearchStatus:false,
        flowCodePre:"onl_",

      }
    },
    computed:{
      rowSelectionConfig:function() {
        if(this.table.type == 2){
          return {
            type:'radio',
            selectedRowKeys: this.table.selectedRowKeys,
            onChange: this.handleChangeInTableSelect,
          }
        }
        if(!this.checkboxFlag){
          return null
        }
        return {
          // fixed:true,
          selectedRowKeys:this.table.selectedRowKeys,
          onChange: this.handleChangeInTableSelect
        }
      },
      queryParam: {
        get() {
          return this.queryParamsMap[this.code]
        },
        set(newVal) {
          this.$set(this.queryParamsMap, this.code, newVal)
        }
      },
      showOperateButton(){
        if(this.table.type === 3){
          if(!this.main || !this.main.id){
            return false
          }
        }
        return true
      },
      enableScrollBar() {
        return this.model.scrollFlag === 1 || this.isMobile()
      },
      tableScroll() {
        // 移动端模式下无论如何都开启横向滚动条
        if (this.enableScrollBar) {
          return undefined
        } else {
          return { x :false }
        }
      },
    },
    watch:{
      main: {
        deep: true,
        immediate: true,
        handler() {
          console.log("this.main",this.main)
          if(this.table.type === 3){
            if(!this.main || !this.main.id){
              this.clearAll();
            }else{
              this.loadData(1);
            }

          }
        }
      },

    },
    mounted(){
     // this.initListByModel();
    },
    methods:{
      initListByModel(){
        console.log("this.model>>",this.model)
        if(this.model.checkboxFlag == 'Y'){
          this.checkboxFlag = true
        }else{
          this.checkboxFlag = false
        }

        this.table.type = this.model.tableType
        if(this.model.paginationFlag=='Y'){
          let pageObj = {...metaPagination}
          if(this.table.type === 2){
            pageObj.pageSize = 5;
            pageObj.pageSizeOptions=['5', '10', '15']
          }
          this.table.pagination = pageObj;
        }else{
          this.table.pagination = false
        }
        this.foreignKeys = this.model.foreignKeys
        // href 跳转
        const fieldHrefSlotKeysMap = {}
        this.model.fieldHrefSlots.forEach(item => fieldHrefSlotKeysMap[item.slotName] = item)
        this.dictOptions = this.model.dictOptions
        this.formTemplate = this.model.formTemplate
        this.description = this.model.description
        this.currentTableName = this.model.currentTableName
        this.initCgButtonList(this.model.cgButtonList)
        this.initCgEnhanceJs(this.model.enhanceJs)
        this.initButtonSwitch(this.model.hideColumns)
        let currColumns = this.model.columns
        for(let a=0;a<currColumns.length;a++){
          Object.keys(currColumns[a]).map(pro=>{
            // 删掉空值的字段（不删除 空字符串('') 或 数字 0 ）
            if (currColumns[a][pro] == null) {
              delete currColumns[a][pro];
            }
          })
          // 处理列中的 href 跳转和 dict 字典，使两者可以兼容存在
          this.handleColumnHrefAndDict(currColumns[a], fieldHrefSlotKeysMap)

        }
        currColumns.push(this.actionColumn);
        this.table.columns = [...currColumns]
        this.hasBpmStatusFilter();
        if (!this.queryParam) {
          this.queryParam = {}
        }
        this.loadData();
        this.initQueryInfo();
        //加载新路由，清空checkbox选中
        this.table.selectedRowKeys = [];
      },

      initCgButtonList(btnList){
        let linkArr = []
        let buttonArr = []
        if(btnList && btnList.length>0){
          for(let i=0;i<btnList.length;i++){
            let temp = btnList[i]
            if(temp.buttonStyle=='button'){
              buttonArr.push(temp)
            }else if(temp.buttonStyle=='link'){
              linkArr.push(temp)
            }
          }
        }
        this.cgButtonLinkList = [...linkArr]
        this.cgButtonList=[...buttonArr]
      },
      cgButtonActionHandler(buttonCode){
        //处理自定义button的 需要配置该button自定义sql
        if(!this.table.selectedRowKeys || this.table.selectedRowKeys.length==0){
          this.$message.warning("请先选中一条记录")
          return false
        }
        if(this.table.selectedRowKeys.length>1){
          this.$message.warning("请只选中一条记录")
          return false
        }
        let params = {
          formId:this.code,
          buttonCode:buttonCode,
          dataId:this.table.selectedRowKeys[0]
        }
        console.log("自定义按钮请求后台参数：",params)
        postAction(this.url.buttonAction,params).then(res=>{
          if(res.success){
            this.loadData()
            this.$message.success("处理完成!")
          }else{
            this.$message.warning("处理失败!")
          }
        })

      },
      cgButtonLinkHandler(record,buttonCode,optType){
        if(optType=="js"){
          if(this.EnhanceJS[buttonCode]){
            this.EnhanceJS[buttonCode](this,record)
          }
        }else if(optType=="action"){
          let params = {
            formId:this.code,
            buttonCode:buttonCode,
            dataId:record.id
          }
          console.log("自定义按钮link请求后台参数：",params)
          postAction(this.url.buttonAction,params).then(res=>{
            if(res.success){
              this.loadData()
              this.$message.success("处理完成!")
            }else{
              this.$message.warning("处理失败!")
            }
          })
        }
      },
      cgButtonJsHandler(buttonCode){
        if(this.EnhanceJS[buttonCode]){
          this.EnhanceJS[buttonCode](this)
        }
      },
      initCgEnhanceJs(enhanceJs){
        //console.log("--onlineList-js增强",enhanceJs)
        if(enhanceJs){
          let Obj = eval ("(" + enhanceJs + ")");
          this.EnhanceJS = new Obj(getAction,postAction,deleteAction);
          this.cgButtonJsHandler('created')
        }else{
          this.EnhanceJS = ''
        }
      },

      initButtonSwitch(hideColumns){
        if(hideColumns && hideColumns.length>0){
          Object.keys(this.buttonSwitch).forEach(key=>{
            if(hideColumns.indexOf(key)>=0){
              this.buttonSwitch[key]=false
            }
          })

        }
      },

      hasBpmStatusFilter(){
        var columnObjs = this.table.columns;
        let columns = [];
        for (var item of columnObjs) {
          columns.push(item.dataIndex);
        }
        if(columns.includes('bpm_status')||columns.includes('BPM_STATUS')){
          this.hasBpmStatus = true;
        }else{
          this.hasBpmStatus = false;
        }
      },

      loadData(arg){
        this.onClearSelected();
        if(this.table.pagination){
          if(arg==1){
            this.table.pagination.current=1
          }

          if(this.initDependQueryParam() === false){
            return false;
          }

          this.table.loading = true
          let params = this.getQueryParams();//查询条件
          //如果子表 需要获取主表的信息

          console.log(`--onlineList-${this.description}查询条件-->`,params)
          getAction(`${this.url.getData}${this.code}`,params).then((res)=>{
            console.log("--onlineList-列表数据",res)
            if(res.success){
              let result = res.result;
              if(Number(result.total)>0){
                this.table.pagination.total = Number(result.total)
                this.table.dataSource = result.records
              }else{
                this.table.pagination.total=0;
                this.table.dataSource=[]
                //this.$message.warning("查无数据")
              }
            }else{
              this.$message.warning(res.message)
            }
          }).finally(() => {
            this.table.loading = false
          })
        }else{
          this.loadDataNoPage()
        }
      },
      loadDataNoPage(){
        if(this.initDependQueryParam() === false){
          return false;
        }
        this.table.loading = true
        let param = this.getQueryParams()//查询条件
        param['pageSize'] = -521;
        getAction(`${this.url.getData}${this.code}`,filterObj(param)).then((res)=>{
          console.log("--onlineList-列表数据",res)
          if(res.success){
            let result = res.result;
            if(Number(result.total)>0){
              this.table.dataSource = result.records
            }else{
              this.table.dataSource=[]
            }
          }else{
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.table.loading = false
        })
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam,this.isorter);
        param.pageNo = this.table.pagination.current;
        param.pageSize = this.table.pagination.pageSize;
        param.superQueryMatchType = this.superQuery.matchType
        param.superQueryParams = encodeURIComponent(this.superQuery.params)
        return filterObj(param);
      },

      initQueryInfo(){
        getAction(`${this.url.getQueryInfo}${this.code}`).then((res)=>{
          console.log("--onlineList-获取查询条件配置",res);
          if(res.success){
            this.queryInfo = res.result
          }else{
            this.$message.warning(res.message)
          }
        })
      },

      handleAdd(){
        this.cgButtonJsHandler('beforeAdd')
        this.$refs.modal.add(this.formTemplate,this.main);
      },
      handleEdit(record){
        this.cgButtonLinkHandler(record,"beforeEdit","js")
        this.$refs.modal.edit(this.formTemplate,record.id);
      },
      handleDetail(record){
        this.$refs.modal.detail(this.formTemplate,record.id);
      },
      handleDeleteOne(record){
        this.cgButtonLinkHandler(record,"beforeDelete","js")
        this.handleDelete(record.id)
      },
      handleDelete(id){
        deleteAction(this.url.optPre+this.code+"/"+id).then((res)=>{
          if(res.success){
            this.$message.success(res.message)
            this.loadData()
          }else{
            this.$message.warning(res.message)
          }
        })
      },

      getImgView(text){
        if(text && text.indexOf(",")>0){
          text = text.substring(0,text.indexOf(","))
        }
        return getFileAccessHttpUrl(text)
      },
      downloadRowFile(text){
        if(!text){
          this.$message.warning("未知的文件")
          return;
        }
        if(text.indexOf(",")>0){
          text = text.substring(0,text.indexOf(","))
        }
        let url = getFileAccessHttpUrl(text);
        window.open(url);//TODO 下载的方法
      },
      handleDelBatch(){
        if(this.table.selectedRowKeys.length<=0){
          this.$message.warning('请选择一条记录！');
          return false;
        }else{
          let ids = "";
          let that = this;
          that.table.selectedRowKeys.forEach(function(val) {
            ids+=val+",";
          });
          that.$confirm({
            title:"确认删除",
            content:"是否删除选中数据?",
            onOk: function(){
              that.handleDelete(ids)
              that.onClearSelected();
            }
          });
        }
      },

      handleImportXls(){
        this.$refs.importModal.show(this.getForeignKeyValueString())
      },
      handleExportXls(){
        let param = this.queryParam;
        param['exportSingleOnly']=1;
        param['selections'] = '';
        if(this.table.selectedRowKeys && this.table.selectedRowKeys.length>0){
          param['selections'] = this.table.selectedRowKeys.join(",")
        }
        console.log("导出参数",param)
        let paramsStr = JSON.stringify(filterObj(param));
        downFile(this.url.exportXls+this.code,{paramsStr:paramsStr}).then((data)=>{
          if (!data || data.size===0) {
            this.$message.warning("文件下载失败")
            return
          }
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(new Blob([data]), this.description+'.xls')
          }else{
            let url = window.URL.createObjectURL(new Blob([data]))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', this.description+'.xls')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link); //下载完成移除元素
            window.URL.revokeObjectURL(url); //释放掉blob对象
          }
        })
      },
      onClearSelected(){
        this.table.selectedRowKeys = []
        this.table.selectionRows = []
        if(this.table.type === 2){
          this.$emit('seleted',{})
        }
      },

      clearAll(){
        this.table.selectedRowKeys = []
        this.table.selectionRows = []
        this.table.dataSource = []
      },

      handleChangeInTableSelect(selectedRowKeys, selectionRows) {
        this.table.selectedRowKeys = selectedRowKeys
        this.table.selectionRows = selectionRows
        this.selectedRowKeys = selectedRowKeys
        if(this.table.type === 2){
          this.$emit('seleted',selectionRows[0])
        }

      },
      handleTableChange(pagination, filters, sorter){
        //TODO 筛选
        if (Object.keys(sorter).length>0){
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend"==sorter.order?"asc":"desc"
        }
        if(this.table.pagination){
          this.table.pagination = pagination;
        }
        this.loadData();
      },

      //将主表的数据 加载到查询条件里面去
      initDependQueryParam(){
        if(this.table.type == 3){
          if(!this.foreignKeys || this.foreignKeys.length==0){
            this.$message.error(`子表【${this.description}】外键配置未找到!`)
            return false;
          }

          if(!this.main){
            return false;
          }

          for(let item of this.foreignKeys){
            if(!this.main[item.key] || this.main[item.key].length==0){
              return false;
            }
            let metaQueryParam = {...this.queryParam}
            metaQueryParam[item.field] = this.main[item.key]
            this.$set(this.queryParamsMap, this.code, metaQueryParam)
          }
        }
        return true;
      },
      clickThenCheck(record) {
        return {
          on: {
            click: () => {
              if(this.table.type === 2){
                this.handleChangeInTableSelect(record.id.split(","), [record]);
              }
            }
          }
        };
      },

      handleFormSuccess(){
        this.loadData()
      },
      // 查询完 schema 后，生成高级查询的字段列表
      handleGetSchema(schema) {
        if (schema && schema.properties) {
          let setField = (array, field) => {
            let type = field.view || (field.type || 'string')
            type = (type === 'inputNumber' ? 'number' : type)
            let params = {
              type: type,
              value: field.key,
              text: field.title,
              // 额外字典参数
              dictCode: field.dictCode,
              dictTable: field.dictTable,
              dictText: field.dictText,
              options: field.enum || field.options,
              order: field.order,
            }
            // 处理popup
            if (type === 'popup') {
              params['popup'] = {
                code: field.popupCode || field.code,
                field: field.orgFields.split(',')[0],
                orgFields: field.orgFields.split(',')[0],
                destFields: field.destFields.split(',')[0],
              }
            }
            array.push(params)
          }
          let fieldList = []
          for (let key in schema.properties) {
            if (!schema.properties.hasOwnProperty(key)) {
              continue
            }
            let field = schema.properties[key]
            // tab = 子表 一对多
            if (field.view === 'tab' && field.relationType==0) {
              let subTable = {
                type: 'sub-table',
                value: field.key,
                text: field.describe,
                children: []
              }
              if(field.columns){
                for (let column of field.columns) {
                  setField(subTable.children, column)
                }
              }
              fieldList.push(subTable)
              // tab = 子表 一对一
            }  else if(field.view === 'tab' && field.relationType==1){
              let subTable = {
                type: 'sub-table',
                value: field.key,
                text: field.describe,
                children: []
              }
              Object.keys(field.properties).map(k=>{
                field.properties[k]['key'] = k;
                setField(subTable.children, field.properties[k]);
              })
              fieldList.push(subTable)
            } else {
              field.key = key
              setField(fieldList, field)
            }
          }
          // 冒泡排序
          for (let i = 0; i < fieldList.length; i++) {
            for (let j = i + 1; j < fieldList.length; j++) {
              let temp1 = fieldList[i]
              let temp2 = fieldList[j]
              if (temp1.order > temp2.order) {
                fieldList[i] = temp2
                fieldList[j] = temp1
              }
            }
          }
          this.superQuery.fieldList = fieldList
        }
      },
      getImportUrl(){
        return '/online/cgform/api/importXls/'+this.code
      },
      importOk(){
        this.loadData(1)
      },

      searchByquery(){
        this.loadData(1);
      },
      searchReset(){
        this.queryParam = {}
        this.loadData(1);
      },
      handleToggleSearch(){
        this.toggleSearchStatus = !this.toggleSearchStatus;
      },

      startProcess: function(record){
        var that = this;
        this.$confirm({
          title:"提示",
          content:"确认提交流程吗?",
          onOk: function(){
            var param = {
              flowCode:that.flowCodePre+that.currentTableName,
              id:record.id,
              formUrl:"modules/bpm/task/form/OnlineFormDetail",
              formUrlMobile:"online/OnlineDetailForm"
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
        var flowCode = this.flowCodePre+this.currentTableName;
        var dataId = record.id;
        this.$refs.processInstPicModal.preview(flowCode,dataId);
        this.$refs.processInstPicModal.title="流程图";
      },

      showLinkButton(item,record){
        let btn = new ButtonExpHandler(item.exp,record);
        return btn.show;
      },

      // 高级查询
      handleSuperQuery(params, matchType) {
        if (!params || params.length === 0) {
          this.superQuery.params = ''
        } else {
          this.superQuery.params = JSON.stringify(params)
        }
        this.superQuery.matchType = matchType
        this.loadData(1)
      },

      getForeignKeyValueString(){
        if(this.table.type === 3){
          let obj = {};
          if(this.main){
            for(let item of this.foreignKeys){
              obj[item.field] = this.main[item.key]
            }
          }
          return JSON.stringify(obj);
        }
        return '';

      },


      getFormatDate(text){
        if(!text){
          return ''
        }
        let a = text;
        if(a.length>10){
          a = a.substring(0,10);
        }
        return a;
      },


    }


  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
  @import '~@/assets/less/TableExpand.less';
</style>