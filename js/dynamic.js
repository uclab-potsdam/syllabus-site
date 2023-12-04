document.addEventListener("scroll", function(event) {
    let top = document.querySelector('#cursor').style.top
    document.querySelector('#cursor').style.top = top
})
function updateCursor(currentSession,currentProgress,lastSession) {
    let cursor = d3.select('#cursor')
    //update the cursor if the session changes
    if (lastSession != currentSession) {
        console.log(currentSession)
        cursor.html(`<p>${currentSession.date}<p>` + marked.parse(currentSession.text))
    }
    //update the cursor dimension and the position according to the scrolling progress of the session
    let cursorDimensions = cursor.node().getBoundingClientRect()
    let cursorPosition = ((window.scrollY + window.innerHeight) - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    cursor.attr('style', `top:${cursorPosition}px;`)

    return [cursorDimensions,cursorPosition]
}
//put the update in an animation frame loop
function animation(lastSession){
    //calculate the current session and the progress in the session
    let currentSession = sessions.filter(session => session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height))[0]
    let currentProgress = (window.scrollY - currentSession.margin)/currentSession.height
    //update the cursor
    let [cursorDimensions,cursorPosition] = updateCursor(currentSession,currentProgress,lastSession)
    //update the links that go into the cursor
    updateLinks(currentSession,cursorPosition,cursorDimensions)
    //loop the animation frame
    requestAnimationFrame( () => {animation(currentSession)})
}
