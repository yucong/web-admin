define(function (require) {
    require('bootstrapValidator');
    require('messager');
    require('table');
    require('jquery.ztree');
    require('doctor-select');

    $.module("SYS.sys_user", function () {
        var current_show_data = [];
        return {
            init: function () {
                this.loadData();
                this.loadEvent();
            },
            loadData: function (pageNumber, pageSize) {
                var that = this;
                var search_nc_name = $("#search_cn_name").val();
                var search_username = $("#search_username").val();
                SYS.Core.ajaxGet({
                    url: "user/list",
                    data: {
                        username: search_username,
                        page: pageNumber ? pageNumber : 1,
                        size: pageSize ? pageSize : 20
                    },
                    success: function (data) {
                        var obj = {
                            'pageNumber': data.data.page.current_page,
                            'pageSize': data.data.page.page_size,
                            'totalRows': data.data.page.all_count,
                            'data': data.data.list
                        };
                        current_show_data = obj.data;
                        $("#myTable").bootstrapTable('destroy'); //销毁table
                        $('#myTable').bootstrapTable({
                            striped: true, //使表格带有条纹
                            singleSelect: true,
                            showColumns: true,
                            showToggle: true,
                            pagination: true,
                            pageNumber: obj.pageNumber,
                            pageSize: obj.pageSize,
                            totalRows: obj.totalRows,
                            pageList: [8, 15, 20, 50, 100, 200],
                            sidePagination: 'server',
                            clickToSelect: true,
                            idField: 'id',
                            data: obj.data,
                            columns: [{
                                field: 'checked',
                                checkbox: true
                            },
                            {
                                field: 'username',
                                title: '用户名',
                                align: 'center'
                            },
                            // {
                            //     field: 'username',
                            //     title: '昵称',
                            //     align: 'center'
                            // },
                            // {
                            //     field: 'createTime',
                            //     title: '创建时间',
                            //     align: 'center',
                            //     formatter: function (time) {
                            //         return SYS.Tool.formatterTime(time);
                            //     }
                            // },
                            {
                                field: 'do',
                                title: '操作',
                                align: 'center',
                                formatter: function (value, row, index) {
                                    var html = '';
                                    // if(row.username == 'admin') {
                                    //     html += '<a href="javascript:void(0)" onclick="SYS.sys_user.toEdit(' + index + ')" class="text-do-edit"><i class="fa fa-pencil-square-o"></i> 编辑</a>';
                                    // } else {
                                        html += '<a href="javascript:void(0)" onclick="SYS.sys_user.toEdit(' + index + ')" class="text-do-edit"><i class="fa fa-pencil-square-o"></i> 编辑</a>';
                                        html += '<span class="text-explode"> | </span>';
                                        html += '<a href="javascript:void(0)" onclick="SYS.sys_user.toEditUserRole(' + row.id + ',\'' + row.username + '\')" class="text-do-edit"><i class="fa fa-user"></i> 分配角色</a>';
                                        html += '<span class="text-explode"> | </span>';
                                        html += '<a href="javascript:void(0)" onclick="SYS.sys_user.toSelfMenu(' + row.id + ',\'' + row.username + '\')" class="text-do-view"> 拥有权限</a>';
                                        html += '<span class="text-explode"> | </span>';
    
                                        if(row.locked == 0) {
                                            html += '<a href="javascript:void(0)" onclick="SYS.sys_user.toRemove(' + row.id + ',' + row.locked + ')" class="text-do-remove"><i class="fa fa-trash-o"></i> 冻结</a>';
                                        } else {
                                            html += '<a href="javascript:void(0)" onclick="SYS.sys_user.toRemove(' + row.id + ',' + row.locked + ')" class="text-do-remove"><i class="fa fa-trash-o"></i> 解除</a>';
                                        }
                                    // }
                                    return html;
                                }
                            }
                            ],
                            onPageChange: function (number, size) {
                                that.loadData(number, size);
                            },
                            onRefreshTable: function () { //表格右侧刷新按钮
                                that.loadData(obj.pageNumber, obj.pageSize);
                            }
                        });
                    }
                });
            },
            loadEvent: function () {
                var that = this;
                $("#btn_search").on('click', function () {
                    that.loadData();
                });
                $("#btn_add").on('click', function () {
                    $("#nickname").val("");
                    $('#myModal').modal('show');
                });
                $("#btn_save_user_role").on('click', function () {
                    that.saveUserRole();
                })

                $('#fm').bootstrapValidator({
                    feedbackIcons: {
                        valid: 'glyphicon glyphicon-ok',
                        invalid: 'glyphicon glyphicon-remove',
                        validating: 'glyphicon glyphicon-refresh'
                    },
                    fields: {
                        cn_name: {
                            validators: {
                                notEmpty: {
                                    message: '此项必填'
                                }
                            }
                        },
                        username: {
                            validators: {
                                notEmpty: {
                                    message: '此项必填'
                                }
                            }
                        }
                    }
                }).on('success.form.bv', function (e) { //使用此方法可以ajax
                    e.preventDefault();
                    //保存用户
                    that.saveUser();
                });
                //清空验证信息(必须)
                $('#myModal').on('hide.bs.modal', function () {
                    $("#fm input[name='id']").val('');
                    $("#fm input[name='password']").val('');
                    $("#fm input[name='username']").val('');
                    $('#fm').bootstrapValidator('resetForm', true);
                });

                $("#platform_user").on('click', function () {
                    DOCTOR.Select.showUser(this);
                });
            },
            toEdit: function (index) {
                var obj = current_show_data[index];
                $("#fm input[name='id']").val(obj.id);
                $("#fm input[name='username']").val(obj.username);
                $("#fm #nickname").val(obj.nickName);
                $('#myModal').modal('show');
            },
            toRemove: function (id,locked) {
                var that = this;
                var msg = "";
                if(locked == 1) {
                    msg = "确定要解除吗?";
                } else {
                    msg = "确定要冻结吗?";
                }
                $.messager.confirm(msg, function () {
                    SYS.Core.ajaxPost({
                        url: "user/locked",
                        data: {
                            userId: +id
                        },
                        success: function (data) {
                            if (data.code == 1) {
                                $.messager.popup('操作成功', "success");
                                that.loadData();
                            } else {
                                $.messager.popup('操作失败', 'error');
                            }
                        }
                    })
                });
            },
            toEditUserRole: function (id, username) {
                var that = this;
                var array = [];
                $("#user_id").val(id);
                $("#user_name").val(username);
                console.log(username)
                SYS.Core.ajaxGet({
                    url: "role/list",
                    data: {
                        available : true
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            var html = '';
                            //默认勾选功能,根据用户id获取角色ids
                            var roleIds = that.getSelRols(id);
                            console.log("用户拥有的角色:" + roleIds);
                            html += '' +
                                '<thead> ' +
                                '<tr> ' +
                                '<th></th> ' +
                                '<th>角色名称</th> ' +
                                '<th>角色描述</th> ' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody> ';
                            var rows = data.data.list;
                            for (var i = 0; i < rows.length; i++) {
                                html += '<tr>' +
                                    '<td><input type="checkbox" name="roleCheck" value="' + rows[i].id + '" ';
                                if ($.inArray(rows[i].id, roleIds) != -1) {
                                    html += 'checked="checked"';
                                }
                                html += '></td>' +
                                    '<td>' + rows[i].role + '</td>' +
                                    '<td>' + rows[i].description + '</td>' +
                                    '</tr>';
                            }
                            html += '</tbody>';
                            $("#user_role_table").html(html);
                            $("#user_name").html('用户名 : ' + username)
                        } else {
                            $.messager.popup(data.message, 'error');
                        }
                    }
                });
                $('#roleModal').modal('show');
            },
            saveUser: function () {
                var that = this;
                var id = +$("#fm input[name='id']").val();
                var password = $("#fm input[name='password']").val();
                var username = $("#fm input[name='username']").val();
                var nickName = $("#nickname").val();
                var url = '';
                if (id == '') {
                    url = 'user/add';
                } else {
                    url = 'user/update';
                }
                SYS.Core.ajaxPost({
                    url: url,
                    common: {},
                    data: {
                        id: id ? id : 0,
                        password: password,
                        username: username,
                        nickName: nickName,
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            $('#myModal').modal('hide');
                            $.messager.popup(data.message, 'success');
                            that.loadData();
                        } else {
                            $('#fm').bootstrapValidator('disableSubmitButtons', false);
                            $.messager.popup(data.message, 'error');
                        }
                    }
                })
            },
            saveUserRole: function () {
                var that = this;
                var userId = $("#user_id").val();
                var roleIds = new Array();
                $('input[name="roleCheck"]:checked').each(function () {
                    roleIds.push($(this).val());
                });
                SYS.Core.ajaxPost({
                    url: "user/updateRole",
                    data: {
                        userId: userId,
                        roleIds: roleIds
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            $.messager.popup('保存成功', "success");
                            $('#roleModal').modal('hide');
                            that.loadData();
                        } else {
                            $.messager.alert('提示', '保存失败，请稍后再试', "error");
                        }
                    }
                })
            },
            getSelRols: function (id) {
                var arr = new Array();
                SYS.Core.ajaxGetAsync({
                    url: 'role/listByUserId',
                    data: {
                        userId : id
                    },
                    success: function (data) {
                        if (data.code == 1) {
                            var list = data.data;
                            for (var i = 0; i < list.length; i++) {
                                arr[i] = list[i].id;
                            }
                        }
                    }
                });
                return arr;
            },
            toSelfMenu: function (id, username) {
                $.fn.zTree.destroy("tree");
                $("#menu_user_name").html(username);
                var userId = $.cookie('u_id');
                SYS.Core.ajaxGet({
                    url: "permission/listByUserId",
                    data: {
                        userId: id
                    },
                    success: function (data) {
                        // debugger;
                        if (data.code == 1) {
                            if (data.data.length == 0) {
                                $.messager.popup('用户没有可操作菜单', 'info');
                                return;
                            }
                            var setting = {
                                check: {
                                    enable: false
                                },
                                view: {
                                    showLine: true
                                },
                                data: {
                                    simpleData: {
                                        enable: true,
                                        idKey: "id",
                                        pIdKey: "pId",
                                        rootPId: ""
                                    }
                                },
                                callback: {
                                    beforeClick: function (treeId, treeNode) {
                                        var zTree = $.fn.zTree.getZTreeObj("tree");
                                        if (treeNode.isParent) {
                                            zTree.expandNode(treeNode);
                                            return false;
                                        } else {
                                            return true;
                                        }
                                    }
                                }
                            };

                            var menus = data.data;
                            var zNodes = [];
                            if (menus.length > 0) {
                                for (var i = 0; i < menus.length; i++) {
                                    var menu = menus[i];
                                    var zNode = {};
                                    zNode.id = menu.id;
                                    zNode.pId = menu.parentId;
                                    zNode.name = menu.name;
                                    zNode.open = true;
                                    zNodes.push(zNode);
                                    if (menu.children && menu.children.length > 0) {
                                        for (var j = 0; j < menu.children.length; j++) {
                                            var childrenMenu = menu.children[j];
                                            var zNode = {};
                                            zNode.id = childrenMenu.id;
                                            zNode.pId = menu.id;
                                            zNode.name = childrenMenu.name;
                                            zNode.open = true;
                                            zNodes.push(zNode);
                                            //三级菜单
                                            if (childrenMenu.children && childrenMenu.children.length > 0) {
                                                for (var n = 0; n < childrenMenu.children.length; n++) {
                                                    var c = childrenMenu.children[n];
                                                    var z = {};
                                                    z.id = c.id;
                                                    z.pId = childrenMenu.id;
                                                    z.name = c.name;
                                                    z.open = true;
                                                    z.checked = c.checked;
                                                    zNodes.push(z);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $.fn.zTree.init($("#tree"), setting, zNodes);
                            $('#menuModal').modal('show');
                        } else {
                            $.messager.popup(data.message, 'error');
                        }
                    }
                });
            }
        }
    });
    SYS.sys_user.init();
})