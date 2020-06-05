<template>
  <a-date-picker
    :disabled="readOnly"
    :placeholder="placeholder"
    @change="handleDateChange"
    :showTime="showTime"
    :value="momVal"
    :format="dateFormat"
  />
</template>
<script>
  import moment from 'moment'
  export default {
    name: 'FormDate',
    props: {
      placeholder:{
        type: String,
        default: '',
        required: false
      },
      dateFormat:{
        type: String,
        default: 'YYYY-MM-DD',
        required: false
      },
      triggerChange:{
        type: Boolean,
        required: false,
        default: false
      },
      readOnly:{
        type: Boolean,
        required: false,
        default: false
      },
      showTime:{
        type: Boolean,
        required: false,
        default: false
      },
      value:{
        type: String,
        required: false
      }
    },
    data () {
      return {
        momVal:!this.value?null:moment(this.value,this.dateFormat)
      }
    },
    watch: {
      value (val = {}) {
        console.log("这是新的治",val)
        if(!val){
          console.log("这是新的治123",val)
          this.momVal = null
        }else{
          console.log("这是新的治abc",val)
          this.momVal = moment(val,this.dateFormat)
        }
      },
    },
    methods: {
      moment,
      handleDateChange(mom,dateStr){
        console.log("this.dateVal",this.dateVal)
        if(this.triggerChange){
          this.$emit('change', dateStr);
        }else{
          this.$emit('input', dateStr);
        }
      }
    }
  }
</script>
