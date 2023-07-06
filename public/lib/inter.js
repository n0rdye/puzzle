window.dragMoveListener = dragMoveListener;
let root = document.getElementById("drags");
let objs = { height:"2",width:"4"};
let objs_store = {};

function create(clas,x,y,body,id,size){
    let main_clas = clas.split(" ")[0];
    // if (body == null || body == "") body = "[]";
    let obj = document.createElement("img");
    obj.id = id;
    obj.alt = id;
    clas= clas.split(" ");
    clas.forEach(cl => {
        obj.classList.add(cl);
    });
    get_obj(main_clas,(db_data)=>{
        if ($.cookie("cache") == "true"){
            if (localStorage.getItem(`${main_clas}`) == null){
                load_obj(main_clas,"`img`",(odata)=>{
                    localStorage.setItem(main_clas,odata["img"]);
                    make(odata["img"]);
                })
            }
            else{
                make(localStorage.getItem(main_clas))
            }
        }
        else{
            load_obj(main_clas,"`img`",(odata)=>{
                localStorage.setItem(main_clas,odata["img"]);
                make(odata["img"]);
            })
        }
        function make(img){
            if (db_data == null) {
                delete objs[main_clas][id];
                save(()=>{
                    goto("/proj/"+proj_name);
                });
            }
            else if (db_data != null){
                obj.src = img;
                obj.title = `${db_data["name"]}\n${db_data["description"]}\n${lang("width")}:${db_data["width"]}см ${lang("height")}:${db_data["height"]}см`;
                // drag.transform = `translate(${drag.getAttribute("data-y")}px, ${drag.getAttribute("data-y")}px) scale(${db_data["width"] * 2} ${db_data["height"] * 2})`;
                if(size){
                    obj.style.width = `${db_data["width"] * 2}px`;
                    obj.style.height = `${db_data["height"] * 2}px`;
                }
            }
        }
    })
    obj.setAttribute("max-width","100px");
    root.append(obj);
    set_pos(obj,x,y);
}

function resize_drags(){
    document.getElementById('drags').style.left = $('.dropzone')[0].getBoundingClientRect().x;
    document.getElementById('drags').style.width = $('.dropzone')[0].style.width;
    drag_start();
}

function wall_size_change(type,value){
    let wall = document.getElementsByClassName("wall")[0];
    let scroll;
    if(type != null && type == "width") {
        if (value == null) scroll = document.getElementById("wall_width").value;
        else scroll = value;
        // document.getElementById("wall_width_value").innerHTML = (Math.ceil((parseFloat(scroll)+0.1)*10)/ 10);
        document.getElementById("wall_width_value").innerHTML = `${scroll}м`;

        // console.log(scroll);
        wall.style.width = `${scroll * 200}px`;
        objs["width"] = scroll;
    }
    if(type != null && type == "height") {
        if (value == null) scroll = document.getElementById("wall_height").value;
        else scroll = value;        
        // document.getElementById("wall_height_value").innerHTML = (Math.ceil((parseFloat(scroll)+0.1)*10)/ 10);
        document.getElementById("wall_height_value").innerHTML = `${scroll}м`;
        
        // console.log(scroll);
        wall.style.height = `${scroll * 200}px`;
        objs["height"] = scroll;
    }            
}

function load(objss){
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
                    create(keys+" drag",value["x"],value["y"],value["body"],key,true);
                }
            })
        }
        else {
            document.getElementById(`wall_${keys}`).value = values;
            wall_size_change(keys,values);
            // document.getElementById("drags").style.left = $(".dropzone")[0].getBoundingClientRect().x;
        }
    });
    document.getElementById("drags").style.left = $(".dropzone")[0].getBoundingClientRect().x;
    drag_start();
}

function load_proj_cloud(){
    document.getElementById("drags").innerHTML = "";
    document.getElementById("top_panel_center").innerText = `${lang("loading")} ${proj_name} ${lang("from")} ${lang("cloud")}`;
    $.post( "/load_proj",{name:proj_name})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log("good");
            // console.log(JSON.parse(`'${res["body"]}'`));
            // console.log(JSON.parse(res["body"]));
            // $.cookie("objs",res["body"]);
            load(JSON.parse(res["body"]));
            document.getElementById("top_panel_center").innerText = `${proj_name} (${lang("cloud")})`;
        }
        else if(res["out"] == "bad proj"){
            console.log("bad");
            save(()=>{
                goto("/proj/"+proj_name);
            });
        }
    })
}

function load_proj_local(){
    // document.getElementById("top_panel_center").innerText = `loading ${proj_name} from local storage`;
    if(localStorage.getItem(proj_name) == null){
        save_local()
    }
    document.getElementById("top_panel_center").innerText = `${proj_name} (${lang("local")})`;
    document.getElementById("drags").innerHTML = "";
    load(JSON.parse(localStorage.getItem(proj_name)));
}

