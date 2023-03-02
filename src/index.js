// Imports and module dependencies
const {dialog, app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");
const fs = require ('fs');
require("./Tahoma-Regular-font-normal");
require("./tahoma-bold");

// Global Variable to get the ingredients out of async function hell
var _ingredients
var mainWindow
var settingsWindow

// Global Variable for settings updates
var henRate = 25
var flairRate = 72.50
var bartenderRate = 52.50
var barRate = 300
var travelRate = 0.75
var glasswareRate = 1
var glasswareFlat = 20
var ingredientCost = 0
var ingredientMarkup = 1.2

//Multiplier for calcualting total volume required
const DRINKS_PER_PERSON_PER_HOUR = 0.33

// formatter that converts integers into a £00.00 format.
const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',

})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: 'Cocktail Calculator',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' },
      { role: 'forceReload' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      
      ...(isMac ? [
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'User Guide',
        click: async () => {
          openAboutWindow()
        }
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Open Settings',
        click: async () => {
          openSettings()
        }
      }
    ]
  }
]

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname,'/icons/icon.png'),
    // Backup dimensions in case maximise() is not supported
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),

    },
  });
  mainWindow.setIcon(path.join(__dirname, '/icons/icon.png'))
  mainWindow.maximize()
  mainWindow.removeMenu()
  //mainWindow.webContents.openDevTools();
  const customMenu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(customMenu)
  // Literal black magic to pass data from functions.js to here
  ipcMain.handle('JSON', (event) => getPrices())
  ipcMain.handle('PDF', (event, title, client, numDrinks, drinks, options, shoppingList) => {generateDocs(title, client, numDrinks, drinks, options, shoppingList)});
  ipcMain.handle('exit', (event) => closeSettings())
  ipcMain.handle('edit', (event, content) => {writeFile(content)})
  ipcMain.handle('updatePrices', (event,hen, flair, bartender, bar, travel, glassR, glassF, ingredientM)=> updateCosts( hen, flair, bartender, bar, travel, glassR, glassF, ingredientM))

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Function to populate var _ingredients with contents of ingredients.json
  //getPrices() 
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
var newWindow = null
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

// getPrices()
//
// Function takes event duration, number of guests, and the shoppingList oject as inputs
// Function returns no outputs
//
// fs.readFile is asynchronous, the rest of the fucntion executes while the file is being read
// this is realy fecking annoying
// To avoid this, getPrices is called before the app launches. Ensures the variable is populated when needed

function getPrices() {

  fs.readFile(path.join(__dirname, 'ingredients.json'), "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
    }
      const my = JSON.parse(jsonString);
      _ingredients = my.ingredients
  });
}

// getRows()
//
// Function takes event duration, number of guests, the shopping list object, and the ingredients object as inputs
// Function returns the table rows for the shopping list, and the total ingredient cost as outputs
//
// Function loops through the shopping list, and finds the matching ingredient in ingredients
// Then add Ingredient, amount per bottle, cost per bottle, ,total volume needed, and the units to the tablerow array
// as a row object
function getRows(duration, numGuests, shoppingList, ingredients) {
  var tableRows = []
  var totalIngredientCost = 0
  for(let i =0; i<shoppingList.length;i++){
    var volPerUnit = 0
    var costPerUnit = 0
    var found = 0
      //Find match between item on shopping list and item in ingredients.json
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
    // Calculate total Volume of ingredient required
    totalVol = shoppingList[i].volume * duration * numGuests * DRINKS_PER_PERSON_PER_HOUR
    tableRows.push(new row(shoppingList[i].name,volPerUnit,costPerUnit,totalVol,shoppingList[i].unit))
  }
  //  calculate total ingredient cost
  totalIngredientCost = 0
  for (let k=0;k<tableRows.length;k++){
    totalIngredientCost+= tableRows[k].totalCost
  }
  //Construct array of things to return
  var returnArr = [tableRows, totalIngredientCost]
  return returnArr
}

