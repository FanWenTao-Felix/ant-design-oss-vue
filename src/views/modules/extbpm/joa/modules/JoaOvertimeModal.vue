<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-card id="staffCard">
          <span id="staffTitle">员工加班申请表</span>
          <table border="3px" id="staffTable">
            <tr>
              <td class="colfirst">申请人</td>
              <td class="secend">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span>{{nickname}}</span>
                </a-form-item>
              </td>
              <td>部门</td>
              <td>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span>{{model.department}}</span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="colfirst">申请时间</td>
              <td style="width:180px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-date-picker
                    class="input"
                    placeholder=""
                    format='YYYY-MM-DD'
                    disabled
                    v-decorator="[ 'applyTime', {}]"/>
                </a-form-item>
              </td>
              <td>加班时段</td>
              <td class="colfour">
                <a-radio-group name="radioGroup" v-model="flag" @change="onChange">
                  <a-radio class="radioGroup" value="1">工作日加班</a-radio>
                  <a-radio class="radioGroup" value="2">周六日加班</a-radio>
                  <a-radio class="radioGroup" value="3">国家法定假日加班</a-radio>
                </a-radio-group>
              </td>
            </tr>

            <tr>
              <td class="colfirst">加班开始时间</td>
              <td>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    v-decorator="[ 'beginTime', {}]"
                    :allowClear="false"
                    @change="getStartTime"/>
                </a-form-item>
              </td>
              <td>加班结束时间</td>
              <td class="colfour">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-date-picker
                    class="input"
                    placeholder=""
                    v-decorator="[ 'endTime', {}]"
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    :allowClear="false"
                    @change="dateDifference"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="colfirst">加班缘由/内容</td>
              <td colspan="3">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-textarea
                    v-decorator="[ 'reason', {}]"
                    style="resize:none;height:100%;font-size: 12px;border: 0px solid black;border-radius: 0px;">

                  </a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td class="colfirst">总加班时常</td>
              <td colspan="3" height="40px">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span v-if="model.totalDay!=undefined||model.totalHour!=undefined">{{model.totalDay}}天{{model.totalHour}}小时</span>
                </a-form-item>
              </td>
            </tr>
            <tr style="height: 70px;">
              <td class="colfirst">直接领导审批</td>
              <td>
                <span>{{model.leaderRemark}}</span>
              </td>
              <td class="colfour">部门领导审批</td>
              <td>
                <span>{{model.deptLeaderRemark}}</span>
              </td>
            </tr>
          </table>
        </a-card>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from 'moment'
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import store from '@/store'

  export default {
    name: 'JoaOvertimeModal',
    components: { ATextarea },
    data() {
      return {
        flag: '1',
        isRead: true,
        value: 1,
        radioStyle: {
          display: 'block',
          height: '20px',
          lineHeight: '20px'
        },
        title: '操作',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 30 }
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {},
        url: {
          add: '/joa/joaOvertime/add',
          edit: '/joa/joaOvertime/edit'
        },
        nowTime: '', //当前时间
        nickname:'',
      }
    },
    // 创建完成时
    created() {
      this.nowTimes()
    },
    // 挂载完成时
    mounted() {
      this.nowTimes()
    },
    methods: {
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        if (record.overtimeType != undefined) {
          this.flag = record.overtimeType
        } else {
          this.flag = '1'
        }
        this.nickname=store.getters.nickname;
        this.model.applyUser=store.getters.username;
        this.model.department = '开发部门'
        this.model.leaderRemark = 'admin'
        this.model.deptLeaderRemark = 'admin'
        this.model.applyTime = this.nowTime
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,  'reason'))
          this.form.setFieldsValue({ applyTime: this.model.applyTime ? moment(this.model.applyTime) : null })
          this.form.setFieldsValue({ beginTime: this.model.beginTime ? moment(this.model.beginTime) : null })
          this.form.setFieldsValue({ endTime: this.model.endTime ? moment(this.model.endTime) : null })
          this.form.setFieldsValue({ createDate: this.model.createDate ? moment(this.model.createDate) : null })
          this.form.setFieldsValue({ updateDate: this.model.updateDate ? moment(this.model.updateDate) : null })
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
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
            this.model.daysUnpaid=this.model.totalDay;
            this.model.hourUnpaid=this.model.totalHour;
            let formData = Object.assign(this.model, values)
            if (this.model.overtimeType == undefined) {
              this.model.overtimeType = this.flag
            }
            //时间格式化
            formData.applyTime = formData.applyTime ? formData.applyTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.beginTime = formData.beginTime ? formData.beginTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.endTime = formData.endTime ? formData.endTime.format('YYYY-MM-DD HH:mm:ss') : null
            formData.updateDate = formData.updateDate ? formData.updateDate.format('YYYY-MM-DD HH:mm:ss') : null
            if(this.model.totalDay==0&&this.model.totalHour==0){
              that.$message.warning('请假天数和小时不能是0天');
              that.confirmLoading=false;
              return false;
            }
            if((this.model.totalDay==''||this.model.totalDay==undefined||this.model.totalDay==null)&&this.model.totalHour==''||this.model.totalHour==undefined||this.model.totalHour==null){
              that.$message.warning('请假天数和小时不能为空');
              that.confirmLoading=false;
              return false;
            }
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
      handleCancel() {
        this.close()
      },
      onChange(e) {
        this.model.overtimeType = e.target.value
      },
      // 获取当前时间函数
      timeFormate(timeStamp) {
        let year = new Date(timeStamp).getFullYear()
        let month = new Date(timeStamp).getMonth() + 1 < 10 ? '0' + (new Date(timeStamp).getMonth() + 1) : new Date(timeStamp).getMonth() + 1
        let date = new Date(timeStamp).getDate() < 10 ? '0' + new Date(timeStamp).getDate() : new Date(timeStamp).getDate()
        this.nowTime = year + '-' + month + '-' + date
      },
      nowTimes() {
        this.timeFormate(new Date())
      },
      getStartTime(value) {
        var d = new Date(value._d)
        var beginTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
        this.model.beginTime = beginTime
        this.difference(this.model.beginTime, this.model.endTime)
      },
      dateDifference(value) {
        var d = new Date(value._d)
        var endTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
        this.model.endTime = endTime
        this.difference(this.model.beginTime, this.model.endTime)
      },
      difference(beginTime, endTime) {
        if (beginTime != undefined && endTime != undefined) {
          var dateBegin = new Date(beginTime)
          var dateEnd = new Date(endTime)
          var dateDiff = dateEnd.getTime() - dateBegin.getTime() //时间差的毫秒数
          var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)) //计算出相差天数
          var leave1 = dateDiff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
          var hours = Math.floor(leave1 / (3600 * 1000)) //计算出小时数
          //计算相差分钟数
          var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
          var minutes = Math.floor(leave2 / (60 * 1000)) //计算相差分钟数
          //计算相差秒数
          var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
          var seconds = Math.round(leave3 / 1000)
          //console.log("相差" + dayDiff + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒" );
          if (dayDiff < 0) {
            if (dayDiff == 0) {
              this.model.totalDay = 0
              this.model.totalHour = hours
              return false
            }
            var that = this
            that.$message.warning('结束时间不能小于开始时间')
            this.model.totalDay = 0
            this.model.totalHour = 0
            return false
          }
          this.model.totalDay = dayDiff
          this.model.totalHour = hours
        }


      }


    }
  }
</script>

<style>
  #staffCard {
    border: 1px solid white;
    width: 100%;
    height: auto;
    box-shadow: 0px 0px 1px 1px #aaa,
    3px 0px 5px 0px #aaa,
    0px 4px 7px 0px #aaa;
    padding-bottom: 40px;
  }

  #staffTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;
  }

  #staffTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
  }

  #staffTable td {
    font-family: "微软雅黑";
    color: #000000;
  }

  #staffTable .ant-form-item {
    margin: 0px;
  }

  #staffTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;

  }

  #staffTable .colfirst {
    width: 90px;
  }

  #staffTable .colfour {
    width: 90px;
  }

  #staffTable .ant-form label {
    font-size: 12px;
  }
</style>