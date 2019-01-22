function Page() {
	this.questionLibrary = "pointAnswer";
	this.storageAnswer = "";
	this.storageAnswerFontSize = "";
	this.rightAnswer = "";
	this.btncommitflag = true; //防止用户多次点击
	this.init();
}
$.extend(Page.prototype, {
	init: function() {
		window.accountLoginSuccess = $.proxy(this.accountLoginSuccess, this);
		this.resizeDomStyle();
		this.isUserLogin();
		this.bindEvents();
	},
	resizeDomStyle: function() {
		$('#load').load('common/page/load.html',function() {
			load.showLoadingAnimate();
		}.bind(this));
		$('#toast').load('common/page/toast.html');
	},
	accountLoginSuccess: function() {
		location.href = location.href;
	},
	isUserLogin: function() { //用户是否登录接口
		common_utils.requestDataFun({
			selfTestUrl: "json/authorize.json",
			url: "/slotMachine/authorize",
			success: $.proxy(this.isUserLoginSuccess, this),
			error: $.proxy(this.isUserLoginError, this),
			"data": {
				"activityId": "activityId" //这个参数没有用到，后台只是判断不能为空
			}
		});
	},
	isUserLoginSuccess: function(res) {
		//alert(JSON.stringify(res))
		if(res.code == '0000') { //已登录
			this.getQueryUserQuertionStatus();
		} else if(res.code == '0002') { //未登录
			$('#login').show().load('login/login.html');
		} else {
			toast.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>参数异常</div>",
				"flag": true
			});
		}
	},
	isUserLoginError: function() {
		console.log("error")
		$(".yichang").show();
		load.hideLoadingAnimate();
	},
	getQueryUserQuertionStatus: function() {
		common_utils.requestDataFun({
			selfTestUrl: "json/chooseQuestion.json",
			url: "/appAnswerActivity/chooseQuestion.fopcors",
			success: $.proxy(this.getQueryUserQuertionStatusSucc, this),
			error: $.proxy(this.getQueryUserQuertionStatusError, this),
			complete: $.proxy(this.getQueryUserQuertionStatusComplete, this),
			"data": {
				"questionLibrary": this.questionLibrary
			}
		});
	},
	getQueryUserQuertionStatusSucc: function(res) {
		//alert(JSON.stringify(res))
		if(res.code == "0000") {
			if(!res.data.questionVo || res.data.questionVo.length == 0) {
				this.commonError();
				return;
			}
			var problems = res.data.questionVo[0];
			this.questionNum = res.data.questionVo.length;
			this.rightAnswer = problems.rightAnswer;
			this.question = res.data.questionVo[0].id;
			this.storageAnswerFontSize = problems["answer" + this.rightAnswer];
			$(".subjectContainer").show().find(".subjectContent").show().append(
				'<div class="integral-subject integralSubject">' + problems.question + '</div>' +
				'<div class="integral-anwer-fixed">' +
				'<div class="integral-anwer-content">' +
				'<div class="integral-anwer integralAnwer" anwer="A">' + problems.answerA + '</div>' +
				'<div class="integral-anwer integralAnwer" anwer="B">' + problems.answerB + '</div>' +
				'<div class="integral-anwer integralAnwer" anwer="C" style="display: ' + (problems.answerC ? "block" : "none") + '">' + problems.answerC + '</div>' +
				'</div>' +
				'</div>' +
				'<div class="integral-submit integralSubmit">提交</div>').siblings().hide();
		} else if(res.code == "1100") {
			if(res.data.questionVo.length == 0) {
				this.commonError();
				return;
			}
			this.rightAnswer = res.data.questionVo[0].rightAnswer;
			this.storageAnswer = res.data.answerRecordVo.answer[0];
			this.storageAnswerFontSize = res.data.questionVo[0]["answer" + this.rightAnswer];
			$(".subjectContainer").show().find(this.rightAnswer == this.storageAnswer ?
				".rightAnwerContent" : ".wrongAnwerContent").show().siblings().hide();
			$(".wrongAnwerTomorrow").html($(".wrongAnwerTomorrow").html() + this.storageAnswerFontSize);
			$(".userHanderImg").attr("src", res.data.answerRecordVo.avatar ? res.data.answerRecordVo.avatar :
				"./img/question/userDefault.png");
		} else {
			this.commonError();
		}
	},
	getQueryUserQuertionStatusError: function() {
		this.commonError();
	},
	getQueryUserQuertionStatusComplete: function() {
		load.hideLoadingAnimate();
	},
	bindEvents: function() {
		$(".rightReturn,.wrongReturn,.yichangReturn").on("click", $.proxy(this.handleReturnClick, this));
		$(".subjectContent").on("touchstart", ".integralAnwer", $.proxy(this.handleIntegralAnwerClick, this));
		$(".subjectContent").on("click", ".integralSubmit", $.proxy(this.handleIntegralSubmitClick, this));
	},
	handleReturnClick: function() {
		if(common_utils.platformType == "app") {
			if(amcTools.isAmcfm() || amcTools.isAmchqt()) {
				if(window.amcTools.isWKWebView()) {
					window.webkit.messageHandlers.amcfm_utils.postMessage({
						"finish": ""
					});
				} else {
					amcfm_utils.finish();
				}
			}
		} else {
			window.history.go(-1);
		}
	},
	handleIntegralAnwerClick: function(e) {
		$(e.currentTarget).addClass("changeColor").siblings().removeClass("changeColor");
		this.storageAnswer = $(e.currentTarget).attr("anwer");
	},
	handleIntegralSubmitClick: function() {
		if(!this.storageAnswer) {
			toast.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>您还没有答题哦</div>"
			});
			return;
		}
		if(!!this.btncommitflag) {
			this.btncommitflag = false;
		} else {
			return;
		}
		this.count = this.rightAnswer == this.storageAnswer ? 1 : 0;
		this.answer = this.storageAnswer + "@@" + this.count;
		this.getIntegralSubmitStatus();
	},
	getIntegralSubmitStatus: function() {
		common_utils.requestDataFun({
			selfTestUrl: "json/pointAnswer.json",
			url: "/appAnswerActivity/pointAnswer.fopcors",
			data: {
				"questionLibrary": this.questionLibrary,
				"answer": this.answer,
				"questionNum": this.questionNum,
				"question": this.question
			},
			success: $.proxy(this.submitAnswerSucc, this),
			error: $.proxy(this.submitAnswerErr, this),
			complete: $.proxy(this.submitAnswerComplete, this),
		})
	},
	submitAnswerSucc: function(res) {
		//alert(JSON.stringify(res))
		if(res.code == "0000") {
			$(".subjectContainer").show().find(this.rightAnswer == this.storageAnswer ?
				".rightAnwerContent" : ".wrongAnwerContent").show().siblings().hide();
			$(".wrongAnwerTomorrow").html($(".wrongAnwerTomorrow").html() + this.storageAnswerFontSize);
			$(".userHanderImg").attr("src", res.data.avatar ? res.data.avatar :
				"https://m.chinaamc.com/antfortune/integralQuestion_img/userDefault.png");
		} else {
			this.commonError();
		}
		this.btncommitflag = true;
	},
	submitAnswerErr: function() {
		this.commonError();
	},
	submitAnswerComplete: function() {},
	shieldlayerToast: function(toastDom) { // html， dom, speed, flag
		var toast = $(".toast");
		var dom = toastDom.dom || toast;
		if(dom.css("display") == "block") {
			return;
		}
		var bgColor = dom != toast ? dom.css("background-color") : !toastDom.flag ? "rgba(0,0,0,0)" : "rgba(255,255,255,1)";
		dom.show().html(toastDom.html).css("background-color", bgColor);
		!toastDom.flag && setTimeout(function() {
			dom.hide();
		}, toastDom.speed || 3000)
	},
	commonError: function() {
		$(".yichang").show();
		this.btncommitflag = true;
	},
});
new Page();