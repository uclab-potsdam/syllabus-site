//put the update in an animation frame loop
// document.addEventListener('scroll', (e) => {
//     e.preventDefault()
//     update()
// })
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    update();
});
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
        cursor.attr('style', `top:${cursorPosition}px;`);
        cloneCursor('cursor'+(currentSession.index));
        return updateLinks(currentSession,currentProgress,cursorDimensions)
    }
    return []
}

function cloneCursor(originalDivId) {
    const originalDiv = document.getElementById(originalDivId);
    if (!originalDiv) return;

    const cloneDivId = originalDivId + '_clone';
    let cloneDiv = document.getElementById(cloneDivId);

    // Get the #app element to append clones to
    const appElement = document.getElementById('app');
    if (!appElement) {
        console.error('Element with ID #app not found.');
        return;
    }

    // Check if any part of the original div is in the viewport
    const rect = originalDiv.getBoundingClientRect();
    const isVisiblePartially = 
        (rect.top < window.innerHeight && rect.bottom >= 0); // Vertical visibility

    if (!isVisiblePartially) {
        // If no part of the original div is visible, remove the clone if it exists
        if (cloneDiv) {
            cloneDiv.parentNode.removeChild(cloneDiv);
        }
        return;
    }

    if (!cloneDiv) {
        cloneDiv = originalDiv.cloneNode(true);
        cloneDiv.id = cloneDivId;
        cloneDiv.style.position = 'fixed';
        appElement.appendChild(cloneDiv); // Append to the #app element instead of document.body
    }

    // Adjust the position of the duplicate
    cloneDiv.style.top = rect.top + 'px';
    cloneDiv.classList.add('clone');
}

function removeInvisibleClones() {
    const clones = document.querySelectorAll('.clone');

    clones.forEach(clone => {
        const originalId = clone.id.replace('_clone', '');
        const originalDiv = document.getElementById(originalId);

        if (originalDiv) {
            const rect = originalDiv.getBoundingClientRect();
            const isVisiblePartially = (rect.top < window.innerHeight && rect.bottom >= 0);                
            if (!isVisiblePartially) clone.parentNode.removeChild(clone);            
        } 
        else clone.parentNode.removeChild(clone);
        
    });
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
    drawLinks(linkItems.flat());

    let clones = document.querySelectorAll('.clone');
    if (clones.length > 1) removeInvisibleClones();
}
