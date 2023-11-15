let svg;
let currentSession = 0;
let boxWidth = 100;
let boxHeight = 50;
let radius = 50;

document.addEventListener('scroll', event => {
    //update connectors position according to scroll
    let connector = d3.select('#connector')
    connector.attr('y', window.scrollY + window.innerHeight / 2 - boxHeight / 2) <
    updateDataLinks()
})
document.addEventListener('mousemove', event => {

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
    json.map((session, i) => {
        session.actors.map(actor => {
            actor.linePath = null
            actor.distance = null
            actor.visible = false
            actor.x = 200 + (window.innerWidth / 2) * Math.random() - 100
            actor.y = (200 + (window.innerHeight / 2) * Math.random() - 100) + window.innerHeight * i
        })
        session.content = session.content.map(content => {
            return {
                text: content,
                linePath:null,
                distance:null,
                visible:false,
                x: 200 + (window.innerWidth / 2) * Math.random() - 100,
                y: (200 + (window.innerHeight / 2) * Math.random() - 100) + window.innerHeight * i
            }
        })
    })
    console.log(json)
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
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('x', (d, i) => { return window.innerWidth / 2 - boxWidth / 2 })
        .attr('y', (d, i) => { return window.innerHeight / 2 - boxHeight / 2 })
        .style('stroke', 'black')
        .style('fill', 'white')
        .append('text')
        .text('Connector')
        .attr('fill', 'white')
}
function createDataPoints(json) {
    let sessions = svg
        .selectAll('#sessions g')
        .data(json)
        .enter()
        .append('g')
        .attr('class', "session")

    let actors = sessions
        .selectAll('.actors')
        .data(d => d.actors)
        .enter()
        .append('g')
        .attr('class', "actors fixObjects")
        .attr('transform', (d, i) => { return `translate(${d.x},${d.y})` })

    actors.append('circle')
        .attr('r', radius)
        .attr('stroke', 'green')
        .attr('id', (d, i) => { return "actor" + i })
        .attr('fill', 'white')
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
        .append('g')
        .attr('class', "content fixObjects")
        .attr('transform', (d, i) => { return `translate(${d.x},${d.y})` })

    content.append('rect')
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('stroke', 'red')
        .attr('fill', 'white')
        .attr('z-index', 1)

    content.append('text')
        .attr('fill', 'black')
        .attr('x', 5)
        .text(d => d.text.split(' ')[0])
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
    let anchor1 = [parseFloat(connector.attr('x')) + boxWidth / 2, parseFloat(connector.attr('y')) + boxHeight / 2]
    d3.selectAll('.fixObjects').each(function (d, i) {
        if (d.y > window.scrollY && d.y < window.scrollY + window.innerHeight) {
            d.visible = true
            let rect = this.classList.contains("content")
            let anchor4 = [rect ? d.x + boxWidth / 2 : d.x,rect ?d.y + boxHeight / 2 : d.y]
            let anchor2 = [0,anchor1[1]]
            let anchor3 = [0,anchor4[1]]
            //creating anchorpoints
            if (anchor4[0] > anchor1[0]) {
                anchor2[0] = anchor1[0] + (anchor4[0] - anchor1[0]) / 4
                anchor3[0] = anchor4[0] - (anchor4[0] - anchor1[0]) / 4
            }
            if (anchor4[0] < anchor1[0]) {
                anchor2[0] = anchor1[0] - (anchor1[0] - anchor4[0]) / 4
                anchor3[0] = anchor4[0] + (anchor1[0] - anchor4[0]) / 4
            }
            d.linePath = line([anchor1,anchor2,anchor3,anchor4])
            d.distance = map_range(calculateDistanceY(anchor1,anchor4),0,window.innerHeight/2.5,1,0)
        }else{
            d.visible = false
        }
    })
}
function calculateDistanceY(p1,p2) {
    return Math.abs(p2[1]-p1[1])
 }
function drawLinks() {
    let curves = [];
    d3.selectAll('.fixObjects').each(function (d, i) {
        curves.push({
            line: d.linePath,
            distance: d.distance
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
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
            },
            function (update) {
                return update
                .attr('d', d => d.line)
                .attr('stroke', d => `rgba(12,12,234,${d.distance})`)
            }
        )
}
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}