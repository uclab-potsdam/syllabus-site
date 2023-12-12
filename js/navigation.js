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
        let hash = window.location.hash;
        if (hash == ""){
            window.scrollTo({top: 0})
        }
        else {
            let session = sessions.filter(session => session.hash == window.location.hash.substring(1))[0]
            if (typeof session != "undefined") {
                window.scrollTo({top: session.index == 0 ? 0 :session.margin + (session.height/2)})
                return
            }
            let element = document.getElementById(hash);
            if (element) element.scrollIntoView();
        }
    }
}