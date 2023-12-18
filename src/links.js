
function updateLinks(currentSession, cursorProgress, cursorDimensions) {
    let position = window.innerHeight - (cursorProgress * window.innerHeight) 
    if(currentSession.index == 0){
        position = window.innerHeight/2 - (cursorProgress * window.innerHeight/2) 
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
        ctx.lineWidth = fs/15;
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
