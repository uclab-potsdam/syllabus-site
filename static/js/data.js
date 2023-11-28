function createBaseData(json) {
    json.map((session, sessionNumber) => {
        //set height of session
        let totalItems = session.actors.length + session.content.length
        let itemNumber = 0
        let itemHeights = window.mobileCheck ? 0.75 : 0.35
        session.height = (window.innerHeight * itemHeights) * totalItems + window.innerHeight
        session.padding = json[sessionNumber - 1] ? json[sessionNumber - 1].height + json[sessionNumber - 1].padding : 0
        if(sessionNumber+1 == json.length){
            session.height += window.innerHeight*2 //add end padding
            session.end = true;
        }else{
            session.end = false;
        }
        session.index = sessionNumber
        //set position and linerelevant data for items
        session.actors.map((actor) => {
            updateBaseDataObject(actor, itemNumber, totalItems, session)
            itemNumber++;
        })
        session.content.map((content) => {
            updateBaseDataObject(content, itemNumber, totalItems, session)
            itemNumber++;

        })
        sessions.push(session)
    })
    //set height and padding according to datasize
    let height = 0;
    sessions.map(session => {height += session.height})

    //set the body height to the height of the data
    let elements = ['#app','#links','#wrapper']
    elements.map(element => {
        d3.select(element).attr('style', 'height:'+height+'px; width:'+window.innerWidth+'px')
    })
    createDataRepresentation(json)
}
function updateBaseDataObject(item, itemNumber, itemTotal,session) {
    item.linePath = null
    item.distance = null
    item.visible = false
    item.left = itemNumber % 2 == 0 ? true : false
    if(item.left){
        item.xVarianz = -window.innerWidth * 0.05 + Math.random() * window.innerWidth * 0.15
    }else{
        item.xVarianz = window.innerWidth * 0.05 + Math.random() * -window.innerWidth * 0.15 
    }
    item.y = window.innerHeight + 
    session.padding + //padding of the session
    (session.height - (session.end ? window.innerHeight*3 : window.innerHeight)) / itemTotal * //the share of space divided by the amount of items
    itemNumber//(itemNumber % 2 == 0 ? itemNumber : itemNumber - 1) // the index of current item
    items.push(item)
}
function createDataRepresentation(json) {
    document.getElementById('connector').innerHTML = `<p>${json[currentSession].date}<p>` + marked.parse(json[currentSession].text)
    connectorDimensions = document.getElementById('connector').getBoundingClientRect()
    //create svg
    let rootElement = document.getElementById('content');
    json.map((sessions, i) => {
        sessions.actors.map((actor, ai) => {
            let rootActor = document.createElement('div');
            rootActor.classList.add('actors');
            rootActor.classList.add('fixObjects');
            rootActor.classList.add(actor.left ? 'left' : 'right');
            rootActor.style.top = actor.y + "px";
            rootActor.style.transform = `translate(${actor.xVarianz}px,0)`
            if(actor.link){
                let a = document.createElement('a');
                a.href = actor.link;
                let img = document.createElement('img');
                img.src = actor.image;
                a.appendChild(img);
                rootActor.appendChild(a)
            }else{
                let img = document.createElement('img');
                img.src = actor.image;
                rootActor.appendChild(img)
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
            textPath.textContent = actor.name;

            // Append the textPath to the text element
            text.appendChild(textPath);

            // Append the path and text elements to the SVG
            svg.appendChild(path);
            svg.appendChild(text);

            // Append the SVG to the rootActor element
            rootActor.appendChild(svg);

            actor.domObject = rootActor

            rootElement.appendChild(rootActor);
        });
        sessions.content.map(async (content, ci) => {
            let rootContent = document.createElement('div')
            rootContent.classList.add('content')
            rootContent.classList.add('fixObjects')
            rootContent.classList.add(content.left ? 'left' : 'right');
            rootContent.style.top = content.y + "px"
            rootContent.style.transform = `translate(${content.xVarianz}px,0)`
            let markdown = content.markdown
            let parsed = marked.parse(markdown)
            console.log(parsed)
            // Regular expression pattern to match links in markdown format with https
            const linkRegex = /\[([^\]]+)\]\((https:\/\/[^\)]+)\)/;
            // Extract the link text and URL using the match() method
            const match = markdown.match(linkRegex);
            if (match) {
                const linkUrl = match[2];
                let data = await fetch('/link?url=' + linkUrl)
                data = await data.json()
                if (data.images) {
                    console.log(data)
                    rootContent.innerHTML = `
                    <p>
                        <a href="${data.url}">
                            <img title="${data.title}" src="${data.images[0]}"></img>
                        </a>
                    </p>`
                } else {
                    rootContent.innerHTML = marked.parse(content.markdown)
                }
            } else {
                rootContent.innerHTML = marked.parse(content.markdown)
            }
            if(rootContent.getElementsByTagName('img').length > 0){
                let title = rootContent.getElementsByTagName('img')[0].getAttribute('title')
                if(title == null){
                    title = rootContent.getElementsByTagName('img')[0].getAttribute('alt')
                }
                let element = document.createElement('h3')
                element.innerHTML = title
                rootContent.prepend(document.createElement('br'))
                rootContent.prepend(element)
                rootContent.classList.add('image')
            }else{
                rootContent.classList.add('text')
            }
            content.domObject = rootContent;
            rootElement.appendChild(rootContent)
        })
    })
}