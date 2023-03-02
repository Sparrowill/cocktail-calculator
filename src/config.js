const configPath = './config.json';

function createPage() {
    fetch(configPath)
    .then(response => response.json())
    .then(json => createInputs(json))
}

function createInputs(settings) {

    console.log(settings)
    const names = [];
    console.log(settings.Config.length)
    for (let i = 0; i < settings.Config.length; i++) {
        console.log(settings.Config[i].value);
        //  generate id
        const id = `setting-${settings.Config[i].name}`;
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
        label.appendChild(document.createTextNode("     " + settings.Config[i].name));
        // add the label to the appropriate div 
        document.getElementById('settings').appendChild(label);
        document.getElementById('settings').appendChild(document.createElement("br")); 
    }
}

function save() {

    quit()
    //TODO: Make this update the Json and close the windows
}

const quit = async () => {
    window.versions.exit();
    }
