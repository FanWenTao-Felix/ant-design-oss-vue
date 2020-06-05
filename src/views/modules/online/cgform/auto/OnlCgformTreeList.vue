<template>
  <a-card :bordered="false" style="height: 100%">
    <!-- 操作按钮区域 -->
    <div class="table-operator">
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

      <a-button
        v-if="buttonSwitch.batch_delete"
        @click="handleDelBatch"
        v-show="selectedRowKeys.length > 0"
        ghost
        type="primary"
        icon="delete">批量删除</a-button>
    </div>

    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        已选择&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="cgformTreeList"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :loading="loading"
        :scroll="tableScroll"
        @change="handleTableChange"
        v-bind="tableProps"
        @expand="handleExpand"
        :class="{'j-table-force-nowrap': enableScrollBar}"
        style="min-height: 300px"
        :expandedRowKeys="expandedRowKeys">

        <template slot="dateSlot" slot-scope="text">
          <span>{{ getDateNoTime(text) }}</span>
        </template>

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>

        <template slot="pcaSlot" slot-scope="text">
          <div>{{ getPcaText(text) }}</div>
        </template>

        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
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

          <template v-if="showOptButton('update',record)">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical"/>
          </template>

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item >
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>

              <a-menu-item >
                <a @click="handleAddChild(record)">添加下级</a>
              </a-menu-item>

              <a-menu-item v-if="showSubmitFlowButton(record)">
                <a @click="startProcess(record)">提交流程</a>
              </a-menu-item>

              <template v-if="showViewFlowButton(record)">
                  <a-menu-item @click="handlePreviewPic(record)">审批进度</a-menu-item>
              </template>

              <a-menu-item v-if="showOptButton('delete',record)">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteOne(record)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <!-- 自定义按钮 -->
              <template v-if="cgButtonLinkList && cgButtonLinkList.length>0" v-for="(btnItem,btnIndex) in cgButtonLinkList">
                <a-menu-item :key=" 'cgbtnLink'+btnIndex ">
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

      <onl-cgform-auto-modal @success="handleFormSuccess" ref="modal" :code="code"></onl-cgform-auto-modal>

      <j-import-modal ref="importModal" :url="getImportUrl()" @ok="importOk"></j-import-modal>

      <process-inst-pic-modal ref="processInstPicModal"></process-inst-pic-modal>

      <!-- 跳转Href的动态组件方式 -->
      <a-modal v-bind="hrefComponent.model" v-on="hrefComponent.on">
        <component :is="hrefComponent.is" v-bind="hrefComponent.params"/>
      </a-modal>

    </div>
  </a-card>
</template>

