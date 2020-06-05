import T from 'ant-design-vue/es/table/Table'

export default {
  name: 'CgformAutoListTableWrap',
  data() {
    return {}
  },
  props: Object.assign({}, T.props, {
    scopedSlots: {
      type: Object,
      default: () => ({})
    }
  }),

  methods: {},

  render(h) {

    let props = {}
    Object.keys(T.props).forEach(k => {
      return props[k] = this[k]
    })

    return h('a-table', {
      tag: 'component',
      attrs: props,
      on: this.$listeners,
      scopedSlots: Object.assign({}, this.$scopedSlots, this.scopedSlots)
    }, this.$slots.default)

  }
}