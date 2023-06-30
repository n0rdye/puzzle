function blogin(){
    log(document.getElementById('login').value,document.getElementById('pass').value);
}

function log(nlogin,npass){
    const login = CryptoJS.AES.encrypt(nlogin,$.cookie("sid")).toString();
    const pass = CryptoJS.AES.encrypt(npass,$.cookie("sid")).toString();
    const sid = $.cookie("sid");
    $.post( "/back_login", { login:login,pass:pass,sid:sid })
    .done(function( res ) {
        if (res["out"] == "bad"){
            console.log(res["err"]);
            if (res["err"] == "user" || res["err"] == "pass"){
                document.querySelector("#res").innerHTML = "<p>wrong password or login</p>";
            }
        }
        else{
            if(res["out"] == "goto"){
                // postForm(res["url"], res["args"]);
                goto(res["url"]);
            }
        }
    });
}

// function get_from_uuid(callback){
//     const uid = $.cookie("uuid");
//     const sid = $.cookie("sid");
//     $.post( "/get_cr_uuid", { uuid:uid,sid:sid })
//     .done(function( res ) {
//         if (res["out"] == "good"){
//             callback(res["body"])
//         }
//         else if (res["out"] == bad){
//             if (res["body"] == "expired"){
//                 clear_ck();
//             }
//         }
//     });
// }
function get_from_uuid(callback){
    const uid = $.cookie("uuid");
    const sid = $.cookie("sid");
    $.post( "/get_cr_uuid", { uuid:uid,sid:sid })
    .done(function( res ) {
        if (res["out"] == "good"){
            // console.log("good");
            callback(res["body"])
        }
        else if (res["out"] == bad){
            if (res["body"] == "expired"){
                logout(true);
            }
        }
    });
}

function log_by_sid() {
    // const uuid = $.cookie("uuid");
    // const sid = $.cookie("sid");
    // console.log("log");
    if($.cookie('uuid') == null && $.cookie('sid') == null){
        // get_sid(location.hostname);
        get_sid(location.hostname);
    }else if ($.cookie('sid') != null && $.cookie('uuid') != null){
    $.post( "/sid_log")
    .done(function( res ) {
        console.log("ping");
        if(res["out"] == "good"){
            goto(res["url"]);
        }
        else if (res["out"] == "bad"){
            clear_ck(false);
        }
    })}
}

function clear_ck(redirect = true){
    console.log("sid");
    $.post( "/clear_sid")
    .done(function( res ) {
        console.log("sid");
        $.cookie("uuid",null);
        $.cookie("sid",null);
        $.removeCookie("uuid");
        $.removeCookie('sid');    
        console.log("clear");
        get_sid(location.hostname);
        if(res["out"] == "good"){
            if (redirect) goto("/login");
        }
    })
}


function check_sid(redirect = true){
    console.log("checking sid");
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
    let dialog = confirm("logout?");
    if(dialog){
        clear_ck(redirect);
    }
}

function ask() {
    let name = prompt("please enter project name");
    if(name != "" && name != " "){
        return name;
    }
}

function wall_size_change(type){
    let wall = document.getElementsByClassName("wall")[0];
    let scroll;
    if(type != null && type == "x") {
        scroll = document.getElementById("wall_x");
        wall.style.width = `${scroll.value * 200}px`;
    }
    if(type != null && type == "y") {
        scroll = document.getElementById("wall_y");
        wall.style.height = `${scroll.value * 200}px`;
    }            
}

function goto_proj(name){
    $.post( "/proj/"+name, { name:hostname })
    .done(function( res ) {
        // if(res["out"] == "good"){
        //     console.log(res["body"]);
        // }
    });
}

function get_sid(hostname){
    $.post( "/get_sid", { name:hostname })
    .done(function( res ) {
        // if(res["out"] == "good"){
        //     console.log(res["body"]);
        // }
    });
}

function new_obj(){

}

function load_projs(callback){
    $.post( "/get_projs")
    .done(function( res ) {
        if(res["out"] == "good"){
            // console.log(res["body"]);
            callback(res["body"]);
        }
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