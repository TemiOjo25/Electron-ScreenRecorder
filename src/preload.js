// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer,contextBridge, Menu, MenuItem, ipcMain } = require('electron')


contextBridge.exposeInMainWorld("electronAPI", {
  update: (title) => ipcRenderer.send('refresh', title)
})


let streamClone
let buffer
var recorder
var blobs


ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      })
    
      handleStream(stream)

    } catch (stream) {
      handleError(e)
    }
      
    
})


function handleStream (stream) {
  const video = document.querySelector('video')
  const img = document.querySelector('.container img')
  const container1 = document.querySelector('.container')
  const start = document.getElementById('startBtn')
  start.disabled = false;
  video.style.display = 'flex'
  img.style.display = 'none'
  container1.style.display = 'none'
  streamClone = stream
  video.srcObject = stream
  video.onloadedmetadata = (e) => {
  video.play()

  }

}

function recordStream() {
  const stop = document.getElementById('stopBtn')
  const start = document.getElementById('startBtn')
  if(streamClone.active){
    
    start.style.color = 'green'
    recorder = new MediaRecorder(streamClone);
  blobs = [];
  recorder.ondataavailable = function(event) {
      blobs.push(event.data);
  };
  recorder.start();
  stop.disabled = false;
  start.disabled = true;
  }
  
  
}

function handleError (e) {
  console.log(e)
}

function toArrayBuffer(blob, cb) {
  let fileReader = new FileReader();
  fileReader.onload = function() {
      let arrayBuffer = this.result;
      cb(arrayBuffer);
  };
  fileReader.readAsArrayBuffer(blob);
}

function toBuffer(ab) {
  return Buffer.from(ab);
}


function stopRecording() {
  const start = document.getElementById('startBtn')
  if(recorder!=null){
    var save = function() {
      toArrayBuffer(new Blob(blobs, {type: 'video/webm'}), function(ab) {
          buffer = toBuffer(ab);
          ipcRenderer.send('file-request', buffer);  
      });
  };

  recorder.onstop = save;
  recorder.stop();
  start.disabled = true;
  
  } 
  
}


contextBridge.exposeInMainWorld('startapi', {
  updateRecord: (recordData) => ipcRenderer.send('read-file', recordData),
  stoprecording: stopRecording,
  record: recordStream,

})

