let fs = 14;
const sessions = [];

function setFontSize() {
	vw = document.documentElement.clientWidth / 100;
	vh = document.documentElement.clientHeight / 100;
	fs = 7 + .7 * vw + .3 * vh;
	document.querySelector("body").style.fontSize = fs + "px";
	update();
}
window.onresize = setFontSize;
window.onload = setFontSize;

// when pressing escape scroll up and remove hash
document.onkeyup = function(e) {
	if (e.key === "Escape") {
		if (document.querySelector("#app.overlay")) resetEnlargedImage();
		else {
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: 'smooth'
			});
			history.pushState("", document.title, window.location.pathname);
			if (menuState) toggleMenu();
		}
	}
}
fetch('README.md')
	.then(data => data.text())
	.then(text => {
		let data = []
		let sessions = text.split("---\n")
		let footer = sessions.slice(-1)[0]
		document.querySelector("footer").innerHTML = marked.parse(footer)
		sessions.slice(0, -1).map(session => {
			let sessionObject = {}
			let sessionData = session.trim().split(/\n{3,}/)
			sessionObject.text = sessionData[0]
			sessionData = sessionData.slice(1)
			sessionObject.content = sessionData.map(content => {
				return {
					"markdown": content
				}
			})
			data.push(sessionObject)
		})
		
		createBaseData(data);

		// check if hash is set
		if (window.location.hash) {
			const hash = window.location.hash;
			setTimeout(() => {
				const targetElement = document.getElementById(hash.substring(1));
				targetElement.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
			}, 100);
		}
	});



// SCROLLING

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
	update();
});
let lastScrollY = null;

function updateCursor(currentSession, currentProgress) {
    let cursorId = 'cursor' + currentSession.index;
    let cursor = document.getElementById(cursorId);

    if (cursor) {
        let cursorDimensions = cursor.getBoundingClientRect();
        let cursorPosition =
            (currentSession.margin + (currentSession.index == 0 ? window.innerHeight / 2 : window.innerHeight)) + //start from the bottom of the screen
            (currentProgress * currentSession.height) - //add the progress of the current session
            (currentProgress * (currentSession.index == 0 ? window.innerHeight / 2 : window.innerHeight)) - //subtract the progress of the window
            (cursorDimensions.height / 2); //subtract half the height of the cursor
        
        cursor.style.top = `${cursorPosition}px`;
        cloneCursor(cursorId);
        return updateLinks(currentSession, currentProgress, cursorDimensions);
    }
    return [];
}


function cloneCursor(originalDivId) {
	const originalDiv = document.getElementById(originalDivId);
	if (!originalDiv) return;

	const cloneDivId = originalDivId + '_clone';
	let cloneDiv = document.getElementById(cloneDivId);

	// Get the #app element to append clones to
	const appElement = document.getElementById('app');
	if (!appElement) return;	

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
	cloneDiv.style.left = rect.left + 'px';
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
		} else clone.parentNode.removeChild(clone);

	});
}

function animation() {
	if (!scrolled && sessions.length > 0) {
		hashChange()
		scrolled = true
	}

	if (lastScrollY != window.scrollY) {
		update();
		lastScrollY = window.scrollY;		
	}

	//loop the animation frame
	requestAnimationFrame(() => {
		animation()
	})
}

function update() {
    let linkItems = [];
    sessions.map(session => {
        let anchor = document.getElementById('anchor' + session.index);
        if (session.margin <= window.scrollY + window.innerHeight) {
            if (anchor) {
                let isActive = session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height);
                if (isActive) {
                    anchor.classList.add('active');
                } else {
                    anchor.classList.remove('active');
                }
            }
            let currentProgress = (window.scrollY - session.margin) / session.height;
            if (currentProgress < 0) currentProgress = 0;
            linkItems.push(updateCursor(session, currentProgress));
        } else {
            if (anchor) {
                anchor.classList.remove('active');
            }
        }
    });
    drawLinks(linkItems.flat());

    let clones = document.querySelectorAll('.clone');
    if (clones.length > 1) removeInvisibleClones();
}



// NAVIGATION

let menuState = false;
let scrolled = false

function toggleMenu() {
	var icon1 = document.getElementById("a");
	var icon2 = document.getElementById("b");
	var icon3 = document.getElementById("c");
	icon1.classList.toggle('a');
	icon2.classList.toggle('c');
	icon3.classList.toggle('b');

	menuState = !menuState
	if (menuState) {
		document.getElementById('menu').classList.add('active')
	} else {
		document.getElementById('menu').classList.remove('active')
	}
}
window.onhashchange = () => {
	hashChange()
}

