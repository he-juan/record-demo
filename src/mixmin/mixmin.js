export const mixins = {
  // data() {
  //   return {
  //     msg: "我是小猪课堂",
  //   };
  // },
  // computed: {},
  // created() {
  //   console.log("我是mixin中的created生命周期函数");
  // },
  // mounted() {
  //   console.log("我是mixin中的mounted生命周期函数");
  // },
  methods: {
    getUserMedia(content) {
      window.content = content
      console.warn("content:",content.event)
      let This = this
      if(content.event.target.innerText === '标准'){
        This.$store.commit({type:'setShareType',content:'标准'})
      }else if(content.event.target.innerText === '高级'){
        This.$store.commit({type:'setShareType',content:'高级'})
      }

      let constraints,data;
      if(content.type === 'screenShare'){
        constraints={
          audio: true,
          video: {
            width: { max:  1920 },
            height: { max:  1080 },
            frameRate: { max: 15 },
            // displaySurface: 'monitor', // monitor, window, application, browser
            // logicalSurface: true,
            // cursor: 'always' // never, always, motion
          }
        }

        data ={
          streamType: content.type,
          callback:function(event){
            if(event.stream){
              let stream = event.stream
              This.$store.commit({type: 'setSlidesStream',content: stream})
              This.$store.dispatch("modifyShareScreen")

            }else{
              console.warn("error:",event.error)
            }
          }
        }
      }
      getMedia(data,constraints)
      function getMedia (data, constraints) {
        console.warn('getMedia')
        function onGetStreamSuccess (stream) {
          console.info('get stream success constraints: ' + JSON.stringify(constraints, null, '  '))
          data.callback({stream: stream ||data.stream})
        }

        function onGetStreamFailed (error) {
          data.error = error
          console.warn('get stream failed: ' + JSON.stringify(constraints, null, '  '))
          console.warn('onGetStreamFailed error message: ' + error.message)
          console.warn('error name: ' + error.name)
          console.warn('error constraint: ' + error.constraints)
          if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError' || error.name === 'Error') {
            // constraints can not be satisfied by avb.device
            console.info('constraints can not be satisfied by avb.device')
            data.callback({ error: error, constraints: constraints})
          } else {
            if (error.name === 'NotFoundError' || error.name === 'DeviceNotFoundError') {
              // require track is missing
              console.info('require track is missing')
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
              // webcam or mic are already in use
              console.info('webcam or mic are already in use')
            } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.name === 'PermissionDismissedError') {
              // permission denied in browser
              console.info('permission denied in browser')
            } else if (error.name === 'TypeError') {
              // empty constraints object
              console.info('empty constraints object')
            } else {
              // other errors
              console.info('other errors ' + error.name)
            }
            data.callback({ error: error })
          }
        }

        if (data.streamType === 'audio' ) {
          navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
          // this.getUserMediaWithTimeout(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
        } else if(data.streamType === 'video'){
          if (!data.isFirefox && data.stream && data.stream.getVideoTracks().length && data.stream.active) {
            let videoTrack
            let constraintsOfApply = {
              width:{exact: constraints.video.width.exact},
              height:{exact: constraints.video.height.exact},
            }
            videoTrack = data.stream.getVideoTracks()[0]
            if (videoTrack && videoTrack.applyConstraints) {
              console.info('applyConstraints constraints: ' + JSON.stringify(constraintsOfApply, null, '    '))
              videoTrack.applyConstraints(constraintsOfApply).then(function(){
                console.info('video applyConstraints success!')
                data.callback({ stream: data.stream})
              }).catch(onGetStreamFailed)
            }
          }else{
            navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
            // this.getUserMediaWithTimeout(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
          }
        } else if (data.streamType === 'screenShare') {
          if(window.ipcRenderer){
            console.info('ipcRenderer getUserMedia for screen')
            navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
          }else {
            if (navigator.getDisplayMedia) {
              // for Edge old version
              navigator.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
            } else if (navigator.mediaDevices.getDisplayMedia) {
              // for all supported getDisplayMedia browser versions
              navigator.mediaDevices.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
            } else if (navigator.mediaDevices.getUserMedia) {
              navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
            } else {
              console.info('getDisplayMedia is not supported by current browser')
            }
          }
        }
      }
    },
    closeStream(stream){
      if (!stream) {
        log.info('closeStream:stream is null')
        return
      } else {
        log.info('close stream id: ' + stream.id)
      }

      try {
        stream.oninactive = null
        let tracks = stream.getTracks()
        for (let track in tracks) {
          tracks[track].onended = null
          log.info('close stream')
          tracks[track].stop()
        }
      } catch (error) {
        log.info('closeStream: Failed to close stream')
        log.info(error)
      }
      stream = null
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
};