// generateDocs()
//
// function takes the client name, the clienDetails Object, the ids of the chosen cocktails,
// the chosenCocktails Object, an integer called options, and the shoppingList object as inputs
//
// function returns no outputs
//
// Function decodes the options variable, which is implemented in index.html to determine
// which button was pressed by the user.
// 
function generateDocs(title, client, numDrinks, drinks, options, shoppingList){
  var ingredients = _ingredients
  var tableRows
  var totalIngredientCost
  var rowsGenerated

  //Generate All docs
  if (options == 1) {
    // Explicit definition of string comp to avoid misinterpretation of local var
    if (rowsGenerated != 'Yes'){
      var returnArr = getRows(client.duration, client.guests, shoppingList, ingredients)
      tableRows = returnArr[0]
      totalIngredientCost = returnArr[1]
      rowsGenerated = 'Yes'
    }
    generateEventSheet(title, client, numDrinks,drinks, totalIngredientCost)
    generateEventMenu(title, numDrinks, drinks)
    generateShoppingList(title, tableRows, totalIngredientCost)


  }
  // Generate Event Sheet / Invoice
  else if (options == 2) {
    // Explicit definition of string comp to avoid misinterpretation of local var
    if (rowsGenerated != 'Yes'){
      var returnArr = getRows(client.duration, client.guests, shoppingList, ingredients)
      tableRows = returnArr[0]
      totalIngredientCost = returnArr[1]
      rowsGenerated = 'Yes'
    }
    generateEventSheet(title, client, numDrinks,drinks, totalIngredientCost)
  }
  // generate Bar Menu
  else if (options == 3) {
    generateEventMenu(title, numDrinks, drinks)
  }
  // Generate client shopping list
  else if (options == 4) {
    // Explicit definition of string comp to avoid misinterpretation of local var
    if (rowsGenerated != 'Yes'){
      var returnArr = getRows(client.duration, client.guests, shoppingList, ingredients)
      tableRows = returnArr[0]
      totalIngredientCost = returnArr[1]
      rowsGenerated = 'Yes'
    }
  generateShoppingList(title, tableRows, totalIngredientCost)
    
  }
  // App restart
  else if (options == 5) {
    restartApp()
    
  } else{
    console.log("ERR: Options != 1-5, got ", options)
  }
}

// generateEventSheet()
//
// Function takes the client name, the client object, the array of selected drink ids, the chosenCocktails object, and 
// the total ingredient cost as inputs
// Function returns no outputs
//
// Function does all the invoice maths
// Function uses jspdf to create a pdf object (doc) of the event sheet
// the autotable plugin is also used to make my life easier
// the generated doc may extend onto two pages if many cocktails are selected.
function generateEventSheet(title, client, numDrinks,drinks, totalIngredientCost){
  // Invoice Maths

  if(client.ingredients == 'Yes'){
    //20% markup
  
   ingredientCost = parseFloat(totalIngredientCost) * ingredientMarkup
  } else {
    ingredientCost = 0
  }
  
  henGuestCost = Math.round(client.henGuests*henRate*100)/100
  flairCost = Math.round(client.flair*client.duration*flairRate*100)/100
  bartenderCost = Math.round(client.bartender*client.duration*bartenderRate*100)/100
  barCost = Math.round(client.bars * barRate*100)/100
  travelCost = Math.round(client.travel * travelRate*100)/100
  // invoice maths ends
  // All the faff to delete the glassware row
  glasswareCost = 0
  glasswareCol2 = ''
  glasswareCol3  = formatter.format(glasswareCost)
  if (client.bars > 0) {
    glasswareTitle = 'Glassware Required'
    glasswareCol1 = client.glassware
    if (client.glassware == 'Yes'){
      glasswareCol2 = formatter.format(glasswareRate) +' per person + ' + formatter.format(glasswareFlat)
      glasswareCost = Math.round((parseFloat(glasswareFlat) + (client.guests * parseFloat(glasswareRate)))*100)/100
      glasswareCol3  = formatter.format(glasswareCost)
    }
  } else {
    glasswareTitle = ''
    glasswareCol1 = ''
  }
  var extraCost = parseFloat(client.extra)

  totalCost = Math.round((henGuestCost + flairCost + bartenderCost + barCost + travelCost + glasswareCost + ingredientCost + parseFloat(extraCost))*100)/100


  //PDF library to create event sheet
  var doc = new jsPDF("portrait","px","a4");
  var width = doc.internal.pageSize.getWidth();
  doc.setFont('Tahoma')
  doc.setFontSize(12);
  const contents = fs.readFileSync(path.join(__dirname, 'bigLogo.png'), "base64")
  imgData = 'data:image/png;base64,' + contents.toString('base64');
  doc.addImage(imgData,'png',0,0,width,155);
  // Generate table Before procedural cocktails
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
      ['Postcode',client.postcode.toUpperCase()],
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

  // Generate bit of table AFTER procedurally entered cocktails
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
  saveDoc(doc, "Event Sheet", title )

}

// generateEventMenu()
//
// Function takes the client name, the array of chosen drink ids, and the chosenCocktails object as inputs
// Function returns no outputs
//
// Function uses jspdf to create a pdf object (doc) of the event menu
// For 7 or fewer drinks, the cocktailhire logo is also displayed
// for 8 drinks, just a cocktailhire title is shown
// WARNING: More than 8 drinks will cause drinks to go off the page.
function generateEventMenu(title, numDrinks, drinks){
  var doc = new jsPDF("portrait","px","a4");
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
    // Add mocktail info if cocktail can be made non-alch
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
  // Pass to save doc function
  saveDoc(doc, "Cocktail Menu", title )
}