function hashChange() {
	if (sessions.length > 0) {
		resetEnlargedImage();
	}
}



// LINKS

function updateLinks(currentSession, cursorProgress) {
	let position = window.innerHeight - (cursorProgress * window.innerHeight)
	if (currentSession.index == 0) {
		position = window.innerHeight / 2 - (cursorProgress * window.innerHeight / 2)
	}
	let anchor1 = [window.innerWidth / 2, position];
	currentSession.items.map((item) => {
		let bounding = item.domObject.getBoundingClientRect();
		let anchor4 = [bounding.left + bounding.width / 2, bounding.top + bounding.height / 2];
		item.linePath = [...anchor1, ...anchor4];
	});
	return currentSession.items
}

function drawLinks(items) {
	let dpr = window.devicePixelRatio || 1;
	let canvas = document.getElementById('links');
	if (!canvas.getContext) return;

	let ctx = canvas.getContext('2d');

	let w = canvas.clientWidth;
	let h = canvas.clientHeight;

	canvas.width = w * dpr;
	canvas.height = h * dpr;
	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, w, h);

	let root = window.getComputedStyle(document.body);
	let lineColor = root.getPropertyValue('--theme-color').trim();
	ctx.strokeStyle = lineColor;

	items.map(item => {
		ctx.lineWidth = fs / 15;
		ctx.beginPath();
		ctx.moveTo(item.linePath[0], item.linePath[1]);
		ctx.lineTo(item.linePath[2], item.linePath[3]);
		ctx.stroke();
	});
}

