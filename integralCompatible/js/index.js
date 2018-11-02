function Page() {
	this.integralWrapper = $("#integralWrapper");
	this.riteScroller = $(".riteScroller");
	this.businessList = []; //用来储存赚积分列表数据
	this.isLoadFlag = false;
	this.perfectFlag = false;
	this.timer = null;
	this.y = 0;
	this.init();
}
$.extend(Page.prototype, {
	init: function() {
		window.accountLoginSuccess = $.proxy(this.accountLoginSuccess, this);
		this.resizeDomStyle();
		this.isUserLogin();
		//this.getActicityQueryData();
		//this.integralWrapperAddAnimate();
		//this.getQueryGiftData();
		this.bindEvents();
	},
	accountLoginSuccess: function() {
		this.isUserLogin();
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
			$(".integralWrapper").show();
			this.getActicityQueryData();
		} else if(res.code == '0002') { //未登录
			$(".loadingContent").html("100%").parent().hide(); //后期添加未登录页，这行代码可以删除
			$('#login').show().load('login/login.html');
		} else {
			renderingComponent.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>参数异常</div>",
				"flag": true
			});
		}
	},
	isUserLoginError: function() {
		console.log("error")
	},
	resizeDomStyle: function() {
		$(".popupPerfectDesc").before($(".popupSuccessMailForm").clone().removeClass("materialObject"));

		for(var i = 0, len = $(".headerProgressNum").length; i < len; i++) {
			$(".headerProgressNum").eq(i).css({
				"left": 100 / (len - 1) * i + "%",
				"background-image": "url(./img/progress/weiqiandao_" + (i + 1) + ".png)"
			})
		}

		var num = parseInt($(".loadingContent").html());
		this.timer = setInterval(function() {
			$(".loadingContent").html(++num + "%");
			if(num >= 99 || this.isLoadFlag) {
				this.isLoadFlag = true;
				clearInterval(this.timer);
				$(".loadingContent").parent().hide();
			}
		}.bind(this), 10)
	},
	integralWrapperAddAnimate: function() {
		renderingComponent.sports = this.integralWrapper.find(".rite,.earnPoints,.rule");
		renderingComponent.sportsAnimate();
		setTimeout(function() {
			this.integralWrapper.css("height", window.innerHeight);
			/*页面y轴滚动*/
			this.integralWrapperIscroll = new IScroll("#integralWrapper");
			$(".integralWrapper").on("touchmove", $.proxy(this.handleIntegralWrapperTouchmove, this));
			$(".integralWrapper").on("touchend", $.proxy(this.handleIntegralWrapperTouchend, this));
		}.bind(this), 1000)
	},
	handleIntegralWrapperTouchmove: function(e) {
		renderingComponent.integralWrapperArr.push(e.touches[0].clientY);
		this.y = this.integralWrapperIscroll.y;
		this.y >= 0 && $(".refreshProgress").css("transform", `rotate(${this.y * 15}deg)`);
	},
	handleIntegralWrapperTouchend: function(e) {
		this.y >= 40 && $(".refresh").removeClass("changeStyle") && this.getActicityQueryData();
	},
	getActicityQueryData: function() {
		common_utils.requestDataFun({
			selfTestUrl: "json/activityQuery.json",
			url: "/appPointActivity/activityQuery.fopcors",
			success: $.proxy(this.getActicityQueryDataSucc, this),
			error: $.proxy(this.getActicityQueryDataError, this),
			complete: $.proxy(this.getActicityQueryDataComplete, this),
		});
	},
	getActicityQueryDataSucc: function(res) {
		console.log(res)
		if(res.code == "0000") {
			this.activityGiftArray = res.data.activityGiftArray;
			renderingComponent.getActicityQueryDataSucc(res);
			this.continuousCheckIn(res.data.dailyCheckinNum);
			if(this.isLoadFlag) {
				this.awaitLoadSucc(res);
			} else {
				setTimeout(this.awaitLoadSucc.bind(this, res), 1000);
			}
			/*积分兑好礼横向滚动*/
			swiper = new Swiper('.swiper-container', {
				slidesPerView: 'auto',
				/*freeMode: true,
				freeModeMomentumRatio: 0.8*/
			});
			/*this.riteWrapperIscroll = new IScroll("#riteWrapper", {
				scrollX: true
			})*/
			$(".riteWrapper").on("touchmove", $.proxy(this.handleRiteWrapperTouchmove, this));
			$(".riteWrapper").on("touchend", $.proxy(this.handleRiteWrapperTouchend, this));
		} else {
			this.getActicityQueryDataError();
		}
	},
	awaitLoadSucc: function(res) {
		this.isLoadFlag = true;
		clearInterval(this.timer);
		$(".loadingContent").html("100%");
		setTimeout(function() {
			$(".loadingContent").parent().hide();
		}, 100)
		renderingComponent.integralAddAnimate(0, res.data.myPoints);
		if(res.data.addPoints && res.data.addPoints > 0) {
			renderingComponent.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>+" + res.data.addPoints + "积分</div>"
			});
		}
	},
	continuousCheckIn: function(num) {
		for(var i = 0; i < num; i++) {
			$(".headerProgressNum").eq(i).css("background-image", "url(./img/progress/yiqiandao_" + (i + 1) + ".png)")
		}
		$(".headerProgressSpeed").css("width", (num - 1) * 25 + "%")
	},
	handleRiteWrapperTouchmove: function(e) {
		renderingComponent.riteWrapperArr.push(e.touches[0].clientY);
	},
	handleRiteWrapperTouchend: function() {
		//this.riteWrapperIscroll.scrollTo(0,100)
	},
	getActicityQueryDataError: function() {
		console.log("error");
		$(".loadingContent").html("100%");
		setTimeout(function() {
			$(".loadingContent").parent().hide();
		}, 100)
		$(".riteScroller").append($(".riteAbnormal").clone().show()).find(".riteAbnormal").show();
		renderingComponent.popupStartAnimate($(".popup"))
		renderingComponent.popupContainerStartAnimate($(".popupError"));
	},
	getActicityQueryDataComplete: function(XMLHttpRequest, status) {
		$(".refresh").addClass("changeStyle");
		status == "timeout" && this.getActicityQueryDataError();
		if(this.isLoadFlag) {
			this.integralWrapperAddAnimate();
		} else {
			setTimeout(function() {
				this.integralWrapperAddAnimate();
			}.bind(this), 800);
		}
		console.log("查询完成");
	},
	bindEvents: function() {
		$(".container").on("touchstart", ".headerGift,.riteEach,.riteEachGiftIcon,.earnPointsEach", $.proxy(this.handleDivClearDataTouchstart, this));
		$(".headerGift").on("touchend", $.proxy(this.handleHeaderGiftTouchend, this));
		$(".integralScroller").on("touchend", ".riteEach", $.proxy(this.handleRiteEachTouchend, this));
		$(".integralScroller").on("touchend", ".riteEachGiftIcon", $.proxy(this.handleRiteAndGiftIconTouchend, this));
		$(".gift").on("touchend", ".giftItemPic", $.proxy(this.handleRiteAndGiftIconTouchend, this));
		$(".integralScroller").on("touchend", ".earnPointsEach", $.proxy(this.handleEarnPointsEachTouchend, this));
		$(".acticityLuckDraw").on("touchend", $.proxy(this.handleActicityLuckDrawTouchend, this));
		$(".giftReturnBtn").on("touchend", $.proxy(this.handleGiftReturnBtnTouchend, this));
		$(".giftContainer").on("touchend", ".giftItemBtn", $.proxy(this.handleGiftItemBtnTouchend, this));
		$(".popupValidateBtn").on("touchstart", $.proxy(this.handlePopupValidateBtnTouchstart, this));
		$(".popupValidateBtn").on("touchmove", $.proxy(this.handlePopupValidateBtnTouchmove, this));
		$(".popupValidateBtn").on("touchend", $.proxy(this.handlePopupValidateBtnTouchend, this));
		$(".popupValidateRefBtn").on("touchend", $.proxy(this.handlePopupValidateRefBtnTouchend, this));
		$(".popupExchangeBtn").on("touchend", $.proxy(this.handlePopupExchangeBtnTouchend, this));
		$(".popupSuccessBtn").on("touchend", $.proxy(this.handlePopupSuccessBtnTouchend, this));
		$(".popupCopySuccessClose,.popupCopySuccessBtn").on("touchend", $.proxy(this.handlePopupCopySuccessCloseTouchend, this));
		$(".popupSuccessConfirmMsgBtn").on("touchend", $.proxy(this.handlePopupSuccessConfirmMsgBtnTouchend, this));
		$(".popupPerfectBtn").on("touchend", $.proxy(this.handlePopupPerfectBtnTouchend, this));
		$(".popup,.popupContainer .close,.popupCommonBtn,.popupPrizeDetailBtn").on("touchend", $.proxy(this.handlePopupCloseTouchend, this));
		$(".floatingLayerContainer,.popupContainer").on("touchend", $.proxy(this.handleStopPropagationTouchend, this));
		$(".floatingLayerContainer,.popupContainer").on("touchmove", $.proxy(this.handleStopPropagationTouchend, this));
		$(".floatingLayer,.floatingLayer .close,.floatingLayer .btn").on("touchend", $.proxy(this.handleFloatingLayerCloseTouchend, this));
		$(".popupErrorBtn").on("touchend", $.proxy(this.handlePopupErrorBtnTouchend, this));
		document.body.addEventListener('touchmove', function(event) {
			event.preventDefault();
		}, true);
	},
	handleDivClearDataTouchstart: function() {
		renderingComponent.riteWrapperArr = [];
		renderingComponent.integralWrapperArr = [];
	},
	handleHeaderGiftTouchend: function(e) {
		renderingComponent.iscrollTouchendVertical(e, function() {
			$(".gift").show();
			$(".giftContainer").html("");
			this.getQueryGiftData();
			renderingComponent.sportsAnimate({
				"dom": $(".integralWrapper"),
				"startMarginTop": "0",
				"startOpacity": "1",
				"endMarginTop": -window.innerHeight,
				"endOpacity": "1",
				"speed": 600
			});
		}.bind(this));
	},
	getQueryGiftData: function() {
		common_utils.requestDataFun({
			selfTestUrl: "json/queryGift.json",
			url: "/appPointActivity/queryGift.fopcors",
			success: $.proxy(this.getQueryGiftDataSucc, this),
			error: $.proxy(this.getQueryGiftDataError, this),
			complete: $.proxy(this.getQueryGiftDataComplete, this),
		});
	},
	getQueryGiftDataSucc: function(res) {
		console.log(res)
		if(res.code == "0000") {
			if(res.data.length <= 0) {
				$(".giftAbnormal").show();
				return;
			}
			renderingComponent.getQueryGiftDataSucc(res);
			renderingComponent.sports = $(".gift").find(".giftAnimate");
			renderingComponent.sportsAnimate();
		} else {
			this.getQueryGiftDataError();
		}
	},
	getQueryGiftDataError: function() {
		$(".giftAbnormal").show();
		this.getIntegralCommonDataError();
	},
	getQueryGiftDataComplete: function(XMLHttpRequest, status) {
		status == "timeout" && this.getIntegralCommonDataError();
	},
	handleRiteEachTouchend: function(e) {
		renderingComponent.iscrollTouchendTransverse(e, function() {
			this.riteEachCurrDom = $(e.currentTarget);
			var index = this.riteEachCurrDom.index();
			this.activityCiftData = this.activityGiftArray[index];
			var myPoints = $(".headerUserMsgAllPointNum").html().replace(/,/g, "");
			var captchaImgUrl = $(".popupValidatePicBox").css("background-image");
			captchaImgUrl = captchaImgUrl.substring(captchaImgUrl.indexOf("(") + 2, captchaImgUrl.lastIndexOf(")") - 1);
			renderingComponent.scaleShakeAnimate(this.riteEachCurrDom, "scaleShakeAnimate");
			renderingComponent.popupStartAnimate($(".popup"));

			if(this.activityCiftData.state == 1 || this.activityCiftData.state == 2 ||
				this.activityCiftData.state == 3 || this.activityCiftData.state == 4) { //未开始
				this.popupFileTextFun("活动尚未开始", "活动尚未开始，敬请持续关注");
			} else if(this.activityCiftData.state == 6 || this.activityCiftData.state == 7) { //已结束
				this.popupFileTextFun("礼品已被抢光", "礼品已被抢光，欢迎兑换其他礼品");
			} else if(this.activityCiftData.state != 5) { //state状态错误
				this.popupFileTextFun("该礼品刚走丢", "该礼品刚走丢，请尝试兑换其他礼品");
			} else if(myPoints < this.activityCiftData.exchangePoint) { //积分不够
				this.popupFileTextFun("您的积分不足", "您的积分不足，无法兑换该礼品，经常访问华夏基金财富号有惊喜");
			} else if(this.activityCiftData.isExchangeToday) { //当天已经兑换了该礼品
				this.popupFileTextFun("限时礼品每人每周限兑一个", "您本周已兑换该礼品");
			} else if(!captchaImgUrl || !this.activityCiftData.captcha) { //没有验证码图片和验证码
				this.popupFileTextFun("验证码获取失败", "验证码获取失败，请关闭弹窗后再次尝试");
			} else {
				$(".popupValidateBtn").css({
					"left": "0px",
					"background-image": "url(./img/captcha_move.png)"
				});
				$(".popupValidateHighlight").css("width", $(".popupValidateHighlight").height());

				renderingComponent.popupContainerStartAnimate($(".popupValidate"));
				$(".popupValidateTip").css("opacity", 0).animate({
					"opacity": 1
				}, 1000)
				this.scaleAnimate();
			}

		}.bind(this));
	},
	popupFileTextFun: function(title, desc) {
		$(".popupCommonTitle").html(title);
		$(".popupCommonDesc").html(desc);
		renderingComponent.popupContainerStartAnimate($(".popupCommon"));
	},
	scaleAnimate: function() {
		renderingComponent.popupStartAnimate($(".popup"));
		renderingComponent.scaleShakeAnimate($(".popupValidatePicBox"), "scaleAnimate");

		var captcha = parseInt(this.riteEachCurrDom.attr("captcha"));
		renderingComponent.validataAbsolute(captcha);
	},
	handleRiteAndGiftIconTouchend: function(e) {
		renderingComponent.iscrollTouchendTransverse(e, function() {
			var current = $(e.currentTarget);
			var index = $(e.currentTarget).parent().index();
			var currDom = $(".riteEach").eq(index);
			var bg = current.children().length <= 0 ? current.css("background-image") : current.children().eq(0).css("background-image");
			var giftName = current.attr("giftName");
			var description = current.attr("description");
			bg = bg.substring(bg.indexOf("(") + 2, bg.lastIndexOf(")") - 1);
			$(".popupPerfectIcon img").attr("src", bg);
			$('.popupPrizeDetailTitle').html(giftName);
			$(".popupPrizeDetailDesc").html(description);
			renderingComponent.popupStartAnimate($(".popup"));
			renderingComponent.scaleShakeAnimate(currDom, "scaleShakeAnimate");
			renderingComponent.popupContainerStartAnimate($(".popupPrizeDetail"));
		}.bind(this))
	},
	handleEarnPointsEachTouchend: function(e) {
		renderingComponent.iscrollTouchendVertical(e, function() {
			var current = $(e.currentTarget);
			var index = current.index();
			var businessList = renderingComponent.businessList;
			var isAlreadyRead = parseInt($(e.currentTarget).attr("isAlreadyRead"));
			if(!businessList[index].url) {
				return;
			}
			renderingComponent.scaleShakeAnimate(current, "scaleShakeAnimate");
			if(businessList[index].isAddPoint != "Y" || !!isAlreadyRead) {
				alert(businessList[index].url);
				return;
			}
			common_utils.requestDataFun({
				selfTestUrl: "json/addPoint.json",
				url: "/appPointActivity/addPoint.fopcors",
				data: {
					"businessType": businessList[index].businessType
				},
				success: $.proxy(this.getAddPointDataSucc, this, index),
				error: $.proxy(this.getAddPointDataError, this),
				complete: $.proxy(this.getAddPointDataComplete, this, index),
			});
		}.bind(this))
	},
	getAddPointDataSucc: function(index, res) {
		console.log(res)
		if(res.code == "0000") {
			$(".headerUserMsgTodayPointNum").html(res.data.todayPoints);
			$(".earnPointsEach").eq(index).find(".earnPointsEachTaskBtn").css("background-image", "url(./img/wancheng.png");
			renderingComponent.integralAddAnimate(parseInt($(".headerUserMsgAllPointNum").html()), res.data.myPoints);
		} else {
			this.getAddPointDataError();
		}
	},
	getAddPointDataError: function() {
		this.getIntegralCommonDataError();
	},
	getAddPointDataComplete: function(index, XMLHttpRequest, status) {
		status == "timeout" && this.getIntegralCommonDataError();
		alert(renderingComponent.businessList[index].url);
	},
	handleActicityLuckDrawTouchend: function(e) {
		renderingComponent.iscrollTouchendVertical(e, function() {
			alert("我要跳转积分利滚利快来试手气");
		}.bind(this))
	},
	handleGiftReturnBtnTouchend: function(e) {
		renderingComponent.iscrollTouchendVertical(e, function() {
			this.getActicityQueryData();
			this.integralWrapperAddAnimate();
			renderingComponent.sportsAnimate({
				"dom": $(".integralWrapper"),
				"startMarginTop": -window.innerHeight,
				"startOpacity": "1",
				"endMarginTop": "0",
				"endOpacity": "1",
				"speed": 600
			}, function() {
				$(".gift").hide();
			}.bind(this));
		}.bind(this));
	},
	handleGiftItemBtnTouchend: function(e) {
		this.giftIndex = $(e.currentTarget).parent().index();
		if($(e.currentTarget).attr("redeemCode")) {
			new CopyDomContent($(e.currentTarget), $(e.currentTarget).attr("redeemCode"));
			setTimeout(function() {
				renderingComponent.popupStartAnimate($(".floatingLayer"));
			}, 100)
			renderingComponent.popupContainerStartAnimate($(".floatingLayerCopySuccess"), "shakeAnimate");
		} else {
			setTimeout(function() {
				renderingComponent.popupStartAnimate($(".popup"));
			}, 100)
			renderingComponent.popupContainerStartAnimate($(".popupPerfect"));
		}
	},
	handlePopupValidateBtnTouchstart: function(e) {
		this.validateBtnLeft = $(e.currentTarget).offset().left + (e.touches[0].clientX - $(e.currentTarget).offset().left);
		this.validateHighlightWidth = $(".popupValidateHighlight").width();
	},
	handlePopupValidateBtnTouchmove: function(e) {
		var left = e.touches[0].clientX - this.validateBtnLeft;
		var max = $(".popupValidateBarCtr").width() - $(e.currentTarget).width();
		left = left <= 0 ? 0 : left >= max ? max : left;
		$(e.currentTarget).css("left", left);
		$(".popupValidateChip").css("left", left);
		$(".popupValidateHighlight").css("width", this.validateHighlightWidth + left);
		$(".popupValidateTip").css("opacity", 0);
	},
	handlePopupValidateBtnTouchend: function(e) {
		var popupValidateGapLeft = Math.round(parseFloat($(".popupValidateGap").css("left")))
		var popupValidateChipLeft = Math.round(parseFloat($(".popupValidateChip").css("left")))
		if(popupValidateChipLeft >= popupValidateGapLeft - 3 && popupValidateChipLeft <= popupValidateGapLeft + 3) {
			console.log("恭喜校验成功")
			var child = this.activityCiftData;
			$(".popupExchangeTitle span,.popupExchangeGiftTitle").html(child.giftName);
			$(".popupExchangeGift").addClass(("templateBg" + child.templateId) + (!!child.isTimeLimit ? " timeLimit" : ""));
			$(".popupExchangeGiftIcon").css("background-image", "url(" + child.picture + ")");
			$(".popupExchangeDesc span").html(child.exchangePoint);

			$(".popupValidateBtn").css("background-image", "url(./img/captcha_ok.png)");
			renderingComponent.popupContainerEndAnimate($(".popupValidate"), function() {
				renderingComponent.popupContainerStartAnimate($(".popupExchange"));
			});
		} else {

			$(".popupValidateBtn").css("background-image", "url(./img/captcha_error.png)").animate({
				"left": 0
			}, 500, function() {
				$(".popupValidateBtn").css("background-image", "url(./img/captcha_move.png)");
				$(".popupValidateTip").css("opacity", 1);
				this.scaleAnimate();
			}.bind(this))
			$(".popupValidateHighlight").css("background-color", "rgb(255, 175, 192)").animate({
				"width": this.validateHighlightWidth
			}, 500, function() {
				$(".popupValidateHighlight").css("background-color", "rgb(162, 220, 255)");
			}.bind(this))
			$(".popupValidateChip").animate({
				"left": "0px"
			}, 500)
			this.handlePopupValidateRefBtnTouchend();
		}
	},
	handlePopupExchangeBtnTouchend: function() {
		var activityId = this.activityCiftData.activityId;
		var giftId = this.activityCiftData.giftId;
		var captcha = this.activityCiftData.captcha;
		common_utils.requestDataFun({
			selfTestUrl: "json/redeemGift.json",
			url: "/appPointActivity/redeemGift.fopcors",
			data: {
				activityId: activityId,
				giftId: giftId,
				captcha: captcha
			},
			success: $.proxy(this.getRedeemGiftDataSucc, this),
			error: $.proxy(this.getRedeemGiftDataError, this),
			complete: $.proxy(this.getRedeemGiftDataComplete, this),
		});
	},
	getRedeemGiftDataSucc: function(res) {
		console.log(res);
		if(res.code == "0000") {
			renderingComponent.getRedeemGiftDataSucc(res, this.activityCiftData);
			renderingComponent.popupContainerEndAnimate($(".popupExchange"), function() {
				renderingComponent.popupContainerStartAnimate($(".popupSuccess"), "shakeTopAnimate");
			});
		} else if(res.code == 1100) { //验证码失效
			renderingComponent.popupStartAnimate($(".floatingLayer"));
			renderingComponent.popupContainerStartAnimate($(".floatingLayerQueryValidataError"), "shakeAnimate");
		} else {
			this.getRedeemGiftDataError();
		}
	},
	getRedeemGiftDataError: function() {
		console.log("error");
		this.getIntegralCommonDataError();
	},
	getRedeemGiftDataComplete: function(XMLHttpRequest, status) {
		status == "timeout" && this.getIntegralCommonDataError();
	},
	handlePopupSuccessBtnTouchend: function(e) {
		e.stopPropagation();
		new CopyDomContent($(e.currentTarget), $(e.currentTarget).prev().find("span").html());
		setTimeout(function() {
			renderingComponent.popupStartAnimate($(".floatingLayer"));
			renderingComponent.popupContainerStartAnimate($(".floatingLayerCopySuccess"), "shakeAnimate");
		}, 1000)
	},
	handlePopupCopySuccessCloseTouchend: function() {
		renderingComponent.popupContainerEndAnimate($(".popupCopySuccess"));
	},
	handlePopupSuccessConfirmMsgBtnTouchend: function() {
		var activityId = this.activityCiftData.activityId;
		var giftId = this.activityCiftData.giftId;
		this.validataUeseMsg({
			"userName": $(".popupSuccess .popupSuccessUserName"),
			"phoneNo": $(".popupSuccess .popupSuccessPhoneNo"),
			"address": $(".popupSuccess .popupSuccessAddress"),
			"activityId": activityId,
			"giftId": giftId
		})
	},
	handlePopupPerfectBtnTouchend: function(e) {
		this.perfectFlag = true;
		var activityId = $(".giftItem").eq(this.giftIndex).attr("activityId");
		var giftId = $(".giftItem").eq(this.giftIndex).attr("giftId");
		var requestId = $(".giftItem").eq(this.giftIndex).attr("requestId");
		this.validataUeseMsg({
			"userName": $(".popupPerfect .popupSuccessUserName"),
			"phoneNo": $(".popupPerfect .popupSuccessPhoneNo"),
			"address": $(".popupPerfect .popupSuccessAddress"),
			"activityId": activityId,
			"giftId": giftId,
			"requestId": requestId
		})
	},
	validataUeseMsg: function(userMsg) {
		if(!userMsg.userName.val()) {
			renderingComponent.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>请输入您的姓名</div>"
			});
			return;
		}
		if(userMsg.userName.val().length <= 1 || userMsg.userName.val().length > 10) {
			renderingComponent.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>姓名必须为2-10位中文/英文</div>"
			});
			return;
		}
		if(!/^[1][3,4,5,7,8][0-9]{9}$/.test(userMsg.phoneNo.val())) {
			renderingComponent.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>手机号码不符合规定（11位纯数字）</div>"
			});
			return;
		}
		if(!userMsg.address.val()) {
			renderingComponent.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>请输入完整的信息</div>"
			});
			return;
		}
		common_utils.requestDataFun({
			selfTestUrl: "json/saveMailingAddress.json",
			url: "/appPointActivity/saveMailingAddress.fopcors",
			data: $.extend({
				userName: userMsg.userName.val(),
				phoneNo: userMsg.phoneNo.val(),
				address: userMsg.address.val(),
				activityId: userMsg.activityId,
				giftId: userMsg.giftId
			}, this.perfectFlag ? {
				requestId: userMsg.requestId
			} : {}),
			success: $.proxy(this.getSaveMailingAddressDataSucc, this),
			error: $.proxy(this.getSaveMailingAddressDataError, this),
			complete: $.proxy(this.getSaveMailingAddressDataComplete, this),
		});
	},
	getSaveMailingAddressDataSucc: function(res) {
		if(res.code == "0000") {
			renderingComponent.popupStartAnimate($(".floatingLayer"));
			renderingComponent.popupContainerStartAnimate($(".floatingLayerKeepSuccess"), "shakeAnimate");
			if(this.perfectFlag) {
				this.perfectFlag = false;
				$(".giftItem").eq(this.giftIndex).find(".giftItemBtn").hide();
				$(".giftItem").eq(this.giftIndex).find(".giftItemDesc").html("准备发货中");
			}
		} else {
			this.getSaveMailingAddressDataError();
		}
	},
	getSaveMailingAddressDataError: function() {
		console.log("error");
		this.getIntegralCommonDataError();
	},
	getSaveMailingAddressDataComplete: function(XMLHttpRequest, status) {
		status == "timeout" && this.getIntegralCommonDataError();
	},
	handlePopupCloseTouchend: function(e) {
		var index = -1;
		for(var i = 0; i < $(e.currentTarget).children().length; i++) {
			if($(e.currentTarget).children().eq(i).css("display") == "block") {
				index = i;
				break;
			}
		}
		var current = $(e.currentTarget).children().length <= 0 ? $(e.currentTarget).parent() : $(e.currentTarget).children().eq(index);
		renderingComponent.popupContainerEndAnimate(current, function() {
			renderingComponent.popupEndAnimate($(".popup"));
		});
	},
	handleStopPropagationTouchend: function(e) {
		e.stopPropagation();
	},
	handleFloatingLayerCloseTouchend: function(e) {
		var floatIndex = -1;
		var popupDom = -1;
		for(var i = 0; i < $(e.currentTarget).children().length; i++) {
			if($(e.currentTarget).children().eq(i).css("display") == "block") {
				floatIndex = i;
				break;
			}
		}
		for(var i = 0; i < $(".popupContainer").length; i++) {
			if($(".popupContainer").eq(i).css("display") == "block") {
				popupDom = $(".popupContainer").eq(i);
				break;
			}
		}
		var floatCurrent = $(e.currentTarget).children().length <= 0 ? $(e.currentTarget).parent() : $(e.currentTarget).children().eq(floatIndex);
		var flag = floatCurrent.attr("off") == "all";
		if(flag) {
			renderingComponent.popupContainerEndAnimate(popupDom, function() {
				renderingComponent.popupEndAnimate($(".popup"));
			});
		}
		renderingComponent.popupContainerEndAnimate(floatCurrent, function() {
			renderingComponent.popupEndAnimate($(".floatingLayer"));
		});
	},
	handlePopupErrorBtnTouchend: function() {
		location.href = location.href;
	},
	handlePopupValidateRefBtnTouchend: function() {
		$(".popupValidateBtn").css({
			"left": "0px",
			"background-image": "url(./img/captcha_move.png)"
		});
		$(".popupValidateHighlight").css("width", $(".popupValidateHighlight").height());
		$(".popupValidateBarCtr").css("opacity", 0).animate({
			"opacity": 1
		}, 1000)
		this.scaleAnimate();
		this.refreshVerification();
	},
	refreshVerification: function() {
		var activityId = this.activityCiftData.activityId;
		common_utils.requestDataFun({
			selfTestUrl: "json/singleGiftQuery.json",
			url: "/appPointActivity/singleGiftQuery.fopcors",
			data: {
				activityId: activityId
			},
			success: $.proxy(this.getSingleGiftQueryDataSucc, this),
			error: $.proxy(this.getSingleGiftQueryDataError, this),
			complete: $.proxy(this.getSingleGiftQueryDataComplete, this),
		});
	},
	getSingleGiftQueryDataSucc: function(res) {
		console.log(res)
		if(res.code == "0000") {
			this.activityCiftData.captcha = res.data.captcha;
			var captcha = res.data.captcha;
			renderingComponent.validataAbsolute(captcha);
		} else {
			this.getSingleGiftQueryDataError();
		}
	},
	getSingleGiftQueryDataError: function() {
		console.log("error");
		this.getIntegralCommonDataError();
	},
	getSingleGiftQueryDataComplete: function(XMLHttpRequest, status) {
		status == "timeout" && this.getIntegralCommonDataError();
	},
	getIntegralCommonDataError: function() {
		renderingComponent.popupStartAnimate($(".floatingLayer"));
		renderingComponent.popupContainerStartAnimate($(".floatingLayerAbnormal"));
	}
});
new Page();