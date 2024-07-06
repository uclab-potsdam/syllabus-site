const sessions = [];
let fontSize = 14;
let startTime = Date.now();
let lastScrollY = 0;
let lastHeight = window.outerHeight;
let lastWidth = window.outerWidth;
// INITIALIZE THE PAGE
async function init() {
	// GET DATA FROM FILE
	setFontSize();
	let file = await fetch('README.md')
	let raw = await file.text()
	// SPLIT THE FILE ALONG SESSIONS
	let sessionsRaw = raw.split("---\n")
	let footerRaw = sessionsRaw.pop()
	document.querySelector("footer").innerHTML = marked.parse(footerRaw)
	// LOOP THROUGH SESSIONS AND SET PARAMETERS
	sessionsRaw.map((sessionRaw, sessionIndex) => {
		let contentHTMLRootElement = document.getElementById('content');
		let anchorsHTMLRootElement = document.getElementById('anchors');
		let cursorsHTMLRootElement = document.getElementById('cursors');
		let sessionContent = sessionRaw.trim().split(/\n{3,}/)

		let session = {}
		session.index = sessionIndex;
		session.alignment = Math.random() > 0.5 ? true : false;
		session.text = sessionContent.shift();
		session.items = []

		// LOOP THROUGH ITEMS AND SET PARAMETERS
		sessionContent.map((content, contentIndex) => {
			let item = {};
			item.index = contentIndex;
			item.session = session;
			item.markdown = content;
			item.left = contentIndex % 2 == 0 ? session.alignment : !session.alignment
			item.varianz = item.left ? Math.random() * window.innerWidth * 0.1 : Math.random() * -window.innerWidth * 0.1
			item.x = item.left ? window.innerWidth * 0.05 + item.varianz : window.innerWidth * 0.95 + item.varianz
			// CREATE HTML ELEMENT 
			let itemHTMLRootElement = document.createElement('div');
			itemHTMLRootElement.classList.add('fixObjects');
			itemHTMLRootElement.classList.add(item.left ? 'left' : 'right');
			itemHTMLRootElement.classList.add('content');

			let parsed = marked.parse(content).replace('<img ', '<img loading="lazy" ');
			itemHTMLRootElement.innerHTML = parsed;
			contentHTMLRootElement.appendChild(itemHTMLRootElement);
			// SET PARAMETERS
			item.domObject = itemHTMLRootElement;
			updateItem(item, session)
			// APPEND TO SESSION
			session.items.push(item);
		})
		updateSession(session)
		setHTML(session, anchorsHTMLRootElement, cursorsHTMLRootElement);
		sessions.push(session);
	})
	// ADJUST THE HEIGHT OF THE APP AND MAKE IT VISIBLE
	document.querySelector('#wrapper').style.visibility = 'visible';
	document.querySelector('#app').style.height = sessions[sessions.length - 1].margin + sessions[sessions.length - 1].height + "px";

	enhanceMarkdown();
	// REINIT HASH IF SET
	if (window.location.hash) {
		const hash = window.location.hash;
		const targetElement = document.getElementById(hash.substring(1));
		
		if (targetElement != null) {
			let mutationObserver = new MutationObserver(() => {
				let triggerTime = Date.now();
				if (triggerTime - startTime < 1000){
					targetElement.scrollIntoView({
						top: targetElement.style.top,
						behavior: 'smooth'
					});
				}
			});
			mutationObserver.observe(targetElement, { attributes: true });
		}
	}
	recalculate();
	// START THE LOOP
	loop();
}

