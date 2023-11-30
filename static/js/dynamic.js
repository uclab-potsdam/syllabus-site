//this listener updates the progress of the scrolling and the position of the cursor
function updateCursor(sessions,currentProgress,currentSession,lastSession) {
    //only update if the current session is set
    let cursor = d3.select('#cursor')
    if (lastSession != currentSession && currentSession < sessions.length) {
        //update the cursor content
        cursor.html(`<p>${sessions[currentSession].date}<p>` + marked.parse(sessions[currentSession].text))
    }
    let cursorDimensions = cursor.node().getBoundingClientRect()
    let cursorPosition = ((window.scrollY + window.innerHeight) - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    cursor.attr('style', `top:${cursorPosition}px;`)

    return [cursorDimensions,cursorPosition]
}
//put the update in an animation frame loop
function animation(sessions,items,lastSession){
    let currentSession = sessions.filter(session => session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height))[0]?.index ?? 0
    let currentProgress = (window.scrollY - sessions[currentSession].margin)/sessions[currentSession].height
    //update the data representation
    let [cursorDimensions,cursorPosition] = updateCursor(sessions,currentProgress,currentSession,lastSession)
    //update the links that go into the cursor
    updateLinks(items,currentProgress,cursorPosition,cursorDimensions)
    //loop the animation frame
    requestAnimationFrame( () => {animation(sessions,items,currentSession)})
}
