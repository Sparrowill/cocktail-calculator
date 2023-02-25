//////////////////////////////////////////
// Helper Functions
//
// Functions to augment html functionality
//////////////////////////////////////////
// Global variables
const path = './cocktails.json';
var clientDetails = Object;
var shoppingList = Object;
var chosenCocktails = Object;
var ids = [];

// getCocktails()
// 
// Has no inputs
// returns no outputs
//
// This function reads in the list 'cocktails.json' and passes it to storeCocktails
function getCocktails() {
    fetch(path)
    .then(response => response.json())
    .then(json => storeCocktails(json))
}

// storeCocktails() 
//
// Takes a json object as an input
// returns no outputs
//
// This function takes a json object and parses the names into an array
// This array is then passed to createCheckboxes

function storeCocktails(cocktails) {   
    const names = [];
    for (let i = 0; i < cocktails.Cocktails.length; i++) {
        names.push(cocktails.Cocktails[i].name);
    }
    createCheckboxes(names);
}

// createCheckboxes()
// Takes an array of strings as an input
// Returns no outputs
//
// This function creates checkboxes with the values defined in the array 'cocktails'
// The checkboxes are added to a div with the id 'checkboxes'

function createCheckboxes(cocktailNames) {
    // define cocktails and sort alphabetically
    const cocktails = cocktailNames.sort();
    var count = 0
    cocktails.forEach((cocktail)=>{
        //  generate id
        const id = `cocktail-${cocktail}`;

        // create a label
        const label = document.createElement('label');
        label.setAttribute("for", id);
        
        // create a checkbox
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "cocktail";
        checkbox.value = cocktail;
        checkbox.id = id;

        // place the checkbox inside a label
        label.appendChild(checkbox);
        // create text node
        label.appendChild(document.createTextNode(cocktail));
        // add the label to the appropriate div
        if(count<(cocktails.length/2)){
            document.getElementById('checkboxes1').appendChild(label);
            document.getElementById('checkboxes1').appendChild(document.createElement("br"));
        } else {
            document.getElementById('checkboxes2').appendChild(label);
            document.getElementById('checkboxes2').appendChild(document.createElement("br"));
        }
        count++
    });
}

// hideClientDetails()
// Takes no input
// Returns no outputs
//
// This function collects the client details and stores them in an object
// This object is then printed to console
// The function then moves the page on to selec cocktails required

function hideClientDetails() {
    let details = document.querySelectorAll('input[name="details"]');
    let values = [];
    details.forEach((detail) => {
        if(detail.id == 'henGuests' || detail.id == 'ingredients' || detail.id == 'glassware'){
            if (detail.checked == true){
                detail.value = 'Yes'
            }else{
                detail.value = 'No'
            }
        }
        values.push(detail.value);
    });
        document.getElementById('clientDetails').style.display = "none";
        document.getElementById('checkboxes').style.display = "block";
        document.getElementById('submit').style.display = "block";
        // If hen party then guests = hen guests, else no hen guests
        console.log(values);
        
        /*names, address1, address2 = null, city, postcode, date, start, end, duration, guests, type, 
    flair, bartender, bars, henGuests, glassware, ingredients, travel, extra, discount){*/ 
        clientDetails = new ClientObject(values[0],values[1],values[2],values[3], values[4], values[5], values[6], values[7], values[8], values[9], values[10], values[11], values[12],
            values[13], values[14], values[15],values[16], values[17], values[18], values[19] )
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
    document.getElementById('overflowError').style.visibility = "hidden"; 
    document.getElementById('emptyArrayError').style.visibility = "hidden"; 

    let checkboxes = document.querySelectorAll('input[name="cocktail"]:checked');
    let values = [];
    checkboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });
    // Error checking for empty array
    if(values.length>0 && values.length<100){
        document.getElementById('checkboxes').style.display = "none";
        document.getElementById('submit').style.display = "none";
        getIngredients(values);  
    } else if(values.length == 0) {
        console.log("ERR");
        document.getElementById('emptyArrayError').style.visibility = "visible"; 
    } else {
        console.log("ERR");
        document.getElementById('overflowError').style.visibility = "visible";
    }
}

// getIngredients()
// 
// Has no inputs
// returns no outputs
//
// This function reads in the list 'cocktails.json' and passes it to storeCocktails
function getIngredients(names) {
    fetch(path)
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
    console.log("generateDocuments")
    createPDF(clientDetails.name, clientDetails, ids, chosenCocktails, options, shoppingList);
}


// combineAlcohol()C
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

// check()
// Takes an input of what state to set the checkboxes to. default is true
// Returns no output
//
//This function checks or unchecks all checkboxes with the name 'cocktail'

function check(checked = true) {
    const checkboxes = document.querySelectorAll('input[name="cocktail"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = checked;
    });
}

// checkAll()
// Takes no inputs
// Returns no outputs

//This is a helper function that toggles checkbox state

function checkAll() {
check();
this.onclick = uncheckAll;
}

// uncheckAll()
// Takes no inputs
// Returns no outputs

//This is a helper function that toggles checkbox state

function uncheckAll() {
check(false);
this.onclick = checkAll;
}

const createPDF = async (title, content, numDrinks, drinks, options, shoppingList) => {
  window.versions.pdf(title, content, numDrinks, drinks, options, shoppingList)
  }