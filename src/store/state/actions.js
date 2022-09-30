import {Bus} from "@/common/Bus.js"
export default{
    async modifyShareScreen(context) {
      // console.warn("state:",state)
      // setTimeout(()=>{
        await context.commit("setShareScreen", {content: 'false'})
      // },1000)
    },
   async modifySlidesStream(context){
      await context.commit("setSlidesStream",{content: null})
   },
   async modifyShareType(context){
     await context.commit("setShareType",{content: null})
   },

   async modifyAudioSource(context,data){
     await context.commit("setCurrentAudioSource",{content: data.content})
   },
   async modifyAudioOutput(context,data){
     await context.commit("setCurrentAudioOutput",{content: data.content})
   },
   async modifyVideoSource(context,data){
      await context.commit("setCurrentVideoSource",{content: data.content})
   },
   async modifyRecordMethod(context,data){
     await context.commit("setCurrentRecordMethod",{content: data.content})
   },
   async modifyMuteState(context,data){
      await context.commit("setMuteState",{context:data.content})
      Bus.$emit("isMute",{value:data.content})
   }

}
