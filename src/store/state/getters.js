export default{
    getShareScreen:(state)=>{
        return state.shareScreen
    },

    getShareType:(state)=>{
      return state.shareType
    },

    getSlidesStream:(state)=>{
      return state.slidesStream
    },
    getMainStream:(state)=>{
      return state.mainStream
    },
    getAudioStream:(state)=>{
      return state.audioStream
    },

    getRecordStream:(state)=>{
      return state.slidesStream
    },

    getCurrentAudioSource:(state)=>{
       return state.currentAudioSource
    },
    getCurrentAudioutput:(state)=>{
       return state.currentAudioutput
    },
    getCurrentVideoSource:(state)=>{
       return state.currentVideoSource
    },
    getCurrentRecordMethod:(state)=>{
      return state.currentRecordMethod
    },
    getMuteState:(state)=>{
      return state.setMuteState
    }
}
