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
        <a-card id="staffCard"  style="margin: 0 auto;width: 750px">
          <span id="staffBmTitle">借款单</span>
          <table border="1px" id="staffBmTable">
            <tr>
              <td class="colfirst">借款人</td>
              <td class="secend">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span class="fontiframe">{{ nickname }}</span>
                </a-form-item>
              </td>
              <td>借款人部门</td>
              <td style="width:100px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span class="fontiframe">{{model.departName}}</span>
                </a-form-item>
              </td>
              <td>
                借款时间
              </td>
              <td>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-date-picker
                    class="input"
                    placeholder=""
                    format='YYYY-MM-DD'
                    disabled
                    v-decorator="[ 'loanTime', {}]"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>借款金额</td>
              <td>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                <a-input-number
                  class="smallText"
                  v-decorator="[ 'loanAmount', validatorRules.loanAmount]"
                  size="small"
                  :min="1"
                  :max="99999999"
                  @change="upperOnChange"/>
                </a-form-item>
              </td>
              <td>金额大写</td>
              <td colspan="3">
                  {{upperSum}}
              </td>
            </tr>
            <tr>
              <td>
                借款用途
              </td>
              <td colspan="5">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-textarea
                    v-decorator="[ 'loanUsage', {}]"
                    style="resize:none;height:98px;width:100%;font-size: 12px;border: 0px solid white;border-radius: 0px;margin-bottom: 0px;">

                  </a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                备注
              </td>
              <td colspan="5">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-textarea
                    v-decorator="[ 'remarks', {}]"
                    style="resize:none;height:98px;width:100%;font-size: 12px;border: 0px solid white;border-radius: 0px;margin-bottom: 0px;">

                  </a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr style="height: 45px;">
              <td>
                部门领导审核
              </td>
              <td>
                <span>{{model.departLeaderAudit}}</span>
              </td>
              <td>
                财务审核
              </td>
              <td>
                <span>{{model.financeAudit}}</span>
              </td>
              <td>
                总经理审核
              </td>
              <td>
                <span>{{model. managerAudit}}</span>
              </td>
            </tr>
            <tr style="height: 45px;">
              <td>
                出纳放款
              </td>
              <td>
                <span>{{model. cashierLoanAmount}}</span>
              </td>
              <td>借款发放时间</td>
              <td colspan="3">
                <span>
                  {{model.cashierLoanTime}}
                </span>
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
  import moment from "moment"
  import store from '@/store'

  export default {
    name: "JoaLoanModal",
    data () {
      return {
        nickname:"",
        title:"操作",
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
        disableSubmit: false,
        form: this.$form.createForm(this),
        validatorRules:{
          loanAmount:{rules: [{ required: true, message: '请输入借款金额!' }]},
        },
        url: {
          add: "/joa/joaLoan/add",
          edit: "/joa/joaLoan/edit",
        },
        nowTime: '', //当前时间
        unit: new Array("仟", "佰", "拾", "", "仟", "佰", "拾", "", "角", "分"),
        upperSum:'' //大写金额
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
        this.edit({});
      },
      edit(record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        if(this.model.loanAmount != ''&&this.model.loanAmount != null&&this.model.loanAmount != undefined){
          this.upperOnChange(this.model.loanAmount);
        }
        this.model.loanTime = this.nowTime;
        this.nickname = store.getters.nickname;
        this.model.loanUserName = store.getters.userInfo.username;
        this.model.departName = "系统管理部";
        this.model.departLeaderAudit="";
        this.model.financeAudit="";
        this.model.managerAudit="金额大于五千才需向总经理审批";
        this.model.cashierLoanAmount="";
        this.model.cashierLoanTime="";
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'loanUsage', 'remarks'))
          //时间格式化
          this.form.setFieldsValue({ loanTime: this.model.loanTime ? moment(this.model.loanTime) : null })
          this.form.setFieldsValue({ cashierLoanTime: this.model.cashierLoanTime ? moment(this.model.cashierLoanTime) : null })

        });

      },
      close() {
        this.$emit('close');
        this.visible = false;
      },
      handleCancel() {
        this.close()
      },
      handleOk() {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if (!this.model.id) {
              httpurl += this.url.add;
              method = 'post';
            } else {
              httpurl += this.url.edit;
              method = 'put';
            }
            let formData = Object.assign(this.model, values);
            //时间格式化
            formData.loanTime = formData.loanTime ? formData.loanTime.format('YYYY-MM-DD HH:mm:ss') : null;
            formData.cashierLoanTime = formData.cashierLoanTime ? formData.cashierLoanTime.format('YYYY-MM-DD HH:mm:ss') : null;

            console.log(formData)
            httpAction(httpurl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.$emit('ok');
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
        })
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
      upperOnChange(value) {
        if(value!=''){
          var lth=value.toString().length;
          value *= 100;
          value += "";
          var length = value.length;
          if(value<0){
            this.$message.warning("不能输入比0小的数字");
            this.model.loanAmount=0;
            this.upperSum="";
            return false;
          }
          if(lth<=8){
            var result = "";
            for (var i = 0; i < length; i++) {
              if (i == 2) {
                result = "元" + result;
              } else if (i == 6) {
                result = "万" + result;
              }
              if (value.charAt(length - i - 1) == 0) {
                if (i != 0 && i != 1) {
                  if (result.charAt(0) != '零' && result.charAt(0) != '元' && result.charAt(0) != '万') {
                    result = "零" + result;
                  }
                }
                continue;
              }
              result = this.toDx(value.charAt(length - i - 1)) + this.unit[this.unit.length - i - 1] + result;
            }
            result += result.charAt(result.length - 1) == '元' ? "整" : "";
            this.upperSum=result;
          }else{
            this.$message.warning("超出运算范围");
            this.model.loanAmount=0;
            this.upperSum="";
            return false;
          }
        }else{
          this.upperSum="";
        }
      },
      toDx(n) {   //阿拉伯数字转换函数
        switch (n) {
          case "0":
            return "零";
          case "1":
            return "壹";
          case "2":
            return "贰";
          case "3":
            return "叁";
          case "4":
            return "肆";
          case "5":
            return "伍";
          case "6":
            return "陆";
          case "7":
            return "柒";
          case "8":
            return "捌";
          case "9":
            return "玖";
        }

      },
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

  #staffBmTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;
  }

  #staffBmTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
  }

  #staffBmTable td {
    font-family: "微软雅黑";
    color: #000000;
  }

  #staffBmTable .ant-form-item {
    margin: 0px;
  }

  #staffBmTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;

  }

  #staffBmTable .colfirst {
    width: 90px;
  }

  #staffBmTable .colfour {
    width: 90px;
  }

  #staffBmTable .ant-form label {
    font-size: 12px;
  }

  #staffBmTable .fontiframe {
    font-size: 12px;
  }

  #staffBmTable .lineHeight .ant-form-item-control{
    line-height: 0px;
  }

  #staffBmTable .smallText .ant-input-number-input{
    background-color: #FFFFFF;
    margin: 0px;
    border:0px solid black!important;
    border-radius: 0px;
  }
  #staffBmTable  .ant-input-number{
    border:0px solid black!important;
    border-radius: 0px;
  }

  #staffBmTable .ant-input-number-sm input{
    height: 24px;
  }
</style>