//put the update in an animation frame loop
let lastCursorPosition = 0
let lastSession = null
document.addEventListener("scroll",() => {
    d3.select('#cursor').attr('style', `top:${lastCursorPosition}px;`)
})
function updateCursor(currentSession,currentProgress) {
    let cursor = d3.select('#cursor')
    //update the cursor if the session changes
    if (lastSession == null || lastSession.index != currentSession.index) {
        cursor.html(marked.parse(currentSession.text))
        lastSession = currentSession
        document.getElementById('menu').childNodes.forEach(childNode => {childNode.classList.remove('active')})
        document.getElementById('menu').childNodes[currentSession.index].classList.add('active')
    }
    //update the cursor dimension and the position according to the scrolling progress of the session
    let cursorDimensions = cursor.node().getBoundingClientRect()
    let cursorPosition = ((window.scrollY + window.innerHeight) - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    let cursorPositionRelative = (window.innerHeight - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    cursor.attr('style', `top:${cursorPositionRelative}px;`)
    lastCursorPosition = cursorPositionRelative
    updateLinks(currentSession,cursorPosition,cursorDimensions)
}

function animation(){
    //calculate the current session and the progress in the session
    update()
    //loop the animation frame
    requestAnimationFrame(() => {animation()})
}
function update(){
    let currentSession = sessions.filter(session => session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height))[0]
    let currentProgress = (window.scrollY - currentSession.margin)/currentSession.height
    if(currentSession.index == 0){
        currentProgress = ((window.scrollY+currentSession.height/2)-(currentProgress * currentSession.height/2) - currentSession.margin)/currentSession.height
    }
    //update the cursor
    updateCursor(currentSession,currentProgress)
}
