function createBaseData() {
    json.map((session, sessionNumber) => {
        //set position and linerelevant data for actor
        session.height = (window.innerHeight* 0.5) * (session.actors.length + session.content.length)
        session.actors.map((actor,ai) => {
            updateBaseDataObject(actor,0.1,0.15,ai,session.actors.length,sessionNumber)
            console.log(actor,0.1,0.15,ai,session.actors.length,sessionNumber)
        })
        //set position and linerelevant data for content
        session.content.map((content,ci) => {
            updateBaseDataObject(content,0.25,0.45,ci,session.content.length,sessionNumber)
            
        })
    })
    createDataRepresentation()
}
function updateBaseDataObject(item, padding, heightShare,itemNumber,itemTotal,sessionNumber){
    item.linePath = null
    item.distance = null
    item.visible = false
    item.left = itemNumber % 2 == 0 ? true : false
                                                               
    item.y = (sessionNumber == 0 ? window.innerHeight : 0) +
    window.innerHeight * sessionHeightFactor * sessionNumber + //adjust to height of session
    ((window.innerHeight * sessionHeightFactor * padding) + //padding to actors
    (window.innerWidth * 0.1 + ((window.innerHeight * sessionHeightFactor) - window.innerWidth*0.2) * //the actual height where items are placed
    (heightShare/itemTotal) * // the share of space divided by the amount of items
    (itemNumber % 2 == 0 ? itemNumber : itemNumber -1))) // the current item
    items.push(item)
}
function createDataRepresentation() {
    document.getElementById('connector').innerHTML = `<p>${json[currentSession].date}<p>` + marked.parse(json[currentSession].text)
    connectorDimensions = document.getElementById('connector').getBoundingClientRect()
    //create svg
    let rootElement = document.getElementById('diagram');
    json.map((sessions,i) => {
        sessions.actors.map((actor, ai) => {
            let rootActor = document.createElement('div');
            rootActor.classList.add('actors');
            rootActor.classList.add('fixObjects');
            rootActor.classList.add(ai%2 == 0? 'left' : 'right');
            rootActor.style.top = actor.y + "px";
            let img =  document.createElement('img');
            img.src = actor.image;
            rootActor.appendChild(img)
            // Create a SVG element
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.setAttribute('viewBox','0 0 200 200')
            svg.setAttribute('style','margin-top: -15px')
            
            // Create a path element for the curve
            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", "M30 15 Q 95 65 180 10");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "none");
            path.setAttribute("id" , "curve")
            
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
        sessions.content.map(async (content,ci) => {
            let rootContent = document.createElement('div')
            rootContent.classList.add('content')
            rootContent.classList.add('fixObjects')
            rootContent.classList.add(ci%2 == 0? 'left' : 'right');
            rootContent.style.top = content.y+"px"
            rootContent.style.left = content.x+"px"
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
                if(data.images){
                    console.log(data)
                    rootContent.innerHTML = `
                    <h3>${data.title}</h3>
                    <p>
                        <a href="${data.url}">
                            <img src="${data.images[0]}"></img>
                        </a>
                    </p>`
                }else{
                    rootContent.innerHTML = marked.parse(content.markdown)
                }
            } else {
                rootContent.innerHTML = marked.parse(content.markdown)
            }
            content.domObject = rootContent;
            rootElement.appendChild(rootContent)
        })
    })
}
function updateDataRepresentation(){
    let connector = d3.select('#connector')
    items.filter(item => item.width == undefined && item.domObject != undefined).map(item => {
        let domObject = item.domObject.getBoundingClientRect()
        item.width = domObject.width
        item.height = domObject.height
    })
    if(lastSession != currentSession && currentSession < json.length){
        connector.html(`<p>${json[currentSession].date}<p>` + marked.parse(json[currentSession].text))
        connectorDimensions = connector.node().getBoundingClientRect()
        lastSession = currentSession
    }else{
        let opacity = currentProgress < 0.9 
        ? 1 
        : 1 - Math.pow(Math.sin(((currentProgress-0.9) * 10) * (Math.PI/2)),15)
        connector.attr('style',`top: ${(currentPosition + window.innerHeight) - (currentProgress * window.innerHeight)}px; opacity: ${opacity}`)
    } 
}