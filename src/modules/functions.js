//////////////////////////////////////////
// Helper Functions
//
// Functions to augment html functionality
//////////////////////////////////////////

// getCocktails()
// 
// Has no inputs
// returns no outputs
//
// This function reads in the list 'cocktails.json' and passes it to storeCocktails
function getCocktails() {
    fetch('./lists/cocktails.json')
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
        document.getElementById('checkboxes').appendChild(label);
        document.getElementById('checkboxes').appendChild(document.createElement("br"));
    });
}

// submitCheckboxes()
// Takes no inputs
// returns no outputs

// This function takes all the selected cocktails, and passes them as an array to getIngredients()
function submitCheckboxes() {
    
    let checkboxes = document.querySelectorAll('input[name="cocktail"]:checked');
    let values = [];
    checkboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });
    // Error checking for empty array
    if(values.length!=0){
        console.log(values);  
    } else {
        console.log("ERR");
        document.getElementById('emptyArrayError').style.visibility = "visible"; 
    }
    
}

//TODO: write getIngredients


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