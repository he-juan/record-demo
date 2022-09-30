<template>
  <div>
    <h2>Options</h2>
    <div class="setDevicesWrapper">
      <div class="setDevices">
        <label class="label">audio Source</label>
        <select id="audioSource" ref="audioSource" @change="getAudioSource">
          <option v-for="(item,index) in audioSourceOption" :key="index" :value="item.value">{{ item.text }}</option>
        </select>
      </div>
      <div class="setDevices">
        <label class="label">audio output device</label>
        <select id="audioOutput" ref="audioOutput" @change="getAudiooutput">
          <option v-for="(item,index) in audioOutputOption" :key="index" :value="item.value">{{ item.text }}</option>
        </select>
      </div>
      <div class="setDevices">
        <label class="label">video Source</label>
        <select id="videoSource" ref="videoSource" @change="getCamera">
          <option v-for="(item,index) in videoSourceOption" :key="index" :value="item.value">{{ item.text }}</option>
        </select>
      </div>
      <div class="setMute" v-show="currentRecordMethod === 'advanced-Recorded' ">
        <label class="label">isMute</label>
        <select id="isMute" ref="isMute" @change="isSetMute">
          <option v-for="(item,index) in muteData" :key="index" :value="item.value">{{ item.value}}</option>
        </select>
      </div>
      <div class="recordMethod">
        <label class="label">record method</label>
        <select class="recording-media" ref="recordMethod" @change="getRecordMethod">
          <option v-for="(item,index) in recordMethodOption" :key="index" :value="item.value">{{ item.text}}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Aside",
    data() {
      return {
        // source
        audioSourceOption: [],
        audioOutputOption: [],
        videoSourceOption: [],
        recordMethodOption:[
          {index: 0, text: 'normal-Recorded', value: 'normal-Recorded'},
          {index: 1, text: 'advanced-Recorded', value: 'advanced-Recorded'}
        ],

        currentAudioSource: '',
        currentAudioutput: '',
        currentVideoSource: '',
        currentRecordMethod: '',

        muteData: [
          {index: 0, value: '否'},
          {index: 1, value: '是'}
        ],
        isMute: '',
      }
    },
    async created() {
      await this.getDevices()
    },

    mounted() {
      this.audioSource = this.$refs.audioSource;
      this.audiooutput = this.$refs.audioOutput;
      this.videoSource = this.$refs.videoSource;
      this.isMuteElement = this.$refs.isMute
      this.recordMethod = this.$refs.recordMethod
      this.currentRecordMethod = this.recordMethodOption[0].value
      this.$store.commit({type: 'setCurrentRecordMethod', content: this.currentRecordMethod})
      // this.getDevices()
    },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      // 获取设备信息
      async getDevices() {
        let This = this
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log('不支持获取设备信息！')
        } else {
          navigator.mediaDevices.enumerateDevices()
            .then(This.showDevice)
            .catch((err) => {
              console.log(err.name + ':' + err.message)
            })
          // let devices = await navigator.mediaDevices.enumerateDevices()
          // await This.showDevice(devices)
        }
      },
      // 展示设备信息
      showDevice(deviceInfos) {
        const This = this
        deviceInfos.forEach(function (deviceinfo) {
          var option = {
            text: deviceinfo.label || deviceinfo.deviceId,
            value: deviceinfo.deviceId
          }
          console.log(deviceinfo);
          if (deviceinfo.deviceId !== 'default' && deviceinfo.deviceId !== 'communications') {
            if (deviceinfo.kind === 'audioinput') {
              This.audioSourceOption.push(option)
            } else if (deviceinfo.kind === 'audiooutput') {
              This.audioOutputOption.push(option)
            } else if (deviceinfo.kind === 'videoinput') {
              This.videoSourceOption.push(option)
            }
          }
        })

        console.warn("This.audioSourceOption:", This.audioSourceOption)
        if(This.audioSourceOption.length && This.audioSourceOption[0].value){
          This.currentAudioSource = This.audioSourceOption[0].value
          This.$store.commit({type: 'setCurrentAudioSource', content: This.currentAudioSource})
        }
        if(This.audioOutputOption.length && This.audioOutputOption[0].value){
          This.currentAudioutput = This.audioOutputOption[0].value
          This.$store.commit({type: 'setCurrentAudioOutput', content: This.currentAudioutput})
        }
        if(This.videoSourceOption.length && This.videoSourceOption[0].value){
          This.currentVideoSource = This.videoSourceOption[0].value
          This.$store.commit({type: 'setCurrentVideoSource', content: This.currentVideoSource})
        }

        // This.currentAudioSource = This.audioSourceOption[0].value
        // This.currentAudioutput = This.audioOutputOption[0].value
        // This.currentVideoSource = This.videoSourceOption[0].value
        // This.$store.commit({type: 'setCurrentAudioSource', content: This.currentAudioSource})
        // This.$store.commit({type: 'setCurrentAudioOutput', content: This.currentAudioutput})
        // This.$store.commit({type: 'setCurrentVideoSource', content: This.currentVideoSource})

        This.$store.commit({type: 'setMuteState', content: This.isMuteElement.value === '是' ? true : false })
        console.warn("This.$store:",This.$store)
      },
      // 获取当前麦克风输入设备
      getAudioSource() {
        this.currentAudioSource = this.audioSource.value;
        // console.warn("this.currentAudioSource:",this.currentAudioSource)
        this.$store.dispatch("modifyAudioSource", {content: this.currentAudioSource})
        // this.getUserMediaOfAudio()
      },
      // 获取当前麦克风输出设备
      getAudiooutput() {
        this.currentAudioutput = this.audiooutput.value;
        // this.attachSinkId()
        this.$store.dispatch("modifyAudioOutput", {content: this.currentAudioutput})
      },
      // 获取当前摄像头
      getCamera() {
        this.currentVideoSource = this.videoSource.value;
        this.$store.dispatch("modifyVideoSource", {content: this.currentVideoSource})
      },
      // 获取当前页面的录制方式
      getRecordMethod(){
        this.currentRecordMethod = this.recordMethod.value
        this.$store.dispatch("modifyRecordMethod", {content: this.currentRecordMethod})
      },
      attachSinkId(element, sinkId) {
        if (typeof element.sinkId !== 'undefined') {
          element.setSinkId(sinkId)
            .then(() => {
              console.log(`Success, audio output device attached: ${sinkId}`);
            })
            .catch(error => {
              let errorMessage = error;
              if (error.name === 'SecurityError') {
                errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
              }
              console.error(errorMessage);
              // Jump back to first output device in the list as it's the default.
              audioOutputSelect.selectedIndex = 0;
            });
        } else {
          console.warn('Browser does not support output device selection.');
        }
      },
      // 拿到音频媒体流
      async getUserMediaOfAudio() {
        console.log(`Requesting audio stream`)
        let constraints = {
          audio: {
            exact: {
              deviceId: this.currentAudioSource
            },
            noiseSuppression: true,
            echoCancellation: true
          }
        }

        if ('mediaDevices' in navigator) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            let isMute = this.isMuteElement.value === '是' ? true : false ;
            this.streamMuteSwitch({stream: stream, type: 'audio', mute: isMute})
            this.$store.commit({type: 'setAudioStream', content: stream})
            console.log('Received local audio stream')
          } catch (error) {
            console.log(`getUserMedia error: ${error}`)
          }
        }
      },
      // 获取页面当前是否静音
      isSetMute() {
        let isMute = this.isMuteElement.value === '是' ? true : false ;
        this.$store.dispatch("modifyMuteState", {content: isMute})
        // let audioStream = this.$store.getters.getAudioStream
        //
        // this.streamMuteSwitch({stream: audioStream, type: 'audio', mute: isMute})
      },
      // 处理当前静音/非静音逻辑
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
  }
</script>

<style scoped>
  h2{
    width: 100%;
    height: 30px;
    text-align: center;
    margin: 20px 0;
  }
  .setDevicesWrapper{
    margin-top: 20px;
  }
  .setDevices, .setMute, .recordMethod{
    width: 100%;
    height: 80px;
    margin: 5px ;
  }
  .label{
    color: white;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    margin: 2px ;
  }
  select{
    width: 240px;
    height: 40px;
    margin: 5px;
  }
  /*option{*/
  /*width:240px;*/
  /*}*/

</style>
