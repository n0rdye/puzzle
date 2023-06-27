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

function get_uuid_name(){
    const uid = $.cookie("uuid");
    const sid = $.cookie("sid");
    $.post( "/get_cr_uuid", { uuid:uid,sid:sid })
    .done(function( res ) {
        if (res["out"] == "good"){
            
        }
    });
}

function log_by_sid() {
    // const uuid = $.cookie("uuid");
    // const sid = $.cookie("sid");
    console.log("log");
    if($.cookie('sid') == null){
        // get_sid(location.hostname);
        clear_ck(false);
    }else{
    $.post( "/sid_log")
    .done(function( res ) {
        console.log("ping");
        if(res["out"] == "goto"){
            goto(res["url"]);
        }
        else if (res["out"] == "bad"){
            clear_ck();
        }
    })}
}

function clear_ck(redirect = true){
    $.cookie("uuid",null);
    $.cookie("sid",null);
    get_sid(location.hostname);
    if (redirect) goto("login");
}

function check_sid(){
    console.log("checking sid");
    if($.cookie('sid') == null || $.cookie('uuid') == null){
        clear_ck();
    }
    else{        
        $.post( "/sid_log")
        .done(function( res ) {
            if(res["out"] == "bad"){
                clear_ck();
            }
        })
    }
}

function logout() {
    let dialog = confirm("logout?");
    if(dialog){
        clear_ck();
    }
}


function get_sid(hostname){
    $.post( "/get_sid", { name:hostname })
    .done(function( res ) {
        // if(res["out"] == "good"){
        //     console.log(res["body"]);
        // }
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