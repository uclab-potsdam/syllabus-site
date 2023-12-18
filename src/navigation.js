let menuState = false;
let scrolled = false
function toggleMenu(){
    var icon1 = document.getElementById("a");
    var icon2 = document.getElementById("b");
    var icon3 = document.getElementById("c");
    icon1.classList.toggle('a');
    icon2.classList.toggle('c');
    icon3.classList.toggle('b');

    menuState = !menuState
    if(menuState){
        document.getElementById('menu').classList.add('active')
    }else{
        document.getElementById('menu').classList.remove('active')
    }
}
window.onhashchange = () => {hashChange()}
function hashChange(){
    if(sessions.length > 0) {
		resetEnlargedImage();
    }
}