//////////////////////////////////////////
// Cocktail Processing
//
// Functions to do what Excel used to do
//////////////////////////////////////////

// Exports

// Imports


// getCocktails()
// 
// Has no inputs
// returns no outputs
//
// This function reads in the list 'cocktails.csv' and stores it in an array
function getCocktails() {
    fetch('./lists/cocktails.json')
    .then((response) => response.json())
    .then((json) => printCocktails(json));
    
}

function printCocktails(json) {
    const cocktails = json;
    console.log(cocktails);
}
