<template>
  <a-modal
    :title="title"
     width="950px"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: {disabled: disableSubmit} }"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-card id="staffCard" style="margin: 0 auto;width: 750px">
          <span id="staffLeaveTitle">员工请假单</span>
          <div class="staffLeaveTableId" style="margin-bottom: 5px">
          <a-form-item
            :labelCol="{xs: { span: 24 },sm: { span: 10 }}"
            :wrapperCol="{xs: { span: 24 },sm: { span: 10 }}"
            label="编号:">
              <a-input class="fontiframe" :readOnly="true" v-model="model.applyNo"/>
          </a-form-item>
          </div>
          <table border="1px" id="staffLeaveTable">
            <tr>
              <td class="firstTr">请假人</td>
              <td class="firstTr">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span class="fontiframe">{{ nickname }}</span>
                </a-form-item>
              </td>
              <td class="firstTr">部门</td>
              <td class="firstTr">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span class="fontiframe">{{model.department}}</span>
                </a-form-item>
              </td>
              <td class="firstTr">职务</td>
              <td class="firstTr">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span class="fontiframe">{{model.duty}}</span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td colspan="6">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="请假类别:">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model="flag" @change="onChange">
                    <a-radio class="radioGroup" value="1">病假</a-radio>
                    <a-radio class="radioGroup" value="2">事假</a-radio>
                    <a-radio class="radioGroup" value="3">年假</a-radio>
                    <a-radio class="radioGroup" value="4">婚假</a-radio>
                    <a-radio class="radioGroup" value="5">产假</a-radio>
                    <a-radio class="radioGroup" value="6">丧假</a-radio>
                    <a-radio class="radioGroup" value="7">探亲假</a-radio>
                    <a-radio class="radioGroup" value="8">护理假</a-radio>
                    <a-radio class="radioGroup" value="9">其他</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td colspan="6">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  label="请假事由:"
                >
                  <a-textarea
                    v-decorator="[ 'leaveReason', {}]"
                    style="resize:none;height:118px;font-size: 12px;border: 0px solid white;border-radius: 0px;margin-bottom: 0px;">

                  </a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td colspan="6">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                  class="fontiframe lineHeight"
                  label="请假事由:"
                >
                  自(
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    v-decorator="[ 'leaveStartDate', {}]"
                    :allowClear="false"
                  />
                  )
                  至(
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    v-decorator="[ 'leaveEndDate', {}]"
                    :allowClear="false"
                  />
                  )
                  总共请<a-input-number
                    class="smallText"
                    v-decorator="[ 'total', {}]"
                    size="small"
                    :min="0"/>天假<br/>
                  <span class="fontiframe" style="color: #ff0000;position: relative;right: 86px;">1.请假半天可以写0.5不能写0.1,0.2等小数。2.全天假以00:00:00开始以23:59:59结束,下午请假以12:00:00开始</span>
                </a-form-item>
              </td>
            </tr>
            <tr class="fifthTr">
              <td colspan="3">
                <a-form-item
                  :labelCol="{xs: { span: 24 },sm: { span: 10 }}"
                  :wrapperCol="wrapperCol"
                  label="休息期间联系方式:">
                  <a-input class="text" v-decorator="[ 'contactWay', {}]" />
                </a-form-item>
              </td>
              <td colspan="3">
                <a-form-item
                  :labelCol="{xs: { span: 24 },sm: { span: 11 }}"
                  :wrapperCol="wrapperCol"
                  label="休息期间应急工作委托人:">
                  <a-input class="text"  v-decorator="[ 'dutyDeputy', {}]"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <a-form-item
                  :labelCol="{xs: { span: 24 },sm: { span: 10 }}"
                  :wrapperCol="wrapperCol"
                  label="部门主管(经理)意见:">
                  <span>{{model.leaderApproval}}</span><br/>
                  <span class="fontiframe" style="text-align: right;">负责人:</span>
                </a-form-item>
              </td>
              <td colspan="3">
                <a-form-item
                  :labelCol="{xs: { span: 24 },sm: { span: 11 }}"
                  :wrapperCol="wrapperCol"
                  label="人力资源部(行政办)意见:">
                  <span class="fontiframe">{{model.hrPrincipalApproval}}</span><br/>
                  <span class="fontiframe" style="text-align: right;">负责人:</span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <a-form-item
                  :labelCol="{xs: { span: 24 },sm: { span: 10 }}"
                  :wrapperCol="wrapperCol"
                  label="总经理意见:">
                  <span class="fontiframe">{{model.deptPrincipalApproval}}</span><br/>
                  <span class="fontiframe" style="text-align: right;">总经理:</span>
                </a-form-item>
              </td>
              <td colspan="3" style="text-align: left;">
                <p class="fontiframe">
                  说明<br/>
                  1.返回公司报到时间为销假时间。<br/>
                  2.所有员工3天及以上请假需总经理批准。<br/>
                  3.本表存人力资源部(行政办)备案。<br/>
                </p>
              </td>
            </tr>
          </table>
        </a-card>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          hidden
        >
          <a-date-picker class="input" placeholder="" format='YYYY-MM-DD' disabled  v-decorator="[ 'applyDate', {}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from 'moment'
  import store from '@/store'

  export default {
    name: 'JoaEmployeeLeaveModal',
    data() {
      return {
        nickname:"",
        title: '操作',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 3 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 21 }
        },
        nowTime: '', //当前时间
        confirmLoading: false,
        disableSubmit:false,
        form: this.$form.createForm(this),
        validatorRules: {},
        flag: '1',
        url: {
          add: '/joa/joaEmployeeLeave/add',
          edit: '/joa/joaEmployeeLeave/edit'
        },
        beginTime: '', //计算所需开始时间
        endTime: ''   //计算所需结束时间
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
      onChange(e) {
        this.model.leaveCategory = e.target.value
      },
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        if (record.leaveCategory != undefined) {
          this.flag = record.leaveCategory
        } else {
          this.flag = '1'
        }
        this.nickname=store.getters.nickname;
        this.model.name = store.getters.userInfo.username;
        this.model.department = '系统管理部';
        this.model.applyDate=this.nowTime;
        this.model.duty="";
        this.model.hrPrincipalApproval="";
        this.model.leaderApproval="";
        this.model.deptPrincipalApproval="小于三天无需总经理批准";
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,  'leaveReason', 'contactWay','dutyDeputy'))
          //时间格式化
          this.form.setFieldsValue({ applyDate: this.model.applyDate ? moment(this.model.applyDate) : null })
          this.form.setFieldsValue({ leaveStartDate: this.model.leaveStartDate ? moment(this.model.leaveStartDate) : null })
          this.form.setFieldsValue({ leaveEndDate: this.model.leaveEndDate ? moment(this.model.leaveEndDate) : null })
        })
        console.log(this.model);
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
            let formData = Object.assign(this.model, values)
            if(this.model.leaveCategory==undefined){
              this.model.leaveCategory=this.flag;
            }
            //时间格式化
            formData.applyDate = formData.applyDate ? formData.applyDate.format('YYYY-MM-DD HH:mm:ss') : null
            formData.leaveStartDate = formData.leaveStartDate ? formData.leaveStartDate.format('YYYY-MM-DD HH:mm:ss') : null
            formData.leaveEndDate = formData.leaveEndDate ? formData.leaveEndDate.format('YYYY-MM-DD HH:mm:ss') : null
            formData.updateDate = formData.updateDate ? formData.updateDate.format('YYYY-MM-DD HH:mm:ss') : null
            if(this.model.total==0){
              that.$message.warning('请假天数不能是0天');
              that.confirmLoading=false;
              return false;
            }
            if(this.model.total==''||this.model.total==undefined||this.model.total==null){
              that.$message.warning('请假天数不能是空');
              that.confirmLoading=false;
              return false;
            }
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
      handleCancel() {
        this.close()
      },
      // 获取当前时间函数
      timeFormate(timeStamp) {
        let year = new Date(timeStamp).getFullYear();
        let month = new Date(timeStamp).getMonth() + 1 < 10 ? '0' + (new Date(timeStamp).getMonth() + 1) : new Date(timeStamp).getMonth() + 1;
        let date = new Date(timeStamp).getDate() < 10 ? '0' + new Date(timeStamp).getDate() : new Date(timeStamp).getDate();
        //let hh =new Date(timeStamp).getHours() < 10? "0" + new Date(timeStamp).getHours(): new Date(timeStamp).getHours();
        //let mm =new Date(timeStamp).getMinutes() < 10? "0" + new Date(timeStamp).getMinutes(): new Date(timeStamp).getMinutes();
        //let ss =new Date(timeStamp).getSeconds() < 10? "0" + new Date(timeStamp).getSeconds(): new Date(timeStamp).getSeconds();
        //+""+" "+hh+":"+mm+":"+ss
        this.nowTime = year + '-' + month + '-' + date ;
      },
      nowTimes() {
        this.timeFormate(new Date())
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
              this.model.total = 0;
              return false
            }
            var that = this
            that.$message.warning('结束时间不能小于开始时间')
            this.model.total = 0;
            return false
          }
          this.model.total = dayDiff;
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

  #staffLeaveTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;;
  }

  #staffLeaveTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
    background-color: #FFFFFF;
  }

  #staffLeaveTable td {
    font-family: "微软雅黑";
    color: #000000;
  }

  #staffLeaveTable .fontiframe {
    font-size: 12px;
  }
  #staffLeaveTable .ant-form-item {
    margin: 0px;
  }

  #staffLeaveTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
    background-color: #FFFFFF;
  }

  .staffLeaveTableId  .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
    background-color: #ffffff;
    margin: 0px;
    width:255px;
  }

  .staffLeaveTableId{
    margin-right: 87px;
    float: right;
    height: 35px;
  }

  #staffLeaveTable .text{
    border: 0px solid black !important;
    border-radius: 0px;
    background-color: #FFFFFF;
    margin: 0px;
    width: 100%;
    font-size: 12px;
  }

  #staffLeaveTable .colfirst {
    width: 90px;
  }

  #staffLeaveTable .colfour {
    width: 90px;
  }

  #staffLeaveTable .firstTr {
    width: 16%;
  }
  #staffLeaveTable .fifthTr .ant-form-item-control-wrapper{
     width:50%;
  }
  .ant-form label {
    font-size: 12px;
  }
  #staffLeaveTable .smallText .ant-input-number-input{
    background-color: #FFFFFF;
    margin: 0px
  }
  #staffLeaveTable .lineHeight .ant-form-item-control{
    line-height: 0px;
  }
</style>