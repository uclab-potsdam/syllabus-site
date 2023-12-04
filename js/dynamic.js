function updateCursor(sessions,currentProgress,currentSession,lastSession) {
    let cursor = d3.select('#cursor')
    //update the cursor if the session changes
    if (lastSession != currentSession && currentSession < sessions.length) {
        cursor.html(`<p>${sessions[currentSession].date}<p>` + marked.parse(sessions[currentSession].text))
    }
    //update the cursor dimension and the position according to the scrolling progress of the session
    let cursorDimensions = cursor.node().getBoundingClientRect()
    let cursorPosition = ((window.scrollY + window.innerHeight) - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    cursor.attr('style', `top:${cursorPosition}px;`)

    return [cursorDimensions,cursorPosition]
}
//put the update in an animation frame loop
function animation(sessions,items,lastSession){
    //calculate the current session and the progress in the session
    let currentSession = sessions.filter(session => session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height))[0]?.index ?? 0
    let currentProgress = (window.scrollY - sessions[currentSession].margin)/sessions[currentSession].height
    //update the cursor
    let [cursorDimensions,cursorPosition] = updateCursor(sessions,currentProgress,currentSession,lastSession)
    //update the links that go into the cursor
    updateLinks(items,cursorPosition,cursorDimensions)
    //loop the animation frame
    requestAnimationFrame( () => {animation(sessions,items,currentSession)})
}
