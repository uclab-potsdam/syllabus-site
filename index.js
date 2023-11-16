let svg;
let sessionsCount = 0;
let currentSession = 0;
let cursorPosition = []
const sessionHeightFactor = 1.2;
const connectorHeight = 50;
const connectorWidth = 100;
const connectorPositionX = window.innerWidth / 2 - connectorWidth / 2
const connectorPositionY = window.innerHeight * sessionHeightFactor / 4
const contentWidth = 100;
const contentHeight = 100;
const actorRadius = 50;



document.addEventListener('mousemove', event => {
        cursorPosition = [event.clientX, event.clientY]
        currentSession =  Math.floor((window.scrollY) / (window.innerHeight * sessionHeightFactor))
        //update connectors position according to mouse
        d3.select('#connector')
        .attr('x',cursorPosition[0]-connectorWidth/2)
        .attr('y', window.scrollY+cursorPosition[1]-connectorHeight/2) 
        updateDataLinks()
        
})
document.addEventListener('scroll', event => {
        //update connectors position according to scroll
        d3.select('#connector')
        .attr('x',cursorPosition[0]-connectorWidth/2)
        .attr('y', window.scrollY+cursorPosition[1]-connectorHeight/2) 
        updateDataLinks()
})
// document.addEventListener('scroll', event => {
//     //update connectors position according to scroll
//     console.log(Math.floor((window.scrollY + window.innerHeight) / (sessionsCount*window.innerHeight)))
//     d3.select('#connector')
//     .attr('y', window.scrollY + window.innerHeight / 4) 
//     updateDataLinks()
// })
function init(course) {
    fetch(`./${course}/data.json`)
        .then(data => data.json())
        .then(json => {
            data = json;
            sessionsCount = json.length;
            generateCoordinatedData(json);
            createStaticContent(json);
            createDataPoints(json);
            updateDataLinks();
        })
}
function generateCoordinatedData(json) {
    
    json.map((session, i) => {
        //create a map of the positions of the actors and the content 
        //create a initial entry with the position of the connector
        let positionMapX = [connectorPositionX]
        let positionMapY = [connectorPositionY + window.innerHeight * sessionHeightFactor * i]
        session.actors.map(actor => {
            let [x,y] = generateCollisionlessCoordinates(positionMapX,positionMapY,i,0)
            actor.linePath = null
            actor.distance = null
            actor.visible = true
            actor.x = x
            actor.y = y
        })
        session.content = session.content.map(content => {
            let [x,y] = generateCollisionlessCoordinates(positionMapX,positionMapY,i,1)
            return {
                text: content,
                linePath: null,
                distance: null,
                visible: true,
                x: x,
                y: y
            }
        })
    })
    console.log(json)
}
function generateCollisionlessCoordinates(positionMapX,positionMapY,i,type){
    let fit = false;
    let x = 0;
    let y = 0;
    while(fit == false){
        x = 200 + (window.innerWidth - 400) * Math.random()
        if(type == 0){
            y = 100 + ((window.innerHeight * sessionHeightFactor * 0.33 - 200) * Math.random())
        }else{
            y = 100 + (window.innerHeight * sessionHeightFactor * 0.33) + ((window.innerHeight * sessionHeightFactor * 0.66 - 200) * Math.random())
        }
        y += window.innerHeight * sessionHeightFactor * i
        let found = false;
        let n = 0;
        while (found == false && n < positionMapX.length) {
            if (Math.abs(positionMapX[n] - x) < 200 && Math.abs(positionMapY[n] - y) < 200) {
                found = true;
            }
            n++;
        }
        if(found == false){
            positionMapX.push(x)
            positionMapY.push(y)
            fit = true;
        }
    }
    return [x,y]
}
function createStaticContent(json) {
    //define width and height. Height corresponds to the number of sessions
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

    //create the connector element
    svg.append('rect')
        .attr('id', 'connector')
        .attr('width', connectorWidth)
        .attr('height', connectorHeight)
        .attr('x', (d, i) => { return connectorPositionX})
        .attr('y', (d, i) => { return connectorPositionY })
        .style('stroke', 'black')
        .style('fill', 'white')
        .append('text')
        .text('Connector')
        .attr('fill', 'white')
}
function createDataPoints(json) {
    //append group element for each session
    let sessions = svg
        .select('#sessions')
        .selectAll('g')
        .data(json)
        .enter()
        .append('g')
        .attr('id' , (d,i) => {return "session"+i})
        .attr('class', "session")
    
    //append session spacer 
    sessions.append('path')
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke', 'rgba(12,12,234,0.2)')
        .attr('fill', 'none')
        .attr('d', (d, i) => { return "M0,"+window.innerHeight*i*sessionHeightFactor+"L"+window.innerWidth+","+window.innerHeight*sessionHeightFactor*i+""})

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
        .attr('width', 10)
        .attr('height', 10)
        .append('xhtml:div')
        .attr('class', 'text')
        .html(d => {
            return marked.parse(d.text)
        })
}
function updateDataLinks() {
    //calculate the curves for the connectors
    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
    let connector = d3.select('#connector')
    let anchor1 = [parseFloat(connector.attr('x')) + connectorWidth / 2, parseFloat(connector.attr('y')) + connectorHeight / 2]
    d3.selectAll('.fixObjects').each(function (d, i) {
        if (d.y > window.scrollY && d.y < window.scrollY + window.innerHeight * sessionHeightFactor) {
            d.visible = true
            let rect = this.classList.contains("content")
            let anchor4 = [rect ? d.x + connectorWidth / 2 : d.x, rect ? d.y + connectorHeight * sessionHeightFactor / 2 : d.y]
            let anchor2 = [0, anchor1[1]]
            let anchor3 = [0, anchor4[1]]
            //creating anchorpoints
            if (anchor4[0] > anchor1[0]) {
                anchor2[0] = anchor1[0] + (anchor4[0] - anchor1[0]) / 4
                anchor3[0] = anchor4[0] - (anchor4[0] - anchor1[0]) / 4
            }
            if (anchor4[0] < anchor1[0]) {
                anchor2[0] = anchor1[0] - (anchor1[0] - anchor4[0]) / 4
                anchor3[0] = anchor4[0] + (anchor1[0] - anchor4[0]) / 4
            }
            d.linePath = line([anchor1, anchor2, anchor3, anchor4])
            d.distance = map_range(calculateDistanceY(anchor1, anchor4), 0, 500, 1, 0)
        } else {
            d.visible = false
        }
    })
    //push the position of the connector to the curves array
    drawLinks()
    drawSize()
}
function calculateDistanceY(p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))
}
function drawSize(){
    d3.selectAll('.content').each(function (d, i) {
        let ele = d3.select(this)
        ele.attr('width',d =>  10 + contentWidth * (d.distance >= 0 ? d.distance : 0))
        .attr('height',d => 10 + contentHeight * (d.distance >= 0 ? d.distance : 0))

        ele.select('.text')
        .attr('style', d => `font-size: ${10 + 10 * (d.distance >= 0 ? d.distance : 0)}px; border: 1px solid black; width: 50%; height: 50%;`)
        
    })
}
function drawLinks() {
    let curves = [];
    d3.selectAll('.fixObjects').each(function (d, i) {
        curves.push({
            line: d.linePath,
            distance: d.distance,
            visible: d.visible
        })
    })
    svg.selectAll('.dataLinks')
        .data(curves)
        .join(
            function (enter) {
                return enter.select('#curves').append('path')
                    .attr('class', 'dataLinks')
                    .attr('d', d => d.line)
                    .attr('stroke', d => `rgba(12,12,234,${d.distance})`)
                    .attr('visibility', d => d.visible ? 'visible' : 'hidden')
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
            },
            function (update) {
                return update
                    .attr('d', d => d.line)
                    .attr('stroke', d => `rgba(12,12,234,${d.distance})`)
                    .attr('visibility', d => d.visible ? 'visible' : 'hidden')
            },
            function (exit) {
                return exit.remove()
            }
        )
}
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}