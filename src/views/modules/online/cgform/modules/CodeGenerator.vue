<template>
  <a-modal
    :title="title"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="取消"
    okText="生成代码"
    wrapClassName="ant-modal-cust-warp"
    style="top:5%;height: 95%;">

    <a-form :form="form">
      <a-row :gutter="24">

        <a-col :span="24">
          <a-form-item label="代码生成目录" :labelCol="!single?labelCol2:labelCol" :wrapperCol="!single?wrapperCol2:wrapperCol">
            <a-input-search @change="storeProjectPath" v-decorator="['projectPath', validatorRules.projectPath]" placeholder="请选择代码生成目录" @search="onSelectDir" :disabled="isDisabledAuth('online:codeGenerate:projectPath')">
              <a-button slot="enterButton" icon="folder-open" :disabled="isDisabledAuth('online:codeGenerate:projectPath')">浏览</a-button>
            </a-input-search>
          </a-form-item>
        </a-col>

        <a-col :span="!single?12:24">
          <a-form-item label="页面风格" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select v-decorator="['jspMode']">
              <a-select-option v-for="(item,index) in jspModeList" :value="item.code" :key="index">{{ item.note }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="!single?12:24">
          <a-form-item label="功能说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['ftlDescription',validatorRules.ftlDescription]" placeholder="请输入功能说明"></a-input>
          </a-form-item>
        </a-col>

        <a-col :span="!single?12:24" v-show="false">
          <a-form-item label="数据模型" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select v-decorator="['jformType']" disabled>
              <a-select-option value="1">单表</a-select-option>
              <a-select-option value="2">一对多</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="!single?12:24">
          <a-form-item label="表名" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input readOnly v-decorator="['tableName_tmp',validatorRules.tableName_tmp]" placeholder="请输入表名"></a-input>
          </a-form-item>
        </a-col>

        <a-col :span="!single?12:24">
          <a-form-item label="实体类名" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['entityName',validatorRules.entityName]" placeholder="请输入实体类名(首字母大写)"></a-input>
          </a-form-item>
        </a-col>

        <a-col :span="!single?12:24">
          <a-form-item label="包名(小写)" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input v-decorator="['entityPackage',validatorRules.entityPackage]" placeholder="请输入包名"></a-input>
          </a-form-item>
        </a-col>

        <a-col :span="!single?12:24">
          <a-form-item label="代码分层样式" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select v-decorator="['packageStyle']" disabled>
              <a-select-option value="service">业务分层</a-select-option>
              <a-select-option value="project">代码分层</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="24" v-show="false">
          <a-form-item label="需要生成的代码" :labelCol="!single?labelCol2:labelCol" :wrapperCol="wrapperCol">
            <j-checkbox v-decorator="['codeTypes']" :trigger-change="true" :options="genCodeTypes"></j-checkbox>
          </a-form-item>
        </a-col>
      </a-row>

      <a-card title="子表信息" v-if="subInfoList && subInfoList.length>0" :class="{'online-gen-subinfo':true}">
        <a-row v-for="(item,index) in subInfoList" :key=" 'sub'+index ">
          <a-col :span="8">
            <a-form-item label="子表名" :labelCol="subLabelCol" :wrapperCol="subWrapperCol">
              <a-input :readOnly="true" v-decorator="['subList['+index+'].tableName',{initialValue:item.tableName,rules: [{required: true, message: '请输入子表名!'}]}]" placeholder="请输入子表名"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="子表实体" :labelCol="subLabelCol" :wrapperCol="subWrapperCol">
              <a-input v-decorator="['subList['+index+'].entityName',{initialValue:getCamelCase(item.tableName),rules: [{required: true, message: '请输入子表实体!'}]}]" placeholder="请输入子表实体"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="功能说明" :labelCol="subLabelCol" :wrapperCol="subWrapperCol">
              <a-input v-decorator="['subList['+index+'].ftlDescription',{initialValue:item.tableTxt,rules: [{required: true, message: '请输入功能说明!'}]}]" placeholder="请输入功能说明"></a-input>
            </a-form-item>
          </a-col>

         <!-- <a-col :span="6" v-show="false">
            <a-form-item label="子包名" :labelCol="subLabelCol" :wrapperCol="subWrapperCol">
              <a-input v-decorator="['subList['+index+'].entityPackage',{rules: [{required: true, message: '请输入子包名!'}]}]" placeholder="请输入子包名(小写)"></a-input>
            </a-form-item>
          </a-col>-->

        </a-row>
      </a-card>

    </a-form>

    <file-select-modal ref="fsm" @callback="updateFileDir"></file-select-modal>

    <!-- 生成结果提示页面 -->
    <a-modal title="代码生成 成功了！" :visible="generateLogVisible" :width="1200" @cancel="generateLogVisible=false">
      <template slot="footer">
        <a-button key="back" @click="handleGenerateOk">下载到本地</a-button>
        <a-button key="cancel" @click="generateLogVisible=false">取消</a-button>
        <a-button key="submit" type="primary" @click="generateLogVisible=false">确认关闭</a-button>
      </template>
      <p style="line-height: 10px;" v-for="(item, index) in generateLogList" :key="index">{{ item }}</p>
    </a-modal>
  </a-modal>
</template>

<script>
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import { getAction,postAction } from '@/api/manage'
  import FileSelectModal from './FileSelectModal.vue'
  import JCheckbox from '@/components/jeecg/JCheckbox.vue';
  import { underLine2CamelCase } from '@/utils/util'
  import ARow from 'ant-design-vue/es/grid/Row'
  import ACol from 'ant-design-vue/es/grid/Col'
  import { downFile } from '@/api/manage'
  import {DisabledAuthFilterMixin} from '@/mixins/DisabledAuthFilterMixin'

  const jeecg_onl_project_path = "jeecg_onl_project_path"
  export default {
    name: 'CodeGenerator',
    components: { ACol, ARow, ATextarea,FileSelectModal,JCheckbox },
    mixins: [DisabledAuthFilterMixin],
    data(){
      return {
        modalWidth:800,
        title:"代码生成",
        visible:false,
        confirmLoading:false,
        form:this.$form.createForm(this),
        subLabelCol:{
          xs: { span: 24 },
          sm: { span:8},
        },
        subWrapperCol:{
          xs: { span: 24 },
          sm: { span: 15 },
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span:6 },
        },
        labelCol2:{
          xs: { span: 24 },
          sm: { span:3 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
        genCodeTypes:[{
          label:"controller",
          value:"controller"
        },{
          label:"service",
          value:"service"
        },{
          label:"dao",
          value:"dao"
        },{
          label:"mapper.xml",
          value:"mapper"
        },{
          label:"entity",
          value:"entity"
        },{
          label:"vue",
          value:"vue"
        }],
        validatorRules:{
          projectPath:{
            rules: [{
              required: true, message: '请选择代码生成目录!',
            }],
          },
          tableName_tmp:{
            rules: [{
              required: true, message: '请输入表名!',
            }],
          },
          entityPackage:{
            rules: [{
              required: true, message: '请输入包名!',
            }],
          },
          entityName:{
            rules: [{
              required: true, message: '请输入实体类名!',
            }],
          },
        },
        url:{
          tableInfo:"/online/cgform/head/tableInfo",
          codeGenerate:"/online/cgform/api/codeGenerate",
          downGenerateCode:"/online/cgform/api/downGenerateCode"
        },
        code:"",
        subInfoList:[],
        single:false,
        metaModel:{
          projectPath:"",
          packageStyle:"service",
          jspMode:"",
          jformType:"1",
          tableName_tmp:"",
          ftlDescription:"",
          entityName:"",
          codeTypes:"controller,service,dao,mapper,entity,vue"
        },
        model:{},
        jspModeList:[],
        //生成结果提示页面，所用参数
        generateLogList:[],
        generateLogVisible:false,
        generateTableName:''
      }
    },
    methods:{
      handleSubmit(){
        let that = this
        this.form.validateFields((err, values) => {
          if (!err) {
            this.confirmLoading=true
            console.log(values)
            let formdata = Object.assign({},values,{code:this.code,tableName:values.tableName_tmp})
            postAction(this.url.codeGenerate,formdata).then(res=>{
              if(res.success){
                this.handleCancel()
                //生成结果提示代码
                that.generateLogList = res.result;
                that.generateLogVisible = true
                that.generateTableName = values.tableName_tmp
                //this.$message.success("提示：代码生成成功！",0)
              }else{
                this.$message.warning(res.message)
              }
              this.confirmLoading=false
            })
          }
        })
      },
      handleCancel(){
        this.visible = false
      },
      /**
       * 下载生成代码
       */
      handleGenerateOk() {
        this.generateLogVisible = false
        var params = {
          fileList: encodeURI(this.generateLogList)
        };
        downFile(this.url.downGenerateCode, params).then((data) => {
          if (!data || data.size==0) {
            this.$message.warning("导出代码失败！")
            return
          }
          let fileName = '导到生成代码_' + this.generateTableName + "_" +new Date().getTime() + '.zip'
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(new Blob([data], {type: 'application/zip'}), fileName)
          } else {
            let url = window.URL.createObjectURL(new Blob([data], {type: 'application/zip'}))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link); //下载完成移除元素
            window.URL.revokeObjectURL(url); //释放掉blob对象
          }
        })
      },
      show(code){
        this.confirmLoading=false
        this.visible=true
        this.getStoreProjectPath()
        //当前主表ID
        this.code=code
        this.subInfoList=[]
        this.model=Object.assign({},this.metaModel)
        this.modalWidth=800
        getAction(this.url.tableInfo,{code:code}).then(res=>{
          if(res.success){
            let mainInfo = res.result.main
            this.jspModeList=[...res.result.jspModeList]
            if(mainInfo.isTree=='Y'){
              this.model.jspMode='tree'
            }else{
              this.model.jspMode=this.jspModeList[0].code
            }
            this.single = mainInfo.tableType==1
            this.title = "代码生成【"+mainInfo.tableName+"】"
            if(!this.model.projectPath){
              this.model.projectPath=res.result.projectPath
              window.localStorage.setItem(jeecg_onl_project_path,res.result.projectPath)
            }
            this.model.jformType = mainInfo.tableType+'';
            this.model.tableName_tmp = mainInfo.tableName
            this.model.ftlDescription = mainInfo.tableTxt
            let tempentyame = underLine2CamelCase(mainInfo.tableName)
            this.model.entityName = tempentyame.substring(0, 1).toUpperCase() + tempentyame.substring(1)
            this.$nextTick(() => {
              this.form.setFieldsValue(this.model)
            });
            if(res.result.sub && res.result.sub.length>0){
              this.subInfoList=res.result.sub
              this.modalWidth=1200
            }
          }else{
            this.$message.warning("表信息加载失败")
          }
        })
      },

      onSelectDir(){
        this.$refs.fsm.show()
      },
      updateFileDir(url){
       this.form.setFieldsValue({
         projectPath:url
       })
      },
      getCamelCase(val){
        let tempentyame = underLine2CamelCase(val)
        return tempentyame.substring(0, 1).toUpperCase() + tempentyame.substring(1)
      },
      storeProjectPath(e){
        if(e.target.value)
        window.localStorage.setItem(jeecg_onl_project_path,e.target.value)
      },
      getStoreProjectPath(){
        let path = window.localStorage.getItem(jeecg_onl_project_path)
        if(path){
          this.metaModel.projectPath = path
        }
      }
    }
  }
</script>

<style scoped>
  .online-gen-subinfo .ant-card-body{
    padding:18px 5px 0px 5px
  }

  .online-gen-subinfo .ant-card-head{
    min-height: 32px;
  }
  .online-gen-subinfo .ant-card-head-title{
    padding:8px 0;
  }
  .ant-select-disabled .ant-select-selection {
    background-color: #fff;color:#00000094
  }

</style>