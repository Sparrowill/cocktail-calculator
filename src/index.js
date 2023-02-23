const {dialog, app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");
const fs = require ('fs');
require("./Tahoma-Regular-font-normal");
require("./tahoma-bold");


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
  // Maths for invoice
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
 
  //PDF library to create event sheet
  const doc = new jsPDF("portrait","px","a4");
  var width = doc.internal.pageSize.getWidth();
  doc.setFont('Tahoma')
  doc.setFontSize(12);
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
  doc.save(app.getPath('documents') + "/Event Sheet - " + title + ".pdf")
  generateEventMenu(title, client, numDrinks, drinks)
}



function generateEventMenu(title, client, numDrinks, drinks){
  const doc = new jsPDF("portrait","px","a4");
  var width = doc.internal.pageSize.getWidth();
  doc.setFont('Tahoma', 'bold')
  doc.setFontSize(15);
  const contents = fs.readFileSync(path.join(__dirname, 'bigLogo.png'), "base64")
  imgData = 'data:image/png;base64,' + contents.toString('base64');
  // IF too many drinks, remove logo
  var height = 0
  if (numDrinks<8){
    height = 155
    doc.addImage(imgData,'png',0,0,width,height);
  } else{
    height = 50
    doc.setFontSize(30)
    doc.text("COCKTAIL HIRE", width/2,height,{align:'center'})
    height = 85
  }

  let j = 0
  for(let i =0; i<numDrinks.length; i++){
    doc.setFontSize(17);
    doc.setFont('Tahoma','bold');
    doc.text(drinks.Cocktails[numDrinks[i]-1].name,width/2,height + j,{ maxWidth: width-20,align:'center'})
    if(drinks.Cocktails[numDrinks[i]-1].mocktail == 'true'){
      j+=13
      doc.setFontSize(11);
      doc.setFont('Tahoma' ,'bold');
      doc.text('(This can also be made non-alcoholic)',width/2,height + j,{maxWidth: width-20,align:'center'})
      j+=15
    } else{
      j+=20
    }
    
    doc.setFontSize(15);
    doc.setFont('Tahoma' ,'normal');
    doc.text(drinks.Cocktails[numDrinks[i]-1].description,width/2,height + j,{maxWidth: width-80,align:'center'})
    j+=45
    
  }
  doc.save(app.getPath('documents') + "/Cocktail Menu - " + title + ".pdf")
}

