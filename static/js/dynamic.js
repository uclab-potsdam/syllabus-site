//this listener updates the progress of the scrolling and the position of the connector
document.addEventListener('scroll', () => {
    currentSession = sessions.filter(session => session.padding < window.scrollY && window.scrollY < (session.padding + session.height))[0]?.index ?? null
    currentProgress = (window.scrollY - sessions[currentSession].padding)/sessions[currentSession].height
    currentPosition = window.scrollY
    items.filter(item => item.width == undefined && item.domObject != undefined).map(item => {
        console.log("here")
        let domObject = item.domObject.getBoundingClientRect()
        item.width = domObject.width
        item.height = domObject.height
    })
})
function updateConnector() {
    let connector = d3.select('#connector')
    if (currentSession != null) {
        if (lastSession != currentSession && currentSession < sessions.length) {
            connector.html(`<p>${sessions[currentSession].date}<p>` + marked.parse(sessions[currentSession].text))
            connectorDimensions = connector.node().getBoundingClientRect()
            lastSession = currentSession
        } else {
            let opacity = currentProgress < 0.9
                ? 1
                : 1 - Math.pow(Math.sin(((currentProgress - 0.9) * 10) * (Math.PI / 2)), 15)
            connector.attr('style', `top: ${(currentPosition + window.innerHeight) - (currentProgress * window.innerHeight)}px; opacity: ${opacity}`)
        }
    }
}
//put the update in an animation frame loop
function animation(){

    //update the data representation
    updateConnector()
    //update the links that go into the connector
    updateLinks()
    //loop the animation frame
    requestAnimationFrame(animation)
}