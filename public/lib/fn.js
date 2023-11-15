let gids = [];

function get_from_uuid(callback){
    const uid = $.cookie("uuid");
    const sid = $.cookie("sid");
    $.post( "/get_cr_uuid", { uuid:uid,sid:sid })
    .done(function( res ) {
        if (res["out"] == "good"){
            // console.log("good");
            callback(res["body"])
        }
    });
}

function set_pos(obj,x,y){
    obj.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    obj.setAttribute('data-x', x)
    obj.setAttribute('data-y', y)
}

function log_by_sid() {
    // const uuid = $.cookie("uuid");
    // const sid = $.cookie("sid");
    // console.log("log");
    if($.cookie('sid') == null){
        // get_sid(location.hostname);
        get_sid();
    }
    else if ($.cookie('sid') != null && $.cookie('uuid') != null){
    $.post( "/sid_log")
    .done(function( res ) {
        // console.log("ping");
        if(res["out"] == "good"){
            goto(res["url"]);
        }
        else if (res["out"] == "bad"){
            clear_ck(false);
        }
    })}
}

function clear_ck(redirect = true){
    let uuid = $.cookie("uuid");
    let sid = $.cookie("sid");
    $.removeCookie("uuid");
    $.removeCookie('sid');    
    // console.log("sid");
    setTimeout(()=>{
        $.post( "/clear_sid",{uuid:uuid,sid:sid})
        .done(function( res ) {
            // console.log("sid");
            if(res["out"] == "good"){
                // get_sid();
                if (redirect) goto("/login");
            }
            // console.log("clear");
        })
    },100)
}


function check_sid(redirect = true){
    // console.log("checking sid");
    if($.cookie('sid') == null || $.cookie('uuid') == null){
        clear_ck(redirect);
    }
    else{        
        $.post( "/sid_log")
        .done(function( res ) {
            if(res["out"] == "bad"){
                clear_ck(redirect);
            }
        })
    }
}

function logout(redirect = true) {
    msg(`Выйти?`,{type:"ask",res:(out)=>{
        if(out){
            clear_ck(redirect);
        }
    }});
}

function ask(text,params={def:"",func}) {
    msg(text,{type:"enter",def:params.def,res:(out)=>{
        if(out != false){
            params.func(out);
        }
    }})
}


function get_sid(){
    $.post( "/get_sid", {})
    .done(function( res ) {
        // if(res["out"] == "good"){
        //     console.log(res["body"]);
        // }
    });
}

function load_colors(callback){
    $.post( "/object/colors/get", {})
    .done(function( res ) {
        if(res["out"] == "good"){
            if(callback)callback(res["body"])
        }
    });
}
function clear_palette(){
    Object.values(document.getElementsByClassName("color_palette")).forEach(element => {
        element.style.border = "0px blue solid";
    });
}


function load_groups(callback,groups,admin = false){
    let select = document.getElementById("group");
    // let name = select.options[select.selectedIndex].text;
    groups.forEach(gid => {
        $.post("/object/group/get",{gid:gid})
        .done(function( res ) {
            if(res["out"] == "good"){
                console.log(res["body"]);
                let group = res["body"]
                    let group_div = document.createElement("div");
                    group_div.classList.add(`obj_group`);
                    
                    let group_label = document.createElement("label");
                    group_label.innerText = group["name"].replaceAll("$"," ");
                    group_label.setAttribute("for",`obj_group_${group["id"]}`)
    
                    let group_inp = document.createElement("input");
                    group_inp.setAttribute("type","checkbox");
                    group_inp.setAttribute("onchange",`group_check(${group["id"]})`)
                    // group_inp.innerText = group["name"].replaceAll("$"," ");
                    group_inp.setAttribute("group_count",group["count"]);
                    // console.log(group["count"]);
                    group_inp.setAttribute("gid",group["id"]);
                    group_inp.id = `obj_group_${group["id"]}`;
                    group_inp.setAttribute("group_name",`${group["name"].replaceAll("$"," ")}`);
                    group_inp.setAttribute("pid",`${group["pid"]}`);

                    if (gids.includes(group["id"])){
                        group_inp.setAttribute("checked","true");
                    }

                    if(admin){
                        let group_del_btn = document.createElement("button");
                        group_del_btn.setAttribute("onclick",`delete_group(${group["id"]},${group["pid"]})`)
                        group_del_btn.innerText = "удалить";
                        group_del_btn.classList.add("btn_blue");
                        group_del_btn.style = "font-size: 0.8vw;width: 70px;";
                        group_div.append(group_del_btn)
                    }

                    group_div.append(group_label);
                    group_div.append(group_inp);
                    select.append(group_div)
            }
            // callback(res);
        });
        if(gid == gids.at(-1)){
            if(callback)callback();
        }
    });
}

