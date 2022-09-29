<template>
  <div class="advanceRecord">
    <div class="recordBttonWrapper">
      <div class="recordBtton">
        <select class="recording-media" @change="getAdavncedRecordMedia" ref="advancedRecordMedia">
          <option v-for="(item,index) in advancedRecordingMedia" :key="index" :value="item.value">{{item.text}}</option>
        </select>

        <div class="recordBtn" v-show="currentRecordType === 'record-regionalScreen' " ref="shareScreenBtn">
          <button ref="shareScreenBtn" @click="handleShareStream">开启共享</button>

          <!--<button v-if="currentRecordType === 'record-regionalScreen' " @click="getDisplayMedia">开启共享</button>-->
          <!--<button class="startBtn" @click="handleRecord" ref="startBtn"> Start Recording</button>-->
        </div>

        <div class="recordBtn">
          <!--<button class="startBtn"  ref="startBtn" >Start Recording</button>-->
          <button class="startBtn"  ref="startBtn" @click="handleRecord">Start Recording</button>
        </div>

      </div>
    </div>
    <div class="recordContent">
      <div v-if="currentRecordType === 'record-camera-plus-screen' ">
        <MutiStream ></MutiStream>
      </div>
      <div v-if="currentRecordType === 'record-regionalScreen' ">
        <RegionalStream></RegionalStream>
      </div>
      <div v-if="currentRecordType === 'gif-record' ">
        <GifRecord></GifRecord>
      </div>
      <div v-if="currentRecordType === 'microphone-mp3' ">
        <MicrophoneMp3></MicrophoneMp3>
      </div>
    </div>
  </div>
</template>

<script>

    import MutiStream from "@/views/recordType/RecordMutistream.vue"
    import RegionalStream from "@/views/recordType/RecordRegionalScreen.vue"
    import GifRecord from "@/views/recordType/GifRecord.vue"
    import MicrophoneMp3 from "@/views/recordType/MicrophoneAndMp3Record.vue"
    import {Bus} from "@/common/Bus.js"
    // import debounce from "@/common/getStream/index.js"
    export default {
        name: "AdvanceRecord",
        data(){
          return{
            currentRecordType: '',          // 当前录制的类型
          }
        },
       props:['advancedRecordingMedia'],
       components:{ MicrophoneMp3, GifRecord,RegionalStream, MutiStream},
       mounted(){
         this.currentRecordType = this.$store.state.currentRecordMethod === 'advanced-Recorded' ?  this.advancedRecordingMedia[0].value : null
         this.startRecordingBtn = this.$refs.startBtn
         this.shareScreenBtn = this.$refs.shareScreenBtn
         Bus.$on("startRecordingValue", (data)=>{
           console.warn("data:",data)
           this.startRecordingBtn.innerHTML = data.value
         })
         Bus.$on("recordingValue", (data)=>{
           console.warn("data:",data)
           this.startRecordingBtn.innerHTML = data.value
         })
         Bus.$on("gifRecordingValue", (data)=>{
           this.startRecordingBtn.innerHTML = data.value
         })
         Bus.$on("startRecordingMp3",(data)=>{
           console.warn("data:",data)
           this.startRecordingBtn.innerHTML = data.value
         })
         Bus.$on("isDisplayBtn", (data)=>{
           console.warn("isDisplayBtn data:",data)
           if(data.value){
             this.shareScreenBtn.style.display = 'block'
           }else{
             this.shareScreenBtn.style.display = 'none'
           }
         })
       },
       methods:{
         getAdavncedRecordMedia(){
           this.currentRecordType = this.$store.state.currentRecordMethod === 'advanced-Recorded' ? this.$refs.advancedRecordMedia.value : null
           console.warn("this.currentRecordType:",this.currentRecordType)
         },
         handleRecord(){
           console.warn(" handleRecord handleRecord handleRecord handleRecord handleRecord")
           if(this.currentRecordType === 'record-regionalScreen'){
             Bus.$emit("startRecordingScreen", {isRecording: true, element: this.startRecordingBtn, value: this.startRecordingBtn.innerHTML })
           }else if(this.currentRecordType === 'record-camera-plus-screen'){
             Bus.$emit("startRecording", {isRecording: true, element: this.startRecordingBtn, value: this.startRecordingBtn.innerHTML })
           }else if(this.currentRecordType === 'gif-record'){
             Bus.$emit("gifRecording",{isRecording: true, element: this.startRecordingBtn, value: this.startRecordingBtn.innerHTML })
           }else if(this.currentRecordType === 'microphone-mp3'){
             Bus.$emit("microphoneMp3Recording",{isRecording: true, element: this.startRecordingBtn, value: this.startRecordingBtn.innerHTML })
           }
         },
         handleShareStream(){
           console.warn("this.shareScreenBtn.innerHTML：",this.shareScreenBtn.innerHTML)
           Bus.$emit("shareScreen", {isShare: true, element: this.shareScreenBtn , value: this.shareScreenBtn.innerHTML })
         },
       },
       beforeDestroy() {
         Bus.$off('startRecordingValue')
         Bus.$off('recordingValue')
         Bus.$off('isDisplayBtn')
         Bus.$off('shareScreen')
         Bus.$off('startRecording')
       }
    }
</script>

<style scoped>
  /** 关于高级录制的样式 **/
  .recordWrapper{
    width:100%;
    height: 100%;
    display:flex;
    flex-direction: column;
    justify-content:center;
    align-items: center;
  }
  .recordBttonWrapper{
    width: 100%;
    height:50px;
    display: flex;
    justify-content: center;
    background-color: #dde3e3;
    border-radius: 5px;
  }
  .recordBtton{
    width: 60%;
    height: 50px;
    display:flex;
    justify-content: space-around;
    align-items: center;
  }
  .recordBtn{
    margin: 5px;
  }
  select{
    width: 200px;
    height: 40px;
    border:none;
    outline:none;
    text-align: center;
    border-radius: 5px;
    margin: 5px;
    /*padding: 8px 10px;*/
  }

  button{
    width: 100px;
    height: 40px;
    border-radius: 5px;
    border:none;
  }

  .save-to-disk{
    margin: 5px;
    background-color: skyblue;
    color: white;
  }
  .open-new-tab{
    margin: 5px;
    background-color: skyblue;
    color: white;
  }
  .shareScreenContent{
    width:640px;
    height:360px;
    overflow: hidden;
    display:flex;
    justify-content: center;
    align-items: center;
  }
  .shareScreenVideo{
    margin:0 auto;
    display:flex;
    justify-content: center;
    align-items: center;
    object-fit: inherit;
  }
</style>
