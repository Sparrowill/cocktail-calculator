function setValues(){



}

const slider = document.getElementById("MAX_COCKTAILS");
const output = document.getElementById("rangeValue");
output.innerText = slider.value;
slider.oninput = function(){
    output.innerText = slider.value;
}