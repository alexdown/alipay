seajs.use('jquery', function ($) {
	$(document.body).ready(function () {
		var Validator = function (form, options) {
			this.options = options || {};
			this.form = form;
			//初始化所有长度限制的事件绑定
		};
		Validator.prototype.valid = function () {
			var ret = true;
			$("*[valid-pattern]", this.form).each(function () {
				//如果上层的input-container为隐藏的，则不进行验证
				if ($(this).closest(".input-container:hidden").length != 0)return;
				var pattern = $(this).attr("valid-pattern");
//				console.log(pattern);
				var re = new RegExp(pattern);
				if (re.test($.trim($(this).val()))) {
					$(this).removeClass("stat-error").parent().find(".form-validate-tip .form-explain").addClass("fn-hide");
				} else {
					$(this).parent().find(".form-validate-tip .form-explain").removeClass("fn-hide");
					$(this).addClass("stat-error");
					ret = false;
				}
				$(this).focus(function () {
					$(this).addClass("stat-focus");
				}).blur(function () {
					$(this).removeClass("stat-focus");
				});
				//在item上加上focus，错误信息消息的功能
				if (!$(this).attr("autoRemoveTip")) {
					$(this).attr("autoRemoveTip", true);
					$(this).bind('keyup paste', function () {
						$(this).removeClass("stat-error").parent().find(".form-validate-tip .form-explain").addClass("fn-hide");
					});
				}
			});
			return ret;
		};
		//开启各种即时监控事件
		Validator.prototype.monitor = function () {
			$("*[valid-max-words]", this.form).each(function () {
				var num = $(this).attr("valid-max-words");
				var limitDelayTimer = 0;
				var _limitWords = function (inputDOM) {
					var value = $.trim($(inputDOM).val());
                    //处理各种浏览器回车的不算字符的bug

                    value = value.replace(/(\n|\r\r\n|\r\n\r)/g, "\r\n");

                    var left = num - value.length < 0 ? 0 : num - value.length;
					//bugfix for ie 由于IE不支持maxlength属性，导致这个属性不生效，因此对于ie浏览器，需要js来限制长度
					if ($.browser.msie && value.length > num) {
						var pos = getCursortPosition(inputDOM);
						$(inputDOM).val(value.substr(0, num));
						setCaretPosition(inputDOM, pos);
					}
					$(inputDOM).parent().find(".form-validate-tip .form-left-words-number").text(left);
				};
				//迟缓50ms执行，已确认类似复合键，粘贴之类的延迟
				$(this).bind("focus keyup mouseup", function () {
					window.clearTimeout(limitDelayTimer);

					var inputDOM = this;
					limitDelayTimer = setTimeout(function () {
						$(inputDOM).parent().find(".form-validate-tip .form-left-words").removeClass("fn-hide");
						_limitWords(inputDOM);
					}, 50);
				});
				$(this).bind("focus", function () {
					$(this).addClass("stat-focus");
				});
				$(this).bind("blur", function () {
					$(this).removeClass("stat-focus");
					$(this).parent().find(".form-validate-tip .form-left-words").addClass("fn-hide");
					_limitWords(this);
					//如果用户输入为空，但有默认值，则取默认值
					if ($(this).data("defaultval") && $(this).val() == "") {
						$(this).val($(this).data("defaultval"));
					}
				});
			});
		};

		$('*[data-role=form]').each(function () {
			this.validator = new Validator(this, {});
			this.validator.monitor();
		});


		window.Validator = Validator;
	});

	function getCursortPosition(ctrl) {//获取光标位置函数
		var CaretPos = 0;	// IE Support
		if (document.selection) {
			//ctrl.focus();
			var Sel = document.selection.createRange();
			Sel.moveStart('character', -ctrl.value.length);
			CaretPos = Sel.text.length;
		}
		// Firefox support
		else if (ctrl.selectionStart || ctrl.selectionStart == '0')
			CaretPos = ctrl.selectionStart;
		return (CaretPos);
	}

	function setCaretPosition(ctrl, pos) {//设置光标位置函数
		if (ctrl.setSelectionRange) {
			//ctrl.focus();
			ctrl.setSelectionRange(pos, pos);
		} else if (ctrl.createTextRange) {
			var range = ctrl.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	}
});