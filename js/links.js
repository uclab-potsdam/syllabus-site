let logged = false
function updateLinks(currentSession,cursorPosition,cursorDimensions) {
        //set the line generator from d3 https://d3js.org/d3-shape/curve
        let line = d3.line().curve(d3.curveCatmullRom.alpha(0.3));        
        currentSession.items.map((item) => {
                //first anchor is the cursor 
                let anchor1 = [window.innerWidth/2,  cursorPosition+cursorDimensions.height/2]
                let anchor4 = []
                if(item.left){
                    anchor4 = [item.x + item.bounding.width/2,item.y + item.bounding.height/2]
                }else{
                    anchor4 = [item.x - item.bounding.width/2,item.y + item.bounding.height/2]
                }         
                let distance = calculateDistanceY(anchor1, anchor4)
                if (distance < window.innerHeight) {
                    item.visible = true
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
                    item.linePath = line([anchor1, anchor2, anchor3, anchor4])
                    item.distance = remapRange(distance, 0, window.innerHeight, 1, 0)
                }else{
                    item.visible = false
                }
        })
    drawLinks(currentSession.items)
}
function drawLinks(items) {
    //filterout non visible objects
    let visible = items.filter((item) =>  item.visible)
    //draw the links
    d3.select('#links').selectAll('.links')
        .data(visible)
        .join(
            function (enter) {
                return enter.select('#curves').append('path')
                    .attr('class', 'links')
                    .attr('d', d => d.linePath)
                    .attr('stroke', d => `rgba(0,0,0,${d.distance})`)
                    .attr('fill', 'none')
                    .attr('stroke-width', '0.03rem')
            },
            function (update) {
                return update
                    .attr('d', d => d.linePath)
                    .attr('stroke', d => `rgba(0,0,0,${d.distance})`)
            },
        )
}
// remap arbitrary ranges to a new scale
function remapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
// calculate distance as absolute y-difference
function calculateDistanceY(p1, p2) {
    return Math.abs(p2[1] - p1[1])
}