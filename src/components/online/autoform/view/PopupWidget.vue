<template>
  <formitem-wapper :formitem="formitem">
    <div class="components-input-demo-presuffix" v-if="avalid">
      <!---->
      <a-input
        readOnly
        :placeholder="placeholder"
        @click="openModal"
        :disabled="input_status"
        v-decorator="[formitem.key,formitem.fieldDecoratorOptions]">
        <a-icon slot="prefix" type="cluster" :title="placeholder"/>
        <a-icon v-if="!input_status" slot="suffix" type="close-circle" @click="handleEmpty" title="清空"/>
      </a-input>

      <j-popup-onl-report :multi="true" @ok="callBack" :code="formitem.popupCode" :ref=" 'popup_' +formitem.key "></j-popup-onl-report>

    </div>
  </formitem-wapper>
</template>

<script>

  import JPopupOnlReport from '@/components/online/autoform/comp/modal/JPopupOnlReport'
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'

  export default {
    name: 'PopupWidget',
    mixins:[FormItemMixin],
    components:{ FormitemWapper,JPopupOnlReport },
    data(){
      return {
        avalid:true,
        input_status:false
      }
    },
    mounted(){
      if(!this.formitem.orgFields || !this.formitem.destFields || !this.formitem.popupCode){
        this.$message.error("popup参数未正确配置!")
        this.avalid = false
      }
      if(this.formitem.destFields.split(",").length!=this.formitem.orgFields.split(",").length){
        this.$message.error("popup参数未正确配置,原始值和目标值数量不一致!")
        this.avalid = false
      }
      if(this.widgetAttrs){
        if(!this.widgetAttrs.disabled){
          this.input_status=false
        }else{
          this.input_status=true
        }
      }

    },
    methods:{
      openModal(){
        this.$refs['popup_'+this.formitem.key].show()
      },
      callBack(rows){
        let res = {}
        let orgFieldsArr = this.formitem.orgFields.split(",")
        let destFieldsArr = this.formitem.destFields.split(",")
        for(let i=0;i<orgFieldsArr.length;i++){
          let tempDestArr = []
          for(let rw of rows){
            let val = rw[orgFieldsArr[i]]
            if(!val){
              val = ""
            }
            tempDestArr.push(val)
          }
          res[destFieldsArr[i]] = tempDestArr.join(",")
        }
        if(!this.formitem.subKey){
          this.$bus.$emit('popupCallbackMinitor', res);
        }else{
          this.$bus.$emit('pcm'+this.formitem.subKey, res);
        }
      },
      handleEmpty(){
        let res={}
        let destFieldsArr = this.formitem.destFields.split(",")
        for(let i=0;i<destFieldsArr.length;i++){
          res[destFieldsArr[i]] = ""
        }
        if(!this.formitem.subKey){
          this.$bus.$emit('popupCallbackMinitor', res);
        }else{
          this.$bus.$emit('pcm'+this.formitem.subKey, res);
        }
      }
    }
  }
</script>

<style scoped>
  .components-input-demo-presuffix .anticon-close-circle {
    cursor: pointer;
    color: #ccc;
    transition: color 0.3s;
    font-size: 12px;
  }
  .components-input-demo-presuffix .anticon-close-circle:hover {
    color: #f5222d;
  }
  .components-input-demo-presuffix .anticon-close-circle:active {
    color: #666;
  }
</style>