window.dragMoveListener = dragMoveListener;
let root = document.getElementById("drags");
let objs = {};

function get_count(clas){
    if (objs[clas] == null) objs[clas] = {};
    let count = Object.keys(objs[clas]).length;
    return count;
}

function create(clas,x,y,body,id){
    // console.log(clas,x,y,body,parent);
    // console.log(id);
    if (body == null || body == "") body = "[]";
    // root.innerHTML += "<div class='"+clas+" drag' id="+obj+">"+body+"</div>";
    let obj = document.createElement("div");
    obj.id = id;
    clas= clas.split(" ");
    clas.forEach(cl => {
        obj.classList.add(cl);
    });
    obj.innerHTML = body;
    // parent.append(obj);
    root.append(obj);
    set_pos(obj,x,y);
    // let obj_doc = document.getElementById(obj);
    // console.log(obj_doc.classList);
}

function load_local(objss){
    // objs = JSON.parse($.cookie("objs"));
    // console.log(objs);
    objs = objss;
    Object.entries(objs).forEach(([keys, values]) => {
        // console.log(keys,values);
        Object.entries(values).forEach(([key, value]) => {
            if(key != "class"){
                // console.log(key,keys);
                // console.log(keys,value["x"],value["y"],value["body"]);
                // let count = Object.keys(objs[keys]).length;
                // console.log(count);
                create(keys+" drag",value["x"],value["y"],value["body"],key);
            }
        })
    });
}

function load_proj(){
    $.post( "/load_proj",{name:proj_name})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log("good");
            // console.log(JSON.parse(`'${res["body"]}'`));
            // console.log(JSON.parse(res["body"]));
            // $.cookie("objs",res["body"]);
            load_local(JSON.parse(res["body"]));
            drag_start();
        }
        else if(res["out"] == "bad proj"){
            console.log("bad");
            save(()=>{
                goto("/proj/"+proj_name);
            });
        }
    })
}

function save(callback){
    // console.log(objs);
    $.post( "/save_proj", {proj:JSON.stringify(objs),name:proj_name})
    .done(function( res ) {
        if(res["out"] == "good"){
            console.log("good");
            if(callback) callback(res);
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
        var drag = event.relatedTarget;
        // console.log(drag.id);
        delete objs[drag.classList[0]][drag.id];
        drag.remove();
        // console.log(objs);
        drag.classList.add('in_zone')
        drag.classList.remove('can-drop')
    },
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

interact('.dropzone').dropzone({
    accept: '.drag',
    overlap: 0.5,

    ondragenter: function (event) {
        var drag = event.relatedTarget;
        var zone = event.target;
        if(drag.id == "none") drag.id = get_id(drag.classList[0]);
        zone.classList.add('drop-target');
        drag.classList.add('can-drop');
    },
    ondragleave: function (event) {var drag = event.relatedTarget;var zone = event.target;zone.classList.remove('drop-target');drag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondrop: function (event) {
        var drag = event.relatedTarget
        // console.log(drag.classList[0]);
        if (objs[drag.classList[0]] == null) objs[drag.classList[0]] = {};
        objs[drag.classList[0]][drag.id] = {y:drag.getAttribute('data-y'),x:drag.getAttribute('data-x'),body:drag.innerHTML};
        // console.log(objs);
        // $.cookie("objs",JSON.stringify(objs));
        drag.classList.add('in_zone')
        drag.classList.remove('can-drop')
    },
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

interact('.createzone').dropzone({
    accept: '.spawn',
    overlap: 0.2,

    ondragenter: function (event) {
        var drag = event.relatedTarget;
        var zone = event.target;zone.classList.add('drop-target');
        drag.classList.add('can-drop');
    },
    ondragleave: function (event) {
        var drag = event.relatedTarget;
        var zone = event.target;
        zone.classList.remove('drop-target');
        drag.classList.remove('spawn');
        let x = zone.getBoundingClientRect().left + window.scrollX - 15;
        let y = zone.getBoundingClientRect().top + window.scrollY - 20;
        create(`${zone.classList[0]} drag spawn`,x,y,`${zone.classList[0]}`,`none`);
    },
    ondrop: function (event) {var drag = event.relatedTargetdrag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

function drag_start() {
    let zones = document.getElementsByClassName("createzone");
    Object.entries(zones).forEach(([key, zone]) => {
        let x = zone.getBoundingClientRect().left - 15;
        let y = zone.getBoundingClientRect().top - 20;
        // console.log(x,y);
        create(`${zone.classList[0]} drag spawn`,x,y,`${zone.classList[0]}`,`none`);
    });
}

function get_id(clas){
    if(objs[clas] == null){  return `${clas}_0`}
    else{
        let count = Object.keys(objs[clas]).length;
        return `${clas}_${count}`;
    }
}