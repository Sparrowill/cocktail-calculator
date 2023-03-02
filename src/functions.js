//////////////////////////////////////////
// Helper Functions
//
// Functions to augment html functionality
//////////////////////////////////////////

// Global variables
const cocktailPath = './cocktails.json'; // Path to drink recipes json
const configPath = './config.json';
var MAX_COCKTAILS = 9 // Max selectable cocktails (-1)
var clientDetails = Object;
var shoppingList = Object;
var chosenCocktails = Object;
var ids = [];

window.api.receive('updateJSON',(message)=> {
    getMaxCocktails()
});
    


// collectClientDetails()
// Takes no input
// Returns no outputs
//
// This function collects the client details and stores them in an object
// 
// The function then moves the page on to selec cocktails required

function collectClientDetails() {
    // Update Json files on load
    doJSON()
    getMaxCocktails()
    let details = document.querySelectorAll('input[name="details"]');
    let values = [];
    details.forEach((detail) => {
        // Print warnings if empty items in inputs
        checkDetail(detail)
        // Converts bool to string, easier to print to pdf later
        if(detail.id == 'henGuests' || detail.id == 'ingredients' || detail.id == 'glassware'){
            if (detail.checked == true){
                detail.value = 'Yes'
            }else{
                detail.value = 'No'
            }
        }
        values.push(detail.value);
    });
    goToCheckboxes()
        /*names, address1, address2 = null, city, postcode, date, start, end, duration, guests, type, 
    flair, bartender, bars, henGuests, glassware, ingredients, travel, extra){*/ 
        clientDetails = new ClientObject(values[0],values[1],values[2],values[3], values[4], values[5], values[6], values[7], values[8], values[9], values[10], values[11], values[12],
            values[13], values[14], values[15],values[16], values[17], values[18] )
        if(clientDetails.name == ''){
            clientDetails.name = 'John Smith'
        }
        if(clientDetails.duration == ''){
            clientDetails.duration = 1
        }
        if(clientDetails.guests == ''){
            clientDetails.guests = 1
        }
        if(clientDetails.henGuests == 'Yes'){
            clientDetails.henGuests = clientDetails.guests
        } else{
            clientDetails.henGuests = '0'
        }
}

// submitData())
// Takes no inputs
// returns no outputs

// This function takes all the inputted cocktails, and prints them to console
function submitData() {

    // Hide any previous errors
    document.getElementById('overflowError').style.visibility = "hidden"; 
    document.getElementById('emptyArrayError').style.visibility = "hidden"; 

    let checkboxes = document.querySelectorAll('input[name="cocktail"]:checked');
    let values = [];
    checkboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });
    if (checkErrors(values)){
        getIngredients(values); 
    }
}

// getIngredients()
// 
// Has no inputs
// returns no outputs
//
// This function reads in the list 'cocktails.json' and passes it to storeCocktails
function getIngredients(names) {
    fetch(cocktailPath)
    .then(response => response.json())
    .then(json => storeIngredients(json, names))
}

// storeIngredients()
// Takes an input of cocktail names and all the cocktail data
// returns no output
//
// This function searches through cocktails.json and deletes members that have't been selected 

function storeIngredients(cocktails, names){
    let j = 0;
    for (let i = 0; i < cocktails.Cocktails.length; i++) {
        if(!names.includes(cocktails.Cocktails[i].name)){
            delete cocktails.Cocktails[i];
        }
        else{
            ids[j] = cocktails.Cocktails[i].id;
            j++;
        }
    }
    chosenCocktails = cocktails;
    combineIngredients(cocktails, ids);
}

