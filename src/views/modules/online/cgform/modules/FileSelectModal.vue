<template>
  <a-modal
    :title="title"
    :width="500"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="关闭"
    wrapClassName="ant-modal-cust-warp"
    style="top:5%;height: 95%;">

    <a-directory-tree
      :loadData="onLoadData"
      :treeData="treeData"
      @select="onSelect"
    >
    </a-directory-tree>
  </a-modal>
    
</template>

<script>
  import { getAction } from '@/api/manage'
  export default {
    name: 'FileSelectModal',
    data(){
      return {
        title:"选择文件目录",
        visible:false,
        confirmLoading:false,
        treeData:[],
        fileTreeUrl:"/online/cgform/head/fileTree",
        rootFileUrl:"/online/cgform/head/rootFile",
        selectedKey:""
      }
    },
    created(){
      this.loadRoot();
    },
    methods:{
      handleSubmit(){
        this.$emit("callback",this.selectedKey)
        this.visible=false
      },
      handleCancel(){
        this.visible=false
      },
      show(){
        this.visible=true
        this.selectedKey=""
      },
      loadRoot(){
        getAction(this.rootFileUrl).then(res=>{
          if(res.success){
            this.treeData = [...res.result]
          }
        })
      },
      onLoadData(treeNode){
        return new Promise((resolve) => {
          if (treeNode.dataRef.children) {
            resolve()
            return
          }
          let params = {
            parentPath:treeNode.dataRef.key
          }
          getAction(this.fileTreeUrl,params).then(res=>{
            if(res.success){
              treeNode.dataRef.children = res.result
              this.treeData = [...this.treeData]
            }
            resolve()
          })
        })
      },
      onSelect (selectedKeys) {
        this.selectedKey = selectedKeys[0]
      }
    }
  }
</script>

<style scoped>

</style>