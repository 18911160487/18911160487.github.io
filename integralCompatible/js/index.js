function Page() {
	this.integralWrapper = $("#integralWrapper");
	this.riteScroller = $(".riteScroller");
	this.businessList = []; //用来储存赚积分列表数据
	this.isLoadFlag = false;
	this.perfectFlag = false;
	this.isUserExchangeClickFlag = false;
	this.timer = null;
	this.y = 0;
	this.PopupValidateBtnHtml = -1;
	this.requestFlag = true; //防止用户短时间内多次点击
	this.riteSwiper = null;
	this.riteFlag = true;
	this.riteScrollerTransform = "matrix(1, 0, 0, 1, 0, 0)";
	this.currentActivityId = "";
	this.refreshEnd = false;
	this.init();
}
$.extend(Page.prototype, {
	init: function() {
		window.accountLoginSuccess = $.proxy(this.accountLoginSuccess, this);
		window.pageResume = $.proxy(this.pageResume, this);
		this.resizeDomStyle();
		this.isUserLogin();
		this.bindEvents();
	},
	pageResume: function() {
		this.init();
	},
	accountLoginSuccess: function() {
		location.href = location.href;
	},
	requestReturnFlagFun: function() {
		if(this.requestFlag) {
			this.requestFlag = false;
			return true;
		} else {
			return false;
		}
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
			//$(".loadingContent").html("100%").parent().hide(); //后期添加未登录页，这行代码可以删除
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
		$(".integralWrapper").show();
		$(".riteScroller").html("");
		$(".loadingContent").html("100%").parent().hide();
		this.integralWrapperAddAnimate();
		$(".riteScroller").append(renderingComponent.riteAbnormalDom);
		renderingComponent.popupStartAnimate($(".popup"))
		renderingComponent.popupContainerStartAnimate($(".popupError"));
	},
	resizeDomStyle: function() {
		$('#toast').load('common/page/toast.html');
		$(".popupPerfectDesc").before($(".popupSuccessMailForm").clone().removeClass("materialObject"));
		for(var i = 0, len = $(".headerProgressNum").length; i < len; i++) {
			$(".headerProgressNum").eq(i).css({
				"left": 100 / (len - 1) * i + "%",
				"background-image": "url(./img/progress/weiqiandao_" + (i + 1) + ".png)"
			})
		}
		//$(".loadingContent").html("0%").parent().show();
		var num = parseInt($(".loadingContent").html());
		this.timer = setInterval(function() {
			$(".loadingContent").html(++num + "%");
			if(num >= 99 || this.isLoadFlag) {
				clearInterval(this.timer);
				//$(".loadingContent").parent().hide();
			}
		}.bind(this), 10)
		this.appResume(); //app给提供的方法，点击左上角返回页面重新加载
	},
	appResume: function() {
		setTimeout(function() { //添加定时器的原因，因为页面有动画，必须等页面全部执行完，才能调用app该方法
			if(amcTools.isAmcfm() || amcTools.isAmchqt()) {
				//amcfm_utils.setResumeListener('{"isRefresh": "true", "funName": "pageResume"}');
				if(window.amcTools.isWKWebView()) {
					window.webkit.messageHandlers.amcfm_utils.postMessage({
						"setResumeListener": '{"isRefresh": "true", "funName": "pageResume"}'
					});
				} else {
					amcfm_utils.setResumeListener('{"isRefresh": "true", "funName": "pageResume"}');
				}
			}
		}.bind(this), 2000)
	},
	integralWrapperAddAnimate: function() {
		this.createScrollSwiper();
		renderingComponent.resizeSports(this.integralWrapper.find(".rite,.earnPoints,.rule"));
		if(!this.isUserExchangeClickFlag) {
			renderingComponent.sportsAnimate();
			//this.createScrollSwiper();
		} else {
			//this.createScrollSwiper();
		}
	},
	createScrollSwiper: function() {
		!!this.scrollSwiper && this.scrollSwiper.destroy(false);
		this.scrollSwiper = new Swiper('.swiper-scroll', {
			slidesOffsetBefore: 0,
			direction: 'vertical',
			freeMode: true,
			setWrapperSize: true,
			slidesPerView: 'auto',
			mousewheel: {
				releaseOnEdges: true,
			}
		})
		this.scrollSwiper.on("touchEnd", $.proxy(this.handleScrollSwiperTouchEnd, this));
		this.scrollSwiper.on("touchMove", $.proxy(this.handleScrollSwiperTouchMove, this));
		this.scrollSwiper.on("touchStart", $.proxy(this.handleScrollSwiperTouchStart, this));
	},
	handleScrollSwiperTouchEnd: function(e) {
		if(this.scrollSwiper.translate > 60) {
			this.scrollSwiper.setTransition(this.scrollSwiper.params.speed);
			this.scrollSwiper.setTranslate(60);
			this.scrollSwiper.allowTouchMove = false; //禁止触摸
			this.scrollSwiper.params.virtualTranslate = true; //定住不给回弹
			$(".refreshTip").html('刷新中...');
			this.getActicityQueryData();
		}
	},
	handleScrollSwiperTouchMove: function(e) {
		$(".refreshProgress").css({
			"-webkit-transform": "rotate(" + (this.scrollSwiper.translate * 15) + "deg)",
			"transform": "rotate(" + (this.scrollSwiper.translate * 15) + "deg)"
		});
		common_utils.funThrottle(function() {
			if(this.scrollSwiper.translate > 60) {
				$('.refreshTip').html('释放刷新');
			} else {
				$('.refreshTip').html('下拉刷新');
			}
		}.bind(this), 50)
	},
	handleScrollSwiperTouchStart: function(e) {
		if(this.refreshEnd) {
			$('.refreshTip').html('下拉刷新');
			this.refreshEnd = false;
		}
	},
	getActicityQueryData: function() {
		this.riteScrollerTransform = $(".riteScroller").css("transform") == "none" ? this.riteScrollerTransform : $(".riteScroller").css("transform");
		this.requestReturnFlagFun() && common_utils.requestDataFun({
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
			//当cms后台手动删除一个活动时，积分兑好礼板块横向滚动时最后面不会出现空白
			var translateX = this.riteScrollerTransform.replace(/(matrix\(|\)|\s)/g, "").split(",")[4];

			!!this.riteSwiper && this.riteSwiper.destroy(false);
			renderingComponent.getActicityQueryDataSucc(res);
			this.continuousCheckIn(res.data.dailyCheckinNum);

			$(".riteScroller").css("width", $(".riteScroller").width() >= $(".riteWrapper").width() ? $(".riteScroller").width() : $(".riteWrapper").width())
			var maxWidth = $(".riteWrapper").width() - $(".riteScroller").width();
			translateX = -translateX >= -maxWidth ? maxWidth : translateX;

			$(".riteScroller").css({
				"-webkit-transform": "matrix(1, 0, 0, 1, " + translateX + ", 0)",
				"transform": "matrix(1, 0, 0, 1, " + translateX + ", 0)"
			});

			//结束
			this.awaitLoadSucc(res);
			/*积分兑好礼横向滚动*/
			if($(".riteEach").length > 0) {
				this.riteSwiper = new Swiper('.rite-scroll', {
					slidesPerView: 'auto',
					freeMode: true,
				});
			}
		} else {
			this.getActicityQueryDataError();
		}
	},
	awaitLoadSucc: function(res) {
		this.riteFlag && renderingComponent.integralAddAnimate(0, res.data.myPoints);
		if(res.data.addPoints && res.data.addPoints > 0) {
			toast.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>签到+" + res.data.addPoints + "积分</div>",
			});
		}
	},
	continuousCheckIn: function(num) {
		for(var i = 0; i < num; i++) {
			$(".headerProgressNum").eq(i).css("background-image", "url(./img/progress/yiqiandao_" + (i + 1) + ".png)")
		}
		$(".headerProgressSpeed").css("width", (num - 1) * 25 + "%")
	},
	getActicityQueryDataError: function() {
		console.log("error");
		!!this.riteSwiper && this.riteSwiper.destroy(false);
		$(".riteScroller").html("").css("width", window.innerWidth).append(renderingComponent.riteAbnormalDom);
		renderingComponent.popupStartAnimate($(".popup"))
		renderingComponent.popupContainerStartAnimate($(".popupError"));
	},
	getActicityQueryDataComplete: function(XMLHttpRequest, status) {
		this.requestFlag = true;
		this.refreshEnd = true;
		this.isLoadFlag = true;
		this.loadingPageHide();
		status == "timeout" && this.getActicityQueryDataError();
		!!this.scrollSwiper && this.scrollSwiper.destroy(false);
		(status == "timeout" || status == "error") && $(".earnPoints").hide();
		this.integralWrapperAddAnimate();
		setTimeout(function() {
			this.isUserExchangeClickFlag = true;
		}.bind(this), 1000)
		this.riteFlag = true;
		setTimeout(function() {
			$('.refreshTip').html('下拉刷新');
		}, 300)
		this.scrollSwiper.allowTouchMove = true; //禁止触摸
		this.scrollSwiper.params.virtualTranslate = false; //定住不给回弹
		console.log("查询完成");
	},
	loadingPageHide: function() {
		clearInterval(this.timer);
		$(".loadingContent").html("100%");
		setTimeout(function() {
			$(".loadingContent").parent().hide();
		}, 200)
	},
	bindEvents: function() {
		$(renderingComponent).on("change", $.proxy(this.handleRenderingComponentChange, this));
		$(".integralWrapper,.riteScroller,.acticityLuckDraw,.earnPointsContainer,.gift").on("touchstart", $.proxy(this.handleContainerTouchstart, this));
		$(".integralWrapper,.riteScroller,.acticityLuckDraw,.earnPointsContainer,.gift").on("touchmove", $.proxy(this.handleContainerTouchmove, this));
		$(".integralWrapper,.riteScroller,.acticityLuckDraw,.earnPointsContainer,.gift").on("touchend", $.proxy(this.handleContainerTouchend, this));
		$(".headerGift").on("touchend", $.proxy(this.handleHeaderGiftTouchend, this));
		$(".integralScroller").on("touchend", ".riteEach", $.proxy(this.handleRiteEachTouchend, this));
		$(".integralScroller").on("touchend", ".riteEachGiftIcon", $.proxy(this.handleRiteAndGiftIconTouchend, this));
		$(".gift").on("touchend", ".giftItemPic", $.proxy(this.handleRiteAndGiftIconTouchend, this));
		$(".integralScroller").on("touchend", ".earnPointsEach", $.proxy(this.handleEarnPointsEachTouchend, this));
		$(".acticityLuckDraw").on("touchend", $.proxy(this.handleActicityLuckDrawTouchend, this));
		$(".giftReturnBtn").on("touchend", $.proxy(this.handleGiftReturnBtnTouchend, this));
		$(".giftContainer").on("touchend", ".giftItemBtn", $.proxy(this.handleGiftItemBtnTouchend, this));
		$(".popupValidateBtn").on("touchmove", $.proxy(this.handlePopupValidateBtnTouchmove, this));
		$(".popupValidateBtn").on("touchend", $.proxy(this.handlePopupValidateBtnTouchend, this));
		$(".popupValidateRefBtn").on("touchend", $.proxy(this.handlePopupValidateRefBtnTouchend, this));
		$(".popupExchangeBtn").on("touchend", $.proxy(this.handlePopupExchangeBtnTouchend, this));
		$(".popupSuccessBtn").on("touchend", $.proxy(this.handlePopupSuccessBtnTouchend, this));
		$(".popupCopySuccessClose,.popupCopySuccessBtn").on("touchend", $.proxy(this.handlePopupCopySuccessCloseTouchend, this));
		$(".popupSuccessConfirmMsgBtn").on("touchend", $.proxy(this.handlePopupSuccessConfirmMsgBtnTouchend, this));
		$(".popupPerfectBtn").on("touchend", $.proxy(this.handlePopupPerfectBtnTouchend, this));
		$(".popupCommonBtn").on("touchend", $.proxy(this.handlePopupCommonBtnTouchend, this));
		$(".popup,.popupContainer .close,.popupPrizeDetailBtn,.popupSuccessConfirm").on("touchend", $.proxy(this.handlePopupCloseTouchend, this));
		$(".floatingLayerContainer,.popupContainer").on("touchend", $.proxy(this.handleStopPropagationTouchend, this));
		$(".floatingLayerContainer,.popupContainer").on("touchmove", $.proxy(this.handleStopPropagationTouchend, this));
		$(".floatingLayerQueryValidataErrorBtn").on("touchend", $.proxy(this.handleFloatingLayerQueryValidataErrorBtnTouchend, this));
		$(".floatingLayer,.floatingLayer .close,.floatingLayer .btn").on("touchend", $.proxy(this.handleFloatingLayerCloseTouchend, this));
		$(".popupErrorBtn").on("touchend", $.proxy(this.handlePopupErrorBtnTouchend, this));
		$(".customerService").on("touchend", $.proxy(this.handleCustomerServiceTouchend, this));
	},
	handleRenderingComponentChange: function(e, index) {
		this.riteFlag = false;
		this.getActicityQueryData();
	},
	handleContainerTouchstart: function(e) {
		this.clientX = e.touches[0].clientX;
		this.clientY = e.touches[0].clientY;
		renderingComponent.userTouchstartClientXY(e.touches[0].clientX, e.touches[0].clientY);
	},
	handleContainerTouchmove: function(e) {
		this.clientX = e.touches[0].clientX;
		this.clientY = e.touches[0].clientY;
	},
	handleContainerTouchend: function() {
		this.handleScrollSwiperTouchEnd();
	},
	handleHeaderGiftTouchend: function(e) {
		if(renderingComponent.userTouchendClientXY(this.clientX, this.clientY)) {
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
		};
	},
	getQueryGiftData: function() {
		this.requestReturnFlagFun() && common_utils.requestDataFun({
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
			$(".giftAbnormal").hide();
			renderingComponent.getQueryGiftDataSucc(res);
			//renderingComponent.sports = $(".gift").find(".giftAnimate");
			renderingComponent.resizeSports($(".gift").find(".giftAnimate"));
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
		this.requestFlag = true;
		status == "timeout" && this.getIntegralCommonDataError();
	},
	handleRiteEachTouchend: function(e) {
		if(renderingComponent.userTouchendClientXY(this.clientX, this.clientY)) {
			this.riteEachCurrDom = $(e.currentTarget);
			this.riteIndex = this.riteEachCurrDom.index();
			this.activityCiftData = renderingComponent.activityGiftArray[this.riteIndex];
			var myPoints = $(".headerUserMsgAllPointNum").html().replace(/,/g, "");
			var captchaImgUrl = $(".popupValidatePicBox").css("background-image");
			captchaImgUrl = captchaImgUrl.substring(captchaImgUrl.indexOf("(") + 2, captchaImgUrl.lastIndexOf(")") - 1);
			renderingComponent.scaleShakeAnimate(this.riteEachCurrDom, "scaleShakeAnimate");
			renderingComponent.popupStartAnimate($(".popup"));
			if(this.activityCiftData.state == 1 || this.activityCiftData.state == 2 ||
				this.activityCiftData.state == 3 || this.activityCiftData.state == 4) { //未开始
				this.popupFileTextFun("活动尚未开始", "活动尚未开始，敬请持续关注");
			} else if(this.activityCiftData.state == 6 || this.activityCiftData.state == 7) { //已结束
				this.popupFileTextFun("该礼品已被抢光", "该礼品已被抢光，欢迎兑换其他礼品");
			} else if(this.activityCiftData.state != 5) { //state状态错误
				this.popupFileTextFun("该礼品刚走丢", "该礼品刚走丢，请尝试兑换其他礼品");
			} else if(myPoints < this.activityCiftData.exchangePoint) { //积分不够
				this.popupFileTextFun("您的积分不足", "您的积分不足，无法兑换该礼品，经常访问华夏基金APP有惊喜！");
			} else if(this.activityCiftData.isExchangeToday) { //当天已经兑换了该礼品
				this.popupFileTextFun("限时礼品每人每周限兑一个", "您本周已兑换该礼品");
			} else if(!captchaImgUrl || !this.activityCiftData.captcha) { //没有验证码图片和验证码
				this.popupFileTextFun("验证码获取失败", "验证码获取失败，请关闭弹窗后再次尝试");
			} else {
				$(".popupValidatePic").css({
					"left": "0px",
					"background-image": "url(./img/page/captcha_move.png)"
				});
				$(".popupValidateHighlight").css("width", $(".popupValidateHighlight").height());
				renderingComponent.popupContainerStartAnimate($(".popupValidate"));
				$(".popupValidateTip").css("opacity", 0).animate({
					"opacity": 1
				}, 1000)
				this.scaleAnimate();
			}
		}
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
		e.stopPropagation();
		if(renderingComponent.userTouchendClientXY(this.clientX, this.clientY)) {
			var current = $(e.currentTarget);
			$(".popupPerfectIcon img").attr("src", current.parent().attr("bigPicture"));
			$('.popupPrizeDetailTitle').html(current.parent().attr("giftName"));
			$(".popupPrizeDetailDesc").html(current.parent().attr("description"));
			renderingComponent.popupStartAnimate($(".popup"));
			$(e.currentTarget).parent().attr("class").indexOf("riteEach") != -1 &&
				renderingComponent.scaleShakeAnimate($(e.currentTarget).parent(), "scaleShakeAnimate");
			renderingComponent.popupContainerStartAnimate($(".popupPrizeDetail"));
		}
	},
	handleEarnPointsEachTouchend: function(e) {
		if(renderingComponent.userTouchendClientXY(this.clientX, this.clientY)) {
			var current = $(e.currentTarget);
			var index = current.index();
			var businessList = renderingComponent.businessList;
			var isAlreadyRead = parseInt($(e.currentTarget).attr("isAlreadyRead"));
			if(!businessList[index].url) {
				if(businessList[index].businessType == "findLion") {
					toast.shieldlayerToast({ //html， dom, speed, flag
						"html": "<div>" + (common_utils.isNewVersion ? "找大狮子得积分" : "请升级到管家4.5.0版本") + "</div>"
					});
				}
				return;
			}
			renderingComponent.scaleShakeAnimate(current, "scaleShakeAnimate");
			if(businessList[index].isAddPoint != "Y" || !!isAlreadyRead) {
				if(common_utils.platformType != "app" && businessList[index].businessType == "pointAnswer") {
					location.href = "./question.html";
				} else {
					location.href = businessList[index].url;
				}
				return;
			}
			this.requestReturnFlagFun() && common_utils.requestDataFun({
				selfTestUrl: "json/addPoint.json",
				url: "/appPointActivity/addPoint.fopcors",
				data: {
					"businessType": businessList[index].businessType
				},
				success: $.proxy(this.getAddPointDataSucc, this, index),
				error: $.proxy(this.getAddPointDataError, this),
				complete: $.proxy(this.getAddPointDataComplete, this, index),
			});
		}
	},
	getAddPointDataSucc: function(index, res) {
		console.log(res)
		if(res.code == "0000") {
			$(".headerUserMsgTodayPointNum").html(res.data.todayPoints);
			$(".earnPointsEach").eq(index).find(".earnPointsEachTaskBtn").css("background-image", "url(./img/page/wancheng.png");
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
		this.requestFlag = true;
		if(common_utils.platformType != "app" && renderingComponent.businessList[index].businessType == "pointAnswer") {
			location.href = "./question.html";
		} else {
			location.href = renderingComponent.businessList[index].url;
		}
	},
	handleActicityLuckDrawTouchend: function(e) {
		if(renderingComponent.userTouchendClientXY(this.clientX, this.clientY)) {
			var random = Math.random();
			location.href = "./luckDraw.html?random=" + random;
		}
	},
	handleGiftReturnBtnTouchend: function(e) {
		if(renderingComponent.userTouchendClientXY(this.clientX, this.clientY)) {
			renderingComponent.sportsAnimate({
				"dom": $(".integralWrapper"),
				"startMarginTop": -window.innerHeight,
				"startOpacity": "1",
				"endMarginTop": "0",
				"endOpacity": "1",
				"speed": 600
			}, function() {
				this.isUserExchangeClickFlag = true;
				$(".gift").hide();
				this.getActicityQueryData();
				this.integralWrapperAddAnimate();
			}.bind(this));
		}
		return false;
	},
	handleGiftItemBtnTouchend: function(e) {
		this.giftIndex = $(e.currentTarget).parent().index();
		var copyStr = $(e.currentTarget).attr("redeemCode");
		if(copyStr) {
			common_utils.platformType == "app" ? this.copyClipBoard(copyStr) : new CopyDomContent($(e.currentTarget), copyStr);
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
	copyClipBoard: function(copyStr) {
		if(amcTools.isAmcfm() || amcTools.isAmchqt()) {
			if(window.amcTools.isWKWebView()) {
				window.webkit.messageHandlers.amcfm_utils.postMessage({
					"copyClipBoard": '{"text": "' + copyStr + '"}'
				});
			} else {
				amcfm_utils.copyClipBoard('{"text": "' + copyStr + '"}');
			}
		}
	},
	handlePopupValidateBtnTouchmove: function(e) {
		var ratio = ($(".popupValidateBarCtr").width() - $('.popupValidatePic').width()) / 100;
		this.PopupValidateBtnHtml = $(e.currentTarget).val();
		$(".popupValidateHighlight").css("width", $(e.currentTarget).val() * ratio + 24 + "px");
		$(".popupValidatePic,.popupValidateChip").css("left", $(e.currentTarget).val() * ratio);
		$(".popupValidateTip").css("opacity", 0);
	},
	handlePopupValidateBtnTouchend: function(e) {
		if(this.PopupValidateBtnHtml < 0) { //没有拖动直接返回
			return;
		}
		var popupValidateGapLeft = Math.round(parseFloat($(".popupValidateGap").css("left")))
		var popupValidateChipLeft = Math.round(parseFloat($(".popupValidateChip").css("left")))
		if(popupValidateChipLeft >= popupValidateGapLeft - 3 && popupValidateChipLeft <= popupValidateGapLeft + 3) {
			var child = this.activityCiftData;
			$(".popupExchangeTitle span,.popupExchangeGiftTitle").html(child.giftName);
			$(".popupExchangeGift").addClass(("templateBg" + child.templateId) + (!!child.isTimeLimit ? " timeLimit" : ""));
			$(".popupExchangeGiftIcon").css("background-image", "url(" + child.picture + ")");
			$(".popupExchangeDesc span").html(child.exchangePoint);

			$(".popupValidatePic").css("background-image", "url(./img/page/captcha_ok.png)");
			renderingComponent.popupContainerEndAnimate($(".popupValidate"), function() {
				renderingComponent.popupContainerStartAnimate($(".popupExchange"));
			});
		} else {
			$(".popupValidatePic").css("background-image", "url(./img/page/captcha_error.png)").animate({
				"left": 0
			}, 500, function() {
				$(".popupValidatePic").css("background-image", "url(./img/page/captcha_move.png)");
				$(".popupValidateTip").css("opacity", 1);
				renderingComponent.scaleShakeAnimate($(".popupValidatePicBox"), "scaleAnimate");
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
		$(e.currentTarget).val("0");
	},
	handlePopupExchangeBtnTouchend: function() {
		var activityId = this.activityCiftData.activityId;
		var giftId = this.activityCiftData.giftId;
		var captcha = this.activityCiftData.captcha;
		this.requestReturnFlagFun() && common_utils.requestDataFun({
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
			$(".popupSuccessGift").removeClass("templateBg1,templateBg2,templateBg3")
				.addClass(("templateBg" + this.activityCiftData.templateId) + (!!this.activityCiftData.isTimeLimit ? " timeLimit" : ""));
			$(".popupSuccessGiftIcon").css("background-image", "url(" + renderingComponent.activityGiftArray[this.riteIndex].picture + ")");
			renderingComponent.getRedeemGiftDataSucc(res, this.activityCiftData);
			renderingComponent.popupContainerEndAnimate($(".popupExchange"), function() {
				renderingComponent.popupContainerStartAnimate($(".popupSuccess"), "shakeTopAnimate");
			});
		} else if(res.code == "1100" || res.code == "1999") { //1999表示礼品已抢完
			$(".floatingLayerQueryValidataErrorDesc").html(res.msg);
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
		this.requestFlag = true;
		status == "timeout" && this.getIntegralCommonDataError();
		status == "success" && this.getActicityQueryData();
	},
	handlePopupSuccessBtnTouchend: function(e) {
		e.stopPropagation();
		var copyStr = $(e.currentTarget).prev().find("span").html();
		common_utils.platformType == "app" ? this.copyClipBoard(copyStr) : new CopyDomContent($(e.currentTarget), copyStr);
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
		if(this.validataUeseMsgFun(!userMsg.userName.val(), "请输入您的姓名") ||
			this.validataUeseMsgFun(userMsg.userName.val().length <= 1 || userMsg.userName.val().length > 10, "姓名必须为2-10位字符") ||
			this.validataUeseMsgFun(!userMsg.phoneNo.val(), "请输入手机号码（11位纯数字）") ||
			this.validataUeseMsgFun(!/^[1][3,4,5,7,8][0-9]{9}$/.test(userMsg.phoneNo.val()), "手机号码不符合规定（11位纯数字）") ||
			this.validataUeseMsgFun(!userMsg.address.val(), "请输入完整的信息")) {
			return;
		}
		this.requestReturnFlagFun() && common_utils.requestDataFun({
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
	validataUeseMsgFun: function(condition, answer) {
		if(condition) {
			toast.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>" + answer + "</div>"
			});
			return true;
		}
		return false;
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
		this.requestFlag = true;
		status == "timeout" && this.getIntegralCommonDataError();
	},
	handlePopupCommonBtnTouchend: function(e) {
		this.handlePopupCloseTouchend(e);
		//this.getActicityQueryData();
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
	handleFloatingLayerQueryValidataErrorBtnTouchend: function(e) {
		this.handleFloatingLayerCloseTouchend(e, true);
	},
	handleFloatingLayerCloseTouchend: function(e, falg) {
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
		var flag = falg || floatCurrent.attr("off") == "all";
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
	handleCustomerServiceTouchend: function() {
		location.href = "amcfm://extra/loginBrowse?title=在线客服&url=https://a.chinaamc.com/mtrading-fm/web/newAi";
	},
	handlePopupValidateRefBtnTouchend: function() {
		$(".popupValidatePic").css({
			"left": "0px",
			"background-image": "url(./img/page/captcha_move.png)"
		});
		$(".popupValidateHighlight").css("width", $(".popupValidateHighlight").height());
		$(".popupValidateBarCtr").css("opacity", 0).animate({
			"opacity": 1
		}, 1000)
		renderingComponent.scaleShakeAnimate($(".popupValidatePicBox"), "scaleAnimate");
		this.refreshVerification();
	},
	refreshVerification: function() {
		var activityId = this.activityCiftData.activityId;
		this.requestReturnFlagFun() && common_utils.requestDataFun({
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
			this.activityCiftData = res.data;
			renderingComponent.refreshStyle(renderingComponent.riteEach.eq(this.riteIndex), this.riteIndex);
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
		this.requestFlag = true;
		status == "timeout" && this.getIntegralCommonDataError();
	},
	getIntegralCommonDataError: function() {
		renderingComponent.popupStartAnimate($(".floatingLayer"));
		renderingComponent.popupContainerStartAnimate($(".floatingLayerAbnormal"));
	}
});
var page = new Page();