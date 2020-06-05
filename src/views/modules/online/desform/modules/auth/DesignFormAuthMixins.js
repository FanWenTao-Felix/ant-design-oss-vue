import pick from 'lodash.pick'
import { httpAction } from '@api/manage'
import { filterObj } from '@/utils/util'
import Ellipsis from '@/components/Ellipsis'

export default {
  components: { Ellipsis },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      loading: false,
      queryParams: {},
      iSorter: {
        column: 'createTime',
        order: 'desc',
      },
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
      labelCol: {
        sm: { span: 8 },
        xs: { span: 24 },
      },
      wrapperCol: {
        sm: { span: 16 },
        xs: { span: 24 },
      },
      dataSource: [],
    }
  },
  computed: {
    url() {
      const prefix = '/desform/auth'
      return {
        list: `${prefix}/list/${this.permissionType}`,
        add: `${prefix}/addAuth/${this.permissionType}`,
        edit: `${prefix}/edit/${this.permissionType}`,
        removeById: `${prefix}/delete`,
      }
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler() {
        if (this.visible) {
          this.loadData()
        }
      },
    }
  },
  methods: {
    pick,

    resetQueryParams() {
      this.queryParams = {}
      this.loadData()
    },

    getQueryParams() {
      let params = Object.assign({}, this.queryParams, this.iSorter)
      params.pageNo = this.pagination.current
      params.pageSize = this.pagination.pageSize
      return filterObj(params)
    },

    openModalCommon(modal, title, record,) {
      modal.title = title
      if (modal.form) {
        modal.form.resetFields()
      }
      modal.model = Object.assign({}, record)
      modal.visible = true
    },

    closeModalCommon() {
      this.modal.visible = false
    },

    addOrEdit(modal, options = {}) {
      options = { ...modal, ...options }
      let { form, model } = options
      form.validateFields((error, values) => {
        if (!error) {
          let url = this.url.add, method = 'post'
          if (model.id) {
            url = this.url.edit
            method = 'put'
          }
          modal.loading = true
          httpAction(options.url || url, {
            ...model,
            ...values,
            ...(options.formData || {}),
            desformId: this.record.id,
            desformCode: this.record.desformCode,
          }, options.method || method).then(({ success, message }) => {
            if (success) {
              this.loadData()
              this.closeModalCommon()
              this.$message.success(message)
            } else {
              this.$warning({ title: '操作失败', content: message })
            }
          }).catch(e => {
            console.error(e)
            this.$error({ title: '操作失败', content: (e.message || e) })
          }).finally(() => {
            modal.loading = false
          })
        }
      })
    },

    removeById({ id, options }) {
      options.loading = true
      httpAction(`${this.url.removeById}?id=${id}`, {}, 'delete').then(({ success, message }) => {
        if (success) {
          this.loadData()
          this.$message.success(message)
        } else {
          this.$warning({ title: '删除失败', content: message })
        }
      }).catch(e => {
        console.error(e)
        this.$error({ title: '删除失败', content: (e.message || e) })
      }).finally(() => {
        options.loading = false
      })
    },

    updateStatus(record, params = {}) {
      let status = record.status === 1 ? 0 : 1
      this.$set(record, 'loading', true)
      let pms = {
        id: record.id,
        status: status,
        desformId: this.record.id,
        desformCode: this.record.desformCode,
        ...params,
      };

      //如果是临时ID,剔除掉
      const startText = 'temp-'
      if(pms.id.startsWith(startText)){
         delete pms.id;
      }
      httpAction(this.url.edit,pms, 'PUT').then(({ success, message }) => {
        if (success) {
          this.$set(record, 'status', params.status || status)
        } else {
          this.$warning({ title: '操作失败', content: message })
        }
      }).catch(e => {
        console.error(e)
        this.$error({ title: '操作失败', content: (e.message || e) })
      }).finally(() => {
        this.$delete(record, 'loading')
      })
    },

  },
}