// combineIngredients()
// Takes an input of a trimmed object containing selected cocktails
// returns no output
//
// This function combines the selected ingredients into one list
function combineIngredients(cocktails, ids){
    const alcoholList = [];
    const garnishList = [];
    const juicesList = [];
    const mixersList = [];
    const otherList = [];
    for (let i = 0; i < ids.length; i++) {
        const alcohol = cocktails.Cocktails[ids[i]-1].ingredients.alcohol;
        const garnish = cocktails.Cocktails[ids[i]-1].ingredients.garnish;
        const juices = cocktails.Cocktails[ids[i]-1].ingredients.juices;
        const mixers = cocktails.Cocktails[ids[i]-1].ingredients.mixers;
        const other = cocktails.Cocktails[ids[i]-1].ingredients.other;

        combineAlcohol(alcoholList, alcohol);
        combineGarnish(garnishList, garnish);
        combineJuices(juicesList, juices);
        combineMixers(mixersList, mixers);
        combineOther(otherList,other);
    }

    shoppingList = alcoholList.concat(garnishList, juicesList, mixersList, otherList);
    document.getElementById('results').style.display = "block";
    console.log(shoppingList);
    console.log(clientDetails);
    console.log(chosenCocktails);
}

// generateDocuments(options)
// Takes input of option of what to do, decoded in index.js
// Returns nothing
//
// Handler for passing html inputs to node js
//
function generateDocuments(options) {
    createPDF(clientDetails.name, clientDetails, ids, chosenCocktails, options, shoppingList);
}


// combineAlcohol()
// Takes inputs of the current list of alcohols used, and the alcohols in the new cocktail
// returns an altered list of alcohols used
//
// This function sums volumes of alcohols
function combineAlcohol(alcoholList, alcohol){
    // If cocktail uses alcohol
    if (Object.keys(alcohol[0]).includes("name")){
        // For all alcohols in recipe
        for(let j = 0; j < alcohol.length; j++){
            var duplicate = false;
            // Iterate through alcohols already used
            for(let k = 0; k < alcoholList.length; k++){
                //If duplicate alcohol
                if(alcoholList[k].name == alcohol[j].name) {
                    // Add volumes
                    alcoholList[k].volume += alcohol[j].volume;
                    duplicate = true;
                    continue;
                }
            }
            if(!duplicate){alcoholList.push(alcohol[j]);}
        }
    }
    return;
} 

// combineGarnish()
// Takes inputs of the current list of garnishes used, and the garnishes in the new cocktail
// returns an altered list of garnishes used
//
// This function sums volumes of garnishes
function combineGarnish(garnishList, garnish){
    // If cocktail uses garnish
    if (Object.keys(garnish[0]).includes("name")){
        // For all garnishs in recipe
        for(let j = 0; j < garnish.length; j++){
            var duplicate = false;
            // Iterate through garnishs already used
            for(let k = 0; k < garnishList.length; k++){
                //If duplicate garnish
                if(garnishList[k].name == garnish[j].name) {
                    // Add volumes
                    garnishList[k].volume += garnish[j].volume;
                    duplicate = true;
                    continue;
                }
            }
            if(!duplicate){garnishList.push(garnish[j]);}
        }
    }
    return;
} 

// combineJuices()
// Takes inputs of the current list of juices used, and the juices in the new cocktail
// returns an altered list of juices used
//
// This function sums volumes of juices
function combineJuices(juicesList, juices){
    // If cocktail uses juices
    if (Object.keys(juices[0]).includes("name")){
        // For all juicess in recipe
        for(let j = 0; j < juices.length; j++){
            var duplicate = false;
            // Iterate through juicess already used
            for(let k = 0; k < juicesList.length; k++){
                //If duplicate juices
                if(juicesList[k].name == juices[j].name) {
                    // Add volumes
                    juicesList[k].volume += juices[j].volume;
                    duplicate = true;
                    continue;
                }
            }
            if(!duplicate){juicesList.push(juices[j]);}
        }
    }
    return;
} 

// combineMixers()
// Takes inputs of the current list of mixers used, and the mixers in the new cocktail
// returns an altered list of mixers used
//
// This function sums volumes of mixers
function combineMixers(mixersList, mixers){
    // If cocktail uses mixers
    if (Object.keys(mixers[0]).includes("name")){
        // For all mixerss in recipe
        for(let j = 0; j < mixers.length; j++){
            var duplicate = false;
            // Iterate through mixerss already used
            for(let k = 0; k < mixersList.length; k++){
                //If duplicate mixers
                if(mixersList[k].name == mixers[j].name) {
                    // Add volumes
                    mixersList[k].volume += mixers[j].volume;
                    duplicate = true;
                    continue;
                }
            }
            if(!duplicate){mixersList.push(mixers[j]);}
        }
    }
    return;
} 