function recalculate() {
	sessions.map(session => {
		updateSession(session)
		session.cursorAnchor.style.top = (session.index === 0 ? session.margin : session.margin + session.height / 2) + "px"
	})
	document.querySelector('#wrapper').style.visibility = 'visible';
	document.querySelector('#app').style.height = sessions[sessions.length - 1].margin + sessions[sessions.length - 1].height + "px";
	update();
}
function updateSession(session) {
	session.height = 0;
	session.items.map(item => {
		updateItem(item, session)
	})
	session.margin = session.index == 0 ? -session.height / 3 : sessions[session.index - 1].margin + sessions[session.index - 1].height - sessions[session.index - 1].padding * 0.6;
	session.padding = window.outerHeight * 2;
	session.height += session.padding;

	session.items.map((item) => {
		item.y = session.margin + //margin to the top
			session.padding + //height of the session padding-top
			item.margin  //margin to the top
		item.domObject.style.top = item.y + "px";
		item.domObject.style.transform = `translate(${item.varianz}px,0)`
	});
}
function updateItem(item, session) {
	item.bounding = item.domObject.getBoundingClientRect();
	item.height = item.bounding.height;
	item.margin = item.index === 0 ? 0 : session.items[item.index - 1].margin + session.items[item.index - 1].padding + session.items[item.index - 1].height;
	item.padding = window.outerHeight * 0.2;
	session.height += item.bounding.height + item.padding;
}
window.onload = init;
// LINK HTML 
function setHTML(session, anchors, cursors) {
	let title = "Start";
	let parser = new DOMParser();
	if (session.index > 0) {
		let parsed = parser.parseFromString(marked.parse(session.text), 'text/html')
		title = parsed.querySelector('h1')?.innerHTML
		if (title == null) title = parsed.querySelector('h2')?.innerHTML
		if (title == null) title = parsed.querySelector('h3')?.innerHTML
		if (title == null) title = parsed.querySelector('h4')?.innerHTML
		if (title == null) title = parsed.querySelector('h5')?.innerHTML
		if (title == null) title = ""
	}
	session.hash = title.toLowerCase().replace(/\s+/g, '-'); // Ensure the hash is URL-friendly
	if (!session.text.includes("<!--skipnav-->")) {
		let anchorWrapper = document.createElement('p');
		anchorWrapper.classList.add('anchor');
		anchorWrapper.id = 'anchor' + session.index;
		anchors.appendChild(anchorWrapper);
		session.anchor = anchorWrapper;
		let anchor = document.createElement('a');
		anchor.setAttribute('href', '#' + session.hash);
		anchor.innerHTML = title;
		anchorWrapper.appendChild(anchor);
	}
	// SET SHADOW CURSOR ITEM AS SCROLL REFERENCE
	let cursorAnchor = document.createElement('div');
	cursorAnchor.id = session.hash;
	cursorAnchor.className = 'cursor--shadow';
	cursorAnchor.style.top = (session.index === 0 ? session.margin : session.margin + session.height / 2) + "px"
	cursors.appendChild(cursorAnchor);
	session.cursorAnchor = cursorAnchor;

	// SET VISIBLE CURSOR THAT IS DISPLACEABLE
	let cursor = document.createElement('div');
	cursor.className = 'cursor';
	cursor.id = 'cursor' + session.index;
	cursor.innerHTML = marked.parse(session.text);
	cursor.style.top = window.outerHeight + "px";
	cursors.appendChild(cursor);
	session.cursor = cursor;
}
// NAVIGATION
document.onkeyup = function (e) {
	if (e.key === "Escape") {
		if (document.querySelector("#app.overlay")) resetEnlargedImage();
		/*window.scrollTo({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});*/
		history.pushState("", document.title, window.location.pathname);
		if (document.querySelector('#menu.active') != null) toggleMenu();
	}
}
function toggleMenu() {
	document.getElementById("a").classList.toggle('a');
	document.getElementById("b").classList.toggle('c');
	document.getElementById("c").classList.toggle('b');
	document.getElementById('menu').classList.toggle('active')
}
window.onhashchange = () => {
	if (sessions.length > 0) {
		resetEnlargedImage();
	}
}
// UPDATE VIEW
function loop() {
	if (lastScrollY!=window.scrollY) update();
	lastScrollY=window.scrollY;	
	requestAnimationFrame(loop);
}
function update() {
	let links = [];
	let anchorProgress = 1;
	let anchor = undefined;
	sessions.map(session => {
		let sessionProgress = (window.scrollY - session.margin) / session.height;
		let [cursorPosition, cursorHeight] = updateCursor(session, sessionProgress)
		if (session.margin <= window.scrollY && window.scrollY <= (session.margin + session.height)) {
			if (session.anchor != undefined && Math.abs(sessionProgress) < anchorProgress) {
				anchorProgress = Math.abs(sessionProgress);
				if (anchor != undefined) anchor.classList.remove('active');
				anchor = session.anchor;
				anchor.classList.add('active');
			}
			let anchor1 = [window.innerWidth / 2, cursorPosition + cursorHeight / 2];
			session.items.map((item) => {
				let bounding = item.domObject.getBoundingClientRect();
				let anchor4 = [bounding.left + bounding.width / 2, bounding.top + bounding.height / 2];
				item.linePath = [...anchor1, ...anchor4];
			});
			links.push(session.items)
		} else {
			if (session.anchor != undefined) session.anchor.classList.remove('active');
		}
	})
	updateLinks(links.flat());
}
function updateCursor(session, sessionProgress) {
	let cursorDimensions = session.cursor.getBoundingClientRect();
	let cursorPosition = session.index === 0
		? (window.outerHeight * 0.25) - (sessionProgress * (window.outerHeight * 0.25)) - (sessionProgress * (cursorDimensions.height))
		: window.outerHeight - (sessionProgress * window.outerHeight) - (sessionProgress * (cursorDimensions.height))
	session.cursor.style.top = `${cursorPosition}px`;
	return [cursorPosition, cursorDimensions.height];
}
function updateLinks(items) {
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
		ctx.lineWidth = fontSize / 18;
		ctx.beginPath();
		ctx.moveTo(item.linePath[0], item.linePath[1]);
		ctx.lineTo(item.linePath[2], item.linePath[3]);
		ctx.stroke();
	});
}
// HELPERS
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
function enhanceMarkdown() {
	document.querySelectorAll('div.content').forEach(div => {
		const imgElement = div.querySelector('img:first-child');
		if (imgElement) {
			div.classList.add('hasImg');
			const figure = document.createElement('figure');
			figure.appendChild(imgElement);
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

			caption.innerHTML = "<span>" + caption.innerHTML + "</span>";

			// Append the caption to the figure
			figure.appendChild(caption);

			// Clear the content of the div
			div.innerHTML = "";

			// Append the figure to the div
			div.appendChild(figure);
		}
	});

	document.querySelectorAll('img').forEach(img => {
		img.onload = function () {
			if (!this.style.height) this.style.height = 'auto';
		};
	});
	document.querySelectorAll('a').forEach(link => {
		if (!link.getAttribute('href').startsWith('#')) {
			link.target = '_blank';
		}
	});

	document.querySelectorAll('.content > figure > img:not(.noresize)').forEach(img => {
		img.addEventListener('click', function (e) {
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
				if (document.querySelector('#menu.active') != null) toggleMenu();
				document.body.addEventListener('touchstart', preventDefault);
				document.body.addEventListener('wheel', preventDefault);
				document.addEventListener('scroll', preventDefault);
			}
		})
	});

}
function setFontSize() {
	vw = document.documentElement.clientWidth / 100;
	vh = document.documentElement.clientHeight / 100;
	fontSize = 7 + .7 * vw + .3 * vh;
	document.querySelector("body").style.fontSize = fontSize + "px";
}

function resized() {
	if (lastHeight != window.outerHeight || lastWidth != window.outerWidth) {
		setFontSize();
		recalculate();
	}
	lastHeight = window.outerHeight;
	lastWidth = window.outerWidth;
}

window.onresize = resized;
