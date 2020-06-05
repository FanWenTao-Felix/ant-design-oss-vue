<template>

      <a-form :form="form">
        <j-form-container :disabled="true">
        <a-card id="staffCard" style="margin: 0 auto;width: 1000px">
          <span id="documentsIssuedTitle">发文单</span>
          <table border="1px" id="documentsIssueTable">
            <tr>
              <td class="firstTr">公文标题</td>
              <td class="firstTr" colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'title', {}]"/>
                </a-form-item>
              </td>
              <td class="firstTr">发文字号</td>
              <td class="firstTr" colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input style="text-align: left" class="text" readOnly placeholder="< 系统自动生成 >" v-decorator="[ 'docCode']"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                公文分类
              </td>
              <td colspan="2" style="width:200px;text-align: left;padding-left: 10px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                <a-radio-group class="fontiframe" name="radioGroup" v-decorator="[ 'docType', {}]">
                  <a-radio class="radioGroup" value="1">普通文件</a-radio>
                  <a-radio class="radioGroup" value="2">盖章文件</a-radio>
                  <a-radio class="radioGroup" value="3">正式文件</a-radio>
                </a-radio-group>
                </a-form-item>
              </td>
              <td>
                文种
              </td>
              <td colspan="2" style="width:200px;text-align: left;padding-left: 10px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-select v-decorator="[ 'classification', {}]">
                    <a-select-option value="1">公告</a-select-option>
                    <a-select-option value="2">通知</a-select-option>
                  </a-select>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                缓急程度
              </td>
              <td colspan="2" style="width:200px;text-align: left;padding-left: 10px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-radio-group class="fontiframe" name="radioGroup" v-decorator="[ 'urgency', {}]">
                    <a-radio class="radioGroup" value="1">普通</a-radio>
                    <a-radio class="radioGroup" value="2">特急</a-radio>
                    <a-radio class="radioGroup" value="3">紧急</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <td>
                印刷份数
              </td>
              <td>
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'printScore', {}]"/>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                发文目标
              </td>
              <td colspan="2" style="width:260px;text-align: left;padding-left: 10px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-radio-group class="fontiframe" name="radioGroup" v-decorator="[ 'sendTarget', {}]" >
                    <a-radio class="radioGroup" value="1">公司内</a-radio>
                    <a-radio class="radioGroup" value="2">公司外</a-radio>
                    <a-radio class="radioGroup" value="3">子公司</a-radio>
                    <a-radio class="radioGroup" value="4">主公司</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <td>
                机密程度
              </td>
              <td colspan="2" style="width:200px;text-align: left;padding-left: 10px;">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-radio-group class="fontiframe" name="radioGroup" v-decorator="[ 'confidentiality', {}]">
                    <a-radio class="radioGroup" value="1">公开</a-radio>
                    <a-radio class="radioGroup" value="2">秘密</a-radio>
                    <a-radio class="radioGroup" value="3">机密</a-radio>
                    <a-radio class="radioGroup" value="4">绝密</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
            </tr>

            <tr>
              <td>
                机关代字
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input class="text" v-decorator="[ 'officeCode', {}]"/>
                </a-form-item>
              </td>
              <td>
                排序码
              </td>
              <td colspan="2">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-input-number class="text" v-decorator="[ 'orderNo', {}]"/>
                </a-form-item>
              </td>
            </tr>

            <tr>
              <td>
                主题词
              </td>
              <td colspan="5">
                <a-form-item
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol">
                  <a-textarea
                    v-decorator="[ 'theme', {}]"
                    style="resize:none;height:118px;font-size: 12px;border: 0px solid white;border-radius: 0px;margin-bottom: 0px;">

                  </a-textarea>
                </a-form-item>
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
            <tr>
              <td>
                成文日期
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
                    v-decorator="[ 'writtenDate', {}]"/>
                </a-form-item>
              </td>
              <td>
                审阅时间
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
                    v-decorator="[ 'reviewDate', {}]"/>
                </a-form-item>
              </td>
            </tr>
          </table>
        </a-card>
        </j-form-container>
      </a-form>
