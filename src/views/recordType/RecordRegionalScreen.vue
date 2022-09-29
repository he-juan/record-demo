<template>
  <div class="main">
    <div class="videoContent">
      <div class="screenContrainter" ref="shareScreen" >
        <div class="shareScreenContent" ref="shareLocalVideo">
          <video
            class="shareScreenVideo"
            ref="showScreenLocalVideo"
            width="1920"
            height="1080"
            style="transform: scale(1)"
            @mousedown="handleMouseMove"
            @mouseup="handleMouseUP"
          ></video>
        </div>
      </div>

      <div class="screenContrainter2">
        <div class="shareScreenContentWrapper">
          <div class="shareScreenContent2" >
            <canvas class="shareScreenCanvas"  ref="showScreenCanvas" width="1920" height="1080" style="transform: scale(1);"></canvas>
          </div>
        </div>
        <!--<div class="recordBtnWrapper">-->
          <!--<div class="recordBtn">-->
            <!--&lt;!&ndash;<button @click="startRecording()">开始录制</button>&ndash;&gt;-->
            <!--&lt;!&ndash;&lt;!&ndash;&lt;!&ndash;<button @click="start_Record()">暂停录制</button>&ndash;&gt;&ndash;&gt;&ndash;&gt;-->
            <!--&lt;!&ndash;&lt;!&ndash;&lt;!&ndash;<button @click="start_Record()">恢复录制</button>&ndash;&gt;&ndash;&gt;&ndash;&gt;-->
            <!--&lt;!&ndash;<button @click="stopRecording()">停止录制</button>&ndash;&gt;-->
            <!--&lt;!&ndash;&lt;!&ndash;<button @click="videoDownload()">下载视频</button>&ndash;&gt;&ndash;&gt;-->
          <!--</div>-->
        <!--</div>-->
      </div>

      <div class="screenContrainter3">
        <!--<div class="shareScreenContentWrapper">-->
          <div class="recordBtn">
            <button @click="download()">下载视频</button>
            <button @click="openNewTab()">open new tab</button>
          </div>
          <div class="shareScreenContent2" >
            <video  class="shareScreenRecord"  ref="shareScreenRecord" width="1920" height="1080" style="transform: scale(1);" ></video>
          </div>
        </div>
        <!--<div class="recordBtnWrapper">-->
          <!--<div class="recordBtn">-->
            <!--<button @click="download()">下载视频</button>-->
            <!--<button @click="openNewTab()">open new tab</button>-->
          <!--</div>-->
        <!--</div>-->
      <!--</div>-->

      <!--<div class="screenContrainter">-->
      <!--<div class="shareScreenContent" >-->
      <!--<video  class="shareScreenRecord"  ref="shareScreenRecord" width="1920" height="1080" style="transform: scale(1); " ></video>-->
      <!--</div>-->
      <!--</div>-->

    </div>
  </div>
</template>

