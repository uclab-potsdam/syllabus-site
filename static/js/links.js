function updateLinks() {
        //calculate the curves for the connectors
        let cursorPosition = (currentPosition + window.innerHeight) - (currentProgress * window.innerHeight)
        items.map((d, i) => {
                let anchor1 = [window.innerWidth/2,  cursorPosition+10]
                if(!d.name){
                    anchor1[1] = cursorPosition+10 + connectorDimensions.height/2 // if its content attach it to the middle of the connector
                }
                let left = d.xVarianz
                let anchor4 = []
                    if(d.left){
                        left += window.innerWidth * 0.1
                        anchor4 = [left + d.width/2,d.y + d.height/2]
                    }else{
                        left += window.innerWidth * 0.9
                        anchor4 = [left - d.width/2,d.y + d.height/2]
                    }               
                let distance = calculateDistanceY(anchor1, anchor4)
                if (distance < window.innerHeight / 2) {
                    d.visible = true
                    let anchor2 = [0, anchor1[1]]
                    let anchor3 = [0, anchor4[1]]
                    let anchorTilt = remapRange(distance,0,window.innerHeight/2,5,4)
                    //creating anchorpoints
                    if (anchor4[0] > anchor1[0]) {
                        anchor2[0] = anchor1[0] + (anchor4[0] - anchor1[0]) / anchorTilt 
                        anchor3[0] = anchor4[0] - (anchor4[0] - anchor1[0]) / anchorTilt
                    }
                    if (anchor4[0] < anchor1[0]) {
                        anchor2[0] = anchor1[0] - (anchor1[0] - anchor4[0]) / anchorTilt 
                        anchor3[0] = anchor4[0] + (anchor1[0] - anchor4[0]) / anchorTilt
                    }
                    d.linePath = line([anchor1, anchor2, anchor3, anchor4])
                    d.distance = remapRange(distance, 0, window.innerHeight/2, 1, 0)
            }else{
                d.visible = false
            }
        })
    drawLinks()
}
function drawLinks() {
    let svg = d3.select('#links')
    let visible = items.filter((d) =>  d.visible)
    let connectorOpacity = currentProgress < 0.9
    ? 1
    : 1 - Math.pow(Math.sin(((currentProgress - 0.9) * 10) * (Math.PI / 2)), 15)
    svg.selectAll('.links')
        .data(visible)
        .join(
            function (enter) {
                return enter.select('#curves').append('path')
                    .attr('class', 'links')
                    .attr('d', d => d.linePath)
                    .attr('stroke', d => `rgba(12,12,234,${connectorOpacity <= d.distance ? Math.pow(connectorOpacity,2) :d.distance})`)
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
            },
            function (update) {
                return update
                    .attr('d', d => d.linePath)
                    .attr('stroke', d => `rgba(12,12,234,${connectorOpacity <= d.distance ? Math.pow(connectorOpacity,2) :d.distance})`)
            },
        )
}
function remapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function calculateDistanceY(p1, p2) {
    return Math.abs(p2[1] - p1[1])
}