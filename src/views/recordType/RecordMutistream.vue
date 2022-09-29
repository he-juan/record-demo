<template>
  <div class="recordMutistream">
    <div class="recordContainer">
      <div class="downLoadBtn" style="text-align: center; display:none;" ref="downLoadBtn">
        <button class="save-to-disk" @click="downLoad">Save To Disk</button>
        <!--<button id="upload-to-php">Upload to PHP</button>-->
        <button class="open-new-tab" @click="startNewTab">Open New Tab</button>
      </div>
      <div class="mutistreamContent" >
        <!--<video class="mutistreamVideo" ref="mutistreamVideo" style="width: 100%;"></video>-->
        <video class="mutistreamVideo" ref="mutistreamVideo" width="720"  style="transform: scale(1)"></video>
      </div>
    </div>
  </div>
</template>

<script>
    import beautyDate from '@/api/day.js'
    import RecordRTC from 'recordrtc'
    import {Bus} from "@/common/Bus.js"

    export default {
        name: "RecorsMutistream",
        data(){
          return{
             isMute: '',  //是否静音
          }
        },

        mounted(){
          this.video = this.$refs.mutistreamVideo
          this.isMute = this.$store.getters.getMuteState
          // this.button = this.$refs.startRecording
          console.warn("this.video:",this.video)
          if(!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
            let error = 'Your browser does NOT supports getDisplayMedia API.';
            throw new Error(error);
          }

          this.$nextTick(()=>{
            console.warn("nextTick nextTick nextTick nextTick")
            Bus.$on("startRecording",(data)=>{
              console.warn("data:",data)
              this.button = data.element
              this.button.value = data.value
              this.startRecording()

            })

            Bus.$on("isMute",(data)=>{
              console.warn("data:",data)
              this.isMute = data.value
              if(this.camera){
                this.streamMuteSwitch({stream: this.camera, type: 'audio', mute:this.isMute})
              }
            })

          })
        },
        methods:{
          startRecording(){
             let This = this
            console.warn("This.button.value:",This.button.value)
             // if(This.button.innerHTML === 'stop Recording'){
            if(This.button.value === 'Stop Recording'){
               This.button.disabled = true;
               This.button.disableStateWaiting = true;
               setTimeout(function() {
                 This.button.disabled = false;
                 This.button.disableStateWaiting = false;
               }, 2000);

               // This.button.innerHTML = 'Start Recording';

               This.recorder.stopRecording(This.stopRecordingCallback)
               return
             }

             This.captureScreen(function(screen) {
               This.screen = screen

               This.keepStreamActive(screen);
               This.captureCamera(function(camera) {
                 This.camera = camera
                 if(This.isMute){
                   This.streamMuteSwitch({stream: This.camera, type: 'audio', mute: This.isMute})
                 }
                 This.keepStreamActive(camera);

                 screen.width = window.screen.width;
                 screen.height = window.screen.height;
                 screen.fullcanvas = true;
                 console.warn("screen.width :", screen.width + "  * " + screen.height)

                 camera.width = 320;
                 camera.height = 240;
                 camera.top = screen.height - camera.height ;
                 camera.left = screen.width - camera.width ;

                 This.button.value = 'Stop Recording'
                 Bus.$emit("startRecordingValue", {isRecording: false, value: 'Stop Recording'})
                 // This.button.innerHTML = "stop Recording"

                 This.recorder = RecordRTC([screen, camera], {
                   type: 'video',
                   mimeType: 'video/webm',
                   previewStream: function(s) {
                     console.warn("s:",s)
                     window.stream = s
                     This.video.muted = true;
                     This.video.srcObject = s;
                     This.video.play()
                     // This.video.controls = true
                   }
                 });
                 This.recorder.startRecording();

               },function(error) {
                 console.error(error);
                 alert('get camera failed.\n' + error);
               });
             });
          },
          captureScreen(callback) {
            console.warn("callback:",callback)
            let This = this
            This.invokeGetDisplayMedia(function(screen) {
              This.addStreamStopListener(screen, function() {
                if(This.screen  || This.camera){
                  This.recorder.stopRecording(This.stopRecordingCallback)
                }
              });
              callback(screen);
            }, function(error) {
              console.error(error);
              alert('Unable to capture your screen. Please check console logs.\n' + error);
            });
          },
          captureCamera(cb) {
            let constraints = {
              audio: {
                exact: this.$store.getters.getCurrentAudioSource,
              },
              video: {
                exact: {
                  deviceId: this.$store.getters.getCurrentVideoSource
                },
                noiseSuppression: true,
                echoCancellation: true
              }
            }
            console.warn("mutiStream constraints:", constraints)
            navigator.mediaDevices.getUserMedia(constraints).then(cb);
          },
          invokeGetDisplayMedia(success, error) {
            var displaymediastreamconstraints = {
              video: {
                displaySurface: 'monitor', // monitor, window, application, browser
                logicalSurface: true,
                cursor: 'always' // never, always, motion
              }
            };

            // above constraints are NOT supported YET
            // that's why overridnig them
            displaymediastreamconstraints = {
              audio: true,
              video: true
            };

            if(navigator.mediaDevices.getDisplayMedia) {
              navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
            }
            else {
              navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
            }
          },
          addStreamStopListener(stream, callback) {
            stream.addEventListener('ended', function() {
              callback();
              callback = function() {};
            }, false);
            stream.addEventListener('inactive', function() {
              callback();
              callback = function() {};
            }, false);
            stream.getTracks().forEach(function(track) {
              track.addEventListener('ended', function() {
                callback();
                callback = function() {};
              }, false);
              track.addEventListener('inactive', function() {
                callback();
                callback = function() {};
              }, false);
            });
          },
          keepStreamActive(stream) {
            var video = document.createElement('video');
            video.muted = true;
            video.srcObject = stream;
            video.style.display = 'none';
            video.style.zIndex ='1' ;
            (document.body || document.documentElement).appendChild(video);
          },
          stopRecordingCallback(){
            let This = this
            This.file = This.recorder.getBlob();
            This.video.srcObject = null;
            This.url = URL.createObjectURL(This.file)
            This.video.src = This.url;
            This.video.muted = false;
            This.video.play()
            This.video.controls = true;

            This.recorder.destroy()
            This.recorder = null
            // This.button.innerHTML = "start Recording"
            This.button.value = 'Start Recording'
            Bus.$emit("startRecordingValue", {isRecording: true, value: 'Start Recording'})
            This.$refs.downLoadBtn.style.display = "block"
            let mutiStream = [This.screen, This.camera]
            mutiStream.forEach(function(stream) {
              stream.getTracks().forEach(function(track) {
                track.stop();
              });
            });
            This.screen = This.camera = null
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
            a.download = 'record- '+ logTime +'.mp4';
            document.body.appendChild(a);
            a.click();
            // setTimeout(function() {
            //   document.body.removeChild(a);
            //   window.URL.revokeObjectURL(this.url);
            // }, 100);
          },
          startNewTab(){
            let logTime = new Date(parseInt((new Date()).getTime()))
            logTime = beautyDate(logTime)
            let fileName = 'recorder_'+ logTime +'.webm'
            let file = new File([this.file], fileName, { type: 'video/webm'});
            console.warn("file:",file)
            console.warn("url:",this.url)
            window.open(URL.createObjectURL(file));
          },
          streamMuteSwitch(data) {
            if (data && data.stream && data.type === 'audio' && data.stream.getAudioTracks().length > 0) {
              for (let i = 0; i < data.stream.getAudioTracks().length; i++) {
                console.warn("data.mute:",data.mute)
                if (data.mute) {
                  if (data.stream.getAudioTracks()[i].enabled === true) {
                    console.info('MuteStream exec mute audio')
                    data.stream.getAudioTracks()[i].enabled = false
                    this.isMute = true
                  }
                } else {
                  if (data.stream.getAudioTracks()[i].enabled === false) {
                    console.info('MuteStream exec unmute audio')
                    data.stream.getAudioTracks()[i].enabled = true
                    this.isMute = false
                  }
                }
              }
            }
          },
        },
        beforeDestroy(){
          Bus.$off('startRecording')
          Bus.$off('isMute')
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
