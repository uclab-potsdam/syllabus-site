const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
function updateLinks() {
        //calculate the curves for the connectors
        let cursorPosition = (currentPosition + window.innerHeight) - (currentProgress * window.innerHeight)
        let anchor1 = [window.innerWidth/2, cursorPosition]
        items.map((d, i) => {
                let anchor4 = [
                    d.x > anchor1[0] ? d.x : d.x + d.width,
                    d.y + d.height/2]
                let distance = calculateDistanceY(anchor1, anchor4)
                if (distance < window.innerHeight / 2) {
                    d.visible = true
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
                    d.distance = remapRange(distance, 0, window.innerHeight/2, 1, 0)
            }else{
                d.visible = false
            }
        })
    //push the position of the connector to the curves array
    drawLinks()
}
function drawLinks() {
    let visible = items.filter((d, i) =>  { return d.visible == true })
    svg.selectAll('.links')
        .data(visible)
        .join(
            function (enter) {
                return enter.select('#curves').append('path')
                    .attr('class', 'links')
                    .attr('d', d => d.linePath)
                    .attr('stroke', d => `rgba(12,12,234,${d.distance})`)
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
            },
            function (update) {
                return update
                    .attr('d', d => d.linePath)
                    .attr('stroke', d => `rgba(12,12,234,${d.distance})`)
            },
        )
}
function remapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function calculateDistanceY(p1, p2) {
    return Math.abs(p2[1] - p1[1])
}