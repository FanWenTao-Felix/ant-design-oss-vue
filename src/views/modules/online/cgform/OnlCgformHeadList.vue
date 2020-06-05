<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="表名">
              <a-input placeholder="请输入表名" v-model="queryParam.tableName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="表类型">
              <j-multi-select-tag dictCode="cgform_table_type" v-model="queryParam.tableType_MultiString" placeholder="请选择"/>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="表描述">
              <a-input placeholder="请输入表描述" v-model="queryParam.tableTxt"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <j-super-query :fieldList="superQueryFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery" style="margin-left: 8px">
                <!-- 直接在内部写一个按钮即可，点击事件自动添加
                <a-button type="primary" ghost icon="clock-circle" style="margin-left: 8px">高级查询</a-button> -->
              </j-super-query>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button @click="doCgformButton" type="primary" icon="highlight">自定义按钮</a-button>
      <a-button @click="doEnhanceJs" type="primary" icon="strikethrough">JS增强</a-button>
      <a-button @click="doEnhanceSql" type="primary" icon="filter" v-has="'online:sql'">SQL增强</a-button>
      <a-button @click="doEnhanceJava" type="primary" icon="tool">JAVA增强</a-button>
      <a-button @click="importOnlineForm" type="primary" icon="database">导入数据库表</a-button>
      <a-button @click="goGenerateCode" v-has="'online:goGenerateCode'" type="primary" icon="database">代码生成</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDeleteCust">
            <a-icon type="delete"/>
            删除
          </a-menu-item>
        </a-menu>
        <a-button> 批量操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>
        项
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

        <template slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.isDbSynch!='Y'">
                <a @click="openSyncModal(record.id)">同步数据库</a>
              </a-menu-item>

              <template v-if="record.isDbSynch=='Y' && record.tableType !== 3">
                <a-menu-item>
                  <a @click="goPageOnline(record)">功能测试</a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleOnlineUrlShow(record)">配置地址</a>
                </a-menu-item>
              </template>

              <a-menu-item>
                <a @click="copyConfig(record.id)">生成视图</a>
              </a-menu-item>

              <a-menu-item v-if="record.hascopy==1">
                <a @click="showMyCopyInfo(record.id)">视图管理</a>
              </a-menu-item>

              <a-menu-item>
                <a @click="handleRemoveRecord(record.id)">移除</a>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>

            </a-menu>
          </a-dropdown>
        </template>

        <template slot="dbsync" slot-scope="text">
          <span v-if="text==='Y'" style="color:limegreen">已同步</span>
          <span v-if="text==='N'" style="color:red">未同步</span>
        </template>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <onl-cgform-head-modal ref="modalForm" @ok="modalFormOk"></onl-cgform-head-modal>

    <!-- 同步数据库提示框 -->
    <a-modal
      :width="500"
      :height="300"
      title="同步数据库"
      :visible="syncModalVisible"
      @cancel="handleCancleDbSync"
      style="top:5%;height: 95%;">
      <template slot="footer">
        <a-button @click="handleCancleDbSync">关闭</a-button>
        <a-button type="primary" :loading="syncLoading" @click="handleDbSync">
          确定
        </a-button>
      </template>
      <a-radio-group v-model="synMethod">
        <a-radio style="display: block;width: 30px;height: 30px" value="normal">普通同步(保留表数据)</a-radio>
        <a-radio style="display: block;width: 30px;height: 30px" value="force">强制同步(删除表,重新生成)</a-radio>
      </a-radio-group>
    </a-modal>

    <!-- 提示online报表链接 -->
    <a-modal
      :title="onlineUrlTitle"
      :visible="onlineUrlVisible"
      @cancel="handleOnlineUrlClose">
      <template slot="footer">
        <a-button @click="handleOnlineUrlClose">关闭</a-button>
        <a-button type="primary" class="copy-this-text" :data-clipboard-text="onlineUrl" @click="onCopyUrl">复制</a-button>
      </template>
      <p>{{ onlineUrl }}</p>
    </a-modal>

    <enhance-js ref="ehjs"></enhance-js>
    <enhance-sql ref="ehsql"></enhance-sql>
    <enhance-java ref="ehjava"></enhance-java>
    <trans-db2-online ref="transd2o" @ok="transOk"></trans-db2-online>
    <code-generator ref="cg"></code-generator>

    <onl-cgform-button-list ref="btnList"></onl-cgform-button-list>

    <a-modal v-model="confirmVisible" :closable="false" :footer="null" :width="466">
      <div class="ant-modal-confirm-body">
        <a-icon type="question-circle" style="color: #faad14"/>
        <span style="color: rgba(0, 0, 0, 0.85);font-weight: 500;font-size: 18px;">提示</span>
        <div class="ant-modal-confirm-content">
          移除只会删除表单配置、删除会删除对应的数据库表。<br>请确认？
        </div>
      </div>
      <div style="height: 50px;width: 100%">
        <div style="float: right;margin-top: 24px;">
          <a-button @click="confirmVisible=false">取消</a-button>
          <a-button @click="doBatchDelete(0)" type="primary" style="margin-bottom: 0;margin-left: 8px;">移除</a-button>
          <a-button @click="doBatchDelete(1)" type="primary" style="margin-bottom: 0;margin-left: 8px;">删除</a-button>
        </div>
      </div>

    </a-modal>
  </a-card>
