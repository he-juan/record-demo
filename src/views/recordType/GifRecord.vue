<template>
  <div class="recordMutistream">
    <div class="recordContainer">
      <h1 ref="text">Simple Gif Recording using RecordRTC</h1>
      <div class="downLoadBtn" style="text-align: center; display:none;" ref="downLoadBtn">
        <button class="save-to-disk" @click="downLoad">Save To Disk</button>
        <button class="open-new-tab" @click="startNewTab">Open New Tab</button>
      </div>
      <div class="mutistreamContent" >
        <!--<video class="mutistreamVideo" ref="mutistreamVideo" style="width: 100%;"></video>-->
        <img class="mutistreamVideo" ref="img" width="320"  style="transform: scale(1)" />
      </div>
    </div>
  </div>
</template>

<script>
    import beautyDate from '@/api/day.js'
    import RecordRTC from 'recordrtc'
    import {Bus} from "@/common/Bus.js"
    export default {
        name: "GifRecord.vue",
      mounted(){
          this.text = this.$refs.text
          this.image = this.$refs.img
          Bus.$on('gifRecording',(data)=>{
            this.button = data.element
            this.button.value = data.value
            this.startRecording()
          })
      },
        methods:{
          startRecording(){
            let This = this
            if(This.button.value === 'Stop Recording'){
              This.button.disabled = true;
              This.button.disableStateWaiting = true;
              setTimeout(function() {
                This.button.disabled = false;
                This.button.disableStateWaiting = false;
              }, 2000);

              This.recorder.stopRecording(This.stopRecordingCallback)
              return
             }
            This.$refs.downLoadBtn.style.display = "none"
            This.captureCamera(function(camera) {
              Bus.$emit("gifRecordingValue", {isRecording: true, value: 'Stop Recording'})
              This.text.innerHTML = 'Waiting for Gif Recorder to start...';
              This.recorder = RecordRTC(camera, {
                type: 'gif',
                frameRate: 10,
                quality: 1,
                width: 360,
                hidden: 240,
                onGifRecordingStarted: function() {
                  This.text.innerHTML = 'Gif recording started.';
                },
                onGifPreview: function(gifURL) {
                  This.image.src = gifURL;
                }
              });

              This.recorder.startRecording();

              This.recorder.camera = camera;

            });
          },
          captureCamera(callback) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(camera) {
              callback(camera);
            }).catch(function(error) {
              alert('Unable to capture your camera. Please check console logs.');
              console.error(error);
            });
          },
          stopRecording(){
            let This = this
            This.stopRecording(This.stopRecordingCallback)
          },
          stopRecordingCallback() {
            let This = this
            This.text.innerHTML = 'Gif recording stopped: ' + This.bytesToSize(This.recorder.getBlob().size);
            This.file = This.recorder.getBlob()
            This.url = URL.createObjectURL(This.file)
            This.image.src = This.url;
            This.recorder.camera.stop();
            This.recorder.destroy();
            This.recorder = null;
            Bus.$emit("gifRecordingValue", {isRecording: true, value: 'Start Recording'})
            This.$refs.downLoadBtn.style.display = "block"
          },
          bytesToSize(bytes) {
            var k = 1000;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) {
              return '0 Bytes';
            }
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
          },
          downLoad(){
            let type
            type = {type: 'video/webm'}
            let logTime = new Date(parseInt((new Date()).getTime()))
            logTime = beautyDate(logTime)
            let a = document.createElement('a');
            a.target = "_blank";
            a.style.display = 'none';
            a.href = this.url;
            a.download = 'record- '+ logTime +'.gif';
            document.body.appendChild(a);
            a.click();
            // setTimeout(function() {
            //   document.body.removeChild(a);
            //   window.URL.revokeObjectURL(this.url);
            // }, 100);
          },
          startNewTab(){
            // let logTime = new Date(parseInt((new Date()).getTime()))
            // logTime = beautyDate(logTime)
            // let fileName = 'recorder_'+ logTime +'.gif'
            // let file = new File([this.file], fileName, );
            // window.urld = this.url
            // console.warn("file:",file)
            window.open(this.url);
          },
        },
        beforeDestroy(){
          Bus.$off('gifRecording')
        },

    }
</script>

<style scoped>
  .recordMutistream{
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  .recordBtn{
    background-color: #dde3e3;
    height: 50px;
    line-height: 50px;
    text-align:center;
    marign: 5px;
    width: 100%;
  }
  button{
    width: 100px;
    height: 40px;
    border-radius: 5px;
    border:none;
  }
  .recordContainer{
    border: 1px solid #ccc;
    width: 100%;
    height:500px;
    display:flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    margin: 5px;
    border-radius: 10px;
    background-color: white;
  }
  .downLoadBtn{
    width:100%;
    height: 50px;
  }
  .mutistreamContent{
    width:640px;
    height:360px;
    overflow: hidden;
    display:flex;
    justify-content: center;
    align-items: center;
  }
  .mutistreamVideo{
    z-index: 999;
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
</style>
