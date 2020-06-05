<template>
  <a-spin :spinning="loading">
    <h2 v-if="error.jsonFormattingFailed" :style="error.style">
      <span>JSON字符串格式化失败</span>
    </h2>
    <h2 v-else-if="error.chartDataIsNull" :style="error.style">
      <span>属性“chartData”不能为空</span>
    </h2>
    <template v-else>

      <!-- 生成查询条件 -->
      <div class="search-field" v-if="showSearchField">
        <a-form :form="searchForm" layout="inline">
          <template v-for="(field,key) of searchField">
            <a-form-item :key="key" :class="{'group':field.searchMode==='group'}" :label="field.fieldTxt">

              <template v-if="field.dictCode && dataSource.dictOptions[field.dictCode]">
                <a-select
                  :options="dataSource.dictOptions[field.dictCode]"
                  :placeholder="`请选择${field.fieldTxt}`"
                  v-decorator="[field.fieldName]"
                  style="min-width: 180px"
                />
              </template>

              <template v-else-if="field.fieldType==='Integer' || field.fieldType==='Long'">
                <a-input-number
                  :placeholder="`请输入${field.fieldTxt}`"
                  v-decorator="[field.fieldName]"
                  style="min-width: 180px"
                />
                <template v-if="field.searchMode==='group'">
                  <span style="padding: 0 8px;">~</span>
                  <a-input-number
                    :placeholder="`请输入结束${field.fieldTxt}`"
                    v-decorator="[field.fieldName+'_end']"
                    style="min-width: 180px"
                  />
                </template>
              </template>
              <template v-else-if="field.fieldType==='Date'">
                <j-date
                  :value="dateValues[field.fieldName]"
                  style="min-width: 180px"
                  :placeholder="`请选择${field.fieldTxt}`"
                  @change="(v)=>handleDateInput(v,field.fieldName)"
                />
                <a-input :hidden="true" v-decorator="[field.fieldName]"/>

                <template v-if="field.searchMode==='group'">
                  <span style="padding: 0 8px;">~</span>
                  <j-date
                    :value="dateValues[field.fieldName+'_end']"
                    style="min-width: 180px"
                    :placeholder="`请选择结束${field.fieldTxt}`"
                    @change="(v)=>handleDateInput(v,field.fieldName+'_end')"
                  />
                  <a-input :hidden="true" v-decorator="[field.fieldName+'_end']"/>

                </template>
              </template>
              <template v-else>
                <a-input
                  :placeholder="`请输入${field.fieldTxt}`"
                  v-decorator="[field.fieldName]"
                />
                <template v-if="field.searchMode==='group'">
                  <span class="split-span" style="">~</span>
                  <a-input
                    :placeholder="`请输入结束${field.fieldTxt}`"
                    v-decorator="[field.fieldName+'_end']"
                  />
                </template>
              </template>


            </a-form-item>
          </template>
          <a-form-item>
            <a-button type="primary" icon="search" @click="handleClickSearchField">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" icon="reload" @click="handleClickSearchFormReset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <h2 v-if="error.resultIsEmpty" :style="error.style">
        <span>没有查询到任何数据</span>
      </h2>
      <chart-tab-template v-else-if="isTab" v-bind="templateProps" @searchFieldChange="(v)=>searchField = v"/>
      <chart-single-template v-else-if="isSingle" v-bind="templateProps" @searchFieldChange="(v)=>searchField = v"/>
      <chart-double-template v-else-if="isDouble" v-bind="templateProps" @searchFieldChange="(v)=>searchField = v"/>
      <chart-combination-template v-else-if="isCombination" v-bind="templateProps"/>
      <h2 v-else :style="error.style">未识别的布局模式</h2>
    </template>
  </a-spin>
</template>

