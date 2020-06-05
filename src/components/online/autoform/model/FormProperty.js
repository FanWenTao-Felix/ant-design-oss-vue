/**
 * 表单属性对象
 */
export default class FormProperty {

  _formData={};

  get formData(){
    return this._formData
  }

  set formData(formData){
    this._formData = formData;
  }
  /**
   *
   * @param propertyId string
   * @param formSchema DFSchema
   * @param uiSchema DFUISchemaItem
   * @param required string[] = []
   * @param commonItemAttrs 表单通用的attr
   */
  constructor(propertyId,formSchema,uiSchema,required,commonItemAttrs) {
    this._propertyId = propertyId;
    this._formSchem = formSchema;
    this._uiSchema = uiSchema;
    this._required = !required?[]:required;
    this._commonItemattrs = commonItemAttrs;
    this.sub_key=''
  }

  sub_key=""
  get subKey(){
    return this.sub_key
  }
  set subKey(value){
    this.sub_key = value
  }

  /**
   * 返回key input,date,select ...
   * @returns {*}
   */
  get key(){
    return this._propertyId;
  }

  get id(){
    return `$$${this._propertyId}`;
  }

  /*--------popup 三件套----------*/
  get popupCode(){
    return this.formSchema.code;
  }
  get destFields(){
    return this.formSchema.destFields;
  }
  get orgFields(){
    return this.formSchema.orgFields;
  }
  /*--------popup 三件套----------*/

  /*--------字典信息--------------*/
  get dictCode(){
    return this.formSchema.dictCode;
  }
  get dictTable(){
    return this.formSchema.dictTable;
  }
  get dictText(){
    return this.formSchema.dictText;
  }
  /*--------字典信息--------------*/

  /*--------树形下拉--------------*/
  get dict(){
    return this.formSchema.dict;
  }
  get pidField(){
    return this.formSchema.pidField;
  }
  get pidValue(){
    return this.formSchema.pidValue;
  }
  get hasChildField(){
    return this.formSchema.hasChildField;
  }
  get textField(){
    return this.formSchema.textField;
  }
  /*--------树形下拉--------------*/

  get formSchema(){
    if (this._formSchem == null) {
      return {};
    }
    return this._formSchem;
  }

  get uiSchema(){
    const itemui= this.formSchema.ui;
    const ui = this._uiSchema;
    return {
      ...itemui,
      ...ui,
    };
  }

  _onlyInteger=false
  get onlyInteger(){
    return this._onlyInteger
  }
  set onlyInteger(value){
    this._onlyInteger = value
  }

  get type() {
    if (this.uiSchema.view) {
      return this.uiSchema.view;
    }
    return this.formSchema.view;
  }

  get formitemAttrs() {
    const attrs = this.itemAttrs;
    attrs.fieldDecoratorId = this.key;
    attrs.fieldDecoratorOptions = this.fieldDecoratorOptions;
    return attrs;
  }

  get itemAttrs() {
    return {
      ...this.commonItemattrs,
      ...this.ui.itemattrs
    }
  }

  get widgetAttrs() {
    return this.ui.widgetattrs;
  }

  get ui(){
    return {
      ...this.formSchema.ui,
      ...this.uiSchema,
    }
  }

  get label(){
    if (this.formSchema.title) {
      return this.formSchema.title;
    }
    if (this.uiSchema.widgetattrs && this.uiSchema.widgetattrs.label) {
      return this.uiSchema.widgetattrs.label;
    }
    return this.key;
  }

  //TODO 数据字典
  get listSource(){
    if (!this.formSchema.enum) {
      return [];
    }
    let arr = this.formSchema.enum
    for(let a=0;a<arr.length;a++){
      if(!arr[a].label){
        arr[a].label = arr[a].text
      }
      //如果字段类型是数字 那么下拉选项转成int即可
      if(this.formSchema.type == 'number'){
        arr[a].value = parseInt(arr[a].value);
      }
    }
    //console.log("数据字典",arr)
    return arr;

  }

  get placeholder(){
    let viewType = this.type;
    let label = this.label;
    if(viewType.indexOf('date')>=0||viewType.indexOf('select')>=0){
      return "请选择"+label
    }else if(viewType.indexOf('upload')>=0 || viewType.indexOf('file')>=0 || viewType.indexOf('image')>=0){
      return "请上传"+label
    }else{
      return "请输入"+label
    }
  }

  get span24(){
    let viewType = this.type;
    return viewType.indexOf('markdown')>=0 || viewType.indexOf('upload')>=0 || viewType.indexOf('file')>=0 || viewType.indexOf('image')>=0 || viewType.indexOf('textarea')>=0 || viewType.indexOf('umeditor')>=0
  }
  get colAttrs(){
    if(this.span24){
      return {span:24}
    }
    // update--begin--author:sunjianlei-----date:20200228------for：小屏幕下无论如何都单排排列 #LOWCOD-42 ------
    if("1"==this._commonItemattrs){
      return {xs:24, md:24}
    }else if("2"==this._commonItemattrs){
      return {xs:24, md:12}
    }else if("3"==this._commonItemattrs){
      return {xs:24, md:8}
    }else if("4"==this._commonItemattrs){
      return {xs:24, md:6}
    }
    // update--end--author:sunjianlei-----date:20200228------for：小屏幕下无论如何都单排排列 #LOWCOD-42 ------、
    return {
      xs:24,
      sm:24,
      md:12,
      lg:12,
      xl:8,
      xxl:6
    }
  }

