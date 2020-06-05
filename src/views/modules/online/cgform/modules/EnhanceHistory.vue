<template>
  <j-modal
    title="JS增强历史记录"
    width="1200px"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    fullscreen
    switchFullscreen
    @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-layout>
        <a-layout-sider theme="light">
          <a-list bordered :dataSource="dataList" :class="'cust-enhance-his'">
            <div slot="header" style=""><a-divider style="margin: 0">保存时间</a-divider></div>
            <a-list-item slot="renderItem" slot-scope="item" :class="activeIndex===item.index?'bgBlue':''">
              <a @click="fullCode(item)" style="color: rgba(0, 0, 0, 0.85);">{{ getFormatDate(item.date) }}</a>
            </a-list-item>
          </a-list>
        </a-layout-sider>
        <a-layout>
          <a-layout-content :style="{ margin: '8px 8px', padding: '8px', background: '#fff', minHeight: '280px' }">
            <j-code-editor
              ref="codeEditor"
              language="javascript"
              :fullScreen="true"
              :lineNumbers="false"
              :language-change="false">
            </j-code-editor>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-spin>

    <template slot="footer">
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
  </j-modal>
</template>

<script>
  import { formatDate } from '@/utils/util'
  import JCodeEditor from '@/components/jeecg/JCodeEditor.vue'

  export default {
    name: 'EnhanceHistory',
    components:{
      JCodeEditor
    },
    data() {
      return {
        visible: false,
        confirmLoading: false,
        dataList:[],
        jsStr:'',
        activeIndex:0
      }
    },
    methods: {
      handleCancel(){
        this.visible = false
      },
      getFormatDate(date){
        return formatDate(date,'yyyy-MM-dd hh:mm:ss')
      },
      fullCode(item){
        this.activeIndex = item.index
        this.$refs.codeEditor.setCodeContent(item.str)
      },
      show(code, type){
        this.jsStr = ''
        this.dataList = []
        let arr = this.$store.getters.enhanceJs(code)
        console.log("arr",arr)
        console.log("type",type)
        let ls = []
        let index = 0;
        for(let item of arr){
          if(item.type === type){
            index++;
            ls.push(Object.assign({},item,{index:index}))
          }
        }
        if(ls && ls.length>0){
          ls.sort((a,b)=>{
            return b.date - a.date
          })
        }
        this.dataList = [...ls]
        console.log("ls",ls)
        this.visible = true
        this.$nextTick(()=>{
          this.fullCode(ls[0])
        })

      }

    }
  }
</script>

<style>
  .bgBlue{background-color: #40a9ff}
  .cust-enhance-his .ant-list-header{padding-top: 5px;padding-bottom: 5px;color:#000}
</style>