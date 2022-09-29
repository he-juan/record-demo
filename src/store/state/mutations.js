export default{
    setShareType:(state, payload) =>{
       state.shareType = payload.content
    },

    setShareScreen:(state, payload)=>{
      state.shareScreen  = payload.content
    },

    setSlidesStream:(state,payload)=>{
      state.slidesStream = payload.content
    },

    setMainStream:(state,payload)=>{
      state.mainStream = payload.content
    },
    setAudioStream:(state,payload)=>{
      state.audioStream = payload.content
      console.warn("state：",state)
    },

    setRecordStream:(state,payload)=>{
      state.recordStream = payload.content
    },
    setCurrentAudioSource:(state, payload)=>{
       state.currentAudioSource = payload.content
    },
    setCurrentAudioOutput:(state,payload)=>{
       state.currentAudioutput = payload.content
    },
    setCurrentVideoSource:(state,payload)=>{
       state.currentVideoSource = payload.content
    },
    setCurrentRecordMethod:(state,payload)=>{
      state.currentRecordMethod = payload.content
    },
    setMuteState:(state,payload)=>{
      state.setMuteState = payload.content
    }

}
