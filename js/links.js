let logged = false;

function updateLinks(currentSession, cursorPosition, cursorDimensions) {
    let anchor1 = [window.innerWidth / 2, cursorPosition + cursorDimensions.height / 2];
    currentSession.items.map((item) => {
        let bounding = item.domObject.getBoundingClientRect();
        let anchor4 = [bounding.left + bounding.width / 2, bounding.top + bounding.height / 2];
        let distance = calculateDistanceY(anchor1, anchor4);

        item.visible = true;
        item.distance = remapRange(distance, 0, window.innerHeight * 1.5, 1, 0);
        item.linePath = [...anchor1, ...anchor4];
        
    });
    drawLinks(currentSession.items);
}

function drawLinks(items) {

    let dpr = window.devicePixelRatio || 1;
    let canvas = document.getElementById('links');
    if (!canvas.getContext) return;

    let ctx = canvas.getContext('2d');

    let w = document.documentElement.clientWidth;
    let h = document.documentElement.clientHeight;	
    let vw = w/100;
    let vh = h/100;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
  
    items.filter(item => item.visible).forEach(item => {
        ctx.lineWidth = fs/15;
        ctx.strokeStyle = '#888';
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
