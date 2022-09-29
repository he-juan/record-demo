<template>
  <div class="recordMutistream">
    <div class="recordContainer">
      <div class="downLoadBtn" style="text-align: center; display:none;" ref="downLoadBtn">
        <button class="save-to-disk" @click="downLoad">Save To Disk</button>
        <button class="open-new-tab" @click="startNewTab">Open New Tab</button>
      </div>
      <h2 style="display: block;" ref="H2"></h2>
      <div class="mutistreamContent" >

        <audio class="mutistreamVideo" ref="mutistreamAudio" width="720"  style="transform: scale(1)"></audio>
      </div>
    </div>
  </div>
</template>

<script>
    import beautyDate from '@/api/day.js'
    import FileSelector from  '@/api/fileSelector.js'
    import StereoAudioRecorder from "@/api/StereoAudioRecorder"
    import MultiStreamsMixer from 'multistreamsmixer';
    import RecordRTC from 'recordrtc'
    import {Bus} from "@/common/Bus.js"
    export default {
        name: "MicrophoneAndMp3Record",
        mounted(){
          let This = this
          This.video = This.$refs.mutistreamAudio;
          This.h2 = This.$refs.H2
          This.isMute = This.$store.getters.getMuteState
          Bus.$on('microphoneMp3Recording',(data)=>{
            This.button = data.element
            This.button.value = data.value
            This.startRecording()
          })
          Bus.$on("isMute",(data)=>{
            console.warn("data:",data)
            This.isMute = data.value
            if(This.audioStream){
              This.streamMuteSwitch({stream: This.audioStream, type: 'audio', mute: This.isMute})
            }
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
            This.getMp3Stream(function(mp3Stream) {
              This.mp3Stream = mp3Stream
              let constraints = {
                audio: {
                  exact: {
                    deviceId: This.$store.getters.getCurrentAudioSource,
                  },
                  noiseSuppression: true,
                  echoCancellation: true
                }
              }
              navigator.mediaDevices.getUserMedia(constraints).then(function(microphoneStream) {
                This.audioStream = microphoneStream
                if(This.audioStream){
                  This.streamMuteSwitch({stream: This.audioStream, type: 'audio', mute: This.isMute})
                }
                let mixer = new MultiStreamsMixer([microphoneStream, mp3Stream]);
                // mixer.useGainNode = false;
                var audioPreview = document.createElement('audio');
                audioPreview.controls = true;
                audioPreview.autoplay = true;

                audioPreview.srcObject = mixer.getMixedStream();

                This.video.replaceWith(audioPreview);
                This.video = audioPreview;

                var secondsLeft = 3;
                (function looper() {
                  secondsLeft--;

                  if(secondsLeft < 0) {
                    This.h2.innerHTML = 'Mixed Microphone+Mp3!';
                    return;
                  }
                  This.h2.innerHTML = 'Seconds left: ' + secondsLeft;
                  setTimeout(looper, 1000);
                })();

                console.warn("StereoAudioRecorder:",StereoAudioRecorder)
                This.recorder = RecordRTC(mixer.getMixedStream(), {
                  // recorderType: StereoAudioRecorder
                  mimeType: 'audio/webm',
                  timeSlice: 1000,
                  type: 'audio',
                });
                Bus.$emit("startRecordingMp3", {isRecording: false, value: 'Stop Recording'})
                This.recorder.startRecording();

                // setTimeout(function() {
                //   This.recorder.stopRecording(function() {
                //     audioPreview.removeAttribute('srcObject');
                //     audioPreview.removeAttribute('src');
                //     This.file = This.recorder.getBlob()
                //     This.url = URL.createObjectURL(This.file)
                //     audioPreview.src = This.url;
                //   });
                // }, 5000)
              });
            });
          },
          getMp3Stream(callback) {
            var selector = new FileSelector();
            selector.accept = '*.mp3'|| '*.wav';
            selector.selectSingleFile(function(mp3File) {
              window.AudioContext = window.AudioContext || window.webkitAudioContext;
              var context = new AudioContext();
              var gainNode = context.createGain();
              gainNode.connect(context.destination);
              gainNode.gain.value = 0; // don't play for self

              var reader = new FileReader();
              reader.onload = (function(e) {
                // Import callback function
                // provides PCM audio data decoded as an audio buffer
                context.decodeAudioData(e.target.result, createSoundSource);
              });
              reader.readAsArrayBuffer(mp3File);

              function createSoundSource(buffer) {
                var soundSource = context.createBufferSource();
                soundSource.buffer = buffer;
                soundSource.start(0, 0 / 1000);
                soundSource.connect(gainNode);
                var destination = context.createMediaStreamDestination();
                soundSource.connect(destination);

                // durtion=second*1000 (milliseconds)
                callback(destination.stream, buffer.duration * 1000);
              }
            }, function() {
              document.querySelector('#btn-get-mixed-stream').disabled = false;
              alert('Please select mp3 file.');
            });
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
            Bus.$emit("startRecordingMp3", {isRecording: true, value: 'Start Recording'})
            This.$refs.downLoadBtn.style.display = "block"
            let mutiStream = [This.mp3Stream, This.audioStream]
            mutiStream.forEach(function(stream) {
              stream.getTracks().forEach(function(track) {
                track.stop();
              });
            });
            This.mp3Stream = This.audioStream = null
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
        },
        beforeDestroy(){
          Bus.$off('microphoneMp3Recording')
          Bus.$off("isMute")
          this.mixStreamContext.close()
          this.mixStreamContext = null
        }
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
