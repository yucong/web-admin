reloadMain();
checkLogin();
loadMenu();
version();

$(document).ready(function () {
    //加密成md5

    var user_name = $.cookie('u_nickName');
    $("#u_name").html(' ' + user_name + ' ');

    $(".logout").on('click', function () {
        logout();
    });
    if($("#main_iframe").attr("src")=="home.html"){
        $("#side-menu li").eq(1).addClass("active").siblings().removeClass("active");
    }
    // $(".J_menuItem").on("click", function () {
    //     // var title = $(this).parent().attr("title");
    //     // $(".title").attr("title", title);
    //     // console.log($(this).text());
    //     var aa=$(this).text();
    //     sessionStorage.setItem("name",aa);
    //     var ahtml=$(this).parents("li").attr("aaa");
    //     //console.log(ahtml);
    //     $(".fa-question-circle").attr("title",ahtml);
    //     var parent = $(this).parents("ul").siblings("").find(".nav-label").html();
    //     var child = $(this).html();
    //     var array = [];
    //     var data = JSON.parse(localStorage.getItem("DO")).data;
    //     console.log(data);
    //     for (var i = 0; i < data.length; i++) {
    //         if (data[i].name == parent) {
    //             for (var j = 0; j < data[i].children.length; j++) {
    //                 if (data[i].children[j].name == child) {
    //                     for (var k = 0; k < data[i].children[j].children.length; k++) {
    //                         array.push(data[i].children[j].children[k].scode);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     localStorage.setItem("button", JSON.stringify(array))
    // })

    $(".pending ul li").on("click",function(){
        var menu_id=localStorage.getItem("menu_id");
        $("a.J_menuItem[data-menu-id=" + menu_id + "]").parent().parent().parent().addClass('active');

    })
    $("#edit_password").on('click', function () {
        $("#modal_edit_password").modal('show');
    });

    $('#modal_edit_password').on('hide.bs.modal', function () {
        $("#txtOldPass").val('');
        $("#txtNewPass").val('');
        $("#txtRePass").val('');
        $('#fm_edit_password').bootstrapValidator('resetForm', true);
    });

    $(window).bind('hashchange', function () {
        window.location.reload();
    });

    $('#fm_edit_password').bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            txtOldPass: {
                validators: {
                    notEmpty: {
                        message: '此项必填'
                    },
                    // regexp: {
                    //     regexp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/,
                    //     message: '密码8-16位,并包含大小写字母'
                    // },
                }
            },
            txtNewPass: {
                validators: {
                    notEmpty: {
                        message: '此项必填'
                    },
                    regexp: {
                        regexp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/,
                        message: '密码8-16位,并包含大小写字母和数字'
                    },
                }
            },
            txtRePass: {
                validators: {
                    notEmpty: {
                        message: '此项必填'
                    },
                    callback: {
                        message: '两次密码不一致',
                        callback: function (value, validator) {
                            var new_pass = $('#txtNewPass').val();
                            return value == new_pass;
                        }
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {
        e.preventDefault();
        edit_password();
    });
});

/**
 * 1、回显菜单
 * 2、刷新iframe地址
 */
function reloadMain() {
    var hash = window.location.hash;
    if (hash && hash.length > 0) {
        var items = hash.substr(1, hash.length).split('#');
        if (items.length == 2) {
            var main_url = items[0];
            var m_id = items[1];
            $.cookie("m_id", m_id, { path: "/" });
            $("#main_iframe").attr('src', main_url + '#' + m_id);
        }
    } else {
        $.cookie('m_id', '', { path: "/", expires: -1 });
    }
}

/**
 * 检查登录
 */
function checkLogin() {
    $("#index_loading").show();
    var is_login = $.cookie("is_login");  //判断是否登录
    console.log('checkLogin', is_login)
    if (is_login != "true") {
        location.href = "login.html";
    } else {
        $("#index_loading").hide();
        $("#wrapper").show();
    }
}

/**
 * 加载菜单
 */
function loadMenu() {
    var is_login = $.cookie("is_login");
    if (is_login != "true") {
        return;
    }
    var uid = $.cookie("u_id");
    var u_tokenId = $.cookie("u_tokenId");
    $.ajax({
        url: baseUrl + 'listMenu',
        type: "get",
        dataType: 'json',
        async: false,    //同步
        data: {
            userId: uid,
        },
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", u_tokenId);
            request.setRequestHeader("X-User-Id", uid);
            request.setRequestHeader("Device-Type", "web");
            request.setRequestHeader("App-Version", "1.0.0");//App-Version abc
        },
        success: function (data) { 
            console.log(data);
            localStorage.setItem("DO", JSON.stringify(data));
            var sel_menu_id = $.cookie('m_id') || -9999;
            var third_menu = false;
            // var DO = localStorage.getItem("DO");
            // console.log(JSON.parse(DO))

            if (data.code == 1) {
                var menus = data.data;
                var length = menus.length;
                var menu_html = '';
                console.log(menus)
                for (var i = 0; i < length; i++) {
                    //支持三级菜单
                    var menu = menus[i];
                    
                    if (menu.permission && menu.permission.length > 0 && (!menu.children || menu.children.length == 0)) {
                        menu_html += "<li><a class=\"J_menuItem\" href=\"" + menu.permission + "#" + menu.id + "\" data-menu-id=\"" + menu.id + "\" ><i class=\"fa fa-" + menu.iconCls + "\"></i> <span class=\"nav-label\">" + menu.name + "</span></a></li>";
                    } else {
                        menu_html += "" +
                            "<li>" +
                            "     <a href=\"#\"><i class=\"fa fa-" + menu.iconCls + "\"></i> <span class=\"nav-label\">" + menu.name + "</span><span class=\"fa arrow\"></span></a>" +
                            "     <ul class=\"nav nav-second-level\">";
                        for (var n = 0; n < menu.children.length; n++) {
                            // console.log(menu.children);
                            var children = menu.children[n];
                            if (children.permission && children.permission.length > 0 && (!children.children || children.children.length == 0)) {
                                menu_html += "<li aaa=\"" + children.memo + "\"><a class=\"J_menuItem\" href=\"" + children.permission + "#" + children.id + "\" data-menu-id=\"" + children.id + "\">" + children.name + "</a></li>";
                            } else {
                                menu_html += "<li aaa=\"" + children.memo + "\"><a class=\"J_menuItem\" href=\"" + children.permission + "#" + children.id + "\" data-menu-id=\"" + children.id + "\">" + children.name + "</a>" +
                                    "<ul class=\"nav nav-third-level\">";
                                menu_html += "" +
                                    "    </ul>" +
                                    " </li>";
                            }
                            // if (children.permission && children.permission.length > 0 && (!children.children || children.children.length == 0)) {
                            //     menu_html += "<li title=\"" + children.memo + "\"><a class=\"J_menuItem\" href=\"" + children.permission + "#" + children.id + "\" data-menu-id=\"" + children.id + "\">" + children.name + "</a></li>";
                            // } else {
                            //     menu_html += "<li title=\"" + children.memo + "\"><a class=\"J_menuItem\" href=\"" + children.permission + "#" + children.id + "\" data-menu-id=\"" + children.id + "\">" + children.name + "</a>" +
                            //         "<ul class=\"nav nav-third-level\">";
                            //     menu_html += "" +
                            //         "    </ul>" +
                            //         " </li>";
                            // }
                        }
                        menu_html += "" +
                            "    </ul>" +
                            " </li>";
                    }
                }
                $("#side-menu").append(menu_html);

                var sel_menu_id = $.cookie('m_id') || -9999;
                if (sel_menu_id > -9999) {
                    var ahtml=$("a.J_menuItem[data-menu-id=" + sel_menu_id + "]").parents("li").attr("aaa");
                    console.log(ahtml);
                    $(".fa-question-circle").attr("title",ahtml);
                    $("a.J_menuItem[data-menu-id=" + sel_menu_id + "]").css('color', '#FFF');
                    // console.log($("a.J_menuItem[data-menu-id=" + sel_menu_id + "]").text())
                    var aa=$("a.J_menuItem[data-menu-id=" + sel_menu_id + "]").text();
                    sessionStorage.setItem("name",aa);
                    $("a.J_menuItem[data-menu-id=" + sel_menu_id + "]").parent().parent().parent().addClass('active');
                    if (third_menu) {
                        $("a.J_menuItem[data-menu-id=" + sel_menu_id + "]").parent().parent().parent().parent().parent().addClass('active');
                    }
                }

            } else if(data.code == -2) { //未登录-2，
                
                console.log("tonken验证失败，返回登录界面，msg:" + data.msg);
                $.cookie('is_login', '', { path: "/", expires: 7 });
                $.cookie('u_id', '', { path: "/", expires: 7 });
                $.cookie('u_name', '', { path: "/", expires: 7 });
                $.cookie('m_id', '', { path: "/", expires: 7 });
                location.href = "/html/login.html";

            } else if (data.code == -1) { //参数不合法-1
                
                console.log("没有权限访问，返回登录界面，msg:" + data.msg);
                $.cookie('is_login', '', { path: "/", expires: 7 });
                $.cookie('u_id', '', { path: "/", expires: 7 });
                $.cookie('u_name', '', { path: "/", expires: 7 });
                $.cookie('m_id', '', { path: "/", expires: 7 });
                location.href = "/html/login.html";

            } 
        }
    });
}

/**
 * 退出登录
 */

function logout() {

    var uid = $.cookie("u_id");
    var u_tokenId = $.cookie("u_tokenId");
    $.dialog.confirm("提示", "确定要退出吗？", function () {
        $.cookie('is_login', '', { path: "/", expires: 7 });
        $.cookie('u_id', '', { path: "/", expires: 7 });
        $.cookie('u_name', '', { path: "/", expires: 7 });
        $.cookie('m_id', '', { path: "/", expires: 7 });
        location.href = "login.html";
    });

    $.ajax({
        url: baseUrl + 'logout',
        type: "post",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: {
           
        },
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", u_tokenId);
            request.setRequestHeader("X-User-Id", uid);
            request.setRequestHeader("Device-Type", "web");
            request.setRequestHeader("App-Version", "1.0.0");//App-Version abc
        },
        success: function (data) {
            if (data.code == 1) {
                console.log("退出登录成功");
            } else {
                console.log("退出登录失败");
            }

        },
        error: function () {
            $(".my_message").html("登出出错！");
        }
    });

}

