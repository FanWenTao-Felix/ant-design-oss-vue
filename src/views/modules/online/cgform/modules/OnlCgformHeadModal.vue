<template>
  <j-modal
    :title="title"
    width="1200px"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    fullscreen
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form" layout="inline" :class="{'online-config-cust':true }">
        <a-list>
          <!-- 表名、表描述、表类型 -->
          <a-list-item>
            <a-row style="width: 100%;">
              <a-col :span="24">
                <a-row :gutter="gutter" style="width: 100%;">
                  <a-col :span="24/3">
                    <a-form-item
                      style="width: 100%"
                      :labelCol="{span:6}"
                      :wrapperCol="{span:18}"
                      label="表名">
                      <a-input :readOnly="editPageFlag" placeholder="请输入表名" v-decorator="['tableName', validatorRules.tableName ]"/>
                    </a-form-item>
                  </a-col>
                  <a-col :span="24/3">
                    <a-form-item
                      style="width: 100%"
                      :labelCol="threeCol.label"
                      :wrapperCol="threeCol.wrapper"
                      label="表描述">
                      <a-input placeholder="请输入表描述" v-decorator="['tableTxt', validatorRules.tableTxt ]"/>
                    </a-form-item>
                  </a-col>
                  <a-col :span="24/3">
                    <a-form-item
                      style="width: 100%"
                      :labelCol="threeCol.label"
                      :wrapperCol="threeCol.wrapper"
                      label="表类型">
                      <a-select @change="handleChangeInTableType" v-decorator="[ 'tableType', {initialValue: 1}]">
                        <a-select-option :value="1">单表</a-select-option>
                        <a-select-option :value="2">主表</a-select-option>
                        <a-select-option :value="3">附表</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <!-- 映射类型、附表排序序号 -->
                <a-row :gutter="gutter" style="width: 100%;" v-if="showRelationType">
                  <a-col :span="4" :push="17">
                    <a-form-item
                      style="width: 100%"
                      :wrapperCol="{span:24}"
                    >
                      <a-radio-group v-decorator="[ 'relationType', {initialValue:0}]">
                        <a-radio :value="0">一对多</a-radio>
                        <a-radio :value="1">一对一</a-radio>
                      </a-radio-group>
                    </a-form-item>
                  </a-col>
                  <a-col :span="3" :push="17">
                    <a-form-item
                      style="width: 100%"
                      :labelCol="{span:7}"
                      :wrapperCol="{span:24-7}"
                      label="序号">
                      <a-input-number style="width: 100%;" placeholder="请输入序号" v-decorator="[ 'tabOrderNum', validatorRules.tabOrderNum]"/>
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- 表单分类、主键策略、序号名称 -->
          <a-list-item>
            <a-row :gutter="gutter" style="width: 100%;">
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="表单分类">
                 <!-- <a-select v-decorator="[ 'formCategory', {initialValue: 'bdfl_include'}]">
                    <a-select-option value="bdfl_include">导入表单</a-select-option>
                    <a-select-option value="bdfl_ptbd">普通表单</a-select-option>
                    <a-select-option value="bdfl_fzbd">复杂表单</a-select-option>
                    <a-select-option value="bdfl_vipbd">VIP表单</a-select-option>
                  </a-select>-->
                  <j-dict-select-tag dict-code="ol_form_biz_type"  v-decorator="[ 'formCategory', {initialValue: 'temp'}]" :trigger-change="true" placeholder="请选择"></j-dict-select-tag>
                </a-form-item>
              </a-col>
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="主键策略">
                  <a-select v-decorator="[ 'idType', {initialValue: 'UUID'}]" @change="handleChangeInIdType">
                    <a-select-option value="UUID">ID_WORKER(分布式自增)</a-select-option>
                    <!--<a-select-option value="NATIVE">NATIVE(自增长方式)</a-select-option>
                    <a-select-option value="SEQUENCE">SEQUENCE(序列方式)</a-select-option>-->
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="查询模式">
                  <a-select v-decorator="[ 'queryMode', {initialValue: 'single'}]">
                    <a-select-option value="single">单表查询</a-select-option>
                    <a-select-option value="group">组合查询</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col :span="24/3" v-if="showIdSequence">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="序号名称">
                  <a-input placeholder="请输入序号名称" v-decorator="['idSequence', validatorRules.idSequence]"/>
                </a-form-item>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- PC表单风格、移动表单风格、查询模式 -->
          <a-list-item>
            <a-row :gutter="gutter" style="width: 100%;">

              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="主题模板">
                  <a-select placeholder="请选择主题模板" v-decorator="[ 'themeTemplate',{initialValue:'normal'}]">
                    <a-select-option value="normal">默认主题</a-select-option>
                    <a-select-option value="erp">ERP主题(一对多)</a-select-option>
                    <a-select-option value="innerTable">内嵌子表主题(一对多)</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>


              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="表单风格">
                  <a-select placeholder="请选择PC表单风格" v-decorator="[ 'formTemplate',{initialValue:'1'}]">
                    <a-select-option value="1">一列</a-select-option>
                    <a-select-option value="2">两列</a-select-option>
                    <a-select-option value="3">三列</a-select-option>
                    <a-select-option value="4">四列</a-select-option>
                   <!-- <a-select-option value="99">自适应</a-select-option>-->
                  </a-select>
                </a-form-item>
              </a-col>
              <!-- 暂时先隐藏 -->
              <a-col :span="24/3" v-if="false">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="移动表单风格">
                  <a-select placeholder="请选择移动表单风格" v-decorator="[ 'formTemplateMobile']">
                    <a-select-option value="antdesign">AntDesign模板</a-select-option>
                    <a-select-option value="bootstrap">Bootstrap模板</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>


              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="滚动条">
                  <a-select v-decorator="[ 'scroll', {initialValue: 1}]">
                    <a-select-option :value="1">有</a-select-option>
                    <a-select-option :value="0">无</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>

            </a-row>
          </a-list-item>
          <!-- 显示复选框、是否分页、是否树 -->
          <a-list-item>
            <a-row :gutter="gutter" style="width: 100%;">
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="显示复选框">
                  <a-select v-decorator="[ 'isCheckbox', {initialValue: 'Y'}]">
                    <a-select-option value="Y">是</a-select-option>
                    <a-select-option value="N">否</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="是否分页">
                  <a-select v-decorator="[ 'isPage', {initialValue: 'Y'}]">
                    <a-select-option value="Y">是</a-select-option>
                    <a-select-option value="N">否</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="是否树">
                  <a-select v-decorator="[ 'isTree', {initialValue: 'N'}]" @change="handleChangeInIsTree">
                    <a-select-option value="Y">是</a-select-option>
                    <a-select-option value="N">否</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- 树型表单父ID、树开表单列 -->
          <a-list-item v-if="showTreeParentIdField">
            <a-row :gutter="gutter" style="width: 100%;">

              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="树表单父ID">
                  <a-input
                    placeholder="请输入树表单父ID字段名"
                    v-decorator=" ['treeParentIdField', validatorRules.treeParentIdField]"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24/3" style="display: none">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="是否有子节点字段">
                  <a-input
                    placeholder="请输入是否有子节点字段名"
                    v-decorator=" ['treeIdField', validatorRules.treeIdField]"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="树开表单列">
                  <a-input
                    placeholder="请输入树开表单列字段名"
                    v-decorator=" ['treeFieldname', validatorRules.treeFieldname]"/>
                </a-form-item>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- 附表 -->
          <a-list-item v-if="showSubTable">
            <a-row :gutter="gutter" style="width: 100%;">
              <a-col :span="24">
                <a-form-item
                  style="width: 100%"
                  :labelCol="oneCol.label"
                  :wrapperCol="oneCol.wrapper"
                  label="附表">

                  <a-input :disabled="true" v-decorator=" ['subTableStr']"/>
                </a-form-item>
              </a-col>
            </a-row>
          </a-list-item>
        </a-list>

        <!--<a-form-item-->
        <!--:labelCol="labelCol"-->
        <!--:wrapperCol="wrapperCol"-->
        <!--label="子表">-->
        <!--<a-input placeholder="请输入子表" v-decorator="['subTableStr', {}]"/>-->
        <!--</a-form-item>-->

        <!-- - - - - - --->


        <!--/** 表ID */-->
        <!--private java.lang.String cgformHeadId;-->

        <!--/** 原字段名 */-->
        <!--private java.lang.String dbFieldNameOld;-->

        <!--/** 排序 */-->
        <!--private java.lang.Integer orderNum;-->


        <!-- - - - - - --->


        <!--<a-form-item-->
        <!--:labelCol="labelCol"-->
        <!--:wrapperCol="wrapperCol"-->
        <!--label="树表主键字段">-->
        <!--<a-input placeholder="请输入树表主键字段" v-decorator="['treeIdField', {}]"/>-->
        <!--</a-form-item>-->

      </a-form>

      <a-spin :spinning="tableLoading">
        <a-tabs v-model="activeKey" @change="handleChangeInTabs">
          <!-- :forceRender="true" 必须为true-->
          <a-tab-pane tab="数据库属性" key="1" :forceRender="true">
            <db-attribute-table
              ref="table1"
              :action-button="actionButton"
              @added="handleAdded"
              @deleted="handleDeleted"
              @dragged="handleDragged"
              @inserted="handleInserted"
              @syncDbType="handleSyncDbType"/>
          </a-tab-pane>
          <a-tab-pane tab="页面属性" key="2" :forceRender="true">
            <page-attribute-table ref="table2"/>
          </a-tab-pane>
          <a-tab-pane tab="校验字段" key="3" :forceRender="true">
            <check-dict-table ref="table3"/>
          </a-tab-pane>

          <a-tab-pane tab="外键" key="4" :forceRender="true">
            <foreign-key-table ref="table4" :action-button="actionButton"/>
          </a-tab-pane>
          <a-tab-pane tab="索引" key="5" :forceRender="true">
            <index-table ref="table5" :action-button="actionButton"/>
          </a-tab-pane>

          <a-tab-pane tab="查询配置" key="6" :forceRender="true">
            <query-table ref="table6" @query="queryFieldSetting"/>
          </a-tab-pane>

        </a-tabs>
      </a-spin>

    </a-spin>
  </j-modal>