<script>
  import RecordRTC from 'recordrtc'
  import beautyDate from '@/api/day.js'
  import {Bus} from "@/common/Bus.js"
  export default {
    name: "MainView",
    data(){
      return {
        // showShareScreen: false,   // 是否显示演示流
        timer:'',
        isOpenShareScreen: false,       // 是否开启演示

      }
    },
    created() {
      if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
        const error = 'Your browser does NOT support the getDisplayMedia API.'
        throw new Error(error)
      }
    },
    mounted() {
      if(!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
        let error = 'Your browser does NOT supports getDisplayMedia API.';
        throw new Error(error);
      }
      this.localVideo = this.$refs.showScreenLocalVideo
      this.canvas = this.$refs.showScreenCanvas;
      this.ctx = this.canvas.getContext("2d");
      this.recordVideo = this.$refs.shareScreenRecord
      this.isMute = this.$store.getters.getMuteState

      this.$nextTick(()=>{
        Bus.$on("shareScreen",(data)=>{
          console.warn("shareScreen:",data)
          this.shareScreenBtn = data.element
          this.shareScreenBtn.value = data.value
          this.getDisplayMedia()
        })

        Bus.$on("isMute",(data)=>{
          console.warn("data111:",data)
          this.isMute = data.value
          if(this.audioStream){
            this.streamMuteSwitch({stream: this.audioStream, type: 'audio', mute:this.isMute})
          }
        })

      })
      Bus.$on("startRecordingScreen",(data)=>{
        console.warn("data:",data)
        this.recordingBtn = data.element
        this.recordingBtn.value = data.value
        this.startRecording()
      })

    },
    methods:{
      async getAudioStream() {
        console.log(`Requesting audio stream`)
        let constraints = {
          audio: {
            exact: {
              deviceId: this.$store.getters.getCurrentAudioSource,
            },
            noiseSuppression: true,
            echoCancellation: true
          }
        }

        if ('mediaDevices' in navigator) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            this.audioStream  = stream
            if(this.isMute){
              this.streamMuteSwitch({stream: this.audioStream, type: 'audio', mute:this.isMute})
            }
            // this.myVideo.srcObject = stream
            // this.localStream = stream
            // this.localStream = this.myVideo.captureStream()
            // let isMute = this.isMuteElement.value === '是' ? true : false ;
            // this.streamMuteSwitch({stream: stream, type: 'audio', mute: isMute})
            // this.$store.commit({type: 'setAudioStream', content: stream})
            console.log('Received local audio stream')
          } catch (error) {
            console.log(`getUserMedia error: ${error}`)
            alert(error)
          }
        }
      },
      getDisplayMedia() {
        let This = this
        let video = This.localVideo
        let canvas = This.canvas
        video.src = video.srcObject = null
        let displaymediastreamconstraints = {
          audio: true,
          video: {
            width: { max:  1920 },
            height: { max:  1080 },
            frameRate: { max: 15 },
          }
        };

        if(navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(function(stream){
            console.warn("get stream success")
            This.getAudioStream()
            This.isOpenShareScreen = true,
            This.shareScreenStream = stream
            This.localVideo.srcObject = stream
            video.oncanplay = function () {
              video.play()
              video.muted = true
              video.style.width = video.videoWidth / 3 + 'px'
              video.style.height = video.videoHeight / 3 + 'px'
              canvas.style.width = video.videoWidth / 3 + 'px'
              canvas.style.height = video.videoHeight / 3 + 'px'
            }
            if(This.shareScreenStream){
              Bus.$emit("isDisplayBtn",{value: false})
            }
            This.addStreamStopListener(stream, function() {
              console.warn("addStreamStopListener addStreamStopListener")
              if(This.recorder){
                This.recorder.stopRecording(This.stopRecordingCallback)
              }else{
                let mutiStream = [This.shareScreenStream, This.audioStream]
                mutiStream.forEach(function(stream) {
                  stream.getTracks().forEach(function(track) {
                    track.stop();
                  });
                });

                This.shareScreenStream = null
                This.audioStream = null
                Bus.$emit("isDisplayBtn",{value: true})
              }
            });

          }).catch(function(error){
            alert(error)
          });
        }
        else {
          navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(function(stream){
            console.warn("get stream success")
            This.getAudioStream()
            This.isOpenShareScreen = true
            This.shareScreenStream = stream
            This.localVideo.stream = stream
            This.localVideo.srcObject = stream
            video.oncanplay = function () {
              video.play()
              video.muted = true
              video.style.width = video.videoWidth / 3 + 'px'
              video.style.height = video.videoHeight / 3 + 'px'
              canvas.style.width = video.videoWidth / 3 + 'px'
              canvas.style.height = video.videoHeight / 3 + 'px'
            }
            if(This.shareScreenStream){
              Bus.$emit("isDisplayBtn",{value: false})
            }

            This.addStreamStopListener(stream, function() {
              console.warn("111 addStreamStopListener addStreamStopListener")
              if(This.recorder){
                This.recorder.stopRecording(This.stopRecordingCallback)
              }else{

                let mutiStream = [This.shareScreenStream, This.audioStream]
                mutiStream.forEach(function(stream) {
                  stream.getTracks().forEach(function(track) {
                    track.stop();
                  });
                });

                This.shareScreenStream = null
                This.audioStream = null
                Bus.$emit("isDisplayBtn",{value: true})
              }
            });
          }).catch(function(error){
            alert(error)
          });
        }
      },
      handleMouseMove (ev) {
        let This = this
        let video = This.localVideo
        let container = this.$refs.shareLocalVideo
        if(document.getElementById("mask")){
          document.getElementById("mask").remove()
        }
        ev = window.event || ev;
        //1.获取按下的点

        let x1 = ev.clientX  - container.offsetLeft;
        let y1 = ev.clientY  - container.offsetTop;
        let startX = ev.clientX - video.getBoundingClientRect().left  ;
        let startY = ev.clientY - video.getBoundingClientRect().top ;
        startX = startX * 3;
        startY = startY * 3;
        console.warn("startX:",startX + " * " +startY)

        This.startX = startX
        This.startY = startY


        //2.创建div
        var oDiv = document.createElement("div");
        oDiv.id = "mask"
        container.appendChild(oDiv);
        oDiv.style.cssText="width: 0; height: 0; background: lightblue; opacity: 0.4; position: absolute; z-index:999";

        video.onmousemove = function (ev) {
          console.warn("222")
          ev = window.event || ev;

          var x2 = ev.clientX  - container.offsetLeft;
          var y2 = ev.clientY  - container.offsetTop ;
          //3.设置div的样式
          oDiv.style.left = (x2 > x1 ? x1 : x2) +"px";
          oDiv.style.top = (y2 > y1 ? y1 : y2) +"px";
          oDiv.style.width = Math.abs(x2-x1)+"px";
          oDiv.style.height = Math.abs(y2-y1)+"px";
        }
        return false;  //解除在划动过程中鼠标样式改变的BUG
      },
      handleMouseUP (e) {
        let This = this
        let canvas = This.canvas
        let video = This.localVideo
        video.onmousemove = null;
        // let endX = e.clientX - video.getBoundingClientRect().left  ;
        // let endY = e.clientY - video.getBoundingClientRect().top ;

        /***设置canvas绘制的大小****/
        let mask = document.getElementById("mask")
        canvas.style.width = mask.offsetWidth + 'px'
        canvas.style.height = mask.offsetHeight + 'px'

        /**得到设置区域的像素大小**/
        let rangeW = video.videoWidth * (mask.offsetWidth / video.offsetWidth);
        let rangeH = video.videoHeight * (mask.offsetHeight / video.offsetHeight) ;

        // This.rangeW = rangeW
        // This.rangeH = rangeH
        /**在canvas中绘制区域大小**/
        // startDraw(video, canvas, ctx, startX , startY, rangeW, rangeH)

        // /************切换页面时获取流******************/
        video.ontimeupdate = function(){
          console.warn("draw draw draw draw")
          startDraw(video, canvas, This.ctx, This.startX , This.startY, rangeW, rangeH)
        }
        function startDraw(video, canvas, ctx, startX, startY, rangeW, rangeH){

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          playCanvas(video, canvas, ctx, startX, startY, rangeW, rangeH)
        }

        function playCanvas(video,canvas,ctx,sx,sy,rangeW,rangeH){
          ctx.drawImage(video, sx, sy, rangeW, rangeH, 0, 0, canvas.width, canvas.height);
          This.timer = requestAnimationFrame(() => {
            if(This.shareScreenStream){
              playCanvas(video, canvas, ctx, sx, sy, rangeW, rangeH);
            }
          })
        }

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
      startRecording(){
        let This = this
        if( !This.shareScreenStream || !document.getElementById("mask") ){
          alert("当前没有获取流，请检查； 或者没有选取区域")
          return
        }
        if(This.recordingBtn.value === "Stop Recording"){
           This.stopRecording()
          return
        }else{
          let screen = This.canvas.captureStream(60)
          let mask = document.getElementById("mask")
          This.recordVideo.style.width = mask.offsetWidth + 'px'
          This.recordVideo.style.height = mask.offsetHeight + 'px'
          This.recordVideo.srcObject = screen
          This.recordVideo.play()
          This.recordVideo.muted = true
          // let mixStream = []

          if(This.audioStream.getAudioTracks().length > 0){
            if(This.shareScreenStream && This.shareScreenStream.getAudioTracks().length > 0){
              // screen.addTrack(This.shareScreenStream.getAudioTracks()[0])
              let mixAudioStream = This.mixingStream(This.shareScreenStream, This.audioStream)
              let audioTrack = mixAudioStream.getAudioTracks()[0]
              screen.addTrack(audioTrack)
            }else{
              screen.addTrack(This.audioStream.getAudioTracks()[0])
            }
          }

          This.recorder = RecordRTC(screen, {type: 'video'})
          This.recorder.startRecording()
          // This.button.value = 'Stop Recording'
          Bus.$emit("recordingValue", {isRecording: false, value: 'Stop Recording'})
        }


      },
      stopRecordingCallback() {
        this.recordVideo.src = null
        this.recordVideo.srcObject = null
        this.file = this.recorder.getBlob()
        console.warn("file:",this.file)
        this.url = URL.createObjectURL(this.file)
        this.recordVideo.src = this.url
        this.recordVideo.play()
        this.recordVideo.controls = true;
        this.recordVideo.muted = false

        if(this.timer){
          console.warn("this.timer this.timer this.timer this.timer this.timer")
          window.cancelAnimationFrame(this.timer);
        }

        document.getElementById("mask").remove()
        this.localVideo.onmousermove = null
        this.localVideo.onmouserup = null
        this.localVideo.onmouserup = null
        this.localVideo.ontimeupdate = null
        this.localVideo.src = this.localVideo.srcObject = null
        this.startX =  this.startY = null

        this.ctx.clearRect(0,0, this.canvas.width,this.canvas.height)
        let mutiStream = [this.shareScreenStream, this.audioStream]
        mutiStream.forEach(function(stream) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
        });
        this.shareScreenStream = null
        this.recorder.destroy()
        this.recorder = null
        // this.button.value = 'Start Recording'
        Bus.$emit("recordingValue", {isRecording: false, value: 'Start Recording'})
        Bus.$emit("isDisplayBtn",{value: true})
      },
      stopRecording() {
        let This = this
        This.recorder.stopRecording(This.stopRecordingCallback)
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
      downLoad(){
        let logTime = new Date(parseInt((new Date()).getTime()))
        logTime = beautyDate(logTime)
        let a = document.createElement('a');
        a.target = "_blank";
        a.style.display = 'none';
        console.warn("this.url:",this.url)
        a.href = this.url;
        a.download = 'recorded- '+ logTime +'.mp4';
        document.body.appendChild(a);
        a.click();
        // setTimeout(function() {
        //   document.body.removeChild(a);
        //   window.URL.revokeObjectURL(this.url);
        // }, 100);
      },
      openNewTab(){
        let logTime = new Date(parseInt((new Date()).getTime()))
        logTime = beautyDate(logTime)
        let fileName = 'recorder_'+ logTime +'.webm'
        let file = new File([this.file], fileName, { type: 'video/webm'});
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
      Bus.$off('startRecordingScreen')
      Bus.$off('shareScreen')
      Bus.$off("isMute")
      if(this.mixStreamContext){
        this.mixStreamContext.close()
        this.mixStreamContext = null
      }
    }
  }
