const {dialog, app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");
const fs = require ('fs')

const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',

})
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
  henRate = 25
  flairRate = 72.50
  bartenderRate = 52.50
  barRate = 300
  travelRate = 0.75
  glasswareRate = 1
  glasswareFlat = 20
  henGuestCost = Math.round(client.henGuests*henRate*100)/100
  flairCost = Math.round(client.flair*client.duration*flairRate*100)/100
  bartenderCost = Math.round(client.bartender*client.duration*bartenderRate*100)/100
  barCost = Math.round(client.bars * barRate*100)/100
  travelCost = Math.round(client.travel * travelRate*100)/100
  glasswareCost = 0
  // All the faff to delete the glassware row
  glasswareCol2 = ''
  glasswareCol3  = formatter.format(glasswareCost)
  if (client.bars > 0) {
    glasswareTitle = 'Glassware Required'
    glasswareCol1 = client.glassware
    if (client.glassware == 'Yes'){
      glasswareCol2 = formatter.format(glasswareRate) +' per person + ' + formatter.format(glasswareFlat)
      glasswareCost = Math.round((glasswareFlat + (client.guests * glasswareRate))*100)/100
      glasswareCol3  = formatter.format(glasswareCost)
    }
  } else {
    glasswareTitle = ''
    glasswareCol1 = ''
  }
  if(client.ingredients == 'Yes'){
     //TODO: This shit
    ingredientCost = Math.round(69,2)
  } else {
    ingredientCost = 0
  }


  totalCost = Math.round((henGuestCost + flairCost + bartenderCost + barCost + travelCost + glasswareCost + ingredientCost + client.extra)*100)/100
 
  const doc = new jsPDF("portrait","px","a4");
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
  //Cocktail insert
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
      },
      1: {
      },
      2:{
      },
      3:{
      }
    },
    body: [
      ['Uniforms', {content: ['White Shirt, Black Trousers/Jeans (NO RIPS)\nBlack Shoes (trainers allowed, but only black)',], colSpan: 3, styles: {fontStyle: 'bold'}}],
      ['Hen Do Masterclass', {content: [client.henGuests,], styles: {fillColor: [255,255,0]}},formatter.format(henRate) + ' per person', formatter.format(henGuestCost)],
      ['No. Flair Bartenders', {content: [client.flair,], styles: {fillColor: [255,255,0]}},formatter.format(flairRate) + ' per hour', formatter.format(flairCost)],
      ['No. Cocktail Bartenders',{content: [client.bartender,], styles: {fillColor: [255,255,0]}},formatter.format(bartenderRate) +' per hour', formatter.format(bartenderCost)],
      ['Ingredients Required',client.ingredients,'',formatter.format(ingredientCost)],
      ['Bar Hire',{content: [client.bars,], styles: {fillColor: [255,255,0]}}, formatter.format(barRate) +' each', formatter.format(barCost)],
      [glasswareTitle, glasswareCol1, glasswareCol2, glasswareCol3],
      ['Travel Cost',{content: [client.travel,], styles: {fillColor: [255,255,0]}},'£' + travelRate +' per mile',formatter.format(travelCost)],
      ['Extra Cost','','', formatter.format(client.extra)],
      ['Total Cost','','', formatter.format(totalCost)],
    ],
  })
  /*
  const options = {
    defaultPath: app.getPath('documents') + "/Event Sheet - " + title + ".pdf",
    title: 'Save Job Sheet to Documents'
  }
  dialog.showSaveDialog(null, options, (path) => {
    console.log(path);

  });*/
  

  doc.save(app.getPath('documents') + "/Event Sheet - " + title + ".pdf")
}




