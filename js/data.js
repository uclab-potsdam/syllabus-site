rootItem.style.top = item.y + "px";
rootItem.style.transform = `translate(${item.xVarianz}px,0)`
async function createBaseData(json) {
    let items = [];
    let sessions = [];
    json.map((session, sessionNumber) => {
        //set height of session according to mobile or desktopy
        let totalItems = session.actors.length + session.content.length
        let itemHeights = window.mobileCheck ? 0.75 : 0.35
        session.height = window.innerHeight + //add start padding
        (window.innerHeight * itemHeights) * totalItems + //add the height of all items
        window.innerHeight //add end padding
        session.margin = json[sessionNumber - 1] ? json[sessionNumber - 1].height + json[sessionNumber - 1].margin : 0
        if (sessionNumber + 1 == json.length) {
            session.height += window.innerHeight * 2 //add end padding
            session.end = true;
        } else {
            session.end = false;
        }
        session.index = sessionNumber
        //set position for items
        let objects = [...session.actors, ...session.content]
        objects.map((object) => {
            updateBaseDataObject(object, session, items)
        })
        sessions.push(session)
    })
    //set height and padding according to datasize
    let height = sessions.reduce((accumulator, session) => { return accumulator += session.height }, 0)
    //set the body height to the height of the data
    let elements  = ['#app', '#links', '#wrapper']
    elements.map(element => {
        d3.select(element).attr('style', 'height:' + height + 'px; width:' + window.innerWidth + 'px')
    })
    await createDataRepresentation(items);
    return [sessions, items]
}
function updateBaseDataObject(item, session, items) {
    let itemsInSession = session.actors.length + session.content.length
    item.type = item.markdown ? 'content' : 'actor'
    item.visible = false
    item.left = items.length % 2 == 0 ? true : false
    if (item.left) {
        item.xVarianz = -window.innerWidth * 0.05 + Math.random() * window.innerWidth * 0.15
    } else {
        item.xVarianz = window.innerWidth * 0.05 + Math.random() * -window.innerWidth * 0.15
    }
    item.y = session.margin + //margin of the session
        window.innerHeight + //start padding
        session.height * 0.2 + // 
        (session.height - session.height * 0.4 - window.innerHeight) / itemsInSession * //the share of space divided by the amount of items
        items.length // the index of current item
    //push it to items
    items.push(item)
}
async function createDataRepresentation(items) {
    //create svg
    let rootElement = document.getElementById('content');
    items.map(async (item) => {
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
        item.width = item.domObject.getBoundingClientRect().width
        item.height = item.domObject.getBoundingClientRect().height
    })

}