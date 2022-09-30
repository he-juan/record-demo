<template>
  <div class="recordWrapper">
    <div class="recordBttonWrapper">
      <div class="recordBtton">
        <div>
          <select class="recording-media" @change="getNormalRecordMedia" ref="normalRecordMedia">
            <option v-for="(item,index) in normalRecordingMedia" :key="index" :value="item.value">{{item.text}}</option>
          </select>
        </div>

        <div>
          <select class="media-resolutions" @change="getNormalMediaResolution" ref="normalMediaResolutions">
            <option v-for="(item,index) in mediaResolutions" :key="index" :value="item.value">{{item.text}}</option>
          </select>
        </div>

        <div>
          <select class="media-framerates" @change="getNormalMediaFramerates" ref="normalMediaFramerates">
            <option v-for="(item,index) in mediaFramerates" :key="index" :value="item.value">{{item.text}}</option>
          </select>
        </div>

        <div class="recordBtn">
          <button class="startBtn" @click="handleRecord" ref="startBtn"> Start Recording</button>
        </div>

      </div>
    </div>
    <div class="recordContent">
      <div id="recording-player" ref="recordingPlayer">
        <div style="text-align: center; display:none; height:50px;" ref="downLoadBtn">
          <button class="save-to-disk" @click="downLoad">Save To Disk</button>
          <button class="open-new-tab" @click="startNewTab">Open New Tab</button>
        </div>
        <div class="shareScreenContent" ref="videoContent">
          <video  class="shareScreenVideo" ref="recorderVideo"  style="transform: scale(1); width:100%;"></video>
          <!--<video v-if="currentRecordType !== 'record-audio'" class="shareScreenVideo" ref="recorderVideo"  style="transform: scale(1); width:100%;"></video>-->
          <!--<audio v-if="currentRecordType === 'record-audio'" class="shareScreenAudio" ref="recorderAudio"  style="transform: scale(1)"></audio>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import RecordRTC from 'recordrtc';
    import beautyDate from '@/api/day.js'
    export default {
        name: "AbnormalRecord",
        data() {
          return {
            mediaResolutions: [
              {
                index: 0,
                text: 'Default resolutions',
                value: 'Default'
              },
              {
                index: 1,
                text: '1080p',
                value: '1920x1080'
              },
              {
                index: 2,
                text: '720p',
                value: '1280x720'
              },
              {
                index: 3,
                text: '480p',
                value: '640x480'
              },
              {
                index: 4,
                text: '360p',
                value: '640x360'
              }
            ],
            mediaFramerates: [
              {
                index: 0,
                text: 'Default framerates',
                value: 'default',
              },
              {
                index: 1,
                text: '5 fps',
                value: '5',
              },
              {
                index: 2,
                text: '15 fps',
                value: '15',
              },
              {
                index: 3,
                text: '24 fps',
                value: '24',
              },
              {
                index: 4,
                text: '30 fps',
                value: '30',
              }
            ],


            // currentMethod: '',          // 页面当前选择录制的方式，如 normal-Recorded、advanced-Recorded
            currentRecordType: '',      // 当前录制的类型
            currentResolutions: '',     // 当前取流分辨率
            currentFramerates: '',      // 当前取流帧率
          }
        },
        props:['normalRecordingMedia'],
        mounted() {
          this.$nextTick(function () {
            this.video = this.$refs.recorderVideo
            this.audio = this.$refs.recorderAudio
            this.currentRecordType = this.$store.state.currentRecordMethod === 'normal-Recorded' ? this.normalRecordingMedia[0].value : this.advancedRecordingMedia[0].value
            this.currentResolutions = this.mediaResolutions[0].value
            this.currentFramerates = this.mediaFramerates[0].value
          })
        },
        methods: {

        //初始化内容
        init(){
          let This = this
          if(This.currentRecordType === 'record-audio'){
            This.type = "audio/webm"
          }else{
            This.type = "video/webm"
          }
          This.button =  this.$refs.startBtn

          if(This.button.innerHTML === 'Stop Recording') {
            // btnPauseRecording.style.display = 'none';
            This.button.disabled = true;

            This.button.disableStateWaiting = true;
            setTimeout(function() {
              This.button.disabled = false;
              This.button.disableStateWaiting = false;
            }, 2000);

            This.button.innerHTML = 'Start Recording';
            This.recorder.stopRecording(This.stopRecordingCallback)
            return;
          }

          if(!event) return;
          This.button.disabled = true;
          This.$refs.downLoadBtn.style.display = "none"
          This.button.mediaCapturedCallback = function() {
            console.warn(" button.mediaCapturedCallback  button.mediaCapturedCallback  button.mediaCapturedCallback ")
            let options = {
              mimeType: This.type,
              timeSlice: 1000,
              type: 'video',
            };

            This.recorder = RecordRTC(This.button.stream, options);

            This.recorder.startRecording()
          }

          let commonConfig = {
            onMediaCaptured: function(stream) {
              This.button.stream  = stream;
              window.stream = stream
              This.video.src = This.video.srcObject = null;
              if(This.currentRecordType === 'record-audio'){

                // This.audio.srcObject = stream
                // This.video.muted= true
                // This.video.play()

                var audioPreview = document.createElement('audio');
                audioPreview.controls = true;
                audioPreview.autoplay = true;
                audioPreview.srcObject = stream
                This.video.replaceWith(audioPreview);
                This.video = audioPreview;

              }else{
                let {width, height} = stream.getVideoTracks()[0].getConstraints()
                console.warn("getContraints :",width , height )

                This.video.srcObject = stream
                This.video.muted= true

                This.video.oncanplay = function(){
                  This.video.play()
                }
                This.video.onloadedmetadata = async function () {
                  await This.video.play()
                  This.video.muted = true
                  if(width && (width.max > 1280 ||width.exact > 1280)){
                    This.video.style.width = width &&(width.max ||width.exact) / 3 + 'px'
                    This.video.style.height = height && (height.max || width.exact) / 3 + 'px'
                  }else if(width && (width.max === 1280 || width.exact === 1280)){
                    This.video.style.width = width &&(width.max ||width.exact) / 2 + 'px'
                    This.video.style.height = height && (height.max || width.exact) / 2 + 'px'
                  }else{
                    This.video.style.width = (width.max || width.exact) + 'px'
                    This.video.style.height = (height.max || height.exact) + 'px'
                  }
                }
              }
              if(This.button.mediaCapturedCallback) {
                This.button.mediaCapturedCallback();
              }

              This.button.innerHTML = 'Stop Recording';
              This.button.disabled = false;

              // chkFixSeeking.parentNode.style.display = 'none';
            },
            onMediaStopped: function() {
              console.warn("stop stop stream")
              This.button.innerHTML = 'Start Recording';

              if(!This.button.disableStateWaiting) {
                This.button.disabled = false;
              }
              if(This.button.stream){
                This.recorder.stopRecording(This.stopRecordingCallback)
              }

              // chkFixSeeking.parentNode.style.display = 'inline-block';
            },
            onMediaCapturingFailed: function(error) {
              console.error('onMediaCapturingFailed:', error);
              alert('onMediaCapturingFailed:', error)

              if(error.toString().indexOf('no audio or video tracks available') !== -1) {
                alert('RecordRTC failed to start because there are no audio or video tracks available.');
              }

              // if(error.name === 'PermissionDeniedError' && DetectRTC.browser.name === 'Firefox') {
              //   alert('Firefox requires version >= 52. Firefox also requires HTTPs.');
              // }

              commonConfig.onMediaStopped();
            }
          };
          if(This.currentRecordType === 'record-audio-plus-video'){
            captureAudioPlusVideo(commonConfig)
            function captureAudioPlusVideo(config) {
              This.captureUserMedia({video: true, audio: true}, function(audioVideoStream) {

                config.onMediaCaptured(audioVideoStream);

                if(audioVideoStream instanceof Array) {
                  audioVideoStream.forEach(function(stream) {
                    This.addStreamStopListener(stream, function() {
                      config.onMediaStopped();
                    });
                  });
                  return;
                }

                This.addStreamStopListener(audioVideoStream, function() {
                  config.onMediaStopped();
                });
              }, function(error) {
                config.onMediaCapturingFailed(error);
              });
            }
          }else if(This.currentRecordType === 'record-audio'){
            captureAudio(commonConfig);
            function captureAudio(config) {
              This.captureUserMedia({audio: true}, function(audioStream){
                config.onMediaCaptured(audioStream);

                This.addStreamStopListener(audioStream, function() {
                  config.onMediaStopped();
                });
              }, function(error) {
                config.onMediaCapturingFailed(error);
              });
            }
          }else if(This.currentRecordType === 'record-screen'){
            captureScreen(commonConfig)
            function captureScreen(config){
              if (navigator.getDisplayMedia) {
                navigator.getDisplayMedia({
                  audio: true,
                  video: {
                    width: { max:  1920 },
                    height: { max:  1080 },
                    frameRate: { max: 15 },
                  }
                }).then(screenStream => {
                  config.onMediaCaptured(screenStream);

                  This.addStreamStopListener(screenStream, function() {
                    config.onMediaStopped();
                  });

                  setVideoURL(screenStream, true);
                }).catch(function(error) {
                  config.onMediaCapturingFailed(error);
                });
              } else if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({
                  audio: true,
                  video: {
                    width: { max:  1920 },
                    height: { max:  1080 },
                    frameRate: { max: 15 },
                  }
                }).then(screenStream => {
                  config.onMediaCaptured(screenStream);

                  This.addStreamStopListener(screenStream, function() {
                    config.onMediaStopped();
                  });
                }).catch(function(error) {
                  config.onMediaCapturingFailed(error);
                });
              } else {
                var error = 'getDisplayMedia API are not supported in this browser.';
                config.onMediaCapturingFailed(error);
                alert(error);
              }
            }

          }else if(This.currentRecordType === 'record-audio-plus-screen'){
            captureAudioPlusScreen(commonConfig);
            function captureAudioPlusScreen(config){
              if (navigator.getDisplayMedia) {
                navigator.getDisplayMedia({
                  audio: true,
                  video: {
                    width: { max:  1920 },
                    height: { max:  1080 },
                    frameRate: { max: 15 },
                  }
                }).then(screenStream => {
                  This.captureUserMedia({audio:true},function(mic){
                    This.audio = mic
                    // screenStream.addTrack(mic.getTracks()[0]);
                    let stream
                    let mixStream = []
                    if(screenStream.getAudioTracks().length > 0){

                      let audioTrack = This.mixingStream(screenStream, This.audio).getAudioTracks()[0]
                      mixStream.push(audioTrack)
                      mixStream.push(screenStream.getVideoTracks()[0])
                      stream = new MediaStream(mixStream)
                    }else{
                      mixStream.push(This.audio.getAudioTracks()[0])
                      mixStream.push(screenStream.getVideoTracks()[0])
                      stream = new MediaStream(mixStream)
                    }
                    config.onMediaCaptured(stream);
                    This.addStreamStopListener(screenStream, function() {
                      config.onMediaStopped();
                    });
                  },function(error){
                    console.warn("音频取流失败：",error)
                    alert("音频取流失败：", error )
                  })
                }).catch(function(error) {
                  config.onMediaCapturingFailed(error);
                });
              } else if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({
                  audio:true,
                  video: {
                    width: { max:  1920 },
                    height: { max:  1080 },
                    frameRate: { max: 15 },
                  }
                }).then(screenStream => {
                  This.captureUserMedia({audio:true},function(mic){
                    This.audio = mic
                    // screenStream.addTrack(mic.getTracks()[0]);

                    let stream
                    let mixStream = []
                    if(screenStream.getAudioTracks().length > 0){

                      let audioTrack = This.mixingStream(screenStream, This.audio).getAudioTracks()[0]
                      mixStream.push(audioTrack)
                      mixStream.push(screenStream.getVideoTracks()[0])
                      stream = new MediaStream(mixStream)
                    }else{
                      mixStream.push(This.audio.getAudioTracks()[0])
                      mixStream.push(screenStream.getVideoTracks()[0])
                      stream = new MediaStream(mixStream)
                    }
                    config.onMediaCaptured(stream);
                    This.addStreamStopListener(screenStream, function() {
                      config.onMediaStopped();
                    });
                  },function(error){
                    console.warn("音频取流失败：",error)
                    alert("音频取流失败：", error )
                  })
                }).catch(function(error) {
                  config.onMediaCapturingFailed(error);
                });
              } else {
                var error = 'getDisplayMedia API are not supported in this browser.';
                config.onMediaCapturingFailed(error);
                alert(error);
              }
            }
          }

        },
        // 获取当前录制类型
        getNormalRecordMedia(){
          this.currentRecordType = this.$store.state.currentRecordMethod === 'normal-Recorded' ? this.$refs.normalRecordMedia.value : null
        },
        // 获取当前的录制类型的流
        getNormalMediaResolution(){
          this.currentResolutions = this.$store.state.currentRecordMethod === 'normal-Recorded' ? this.$refs.normalMediaResolutions.value : null
        },
        getNormalMediaFramerates(){
          this.currentFramerates = this.$store.state.currentRecordMethod === 'normal-Recorded' ? this.$refs.normalMediaFramerates.value : null
        },
        handleRecord(){
          this.init()
        },
        // 处理当前录制时的stream
        captureUserMedia(mediaConstraints, successCallback, errorCallback) {

          mediaConstraints = this.getVideoResolutions(mediaConstraints);
          mediaConstraints = this.getFrameRates(mediaConstraints);

          console.warn("mediaConstraints:",mediaConstraints)

          navigator.mediaDevices.getUserMedia(mediaConstraints).then(function(stream) {
            successCallback(stream);
            // setVideoURL(stream, true);
          }).catch(function(error) {
            if(error && (error.name === 'ConstraintNotSatisfiedError' || error.name === 'OverconstrainedError')) {
              alert('Your camera or browser does NOT supports selected resolutions or frame-rates. \n\nPlease select "default" resolutions.');
            }
            else if(error && error.message) {
              alert(error.message);
            }
            else {
              alert('Unable to make getUserMedia request. Please check browser console logs.');
            }

            errorCallback(error);
          });
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
        // 获取分辨率
        getVideoResolutions(mediaConstraints) {
          let defaultWidth , defaultHeight ;
          if(mediaConstraints.video == true) {
            mediaConstraints.video = {};
          }
          if(mediaConstraints.audio == true) {
            mediaConstraints.audio = {};
          }

          if(!mediaConstraints.audio.deviceId) {
            mediaConstraints.audio.deviceId = {};
            let audioDeviceId = this.$store.getters.getCurrentAudioSource
            mediaConstraints.audio.deviceId = {
              exact: audioDeviceId  ,
            }
          }

          if(!mediaConstraints.video) {
            return mediaConstraints;
          }

          if(!mediaConstraints.video.width || !mediaConstraints.video.height) {
            mediaConstraints.video.width = {};
            mediaConstraints.video.height = {};
            let camereDeviceId = this.$store.getters.getCurrentVideoSource
            mediaConstraints.video.deviceId = {
              exact: camereDeviceId  ,
            }
          }

          let value = this.currentResolutions

          if(value == 'Default' || value == 'default' ) {
            defaultWidth = 640
            defaultHeight = 360
          }else{
            value = value.split('x');
            defaultWidth = parseInt(value[0]);
            defaultHeight = parseInt(value[1]);
          }


          var isScreen = this.currentRecordType.toString().toLowerCase().indexOf('screen') != -1;

          if(isScreen) {
            mediaConstraints.video.width = { max: defaultWidth};
            mediaConstraints.video.height = { max: defaultHeight};
          }
          else {
            mediaConstraints.video.width = { exact: defaultWidth};
            mediaConstraints.video.height = { exact: defaultHeight};
          }

          console.warn(" mediaConstraints:", mediaConstraints)
          return mediaConstraints;
        },
        // 获取帧率
        getFrameRates(mediaConstraints) {
          if(!mediaConstraints.video) {
            return mediaConstraints;
          }

          let value = this.currentFramerates

          if(value == 'default') {
            return mediaConstraints;
          }

          value = parseInt(value);


          if(!mediaConstraints.video.width || !mediaConstraints.video.height) {
            mediaConstraints.video.width = {};
            mediaConstraints.video.height = {};
          }

          var isScreen = this.currentRecordType.toString().toLowerCase().indexOf('screen') != -1;
          if(isScreen) {
            mediaConstraints.video.frameRate = { max: value}
          }
          else {
            mediaConstraints.video.frameRate = { exact: value};
          }
          return mediaConstraints;
        },
        stopRecordingCallback() {
          let This = this
          This.$refs.downLoadBtn.style.display = "block"
          This.file = This.recorder.getBlob()
          This.url = URL.createObjectURL(This.file)

          This.video.src = This.video.srcObject = null
          This.video.src = This.url
          This.video.muted = false
          This.video.controls = true;
          This.video.play()

          // This.video.controls = true;
          // This.video.muted = false

          This.recorder.destroy()
          This.recorder = null

          let mutiStream = [This.button.stream]
          if(This.audio){
            mutiStream.push(This.audio)
          }
          mutiStream.forEach(function(stream) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
          });
          This.button.stream = null
        },
        mixingStream (stream1, stream2) {
            console.info('mixing audio stream')
            if(!stream1 || !stream2){
              console.info("invalid parameters to mixStream")
              return
            }
            let This = this
            // 混音参数
            window.AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext)

            if (window.AudioContext) {
              if(This.mixStreamContext){
                This.mixStreamContext.close()
                This.mixStreamContext = null
              }
              This.mixStreamContext = new window.AudioContext()
            } else {
              console.error('not support web audio api')
            }

            // 混音
            let destinationParticipant1 = This.mixStreamContext.createMediaStreamDestination()
            if (stream1) {
              let source1 = This.mixStreamContext.createMediaStreamSource(stream1)
              source1.connect(destinationParticipant1)
            }
            if (stream2) {
              let source2 = This.mixStreamContext.createMediaStreamSource(stream2)
              source2.connect(destinationParticipant1)
            }

            return destinationParticipant1.stream
          },
        closeStream(stream){
          if (!stream) {
            console.info('closeStream:stream is null')
            return
          } else {
            console.info('close stream id: ' + stream.id)
          }

          try {
            stream.oninactive = null
            let tracks = stream.getTracks()
            for (let track in tracks) {
              tracks[track].onended = null
              console.info('close stream')
              tracks[track].stop()
            }
          } catch (error) {
            console.info('closeStream: Failed to close stream')
            console.info(error)
          }
        },
        downLoad(){
          let logTime = new Date(parseInt((new Date()).getTime()))
          logTime = beautyDate(logTime)
          let a = document.createElement('a');
          a.target = "_blank";
          a.style.display = 'none';
          a.href = this.url;
          a.download = 'record - '+ logTime +'.mp4';
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
          let file = new File([this.file], fileName, { type: this.type});
          window.open(URL.createObjectURL(file));
        }
      },
        beforeDestroy(){
          if(this.mixStreamContext){
            this.mixStreamContext.close()
            this.mixStreamContext = null
          }
        }
    }
</script>

<style scoped>

  /** 关于普通录制的样式 **/
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
    margin: 0 5px;
    background-color: skyblue;
    color: white;
  }
  .open-new-tab{
    margin: 0 5px;
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
    /*margin:0 auto;*/
    display:flex;
    justify-content: center;
    align-items: center;
    object-fit: inherit;
  }

  .recordContent{
    border: 1px solid #ccc;
    width: 100%;
    height: 500px;
    margin: 5px;
    border-radius: 10px;
    background-color: white;
  }
  #recording-player{
    width: 100%;
    height: 100%;
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
