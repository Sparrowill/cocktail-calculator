// helperFunctions.js
// All functions in here strictly augment html and create items.
// No Processing happens here

// getCocktails()
// 
// Has no inputs
// returns no outputs
//
// This function reads in the list 'cocktails.json' and passes it to storeCocktails
function getCocktails() {
  fetch(cocktailPath)
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

// goToCheckboxes()
//
// Function takes no inputs
// Function returs no outputs
//
// Function hides the first page and shows the 2nd

function goToCheckboxes() {
  document.getElementById('clientDetails').style.display = "none";
  document.getElementById('checkboxes').style.display = "block";
  document.getElementById('submit').style.display = "block";
}

// checkErrors(values)
//
// Function takes an array of selected cocktails as an input
// Function returns true if no errors, false if errors
//
// Function checks that at least one, and no more than MAX_COCKTAILS
// have been selected
function checkErrors(values){

   // Error checking for empty array
   if(values.length>0 && values.length<MAX_COCKTAILS){
    document.getElementById('checkboxes').style.display = "none";
    document.getElementById('submit').style.display = "none";
    return true   
  } else if(values.length == 0) {
      console.error("ERR: No Cocktails Selected", values);
      document.getElementById('emptyArrayError').style.visibility = "visible";
      return false 
  } else {
      console.error("ERR: Too Many Cocktails Selected, MAX_COCKTAILS is set to "+ MAX_COCKTAILS, values);
      document.getElementById('overflowError').innerText = "Select up to " + (MAX_COCKTAILS-1).toString() +" cocktails"
      document.getElementById('overflowError').style.visibility = "visible";
      return false
  }
}

// checkDetail(detail)
//
// Function takes an object of client details as an input
// Function returns no outputs
//
// Function prints warnings to console as appropriate
function checkDetail(detail){
  if(detail.value == ''){
    console.warn("WARNING: " + detail.id + " not provided, a default may have been applied")
  }
}