<template>
      <a-form :form="form">
        <j-form-container :disabled="true">
        <a-card id="staffCard" style="margin: 0 auto;width: 750px">
          <span id="staffEvectionTitle">员工出差申请单</span>
          <table border="1px" id="staffEvectionTable">
            <tr>
              <td class="firstTr">出差人</td>
              <td class="firstTr" colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'applyUserName', {}]"/>
                </a-form-item>
              </td>
              <td class="firstTr">部门</td>
              <td class="firstTr" colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span class="fontiframe">{{model.departName}}</span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                目的地
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'destination', {}]"/>
                </a-form-item>
              </td>
              <td>
                项目名称
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'projectName', {}]"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                出发时间
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    v-decorator="[ 'departureTime', {}]"
                    :allowClear="false"
                    @change="getStartTime"
                  />
                </a-form-item>
              </td>
              <td>
                计划返回时间
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    v-decorator="[ 'plannedReturnTime', {}]"
                    :allowClear="false"
                    @change="getEndTime"
                  />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                实际返回时间
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    v-decorator="[ 'actualReturnTime', {}]"
                    :allowClear="false"
                  />
                </a-form-item>
              </td>
              <td>
                出差天数
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-model="model.dayNum"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                出差经费支出
              </td>
              <td colspan="5">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model="flag" @change="onChangeExpenditure">
                    <a-radio class="radioGroup" value="1">预支借款</a-radio>
                    <a-radio class="radioGroup" value="2">个人垫付</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <!--<td>
                借款金额
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input-number
                    class="smallText"
                    v-model="model.loanMoney"
                    size="large"
                    :min="0"
                    :max="99999999"
                    @change="upperOnChange"/>
                </a-form-item>
              </td>-->
            </tr>
            <!--<tr>
              <td>
                借款金额大写
              </td>
              <td colspan="2">
                <span>
                  {{upperSum}}
                </span>
              </td>
              <td>
                借款发放时间
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    :allowClear="false"
                    v-decorator="[ 'cashierLoanTime', {}]"
                  />
                </a-form-item>
              </td>
            </tr>-->
            <tr>
              <td>
                出发地
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'departAddress', {}]"/>
                </a-form-item>
              </td>
              <td>
                出行工具
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-radio-group
                    class="fontiframe"
                    name="radioGroup"
                    v-model="flagTravelTool"
                    @change="onChangeTravelTool">
                    <a-radio class="radioGroup" value="1">客车</a-radio>
                    <a-radio class="radioGroup" value="2">火车</a-radio>
                    <a-radio class="radioGroup" value="3">飞机</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                任务及事由
              </td>
              <td colspan="5">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-textarea
                    v-decorator="[ 'reason', {}]"
                    style="resize:none;height:98px;width:100%;font-size: 12px;border: 0px solid white;border-radius: 0px;margin-bottom: 0px;">

                  </a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr style="height: 38px;">
              <td>
                部门领导审核
              </td>
              <td colspan="2">
                <span>{{model.departLeaderAudit}}</span>
              </td>
              <td>
                财务审核
              </td>
              <td colspan="2">
                <span>{{model.financeAudit}}</span>
              </td>
            </tr>
            <tr style="height: 38px;">
              <td>
                出纳放款
              </td>
              <td colspan="2">
                <span>{{model.cashierLoanAmount}}</span>
              </td>
              <td>
                总经理审核
              </td>
              <td colspan="2">
                <span>{{model.managerAudit}}</span>
              </td>
            </tr>
          </table>
          <br/>
        </a-card>
        </j-form-container>
      </a-form>
</template>