  get commonItemattrs(){
    let isSpan24 = this.span24
    if("1"==this._commonItemattrs){
      return {labelCol: {xs:24,sm:4,md:4,lg:4,xl:4,xxl:4},wrapperCol: {xs:24,sm:18,md:18,lg:18,xl:18,xxl:18}}
    }else if("2"==this._commonItemattrs){
      if(!isSpan24){
        return {labelCol: {xs:24,sm:4,md:4,lg:4,xl:4,xxl:4 },wrapperCol: {xs:24,sm:19,md:19,lg:19,xl:19,xxl:19}}
      }else{
        return {labelCol: {sm:2,md:2,lg:2,xl:2,xxl:2, xs:24},wrapperCol: {sm:21,md:21,lg:21,xl:21,xxl:21, xs:24}}
      }
    }else if("3"==this._commonItemattrs){
      if(!isSpan24){
        return {labelCol: {sm:6,md:6,lg:6,xl:6,xxl:6, xs:24},wrapperCol: {sm:17,md:17,lg:17,xl:17,xxl:17, xs:24}}
      }else{
        return {labelCol: {sm:2,md:2,lg:2,xl:2,xxl:2, xs:24},wrapperCol: {sm:21,md:21,lg:21,xl:21,xxl:21, xs:24}}
      }
    }else if("4"==this._commonItemattrs){
      if(!isSpan24){
        return {labelCol: {xs:24,sm:4,md:4,lg:4,xl:4,xxl:4},wrapperCol: {xs:24,sm:18,md:18,lg:18,xl:18,xxl:18}}
      }else{
        return {labelCol: {xs:24,sm:1,md:1,lg:1,xl:1,xxl:1},wrapperCol: {sm:22,md:22,lg:22,xl:22,xxl:22, xs:24}}
      }
    }else{
      if(!isSpan24){
        return {
          labelCol: {
            xs:24,sm:4,md:4,lg:4,xl:6,xxl:4
          },
          wrapperCol: {
            xs:24,sm:18,md:19,lg:19,xl:17,xxl:18
          }
        }
      }else{
        return {
          labelCol: {
            xs:24,sm:4,md:2,lg:2,xl:2,xxl:1
          },
          wrapperCol: {
            xs:24,sm:18,md:21,lg:21,xl:21,xxl:22
          }
        }
      }

    }
  }

  get rules(){
    const rules = [];
    let viewType = this.type;
    //省市区组件不要加校验会报错
    if(viewType==='pca'){
      return rules;
    }
    const isRequired = this._required.includes(this.key);
    if (isRequired) {
      let msg = '必填项';
      if (this.ui && this.ui.errors) {
        msg = this.ui.errors.required;
      }else{
        msg=this.placeholder
      }
      rules.push({ required: true, message: msg });
    }

    if('list' === viewType || 'radio' === viewType || 'markdown' === viewType || 'pca' === viewType || viewType.indexOf('sel')>=0) {
      return rules;
    }
    if(viewType.indexOf('upload')>=0 || viewType.indexOf('file')>=0 || viewType.indexOf('image')>=0){
      return rules;
    }
    if (this.formSchema.maxLength) {
      let msg = '超过最大长度';
      if (this.ui.errors) {
        msg = this.ui.errors.maxLength;
      }
      rules.push({ max: this.formSchema.maxLength, message: msg });
    }
    if (this.formSchema.minLength) {
      let msg = '最小长度';
      if (this.ui.errors) {
        msg = this.ui.errors.minLength;
      }
      rules.push({ min: this.formSchema.minLength, message: msg });
    }
    if (this.formSchema.pattern) {
      if(this.formSchema.pattern==='only'){
       rules.push({ validator:this.checkOnlyMethod });
      }else if(this.formSchema.pattern==='z'){
        if(this.formSchema.type=='number'||this.formSchema.type=='integer'){
          this.onlyInteger=true
        }else{
          rules.push({ pattern: '^-?\\d+$', message: '请输入整数' });
        }
      }else{
        let msg = this.formSchema.errorInfo || '正则表达式不正确';
        rules.push({ pattern: this.formSchema.pattern, message: msg });
      }
    }
    if (this.formSchema.maximum) {
      let msg = '最大数';
      if (this.ui.errors) {
        msg = this.ui.errors.maximum;
      }
      rules.push({ type: 'number', max: this.formSchema.maximum, message: msg });
    }
    if (this.formSchema.minimum) {
      let msg = '最小数';
      if (this.ui.errors) {
        msg = this.ui.errors.minimum;
      }
      rules.push({ type: 'number', min: this.formSchema.minimum, message: msg });
    }
    // { required: true, message: '请输入姓名' }
    return rules;
  }

  get fieldDecoratorOptions(){
    return {
      rules: this.rules
    };
  }

  get isPidComponent(){
    return (this.type === 'sel_tree' && this.formSchema.pidComponent === 1)
  }

  get hiddenProp(){
    if(this.type == 'hidden'){
      return {
        initialValue: this._formSchem.value
      }
    }
    return {}
  }

  check_only_method=''
  get checkOnlyMethod(){
    return this.check_only_method ;
  }
  set checkOnlyMethod(value) {
    this.check_only_method = value;
  }

  initOptions(options){
    this._formSchem.enum = [...options]
  }

  get linkDownConfig(){
    return this._formSchem.config
  }

  get linkDownOthers(){
    return this._formSchem.others
  }

  get switchOptions(){
    if(this.type === 'switch'){
      let arr = this._formSchem.extendOption
      if(arr && arr.length>0){
        let strArr = []
        for(let k of arr){
          strArr.push(k + '')
        }
        return strArr
      }else{
        return ['Y','N']
      }
    }
  }
}