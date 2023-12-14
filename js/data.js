const sessions = [];
function createBaseData(json) {
    json.map((session, sessionIndex) => {
        session.index = sessionIndex
        session.height = (json.length-1 == session.index ? window.innerHeight*2 : 0) //height of the session//if last session add padding at the end
        //set position for items
        session.alignment = Math.random() > 0.5? true : false
        session.items = [...session.content]
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
    //await new Promise(r => setTimeout(r, 300)); 
    let anchors = d3.select('#anchors')
    let cursors = d3.select('#cursors')
    let domParser = new DOMParser();
    sessions.map((session,sessionIndex) => {
        session.items.map((item,itemIndex) => {
            item.bounding = item.domObject.getBoundingClientRect()
            item.height = item.bounding.height + window.innerHeight * 0.2
            if (itemIndex === 0) item.margin = 0
            else item.margin = session.items[itemIndex - 1].margin + session.items[itemIndex - 1].height            
            session.height += item.bounding.height + window.innerHeight * 0.2
        })
        session.margin = sessionIndex == 0 ? 0 : sessions[sessionIndex - 1].margin + sessions[sessionIndex - 1].height
        session.paddingStart = window.innerHeight * 2
        session.height += session.paddingStart
        if(session.height < window.innerHeight) session.height = window.innerHeight
        session.items.map((item,itemIndex) => {
            updateItemPosition(item,itemIndex)
        })
        //create menu item with scroll function

        let title = "Start"
        if(sessionIndex != 0){
           
            let html  = domParser.parseFromString(marked.parse(session.text), 'text/html');
            title = html.getElementsByTagName('h1');
            if(title.length == 0) title = html.getElementsByTagName('h2')
            if(title.length == 0) title = html.getElementsByTagName('h3')            
            if(title.length == 0) return  
            else title = title[0].textContent
        }
        session.hash = title.toLowerCase()
        if(!(session.text.indexOf("<!--skipnav-->")>-1)){
            anchors.append('p')
            .attr('class', 'anchor')
            .attr('id', 'anchor'+sessionIndex)
            .append('a')
            .attr('href', '#'+session.hash)
            .html(title)
        }
        let shadowCursor = cursors.append('div')
        .attr('id', session.hash)
        .attr('class', 'cursor--shadow')
        shadowCursor.attr('style', `top:${sessionIndex == 0 ? session.margin: session.margin + session.height /2}px;`)

        let cursor  = cursors.append('div')
        .attr('class', 'cursor')
        .attr('id', 'cursor'+sessionIndex)
        .html(marked.parse(session.text))

        cursor.attr('style', `top:${session.margin}px;`)
    })
    //set height and padding according to datasize
    let height = sessions.reduce((accumulator, session) => { return accumulator += session.height}, 0)
    //set the body height to the height of the data
    
    // sessions
    let elements = ['#wrapper','#app']
    elements.map(element => {
        document.querySelector(element).style.height = height + 'px' 
    })
    document.querySelectorAll('.content').forEach(n => {
        n.style.visibility = 'visible'
    })
    document.querySelector('footer').style.visibility = 'visible';
    
		
		
		// open links in new tab/window
		document.querySelectorAll('a').forEach(link => {
			if (!link.getAttribute('href').startsWith('#')) {
		        link.target = '_blank';
		    }
		});
		
		// images to be resized
		document.querySelectorAll('.content p > img:not(.noresize)').forEach(img => {
		    img.addEventListener('click', function(e) {
					e.preventDefault();
					
					let content = img.closest('.content');
					let app = document.querySelector('#app');
						
		        if (content.classList.contains('enlarged')) {
		           
							resetEnlargedImage();
								
		        } else {
							
                    // Calculate centering
                    const rect = img.getBoundingClientRect();
                    const centerX = (window.innerWidth / 2) - (rect.width / 2);
                    const centerY = (window.innerHeight / 2) - (rect.height / 2);

                    const offsetX = centerX - rect.left;
                    const offsetY = centerY - rect.top;

                    // Get the natural dimensions of the image
                    const naturalWidth = img.naturalWidth;
                    const naturalHeight = img.naturalHeight;

                    // Calculate the maximum scale factor
                    const maxScaleX = window.innerWidth / rect.width;
                    const maxScaleY = window.innerHeight / rect.height;
                    const maxScaleNatural = Math.min(naturalWidth / rect.width, naturalHeight / rect.height);
                    const scale = Math.min(maxScaleX, maxScaleY, maxScaleNatural);

                    // Apply the transform
                    this.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

                    content.classList.add('enlarged');
                    app.classList.add('overlay');
														
		            document.body.addEventListener('touchstart', preventDefault);
		            document.body.addEventListener('wheel', preventDefault);
		        }
					})

		});
        setTimeout(() => {
            window.location.hash = window.location.hash
            animation()
        },100)
}

function preventDefault(e) { 
	e.stopPropagation();	
	resetEnlargedImage();
}

function resetEnlargedImage() {
	
	document.body.removeEventListener('touchstart', preventDefault);
	// document.body.removeEventListener('mousedown', preventDefault);
  document.body.removeEventListener('wheel', preventDefault);
	
  let over = document.querySelector(".overlay");
	if (over) over.classList.remove("overlay");
  let img = document.querySelector(".enlarged img")
	if (img) {
	  img.style.transform = 'scale(1)';
	  img.style.left = '0';
	  img.style.top = '0';
	}
  let enl = document.querySelector(".enlarged");
	if (enl) enl.classList.remove("enlarged");	
}

function updateItemPosition(item) {
    //set height of session according to mobile or desktopy
    item.y = item.session.margin + //margin to the top
    item.session.paddingStart + //height of the session padding-top
    item.margin //margin to the top of the session

    item.varianz = item.left ? Math.random() * window.innerWidth * 0.1: Math.random() * -window.innerWidth * 0.1
    item.x = item.left ? window.innerWidth * 0.05 + item.varianz : window.innerWidth * 0.95 + item.varianz
    
    item.domObject.style.top = item.y + "px";
    item.domObject.style.transform = `translate(${item.varianz}px,0)`
}
function updateItemBase(item, session,itemIndex) {
    item.session = session
    item.visible = false
    item.left = itemIndex % 2 == 0 ? session.alignment : !session.alignment
    createDataRepresentation(item);
}
function createDataRepresentation(item) {
    let rootElement = document.getElementById('content');
    let rootItem = document.createElement('div');
    rootItem.classList.add('fixObjects');
    rootItem.classList.add(item.left ? 'left' : 'right');
    rootItem.classList.add('content');
    rootItem.innerHTML = marked.parse(item.markdown)
    item.domObject = rootItem
    rootElement.appendChild(rootItem);
}