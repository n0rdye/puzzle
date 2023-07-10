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

function log_by_sid() {
    // const uuid = $.cookie("uuid");
    // const sid = $.cookie("sid");
    // console.log("log");
    if($.cookie('sid') == null){
        // get_sid(location.hostname);
        get_sid();
    }
    // else if ($.cookie('sid') != null && $.cookie('uuid') != null){
    // $.post( "/sid_log")
    // .done(function( res ) {
    //     console.log("ping");
    //     if(res["out"] == "good"){
    //         goto(res["url"]);
    //     }
    //     else if (res["out"] == "bad"){
    //         clear_ck(false);
    //     }
    // })}
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
    let dialog = confirm(`${lang("logout")}?`);
    if(dialog){
        clear_ck(redirect);
    }
}

function ask(text,def = "") {
    let name = prompt(text,def);
    if(name != "" && name != " "){
        return name;
    }
}


function get_sid(){
    $.post( "/get_sid", {})
    .done(function( res ) {
        // if(res["out"] == "good"){
        //     console.log(res["body"]);
        // }
    });
}

function load_groups(callback){
    let select = document.getElementById("group_select");
    // let name = select.options[select.selectedIndex].text;
    $.post( "/get_groups")
    .done(function( res ) {
        if(res["out"] == "good"){
            select.innerHTML = "";
            res["body"].forEach(group => {
                let group_div = document.createElement("option");
                group_div.innerText = group["name"].replace("$"," ");
                group_div.setAttribute("group_count",group["count"]);
                group_div.setAttribute("gid",group["id"]);
                group_div.id = `obj_group_${group["id"]}`;
                select.append(group_div);
                if(group["id"] == res["body"].at(-1)["id"]){
                    if(callback)callback();
                }
            });
        }
        // callback(res);
    });
}

// redirect
function goto(url) {
    location.href = url;
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