function save_local(){
    // console.log(objs);
    localStorage.setItem(proj_name,JSON.stringify(objs));
}

function save(callback){
    // console.log(objs);
    html2canvas(document.querySelector("body"),{height: document.getElementById("wall").style.height.split("p")[0], width:document.getElementById("wall").style.width.split("p")[0], y:document.getElementById("wall").getBoundingClientRect().top,x:document.getElementById("wall").getBoundingClientRect().left}).then(canvas => {
        let scr = "";
        // console.log(canvas.toDataURL().length);
        scr = canvas.toDataURL();
        // if (canvas.toDataURL().length < 120000) scr = canvas.toDataURL()
        // console.log(scr);
        $.post( "/save_proj", {proj:JSON.stringify(objs),name:proj_name,img:scr})
        .done(function( res ) {
        if(res["out"] == "good"){
                // console.log(scr)
                // console.log("good");
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
            res["body"].forEach(element => {
                objs_store[`${element["name"]}`] = {description:element["description"],height:element["height"],width:element["width"],id:element["id"],name:element["name"]}
            });
            callback(res["body"]);
        }
    });
}

function get_obj(clas,callback){
    if(objs_store != null && objs_store[clas] != null){
        callback(objs_store[clas]);
    }
    else{
        load_objs(()=>{
            callback(objs_store[clas]);
        })
    }
}

function load_obj(name,key,callback){
    $.post( "/get_obj",{name:name,key:key})
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
        let dragzone = document.getElementsByClassName('wall')[0];
interact('.drag').draggable({
    inertia: true,
    modifiers: [
    interact.modifiers.restrictRect({restriction: dragzone,endOnly: true}),
    interact.modifiers.snap({targets: [interact.snappers.grid({ x: 2, y: 2 })],range: Infinity,relativePoints: [ { x: 0, y: 0 } ]}),
    ],
    autoScroll: true,
    listeners: {move: dragMoveListener, end (event) {}}
})

interact('.trash').dropzone({
    accept: '.drag',
    overlap: 0.2,

    ondragenter: function (event) {
        var drag = event.relatedTarget;
        var zone = event.target; 
        console.log(drag.classList);
        if(objs[drag.classList[0]] != null&&objs[drag.classList[0]][drag.id] != null) delete objs[drag.classList[0]][drag.id];
        zone.classList.add('drop-target');
        drag.classList.add('can-drop');
        drag.remove();
    },
    ondragleave: function (event) {var drag = event.relatedTarget;var zone = event.target;zone.classList.remove('drop-target');drag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondrop: function (event) {
        var drag = event.relatedTarget;
        // console.log(drag.id);
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
        if(drag.classList[1] == "spawn" && drag.classList[0] == zone.classList[0]){
            get_obj(drag.classList[0],(db_data)=>{
                // drag.transform = `translate(${drag.getAttribute("data-y")}px, ${drag.getAttribute("data-y")}px) scale(${db_data["width"] * 2} ${db_data["height"] * 2})`;
                drag.style.width = `${db_data["width"] * 2}px`;
                drag.style.height = `${db_data["height"] * 2}px`;
                // console.log(db_data);
            })
            let x = zone.getBoundingClientRect().left - document.getElementById("drags").getBoundingClientRect().left;
            let y = zone.getBoundingClientRect().top - document.getElementById("drags").getBoundingClientRect().top;
            create(`${zone.classList[0]} spawn drag`,x,y,`${zone.classList[0]}`,`none`);
            drag.classList.remove('spawn');
        }
        zone.classList.remove('drop-target');
    },
    ondrop: function (event) {var drag = event.relatedTargetdrag.classList.remove('in_zone');drag.classList.remove('can-drop');},
    ondropdeactivate: function (event) {var zone = event.target;zone.classList.remove('drop-active');zone.classList.remove('drop-target');}
})

function drag_start() {
    let spawns = document.getElementsByClassName("spawn");
    Object.entries(spawns).forEach(([key, spawn]) => {
        spawn.parentElement.removeChild(spawn);
    });
    let zones = document.getElementsByClassName("createzone");
    Object.entries(zones).forEach(([key, zone]) => {
        let x = zone.getBoundingClientRect().left - document.getElementById("drags").getBoundingClientRect().left;
        let y = zone.getBoundingClientRect().top - document.getElementById("drags").getBoundingClientRect().top;
        // console.log(x,y);
        create(`${zone.classList[0]} spawn drag`,x,y,`${zone.classList[0]}`,`none`);
    });
}

function get_id(clas){
    if(objs[clas] == null){  return `${clas}_0`}
    else{
        let count = Object.keys(objs[clas]).length;
        return `${clas}_${count}`;
    }
}