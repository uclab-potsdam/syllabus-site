let menuState = false;
let scrolled = false
function toggleMenu(){
    menuState = !menuState
    if(menuState){
        document.getElementById('menu').classList.add('active')
    }else{
        document.getElementById('menu').classList.remove('active')
    }
}
window.onhashchange = () => {hashChange()}
function hashChange(){
    if(sessions.length > 0){
        if (window.location.hash == ""){
            window.scrollTo({top: 0,behavior: 'smooth' })
            return;
        }
        let session = sessions.filter(session => session.hash == window.location.hash.substring(1))[0]
        if(typeof session != "undefined"){
            window.scrollTo({top: session.index == 0 ? 0 :session.margin + (session.height/2), behavior: 'smooth' })
        }
    }
}