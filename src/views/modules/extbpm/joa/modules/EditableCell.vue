<template>
  <div class="editable-cell">
    <div
      v-if="editable"
      class="editable-cell-input-wrapper"
    >
      <a-input
        :value="value"
        @change="handleChange"
        @pressEnter="check"
      /><a-icon
      type="check"
      class="editable-cell-icon-check"
      @click="check"
    />
    </div>
    <div
      v-else
      class="editable-cell-text-wrapper"
    >
      {{ value || ' ' }}
      <a-icon
        type="edit"
        class="editable-cell-icon"
        @click="edit"
      />
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      text: String,
      max:Number
    },
    data () {
      return {
        value: this.text,
        editable: false,
        de:this.max
      };
    },
    methods: {

      checkSpecialKey(str) {
        var specialKey = "[`~!#$^&*()=_+-|{}':;'\\[\\].<>/?~！#@￥……&*（）——|{}【】‘；：”“'。，、？]‘'";
        for (var i = 0; i < str.length; i++) {
          if (specialKey.indexOf(str.substr(i, 1)) != -1) {
            return false;
          }
        }
        return true;
      },
      handleChange (e) {
        const value = e.target.value;
        this.value = value;
        var that=this;
        if((value>= 'A' && value <= 'Z') || (value >= 'a' && value <= 'z')||(value >= '\u4e00' && value <= '\u9fa5')){
          that.$message.warning("不能输入中文或者英文字母");
          const value = '';
          this.value = value;
          return false;
        }
        if(this.value>this.de){
          that.confirmLoading = false;
          that.$message.warning("补偿天数或者小时不能大于未补偿天数或者小时");
          const value = '';
          this.value = value;
        }

        if (!this.checkSpecialKey(this.value)) {
          that.confirmLoading = false;
          that.$message.warning("不能含有特殊字符！！");
          const value = '';
          this.value = value;
        }
      },
      check () {
        this.editable = false;
        this.$emit('change', this.value);
      },
      edit () {
        this.editable = true;
      },
    },
  };
</script>