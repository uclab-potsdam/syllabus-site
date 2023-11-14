function init(course){
    fetch(`./${course}/data.json`)
    .then(data => data.json())
    .then(data => console.log(data))
}