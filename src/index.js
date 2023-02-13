const {app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const template = [
  {
    label: 'Save As PDF',
    toolTip: 'Save the current window as a PDF',
    click: () => {generatePDF()}
  },
  { type: 'separator' },
  { label: 'New Window',
    toolTip: 'Restart Cocktail Calculator in a new window',
    click: () => {app.quit(); createWindow()}
  },
  { type: 'separator' },
  { label: 'Dev Tools',
    toolTip: 'open the Dev Tools menu',
    click: () => {mainWindow.webContents.openDevTools()}
}
]

const menu = Menu.buildFromTemplate(template)
menu.type = 'window'

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.webContents.openDevTools()

  ipcMain.handle('PDF', (event, title, client, drinks) => {generateEventSheetPDF(title, client, drinks)});
  Menu.setApplicationMenu(menu);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// generatePDF does blackmagic with listeners to implement JS PDF. Uses object children to write job sheet

function generateEventSheetPDF(title = "event_sheet", client, drinks){
  const doc = new jsPDF();
  doc.autoTable({
    head: [['','','','','']],
    body: [
      ['Contact', client.name],
      ['Date', client.date],
      ['Event Address', client.address1],
      ['', client.address2],
      ['', client.city],
      ['Postcode',client.postcode],
      ['Nature of Event', client.type],
      ['Times of Event', 'Bar Staff to arrive 1hr before Service Start'],
      ['Service Start Time', client.start],
      ['Service Finish Time', client.end],

    ],
  })
  doc.save(title + ".pdf")
}




