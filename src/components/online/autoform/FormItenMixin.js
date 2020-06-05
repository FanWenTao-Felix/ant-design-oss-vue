export const FormItemMixin = {
  data(){
    return {
      widgetAttrs:this.formitem.widgetAttrs,
      itemAttrs:this.formitem.itemAttrs,
      placeholder:this.formitem.placeholder,
      formitemAttrs:this.formitem.formitemAttrs,
      colAttrs:this.formitem.colAttrs
    }
  },
  props:{
    formitem:{
      type: Object,
      default: () => {},
      required: false
    },
    isTabProp:{
      type:Boolean,
      default:false,
      required:false
    },
    tabDataIndex:{
      type:Number,
      default:0,
      required:false
    },
    tabKey:{
      type:String,
      default:'',
      required:false
    },
    otherLabel:{
      type:String,
      default:'',
      required:false
    }
  },
  computed:{
    label(){
      if(!this.otherLabel || this.otherLabel.length==0){
        return this.formitem.label;
      }else{
        return this.otherLabel;
      }
    }
  },
  methods:{
    getVdecorator(){
      let id = this.tabKey+'['+this.tabDataIndex+'].'+this.formitem.key
      console.log(this.formitem.fieldDecoratorOptions)
      return [id,{rules: [{ required: true, message: 'Please select your country!' }]}]
    },
    getPopupContainer(node){
      return node.parentNode;
    },
    getModalAsContainer(node){
      return document.querySelector('.jeecg-online-modal .ant-modal-content')
    }
  },
  mounted(){
    //console.log(this.formitem)
  }

}