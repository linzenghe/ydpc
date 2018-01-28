// 手机号码验证
jQuery.validator.addMethod("isMobile", function(value, element) {
    var length = value.length;
    var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
    return this.optional(element) || (length == 11 && mobile.test(value));
}, "请正确填写您的手机号码");

// 密码验证
jQuery.validator.addMethod("password", function(value, element) {
    return this.optional(element) || /^\w+$/.test(value);
}, "密码只能是数字、字母与下划线");

/*验证中文字符*/
jQuery.validator.addMethod("isChinese", function(value, element) {
    return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
}, "只能包含中文字符");