<script>

  import { mixinDevice } from '@/utils/mixin'
  import { HrefJump } from '@/mixins/OnlAutoListMixin'
  import { getAction,postAction,deleteAction,downFile,getFileAccessHttpUrl } from '@/api/manage'
  import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
  import { filterObj } from '@/utils/util';
  import OnlCgformAutoModal from './OnlCgformAutoModal'
  import JImportModal from '@/components/jeecg/JImportModal'
  import ProcessInstPicModal from "@/components/bpm/ProcessInstPicModal";
  import { onlUtil } from '@/mixins/OnlineCommonUtil'
  import lodash_object from 'lodash'

  export default {
    name: 'OnlCgformTreeList',
    mixins: [HrefJump, mixinDevice, onlUtil],
    components: {
      OnlCgformAutoModal,
      JImportModal,
      ProcessInstPicModal
    },
    data() {
      return {
        code: '87b55a515d3441b6b98e48e5b35474a6',
        lodash: lodash_object,
        description: '在线报表功能测试页面',
        currentTableName:"",
        pidField:"",
        hasChildrenField:"",
        textField:'',
        loading: false,
        // 表头
        columns: [],
        //数据集
        dataSource: [],
        // 选择器
        selectedRowKeys: [],
        selectionRows: [],
        // 分页参数
        pagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },

        url: {
          getColumns: '/online/cgform/api/getColumns/',
          getTreeData: '/online/cgform/api/getTreeData/',
          optPre:"/online/cgform/api/form/",
          exportXls:'/online/cgform/api/exportXls/',
          buttonAction:'/online/cgform/api/doButton',
          startProcess: "/process/extActProcess/startMutilProcess"
        },
        isorter:{
          column: 'create_time',
          order: 'desc',
        },
        dictOptions:{

        },

        queryParam:{

        },
        actionColumn:{
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          // fixed:"right",
          align:"center",
          width:150
        },
        formTemplate:"99",

        /*自定义按钮-link*/
        cgButtonLinkList:[],
        /*自定义按钮-button*/
        cgButtonList:[],
        /*JS增强*/
        EnhanceJS:'',
        /*操作按钮权限*/
        buttonSwitch:{
          add:true,
          update:true,
          delete:true,
          batch_delete:true,
          import:true,
          export:true
        },
        expandedRowKeys:[],
        hasBpmStatus:false,
        flowCodePre:"onl_",
        table: {
          scroll: { x: false }
        },
        scrollFlag: 0,
        parentFormData:'',
        loadParent:false
      }
    },
    created() {
      this.initAutoListConfig().then(()=>{
        this.loadData(1)
      }).catch(msg=>{
        console.error(msg)
      })
    },
    mounted(){
      //this.cgButtonJsHandler('mounted')
    },
    watch: {
      '$route'() {
        // 刷新参数放到这里去触发，就可以刷新相同界面了
        this.initAutoListConfig().then(()=>{
          this.loadData(1)
        }).catch(msg=>{
          console.error(msg)
        })
      }
    },
    computed: {
      tableProps() {
        let _this = this
        return {
          // 列表项是否可选择
          // https://vue.ant.design/components/table-cn/#rowSelection
          rowSelection: {
            selectedRowKeys: _this.selectedRowKeys,
            onChange: (selectedRowKeys) => _this.selectedRowKeys = selectedRowKeys
          }
        }
      },
      enableScrollBar() {
        return this.scrollFlag === 1 || this.isMobile()
      },
      tableScroll() {
        // 移动端模式下无论如何都开启横向滚动条
        if (this.enableScrollBar) {
          return undefined
        } else {
          return this.table.scroll
        }
      },
    },
    methods: {
      resetData(){
        this.description=''
        this.currentTableName=''
        this.pidField=''
        this.hasChildrenField=''
        this.textField=''
        this.columns = []
        this.dataSource = []
        this.selectedRowKeys=[]
        this.selectionRows=[]
      },
      initAutoListConfig() {
        return new Promise((resolve, reject) => {
          if (!this.$route.params.code) {
            reject("列表加载需要参数CODE为空!")
          } else {
            this.resetData()
            this.loading = true
            this.code = this.$route.params.code
            getAction(`${this.url.getColumns}${this.code}`)
              .then(res => {
                console.log("--onlineList-加载动态列>>", res);
                if(res.success){
                  this.configInfohandler(res)
                  resolve();
                }else{
                  reject("onlineList-加载表配置信息失败")
                }
                this.loading = false
              })
              .catch(err => {
                reject(err)
              })
          }
        })
      },
      configInfohandler(res){
        this.dictOptions = res.result.dictOptions
        this.formTemplate = res.result.formTemplate
        this.description = res.result.description
        this.currentTableName = res.result.currentTableName
        this.pidField = res.result.pidField
        this.hasChildrenField = res.result.hasChildrenField
        this.textField = res.result.textField
        //自定义按钮
        this.initCgButtonList(res.result.cgButtonList)
        //JS增强
        this.initCgEnhanceJs(res.result.enhanceJs)
        //操作按钮权限
        this.initButtonSwitch(res.result.hideColumns)
        // href 跳转
        const fieldHrefSlotKeysMap = {}
        res.result.fieldHrefSlots.forEach(item => fieldHrefSlotKeysMap[item.slotName] = item)
        let currColumns = res.result.columns
        let textFieldIndex = -1
        let hasBpmStatus = false
        for(let a=0;a<currColumns.length;a++){
          Object.keys(currColumns[a]).map(pro=>{
            // 删掉空值的字段（不删除 空字符串('') 或 数字 0 ）
            if (currColumns[a][pro] == null) {
              delete currColumns[a][pro];
            }
          })
          currColumns[a].align = 'left'
          //找到显示列
          if(this.textField==currColumns[a].dataIndex){
            textFieldIndex = a
          }
          // 处理列中的 href 跳转和 dict 字典，使两者可以兼容存在
          this.handleColumnHrefAndDict(currColumns[a], fieldHrefSlotKeysMap)

          //判断是否有bpm_status
          if(currColumns[a].dataIndex.toLowerCase()=='bpm_status'){
            hasBpmStatus = true;
          }

        }
        this.hasBpmStatus = hasBpmStatus;
        this.scrollFlag = res.result.scrollFlag

        if(textFieldIndex!=-1){
          let textFieldColumn = currColumns.splice(textFieldIndex,1)
          currColumns.unshift(textFieldColumn[0])
        }
        currColumns.push(this.actionColumn);
        this.columns = [...currColumns]
      },
      //加载根节点
      loadData(arg){
        if(arg==1){
          this.pagination.current=1
        }
        this.loading = true
        this.expandedRowKeys=[]
        let params = this.getQueryParams();//查询条件
        params[this.pidField]='0'
        console.log("--onlineList-查询条件-->",params)
        getAction(`${this.url.getTreeData}${this.code}`,params).then((res)=>{
          console.log("--onlineList-列表数据",res)
          if(res.success){
            let result = res.result;
            if(Number(result.total)>0){
              this.pagination.total = Number(result.total)
              let dataSource = res.result.records.map(item => {
                // 判断是否标记了带有子级
                if (item[this.hasChildrenField] === true || item[this.hasChildrenField]=='1') {
                  let loadChild = { id: `${item.id}_loadChild`, name: 'loading...', isLoading: true }
                  item.children = [loadChild]
                }
                return item
              })
              this.dataSource = dataSource
            }else{
              this.pagination.total=0;
              this.dataSource=[]
            }
          }else{
            this.$message.warning(res.message)
          }
          this.loading = false
        })
      },
      getFormDataById(id,arr){
        if(arr && arr.length>0){
          for(let i=0;i<arr.length;i++){
            if(arr[i].id==id){
              this.parentFormData = arr[i]
            }else{
              this.getFormDataById(id,arr[i].children)
            }
          }
        }
      },
      expandTreeNode(nodeId){
        return new Promise((resolve,reject)=>{
          this.getFormDataById(nodeId,this.dataSource)
          let row = this.parentFormData
          this.expandedRowKeys.push(nodeId)
          let params = this.getQueryParams();//查询条件
          params[this.pidField] = nodeId
          getAction(`${this.url.getTreeData}${this.code}`,params).then((res)=>{
           // console.log('expandTreeNode',res)
            if(res.success){
              let sbilings = []
              this.getChildrenByPid(nodeId, this.dataSource, sbilings)
              //console.log('sbilings', sbilings)
              if(Number(res.result.total)>0){
                let dataSource = res.result.records.map(item => {
                  if(sbilings.length==0){
                    // 判断是否标记了带有子级
                    if (item[this.hasChildrenField] === true || item[this.hasChildrenField]=='1') {
                      let loadChild = { id: `${item.id}_loadChild`, name: 'loading...', isLoading: true }
                      item.children = [loadChild]
                    }
                  }else{
                    let temparr = sbilings.filter(sb=>{
                      return sb.id == item.id
                    });
                    if(temparr && temparr.length>0){
                      item = temparr[0]
                    }
                  }
                  return item
                });
                row.children = dataSource
                this.dataSource = [...this.dataSource]
                resolve()
              }else{
                row.children=''
                row.hasChildrenField='0'
                resolve()
              }
            }else{
              reject()
              this.$message.warning(res.message)
            }
          })
        })
      },
      //加载叶子节点
      handleExpand(expanded, record) {
        // 判断是否是展开状态
        if (expanded) {
          this.expandedRowKeys.push(record.id)
          if (record.children.length>0 && record.children[0].isLoading === true) {
            let params = this.getQueryParams();//查询条件
            params[this.pidField] = record.id
            params[this.hasChildrenField] = record[this.hasChildrenField]
            getAction(`${this.url.getTreeData}${this.code}`,params).then((res)=>{
              if(res.success){
                console.log('handleExpand',res.result)
                if(Number(res.result.total)>0){
                  let dataSource = res.result.records.map(item => {
                    // 判断是否标记了带有子级
                    if (item[this.hasChildrenField] === true || item[this.hasChildrenField]=='1') {
                      let loadChild = { id: `${item.id}_loadChild`, name: 'loading...', isLoading: true }
                      item.children = [loadChild]
                    }
                    return item
                  })
                  record.children = dataSource
                }else{
                  record.children=''
                  record.hasChildrenField='0'
                }
              }else{
                this.$message.warning(res.message)
              }
            })
          }
        }else{
          let keyIndex = this.expandedRowKeys.indexOf(record.id)
          if(keyIndex>=0){
            this.expandedRowKeys.splice(keyIndex, 1);
          }
        }
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam,this.isorter);
        param.pageNo = this.pagination.current;
        param.pageSize = this.pagination.pageSize;
        return filterObj(param);
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
      onClearSelected(){
        this.selectedRowKeys = []
        this.selectionRows = []
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
      /*-------数据格式化-begin----------*/
      getDateNoTime(text){
        if(!text){
          return ''
        }
        let a = text;
        if(a.length>10){
          a = a.substring(0,10);
        }
        return a;
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
        window.open(url);
      },
      /*-------数据格式化-end----------*/

      /*-------功能按钮触发事件-begin----------*/
      handleEdit(record){
        this.loadParent = false
        this.cgButtonLinkHandler(record,"beforeEdit","js")
        this.$refs.modal.edit(this.formTemplate,record.id);
      },
      handleDetail(record){
        this.$refs.modal.detail(this.formTemplate,record.id);
      },
      handleDeleteOne(record){
        this.loadParent = true
        this.cgButtonLinkHandler(record,"beforeDelete","js")
        this.handleDelete(record.id,record[this.pidField])
      },
      handleDelete(id,pid){
        deleteAction(this.url.optPre+this.code+"/"+id).then((res)=>{
          if(res.success){
            this.$message.success(res.message)
            if(!pid || pid.length==0){
              this.loadData()
            }else{
              this.deleteFromDataSource(id, this.dataSource);
              this.dataSource = [...this.dataSource]
            }
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      deleteFromDataSource(id, arr, callback){
       // console.log('deleteFromDataSource',id)
        let index = -1;
        for(let i=0;i<arr.length;i++){
          if(arr[i].id===id){
            index = i;
            break;
          }
          if(arr[i].children && arr[i].children.length>0){
            this.deleteFromDataSource(id, arr[i].children, function(flag) {
              if(flag===true){
                //console.log('arr',arr)
                arr[i].children = ''
                arr[i].isLeaf = true
              }
            })
          }
        }
       // console.log('deleteFromDataSource index',index)
        if(index!=-1){
          arr.splice(index, 1)
          callback(arr.length==0);
        }
      },
      handleAddChild(record){
        this.cgButtonJsHandler('beforeAdd')
        this.loadParent = true
        let obj = {}
        obj[this.pidField] = record['id']
        this.$refs.modal.add(this.formTemplate,obj);
      },
      handleAdd(){
        this.loadParent = false
        this.cgButtonJsHandler('beforeAdd')
        this.$refs.modal.add(this.formTemplate);
      },

      async addOk(pid,arr){
        if(!pid){
          this.loadData()
        }else{
          //console.log('pid',pid)
          //console.log('arr',arr)
          if(arr && arr.length>0){
            for(let i=0;i<arr.length;i++){
              if(this.expandedRowKeys.indexOf(arr[i])>=0 && pid != arr[i]){
                continue;
              }
              await this.expandTreeNode(arr[i])
            }
          }else if(this.loadParent===true){
            //添加子节点成功
            await this.expandTreeNode(pid)
          }
        }
      },
      getChildrenByPid(id, meta, arr){
        //console.log('getChildrenByPid',id)
        //console.log('getChildrenByPid mata', meta)
        for(let item of meta){
          if(item.id == id){
            if(item.children && item.children.length>0){
              item.children.map(o=>{
                if(!o.isLoading){
                  arr.push(o)
                }
              })
            }
            //console.log('arr',arr)
            break;
          }
          if(item.children && item.children.length>0){
            //console.log(111)
            this.getChildrenByPid(id, item.children, arr)
          }
        }
      },
      editOk(formData,arr){
        if(arr && arr.length>0){
          for(let i=0;i<arr.length;i++){
            if(arr[i].id==formData.id){
              Object.assign(arr[i],formData)
              break
            }else{
              this.editOk(formData,arr[i].children)
            }
          }
        }
      },
      handleFormSuccess(formData,expandKeys){
        //console.log("formData",formData)
        //console.log("expandKeys",expandKeys)
        if(!formData.id){
          this.addOk(formData[this.pidField],expandKeys)
        }else{
          this.editOk(formData,this.dataSource)
          this.dataSource=[...this.dataSource]
        }
      },
      handleImportXls(){
        this.$refs.importModal.show()
      },
      importOk(){
        this.loadData(1)
      },
      getImportUrl(){
        return '/online/cgform/api/importXls/'+this.code
      },
      handleExportXls(){
        let param = this.queryParam;
        if(this.selectedRowKeys && this.selectedRowKeys.length>0){
          param['selections'] = this.selectedRowKeys.join(",")
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
      handleDelBatch(){
        if(this.selectedRowKeys.length<=0){
          this.$message.warning('请选择一条记录！');
          return false;
        }else{
          let ids = "";
          let that = this;
          that.selectedRowKeys.forEach(function(val) {
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
      /*-------功能按钮触发事件-begin----------*/

      /*-------JS增强-begin----------*/
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
      cgButtonActionHandler(buttonCode){
        //处理自定义button的 需要配置该button自定义sql
        if(!this.selectedRowKeys || this.selectedRowKeys.length==0){
          this.$message.warning("请先选中一条记录")
          return false
        }
        if(this.selectedRowKeys.length>1){
          this.$message.warning("请只选中一条记录")
          return false
        }
        let params = {
          formId:this.code,
          buttonCode:buttonCode,
          dataId:this.selectedRowKeys[0]
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
      /*-------JS增强-end----------*/
      showOptButton(opt,record){
        //只有当按钮属性为false,或是按钮属性为true但是流程已提交时才隐藏
        if(!this.buttonSwitch[opt]){
          return false
        }else{
          if(this.hasBpmStatus){
            if(record.bpm_status !=null && record.bpm_status !='' && record.bpm_status != '1'){
              return false
            }
          }
        }
        return true
      },
      showSubmitFlowButton(record){
        if(this.hasBpmStatus){
          if(record.bpm_status ==null || record.bpm_status =='' || record.bpm_status == '1'){
            return true
          }
        }
        return false
      },
      showViewFlowButton(record){
        if(this.hasBpmStatus){
          if(record.bpm_status !=null && record.bpm_status !='' && record.bpm_status != '1'){
            return true
          }
        }
        return false
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
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
  @import '~@/assets/less/TableExpand.less';
</style>
<style scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }
  .ant-table-tbody .ant-table-row td{
    padding-top:15px;
    padding-bottom:15px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .anty-img-wrap{height:25px;position: relative;}
  .anty-img-wrap > img{max-height:100%;}
  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>