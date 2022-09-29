import Vue from 'vue'
export const Bus = new Vue({
  data(){
    return {
      data:{}
    }
  },
  created(){
    this.$on('getData',(value)=>{
      this.data = value.data
    })
  },
})