<script>
  import { httpAction,getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from 'moment'
  import store from '@/store'
  import JFormContainer from "../../../../../components/jeecg/JFormContainer.vue";

  export default {
    components: {JFormContainer},
    name: 'JoaBusinesStripForm',
    props: ['formData'],
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 3 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 25 }
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {},
        url: {
          add: '/joa/joaBusinesStrip/add',
          edit: '/joa/joaBusinesStrip/edit',
          queryById: "/joa/joaBusinesStrip/queryById",
        },
        nickname: '',
        flag: '1',
        flagTravelTool: '1',
        unit: new Array("仟", "佰", "拾", "", "仟", "佰", "拾", "", "角", "分"),
        upperSum:'', //大写金额
        beginTime: '', //计算所需开始时间
        endTime: '',   //计算所需结束时间
      }
    },
    created() {
      console.log("form start");
      console.log("formdata",this.formData);
      var params = {id:this.formData.dataId};//查询条件
      getAction(this.url.queryById,params).then((res)=>{
        if(res.success){
          console.log("获取流程节点信息",res);
          this.edit (res.result);
        }
      })
    },
    methods: {
      onChangeExpenditure(e) {
        this.model.travelExpensesType = e.target.value
      },
      onChangeTravelTool(e) {
        this.model.travelTool = e.target.value
      },
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        if (record.travelExpensesType != undefined) {
          this.flag = record.travelExpensesType
        } else {
          this.flag = '1'
        }
        if(this.model.loanMoney != ''&&this.model.loanMoney != null&&this.model.loanMoney != undefined){
          this.upperOnChange(this.model.loanMoney);
        }
        console.log(record)
        if (record.travelTool != undefined) {
          this.flagTravelTool = record.travelTool.toString()
        } else {
          this.flagTravelTool = '1'
        }
        this.model.departName = '系统管理部'
        this.model.departLeaderAudit = ''
        this.model.financeAudit = ''
        this.model.cashierLoanAmount = ''
        this.model.managerAudit = ''
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'applyUserName', 'projectName', 'destination', 'reason','departAddress'))
          //时间格式化
          this.form.setFieldsValue({ departureTime: this.model.departureTime ? moment(this.model.departureTime) : null })
          this.form.setFieldsValue({ plannedReturnTime: this.model.plannedReturnTime ? moment(this.model.plannedReturnTime) : null })
          this.form.setFieldsValue({ actualReturnTime: this.model.actualReturnTime ? moment(this.model.actualReturnTime) : null })
          this.form.setFieldsValue({ cashierLoanTime: this.model.cashierLoanTime ? moment(this.model.cashierLoanTime) : null })
        })

      },
      close() {
        this.$emit('close')
        this.visible = false
      },
      handleCancel() {
        this.close()
      },
      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'put'
            }
            let formData = Object.assign(this.model, values)
            if (this.model.travelExpensesType == undefined) {
              this.model.travelExpensesType = this.flag
            }
            if (this.model.travelTool == undefined) {
              this.model.travelTool = this.flagTravelTool
            }
            //时间格式化
            formData.departureTime = formData.departureTime ? formData.departureTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.plannedReturnTime = formData.plannedReturnTime ? formData.plannedReturnTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.actualReturnTime = formData.actualReturnTime ? formData.actualReturnTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.cashierLoanTime = formData.cashierLoanTime ? formData.cashierLoanTime.format('YYYY-MM-DD HH:mm:ss') : null

            console.log(formData)
            httpAction(httpurl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
              that.close()
            })


          }
        })
      },
      upperOnChange(value) {
        console.log(value);
        if (value != '') {
          var lth = value.toString().length
          value *= 100
          value += ''
          var length = value.length
          if (value < 0) {
            this.$message.warning('不能输入比0小的数字')
            this.model.loanMoney = 0
            this.upperSum = ''
            return false
          }
          if (lth <= 8) {
            var result = ''
            for (var i = 0; i < length; i++) {
              if (i == 2) {
                result = '元' + result
              } else if (i == 6) {
                result = '万' + result
              }
              if (value.charAt(length - i - 1) == 0) {
                if (i != 0 && i != 1) {
                  if (result.charAt(0) != '零' && result.charAt(0) != '元' && result.charAt(0) != '万') {
                    result = '零' + result
                  }
                }
                continue
              }
              result = this.toDx(value.charAt(length - i - 1)) + this.unit[this.unit.length - i - 1] + result
            }
            result += result.charAt(result.length - 1) == '元' ? '整' : ''
            this.upperSum = result
          } else {
            this.$message.warning('超出运算范围')
            this.model.loanMoney = 0
            this.upperSum = ''
            return false;
          }
        } else {
          this.upperSum = ''
        }
      },
      toDx(n) {   //阿拉伯数字转换函数
        switch (n) {
          case '0':
            return '零'
          case '1':
            return '壹'
          case '2':
            return '贰'
          case '3':
            return '叁'
          case '4':
            return '肆'
          case '5':
            return '伍'
          case '6':
            return '陆'
          case '7':
            return '柒'
          case '8':
            return '捌'
          case '9':
            return '玖'
        }

      },
      getStartTime(value) {
        var d = new Date(value._d)
        var beginTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
        this.beginTime = beginTime
        this.difference(this.beginTime, this.endTime)
      },
      getEndTime(value) {
        var d = new Date(value._d)
        var endTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
        this.endTime = endTime
        this.difference(this.beginTime, this.endTime)
      },
      difference(beginTime, endTime) {
        console.log(beginTime);
        console.log(endTime);
        if (beginTime != '' && endTime != '') {
          var dateBegin = new Date(beginTime)
          var dateEnd = new Date(endTime)
          var dateDiff = dateEnd.getTime() - dateBegin.getTime() //时间差的毫秒数
          var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)) //计算出相差天数
          //var leave1 = dateDiff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
          //var hours = Math.floor(leave1 / (3600 * 1000)) //计算出小时数
          //计算相差分钟数
          //var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
          //var minutes = Math.floor(leave2 / (60 * 1000)) //计算相差分钟数
          //计算相差秒数
          //var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
          //var seconds = Math.round(leave3 / 1000)
          //console.log("相差" + dayDiff + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒" );
          if (dayDiff < 0) {
            if (dayDiff == 0) {
              this.model.dayNum = 0;
              return false
            }
            var that = this
            that.$message.warning('结束时间不能小于开始时间')
            this.model.dayNum = 0;
            return false
          }
          this.model.dayNum = dayDiff;
        }


      }
    }
  }
