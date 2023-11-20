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
            d.distance = remapRange(calculateDistance(anchor1, anchor4), 0, 500, 1, 0)
        } else {
            d.visible = false
        }
    })
    //push the position of the connector to the curves array
    drawLinks()
    drawSize()
}
function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))
}
function drawSize(){
    d3.selectAll('.content').each(function (d, i) {
        let ele = d3.select(this)
        ele.attr('width',d =>  10 + contentWidth * (d.distance >= 0 ? d.distance : 0))
        .attr('height',d => 10 + contentHeight * (d.distance >= 0 ? d.distance : 0))
        ele.select('.text-wrapper')
        .attr('style', 'width: 95%; height: 95%; border: 1px solid black; border-radius: 50%; position: relative')

        ele.select('.text')
        .attr('style', d => `font-size: ${10 + 10 * (d.distance >= 0 ? d.distance : 0)}px; width: 50%; height: 50%;position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`)
        
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
function remapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}