</template>

<script>

  import DBAttributeTable from '../tables/DBAttributeTable'
  import PageAttributeTable from '../tables/PageAttributeTable'
  import CheckDictTable from '../tables/CheckDictTable'
  import ForeignKeyTable from '../tables/ForeignKeyTable'
  import IndexTable from '../tables/IndexTable'
  import QueryTable from '../tables/QueryTable'

  import { setDataSource, getMasterTableInitialData,getTreeNeedFields } from '../util/TableUtils'
  import { validateTables, VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'

  import { getAction, httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { randomUUID, simpleDebounce } from '@/utils/util.js'

  export default {
    name: 'OnlCgformHeadModal',
    components: {
      'db-attribute-table': DBAttributeTable,
      PageAttributeTable, CheckDictTable, ForeignKeyTable, IndexTable, QueryTable
    },
    provide() {
      return {
        getAllTable: this.getAllTable
      }
    },
    props:{
      actionButton:{
        type:Boolean,
        default:true,
        required:false
      }
    },
    data() {
      return {
        title: '操作',
        visible: false,
        activeKey: '1',
        model: {},
        gutter: 8,

        showRelationType: false,
        showTreeParentIdField: false,
        showIdSequence: false,
        showSubTable: false,

        oneCol: {
          label: { span: 2 },
          wrapper: { span: 24 - 2 }
        },
        threeCol: {
          label: { span: 6 },
          wrapper: { span: 24 - 6 }
        },

        confirmLoading: false,
        tableLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          tableName: {
            rules:[{
              required: true, message: '请输入表名!'
            },{
              validator: this.validateTableName
            }]
          },
          tableTxt: { rules: [{ required: true, message: '请输入表说明!' }] },
          idSequence: { rules: [{ required: true, message: '请输入序号名称!' }] },
          treeParentIdField: { rules: [{ required: true, message: '请输入树表单父ID!' }] },
          treeFieldname: { rules: [{ required: true, message: '请输入树开表单列!' }] },
          treeIdField: { rules: [{ required: true, message: '请输入是否有子节点字段名!' }] },
          tabOrderNum: {
            initialValue: 1,
            rules: [{ required: true, message: '请输入序号！' }]
          },
        },
        url: {
          add: '/online/cgform/head/add',
          edit: '/online/cgform/head/edit',
          addAll: '/online/cgform/api/addAll',
          editAll: '/online/cgform/api/editAll',
          queryField: '/online/cgform/field/listByHeadId',
          queryIndex: '/online/cgform/index/listByHeadId',
          checkOnlyTable:'/online/cgform/api/checkOnlyTable'
        },
        treeFieldAdded:false,
        //树形列表需要的配置ID集合
        tree_field_id:[],
        // 未验证通过
        VALIDATE_NO_PASSED: Symbol(),
        editPageFlag:false,
        // 立即同步所有 table（防抖版）
        syncAllTableNowDebounce: simpleDebounce(() => {
          this.syncAllTableNowPromise()
        }, 150),
        // 临时 id 不保存到数据库
        fieldTempIds: [],
      }
    },
    watch: {
    },
    created() {
    },
    mounted() {
    },
    methods: {

      /**
       * 获取指定的 $refs 对象
       * 有时候可能会遇到组件未挂载到页面中的情况，导致无法获取 $refs 中的某个对象
       * 这个方法可以等待挂载完成之后再返回 $refs 的对象，避免报错
       * @author sunjianlei
       **/
      getRefPromise(name) {
        let _this = this
        return new Promise((resolve) => {
          (function next() {
            let ref = _this.$refs[name]
            if (ref) {
              resolve(ref)
            } else {
              setTimeout(() => {
                next()
              }, 10)
            }
          })()
        })
      },

      add() {
        this.treeFieldAdded = false
        this.editPageFlag = false
        // 添加初始数据
        this.getAllTable().then(tables => {

          let [table1, table2, table3, table4, table5, table6] = tables
          // 临时 id，不保存到数据库
          let tempIds = []
          let datas = getMasterTableInitialData()
          datas.forEach((data, index) => {
            data.id = randomUUID()
            tempIds.push(data.id)
          })
          this.fieldTempIds = tempIds
          // setTimeout 是为了解除添加初始化数据的时候卡住的问题，先让弹窗弹出来，再添加数据
          setTimeout(() => {
            // 先加载第一个tab的数据，可以看起来更快些
            setTimeout(() => {
              setDataSource(table2, datas)
              setDataSource(table3, datas)
              setDataSource(table4, datas)
              setDataSource(table6, datas)
            }, 1)
            setDataSource(table1, datas)
          }, 1)
        })

        this.edit({}, 'add')
      },
      edit(record, caller = '') {
        this.initialAllTable()
        this.activeKey = '1'
        this.visible = true
        // 设置主表的数据
        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.treeFieldAdded = record.isTree=='Y'
        let pickAfter = pick(this.model,'themeTemplate','tableName','scroll','tableType', 'tableVersion', 'tableTxt', 'isCheckbox', 'isDbSynch', 'isPage', 'isTree', 'idSequence', 'idType', 'queryMode', 'relationType', 'subTableStr', 'tabOrderNum', 'treeParentIdField', 'treeIdField', 'treeFieldname', 'formCategory', 'formTemplate', 'formTemplateMobile')
        this.initialAllShowItem(pickAfter)
        this.$nextTick(() => {
          this.form.setFieldsValue(pickAfter)
        })
        // 不是添加，就加载数据库中的数据
        if (caller !== 'add') {
          this.tableLoading = true
          this.editPageFlag = true
          Promise.all([
            getAction(this.url.queryField, { headId: this.model.id }),
            this.getRefPromise('table1'),
            this.getRefPromise('table2'),
            this.getRefPromise('table3'),
            this.getRefPromise('table4'),
            this.getRefPromise('table6')
          ]).then(results => {
            let [{ result: fields }, table1, table2, table3, table4, table6] = results
            table1.deleteIds = []
            table1.selectedRowKeys = []
            // 将数据同步到各表中
            setDataSource(table1, fields,true)
            // 延迟加载不可见的表
            setTimeout(() => {
              setDataSource(table2, fields)
              setDataSource(table3, fields)
              setDataSource(table6, fields)
              setDataSource(table4, fields)
            }, 100)
          }).catch(e => {
            console.error(e)
          }).then(() => {
            this.tableLoading = false
          })
          // 加载index的数据，由于默认不可见，所以可以分开加载，提升加载效率
          Promise.all([
            getAction(this.url.queryIndex, { headId: this.model.id }),
            this.getRefPromise('table5')
          ]).then(results => {
            let [{ result: indexs }, table5] = results
            setDataSource(table5, indexs)
          }).catch(e => {
            console.error(e)
          })
        }
      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleOk() {
        this.validateFields()
      },
      handleCancel() {
        this.close()
      },

      /** 初始化所有需要条件切换显示的项 */
      initialAllShowItem(record) {
        this.handleChangeInTableType(record.tableType || 1)
        this.handleChangeInIsTree(record.isTree || 'N')
        this.handleChangeInIdType(record.idType || 'UUID')
        this.showSubTable = (record.tableType || 1) === 2
      },

      handleChangeInTableType(value) {
        this.showRelationType = (value === 3)
        this.getRefPromise('table2').then(table2 => {
          table2.changePageType((value == 3))
        })
      },
      handleChangeInIsTree(value) {
        this.showTreeParentIdField = (value === 'Y')
        if(value === 'Y'){
          this.addTreeNeedField()
        }else{
          this.deleteTreeNeedField()
        }
      },
      handleChangeInIdType(value) {
        this.showIdSequence = (value === 'SEQUENCE')
      },

      /* tables function */

      /** 获取所有的表 */
      getAllTable() {
        return Promise.all([
          this.getRefPromise('table1'),
          this.getRefPromise('table2'),
          this.getRefPromise('table3'),
          this.getRefPromise('table4'),
          this.getRefPromise('table5'),
          this.getRefPromise('table6')

        ])
      },

      /** 初始化所有的table */
      initialAllTable() {
        this.getAllTable().then(tables => {
          tables.forEach(table => {
            table.$refs.editableTable.initialize()
          })
        })
      },

      /** ATab切换事件 */
      handleChangeInTabs(activeKey) {
        // 当切换了选项卡的时候只同步修改当前所能看到的table
        if (['2', '3', '4', '5', '6'].indexOf(activeKey) !== -1) {
          Promise.all([
            this.getRefPromise('table1'),
            this.getRefPromise(`table${activeKey}`)
          ]).then(tables => {
            let [table1, table] = tables
            table1.$refs.editableTable.resetScrollTop()
            table.syncTable(table1)
          })
        }
      },

      /** 当新增了的时候应立即同步 */
      handleAdded() {
        this.syncAllTableNow()
      },

      /** 当删除的时候也应立即同步 */
      handleDeleted() {
        this.syncAllTableNow()
      },

      /** 当拖动后立即同步 */
      handleDragged(event) {
        let { oldIndex, newIndex, target } = event
        this.syncAllOrderNumNow(oldIndex, newIndex)
      },

      /** 当插入后立即同步 */
      handleInserted(event) {
        let { insertIndex, target } = event
        this.syncAllTableNowPromise().then(res => {
          let oldIndex = target.$refs.editableTable.rows.length - 1
          this.syncAllOrderNumNow(oldIndex, insertIndex)
        })
      },

      /** 立即同步所有的表的排序顺序 */
      syncAllOrderNumNow(oldIndex, newIndex) {
        this.getAllTable().then(tables => {
          tables.forEach((tab, idx) => {
            if (idx > 0 && idx < 4) {
              tab.$refs.editableTable.rowResort(oldIndex, newIndex)
            }
          })
        })
      },

      /** 当value变化时同步 date */
      handleSyncDbType(event) {
        this.getRefPromise('table2').then(table2 => {
          table2.syncFieldShowType(event.row)
        })
      },

      /** 立即主动同步所有table */
      syncAllTableNow() {
        this.syncAllTableNowDebounce()
      },
      // 立即同步所有 table （返回Promise）
      syncAllTableNowPromise() {
        return this.getAllTable().then(tables => {
          return new Promise(async (resolve, reject) => {
            let [table1, table2, table3, table4, table5, table6] = tables

            await table2.syncTable(table1)
            await table3.syncTable(table1)
            await table4.syncTable(table1)
            await table6.syncTable(table1)

            resolve()
          })
        })
      },

      /** 触发所有表单验证 */
      validateFields() {
        this.confirmLoading = true
        let options = {}
        new Promise((resolve, reject) => {
          // 验证主表表单
          this.form.validateFields((error, values) => {
            error ? reject(VALIDATE_NO_PASSED) : resolve({ values })
          })
        }).then((result) => {
          Object.assign(options, result)
          // 验证所有tables的表单
          return this.validateTableFields()
        }).then(values => {
          Object.assign(options, values)
          let formData = this.classifyIntoFormData(options)
          return this.requestAddOrEdit(formData)
        }).catch(e => {
          this.confirmLoading = false
          if (e.error !== VALIDATE_NO_PASSED) {
            console.error(e)
          }
        })
      },

      /** 发起请求新增或修改的请求 */
      requestAddOrEdit(formData) {
        this.confirmLoading = true
        //update-begin-author:taoyan date:20190924 for:表字段转小写
        if(formData.fields && formData.fields.length>0){
          for(let i of formData.fields){
            i.dbFieldName = i.dbFieldName.toLowerCase();
          }
        }
        if(formData.head && formData.head.tableName){
          formData.head.tableName = formData.head.tableName.toLowerCase().trim();
        }
        //update-end-author:taoyan date:20190924 for:表字段转小写

        // 判断是add还是edit
        let method = 'post', url = this.url.addAll
        if (this.model.id) {
          method = 'put'
          url = this.url.editAll
        }
        // 发起请求
        //console.log("formData.....",formData)
        httpAction(url, formData, method).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      },

      /** 将五个表的数据整理整合成后台识别的formData */
      classifyIntoFormData(options) {
        // 整理数据
        let formData = { head: {}, fields: [], indexs: [] }
        formData.head = Object.assign(this.model, options.values)

        // 整理 fields
        options.table1.values.forEach((item, index) => {
          // ID 以 table1 的 ID 为准
          let rowId =  item.id
          let field = Object.assign({}, item)
          field['order_num'] = index

          let value2 = options.table2.values[index]
          field = Object.assign(value2, field)

          let value3 = options.table3.values[index]
          field = Object.assign(value3, field)

          let value4 = options.table4.values[index]
          field = Object.assign(value4, field)

          //console.log("options....",options)
          let value6 = options.table6.values[index]
          field = Object.assign(value6, field)

          // 如果 table1 没有返回id，则代表是新增的数据
          if (rowId == null || rowId === '') {
            delete field.id
          } else {
            field.id = rowId
          }

          // 去掉临时ID
          if (this.fieldTempIds.includes(field.id)) {
            delete field.id
          }

          formData.fields.push(field)
        })
        formData.deleteFieldIds = options.table1.deleteIds

        // 整理 index
        formData.indexs = options.table5.values
        formData.deleteIndexIds = options.table5.deleteIds
        return formData
      },

      /** 验证并获取五个表的数据 */
      validateTableFields() {
        let _this = this
        return new Promise((resolve, reject) => {
          this.getAllTable().then((tables) => {
            let cases = []
            for (let table of tables) {
              cases.push(table.$refs.editableTable)
            }
            return validateTables(cases, true)
          }).then((all) => {
            let options = {}
            all.forEach((item, index) => {
              options[`table${index + 1}`] = item
            })
            resolve(options)
          }).catch((e = {}) => {
            // 判断表单验证是否未通过
            if (e.error === VALIDATE_NO_PASSED) {
              // 未通过就跳转到相应的tab选项卡
              _this.activeKey = (e.index + 1).toString()
            }
            reject(e)
          })
        })
      },
      validateTableName(rule, value, callback){
        if(!value){
          callback()
        }else{
          var patt1=new RegExp("^[a-zA-Z]{1}_.*");
          if(patt1.test(value)){
            callback("不能以单个字母加下划线开头")
          }else if(new RegExp("^[0-9]*$").test(value)){
            //不能全部是数字
            callback("不能全部是数字")
          }else{
            var params = {
              id:!this.model.id?"":this.model.id,
              tbname:value
            };
            getAction(this.url.checkOnlyTable,params).then(res=>{
              if(res.success){
                if(res.result==-1){
                  callback("表名已存在！");
                }
              }
              callback()
            })
          }
        }
      },
      deleteTreeNeedField(){
        if(this.tree_field_id&&this.tree_field_id.length>0){
          this.getAllTable().then((tables)=>{
            let [table1] = tables
            table1.tableDeleteLines(this.tree_field_id)
            this.tree_field_id=[]
            this.treeFieldAdded = false
          })
        }
      },
      addTreeNeedField(){
        if(!this.treeFieldAdded){
          this.getAllTable().then((tables)=>{
            let [table1, table2, table3] = tables
            let datas = getTreeNeedFields()
            datas = datas.filter(item => {
              let nameList = table1.dataSource.map(o => o.dbFieldName)
              return !nameList.includes(item.dbFieldName)
            })
            this.tree_field_id=[]
            datas.forEach((newData) => {
              let uuidTemp = randomUUID() + '__tempid'
              this.tree_field_id.push(uuidTemp)
              //update-begin--Author:scott  Date:20190922 for：Online普通表单，变更为树表单报错--------------------
              newData.id = uuidTemp
              //update-wns--Author:scott  Date:20190922 for：Online普通表单，变更为树表单报错--------------------
            })

            //update-begin--Author:sunjianlei Date:20200317 for：Online是否树添加行报错--------------------
            table1.$refs.editableTable._pushByDataSource(datas)
            table2.$refs.editableTable._pushByDataSource(datas)
            table3.$refs.editableTable._pushByDataSource(datas)
            this.$nextTick(() => this.syncAllTableNow())
            //update-begin--Author:sunjianlei Date:20200317 for：Online是否树添加行报错--------------------
          })
          this.treeFieldAdded = true
        }
        this.$nextTick(() => {
          this.form.setFieldsValue({"treeIdField":"has_child","treeParentIdField":"pid"})
        })
      },
      queryFieldSetting(id){
        this.$refs.table2.enableQuery(id)
      }

    }
  }
</script>

<style scoped>
 .online-config-cust .has-feedback{display: block !important;}
 .input-table .thead .td span{width:100%}
</style>