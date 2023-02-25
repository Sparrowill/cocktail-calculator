const {dialog, app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");
const fs = require ('fs');
const {JSONingredients} = require('./ingredients.json');
const { totalmem } = require('os');
require("./Tahoma-Regular-font-normal");
require("./tahoma-bold");

var _tableRows = []
var _duration 
var _numGuests
var _shoppingList
var _title
var _totalIngredientCost = 0
var _client
var _numDrinks
var _drinks

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
  //mainWindow.webContents.openDevTools()

  ipcMain.handle('PDF', (event, title, client, numDrinks, drinks, options, shoppingList) => {generateDocs(title, client, numDrinks, drinks, options, shoppingList)});
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

function generateDocs(title, client, numDrinks, drinks, options, shoppingList){
  _title = title
  _client = client
  _numDrinks = numDrinks
  _drinks = drinks
  if (options == 1) {
    generateEventSheetPDF(title, client, numDrinks, drinks)
    generateEventMenu(title, numDrinks, drinks)
    generateShoppingList(title, client, numDrinks, drinks, shoppingList)
  }
  else if (options == 2) {
    generateEventSheetPDF(title, client, numDrinks, drinks,shoppingList)
  }
  else if (options == 3) {
    generateEventMenu(title, numDrinks, drinks)
  }
  else if (options == 4) {
    generateShoppingList(title, client, numDrinks, drinks, shoppingList)
    
  }
  else if (options == 5) {
    app.relaunch();
    app.quit();
    
  } else{
    console.log("ERR: Options != 1-5, got ", options)
  }
 
}
function generateEventSheetPDF(title, client, numDrinks, drinks,shoppingList){
  _duration = client.duration
  _numGuests = client.guests
  _shoppingList = shoppingList
  _type = 'Event Sheet'
  getPrices()
  
}

function generateEventMenu(title, numDrinks, drinks){
  const doc = new jsPDF("portrait","px","a4");
  var width = doc.internal.pageSize.getWidth();
  doc.setFont('Tahoma', 'bold')
  doc.setFontSize(15);
  const contents = fs.readFileSync(path.join(__dirname, 'bigLogo.png'), "base64")
  imgData = 'data:image/png;base64,' + contents.toString('base64');
  // IF too many drinks, remove logo
  var height = 0
  if (numDrinks.length<8){
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
  saveDoc(doc, "Cocktail Menu", title )
}

function generateShoppingList(title, client, numDrinks, drinks, shoppingList){
  _duration = client.duration
  _numGuests = client.guests
  _shoppingList = shoppingList
  _type = 'Shopping List'
  getPrices()
}

const saveDoc = async (doc, type, title) => {
  let settings = {
    title: 'Save ' + type + ' As...',
    defaultPath: app.getPath('documents') + "/" + type + " - " + title +" .pdf",
    //buttonLabel: 'Save ' + type ,
    filters: [
      {name: 'pdf Files', extensions: ['pdf'] },
      {name: 'All Files', extensions: ['*'] }
    ],
    message: type + " - " + title + ".pdf",
    properties: ['createDirectory']
  }
  const saveWindow = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), settings)
    if(saveWindow.cancelled){
    }else {
      doc.save(saveWindow.filePath)
    }
}

function getPrices() {
  
  fs.readFile("./src/ingredients.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return;
    }
      const my = JSON.parse(jsonString);
      getRows(my.ingredients, _duration, _numGuests, _shoppingList)
      return
  });
}

function getRows(ingredients, duration, numGuests, shoppingList) {
  _tableRows = []
 for(let i =0; i<shoppingList.length;i++){
  var volPerUnit = 0
  var costPerUnit = 0
  var found = 0
    //Find math between item on shopping list and item in ingredients.json
    for (let j =0; j<ingredients.length; j++){
      if(shoppingList[i].name.toUpperCase() == ingredients[j].name.toUpperCase()){
        volPerUnit = ingredients[j].volume
        costPerUnit = ingredients[j].cost
        shoppingList[i].name = ingredients[j].name
        found = 1
      } else{
          if(j== ingredients.length-1 && found!=1){
            console.error("ERR: No match found for ingredient ", shoppingList[i].name)
          }
      }
    }
    totalVol = shoppingList[i].volume * duration * numGuests * 0.33
    _tableRows.push(new row(shoppingList[i].name,volPerUnit,costPerUnit,totalVol,shoppingList[i].unit))
 }
 _totalIngredientCost = 0
 for (let k=0;k<_tableRows.length;k++){
  console.log(_tableRows[k].totalCost)
  _totalIngredientCost+= _tableRows[k].totalCost
 }
 console.log(_totalIngredientCost)
 doPDF(_type)
}

function doPDF(type){
  if (type == 'Shopping List'){
    console.log("328",_tableRows)
    const doc = new jsPDF("portrait","px","a4");
    var width = doc.internal.pageSize.getWidth();
    var currentY = 155
    doc.setFont('Tahoma', 'bold')
    doc.setFontSize(20);
    const contents = fs.readFileSync(path.join(__dirname, 'bigLogo.png'), "base64")
    imgData = 'data:image/png;base64,' + contents.toString('base64');
    doc.addImage(imgData,'png',0,0,width,currentY);
    doc.text("Shopping List for " + _title, width/2,currentY,{align:'center'})
    doc.setFont('Tahoma', 'bold')
    doc.setFontSize(13);
    currentY +=20
    doc.text("Ingredient      Vol. per unit     Cost per unit     Units required      Total Cost", width/2,currentY,{align:'center'})
    doc.setFont('Tahoma', 'normal')
    doc.setFontSize(10);
    currentY += 15
    currentX = 45
    for(let i =0; i<_tableRows.length; i++){
      doc.text(_tableRows[i].name,currentX,currentY)
      currentX +=70
      doc.text(_tableRows[i].volPerUnit,currentX,currentY)
      currentX +=75
      doc.text(formatter.format(_tableRows[i].costPerUnit),currentX,currentY)
      currentX +=75
      doc.text(_tableRows[i].unitsRequired.toString(),currentX,currentY)
      currentX +=90
      doc.text(formatter.format(_tableRows[i].totalCost),currentX,currentY)
      currentY +=13
      currentX = 45
    }
    doc.setFont('Tahoma', 'bold')
    doc.text("Total Cost: " + formatter.format(_totalIngredientCost),  315, currentY)

    saveDoc(doc, "Shopping List", _title )
  } 
  else if (type == 'Event Sheet') {
    
    client = _client
    numDrinks = _numDrinks
    drinks = _drinks
    var ingredientCost = 0
    if(client.ingredients == 'Yes'){
      //20% markup
     ingredientCost = _totalIngredientCost * 1.2
    } else {
      ingredientCost = 0
    }
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
    saveDoc(doc, "Event Sheet", _title )
  
  }
}





// Row Object constructor for shopping lists
function row(name, volPerUnit, costPerUnit, totalVol, units){
  this.name = name
  this.volPerUnit = volPerUnit + units
  this.costPerUnit = costPerUnit
  this.totalVol = Math.ceil(totalVol) + units
  this.unitsRequired = Math.ceil(totalVol/volPerUnit)
  this.totalCost = this.unitsRequired * costPerUnit


}