</template>

<script>
  import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'
  import OnlCgformHeadModal from './modules/OnlCgformHeadModal'
  import { deleteAction, postAction } from '@/api/manage'
  import JMultiSelectTag from '@comp/dict/JMultiSelectTag'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import Clipboard from 'clipboard'
  import JSuperQuery from '@/components/jeecg/JSuperQuery'
  import EnhanceJs from './modules/EnhanceJs'
  import EnhanceSql from './modules/EnhanceSql'
  import EnhanceJava from './modules/EnhanceJava'
  import TransDb2Online from './modules/TransDb2Online'
  import CodeGenerator from './modules/CodeGenerator'
  import OnlCgformButtonList from './button/OnlCgformButtonList'
  import { filterObj } from '@/utils/util';

  export default {
    name: 'OnlCgformHeadList',
    mixins: [JeecgListMixin],
    components: {
      OnlCgformHeadModal,
      EnhanceJs,
      EnhanceSql,
      EnhanceJava,
      TransDb2Online,
      CodeGenerator,
      OnlCgformButtonList,
      JMultiSelectTag,
      JSuperQuery
    },
    data() {
      return {
        description: 'Online表单开发管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '表类型',
            align: 'center',
            sorter: true,
            dataIndex: 'tableType',
            customRender: (text, record) => {
              let tbTypeText = filterDictText(this.tableTypeDictOptions, `${text}`)
              if(record.isTree === 'Y'){
                tbTypeText+='(树)'
              }
              if (record.themeTemplate === 'innerTable') {
                tbTypeText += '(内嵌)'
              }else if (record.themeTemplate === 'erp') {
                tbTypeText += '(ERP)'
              }
              return tbTypeText;
            }
          },
          {
            title: '表名',
            sorter: true,
            align: 'center',
            dataIndex: 'tableName'
          },
          {
            title: '表描述',
            align: 'center',
            dataIndex: 'tableTxt'
          },
          {
            title: '版本',
            align: 'center',
            dataIndex: 'tableVersion'
          },
          {
            title: '同步状态',
            align: 'center',
            sorter: true,
            dataIndex: 'isDbSynch',
            scopedSlots: { customRender: 'dbsync' }
          },
          {
            title: '创建时间',
            align: 'center',
            sorter: true,
            dataIndex: 'createTime'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
        superQueryFlag:false,
        superQueryParams:"",
        superQueryFieldList: [
          { type: 'input', value: 'tableName', text: '表名'},
          { type: 'select', value: 'tableType', text: '表类型', dictCode: 'cgform_table_type'  },
          { type: 'select', value: 'formCategory', text: '表单业务分类', dictCode: 'ol_form_biz_type' },
          { type: 'select', value: 'isDbSynch', text: '同步状态', options: [
              {label: "已同步",value: "Y"},
              {label: "未同步",value: "N"}
            ]},
          { type: 'date', value: 'createTime', text: '创建时间' },
          { type: 'input',  value: 'tableTxt',  text: '表描述'},
        ],
        url: {
          list: '/online/cgform/head/list',
          delete: '/online/cgform/head/delete',
          deleteBatch: '/online/cgform/head/deleteBatch',
          doDbSynch: '/online/cgform/api/doDbSynch/',
          removeRecord: '/online/cgform/head/removeRecord',
          copyOnline: '/online/cgform/head/copyOnline'
        },
        tableTypeDictOptions: [],
        sexDictOptions: [],
        syncModalVisible: false,
        syncFormId: '',
        synMethod: 'normal',
        syncLoading: false,
        onlineUrlTitle: '',
        onlineUrlVisible: false,
        onlineUrl: '',
        selectedRowKeys: [],
        selectedRows: [],
        confirmVisible:false
      }
    },
    created() {
      //初始化字典 - 表类型
      initDictOptions('cgform_table_type').then((res) => {
        if (res.success) {
          this.tableTypeDictOptions = res.result
        }
      })
    },
    methods: {
      doDbSynch(id) {
        postAction(this.url.doDbSynch + id, { synMethod: '1' }).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.loadData()
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      getQueryParams() {
        //获取高级查询器条件
        let sqp = {}
        if (this.superQueryParams) {
          sqp['superQueryParams'] = encodeURI(this.superQueryParams)
          sqp['superQueryMatchType'] = this.superQueryMatchType
        }

        //获取查询条件
        var param = Object.assign(sqp, this.queryParam, this.isorter ,this.filters);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        param.copyType = 0;
        return filterObj(param);
      },
      handleCancleDbSync() {
        this.syncModalVisible = false
      },
      handleDbSync() {
        this.syncLoading = true
        postAction(this.url.doDbSynch + this.syncFormId + '/' + this.synMethod).then((res) => {
          this.syncModalVisible = false
          this.syncLoading = false
          if (res.success) {
            this.$message.success(res.message)
            this.loadData()
          } else {
            this.$message.warning(res.message)
          }
        })
        setTimeout(()=>{
          if(this.syncLoading){
            this.syncModalVisible = false
            this.syncLoading = false
            this.$message.success("网络延迟,已自动刷新!")
            this.loadData()
          }
        },10000)
      },
      openSyncModal(id) {
        this.syncModalVisible = true
        this.syncLoading = false
        this.syncFormId = id
      },
      goPageOnline(rd) {
        if(rd.themeTemplate === 'erp'){
          this.$router.push({ path: '/online/cgformErpList/' + rd.id })
        } else if (rd.themeTemplate === 'innerTable') {
          this.$router.push({ path: '/online/cgformInnerTableList/' + rd.id })
        }else{
          if(rd.isTree=='Y'){
            this.$router.push({ path: '/online/cgformTreeList/' + rd.id })
          }else{
            this.$router.push({ path: '/online/cgformList/' + rd.id })
          }
        }
      },
      handleOnlineUrlClose() {
        this.onlineUrlTitle = ''
        this.onlineUrlVisible = false
      },
      handleOnlineUrlShow(record) {
        if(record.themeTemplate === 'erp'){
          this.onlineUrl = `/online/cgformErpList/${record.id}`
        } else if (record.themeTemplate === 'innerTable') {
          this.onlineUrl = `/online/cgformInnerTableList/${record.id}`
        } else {
          if(record.isTree=='Y'){
            this.onlineUrl = `/online/cgformTreeList/${record.id}`
          }else{
            this.onlineUrl = `/online/cgformList/${record.id}`
          }
        }
        this.onlineUrlVisible = true
        this.onlineUrlTitle = '菜单链接[' + record.tableTxt + ']'
      },
      handleRemoveRecord(id) {
        let that = this
        this.$confirm({
          title: '确认要移除此记录?',
          onOk() {
            deleteAction(that.url.removeRecord, { id: id }).then((res) => {
              if (res.success) {
                that.$message.success('移除成功')
                that.loadData()
              } else {
                that.$message.warning(res.message)
              }
            })
          },
          onCancel() {
          }
        })
      },
      doEnhanceJs() {
        if (!this.selectedRowKeys || this.selectedRowKeys.length != 1) {
          this.$message.warning('请先选中一条记录')
          return
        }
        this.$refs.ehjs.show(this.selectedRowKeys[0])
      },
      doEnhanceSql() {
        if (!this.selectedRowKeys || this.selectedRowKeys.length != 1) {
          this.$message.warning('请先选中一条记录')
          return
        }
        this.$refs.ehsql.show(this.selectedRowKeys[0])
      },
      doEnhanceJava() {
        if (!this.selectedRowKeys || this.selectedRowKeys.length != 1) {
          this.$message.warning('请先选中一条记录')
          return
        }
        this.$refs.ehjava.show(this.selectedRowKeys[0])
      },
      doCgformButton() {
        if (!this.selectedRowKeys || this.selectedRowKeys.length != 1) {
          this.$message.warning('请先选中一条记录')
          return
        }
        this.$refs.btnList.show(this.selectedRowKeys[0])

        //this.$router.push({ path: '/online/cgformButton/' + this.selectedRowKeys[0] })
      },
      importOnlineForm() {
        this.$refs.transd2o.show()
      },
      transOk() {
        this.loadData()
      },
      goGenerateCode() {
        if (!this.selectedRowKeys || this.selectedRowKeys.length != 1) {
          this.$message.warning('请先选中一条记录')
          return
        }
        let row = this.selectedRows[0]
        if (!row.isDbSynch || row.isDbSynch == 'N') {
          this.$message.warning('请先同步数据库!')
          return
        }
        if (row.tableType == 3) {
          this.$message.warning('请选中该表对应的主表生成代码')
          return
        }
        this.$refs.cg.show(this.selectedRowKeys[0])
      },
      onSelectChange(keys, rows) {
        this.selectedRowKeys = keys
        this.selectedRows = rows
      },
      onCopyUrl(){
        var clipboard = new Clipboard('.copy-this-text')
        clipboard.on('success', () => {
          clipboard.destroy()
          this.$message.success('复制成功')
          this.handleOnlineUrlClose()
        })
        clipboard.on('error', () => {
          this.$message.error('该浏览器不支持自动复制')
          clipboard.destroy()
        })
      },
      showMyCopyInfo(id){
        this.$router.push({ path: '/online/copyform/' + id })
      },
      copyConfig(id){
        postAction(`${this.url.copyOnline}?code=${id}`).then(res=>{
          if(res.success){
            this.$message.success("复制成功")
            this.loadData()
          }else{
            this.$message.error("复制失败>>"+res.message)
          }
        })
      },
      batchDeleteCust(){
        if(!this.url.deleteBatch){
          this.$message.error("请设置url.deleteBatch属性!")
          return
        }
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！');
          return;
        }
        this.confirmVisible = true;

      },
      doBatchDelete(flag){
        var ids = "";
        for (var a = 0; a < this.selectedRowKeys.length; a++) {
          ids += this.selectedRowKeys[a] + ",";
        }
        var that = this;
        this.loading = true;
        deleteAction(that.url.deleteBatch, {ids: ids,flag: flag}).then((res) => {
          if (res.success) {
            this.$message.success(res.message);
            this.loadData();
            this.onClearSelected();
          } else {
            this.$message.warning(res.message);
          }
        }).finally(() => {
          this.loading = false;
          this.confirmVisible=false
        });
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
<style lang="less" scoped>
  /** 横向滚动设置配合样式 */
  .ant-table td,th { white-space: nowrap; }
  .anty-row-operator button {
    margin: 0 5px
  }

  .ant-btn-danger {
    background-color: #ffffff
  }

  .valid-error-cust{
    .ant-select-selection{
      border:2px solid #f5222d;
    }
  }
</style>