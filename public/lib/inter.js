window.dragMoveListener = dragMoveListener
let root = document.getElementById("drags");
var objs = {};

function add(obj){
    if (objs[obj] == null) objs[obj] = {};
    if ((objs[obj]["count"] == null)){(objs[obj]["count"] = 0)}
    let count = Object.keys(objs[obj]).length -1;
    // console.log(obj,objs[obj+"_count"],objs[obj+"_s"]);
    root.innerHTML += "<div class='"+obj+" drag' id="+obj+"_"+count+">"+obj+"</div>";
    objs[obj][obj+"_"+count] = {};
    // objs[obj]["count"]+=1;
    console.log(objs);
}

function create(clas,obj,x,y,inside){
    if (inside == null || inside == "") inside = "[]";
    root.innerHTML += "<div class='"+clas+" drag' id="+obj+">"+inside+"</div>";
    let obj_doc = document.getElementById(obj);
    console.log(obj_doc.classList);
    set_pos(obj_doc,x,y);
}

function load_local(objs){
    // objs = JSON.parse($.cookie("objs"));
    console.log(objs);
    globalThis.objs = objs;
    Object.entries(objs).forEach(([keys, values]) => {
        // console.log(keys,values);
        Object.entries(values).forEach(([key, value]) => {
            if(key != "count"){
                // console.log(key,value);
                create(keys,key,value["x"],value["y"],value["body"]);
            }
        })
    });
}

function load_proj(){
    $.post( "/load_proj",{name:proj_name})
    .done(function( res ) {
        if(res["out"] == "good"){
            console.log("good");
            // console.log(JSON.parse(`'${res["body"]}'`));
            // console.log(JSON.parse(res["body"]));
            // $.cookie("objs",res["body"]);
            load_local(JSON.parse(res["body"]));
        }
    })
}

function save(){
    // let proj_name = document.getElementById("proj_name").value;
    // $.cookie("objs",JSON.stringify(objs));
    console.log(objs);
    // // console.log(objs);
    $.post( "/save_proj", {proj:JSON.stringify(objs),name:proj_name})
    .done(function( res ) {
        if(res["out"] == "good"){
            console.log("good");
        }
    })
}

function set_pos(obj,x,y){
    obj.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    obj.setAttribute('data-x', x)
    obj.setAttribute('data-y', y)
}

function dragMoveListener (event) {
    var drag = event.target
    var x = (parseFloat(drag.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(drag.getAttribute('data-y')) || 0) + event.dy
    set_pos(drag,x,y);
}
        
interact('.drag').draggable({
    inertia: true,
    // modifiers: [
    // interact.modifiers.restrictRect({restriction: 'parent',endOnly: true}),
    // interact.modifiers.snap({targets: [interact.snappers.grid({ x: 5, y: 5 })],range: Infinity,relativePoints: [ { x: 0, y: 0 } ]}),],
    // autoScroll: true,
    listeners: {move: dragMoveListener, end (event) {}}
})

interact('.trash').dropzone({
    accept: '.drag',
    overlap: 0.2,

    ondragenter: function (event) {var drag = event.relatedTarget;var zone = event.target; zone.classList.add('drop-target');drag.classList.add('can-drop');},
    ondragleave: function (event) {var drag = event.relatedTarget;var zone = event.target;zone.classList.remove('drop-target');drag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondrop: function (event) {
        var drag = event.relatedTarget
        delete objs[drag.classList[0]][drag.id];
        drag.remove();
        console.log(objs);
        drag.classList.add('in_zone')
        drag.classList.remove('can-drop')
    },
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

interact('.dropzone').dropzone({
    accept: '.drag',
    overlap: 0.5,

    ondragenter: function (event) {var drag = event.relatedTarget;var zone = event.target;zone.classList.add('drop-target');drag.classList.add('can-drop');},
    ondragleave: function (event) {var drag = event.relatedTarget;var zone = event.target;zone.classList.remove('drop-target');drag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondrop: function (event) {
        var drag = event.relatedTarget
        objs[drag.classList[0]][drag.id] = {y:drag.getAttribute('data-y'),x:drag.getAttribute('data-x'),body:drag.innerHTML};
        // $.cookie("objs",JSON.stringify(objs));
        drag.classList.add('in_zone')
        drag.classList.remove('can-drop')
    },
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})