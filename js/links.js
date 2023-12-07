let logged = false
function updateLinks(currentSession,cursorPosition,cursorDimensions) {
        //set the line generator from d3 https://d3js.org/d3-shape/curve
        let anchor1 = [window.innerWidth/2,  cursorPosition+cursorDimensions.height/2]
        currentSession.items.map((item) => {
            //first anchor is the cursor 
            let anchor4 = []
            if(item.left){
                anchor4 = [item.x + item.bounding.width/2,item.y + item.bounding.height/2]
            }else{
                anchor4 = [item.x - item.bounding.width/2,item.y + item.bounding.height/2]
            }    
            let distance = calculateDistanceY(anchor1, anchor4)
            // if (distance < window.innerHeight*1.5) {
            if (true) {
                item.visible = true
                item.distance = remapRange(distance, 0, window.innerHeight*1.5, 1, 0)
                item.linePath = [...anchor1,...anchor4]
            }
            else{
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
                return enter.select('#curves').append('line')
                    .attr('class', 'links')
                    .attr('x1', d => d.linePath[0])
                    .attr('y1', d => d.linePath[1])
                    .attr('x2', d => d.linePath[2])
                    .attr('y2', d => d.linePath[3])
                    .attr('opacity',1) //d => d.distance)
            },
            function (update) {
                return update
                    .attr('x1', d => d.linePath[0])
                    .attr('y1', d => d.linePath[1])
                    .attr('x2', d => d.linePath[2])
                    .attr('y2', d => d.linePath[3])
                    .attr('opacity',1)
                   // .attr('opacity',d => d.distance)
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