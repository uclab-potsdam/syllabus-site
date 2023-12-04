const sessions = [];
function createBaseData(json) {
    json.map((session, sessionIndex) => {
        session.index = sessionIndex
        session.height = window.innerHeight * 1.5
        session.margin = sessionIndex == 0 ? 0 : sessions[sessionIndex - 1].margin + sessions[sessionIndex - 1].height
        //set position for items
        session.items = [...session.actors, ...session.content]
        session.items.map((item,itemIndex) => {
            updateItemBase(item, session,itemIndex)
            item.margin = item.type == "actor"? 0 : session.items[itemIndex - 1].margin + session.items[itemIndex - 1].bounding.height + window.innerHeight * 0.1 
            session.height += item.bounding.height + window.innerHeight * 0.1
        })
        session.items.map((item,itemIndex) => {
            updateItemPosition(item,itemIndex)
        })
        sessions.push(session)
    })
    console.log(sessions)
    //set height and padding according to datasize
    let height = sessions.reduce((accumulator, session) => { return accumulator += session.height }, 0)
    //set the body height to the height of the data
    let elements = ['#app', '#links', '#wrapper']
    elements.map(element => {
        let ele = document.querySelector(element)
        ele.style.height = height + 'px' 
    })
    return sessions
}
function updateItemPosition(item) {
    //set height of session according to mobile or desktopy
    item.y = item.session.margin + //margin to the top
    window.innerHeight*  1.5 + //height of the session padding-top
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
        svg.setAttribute('style', 'margin-top: -15px')

        // Create a path element for the curve
        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M30 15 Q 95 65 180 10");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "none");
        path.setAttribute("id", "curve")

        // Create a text element
        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("font-size", "16");
        text.setAttribute("font-family", "Arial");

        // Create a textPath element and set the xlink:href attribute to the path ID
        let textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
        textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#curve");
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
        if (rootItem.getElementsByTagName('img').length > 0) {
            let title = rootItem.getElementsByTagName('img')[0].getAttribute('title')
            if (title == null) {
                title = rootItem.getElementsByTagName('img')[0].getAttribute('alt')
            }
            let element = document.createElement('h3')
            element.innerHTML = title
            rootItem.prepend(document.createElement('br'))
            rootItem.prepend(element)
            rootItem.classList.add('image')
        } else {
            rootItem.classList.add('text')
        }
    }
    item.domObject = rootItem
    rootElement.appendChild(rootItem);
    item.bounding = item.domObject.getBoundingClientRect()
}