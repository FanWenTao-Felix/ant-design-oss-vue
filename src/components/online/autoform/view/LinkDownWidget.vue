<template>
  <div class="online-link-down">
    <a-spin :spinning="formLoading">
      <formitem-wapper v-for="(comp,index) in compList" :other-label="comp.title" :formitem="formitem" :key=" 'linkdown'+index ">
        <a-select
          :getPopupContainer="getPopupContainer"
          :ref=" 'onl-comp'+index "
          @change="v=>{handleChangeSelect(v,index)}"
          :placeholder="getLinkDownPlaceholder(comp)"
          v-bind="widgetAttrs"
          v-decorator="[comp.key,formitem.fieldDecoratorOptions]"
          allowClear>
          <a-select-option
            v-for="(item,opindex) in comp.options"
            :key="opindex"
            :value="item.store">
            <span style="display: inline-block;width: 100%" :title="item.label">
              {{ item.label }}
            </span>
          </a-select-option>
        </a-select>
      </formitem-wapper>
    </a-spin>

  </div>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import {FormItemMixin} from './../FormItenMixin'
  import { getAction } from '@/api/manage'

  export default {
    name: 'InputWidget',
    mixins:[FormItemMixin],
    components:{
      FormitemWapper
    },
    data(){
      return {
        url:'/online/cgform/api/querySelectOptions',
        compList:[],
        formLoading:false
      }
    },
    created(){
      this.initCompList().then(()=>{
        this.queryOptions(1)
      });
      this.$bus.$on('formInitDataSuccess', (row)=>{
        this.formLoading = true;
        this.initSelectPerLevel(row).catch(()=>{
          console.log("nothing can do");
          this.formLoading = false
        })
      });
    },
    beforeDestroy () {
      this.$bus.$off('formInitDataSuccess');
    },

    methods:{
      async initSelectPerLevel(row){
        const that = this;
        await this.queryOptions(1)
        let callbackRow = {}
        for(let i=0;i<this.compList.length;i++){
          let field = this.compList[i]['key']
          let store = row[field]
         // console.log(field,store)
          callbackRow[field] = store
          if(!store || store.length==0){
           continue;
          }else{
            await that.initSubSelect(store,i)
          }
        }
        this.$bus.$emit('popupCallbackMinitor', callbackRow);
        this.formLoading = false;
      },

      initSubSelect(store,pindex){
        return new Promise((resolve,reject)=>{
          console.log(`第${pindex+1}层的存储值为:${store}`)
          let pid = this.getSelectedIdByStore(store,pindex)
          console.log(`第${pindex+1}层的id值为:${pid}`)
          this.queryOptions(pindex+2, pid).then(()=>{
            resolve();
          }).catch(()=>{
            reject();
          })
        })

      },
      getLinkDownFormItem(formitem,comp){
        let obj = {...formitem}
        obj.label = comp.title
        return obj;
      },
      getLinkDownPlaceholder(comp){
        return '请选择'+comp.title
      },
      initCompList(){
        return new Promise(resolve => {
          let arr = []
          let index = 1
          arr.push({
            key:this.formitem.key,
            options:[],
            seq:index,
            title:this.formitem.label
          })
          let others = this.formitem.linkDownOthers
          if(others && others.length>0){
            for(let item of others){
              index = index+1
              arr.push({
                key:item.field,
                options:[],
                seq:index,
                title:item.title
              })
            }
          }
          this.compList = [...arr]
          console.log("compList",this.compList)
          resolve();
        })
      },
      handleChangeSelect(value,index){
        let pid = this.getSelectedIdByStore(value,index);
        let seq = index+2;
        this.queryOptions(seq,pid)
        console.log(this.$refs['onl-comp2'])

        this.resetNextLevelField(index);
      },

      resetNextLevelField(index){
        if(index<0 || index>=(this.compList.length-1)){
          return ''
        }
        let obj = {}
        obj[this.compList[index+1].key]=[]
        this.$bus.$emit('popupCallbackMinitor',obj)
      },

      getSelectedIdByStore(store,index){
        // 取到的是store的值 但是需要转成id  才能往后台发起请求数据
        let id = ''
        for(let opt of this.compList[index].options){
          console.log("aaaaa",this.compList[index])
          if(opt.store == store){
            id = opt.id;
            break;
          }
        }
        return id;
      },
      queryOptions(seq,pid){
        return new Promise((resolve,reject)=>{
          let params = this.getQueryParam(seq,pid)
          getAction(this.url,params).then(res=>{
            console.log(`查询${seq}层下拉选项为>`,res)
            if(res.success){
              for(let comp of this.compList){
                if(comp.seq === seq){
                  comp.options = [...res.result]
                }
              }
              resolve();
            }else{
              reject();
            }
          }).catch(()=>{
            reject();
          })
        })
      },
      getQueryParam(seq,pid){
        let config = this.formitem.linkDownConfig
        let param = {
          table: config.table,
          txt: config.txt,
          key: config.key,
          idField: config.idField,
          pidField: config.pidField
        }
        if(seq==1){
          param['condition'] = config.condition
        }else{
          param['pidValue'] = pid
        }
        return param;

        /*return {
          table:'sys_category',
          txt:'name',
          key:'id',
          idField:'id',
          pidField:'pid',
          linkField:'city',
          condition:" pid = '1230769196661510146' "
        }*/
      },
    }

  }
</script>

<style scoped>

</style>