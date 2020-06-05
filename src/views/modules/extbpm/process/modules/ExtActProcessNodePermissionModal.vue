<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    destroyOnClose
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="表单类型">
          <a-select :disabled="formTypeDisabled" v-decorator="[ 'formType', {}]" placeholder="请选择表单类型" @change="handleFormTypeChange">
            <a-select-option value="1">Online表单</a-select-option>
            <a-select-option value="2">自定义表单</a-select-option>
            <a-select-option value="3">自定义开发</a-select-option>
          </a-select>
          <a-input hidden v-decorator="['processId', {}]" />
          <a-input hidden v-decorator="['processNodeCode', {}]" />
        </a-form-item>
        <template v-if="formTypeValue == '1'">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="表名">
            <a-select :disabled="formBizCodeDisabled" v-decorator="[ 'formBizCode', {}]" placeholder="请选择表名">
              <a-select-option v-for="(item, key) in formBizCodeList" :key="key" :value="item.formTableName">{{ item.formTableName }}</a-select-option>
            </a-select>
          </a-form-item>
          <!--<a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="表单字段">
            <a-select labelInValue v-model="tableFieldDefaultValue" placeholder="请选择表单字段" @change="handleTableFieldChange">
              <a-select-option v-for="(item, key) in tableFieldList" :key="key" :value="item.DB_FIELD_NAME">{{ item.DB_FIELD_TXT }}</a-select-option>
            </a-select>
            <a-input hidden v-decorator="['ruleName', {}]" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="规则编码">
            <a-input placeholder="请输入规则编码" v-decorator="['ruleCode', {}]" />
          </a-form-item>-->
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="规则编码">
            <a-input placeholder="请输入规则编码" v-decorator="['ruleCode', {}]" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="规则名称">
            <a-input placeholder="请输入规则名称" v-decorator="['ruleName', {}]" />
          </a-form-item>
        </template>
        <template  v-else-if="formTypeValue == '2'">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="表单编码">
            <a-select :disabled="formBizCodeDisabled" v-decorator="[ 'formBizCode', {}]" placeholder="请选择表单编码">
              <a-select-option v-for="(item, key) in formBizCodeList" :key="key" :value="item.formTableName">{{ item.formTableName }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="规则名称"
                       :labelCol="labelCol"
                       :wrapperCol="wrapperCol">
            <a-input-search placeholder="请选择授权规则" readOnly @search="handleSelect" v-decorator="['ruleName', {}]">
              <a-button slot="enterButton" icon="search">选择</a-button>
            </a-input-search>
            <a-input hidden v-decorator="['desformComKey', {}]" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="规则编码">
            <a-input placeholder="请选择规则编码" readOnly v-decorator="['ruleCode', {}]" />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="表名">
            <a-select :disabled="formBizCodeDisabled" v-decorator="[ 'formBizCode', {}]" placeholder="请选择表名">
              <a-select-option v-for="(item, key) in formBizCodeList" :key="key" :value="item.formTableName">{{ item.formTableName }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="规则编码">
            <a-input placeholder="请输入规则编码" v-decorator="['ruleCode', {}]" />
          </a-form-item>
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="规则名称">
            <a-input placeholder="请输入规则名称" v-decorator="['ruleName', {}]" />
          </a-form-item>
        </template>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="策略">
          <a-radio-group v-decorator="['ruleType', {}]">
            <a-tooltip placement="topLeft" title="显示的反向： 隐藏">
            <a-radio value="1">
              显示
            </a-radio>
            </a-tooltip>
            <a-tooltip placement="topLeft" title="禁用的反向： 可编辑">
            <a-radio value="2">
              禁用
            </a-radio>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">
           <span slot="label">
              状态&nbsp;
              <a-tooltip title="策略与状态组合使用实现表单控件的：显示、可编辑、隐藏、禁用?">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>

          <a-radio-group v-decorator="['status', {}]">
            <a-tooltip placement="topLeft" title="实现页面组件‘显示/禁用’功能">
            <a-radio value="1">
              正向有效
            </a-radio>
            </a-tooltip>
            <a-tooltip placement="topLeft" title="实现页面组件‘隐藏/可编辑’功能">
            <a-radio value="0">
              反向有效
            </a-radio>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>

      </a-form>
    </a-spin>

    <select-desform-auth-modal ref="selectDesformAuthModal" @selectFinished="selectAuthOK"></select-desform-auth-modal>
  </a-modal>
</template>

<script>
  import { httpAction,getAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import SelectDesformAuthModal from "./SelectDesformAuthModal.vue";

  export default {
    components: {SelectDesformAuthModal},
    name: "ExtActProcessNodePermissionModal",
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
        },
        url: {
          add: "/process/extActProcessNodePermission/add",
          edit: "/process/extActProcessNodePermission/edit",
          queryFormBizCodeByProcessid: "/process/extActProcessForm/queryFormBizCodeByProcessid",
          queryFormTypeByProcessid: "/process/extActProcessForm/queryFormTypeByProcessid",
          queryFieldByOnlineCode:"/process/extActProcessForm/queryFieldByOnlineCode",
        },
        formTypeValue:"1",
        formBizCodeList:[],
        formBizCodeValue:"",
        tableFieldList:[],
        formTypeDisabled:true,
        formBizCodeDisabled:false,
        processId:'',
        tableFieldDefaultValue:{},
      }
    },
    created () {
    },
    methods: {
      add (record) {
        this.processId = record.processId;
        //判断业务关联里面配置的表单类型
        var params = {processId:this.processId};//查询条件
        getAction(this.url.queryFormTypeByProcessid,params).then((res)=>{
          if(res.success){
            var formTypes = res.result;
            if(formTypes.length == 1){
              this.formTypeDisabled = true;
              this.edit({formType:formTypes[0],processId:record.processId,processNodeCode:record.processNodeCode,status:'1',ruleType:'1'});
            }else if(formTypes.length > 1){
              this.formTypeDisabled = false;
              this.edit({formType:formTypes[0],processId:record.processId,processNodeCode:record.processNodeCode,status:'1',ruleType:'1'});
            }else{
              this.formTypeDisabled = false;
              this.edit({formType:"1",processId:record.processId,processNodeCode:record.processNodeCode,status:'1',ruleType:'1'});
            }
          }else{
            this.formTypeDisabled = false;
            this.edit({formType:"1",processId:record.processId,processNodeCode:record.processNodeCode,status:'1',ruleType:'1'});
          }
        })

      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.formTypeValue = record.formType;
        this.formBizCodeValue = this.model.formBizCode;
        //if(record.formType=='2'){
          this.initFormBizCode(record.processId,record.formType);
        //}
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'formType','processId','processNodeCode','ruleType','status'));
          this.form.setFieldsValue(pick(this.model,'ruleCode','ruleName','formBizCode'));
          if(record.formType=='2'){
            this.form.setFieldsValue(pick(this.model,'desformComKey'));
          }
		      //时间格式化
        });
      },
      initFormBizCode(processId,formType){
        this.formBizCodeDisabled = false;
        var params = {processId:processId,formType:formType};//查询条件
        getAction(this.url.queryFormBizCodeByProcessid,params).then((res)=>{
          if(res.success){
            this.formBizCodeList = res.result;
            if(this.formBizCodeList.length>0){
              if(this.formBizCodeList.length==1){
                this.formBizCodeDisabled = true
              }
              if(this.formBizCodeValue){
                this.form.setFieldsValue({formBizCode:this.formBizCodeValue});
              }else{
                this.form.setFieldsValue({formBizCode:this.formBizCodeList[0].formTableName});
              }

              //if(formType=='1'){
              //  this.initTableField(this.formBizCodeList[0].formTableName);
              //}

            }
          }
        })
      },
      initTableField(tableName){
        var params = {tableName:tableName};//查询条件
        getAction(this.url.queryFieldByOnlineCode,params).then((res)=>{
          if(res.success){
            this.tableFieldList = res.result;
            if(this.tableFieldList.length>0){
              this.tableFieldDefaultValue =  {key:this.tableFieldList[0].DB_FIELD_NAME};
              this.form.setFieldsValue({ruleCode:this.tableFieldList[0].DB_FIELD_NAME});
              this.form.setFieldsValue({ruleName:this.tableFieldList[0].DB_FIELD_TXT});
            }
          }
        })
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
      handleFormTypeChange(value){
        this.formTypeValue = value;
        this.formBizCodeList = [];
        if(value=='2'){
          this.model.selectRuleName = "";
        }else{
          this.model.selectRuleName = "";
        }
        this.initFormBizCode(this.processId,value);
      },
      handleTableFieldChange(value){
        this.form.setFieldsValue({ruleCode:value.key});
        this.form.setFieldsValue({ruleName:value.label});
      },
      handleSelect: function(){
        var formBizCode = this.form.getFieldValue("formBizCode");
        this.$refs.selectDesformAuthModal.select(formBizCode);
      },

      selectAuthOK: function(data){
        this.model.selectRuleName = data.authTitle;
        this.form.setFieldsValue({ruleCode:data.authField});
        this.form.setFieldsValue({ruleName:data.authTitle});
        this.form.setFieldsValue({desformComKey:data.authComKey});
      },

    }
  }
</script>

<style scoped>

</style>