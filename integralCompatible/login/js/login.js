
$(".login-close").on('click', function() {
	$("#login").hide();
})
//登录按钮被点击
var btnOkflag = true;
$('.btn-ok').on('click', function() {
	var msg = {};
	msg.certificateNo = $('.username').val();
	msg.password = $('.password').val();
	msg.certificateType = $('.idtype').val();
	if(msg.certificateNo.match(/^\s*$/)) {
		if(btnOkflag) {
			btnOkflag = false;
			setTimeout(function() {
				btnOkflag = true;
			}, 1500)
			shieldlayerToast('你还没有填写信息哦！', 5000);
		}
		return;
	}
	if(msg.password.match(/^\s*$/)) {
		if(btnOkflag) {
			btnOkflag = false;
			setTimeout(function() {
				btnOkflag = true;
			}, 1500)
			shieldlayerToast('你还没有填写密码哦！');
		}
		return;
	}
	location.hostname == "127.0.0.1" ?
	$.ajax({
		type:"get",
		url:"json/login.json",
		success: function(res) {
			if(res.result == '0000') {
				$('#login').hide();
				if(window.accountLoginSuccess) {
					window.accountLoginSuccess();
				}
			}
		}
	}) :
	$.ajax({
		type: "POST",
		url: common_utils.commonUrl + "/api/login",
		data: msg,
		success: function(res) {
			//alert(JSON.stringify(res));
			if(res.result == '0000') {
				$('#login').hide();
				if(window.accountLoginSuccess) {
					window.accountLoginSuccess();
				}
			} else if(res.result == '9999') {
				shieldlayerToast(res.msg);
			}
		},
		error: function() {
			shieldlayerToast('网络异常，请稍后再试！');
		}
	});
});

function adjustUserNameClear() {
	if($('.username').val() != '') {
		$('#userNameClear').css('display', 'inline-block');
	} else {
		$('#userNameClear').css('display', 'none');
	}
}

function adjustPasswordClear() {
	if($('.password').val() != '') {
		$('#passwordClear').css('display', 'inline-block');
	} else {
		$('#passwordClear').css('display', 'none');
	}
}

$('.username').on('input', adjustUserNameClear);
$('.password').on('input', adjustPasswordClear);
$('.username').focus(adjustUserNameClear);
$('.password').focus(adjustPasswordClear);

$('#userNameClear').on('click', function() {
	$('.username').val('');
	$('.username').focus();
	$('#userNameClear').css('display', 'none');
});

$('#passwordClear').on('click', function() {
	$('.password').val('');
	$('.password').focus();
	$('#passwordClear').css('display', 'none');
});

$(".btn-register").on("click", function() {
	var ua = navigator.userAgent.toLowerCase();
	if(ua.indexOf('amcfmapp') != -1) {
		//管家
		location.href = 'amcfm://account/login';
	} else if(ua.indexOf('amchqtapp') != -1) {
		//活期通
		location.href = 'amchqt://account/login';
	} else if(ua.indexOf('micromessenger') != -1) {
		//微信
		location.href = 'https://m.chinaamc.com/mphone/mp/wxregister/startCRSValidation';
		//location.href='http://mtest.chinaamc.com/mphone/mp/wxregister/startCRSValidation';
	} else {
		//h5
		location.href = 'https://m.chinaamc.com/mphone/mp/account/startCRSValidation/wgw';
		//location.href='http://mtest.chinaamc.com/mphone/mp/account/startCRSValidation/wgw';
	}
})

$(".btn-app").on("click", function() {
	// location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.chinaamc.MainActivityAMC';
	var subForm = document.createElement('form');
	document.body.appendChild(subForm);
	subForm.method = 'POST';
	subForm.appendChild(createHideInput('cardCode', $('.idtype').val()));
	subForm.appendChild(createHideInput('cardNo', $('.username').val()));
	subForm.appendChild(createHideInput("callbackUrl", document.location.href));
	var ua = navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger') {
		subForm.action = '/mphone/mp/resetPassword/index/wx';
	} else {
		subForm.action = '/mphone/mp/resetPassword/index/wgw';
	}
	subForm.submit();
	document.body.removeChild(subForm);

	function createHideInput(name, value) {
		var input = document.createElement('input');
		input.setAttribute('name', name);
		input.value = value;
		return input;
	}
})

function shieldlayerToast(html, speed) {
	$(".login-dialog .shieldlayer-toast").show().html(html);
	setTimeout(function() {
		$(".login-dialog .shieldlayer-toast").hide();
	}, speed ? speed :3000)
}