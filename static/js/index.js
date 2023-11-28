//all variables that are used in multiple functions are declared here
let items = [];
let sessions = [];
let lastSession = 0;
let currentSession = 0;
let currentPosition = 0;
let currentProgress = 0;
let connectorDimensions = null;
const actorRadius = 50;
const line = d3.line().curve(d3.curveCatmullRom.alpha(0.3));

async function init() {
    //get the data and parse it
     let data = await fetch(`data.json`)
     let json = await data.json();
    document.getElementById('caption').innerHTML = `
    <img src="${json[0].image}"></img>
    <div>${marked.parse(json[0].text)}</div>
    `
    
    //create the data representation
    createBaseData(json);
    //start frame loop
    animation();
}
