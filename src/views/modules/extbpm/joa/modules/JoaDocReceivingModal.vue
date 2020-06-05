<template>
  <a-modal
    :title="title"
    :width="1000"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-card id="staffCard">
          <span id="documentsIncomeTitle">收文单</span>
          <table border="1px" id="documentsIncomeTable">
            <tr>
              <td class="firstTr">来文标题</td>
              <td class="firstTr" colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'title', {}]"/>
                </a-form-item>
              </td>
              <td class="firstTr">来文字号</td>
              <td class="firstTr" colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <span class="fontiframe">< 系统自动生成 ></span>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>来文单位</td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" placeholder="" v-decorator="[ 'fromDepart', {}]" />
                </a-form-item>
              </td>
              <td>来文日期</td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-date-picker
                    class="input"
                    placeholder=""
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    v-decorator="[ 'fromDate', {}]"
                    :allowClear="false"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                公文分类
              </td>
              <td colspan="2" style="width:200px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="{xs: { span: 20 }}">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model="docTypeFlag" @change="onChange('docType',$event)">
                    <a-radio class="radioGroup" value="1">普通文件</a-radio>
                    <a-radio class="radioGroup" value="2">盖章文件</a-radio>
                    <a-radio class="radioGroup" value="3">正式文件</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <td>
                文种
              </td>
              <td colspan="2" style="width:200px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-select v-model="model.classification">
                    <a-select-option value="1">公告</a-select-option>
                    <a-select-option value="2">通知</a-select-option>
                  </a-select>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                机密程度
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="{xs: { span: 20 }}">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model="confidentialityFlag" @change="onChange('confidentiality',$event)">
                    <a-radio class="radioGroup" value="1">公开</a-radio>
                    <a-radio class="radioGroup" value="2">秘密</a-radio>
                    <a-radio class="radioGroup" value="3">机密</a-radio>
                    <a-radio class="radioGroup" value="4">绝密</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <td>
                缓急程度
              </td>
              <td colspan="2" style="width:260px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="{xs: { span: 15 }}">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model="urgencyFlag" @change="onChange('urgency',$event)">
                    <a-radio class="radioGroup" value="1">普通</a-radio>
                    <a-radio class="radioGroup" value="2">特急</a-radio>
                    <a-radio class="radioGroup" value="3">紧急</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>关键词</td>
              <td colspan="5">
                <a-input class="text" placeholder="" v-decorator="[ 'keyword', {}]" />
              </td>
            </tr>
            <tr>
              <td>
                收文人
              </td>
              <td colspan="5">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-textarea
                    v-decorator="[ 'receiverName', {}]"
                    style="resize:none;height:118px;font-size: 12px;border: 0px solid white;border-radius: 0px;margin-bottom: 0px;">

                  </a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                文件
              </td>
              <td colspan="5">

              </td>
            </tr>
            <tr>
              <td>
                登记人
              </td>
              <td colspan="2">
                <span>{{nickname}}</span>
              </td>
              <td>
                登记时间
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-date-picker
                    class="input"
                    placeholder=""
                    format='YYYY-MM-DD'
                    v-decorator="[ 'bookDate', {}]"/>
                </a-form-item>
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
    name: "JoaDocReceivingModal",
    data () {
      return {
        docTypeFlag:"",//公文分类标识
        urgencyFlag:"",//缓急程度标识
        sendTargetFlag:"",//发文目标标识
        confidentialityFlag:"",//机密程度标识
        title:"操作",
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 30 },
        },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
        },
        url: {
          add: "/joa/joaDocReceiving/add",
          edit: "/joa/joaDocReceiving/edit",
        },
        nickname:"",
      }
    },
    created () {
    },
    methods: {
      onChange(flag,e){
        if(flag=='docType'){
          this.model.docType=e.target.value;
        }else if(flag=='urgency'){
          this.model.urgency=e.target.value;
        }else if(flag=='confidentiality'){
          this.model.confidentiality=e.target.value;
        }else{
          var that=this;
          that.$message.warning("找不到这个标识");
        }
      },
      radioLoad(record){
        if (record.docType != undefined) {
          this.docTypeFlag = record.docType
        } else {
          this.docTypeFlag = '1'
        }

        if (record.urgency != undefined) {
          this.urgencyFlag = record.urgency
        } else {
          this.urgencyFlag = '1'
        }

        if (record.confidentiality != undefined) {
          this.confidentialityFlag = record.confidentiality
        } else {
          this.confidentialityFlag = '1'
        }
        this.model.docType=this.docTypeFlag;
        this.model.confidentiality=this.confidentialityFlag;
        this.model.urgency=this.urgencyFlag;
      },
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.radioLoad(record);
        this.nickname=store.getters.nickname;
        this.model.booker=store.getters.username;
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'title','fromDepart','keyword','receiverName'))
          //时间格式化
          this.form.setFieldsValue({fromDate:this.model.fromDate?moment(this.model.fromDate):null})
          this.form.setFieldsValue({bookDate:this.model.bookDate?moment(this.model.bookDate):null})
        });

      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            //时间格式化
            formData.fromDate = formData.fromDate?formData.fromDate.format('YYYY-MM-DD HH:mm:ss'):null;
            formData.bookDate = formData.bookDate?formData.bookDate.format('YYYY-MM-DD HH:mm:ss'):null;

            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })



          }
        })
      },
      handleCancel () {
        this.close()
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

  #documentsIncomeTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;;
  }

  #documentsIncomeTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
    background-color: #ffffff;
  }

  #documentsIncomeTable td {
    font-family: "微软雅黑";
    color: #000000;
  }

  #documentsIncomeTable tr {
    height: 40px;
  }

  #documentsIncomeTable .fontiframe {
    font-size: 12px;
  }

  #documentsIncomeTable .ant-form-item {
    margin: 0px;
  }

  #documentsIncomeTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
    background-color: #ffffff;
    margin: 0px auto;
    width: 100%;
    font-size: 12px;
    height: 38px;
  }

  #documentsIncomeTable .ant-select-selection{
    background-color: #fff;
    border-radius: 0px;
    border: 0px solid #d9d9d9;
    border-top-width: 0px;
    height: 40px;
    padding-top: 4px;
  }


  #documentsIncomeTable .text {
    border: 0px solid black !important;
    border-radius: 0px;
    background-color: #ffffff;
    margin: 0px auto;
    width: 100%;
    font-size: 12px;
    text-align: center;
    height: 38px;
  }

  #documentsIncomeTable .colfirst {
    width: 90px;
  }

  #documentsIncomeTable .colfour {
    width: 90px;
  }

  #documentsIncomeTable .firstTr {
    width: 100px;
  }

  #documentsIncomeTable .radioGroup {
    font-size: 12px;
  }

  #documentsIncomeTable .smallText .ant-input-number-input {
    background-color: #FFFFFF;
    margin: 0px;
    border: 0px solid black !important;
    border-radius: 0px;
    font-size: 12px;
  }

  #documentsIncomeTable .ant-input-number {
    border: 0px solid black !important;
    border-radius: 0px;
  }

  #documentsIncomeTable .ant-upload-list{
    border:1px solid #969696;
    width: 99%;
    margin: auto;
    height:auto;
    padding: 11px;
    min-height: 90px;
    border-top: 0px;
    margin-bottom: 5px;
  }
</style>