</script>

<style>
  #staffCard {
    border: 1px solid white;
    box-shadow: 0px 0px 1px 1px #aaa,
    3px 0px 5px 0px #aaa,
    0px 4px 7px 0px #aaa;
  }

  #staffEvectionTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;;
  }

  #staffEvectionTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
    background-color: #ffffff;
  }

  #staffEvectionTable td {
    font-family: "微软雅黑";
    color: #000000;
  }

  #staffEvectionTable .fontiframe {
    font-size: 12px;
  }

  #staffEvectionTable .ant-form-item {
    margin: 0px;
  }

  #staffEvectionTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
    background-color: #ffffff;
    margin: 0px auto;
    width: 100%;
    font-size: 12px;
    height: 38px;
  }


  #staffEvectionTable .text {
    border: 0px solid black !important;
    border-radius: 0px;
    background-color: #ffffff;
    margin: 0px auto;
    width: 100%;
    font-size: 12px;
    text-align: center;
    height: 38px;
  }

  #staffEvectionTable .colfirst {
    width: 90px;
  }

  #staffEvectionTable .colfour {
    width: 90px;
  }

  #staffEvectionTable .firstTr {
    width: 100px;
  }

  #staffEvectionTable .radioGroup {
    font-size: 12px;
  }

  #staffEvectionTable .smallText .ant-input-number-input {
    background-color: #FFFFFF;
    margin: 0px;
    border: 0px solid black !important;
    border-radius: 0px;
  }

  #staffEvectionTable .ant-input-number {
    border: 0px solid black !important;
    border-radius: 0px;
  }

</style>