function group_check(gid){
    if (typeof gids[0] == 'undefined'){
        gids = []
    }
    
    let gid_el = document.getElementById(`obj_group_${gid}`);
    if(gid_el.checked){
        gids[gids.indexOf(gids.at(-1))+1] = gid;
    }
    else if (!gid_el.checked){
        gids.splice(gids.indexOf(gid),1);
    }
    // if (!gids.includes(gid)){
    //     gids[gids.indexOf(gids.at(-1))+1] = gid;
    // }
    // else{
    //     gids.pop(gid);
    // }

    console.log(gids);
    if (typeof gids_change != 'undefined'){
        gids_change();
    }
}

function color_change(hex,img,callback){
    $.post( `/color`,{hex:hex,img:img})
    .done(function( res ) {
        if(callback) callback(res);
    });
}

function load_parts(callback){
    let parts_div = document.getElementById("part_select");
    $.post( "/object/parts/get", {})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log(res["body"]);
            callback(res["body"]);
        }
    });
}
function load_group(gid,callback){
    $.post( "/object/group/get", {gid:gid})
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log(res["body"]);
            callback(res["body"]);
            // Object.values(res["body"]).forEach(part => {
            //     console.log(part);
            // });
        }
    });
}

// redirect
function goto(url) {
    loading();
    setTimeout(()=>{
        location.href = url;
    },1000)
}

function postForm(path, params, method) {
    method = method || 'post';

    var form = document.createElement('form');
    form.setAttribute('method', method);
    form.setAttribute('action', path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

function downloadTextFile(text, name) {
    const a = document.createElement('a');
    const type = name.split(".").pop();
    a.href = URL.createObjectURL( new Blob([text], { type:`text/${type === "txt" ? "plain" : type}` }) );
    a.download = name;
    a.click();
}

var openFile = function(event,callback) {
    var input = event.target;
    console.log(input.files[0]);
  
    var reader = new FileReader();
    reader.onload = function() {
      var text = reader.result;
    //   var node = document.getElementById('import_file');
    //   node.innerText = text;
      console.log(reader.result.substring(0, 200));
      callback(text)
    };
    reader.readAsText(input.files[0]);
};

async function removeImageBackground(image) {
    const backgroundColor = { red: 255, green: 255, blue: 255 };
    const threshold = 10;
  
    const imageElement = new Image();
    imageElement.src = image;
    await new Promise(function(resolve) { imageElement.addEventListener('load', resolve); });
  
    var canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
  
    var ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < imageData.data.length; i += 4) {
      const red = imageData.data[i];
      const green = imageData.data[i + 1];
      const blue = imageData.data[i + 2];
      if (Math.abs(red - backgroundColor.red) < threshold &&
        Math.abs(green - backgroundColor.green) < threshold &&
        Math.abs(blue - backgroundColor.blue) < threshold) {
        imageData.data[i + 3] = 0;
      }
    }
  
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL(`image/png`);
  }

  function downloadImg(url, filename) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    })
    .catch(console.error);
  }

  function getBase64Image(img_url) {  
    img = new Image();
    img.src = img_url;
    let canvas = document.createElement("canvas");  
    canvas.width = img.width;  
    canvas.height = img.height;  
   
    let ctx = canvas.getContext("2d");  
    ctx.drawImage(img, 0, 0);  
    
    let dataURL = canvas.toDataURL("image/png");  
    
    return dataURL;
    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");  
}  

  function img_cache(callback){
    function preloadImages(array,callback) {
        // let wait_msg = msg("кеширование картинок",{type:"wait"})
        if (!preloadImages.list) {
            preloadImages.list = [];
        }
        var list = preloadImages.list;
        for (var i = 0; i < array.length; i++) {
            if(!is_cached(array[i])){
                var img = new Image();
                img.onload = function() {
                    var index = list.indexOf(this);
                    if (index !== -1) {
                        list.splice(index, 1);
                    }
                    // if(i==array.length-1){
                    //     msg_del(wait_msg.id);
                    // }
                }
                list.push(img);
                img.src = array[i];
                if(i==array.length-1){
                    callback();
                }
            }
        }
    }

    // $.post( "/get_objs")
    // .done(function( res ) {
        // let wait_msg = msg("загрузка изображений",{type:"wait"})
    //     if(res["out"] == "good"){
    //         // console.log(res["body"]);
    //         let sources = [];
    //         res["body"].forEach(element => {
    //             sources.push(element["img"]);
    //             if(element == res["body"].at(-1)){
    //                 // console.log(sources);
    //                 preloadImages(sources,()=>{
    //                     // console.log("cached");
    //                     callback();
    //                     msg_del(wait_msg.id)
    //                     // sources.forEach(element => {
    //                     //     console.log(element,is_cached(element));
    //                     // });
    //                 })
    //             }
    //         });
    //     }
    // });

    function is_cached(img_url){
        var imgEle = document.createElement("img");
        imgEle.src = img_url;
        return imgEle.complete || (imgEle.width+imgEle.height) > 0;
    }
}