function remapRange(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function calculateDistanceY(p1, p2) {
	return Math.abs(p2[1] - p1[1]);
}


// DATA

function createBaseData(json) {
	json.map((session, sessionIndex) => {
		session.index = sessionIndex
		session.height = 0
		//set position for items
		session.alignment = Math.random() > 0.5 ? true : false
		session.items = [...session.content]
		session.items.map((item, itemIndex) => {
			updateItemBase(item, session, itemIndex)
		})
		sessions.push(session)
	})
	wrapCaptions()
	imagesLoaded()
	updateView()
}

function wrapCaptions() {
	document.querySelectorAll('div.content').forEach(div => {
		const imgElement = div.querySelector('img:first-child');
		if (imgElement) {
			div.classList.add('hasImg');
			const figure = document.createElement('figure');
			figure.appendChild(imgElement);
			const textNodes = Array.from(div.childNodes);
			// Create a caption element and append the text nodes
			const caption = document.createElement('figcaption');
			
			// Iterate through child nodes, handle text and elements differently
			Array.from(div.childNodes).forEach(node => {
				if (node.nodeType === Node.TEXT_NODE) {
				if (typeof node.innerHTML !== "undefined") caption.appendChild(node);
				} else if (node.tagName === 'P') {
					let figpar = node.innerHTML.trim().replace(/^\<br\>/, "");
					caption.innerHTML += figpar;
				} else {
				// Append other elements as-is
				caption.appendChild(node);
				}
			});  
	
			caption.innerHTML = "<span>"+caption.innerHTML+"</span>";

			// Append the caption to the figure
			figure.appendChild(caption);
	
			// Clear the content of the div
			div.innerHTML = "";
	
			// Append the figure to the div
			div.appendChild(figure);
		}
	});
}

function imagesLoaded() {
	var images = document.getElementsByTagName('img');
	for (var i = 0; i < images.length; i++) {		
		images[i].onload = function() {
			if (!this.style.height) this.style.height = 'auto';
			update();
		};
	}
}


async function updateView() {
    let anchors = document.getElementById('anchors');
    let cursors = document.getElementById('cursors');
    let domParser = new DOMParser();
    sessions.map((session, sessionIndex) => {
        session.items.map((item, itemIndex) => {
            item.bounding = item.domObject.getBoundingClientRect();
            item.height = item.bounding.height * 0.75 + window.innerHeight * 0.1;
            if (itemIndex === 0) item.margin = 0;
            else item.margin = session.items[itemIndex - 1].margin + session.items[itemIndex - 1].height;
            session.height += item.bounding.height + window.innerHeight * 0.2;
        });
        session.margin = sessionIndex == 0 ? 0 : sessions[sessionIndex - 1].margin + sessions[sessionIndex - 1].height;
        if (sessionIndex == 0) session.paddingStart = window.innerHeight;
        else session.paddingStart = window.innerHeight * 2.5;
        session.height += session.paddingStart;
        if (session.height < window.innerHeight) session.height = window.innerHeight;
        session.items.map((item, itemIndex) => {
            updateItemPosition(item, itemIndex);
        });

        let title = "Start";
        if (sessionIndex != 0) {
            let html = domParser.parseFromString(marked.parse(session.text), 'text/html');
            title = html.getElementsByTagName('h1');
            if (title.length == 0) title = html.getElementsByTagName('h2');
            if (title.length == 0) title = html.getElementsByTagName('h3');
            if (title.length == 0) return;
            else title = title[0].textContent;
        }
        session.hash = title.toLowerCase().replace(/\s+/g, '-'); // Ensure the hash is URL-friendly
        if (!session.text.includes("<!--skipnav-->")) {
            let p = document.createElement('p');
            p.classList.add('anchor');
            p.id = 'anchor' + sessionIndex;
            let a = document.createElement('a');
            a.setAttribute('href', '#' + session.hash);
            a.innerHTML = title;
            p.appendChild(a);
            anchors.appendChild(p);
        }
        let shadowCursor = document.createElement('div');
        shadowCursor.id = session.hash;
        shadowCursor.className = 'cursor--shadow';
		let topValue = sessionIndex === 0 ? session.margin : session.margin + session.height / 2;
        shadowCursor.style.top = topValue+"px"
        cursors.appendChild(shadowCursor);

        let cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.id = 'cursor' + sessionIndex;
        cursor.innerHTML = marked.parse(session.text);
        cursor.style.top = session.margin+"px";
        cursors.appendChild(cursor);
    });

    let height = window.innerHeight * 1.5 + sessions.reduce((accumulator, session) => {
        return accumulator += session.height;
    }, 0);

    ['#wrapper', '#app'].forEach(element => {
        document.querySelector(element).style.height = height + 'px';
    });
    document.querySelectorAll('.content').forEach(n => {
        n.style.visibility = 'visible';
    });
    document.querySelector('footer').style.visibility = 'visible';

    document.querySelectorAll('a').forEach(link => {
        if (!link.getAttribute('href').startsWith('#')) {
            link.target = '_blank';
        }
    });

	document.querySelectorAll('.content > figure > img:not(.noresize)').forEach(img => {
		img.addEventListener('click', function(e) {
			if (e.target.parentElement.tagName === 'A') return;

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
				if (menuState) toggleMenu();
				document.body.addEventListener('touchstart', preventDefault);
				document.body.addEventListener('wheel', preventDefault);
				document.addEventListener('scroll', preventDefault);
			}
		})
	});

    setTimeout(() => {
        animation();
    }, 100);
}

function preventDefault(e) {
	e.stopPropagation();
	resetEnlargedImage();
}

function resetEnlargedImage() {
	document.body.removeEventListener('touchstart', preventDefault);
	document.body.removeEventListener('wheel', preventDefault);
	document.removeEventListener('scroll', preventDefault);

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
	//set height of session according to mobile or desktop

	item.y = item.session.margin + //margin to the top
		item.session.paddingStart + //height of the session padding-top
		item.margin*1.25 //margin to the top of the session

	item.varianz = item.left ? Math.random() * window.innerWidth * 0.1 : Math.random() * -window.innerWidth * 0.1
	item.x = item.left ? window.innerWidth * 0.05 + item.varianz : window.innerWidth * 0.95 + item.varianz

	item.domObject.style.top = item.y + "px";
	item.domObject.style.transform = `translate(${item.varianz}px,0)`
}

function updateItemBase(item, session, itemIndex) {
	item.session = session
	item.left = itemIndex % 2 == 0 ? session.alignment : !session.alignment
	createDataRepresentation(item);
}

function createDataRepresentation(item) {
	let rootElement = document.getElementById('content');
	let rootItem = document.createElement('div');
	rootItem.classList.add('fixObjects');
	rootItem.classList.add(item.left ? 'left' : 'right');
	rootItem.classList.add('content');
	let parsed = marked.parse(item.markdown);
	parsed = parsed.replace('<img ', '<img loading="lazy" ');
	rootItem.innerHTML = parsed;
	item.domObject = rootItem;
	rootElement.appendChild(rootItem);
}