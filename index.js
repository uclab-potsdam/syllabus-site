let svg;
const connectorHeight = 50;
const connectorWidth = 100;
const contentWidth = 100;
const contentHeight = 50;
const actorRadius = 50;
// document.addEventListener('mousemove', event => {
//     event.clientX
//         //update connectors position according to scroll
//         let connector = d3.select('#connector')
//         connector.attr('x',window.scrollX+event.clientX-connectorWidth/2)
//         connector.attr('y', window.scrollY+event.clientY-connectorHeight/2) 
//         updateDataLinks()
// })
// document.addEventListener('scroll', event => {
//     //update connectors position according to scroll
//             //update connectors position according to scroll
//             let connector = d3.select('#connector')
//             connector.attr('x',window.scrollX+event.clientX-connectorWidth/2)
//             connector.attr('y', window.scrollY+event.clientY-connectorHeight/2) 
//             updateDataLinks()
// })
document.addEventListener('scroll', event => {
    //update connectors position according to scroll
    let connector = d3.select('#connector')
    connector.attr('y', window.scrollY + window.innerHeight / 2 - connectorHeight / 2) 
    updateDataLinks()
})
function init(course) {
    fetch(`./${course}/data.json`)
        .then(data => data.json())
        .then(json => {
            generateCoordinatedData(json);
            createStaticContent(json);
            createDataPoints(json);
            updateDataLinks();
        })
}
function generateCoordinatedData(json) {
    let positionMapX = []
    let positionMapY = []
    json.map((session, i) => {
        session.actors.map(actor => {
            let [x,y] = generateCollisionlessCoordinates(positionMapX,positionMapY,i)
            actor.linePath = null
            actor.distance = null
            actor.visible = true
            actor.x = x
            actor.y = y
        })
        session.content = session.content.map(content => {
            let [x,y] = generateCollisionlessCoordinates(positionMapX,positionMapY,i)
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
function generateCollisionlessCoordinates(positionMapX,positionMapY,i){
    let fit = false;
    let x = 0;
    let y = 0;
    while(fit == false){
        x = 100 + (window.innerWidth - 200) * Math.random()
        y = 100 + ((window.innerHeight  - 200) * Math.random()) + window.innerHeight * i
        let found = false;
        let n = 0;
        while (found == false && n < positionMapX.length) {
            if (Math.abs(positionMapX[n] - x) < 100 && Math.abs(positionMapY[n] - y) < 100) {
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
    let width = window.innerWidth;
    let height = window.innerHeight * json.length;
    let rootElement = document.getElementById('diagram');
    svg = d3.select(rootElement)
        .append('svg')
        .attr('id', 'svg')
        .attr("width", width)
        .attr("height", height);

    svg.append('g')
        .attr('id', 'curves')

    svg.append('g')
        .attr('id', 'sessions')


    connector = svg
        .append('rect')
        .attr('id', 'connector')
        .attr('width', connectorWidth)
        .attr('height', connectorHeight)
        .attr('x', (d, i) => { return window.innerWidth / 2 - connectorWidth / 2 })
        .attr('y', (d, i) => { return window.innerHeight / 2 - connectorHeight / 2 })
        .style('stroke', 'black')
        .style('fill', 'white')
        .append('text')
        .text('Connector')
        .attr('fill', 'white')
}
function createDataPoints(json) {
    let sessions = svg
        .select('#sessions')
        .selectAll('g')
        .data(json)
        .enter()
        .append('g')
        .attr('class', "session")
    
    sessions.append('path')
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke', 'rgba(12,12,234,0.2)')
        .attr('fill', 'none')
        .attr('d', (d, i) => { return "M0,"+window.innerHeight*i+"L"+window.innerWidth+","+window.innerHeight*i+""})

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
    actors.append('circle')
        .attr('r', actorRadius)
        .attr('stroke', 'rgba(12,12,234,0.7)')
        .attr('fill', d => { return 'url(#' + d.image + ')' })
    actors.append('defs')
        .append('pattern')
        .attr('id', d => { return d.image })
        .attr('height', "100%")
        .attr('width', "100%")
        .append('image')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', actorRadius * 2)
        .attr('width', actorRadius * 2)
        .attr('xlink:href', d => { return 'organigrams/' + d.image })

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




    let content = sessions
        .selectAll('.content')
        .data(d => d.content)
        .enter()
        .append('foreignObject')
        .attr('transform', (d, i) => { return `translate(${d.x},${d.y})` })
        .attr('class', "content fixObjects")
        .attr('width', connectorWidth)
        .attr('height', connectorHeight)
        .attr('style', 'text-align: justify;font-size: 2px')
        .append('xhtml:body')
        .append('xhtml:div')
        .html(d => {
            return marked.parse(d.text)
        })
}
function updateDataLinks() {
    //calculate the curves for the connectors
    calculateBezierLine()
    //push the position of the connector to the curves array
    drawLinks()
}
function calculateBezierLine() {
    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
    let connector = d3.select('#connector')
    let anchor1 = [parseFloat(connector.attr('x')) + connectorWidth / 2, parseFloat(connector.attr('y')) + connectorHeight / 2]
    d3.selectAll('.fixObjects').each(function (d, i) {
        if (d.y > window.scrollY && d.y < window.scrollY + window.innerHeight) {
            d.visible = true
            let rect = this.classList.contains("content")
            let anchor4 = [rect ? d.x + connectorWidth / 2 : d.x, rect ? d.y + connectorHeight / 2 : d.y]
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
            d.distance = map_range(calculateDistanceY(anchor1, anchor4), 0, window.innerHeight / 2, 1, 0)
        } else {
            d.visible = false
        }
    })
}
function calculateDistanceY(p1, p2) {
    return Math.abs(p2[1] - p1[1])
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
            }
        )
}
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}