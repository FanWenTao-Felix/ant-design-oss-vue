import OnlGraphreportAutoChart from '../OnlGraphreportAutoChart'

export default {
  name: 'TempletStyleMixins',
  components: {
    'auto-chart': OnlGraphreportAutoChart
  },
  props: {
    // 分好组后的数据
    groups: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  computed: {
    chartCardProps() {
      return Object.assign({
        style: 'margin-bottom: 10px'
      }, this.groupCardProps)
    },
    groupCardProps() {
      return {
        headStyle: { paddingLeft: '20px' },
        bodyStyle: { padding: '10px' }
      }
    }
  },
  watch: {},
  methods: {}
}