// generateShoppingList()
//
// function takes the client name, the tableRows array of row objects, and the total ingredient cost as inputs
// Function returns no outputs
//
// Function uses jspdf to create a pdf object (doc) of the client shopping list
// Doesn't use autotable becuase that doesn't really support varying row numbers
// That's p much it really
// currentY and currentX are used to keep track of cursor position
function generateShoppingList(title, tableRows, totalIngredientCost)
{
  
    var doc = new jsPDF("portrait","px","a4");
    var width = doc.internal.pageSize.getWidth();
    var currentY = 155
    doc.setFont('Tahoma', 'bold')
    doc.setFontSize(20);
    const contents = fs.readFileSync(path.join(__dirname, 'bigLogo.png'), "base64")
    imgData = 'data:image/png;base64,' + contents.toString('base64');
    doc.addImage(imgData,'png',0,0,width,currentY);
    doc.text("Shopping List for " + title, width/2,currentY,{align:'center'})
    currentY+= 15
    doc.setFont('Tahoma', 'normal')
    doc.setFontSize(10)
    doc.text("(Costings are approximate only)",width/2,currentY,{align:'center'})
    doc.setFont('Tahoma', 'bold')
    doc.setFontSize(13);
    currentY +=20
    doc.text("Ingredient      Vol. per unit     Cost per unit     Units required      Total Cost", width/2,currentY,{align:'center'})
    doc.setFont('Tahoma', 'normal')
    doc.setFontSize(10);
    currentY += 15
    currentX = 45
    for(let i =0; i<tableRows.length; i++){
      doc.text(tableRows[i].name,currentX,currentY)
      currentX +=70
      doc.text(tableRows[i].volPerUnit,currentX,currentY)
      currentX +=75
      doc.text(formatter.format(tableRows[i].costPerUnit),currentX,currentY)
      currentX +=75
      doc.text(tableRows[i].unitsRequired.toString(),currentX,currentY)
      currentX +=90
      doc.text(formatter.format(tableRows[i].totalCost),currentX,currentY)
      currentY +=13
      currentX = 45
    }
    doc.setFont('Tahoma', 'bold')
    doc.text("Total Cost: " + formatter.format(totalIngredientCost),  312, currentY)

    saveDoc(doc, "Shopping List", title ) 
}

// saveDoc()
//
// Function takes the pdf doc object, the type of doc it is, and the name of the client as inputs
// Function returns no outputs
//
// Function opens a save dialog with a load of useful preinput data, see the showSaveDialog docs for options.
// the options are stored in the settings object
// BUG: If the save window is cancelled, the pdf is saved as generated.pdf in the app filesystem.
// Only one doc is stored at once (overwrites)
// no biggy, mainly cos I can't fix it
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
      // creates generated pdf here. meh
    }else {
      doc.save(saveWindow.filePath)
    }
}


// row()
//
// Function takes the items we want in a shopping list row as inputs
// Function creates a new objetc when called with 'new' keyword
//
// function is the Row Object constructor for shopping lists
function row(name, volPerUnit, costPerUnit, totalVol, units){
  this.name = name
  this.volPerUnit = volPerUnit + units
  this.costPerUnit = costPerUnit
  this.totalVol = Math.ceil(totalVol) + units
  this.unitsRequired = Math.ceil(totalVol/volPerUnit)
  this.totalCost = this.unitsRequired * costPerUnit


}

// openAboutWindow() 
//
// Function takes no inputs,
// Function returns no outputs
//
// Function creates a new Window that shows the README/User Guide
function openAboutWindow() {
  if (newWindow) {
    newWindow.focus()
    return
  }

  newWindow = new BrowserWindow({
    height: 800,
    resizable: false,
    width: 750,
    title: 'User Guide',
    minimizable: false,
    fullscreenable: false,
 
  })
  newWindow.removeMenu()
  newWindow.loadURL('file://' + __dirname + '/userguide.html')

  newWindow.on('closed', function() {
    newWindow = null
  })
}

// restartApp()
//
// Function takes no inputs
// Function returns no outputs
//
// Function restarts the application
function restartApp() {
  app.relaunch()
  app.quit()
}

//Used to send an update event to the renderer
function updateJSON(){
  mainWindow.webContents.send('updateJSON', "");
}

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    height: 800,
    resizable: false,
    width: 750,
    title: 'Settings',
    minimizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),

    },
  })
  //settingsWindow.webContents.openDevTools();

  settingsWindow.removeMenu()
  settingsWindow.loadURL('file://' + __dirname + '/config.html')

  settingsWindow.on('closed', function() {
    settingsWindow = null
  })
}

// Used to close the settings window via ipc call
function closeSettings() {
  updateJSON()
  settingsWindow.close();
}

// FS is a node module. So needs calling from the renderer to happen here. IPC call
function writeFile(content){
  fs.writeFileSync(path.join(__dirname, 'config.json'),JSON.stringify(content),{encoding:'utf8',flag:'w'})
}

function updateCosts( hen, flair, bartender, bar, travel, glassR, glassF, ingredientM) {
 henRate = hen
 flairRate = flair
 bartenderRate = bartender
 barRate = bar
 travelRate = travel
 glasswareRate = glassR
 glasswareFlat = glassF
 ingredientMarkup = ingredientM
}