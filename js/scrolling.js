//put the update in an animation frame loop
let lastCursorPosition = 0
let lastSession = null
let lastScrollY = null;
document.addEventListener("scroll",() => {
    d3.select('#cursor').attr('style', `top:${lastCursorPosition}px;`)
})
function updateCursor(currentSession,currentProgress) {
    let cursor = d3.select('#cursor')
    //update the cursor if the session changes
    if (lastSession == null || lastSession.index != currentSession.index) {
        cursor.html(marked.parse(currentSession.text))
        lastSession = currentSession
        document.getElementById('anchors').childNodes.forEach(childNode => {childNode.classList.remove('active')})
        let currentNav = document.querySelector('#anchors .'+currentSession.hash)
        if (currentNav!= null) {
            currentNav.classList.add('active')
        }
    }
    //update the cursor dimension and the position according to the scrolling progress of the session
    let cursorDimensions = cursor.node().getBoundingClientRect()
    let cursorPosition = ((window.scrollY + window.innerHeight) - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    let cursorPositionRelative = (window.innerHeight - (currentProgress * window.innerHeight))-(currentProgress * cursorDimensions.height)
    cursor.attr('style', `top:${cursorPositionRelative}px;`)
    lastCursorPosition = cursorPositionRelative
    updateLinks(currentSession,cursorPositionRelative,cursorDimensions)
}
function animation(){
    if(!scrolled && sessions.length > 0){
        hashChange()
        scrolled = true
    }

		if (lastScrollY!=window.scrollY) {
			lastScrollY=window.scrollY;
			resetEnlargedImage()
			update()
		}

    //loop the animation frame
    requestAnimationFrame(() => {animation()})
}
function update(){
	console.log("update");
    let currentSession = sessions.filter(session => session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height))[0]
    if (typeof currentSession == "undefined") return;
    let currentProgress = (window.scrollY - currentSession.margin)/currentSession.height
    if(currentSession.index == 0){
        currentProgress = ((window.scrollY+currentSession.height/2)-(currentProgress * currentSession.height/2) - currentSession.margin)/currentSession.height
    }

    let items = sessions[currentSession.index].items
    const windowHeight = window.innerHeight;
    const middleY = windowHeight / 2;

    updateCursor(currentSession,currentProgress)
}
