//put the update in an animation frame loop
document.addEventListener('scroll', (e) => {
    e.preventDefault()
    update()
})
let lastScrollY = null;
let visibleCursors = [];
function updateCursor(currentSession,currentProgress) {
    let cursor = d3.select('#cursor'+(currentSession.index))
    if(cursor.node()){
        let cursorDimensions = cursor.node().getBoundingClientRect()
        let cursorPosition = 
        (currentSession.margin + (currentSession.index == 0 ? window.innerHeight/2: window.innerHeight)) + //start from the bottom of the screen
        (currentProgress * currentSession.height) - //add the progress of the current session
        (currentProgress * (currentSession.index == 0 ? window.innerHeight/2: window.innerHeight)) - //subtract the progress of the window
        (cursorDimensions.height / 2) //subtract half the height of the cursor
    
        cursor.attr('style', `top:${cursorPosition}px;`)
        return updateLinks(currentSession,currentProgress,cursorDimensions)
    }
    return []
}
function animation(){
    if(!scrolled && sessions.length > 0){
        hashChange()
        scrolled = true
    }

	if (lastScrollY!=window.scrollY) {
		lastScrollY=window.scrollY;
		update();
	}

    //loop the animation frame
    requestAnimationFrame(() => {animation()})
}
function update(){
    let linkItems = []
    sessions.map(session => {
        if(session.margin <= window.scrollY + window.innerHeight){
            d3.select('#anchor'+(session.index))?.classed('active',(session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height)))
            let currentProgress = (window.scrollY - session.margin)/session.height
            linkItems.push( updateCursor(session,currentProgress))
        }else{
            d3.select('#anchor'+(session.index))?.classed('active',false)
        }
    })  
    drawLinks(linkItems.flat())
}