// combineOther()
// Takes inputs of the current list of other used, and the other in the new cocktail
// returns an altered list of other used
//
// This function sums volumes of other
function combineOther(otherList, other){
    // If cocktail uses other
    if (Object.keys(other[0]).includes("name")){
        // For all others in recipe
        for(let j = 0; j < other.length; j++){
            var duplicate = false;
            // Iterate through others already used
            for(let k = 0; k < otherList.length; k++){
                //If duplicate other
                if(otherList[k].name == other[j].name) {
                    // Add volumes
                    otherList[k].volume += other[j].volume;
                    duplicate = true;
                    continue;
                }
            }
            if(!duplicate){otherList.push(other[j]);}
        }
    }
    return;
} 


// ClientObject(values)
//Takes an input of values from the input form
// returns the object
//
// This function is an object constructor
function ClientObject(names, address1, address2 = null, city, postcode, date, start, end, duration, guests, type, 
    flair, bartender, bars, henGuests, glassware, ingredients, travel, extra, discount){
    this.name = names;
    this.address1 = address1;
    this.address2 = address2;
    this.city = city;
    this.postcode = postcode;
    this.type = type;
    this.date = date;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.guests = guests;
    this.henGuests = henGuests;
    this.flair = flair;
    this.bartender = bartender;
    this.bars = bars;
    this.glassware = glassware;
    this.ingredients = ingredients;
    this.travel = travel;
    this.extra = extra;
    this.discount=discount
}


// createPDF()
//
// function takes a whole load of inputs to be sent to index.js
// function returns no outputs
//
// Function acts as a handler to send all collected data to index.js
const createPDF = async (title, content, numDrinks, drinks, options, shoppingList) => {
  window.versions.pdf(title, content, numDrinks, drinks, options, shoppingList)
  }


// doJSON()
//
// Function takes no inputs
// function returns no outputs
//
// Function acts as a handler to read in ingredients.json
const doJSON = async () => {
    window.versions.json()
    }

// getIngredients()
// 
// Has no inputs
// returns no outputs
//
// This function reads in the list 'config.json' and stores the MAX_COCKTAILS value in a global variable
function getMaxCocktails() {
    fetch(configPath)
    .then(response => response.json())
    .then(json => {
        var henRate
        var flairRate
        var bartenderRate 
        var barRate 
        var travelRate 
        var glasswareRate
        var glasswareFlat
        var ingredientMarkup
        for (let i =0; i<json.Config.length;i++){
            if(json.Config[i].name == 'MAX_COCKTAILS'){
                MAX_COCKTAILS = parseFloat(json.Config[i].value)
            } else if(json.Config[i].name == 'FLAIR_RATE'){
                flairRate = parseFloat(json.Config[i].value)
            } else if(json.Config[i].name == 'HEN_RATE'){
                henRate = parseFloat(json.Config[i].value)
            } else if(json.Config[i].name == 'BARTENDER_RATE'){
                bartenderRate = parseFloat(json.Config[i].value)
            } else if(json.Config[i].name == 'BAR_RATE'){
                barRate = parseFloat(json.Config[i].value)
            } else if(json.Config[i].name == 'TRAVEL_RATE'){
                travelRate = json.Config[i].value
            } else if(json.Config[i].name == 'GLASSWARE_RATE'){
                glasswareRate = parseFloat(json.Config[i].value)
            }else if(json.Config[i].name == 'GLASSWARE_BASE'){
                glasswareFlat = parseFloat(json.Config[i].value)
            } else if(json.Config[i].name == 'INGREDIENT_MARKUP'){
                ingredientMarkup = (parseFloat(json.Config[i].value) + 100)/100
            } else{
                console.error("ERR: Could not parse settings json", json)
            }
            
        }
        window.versions.updatePrices(henRate, flairRate, bartenderRate, barRate, travelRate, glasswareRate, glasswareFlat, ingredientMarkup)
    })
}

