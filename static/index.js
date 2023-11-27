//all variables that are used in multiple functions are declared here
let json;
let items = [];
let height = 0;
let sessionsCount = 0;
let lastSession = 0;
let currentSession = 0;
let currentPosition = 0;
let currentProgress = 0;
let connectorDimensions = null;
const sessionHeightFactor = 4;
const actorRadius = 50;

//this listener updates the progress of the scrolling and the position of the connector
document.addEventListener('scroll', () => {
    currentSession =  Math.floor(window.scrollY/(window.innerHeight * sessionHeightFactor))
    currentProgress = (currentPosition - window.innerHeight * sessionHeightFactor * currentSession) / ((window.innerHeight * sessionHeightFactor * (currentSession+1)) - (window.innerHeight * sessionHeightFactor * currentSession))
    currentPosition = window.scrollY
})
async function init() {
    //get the data and parse it
     let data = await fetch(`data.json`)
     json = await data.json();
    //set height and padding according to datasize
    height = window.innerHeight * sessionHeightFactor * json.length + window.innerHeight;
    //set the body height to the height of the data
    updateDimensions(['body','#links','#app-wrapper'])
    //create the data representation
    createBaseData();
     //start frame loop
    animation();
}
function updateDimensions(elements){
    elements.map(element => {
        d3.select(element).attr('style', 'height:'+height+'px; width:'+window.innerWidth+'px')
    })
}
//put the update in an animation frame loop
function animation(){
    //update the data representation
    updateDataRepresentation()
    //update the links that go into the connector
    updateLinks()
    //loop the animation frame
    requestAnimationFrame(animation)
}