/**
 * 修改密码
 */
function edit_password() {
    var uid = $.cookie("u_id");
    $.ajax({
        url: baseUrl + 'permission/sys/user/updateuserpassword',
        type: "get",
        dataType: 'json',
        data: {
            id: uid,
            password: $("#txtOldPass").val(),
            newpassword: $("#txtNewPass").val()
        },
        success: function (data) {
            if (data.code == 1) {
                $.cookie("is_login", "", { path: "/", expires: -1 });
                $.cookie('u_id', '', { path: "/", expires: -1 });
                $.cookie('u_name', '', { path: "/", expires: -1 });
                $.cookie('m_id', '', { path: "/", expires: -1 });
                $.dialog.alert("提示", "密码修改成功，请重新登录", "success", function () {
                    location.href = "login.html";
                });
            } else {
                $.dialog.alert("提示", data.message, "error");
            }
            $("#modal_edit_password").modal('hide');
        },
        error: function (data) {
            $.dialog.alert("提示", data.msg, "error");
        }
    });
}
function version() {
    // $.ajax({
    //     url: baseUrl + 'adminversion/get',
    //     type: "get",
    //     dataType: 'json',
    //     data: {
    //     },
    //     success: function (data) {
    //         $(".footer .pull-right").html("版本号:" + data.message)
    //     },
    //     error: function (data) {
    //         $.dialog.alert("提示", data.msg, "error");
    //     }
    // });
    $(".footer .pull-right").html("版本号:1.0.0");

}