</script>

<style scoped>
  .main{
    width:100%;
    height:100%;
  }
  .selectScreen{
    width:100%;
    height:400px;
    background-color: white;
    border-radius:10px;
    font-family:"Microsoft YaHei UI",Arial,"Times New Roman";
    position: relative;
  }

  .select-top{
    width:100%;
    height: 40px;
    border-top-left-radius:10px;
    border-top-right-radius: 10px;
    background-color: #dde3e3;
    display:flex;
    justify-content: flex-end;
    line-height:40px;
  }
  .select-top .title{
    width: 95%;
    font-weight: bolder;
  }
  .select-top .icon{
    width: 5%;
  }
  .select-top .icon:hover{
    background-color: #ccc;
  }

  .select-middle{
    width:100%;
    height:40px;
    display:flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .select-middle .title{
    background-color: #dde3e3;
    /*width: 40px;*/
    display:flex;
    justify-content: center;
    align-items: center;
  }

  .select-middle .title div{
    width: 100px;
    text-align: center;
  }

  .select-middle .title div:hover{
    background-color: dodgerblue;
    color:white;
  }

  .select-bottom{
    position: absolute;
    bottom:0;
    left:0;
    display:flex;
    justify-content: center;
    align-items: center;
    width:100%;
  }

  /*.videoContent{*/
  /**/
  /*}*/

  .screenContrainter{
    border: 1px solid #ccc;
    width: 100%;
    height:400px;
    display:flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    border-radius: 10px;
    background-color: white;
  }

  .screenContrainter2{
    border: 1px solid #ccc;
    width: 100%;
    height:400px;
    display:flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    border-radius: 10px;
    background-color: white;
  }

  .screenContrainter3{
    border: 1px solid #ccc;
    width: 100%;
    height:400px;
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    border-radius: 10px;
    background-color: white;
  }


  .shareScreenContent{
    width:640px;
    height:360px;
    overflow: hidden;
    display:flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .shareScreenContentWrapper{
    width:100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

  }

  .shareScreenContent2{
    width:640px;
    height:360px;
    overflow: hidden;
    display:flex;
    justify-content: center;
    align-items: center;
    /*position: relative;*/

  }
  /*.recordBtnWrapper{*/
    /*width:10%;*/
    /*height:360px;*/
    /*display:flex;*/
    /*justify-content: center;*/
    /*align-items: center;*/
  /*}*/

  .recordBtn{
    width:100%;
    height:100px;
    /*position:relative;*/
    /*right:0;*/
    /*top:0;*/
    display:flex;
    flex-direction: row;
    justify-content:space-around;
    align-items: center;
  }

  /*.recordBtn button {*/
    /*width: 90px;*/
    /*height: 50px;*/
    /*background-color: #8c818a;*/
    /*color: white;*/
    /*margin: 8px 5px;*/
    /*padding: 3px;*/
    /*border: 0;*/
    /*border-radius: 8px;*/
    /*transition: all 200ms;*/
    /*font-size: small;*/
  /*}*/

  .shareScreenContent .shareScreenCanvas, .shareScreenRecord{
    /*border: 1px solid #ccc;*/
    line-height: 360px;
    display:flex;
    justify-content: center;
    align-items: center;
  }

  .shareScreenRecord{
    object-fit: inherit;
  }

  .shareScreenVideo{
    margin:0 auto;
    display:flex;
    justify-content: center;
    align-items: center;
  }

  .show{
    display:none;
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
    margin: 5px;
  }

</style>
