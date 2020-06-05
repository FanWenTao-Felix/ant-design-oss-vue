<template>
  <div>
    <a-form style="margin-top: 8px" :form="form">
      <j-form-container :disabled="online_form_disabled">
        <online-form-item :properties="rootProperties" slot="detail"></online-form-item>
      </j-form-container>
    </a-form>
    <a-tabs v-model="subActiveKey" :defaultActiveKey="0" v-if="hasTab">
      <a-tab-pane v-for="(sub,index) in subTabInfo" :tab="sub.describe" :key="index" :forceRender="true">

        <div style="overflow-y:auto;overflow-x:hidden;max-height: 300px;" v-if="sub.relationType==1">
          <j-form-container :disabled="online_form_disabled">
            <online-sub-form
              slot="detail"
              :ref="sub.key"
              :main-id="model.id"
              :table="sub.key"
              :properties="subProperties[sub.key]"
              @executeFillRule="handleExecuteFillRuleSub(sub,$event)" />
          </j-form-container>
        </div>

        <j-editable-table
          v-else
          :ref="sub.key"
          :loading="false"
          :columns="sub.columns"
          :dataSource="subDataSource[sub.key]"
          :maxHeight="300"
          :rowNumber="true"
          :rowSelection="true"
          :actionButton="true"
          @valueChange="event=>{handleValueChange(event,sub.key)}"
          @added="handleAdded"
          :disabled="online_form_disabled"
          @executeFillRule="handleExecuteFillRuleSub(sub,$event)"
        >
        </j-editable-table>
      </a-tab-pane>
    </a-tabs>

    <div style="width: 100%;text-align: center;margin-top:5px" v-if="showFooter">
      <a-button icon="check" style="width: 126px" type="primary" @click="handleSubmit" :loading="submitLoading">
        提交
      </a-button>
    </div>
  </div>
</template>

