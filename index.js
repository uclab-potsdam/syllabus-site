let svg;
let json;
let sessionsCount = 0;
let lastSession = 0;
let currentSession = 0;
let currentPosition = 0;
let currentProgress = 0;
const sessionHeightFactor = 4;
const actorRadius = 50;
document.addEventListener('scroll', event => {
    currentSession =  Math.floor(window.scrollY  / (window.innerHeight * sessionHeightFactor))
    currentPosition = window.scrollY
    currentProgress = (currentPosition - window.innerHeight * sessionHeightFactor * currentSession) / (window.innerHeight * sessionHeightFactor * (currentSession+1))
    //update connectors position according to scroll
    updateDataRepresentation()
})
async function init(course) {
     let data = await fetch(`./${course}/data.json`)
     json = await data.json();
     createBaseData(json);
     createDataRepresentation(json);
     tick();
}
function createBaseData(json) {
    json.map((session, i) => {

        session.x = window.innerWidth / 2
        session.y = 0 

        session.actors.map((actor,ai) => {
            actor.linePath = null
            actor.distance = null
            actor.visible = false
            actor.x = 500 + Math.random() * (window.innerWidth - 500)
            actor.y = window.innerHeight * sessionHeightFactor * i + (200 + (window.innerHeight-200) * sessionHeightFactor *  (0.1/session.actors.length) * (ai+1))
            if(i == 0){
                actor.y = actor.y + window.innerHeight
            }
        })
        session.content.map((content,ci) => {
            content.linePath = null
            content.distance = null
            content.visible = false
            content.x = 200 + Math.random() * (window.innerWidth - 200)
            content.y = window.innerHeight * sessionHeightFactor * i + (200 + (window.innerHeight-200) * sessionHeightFactor * (0.9/session.content.length) * (ci+1))
            if(i == 0){
                content.y = content.y + window.innerHeight
            }
        })
    })
    console.log(json)
}
function createDataRepresentation(json) {
    let width = window.innerWidth;
    let height = window.innerHeight * sessionHeightFactor * json.length;
    //create svg
    let rootElement = document.getElementById('diagram');
    svg = d3.select(rootElement)
        .append('svg')
        .attr('id', 'svg')
        .attr("width", width)
        .attr("height", height);

    //create group element for curves
    svg.append('g')
        .attr('id', 'curves')

    //create group element for sessions
    svg.append('g')
        .attr('id', 'sessions')

    //append group element for each session
    let sessions = svg
        .select('#sessions')
        .selectAll('g')
        .data(json)
        .enter()
        .append('g')
        .attr('id' , (d,i) => {return "session"+i})
        .attr('class', "session")

    //append a group element for each actor   
    let actors = sessions
        .selectAll('.actors')
        .data(d => d.actors)
        .enter()
        .append('g')
        .attr('class', "actors fixObjects")
        .attr('transform', (d, i) => { return `translate(${d.x},${d.y})` })
        .on('click', (e, d) => {
            if (d.role == "host") {
                window.open(d.link, '_blank')
            }
        })
    //append an html img element for each actor that displays the corresponding image
        actors.append('foreignObject')
        .attr('width', actorRadius * 2)
        .attr('height', actorRadius * 2)
        .attr('transform',`translate(-${actorRadius},${-actorRadius})`)
        .append('xhtml:body')
        .append('xhtml:img')
        .attr('src', d => { return 'organigrams/' + d.image })
        .attr('style', `border: rgba(12,12,234,0.7) ;border-radius: 50%; width: ${actorRadius * 2}px; height: ${actorRadius * 2}px;`)
        
    //attach a circle to each actor that holds the name
    actors.append('circle')
        .attr('r', actorRadius + 10)
        .attr('stroke', 'none')
        .attr('fill', 'none')
        .attr('id', (d, i) => { return "actor" + i })
        .attr('transform', 'rotate(180)')

    actors.append('text')
        .attr('fill', 'black')
        .append('textPath')
        .attr('xlink:href', (d, i) => { return "#actor" + i })
        .attr('alignment-baseline', "top")
        .text(d => d.name)

    //append a html element for each content
    let content = sessions
        .selectAll('.content')
        .data(d => d.content)
        .enter()
        .append('foreignObject')
        .attr('transform', (d, i) => { return `translate(${d.x},${d.y})` })
        .attr('class', "content fixObjects")
        .append('xhtml:div')
        .attr('class', 'text-wrapper')
        .append('xhtml:div')
        .attr('class', 'text')
        .html(d => {
            return marked.parse(d.markdown)
        })
}
function updateDataRepresentation(){
    d3.select('#connector')
    .attr('style',`top: ${(currentPosition+ window.innerHeight) - (currentProgress * window.innerHeight)}px`)
    .html(marked.parse(json[currentSession].text))
}
function tick(){
    updateDataRepresentation()
    requestAnimationFrame(() => {tick()})
}