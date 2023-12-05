const sessions = [];
function createBaseData(json) {
    json.map((session, sessionIndex) => {
        session.index = sessionIndex
        session.height = window.innerHeight * 1.5 + //padding at the beggining
        (json.length-1 == session.index?window.innerHeight : 0)  //if last session add padding at the end
        //set position for items
        let actors = session.actors ?? [];
        session.items = [...actors, ...session.content]
        session.items.map((item,itemIndex) => {
            updateItemBase(item, session,itemIndex)
        })
        sessions.push(session)
    })
    updateView()
}
async function updateView(){
    //due to weird race condition with some css and getBoundingClientRect 
    //=> found out its due image loading that the image size cant be extracted immidiatly after setting the img tag.
    await new Promise(r => setTimeout(r, 300)); 
    sessions.map((session,sessionIndex) => {
        session.items.map((item,itemIndex) => {
            item.bounding = item.domObject.getBoundingClientRect()
            item.height = item.bounding.height
            if (itemIndex === 0) item.margin = 0
            else item.margin = session.items[itemIndex - 1].margin + session.items[itemIndex - 1].height            
            session.height += item.height 
        })
        session.margin = sessionIndex == 0 ? 0 : sessions[sessionIndex - 1].margin + sessions[sessionIndex - 1].height
        session.items.map((item,itemIndex) => {
            updateItemPosition(item,itemIndex)
        })
    })
    //set height and padding according to datasize
    let height = sessions.reduce((accumulator, session) => { return accumulator += session.height}, 0)
    //set the body height to the height of the data
    let elements = ['#links', '#wrapper','#app']
    elements.map(element => {
        document.querySelector(element).style.height = height + 'px' 
    })
    document.querySelectorAll('.content').forEach(n => {
        n.style.visibility = 'visible'
    })
    document.querySelectorAll('.actors').forEach(n => {
        n.style.visibility = 'visible'
    })
    animation(null)
}
function updateItemPosition(item) {
    //set height of session according to mobile or desktopy
    item.y = item.session.margin + //margin to the top
    window.innerHeight * 1.5 + //height of the session padding-top
    item.margin //margin to the top of the session

    item.varianz = item.left ? Math.random() * window.innerWidth * 0.05: Math.random() * -window.innerWidth * 0.05
    item.x = item.left ? window.innerWidth * 0.05 + item.varianz : window.innerWidth * 0.95 + item.varianz
    
    item.domObject.style.top = item.y + "px";
    item.domObject.style.transform = `translate(${item.varianz}px,0)`
}
function updateItemBase(item, session,itemIndex) {
    item.type = item.markdown ? 'content' : 'actor'
    item.session = session
    item.visible = false
    item.left = itemIndex% 2 == 0 ? true : false
    createDataRepresentation(item);
}
function createDataRepresentation(item) {
    //create svg
    let rootElement = document.getElementById('content');
    let rootItem = document.createElement('div');
    rootItem.classList.add('fixObjects');
    rootItem.classList.add(item.left ? 'left' : 'right');
    if (item.type == 'actor') {
        rootItem.classList.add('actors');
        if (item.link) {
            let a = document.createElement('a');
            a.href = item.link;
            if (item.title) a.title = item.title;            
            let img = document.createElement('img');
            img.src = item.image;
            a.appendChild(img);
            rootItem.appendChild(a)
        } else {
            let img = document.createElement('img');
            img.src = item.image;
            rootItem.appendChild(img)
        }
        // Create a SVG element
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute('viewBox', '0 0 200 200')
        svg.setAttribute('style', 'margin-top: -60px')

        // Create a path element for the curve
        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        //path.setAttribute("d", "M30 15 Q 95 65 180 10");
        path.setAttribute("d", "M0 40 Q 100 140 200 40");        
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "none");
        path.setAttribute("id", "curve")

        // Create a text element
        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("font-size", "16");
        text.setAttribute("text-anchor", "middle");

        // Create a textPath element and set the xlink:href attribute to the path ID
        let textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
        textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#curve");
        textPath.setAttribute("startOffset", "50%");
        textPath.textContent = item.name;

        // Append the textPath to the text element
        text.appendChild(textPath);

        // Append the path and text elements to the SVG
        svg.appendChild(path);
        svg.appendChild(text);

        // Append the SVG to the rootActor element
        rootItem.appendChild(svg);
    } else {
        rootItem.classList.add('content');
        rootItem.innerHTML = marked.parse(item.markdown)

        
    }
    item.domObject = rootItem
    rootElement.appendChild(rootItem);
}