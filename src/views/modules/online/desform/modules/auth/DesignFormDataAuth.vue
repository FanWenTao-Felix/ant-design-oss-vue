<template>
  <div class="table-page-search-wrapper">

    <a-form @keyup.enter.native="handleQuery">
      <a-row :gutter="8">
        <a-col :sm="9" :xs="24">
          <a-form-item label="规则名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParams.authTitle" placeholder="请输入规则名称"/>
          </a-form-item>
        </a-col>
        <a-col :sm="9" :xs="24">
          <a-form-item label="规则值" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-model="queryParams.authValue" placeholder="请输入规则值"/>
          </a-form-item>
        </a-col>
        <a-col :sm="6" :xs="24">
          <a-form-item>
            <a-button type="primary" @click="handleQuery" icon="search">查询</a-button>
            <a-button type="primary" @click="handleReset" icon="reload" style="margin-left: 8px">重置</a-button>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24" style="margin-bottom: 12px;">
          <a-button type="primary" icon="plus" @click="handleAdd">添加</a-button>
        </a-col>
      </a-row>
    </a-form>

    <a-table
      bordered
      rowKey="id"
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource"
    >

      <template slot="ellipsis" slot-scope="text">
        <ellipsis :length="13">{{text}}</ellipsis>
      </template>

      <template slot="switch" slot-scope="text,record">
        <a-switch size="small" :loading="record.loading" :checked="record.status === 1" @change="handleUpdateStatus(record)"/>
      </template>

      <template slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical"/>

        <a-dropdown>
          <a class="ant-dropdown-link">
            <span>更多</span>
            <a-icon type="down"/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a @click="handleAuth(record)">授权</a>
            </a-menu-item>
            <a-menu-item>
              <a-popconfirm title="确定删除吗？" placement="left" @confirm="handleDelete(record)">
                <a>删除</a>
              </a-popconfirm>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>

    </a-table>

    <j-modal
      :title="modal.title"
      :visible.sync="modal.visible"
      :width="800"
      :okClose="false"
      :maskClosable="false"
      :confirmLoading="modal.loading"
      @ok="handleModalOk"
    >

      <a-form :form="modal.form">

        <a-form-item label="规则名称" :labelCol="modal.labelCol" :wrapperCol="modal.wrapperCol">
          <a-input placeholder="请输入规则名称" v-decorator="['authTitle', modal.validatorRules.authTitle]"/>
        </a-form-item>

        <a-form-item label="规则字段" :labelCol="modal.labelCol" :wrapperCol="modal.wrapperCol">
          <a-select
            placeholder="请选择规则字段"
            showSearch allowClear
            :filterOption="filterAuthFieldOption"
            :options="modal.authFieldOptions"
            v-decorator="['authField', modal.validatorRules.authField]"
          />
        </a-form-item>

        <a-form-item label="条件规则" :labelCol="modal.labelCol" :wrapperCol="modal.wrapperCol">
          <a-select placeholder="请选择条件规则" v-decorator="['authType', modal.validatorRules.authType]">
            <a-select-option :value="undefined">请选择</a-select-option>
            <a-select-option value="gt">大于（gt）</a-select-option>
            <a-select-option value="lt">小于（lt）</a-select-option>
            <a-select-option value="eq">等于（eq）</a-select-option>
            <a-select-option value="ne">不等于（ne）</a-select-option>
            <a-select-option value="ge">大于等于（ge）</a-select-option>
            <a-select-option value="le">小于等于（le）</a-select-option>
            <a-select-option value="left_like">左模糊（left_like）</a-select-option>
            <a-select-option value="right_like">右模糊（right_like）</a-select-option>
            <a-select-option value="like">全模糊（like）</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="规则值" :labelCol="modal.labelCol" :wrapperCol="modal.wrapperCol">
          <a-input placeholder="请输入规则值" v-decorator="['authValue', modal.validatorRules.authValue]"/>
        </a-form-item>

        <a-form-item label="状态" :labelCol="modal.labelCol" :wrapperCol="modal.wrapperCol">
          <a-radio-group buttonStyle="solid" v-decorator="['status',{initialValue:1}]">
            <a-radio-button :value="1">有效</a-radio-button>
            <a-radio-button :value="0">无效</a-radio-button>
          </a-radio-group>
        </a-form-item>

      </a-form>

    </j-modal>

    <design-form-auth-form-modal
      ref="authForm"
      :title="modal2.title"
      :record="modal2.model"
      :loading="modal2.loading"
      :visible.sync="modal2.visible"
      @ok="handleAuthFormModalOk"
    />

  </div>
</template>

