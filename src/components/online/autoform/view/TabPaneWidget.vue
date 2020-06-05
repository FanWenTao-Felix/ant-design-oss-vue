<template>
  <div class="cust-sub-tab-content" :style=" 'overflow-x: auto;overflow-y: auto;max-height:'+winHeight ">
    <table cellpadding="5">
      <thead>
        <tr>
          <th v-for="(item,index) in properties" :key="index">
            {{ item.label }}
          </th>

        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in dataList" :key="index">
          <td v-for="(p_item,p_index) in properties" :key="p_index">

            <a-form-item  style="margin-bottom: 10px;display: inline-block;width: 120px" v-if="p_item.key=='action'">
              <a-button @click="addRowCustom" icon="plus"></a-button>
              <a-button @click="delRowCustom(index)" icon="minus" style="margin-left: 5px"></a-button>
              <a-input v-show="false" v-decorator="getVdecorator(index,'id',{})"/>
            </a-form-item>

            <a-form-item style="margin-bottom: 10px" v-else>
              <!-- TODO 尼玛这种写法(可以复用单表的组件)死活不支持校验 其实参数都是传对了,控件也加载出来了 就是校验不好使  -->
              <!--<component :formitem="p_item" :is-tab-prop="true" :tab-data-index="index" :tab-key="info.key" :is="createWidgets(p_item)">-->
              <template v-if="p_item.type=='date'">
                <j-date :trigger-change="true" :placeholder=" '请选择'+p_item.label " v-decorator="getVdecorator(index,p_item.key,p_item.fieldDecoratorOptions)"></j-date>
              </template>

              <template v-else-if="p_item.type=='datetime'">
                <j-date
                  :placeholder=" '请选择'+p_item.label "
                  :trigger-change="true"
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  v-decorator="getVdecorator(index,p_item.key,p_item.fieldDecoratorOptions)">
                </j-date>
              </template>

              <template v-else-if="p_item.type=='list'">
                <a-select :placeholder=" '请选择'+p_item.label " v-decorator="getVdecorator(index,p_item.key,p_item.fieldDecoratorOptions)">
                  <a-select-option
                    v-for="(op_item,op_index) in p_item.listSource"
                    :key="op_index"
                    :value="op_item.value">
                    {{ op_item.label }}
                  </a-select-option>
                </a-select>
              </template>

              <template v-else>
                <a-input :placeholder=" '请输入'+p_item.label " v-decorator="getVdecorator(index,p_item.key,p_item.fieldDecoratorOptions)"/>
              </template>

            </a-form-item>
          </td>

          <!--<td>
            <a-form-item  style="margin-bottom: 10px;display: inline-block;width: 120px">

              <a-button @click="addRowCustom" icon="plus"></a-button>
              <a-button @click="delRowCustom(index)" icon="minus" style="margin-left: 5px"></a-button>
            </a-form-item>
          </td>-->

        </tr>
      </tbody>
    </table>
  </div>

</template>

<script>
  import JDate from '@/components/jeecg/JDate.vue';

  export default {
    name: 'TabPaneWidget',
    components:{
      JDate
    },
    props:{
      info:{
        type:Object,
        default:()=>{
        },
        required:true
      },
      dataSize:{
        type:Number,
        default:1,
        required:false
      }
    },
    data(){
      return {
        winHeight:'300px',
        dataList:[{}],
        properties:[]
      }
    },
    watch:{
      'info':{
        handler(val){
          this.properties = val.properties
        },
        deep:true
      }
    },
    created(){
      this.properties = this.info.properties
      let dz = this.dataSize;
      this.dataList = []
      while(dz>0){
        this.dataList.push({})
        dz--;
      }
      console.log("1111222333",this.properties)
    },
    methods:{
      getVdecorator(index,key,option){
        let id = this.info.key+'['+index+'].'+key
        return [id,option]
      },
      addRowCustom () {
        this.dataList.push({});
        this.$forceUpdate();
      },
      delRowCustom (index) {
        this.dataList.splice(index,1);
        this.$forceUpdate();
      },
    }
  }
</script>

<style>
  .cust-sub-tab-content input,.cust-sub-tab-content .ant-select{width: 120px}
</style>