<script>
  import { getAction } from '@/api/manage'
  // import { cloneObject } from '@/utils/util'
  import ChartTabTemplate from './template/ChartTabTemplate'
  import ChartSingleTemplate from './template/ChartSingleTemplate'
  import ChartDoubleTemplate from './template/ChartDoubleTemplate'
  import ChartCombinationTemplate from './template/ChartCombinationTemplate'
  import JDate from '@/components/jeecg/JDate'

  export default {
    name: 'OnlGraphreportAutoChart',
    components: {
      // tab 布局模板
      ChartTabTemplate,
      // 单排布局模板
      ChartSingleTemplate,
      // 双排布局模板
      ChartDoubleTemplate,
      // 组合布局
      ChartCombinationTemplate,
      JDate
    },
    props: {
      // 是否运行在组件模式
      component: {
        type: Boolean,
        default: false
      },
      // 如果运行在组件模式，就必须传递 chartData
      chartData: {
        type: Object,
        default: null
      },
      chartDatas: {
        type: Array,
        default: null
      },
      isCombination: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        dateValues: {},
        code: '0dbeb0dfc3ec18f0ce8d1d0caeeb6095',
        loading: false,
        // 展示模板
        displayTemplate: 'tab',
        title: null,
        dataSource: {},
        dataSources: null,
        url: {
          getChartsData: '/online/graphreport/api/getChartsData'
        },
        dataType: '',
        // 查询条件
        params: '',
        // 根据不同的运行时错误显示不同的提示信息
        error: {
          style: {
            textAlign: 'center',
            background: 'white',
            padding: '20px'
          },
          // json 格式化失败
          jsonFormattingFailed: false,
          // chartData 是 null
          chartDataIsNull: false,
          // 返回结果是空的
          resultIsEmpty: false
        },
        searchForm: this.$form.createForm(this),
        searchField: []
      }
    },
    computed: {
      isTab() {
        return (this.displayTemplate === 'tab')
      },
      isSingle() {
        return (this.displayTemplate === 'single')
      },
      isDouble() {
        return (this.displayTemplate === 'double')
      },
      templateProps() {
        return {
          // 是否运行在组件模式
          component: this.component,
          dataSource: this.dataSource,
          dataSources: this.dataSources,
          isCombination: this.isCombination,
          // 组件模式下不显示 title
          title: this.component ? null : this.title
        }
      },
      // 是否显示查询条件
      showSearchField() {
        return this.dataType === 'sql' && !this.component && this.searchField.length > 0
      }
    },
    watch: {
      '$route'() {
        // 刷新参数放到这里去触发，就可以刷新相同界面了
        this.loadChartData()
      }
    },
    created() {
      this.loadChartData()
    },
    methods: {

      // 加载图表数据
      loadChartData() {
        this.loading = true
        if (this.component) {
          if (this.isCombination) {
            if (this.chartDatas == null) {
              this.error.chartDataIsNull = true
              console.error(`当运行在组件模式时，必须传递"chartDatas"属性`)
            } else {
              this.parseChartDatas(this.chartDatas)
            }
          } else if (this.chartData == null) {
            this.error.chartDataIsNull = true
            console.error(`当运行在组件模式时，必须传递"chartData"属性`)
          } else {
            this.parseChartData(this.chartData)
          }
          this.loading = false
        } else {
          // 非组件模式，根据id查询图表数据
          if (!this.$route.params.code) {
            this.loading = false
            return false
          }
          let url = this.url.getChartsData
          let params = { id: this.$route.params.code, params: this.params }
          getAction(url, params).then((res) => {
            if (res.success) {
              let { head, data, items, dictOptions } = res.result
              this.dataType = head.dataType
              if (data && data.length === 0) {
                this.error.resultIsEmpty = true
              } else {
                this.error.resultIsEmpty = false
                this.parseChartData({ head, data, items, dictOptions })
              }
            } else {
              this.$message.error('查询失败: ' + res.message)
            }
          }).finally(() => {
            this.loading = false
          })
        }
        // 运行在组件模式时直接使用传递过来的数据
      },
      parseChartData(chartData) {
        let { name, displayTemplate } = chartData.head
        this.title = name
        this.displayTemplate = displayTemplate
        this.dataSource = chartData
      },
      parseChartDatas(chartDatas) {
        this.title = null
        this.displayTemplate = 'combination'
        this.dataSources = chartDatas
      },

      // 查询条件
      handleClickSearchField() {
        this.searchForm.validateFields((error, values) => {
          let params = []
          for (let field of this.searchField) {
            let value = null
            if (!field.searchMode) field.searchMode = 'single'
            if (field.searchMode === 'single') {
              // 单条件查询
              value = values[field.fieldName]
            } else {
              // 范围查询
              let _begin = values[field.fieldName]
              let _end = values[`${field.fieldName}_end`]
              value = [_begin, _end]
            }
            // 封装成 params
            if (value != null) {
              params.push({
                value,
                fieldTxt: field.fieldTxt,
                fieldName: field.fieldName,
                fieldType: field.fieldType,
                searchMode: field.searchMode
              })
            }
          }
          // console.log('params:', params)
          this.params = encodeURIComponent(JSON.stringify(params))
          this.loadChartData()
        })
      },

      handleClickSearchFormReset() {
        this.searchForm.resetFields()
        let dateValues = Object.assign({}, this.dateValues)
        for (let name in dateValues) {
          if (dateValues.hasOwnProperty(name)) dateValues[name] = ''
        }
        this.dateValues = dateValues

        this.handleClickSearchField()
      },

      handleDateInput(value, name) {
        this.dateValues[name] = value
        this.searchForm.setFieldsValue({ [name]: value })
      }

    }
  }
</script>

<style lang="less" scoped>

  .search-field {
    padding: 10px 20px;
    margin-bottom: 20px;
    background-color: #fff;

    .split-span {
      width: 12px;
      /*padding: 0 8px;*/
      text-align: center;
      display: inline-block;
    }

    .group {
      /deep/ .ant-calendar-picker {
        width: calc(48% - 8px);
        .ant-input {
          width: 100%;
        }
      }

      /deep/ .ant-input {
        width: calc(50% - 8px);
      }
    }


  }

</style>