<script>

  import { getAction, putAction } from '@api/manage'
  import { generateColumns } from '../../util/desformUtil'
  import DesignFormAuthMixins from './DesignFormAuthMixins'
  import DesignFormAuthFormModal from './DesignFormAuthFormModal'

  export default {
    name: 'DesignFormButtonAuth',
    components: { DesignFormAuthFormModal },
    mixins: [DesignFormAuthMixins],
    props: {},
    data() {
      return {
        description: '表单设计数据权限管理页面',
        permissionType: 'data',
        columns: [
          {
            title: '启用',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            scopedSlots: { customRender: 'switch' },
          },
          {
            title: '规则名称',
            dataIndex: 'authTitle',
            width: '18%',
            align: 'center',
            scopedSlots: { customRender: 'ellipsis' },
          },
          {
            title: '规则字段',
            dataIndex: 'authField',
            width: '19%',
            align: 'center',
            scopedSlots: { customRender: 'ellipsis' },
          },
          {
            title: '规则条件',
            dataIndex: 'authType',
            width: '18%',
            align: 'center',
            scopedSlots: { customRender: 'ellipsis' },
          },
          {
            title: '规则值',
            dataIndex: 'authValue',
            width: '18%',
            align: 'center',
            scopedSlots: { customRender: 'ellipsis' },
          },
          {
            title: '操作',
            key: 'action',
            width: 130,
            align: 'center',
            scopedSlots: { customRender: 'action' }
          },
        ],
        modal: {
          form: this.$form.createForm(this),
          loading: false,
          title: '新增',
          model: {},
          visible: false,
          labelCol: {
            sm: { span: 4 },
            xs: { span: 24 },
          },
          wrapperCol: {
            sm: { span: 18 },
            xs: { span: 24 },
          },
          validatorRules: {
            authTitle: { rules: [{ required: true, message: '请输入规则名称！' }] },
            authField: { rules: [{ required: true, message: '请选择规则字段！' }] },
            authType: { rules: [{ required: true, message: '请选择条件规则！' }] },
            authValue: { rules: [{ required: true, message: '请输入规则值！' }] },
          },
          authFieldOptions: [],
        },
        modal2: {
          model: {},
          loading: false,
          visible: false,
        },
      }
    },

    watch: {
      record: {
        deep: true,
        immediate: true,
        handler(record) {
          this.loadAuthFieldOptions(record)
        },
      },
    },
    methods: {

      loadData() {
        this.loading = true
        this.dataSource = []
        let params = this.getQueryParams()
        getAction(`${this.url.list}/${this.record.desformCode}`, params).then(({ success, message, result }) => {
          if (success) {
            this.pagination = result.total
            this.dataSource = result.records
          } else {
            this.$warning({ title: '查询失败', content: message })
          }
        }).finally(() => {
          this.loading = false
        })
      },

      loadAuthFieldOptions(record) {
        let columns = []
        try {
          let json = JSON.parse(record.desformDesignJson)
          columns = generateColumns({ dataList: json.list })
        } catch (e) {
          console.error(e)
        }
        let options = columns.map(column => {
          let { title, dataIndex } = column
          return { label: `${title}（${dataIndex}）`, value: dataIndex }
        })
        this.modal.authFieldOptions = [
          { label: '请选择', value: undefined },
          ...options,
          { label: '创建人（create_by）', value: 'create_by' },
          { label: '创建时间（create_time）', value: 'create_time' },
          { label: '更新人（update_by）', value: 'update_by' },
          { label: '更新时间（update_time）', value: 'update_time' },
        ]
      },

      handleQuery() {
        this.loadData()
      },
      handleReset() {
        this.resetQueryParams()
      },

      openModal(title, record,) {
        this.openModalCommon(this.modal, title, record)
        this.$nextTick(() => {
          this.modal.form.setFieldsValue(this.pick(this.modal.model, 'authTitle', 'authField', 'authType', 'authValue', 'status'))
        })
      },

      handleAdd() {
        this.openModal('新增', {})
      },

      handleEdit(record) {
        this.openModal('编辑', record)
      },
      handleDelete(record) {
        this.removeById({ id: record.id, options: this.modal })
      },

      handleModalOk() {
        this.addOrEdit(this.modal)
      },

      closeModalCommon() {
        this.modal.visible = false
        this.modal2.visible = false
      },

      filterAuthFieldOption(input, option) {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        )
      },

      handleUpdateStatus(record) {
        this.updateStatus(record)
      },

      handleAuth(record) {
        this.openModalCommon(this.modal2, '授权', {})
        this.$nextTick(() => {
          this.modal2.model = record
        })
      },

      handleAuthFormModalOk() {
        this.addOrEdit(this.modal2, {
          form: this.$refs.authForm,
          model: this.modal2.model
        })
      },

    },
  }
</script>

<style scoped>

</style>