<script>
  import OnlineFormItem from './OnlineFormItem.vue'
  import OnlineSubForm from './OnlineSubForm.vue'

  import FormProperty from './model/FormProperty'
  import JEditableTable from '@/components/jeecg/JEditableTable'
  import JFormContainer from '@/components/jeecg/JFormContainer'
  import pick from 'lodash.pick'
  import debounce from 'lodash/debounce';
  import { getUploadFileList,getFilePaths } from './model/UploadFile'
  import { httpAction,getAction,postAction,deleteAction } from '@/api/manage'
  import { getRefPromise, validateFormAndTables, VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'
  import { duplicateCheck } from '@/api/api'
  import { onlUtil } from '@/mixins/OnlineCommonUtil'
  import lodash_object from 'lodash'
  import { loadFieldDefVal, loadFieldDefValForSubTable, ACTION_TYPES } from '@comp/online/autoform/model/FieldDefVal'

  export default {
    name: 'OnlineForm',
    mixins: [onlUtil],
    components:{
      JEditableTable,
      OnlineFormItem,
      OnlineSubForm,
      JFormContainer
    },
    provide(){
      return {
        sh:this.sh
      }
    },
    data(){
      return {
        form:this.$form.createForm(this,{"onValuesChange":this.onValuesChange}),
        online_form_disabled:false,
        lodash: lodash_object,
        rootProperties:[],
        subProperties:{

        },
        aaaca:[],
        subTabInfo:[],
        subDataSource:{
        },
        submitLoading:false,
        model:"",
        showFields:[],
        fileFields:[],
        url:"",
        urlButtonAction:'/online/cgform/api/doButton',
        submitMethod:"",
        hasTab:false,
        EnhanceJs:"",
        immediateEnhance:false,
        sh:{},
        tablename:"",
        //树形列表的信息保存
        treeListExpandKeys:[],
        // 一对多子表Tab的Key，用于校验未通过时自动跳转
        subActiveKey: 0,
      }
    },
    props:{
      formSchema:{
        type: Object,
        default:()=>{},
        required: true
      },
      uiSchema:{
        type: Object,
        default:()=>{},
        required: true
      },
      showFooter:{
        type:Boolean,
        default:false,
        required: false
      },
      single:{
        type:Boolean,
        default:true,
        required: false
      },
      tree:{
        type:Boolean,
        default:false,
        required: false
      },
      enhanceStr:{
        type:String,
        default:"",
        required: false
      }
    },
    created(){
      //TODO 如果觉得BUS不合适可以使用vuex
      this.treeListExpandKeys = []
      this.$bus.$on('popupCallbackMinitor', (row)=>{
        if(row){
          if(row.type==='treeListAddEvent'){
            this.treeListExpandKeys = row.expandedRowKeys
          }else{
            this.form.setFieldsValue(row)
          }
        }
      });
    },
    beforeDestroy () {
      this.$bus.$off('popupCallbackMinitor');
    },
    mounted(){
      this.createRootProperties()
    },
    methods:{
      createRootProperties(){
        console.log("===onlineForm表单组件走了哈 this.formSchema===",this.formSchema)
        this.tablename = this.formSchema.table
        const properties = this.formSchema.properties;
        const formTemplate = this.uiSchema.formTemplate
        let rootProperties = [],subInfo=[]
        let subDataSourceKeys = []
        Object.keys(properties).map((key) => {
          const item = properties[key];
          const uiItem = this.uiSchema[key];
          if(item.view=='tab'){
            subInfo.push(item)
            if(item.relationType==1){
              this.initSubProperties(item,key)
            }else{
              subDataSourceKeys.push({ key, order: item.order })
            }
          }else{
            this.$set(this.sh,key,true)
            this.$set(this.sh,key+"_load",true)
            let fp = new FormProperty(key, item, uiItem, this.formSchema.required,formTemplate)
            fp.checkOnlyMethod = debounce(this.checkOnlyFieldValue, 1000);
            rootProperties.push(fp)
          }
        });
        // update--begin--author:sunjianlei-----date:20200313------for：使 subDataSource 的顺序和 subTabInfo 的顺序保持一致 ------
        this.subDataSource = {}
        subDataSourceKeys.sort((one, next) => one.order - next.order).forEach(item => {
          this.subDataSource[item.key] = []
        })
        // update--end--author:sunjianlei-----date:20200313------for：使 subDataSource 的顺序和 subTabInfo 的顺序保持一致 ------
        rootProperties.sort((one,next)=>{return one.formSchema.order-next.formSchema.order; })
        this.rootProperties = [...rootProperties]
        if(subInfo.length>0){
          this.hasTab=true
          subInfo.sort((one,next)=>{return one.order-next.order; })
          this.subTabInfo=[...subInfo]
        }else{
          this.hasTab=false
          this.subTabInfo=[]
        }
        //设置pca组件的位置
        this.pcaOptionPositionSetting();
      },
      initSubProperties(formSchema,tbname){
        const formTemplate = this.uiSchema.formTemplate
        let subProperties=[]
        let showOrHidden = {}
        Object.keys(formSchema.properties).map((key) => {
          const item = formSchema.properties[key];
          showOrHidden[key]=true
          showOrHidden[key+"_load"]=true
          let fp = new FormProperty(key, item, '', formSchema.required,formTemplate)
          fp.subKey=tbname
          subProperties.push(fp)
        });
        this.$set(this.sh,tbname,showOrHidden)
        subProperties.sort((one,next)=>{return one.formSchema.order-next.formSchema.order; })
        this.subProperties[tbname] = subProperties
        this.aaaca = [...subProperties]
      },
      add(param){
        this.show();
        this.model = ""
        Object.keys(this.subDataSource).forEach(key=>{
          this.subDataSource[key] = []
        });
        this.$nextTick(() => {
          if(param){
            console.log("param",param)
            this.form.setFieldsValue(param);
          }
          this.initFileFieldsValue({})
          this.immediateEnhance = true
        });
        // 加载组件默认值
        this.loadMainFieldDefVal(ACTION_TYPES.ADD)
      },
      edit(record){
        this.initFormData(record).then(()=>{
          this.immediateEnhance = true
        })
        this.loadMainFieldDefVal(ACTION_TYPES.EDIT)
      },
      detail(record){
        this.initFormData(record).then(()=>{
          this.immediateEnhance = true
          this.online_form_disabled=true
        })
      },
      initFormData(record){
        //console.log("wawaa",this.online_form_disabled)
       return new Promise((resolve) => {
          this.show(record);
          this.model = Object.assign({}, record);
          console.log("-------------------")
          console.log("当前展示字段",this.showFields);
          console.log("当前编辑数据记录",this.model);
          console.log("-------------------")
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,...this.showFields))
            this.initFileFieldsValue(record)
            Object.keys(this.subDataSource).forEach(key=>{
              this.subDataSource[key] = this.model[key]
            });

            resolve()
          });
        })
      },
      show(rd){
        this.clearForm()
        this.url = this.uiSchema.url
        this.submitMethod = this.uiSchema.method
        let currFormShowFields = [],currFileFields=[];
        const properties = this.formSchema.properties;
        let link_down_flag = false;
        Object.keys(properties).forEach(function(key){
          const item = properties[key];
          if(item.view=='link_down'){
            link_down_flag = true;
            return true;
            /*if(item.others && item.others.length>0){
              for(let other of item.others){
                currFormShowFields.push(other.field)
              }
            }*/
          }

          if(item.view.indexOf("upload")>=0||item.view.indexOf("file")>=0||item.view.indexOf("image")>=0){
            currFileFields.push(key)
          }else if(!item.hidden){
            if(item.view!='tab'){
              currFormShowFields.push(key)
            }
          }
        })
        if(rd && link_down_flag===true){
          this.$bus.$emit('formInitDataSuccess', rd);
        }
        this.showFields = [...currFormShowFields]
        this.fileFields = [...currFileFields]
        console.log("this.enhanceStr",this.enhanceStr)
        if(this.enhanceStr){
          let Obj = eval ("(" + this.enhanceStr + ")");
          this.EnhanceJS = new Obj(getAction,postAction,deleteAction);
          this.cgButtonJsHandler('show')
        }
      },

      clearForm(){
        this.online_form_disabled=false
        this.form.resetFields();
        this.model="";
        this.showFields=[];
        this.fileFields=[];
        this.immediateEnhance=false;
        this.subActiveKey = 0
      },

      initFileFieldsValue(record){
        if(this.fileFields && this.fileFields.length>0){
          for(var a=0;a<this.fileFields.length;a++){
            let fieldKey = this.fileFields[a];
            let fileVal = {}
            fileVal[fieldKey] = getUploadFileList(record[fieldKey])
            this.form.setFieldsValue(fileVal);
          }
        }
      },

      transFileListToString(values){
        if(this.fileFields && this.fileFields.length>0){
          for(var a=0;a<this.fileFields.length;a++){
            let fieldKey = this.fileFields[a];
            let path = getFilePaths(values[fieldKey])
            values[fieldKey] = path
          }
        }
      },

      handleSubmit(){
        if(this.single){
          this.handleSingleSubmit()
        }else{
          this.handleOne2ManySubmit()
        }
      },
      handleApplyRequest(formData){
        Object.keys(formData).map(key=>{
          if(Array.isArray(formData[key])){
            if(formData[key].length==0){
              formData[key] = ''
            }
          }
        })
        httpAction(this.url,formData,this.submitMethod).then((res)=>{
          console.log(res)
          if(res.success){
            if(this.tree===true){
              this.$emit("onSuccess",formData,this.treeListExpandKeys)
            }else{
              this.$emit("onSuccess",formData)
            }
            this.$message.success(res.message)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      getHandleRefs(arr){
        let arr2 = []
        if(arr && arr.length>0){
          arr.forEach(item=>{
            if(Array.isArray(item)){
              arr2.push(item[0])
            }else{
              arr2.push(item)
            }
          })
        }
        return arr2
      },
      handleOne2ManySubmit(){
        this.getAllSubFormOrTable().then(tables => {
          let arr = this.getHandleRefs(tables)
          if(arr && arr.length>0){
            return validateFormAndTables(this.form, arr)
          }else{
            return new Promise((resolve, reject) => {
              this.form.validateFields((err, values) => {
                err ? reject() : resolve({"formValue":values})
              })
            })
          }
        }).then(allValues => {
          let formData = Object.assign({},this.model,allValues.formValue)
          this.transFileListToString(formData)
          if(allValues.tablesValue){
            let keys = Object.keys(this.subDataSource);
            for(let a=0;a<keys.length;a++){
              formData[keys[a]] = allValues.tablesValue[a].values
            }
          }
          return Promise.resolve(formData)
        }).then((formData)=>{
          this.getAllSubFormOrTable(1).then(forms=>{
            let needForms = this.getHandleRefs(forms)
            if(needForms && needForms.length>0){
              return this.validFormsCust(needForms,formData)
            }else{
              return Promise.resolve(formData)
            }
          }).then(formData=>{
            console.log("----提交的表单数据为----",formData)
            this.handleApplyRequest(formData)
          })
        }).catch(e => {
          if (e && e.error === VALIDATE_NO_PASSED) {
            if (typeof e.index === 'number') {
              this.subActiveKey = e.index
              console.warn(`Online第个${e.index + 1}子表未校验通过`)
            } else {
              console.warn('Online主表未校验通过')
            }
          } else {
            console.error(e)
          }
        })
      },
      handleSingleSubmit(){
        this.form.validateFields((err, values) => {
          if (!err) {
            this.transFileListToString(values)
            let formData = Object.assign({},this.model,values)
            console.log("提交的表单数据为",formData)
            this.handleApplyRequest(formData)
          }
        })
      },
      getAllSubFormOrTable(arg) {
        let arr = [];
        const that = this
        for(let i of that.subTabInfo){
          if(arg==1){
            if(i.relationType==1){
              arr.push(getRefPromise(that, i.key))
            }
          }else{
            if(i.relationType!=1){
              arr.push(getRefPromise(that, i.key))
            }
          }
        }
        return Promise.all(arr)
      },
      triggleChangeValues(values,id,target){
        if(id && target){
          target.setValues([{
            rowKey:id,
            values: values
          }])
        }else{
          this.form.setFieldsValue(values)
        }
      },
      triggleChangeValue(ifield,value){
        let oo = {}
        oo[ifield] = value
        this.form.setFieldsValue(oo)
      },
      handleValueChange(event,tableKey){
        if(this.EnhanceJS && this.EnhanceJS[tableKey+"_onlChange"]){
          let tableChangeObj = this.EnhanceJS[tableKey+"_onlChange"]();
          if(tableChangeObj[event.column.key]){
            tableChangeObj[event.column.key](this,event);
          }
        }
      },
      cgButtonJsHandler(buttonCode){
        if(this.EnhanceJS && this.EnhanceJS[buttonCode]){
          this.EnhanceJS[buttonCode](this)
        }
      },
      onValuesChange(v,valueObj){
        if(!this.EnhanceJS || !this.EnhanceJS["onlChange"] || this.immediateEnhance === false){
          return false
        }
        let columnKey = Object.keys(valueObj)[0]
        if(!columnKey){
          return false
        }
        let value = valueObj[columnKey]
        let tableChangeObj = this.EnhanceJS["onlChange"]();
        if(tableChangeObj[columnKey]){
          let event = {
            row:this.form.getFieldsValue(),
            column:{key:columnKey},
            value:value
          }
          tableChangeObj[columnKey](this,event);
        }
      },
      clearThenAddRows(subKey,rows){
        this.clearSubRows(subKey)
        this.addSubRows(subKey,rows)
      },
      addSubRows(subKey,rows){
        if(!rows){
          return false
        }
        if(typeof rows == 'object'){
          if(Array.isArray(rows)){
            for(let i of rows){
              this.$refs[subKey][0].push(i)
            }
          }else{
            this.$refs[subKey][0].push(rows)
          }
        }else{
          this.$message.error("你脑壳瓦钓了,传的什么参数!")
        }
      },
      clearSubRows(subKey){
        let rows = this.subDataSource[subKey]
        if(!rows || rows.length==0){
          return false
        }
        let ids = []
        for(let i of rows){
          ids.push(i.id)
        }
        this.$refs[subKey][0].removeRows(ids)
      },
      handleCgButtonClick(optType,buttonCode,cgConfigId){
        if("js"==optType){
          if(this.EnhanceJS[buttonCode]){
            this.EnhanceJS[buttonCode](this)
          }
        }else if("action"==optType){
          let params = {
            formId:cgConfigId,
            buttonCode:buttonCode,
            dataId:this.model.id,
            uiFormData: Object.assign({},this.model,this.form.getFieldsValue())
          }
          console.log("自定义按钮请求后台参数：",params)
          postAction(this.urlButtonAction,params).then(res=>{
            if(res.success){
              this.$message.success("处理完成!")
            }else{
              this.$message.warning("处理失败!")
            }
          })

        }
      },
      checkOnlyFieldValue(rule,value,callback){
        let param = {
          tableName:this.tablename,
          fieldName:rule.field,
          fieldVal:value,
        }
        if(this.model.id){
          param.dataId = this.model.id
        }
        //console.log("校验checkOnlyFieldValue---》",param)
        duplicateCheck(param).then((res)=>{
          if(res.success){
            callback();
          }else{
            callback(res.message);
          }
        });
      },

      validFormsCust(formRefs,formdata){
        return new Promise((resolve, reject) => {
          let index = 0;
          (function next() {
            let vm = formRefs[index]
            vm.getAll().then(all => {
              Object.assign(formdata,all)
              if (++index === formRefs.length) {
                resolve(formdata)
              } else (
                next()
              )
            }, error => {
              reject(error)
            })
          })()
        })
      },
      // update-begin--author:sunjianlei --- date:20191111 --- for: 新增填值规则支持 -----------
      loadMainFieldDefVal(action) {
        loadFieldDefVal({
          form: this.form,
          properties: this.rootProperties,
          action: action,
          getFormData: () => this.form.getFieldsValue()
        })
      },
      loadSubFieldDefVal(subForms, subTable, row, action) {
        loadFieldDefValForSubTable({
          subForms: subForms,
          subTable: subTable,
          row: row,
          action: action,
          getFormData: () => {
            let sub = {}
            if (subForms.form) {
              sub = subForms.form.getFieldsValue()
            } else {
              sub = subForms.jet.getValuesSync({ validate: false, rowIds: [row.id] }).values[0]
            }
            return { main: this.form.getFieldsValue(), sub: sub }
          }
        })
      },
      /** 供 js 增强调用：重新执行主表的填值规则  */
      executeMainFillRule() {
        this.$nextTick(() => {
          this.loadMainFieldDefVal(ACTION_TYPES.RELOAD)
        })
      },
      /**
       *  供 js 增强调用：重新执行子表的填值规则
       * @param subKey 子表 key
       * @param event 子表onChange事件传递的 event
       */
      executeSubFillRule(subKey, event) {
        this.$nextTick(() => {
          this.subTabInfo.forEach(subTable => {
            if (subTable.key === subKey) {
              let { row, form, target } = event
              this.loadSubFieldDefVal({ jet: target, form }, subTable, row, ACTION_TYPES.RELOAD)
            }
          })
        })
      },
      // 当行编辑新增完成后触发的事件
      handleAdded(event) {
        event.target.$emit('executeFillRule', event)
      },
      handleExecuteFillRuleSub(subTable, event) {
        let { row, form, target } = event
        this.loadSubFieldDefVal({ jet: target, form }, subTable, row, ACTION_TYPES.ADD)
      },
      // update-end--author:sunjianlei --- date:20191111 --- for: 新增填值规则支持 -----------

      // 设置外键的值 这个很重要
      setForeignKeysValue(obj){
        //console.log("外键的值",obj)
        this.$nextTick(()=>{
          this.form.setFieldsValue(obj)
        })
      },
      //改变下拉项
      changeOptions(field,options){
        for(let item of this.rootProperties){
          if(item.key === field){
            item.initOptions(options);
          }
        }
      },
      //获取下拉项
      getSelectOptions(field){
        for(let item of this.rootProperties){
          if(item.key === field){
            return item.listSource;
          }
        }
      },
      pcaOptionPositionSetting(){
        this.$nextTick(()=>{
          let getOffsetTopByBody = (el)=>{
            let offsetTop = 0
            while (el && el.tagName !== 'BODY') {
              offsetTop += el.offsetLeft
              el = el.offsetParent
            }
            return offsetTop
          }
          setTimeout(()=>{
            let obj = document.getElementById('pca');
            if(obj){
              let modal = document.querySelector('.jeecg-online-modal')
              let num = Number(getOffsetTopByBody(obj)) - Number(getOffsetTopByBody(modal)) + 480 - Number(modal.offsetWidth)
              if( num> 0){
                document.querySelector(' #pca .cascader-menu-list-wrap').style.left = (0-num-10)+'px'
                document.querySelector(' #pca .cascader-menu-list-wrap').style.top = '30px'
              }
            }
          },1000)
        })
      }

    }
  }
</script>
