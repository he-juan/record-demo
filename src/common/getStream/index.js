//  function getMedia (data, constraints) {
//   console.warn('getMedia')
//   function onGetStreamSuccess (stream) {
//     console.info('get stream success constraints: ' + JSON.stringify(constraints, null, '  '))
//     return stream
//     data.callback({stream: stream ||data.stream})
//   }
//
//   function onGetStreamFailed (error) {
//     data.error = error
//     console.warn('get stream failed: ' + JSON.stringify(constraints, null, '  '))
//     console.warn('onGetStreamFailed error message: ' + error.message)
//     console.warn('error name: ' + error.name)
//     console.warn('error constraint: ' + error.constraints)
//     if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError' || error.name === 'Error') {
//       // constraints can not be satisfied by avb.device
//       console.info('constraints can not be satisfied by avb.device')
//       data.callback({ error: error, constraints: constraints})
//     } else {
//       if (error.name === 'NotFoundError' || error.name === 'DeviceNotFoundError') {
//         // require track is missing
//         console.info('require track is missing')
//       } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
//         // webcam or mic are already in use
//         console.info('webcam or mic are already in use')
//       } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.name === 'PermissionDismissedError') {
//         // permission denied in browser
//         console.info('permission denied in browser')
//       } else if (error.name === 'TypeError') {
//         // empty constraints object
//         console.info('empty constraints object')
//       } else {
//         // other errors
//         console.info('other errors ' + error.name)
//       }
//       data.callback({ error: error })
//     }
//   }
//
//   if (data.streamType === 'audio' ) {
//     navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//     // this.getUserMediaWithTimeout(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//   } else if(data.streamType === 'video'){
//     if (!data.isFirefox && data.stream && data.stream.getVideoTracks().length && data.stream.active) {
//       let videoTrack
//       let constraintsOfApply = {
//         width:{exact: constraints.video.width.exact},
//         height:{exact: constraints.video.height.exact},
//       }
//       videoTrack = data.stream.getVideoTracks()[0]
//       if (videoTrack && videoTrack.applyConstraints) {
//         console.info('applyConstraints constraints: ' + JSON.stringify(constraintsOfApply, null, '    '))
//         videoTrack.applyConstraints(constraintsOfApply).then(function(){
//           console.info('video applyConstraints success!')
//           data.callback({ stream: data.stream})
//         }).catch(onGetStreamFailed)
//       }
//     }else{
//       navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//       // this.getUserMediaWithTimeout(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//     }
//   } else if (data.streamType === 'screenShare') {
//     if(window.ipcRenderer){
//       console.info('ipcRenderer getUserMedia for screen')
//       navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//     }else {
//       if (navigator.getDisplayMedia) {
//         // for Edge old version
//         navigator.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//       } else if (navigator.mediaDevices.getDisplayMedia) {
//         // for all supported getDisplayMedia browser versions
//         navigator.mediaDevices.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//       } else if (navigator.mediaDevices.getUserMedia) {
//         navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
//       } else {
//         console.info('getDisplayMedia is not supported by current browser')
//       }
//     }
//   }
// }

 function debounce(fn,delay) {
   return ()=> {
     console.warn ("IIIIIIIIIIIII")
     let timer = null
     if(timer){
       console.warn("^^^^^^^^^^^^^^^^^^")
       clearTimeout(timer) //进入该分支语句，说明当前正在一个计时过程中，并且又触发了相同事件。所以要取消当前的计时，重新开始计时
       timer = setTimeout(fn,delay)
     }else{
       console.warn("%%%%%%%%%%%%%%%%%%%%")
       timer = setTimeout(fn,delay) // 进入该分支说明当前并没有在计时，那么就开始一个计时
     }
   }
 }
export  default  debounce
