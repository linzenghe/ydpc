
/*需要加载 jQuery  fastclick jquery-weui */

// 定义content类型
var APPLICATION_JSON = "application/json; charset=utf-8";

var tools={
    /**
     * 将值转为json。如果不是json，则输出原始内容。
     * @param str 要转为json的字符串
     */
    toJson: function (str) {
        try {
            // 不是字符串则直接返回
            if (tools.isString(str) === false) return str;
            // 如果不是json格式则返回原始字符串
            if (!str.trim().match(/^\{(.+:.+,*)+}$/)) return str;

            // decimal类型数据进行json parse的时候会丢失部分小数部位，例如3.00->3，3.500->3.5
            // 所以这边将数值类型的转换为字符串类型
            str=str.replace(/([^\\]":)(\d+(\.\d+)?)/g, "$1\"$2\"");
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    },
    /**
     * 判断给定的值是否为字符串
     * @param v
     * @returns {boolean}
     */
    isString:function  (v) {
        return typeof v === "string";
    },
    //是否是函数
    isFunction:function (v) {
        return $.isFunction(v);
    },

    /**
     * 显示"加载中"提示框
     */
    showLoading:function(){
        $.showLoading('加载中');
    },
    /**
     * 关闭"加载中"提示框
     */
    closeLoading : function () {
        $.hideLoading();
    },

    ajax : function (options) {
        var url = options.url;
        // 没定义URL
        if (url === undefined) return;
        // 根据选项确认是否显示遮障
        // if (options.showMask) tools.showLoading();

        $.ajax({
            type: options.type || "GET",      // 提交类型
            url: url,                           // 提交的URL
            data: options.data || {},           // 要提交的数据
            dataType: "html",                   // 响应的数据格式
            contentType: options.contentType || true,
            complete: function () {
                // 关闭加载中的提示
                // alert(1);
                // if (options.showMask) tools.closeLoading();
            },
            success: function (response) {
                // 如果值是字符串，说明返回不是json，那么就不能按json进行处理了。
                if (tools.isString(response)) {
                    // 将值转化为json
                    response = tools.toJson(response);
                    if (tools.isFunction(options.success)) options.success(response);
                }
                else {
                    // 请求成功则直接处理回调
                    if (response.success === true) {
                        if (tools.isFunction(options.success)) options.success(response);
                    }else {     // 全局统一处理ajax的异常信息
                        var error = response.error || { error: -1, message: "发生未知错误!" };
                        if(response.error.code==504){
                            /*tools.alert(error.message, undefined, tools.DLG_ICON.ERROR, function () {
                                if (tools.isFunction(options.fault)) options.fault(response);
                                // 未登录提示
                                tools.navigate("/logout");
                            });*/
                            alert("504错误");
                        }else{
                            /*tools.alert(error.message, undefined, tools.DLG_ICON.ERROR, function () {
                                if (tools.isFunction(options.fault)) options.fault(response);
                            });*/
                        }
                    }
                }
            },
            error: function (res) {
                if (tools.isFunction(options.fault)){
                    options.fault(res);  //如果有errors事件，则运行，否则自动输出
                    return false;
                }else{
                    var resJson = tools.toJson(res.responseText);
                }
                if(resJson.message==null){
                    $.toast(resJson.fieldError.message, "forbidden");
                }else{
                    $.toast(resJson.message, "forbidden");
                }
            },
        });
    },
    ajaxPost : function (url, data, success, fault) {
        if (tools.isFunction(data)) {
            fault = success;
            success = data;
            data = undefined;
        }
        var options = {
            type: "POST",
            url: url,
            data: JSON.stringify(data),
            showMask: true,
            success: success,
            fault: fault,
            contentType: APPLICATION_JSON
        };
        tools.ajax(options);
    },
    ajaxPut:function (url, data, success, fault) {
        if (tools.isFunction(data)) {
            fault = success;
            success = data;
            data = undefined;
        }
        var options = {
            type: "PUT",
            url: url,
            data: JSON.stringify(data),
            showMask: true,
            success: success,
            fault: fault,
            contentType: APPLICATION_JSON
        };
        tools.ajax(options);
    },
    //导航当前页面到指定的URL
    navigate:function (url, params) {
        location.href=tools.addUrlParam(url, params);
    },
    //拼接URL和参数
    addUrlParam:function  (url, params) {
        if (!params) return url;
        if (url.indexOf("?") > 0) return url + "&" + $.param(params);
        return url + "?" + $.param(params);
    },
    // hash转json
    hashToJson:function(param){
        var qs = {};
        for (var i = 0; i < param.length; i++) {
            var pair = param[i].split("=");
            var name = pair[0];
            var value = decodeURIComponent(pair[1]);
            if (typeof qs[name] === "undefined") {
                qs[name] = value;
            }
            else {
                // 发现重复定义的参数，则值为数组
                var array = qs[name];
                if (Array.isArray(array) === false) array = [];
                array.push(value);
            }
        };
        return qs;
    },
    //拼接hash返回对象

    urlParam:function(){
        var vars = window.location.search.substring(1).split("&");
        var urlToJson=tools.hashToJson(vars);
        return urlToJson;
    },
    // 获取指定name的值
    getVal:function (name)
    {
        var tag = $(".item [name='" + name + "']");
        return $.trim(tag.val());
    },
    //获取一系列的name的值
    getQueryJson:function (names) {
        var parm={};
        var arr=names.split(',');
        for(var i in arr){
            if (!arr[i]) continue;
            var t = tools.getVal(arr[i]);
            if (t)
                parm[arr[i]] = t;
        }
        return parm;
    },

    //发送验证码
    sendMsgCode:function (clickObj,phoneObj,type) {
        var sendType=type;
        clickObj.on('click',function () {
            var curCount=120;
            var self=this;
            var phoneNum=$.trim(phoneObj.val());
            if(phoneNum==''){
                $.toast.prototype.defaults.duration=1000;
                $.toast('请填写手机号码','forbidden');
                return false;
            }
            if(clickObj.hasClass('disabled')){
                return false;
            }else{
                if(sendType==1){
                    var url='/api/captcha';
                }else if(sendType==2){
                    var url='/api/captcha/update';
                }
                tools.ajaxPost(url,{phone:phoneNum},function (json) {
                    $.toast('验证码已发送',1000,function () {
                        $('[name=captcha]').val(json.captcha);
                        sendCodeEffect(curCount,self);
                    });
                });
            }
        });
        function sendCodeEffect(curCount,that) {
            clearInterval(that.InterValObj);
            sendCode();
            function sendCode() {
                $(that).text("已发送"+curCount+"s").addClass('disabled');
                that.InterValObj=window.setInterval(SetRemainTime,1000);
            }
            //timer处理函数
            function SetRemainTime() {
                if(curCount==0){
                    window.clearInterval(that.InterValObj);
                    $(that).text("重新发送").removeClass('disabled');
                }else{
                    curCount--;
                    $(that).text("已发送"+curCount+"s");
                }
            }
        }
    }
};
/*
    * ios系统点击延迟事件
*/
$(function() {
    FastClick.attach(document.body);
});
