let svg;
let json;
let items = [];
let height = 0;
let sessionsCount = 0;
let lastSession = 0;
let currentSession = 0;
let currentPosition = 0;
let currentProgress = 0;
let itemPaddingToWindowBorder = 0;
const sessionHeightFactor = 4;
const actorRadius = 50;
document.addEventListener('scroll', event => {
    currentSession =  Math.floor(window.scrollY/(window.innerHeight * sessionHeightFactor))
    currentProgress = (currentPosition - window.innerHeight * sessionHeightFactor * currentSession) / ((window.innerHeight * sessionHeightFactor * (currentSession+1)) - (window.innerHeight * sessionHeightFactor * currentSession))
    currentPosition = window.scrollY
    //update connectors position according to scroll
})
async function init() {
     let data = await fetch(`data.json`)
     json = await data.json();
     height = window.innerHeight * sessionHeightFactor * json.length + window.innerHeight;
     let body = document.getElementsByTagName('body')[0]
     body.style.height =  height + 'px'
     d3.select('#app-wrapper').attr('style','height:'+height+'px; width:'+window.innerWidth+'px')
     svg = d3.select('svg')
     .attr('width', window.innerWidth)
     .attr('height', height)
     .attr('style', 'position:absolute')
     itemPaddingToWindowBorder = window.innerWidth * 0.1;
     createBaseData(json);
     createDataRepresentation(json);
     tick();
}
function createBaseData(json) {
    json.map((session, i) => {
        session.x = window.innerWidth / 2
        session.y = 0 

        session.actors.map((actor,ai) => {
            actor.center = window.innerWidth * 0.05
            actor.linePath = null
            actor.distance = null
            actor.visible = false
            
            actor.x = itemPaddingToWindowBorder +
            Math.random() * (window.innerWidth - itemPaddingToWindowBorder*4) // twice for the padding and trice for the max width of content of 30vw 
            
            actor.y = 
            window.innerHeight * sessionHeightFactor * i + //adjust to height of session
            ((window.innerHeight * sessionHeightFactor * 0.15) + //padding to start
            (itemPaddingToWindowBorder + ((window.innerHeight * sessionHeightFactor) - itemPaddingToWindowBorder*2) * //the actual height where items are placed
            (0.1/session.content.length) * // the share of space divided by the amount of items
            (ai+1))) // the current item
            
            if(i == 0){
                actor.y = actor.y + window.innerHeight
            }
            items.push(actor)
        })
        session.content.map((content,ci) => {
            content.center = window.innerWidth * 0.1
            content.linePath = null
            content.distance = null
            content.visible = false
            
            content.x = 
            itemPaddingToWindowBorder + 
            Math.random() * (window.innerWidth - itemPaddingToWindowBorder*4) // twice for the padding and trice for the max width of content of 30vw 

            content.y = 
            window.innerHeight * sessionHeightFactor * i + //adjust to height of session
            ((window.innerHeight * sessionHeightFactor * 0.25) + //padding to actors
            (itemPaddingToWindowBorder + ((window.innerHeight * sessionHeightFactor) - itemPaddingToWindowBorder*2) * //the actual height where items are placed
            (0.45/session.content.length) * // the share of space divided by the amount of items
            (ci+1))) // the current item
            
            if(i == 0){
                content.y = content.y + window.innerHeight
            }
            items.push(content)
        })
    })
}
function createDataRepresentation(json) {
    document.getElementById('connector').innerHTML = `<p>${json[currentSession].date}<p>` + marked.parse(json[currentSession].text)
    //create svg
    let rootElement = document.getElementById('diagram');
    json.map((sessions,i) => {
        sessions.actors.map((actor, ai) => {
            let rootActor = document.createElement('div');
            rootActor.classList.add('actors');
            rootActor.classList.add('fixObjects');
            rootActor.style.top = actor.y + "px";
            rootActor.style.left = actor.x + "px";
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
            
            rootElement.appendChild(rootActor);
        });
        sessions.content.map(async (content,ci) => {
            let rootContent = document.createElement('div')
            rootContent.classList.add('content')
            rootContent.classList.add('fixObjects')
            rootContent.style.top = content.y+"px"
            rootContent.style.left = content.x+"px"
            let markdown = content.markdown
            // Regular expression pattern to match links in markdown format with https
            const linkRegex = /\[([^\]]+)\]\((https:\/\/[^\)]+)\)/;
            // Extract the link text and URL using the match() method
            const match = markdown.match(linkRegex);
            if (match) {
                const linkText = match[1];
                const linkUrl = match[2];
                let data = await fetch('/link?url=' + linkUrl)
                data = await data.json()
                if( data.images){
                    rootContent.innerHTML = `
                    <img src="${data.images ? data.images[0] : ""}"></img>
                    <p><a href="${data.url}">${data.title}</a></p>`
                }else{
                    rootContent.innerHTML = marked.parse(content.markdown)
                }
            } else {
                rootContent.innerHTML = marked.parse(content.markdown)
            }
            rootElement.appendChild(rootContent)
        })

    })
}
function updateDataRepresentation(){
    let connector = d3.select('#connector')
    if(lastSession != currentSession && currentSession < json.length){
        connector.html(`<p>${json[currentSession].date}<p>` + marked.parse(json[currentSession].text))
        lastSession = currentSession
    }else{
        connector.attr('style',`top: ${(currentPosition + window.innerHeight) - (currentProgress * window.innerHeight)}px; opacity: ${1-Math.pow(Math.sin((currentProgress) * (Math.PI/2)),15)}`)
    } 
}
function tick(){
    updateDataRepresentation()
    updateLinks()
    requestAnimationFrame(tick)
}