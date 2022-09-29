<template>
  <div class="record">

    <div v-if="currentRecordMethod ==='normal-Recorded'" class="recordWrapper">
      <!--#region-->
      <!--<div class="recordBttonWrapper">-->
        <!--<div class="recordBtton">-->
          <!--<div>-->
            <!--<select class="recording-media" @change="getNormalRecordMedia" ref="normalRecordMedia">-->
              <!--<option v-for="(item,index) in normalRecordingMedia" :key="index" :value="item.value">{{item.text}}</option>-->

            <!--</select>-->
          <!--</div>-->

          <!--<div>-->
            <!--<select class="media-resolutions" @change="getNormalMediaResolution" ref="normalMediaResolutions">-->
              <!--<option v-for="(item,index) in mediaResolutions" :key="index" :value="item.value">{{item.text}}</option>-->
            <!--</select>-->
          <!--</div>-->

          <!--<div>-->
            <!--<select class="media-framerates" @change="getNormalMediaFramerates" ref="normalMediaFramerates">-->
              <!--<option v-for="(item,index) in mediaFramerates" :key="index" :value="item.value">{{item.text}}</option>-->
            <!--</select>-->
          <!--</div>-->

          <!--<div class="recordBtn">-->
            <!--<button class="startBtn" @click="handleRecord" ref="startBtn"> Start Recording</button>-->
          <!--</div>-->
          <!--&lt;!&ndash;<div class="recordBtn">&ndash;&gt;-->
          <!--&lt;!&ndash;<button class="stopBtn"> stop Record</button>&ndash;&gt;-->
          <!--&lt;!&ndash;</div>&ndash;&gt;-->
        <!--</div>-->
      <!--</div>-->

      <!--<div class="recordContent">-->
        <!--<div id="recording-player" ref="recordingPlayer">-->
          <!--&lt;!&ndash;<h2>三餐四季</h2>&ndash;&gt;-->
          <!--<div style="text-align: center; display:none; height:50px;" ref="downLoadBtn">-->
            <!--<button class="save-to-disk" @click="downLoad">Save To Disk</button>-->
            <!--&lt;!&ndash;<button id="upload-to-php">Upload to PHP</button>&ndash;&gt;-->
            <!--<button class="open-new-tab" @click="startNewTab">Open New Tab</button>-->
          <!--</div>-->
          <!--<div class="shareScreenContent" ref="videoContent">-->
            <!--<video v-if="currentRecordType !== 'record-audio'" class="shareScreenVideo" ref="recorderVideo"  style="transform: scale(1); width:100%;"></video>-->
            <!--&lt;!&ndash;&lt;!&ndash;<video v-show="currentRecordType !== 'record-audio'" class="shareScreenVideo" ref="recorderVideo" width="1280" height="720"  style="transform: scale(1)"></video>&ndash;&gt;&ndash;&gt;-->
            <!--<audio v-if="currentRecordType === 'record-audio'" class="shareScreenAudio" ref="recorderAudio"  style="transform: scale(1)"></audio>-->
          <!--</div>-->
        <!--</div>-->
      <!--</div>-->
      <!--#endregion-->
      <NormalRecord :normalRecordingMedia ="normalRecordingMedia"></NormalRecord>
    </div>

    <div v-if="currentRecordMethod ==='advanced-Recorded'">
      <AdvanceRecord :advancedRecordingMedia="advancedRecordingMedia"></AdvanceRecord>
    </div>
  </div>
</template>

<script>
  import AdvanceRecord from "@/views/AdvanceRecord.vue"
  import NormalRecord from "@/views/NormalRecord.vue"
  import { mapState, mapGetters} from 'vuex'
  export default {
    name: 'Record',
    components:{ NormalRecord, AdvanceRecord},
    data(){
      return {
        // 标准录制
        normalRecordingMedia:[
          {
            index: 0,
            text: 'Microphone+Camera',
            value: 'record-audio-plus-video'
          },
          {
            index: 1,
            text: 'Microphone',
            value: 'record-audio'
          },
          {
            index: 2,
            text: 'Full Screen',
            value: 'record-screen'
          },
          {
            index: 3,
            text: 'Microphone+Screen',
            value: 'record-audio-plus-screen'
          }
        ],
        // 高级录制
        advancedRecordingMedia:[
          {
            index: 0,
            text: 'Screen+Camera',
            value: 'record-camera-plus-screen'
          },
          {
            index: 1,
            text: 'Regional Screen',
            value: 'record-regionalScreen'
          },
          {
            index: 2,
            text: 'gif-record',
            value: 'gif-record'
          },
          {
            index: 3,
            text: 'microphone-mp3',
            value: 'microphone-mp3'
          }
        ],
        currentRecordType: '',      // 当前录制的类型
      }
    },
    created(){

    },
    computed: {
      ...mapState(['currentRecordMethod'])
    },
  }
</script>

<style scoped>

</style>