</template>

<script>
  import { httpAction,getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import store from '@/store'
  import JFormContainer from "../../../../../components/jeecg/JFormContainer.vue";

  export default {
    components: {JFormContainer},
    name: "JoaDocSendingForm",
    props: ['formData'],
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
          sm: { span: 25 },
        },
        nickname:"",
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
        },
        url: {
          queryById: "/joa/joaDocSending/queryById",
          edit: "/joa/joaDocSending/edit",
        },
      }
    },
    created () {
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
      add () {
        this.edit({docType:"1",classification:"1",urgency:"1",sendTarget:"1",confidentiality:'1'});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.nickname=store.getters.nickname;
        this.model.booker=store.getters.username;
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'docCode','officeCode','orderNo','title','theme','printScore','receiverName','docType','classification','urgency','sendTarget','confidentiality'))
          //时间格式化
          this.form.setFieldsValue({bookDate:this.model.bookDate?moment(this.model.bookDate):null})
          this.form.setFieldsValue({writtenDate:this.model.writtenDate?moment(this.model.writtenDate):null})
          this.form.setFieldsValue({reviewDate:this.model.reviewDate?moment(this.model.reviewDate):null})
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
            formData.updateTime = formData.updateTime?formData.updateTime.format('YYYY-MM-DD HH:mm:ss'):null;
            formData.bookDate = formData.bookDate?formData.bookDate.format('YYYY-MM-DD HH:mm:ss'):null;
            formData.writtenDate = formData.writtenDate?formData.writtenDate.format('YYYY-MM-DD HH:mm:ss'):null;
            formData.reviewDate = formData.reviewDate?formData.reviewDate.format('YYYY-MM-DD HH:mm:ss'):null;

            console.log(formData)
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
    box-shadow: 0px 0px 1px 1px #aaa,
    3px 0px 5px 0px #aaa,
    0px 4px 7px 0px #aaa;
  }

  #documentsIssuedTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
    font-size: 24px;;
  }

  #documentsIssueTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
    background-color: #ffffff;
  }

  #documentsIssueTable td {
    font-family: "微软雅黑";
    color: #000000;
  }

  #documentsIssueTable tr {
    height: 40px;
  }

  #documentsIssueTable .fontiframe {
    font-size: 12px;
  }

  #documentsIssueTable .ant-form-item {
    margin: 0px;
  }

  #documentsIssueTable .input .ant-input {
    border: 0px solid black !important;
    border-radius: 0px;
    display: inherit;
    background-color: #ffffff;
    margin: 0px auto;
    width: 100%;
    font-size: 12px;
    height: 38px;
  }

  #documentsIssueTable .ant-select-selection{
    background-color: #fff;
    border-radius: 0px;
    border: 0px solid #d9d9d9;
    border-top-width: 0px;
    height: 40px;
    padding-top: 4px;
  }


  #documentsIssueTable .text {
    border: 0px solid black !important;
    border-radius: 0px;
    background-color: #ffffff;
    margin: 0px auto;
    width: 100%;
    font-size: 12px;
    text-align: center;
    height: 38px;
  }

  #documentsIssueTable .colfirst {
    width: 90px;
  }

  #documentsIssueTable .colfour {
    width: 90px;
  }

  #documentsIssueTable .firstTr {
    width: 100px;
  }

  #documentsIssueTable .radioGroup {
    font-size: 12px;
  }

  #documentsIssueTable .smallText .ant-input-number-input {
    background-color: #FFFFFF;
    margin: 0px;
    border: 0px solid black !important;
    border-radius: 0px;
    font-size: 12px;
  }

  #documentsIssueTable .ant-input-number {
    border: 0px solid black !important;
    border-radius: 0px;
  }

  #documentsIssueTable .ant-upload-list{
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
