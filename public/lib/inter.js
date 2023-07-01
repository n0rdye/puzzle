window.dragMoveListener = dragMoveListener;
let root = document.getElementById("drags");
let objs = { height:"2",width:"4"};

function get_count(clas){
    if (objs[clas] == null) objs[clas] = {};
    let count = Object.keys(objs[clas]).length;
    return count;
}

function create(clas,x,y,body,id){
    let main_clas = clas.split(" ")[0];
    // if (body == null || body == "") body = "[]";
    load_obj(main_clas,(db_data)=>{
        // let data = db_data;
        // body = data["img"];
        // console.log(data["img"].toString());
        // console.log(db_data[0]);
        // console.log(clas,x,y,body,parent);
        // console.log(id);
        // root.innerHTML += "<div class='"+clas+" drag' id="+obj+">"+body+"</div>";
        // let img = document.createElement("img");
        let obj = document.createElement("img");
        obj.id = id;
        clas= clas.split(" ");
        clas.forEach(cl => {
            obj.classList.add(cl);
        });
        if (db_data == null) {
            delete objs[main_clas][id];
            save(()=>{
                goto("/proj/"+proj_name);
            });
        }
        else{
            obj.src = db_data["img"];
            obj.title = `${db_data["name"]} \n ${db_data["description"]}`;
        }
        // obj.innerHTML = body;
        // parent.append(obj);
        obj.setAttribute("max-width","100px");
        root.append(obj);
        set_pos(obj,x,y);
        // let obj_doc = document.getElementById(obj);
        // console.log(obj_doc.classList);
    })
}

function wall_size_change(type,value){
    let wall = document.getElementsByClassName("wall")[0];
    let scroll;
    if(type != null && type == "width") {
        if (value == null) scroll = document.getElementById("wall_width").value;
        else scroll = value;
        document.getElementById("wall_width_value").innerHTML = (Math.ceil((parseFloat(scroll)+0.1)*10)/ 10);

        // console.log(scroll);
        wall.style.width = `${scroll * 200}px`;
        objs["width"] = scroll;
    }
    if(type != null && type == "height") {
        if (value == null) scroll = document.getElementById("wall_height").value;
        else scroll = value;        
        document.getElementById("wall_height_value").innerHTML = (Math.ceil((parseFloat(scroll)+0.1)*10)/ 10);
        
        // console.log(scroll);
        wall.style.height = `${scroll * 200}px`;
        objs["height"] = scroll;
    }            
}

function load_local(objss){
    // objs = JSON.parse($.cookie("objs"));
    // console.log(objs);
    objs = objss;
    Object.entries(objs).forEach(([keys, values]) => {
        // console.log(keys,values);
        if (keys != "width" && keys != "height"){
            Object.entries(values).forEach(([key, value]) => {
                if(key != "class"){
                    // console.log(key,keys);
                    // console.log(keys,value["x"],value["y"],value["body"]);
                    // let count = Object.keys(objs[keys]).length;
                    // console.log(count);
                    create(keys+" drag",value["x"],value["y"],value["body"],key);
                }
            })
        }
        else {
            document.getElementById(`wall_${keys}`).value = values;
            wall_size_change(keys,values);
        }
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
    html2canvas(document.querySelector("body"),{height: 500, width:(window.innerWidth /1.65),x:(window.innerWidth / 5), y:250}).then(canvas => {
        let scr = "";
        console.log(canvas.toDataURL().length);
        if (canvas.toDataURL().length < 80000) scr = canvas.toDataURL()
        // console.log(scr);
        $.post( "/save_proj", {proj:JSON.stringify(objs),name:proj_name,img:scr})
        .done(function( res ) {
        if(res["out"] == "good"){
                // console.log(scr)
                console.log("good");
                if(callback) callback(res);
            }
        })
    });
}

function load_objs(callback){
    $.post( "/get_objs")
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log(res["body"]);
            callback(res["body"]);
        }
    });
}

function load_obj(name,callback){
    $.post( "/get_obj",{name:name})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log(res["body"]);
            callback(res["body"]);
        }
    });
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
        let y = zone.getBoundingClientRect().top + window.scrollY - 32;
        create(`${zone.classList[0]} drag spawn`,x,y,`${zone.classList[0]}`,`none`);
    },
    ondrop: function (event) {var drag = event.relatedTargetdrag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

function drag_start() {
    let zones = document.getElementsByClassName("createzone");
    Object.entries(zones).forEach(([key, zone]) => {
        let x = zone.getBoundingClientRect().left - scrollX - 15;
        let y = zone.getBoundingClientRect().top - scrollY - 32;
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