// Modules to control application life and create native browser window
const {app, BrowserWindow, desktopCapturer, ipcMain, systemPreferences, ipcRenderer, Menu, webContents } = require('electron')
const path = require('path');
const fs = require('fs');
const { contextIsolated } = require('process');
const { dialog } = require('electron')


let menu
let clone
let mainWindow
function createWindow () {
  console.log("Creating Window");
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
      
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./src/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

}

// This method will be called when Electronnpm has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function (err) {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function refreshSources(event, title){
  desktopCapturer.getSources({ types: ['window','screen'] }).then(async sources => {
      clone = sources
      const template = clone.map(source => {
        return{
          label: source.name,
          click: () => selectSource(source),
          id: source.id,
        }
      })
      
    menu = Menu.buildFromTemplate(template)
  
    const xRound = Math.round(title.x);
    const yRound = Math.round(title.y);
    const winRoundX = Math.round(title.winX)
    const winRoundY = Math.round(title.winY)
  
  menu.popup({ x:xRound, y:yRound+50, positioningItem:-4}) 
 
  })
 
}

async function selectSource(source){
  mainWindow.webContents.send('SET_SOURCE', source.id)
  
}



ipcMain.on('refresh', refreshSources)
ipcMain.on('file-request', (event,buffer) => { 
  
  // If the platform is 'win32' or 'Linux'
  if (process.platform !== 'darwin') {
    // Resolves to a Promise<Object>
    dialog.showOpenDialog({
      title: 'Select the File to be uploaded',
      defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Upload',
    
      // Specifying the File Selector Property
      properties: ['openFile']
    }).then(file => {
      // Stating whether dialog operation was
      // cancelled or not.
      console.log(file.canceled);
      if (!file.canceled) {
        const filepath = file.filePaths[0].toString();
        mainWindow.webContents.send('file', filepath);
      }  
    }).catch(err => {
      console.log(err)
    });
  }
  else {
    console.log('in herere')
    
    // If the platform is 'darwin' (macOS)
    dialog.showSaveDialog({
      title: 'Select the File to be uploaded',
      // defaultPath: `${Date.now()}.webm`,
      buttonLabel: 'Save Video',
      // Specifying the File Selector and Directory 
      // Selector Property In macOS
     properties: ['createDirectory'], 
    }).then(file => {
      console.log(file.canceled);
      if (!file.canceled) {
        
        let fileName = file.filePath.split("/").slice(-1)
        const filepath = `${fileName}.webm`;
        fs.writeFile(filepath, buffer, function(err) {
          if (err) {
              console.error('Failed to save video ' + err);
          } else {
              console.log('Saved video: ' + filepath);
          }
      });
    }  
  }).catch(err => {
      console.log(err)
    });
  }
});