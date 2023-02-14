const {app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");
const fs = require ('fs')


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

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

  ipcMain.handle('PDF', (event, title, client, numDrinks, drinks) => {generateEventSheetPDF(title, client, numDrinks, drinks)});
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

function generateEventSheetPDF(title, client, numDrinks, drinks){
  const doc = new jsPDF("portrait","px");
  var width = doc.internal.pageSize.getWidth();
  console.log(width);
  doc.setFont("helvetica");
  doc.setFontSize(12);
  //TODO: Format Table to account for merged rows, add individual lines
  const contents = fs.readFileSync(path.join(__dirname, 'bigLogo.png'), "base64")
  imgData = 'data:image/png;base64,' + contents.toString('base64');
  doc.addImage(imgData,'png',0,0,width,155);
  doc.autoTable({
    startY: 120,
    theme: 'plain',
    styles: {
      fontSize: 12
      },
    columnStyles: {
      0: {
        cellWidth: 120,
        fillColor: [207,207,207],
        fontStyle: 'bold'
      }
    },
    body: [
      ['Contact', client.name],
      ['Date', client.date],
      ['Event Address', client.address1],
      ['', client.address2],
      ['', client.city],
      ['Postcode',client.postcode],
      ['Nature of Event', client.type],
      ['Times of Event', {content: ['Bar Staff to arrive 1hr before Service Start',], styles: {fontStyle: 'bold'}}],
      ['Service Start Time', client.start],
      ['Service Finish Time', client.end],
      ['Total Service Hours', {content: [client.duration,], styles: {fillColor: [255,255,0]}}],
      ['Guests', {content: [client.guests,], styles: {fillColor: [255,255,0]}}],
      ['Cocktail Selection'],
    ],
  })
  //TODO: Format to make this look vaguely similar to table

  let finalY = doc.lastAutoTable.finalY;
  doc.setFillColor('#CFCFCF');
  doc.rect(30,finalY,120,(numDrinks.length-1)*13,'F')
  for(let i = 0; i < numDrinks.length; i++){
    doc.text(152,finalY -5 + i*13 ,drinks.Cocktails[numDrinks[i]-1].name);
  }


  doc.autoTable({
    startY: doc.lastAutoTable.finalY + (numDrinks.length-1)*13,
    theme: 'plain',
    styles: {
      fontSize: 12
      },
    columnStyles: {
      0: {
        cellWidth: 120,
        fillColor: [207,207,207],
        fontStyle: 'bold'
      }
    },
    body: [
      ['Uniforms', {content: ['White Shirt, Black Trousers or Jeans (NO RIPS), Black Shoes (trainers allowed, but only black'], styles: {fontStyle: 'bold'}}]
      ['Hen Do Masterclass', {content: ['0',], styles: {fillColor: [255,255,0]}},'£25.00 per person','£' + client.HenGuests*25],
      ['No. Flair Bartenders', {content: ['0',], styles: {fillColor: [255,255,0]}}],
      ['No. Cocktail Bartenders',{content: ['0',], styles: {fillColor: [255,255,0]}}],
    ],
  })

  //TODO: Add Invoice bit below cocktails.
  doc.save("Event Sheet - " + title + ".pdf")
}




