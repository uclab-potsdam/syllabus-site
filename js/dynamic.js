document.addEventListener("scroll",() => {
    d3.select('#cursor').attr('style', `top:${lastCursorPosition}px;`)
})
function updateCursor(currentSession,currentProgress,lastSession) {
    let cursor = d3.select('#cursor')
    //update the cursor if the session changes
    if (lastSession != currentSession) {
        cursor.html(`<p>${currentSession.date}<p>` + marked.parse(currentSession.text))
    }
    //update the cursor dimension and the position according to the scrolling progress of the session
    let cursorDimensions = cursor.node().getBoundingClientRect()
    let cursorPosition = ((window.scrollY + window.innerHeight) - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    let cursorPositionRelative = (window.innerHeight - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    cursor.attr('style', `top:${cursorPositionRelative}px;`)

    lastCursorPosition = cursorPositionRelative

    updateLinks(currentSession,cursorPosition,cursorDimensions)
}
//put the update in an animation frame loop
let lastCursorPosition = 0
function animation(lastSession){
    //calculate the current session and the progress in the session
    let currentSession = sessions.filter(session => session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height))[0]
    let currentProgress = (window.scrollY - currentSession.margin)/currentSession.height
    //update the cursor
    updateCursor(currentSession,currentProgress,lastSession)
    //loop the animation frame
    requestAnimationFrame(() => {animation(currentSession)})
}
