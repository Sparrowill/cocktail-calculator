const configPath = './config.json';

function createPage() {
    fetch(configPath)
    .then(response => response.json())
    .then(json => createInputs(json))
}

function createInputs(settings) {

    for (let i = 0; i < settings.Config.length; i++) {
        //  generate id
        const id = settings.Config[i].name
        // create a label
        const label = document.createElement('label');
        label.setAttribute("for", id);
        // create an input
        const input = document.createElement('input');
        input.type = "number";
        input.name = "settings";
        input.value = settings.Config[i].value;
        input.id = id;
        // place the input inside a label
        label.appendChild(input);
        // create text node
        label.appendChild(document.createTextNode("     " + settings.Config[i].text));
        // add the label to the appropriate div 
        document.getElementById('settings').appendChild(label);
        document.getElementById('settings').appendChild(document.createElement("br")); 
    }
}

function save() {
    let settings = {
            "Config":
            [
                {
                    "name":"MAX_COCKTAILS",
                    "text":  "MAX_COCKTAILS + 1 (Can fit up to 8 on a menu)",
                    "value": document.getElementById('MAX_COCKTAILS').value
                },
                {
                    "name": "FLAIR_RATE",
                    "text":  "FLAIR_RATE (£/per hour)",
                    "value":  document.getElementById('FLAIR_RATE').value
                },
                {
                    "name": "HEN_RATE",
                    "text":  "HEN_RATE (£/per person)",
                    "value":  document.getElementById('HEN_RATE').value
                },
                {
                    "name": "BARTENDER_RATE",
                    "text":  "BARTENDER_RATE (£/per hour)",
                    "value":  document.getElementById('BARTENDER_RATE').value
                },
                {
                    "name": "BAR_RATE",
                    "text":  "BAR_RATE (£/per bar)",
                    "value":  document.getElementById('BAR_RATE').value
                },
                {
                    "name": "TRAVEL_RATE",
                    "text":  "TRAVEL_RATE (£/per mile)",
                    "value":  document.getElementById('TRAVEL_RATE').value
                },
                {
                    "name": "GLASSWARE_RATE",
                    "text":  "GLASSWARE_RATE (£/per person)",
                    "value":  document.getElementById('GLASSWARE_RATE').value
                },
                {
                    "name": "GLASSWARE_BASE",
                    "text":  "GLASSWARE _BASE (£)",
                    "value":  document.getElementById('GLASSWARE_BASE').value
                },
                {
                    "name": "INGREDIENT_MARKUP",
                    "text":  "INGREDIENT_MARKUP (%)",
                    "value":  document.getElementById('INGREDIENT_MARKUP').value
                }
            ]
        }
        window.versions.edit(settings)
        quit()
}

const quit = async () => {
    window.versions.exit();
    }
