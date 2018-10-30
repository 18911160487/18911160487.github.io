function Page() {
	this.integralWrapper = $("#integralWrapper");
	this.riteScroller = $(".riteScroller");
	this.y = 0;
	this.integralWrapperArr = []; //用来存储页面滚动数据
	this.riteWrapperArr = []; //用来存储页面横向滚动数据
	this.businessList = []; //用来储存赚积分列表数据
	this.init()
}
$.extend(Page.prototype, {
	init: function() {
		this.resizeDomStyle();
		this.isUserLogin();
		//this.getActicityQueryData();
		//this.integralWrapperAddAnimate();
		//this.getQueryGiftData();
		this.bindEvents()
	},
	isUserLogin: function() { //用户是否登录接口
		common_utils.requestDataFun({
			selfTestUrl: "json/authorize.json",
			url: "/slotMachine/authorize",
			success: $.proxy(this.isUserLoginSuccess, this),
			error: $.proxy(this.isUserLoginError, this)
		});
	},
	isUserLoginSuccess: function(res) {
		if(res.code == '0000') { //已登录
			this.getActicityQueryData();
			setTimeout(function() {
				this.integralWrapperAddAnimate();
			}.bind(this), 800)
		} else if(res.code == '0002') { //未登录
			$('#login').show().load('login/login.html');
		} else {
			this.shieldlayerToast({ //html， dom, speed, flag
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
		var timer = setInterval(function() {
			$(".loadingContent").html(++num + "%");
			if(num >= 100) {
				clearInterval(timer);
				$(".loadingContent").html("100%").parent().hide();
			}
		}.bind(this), 10)

		/*setTimeout(function() {
			this.integralWrapper.css("height", window.innerHeight)
			new IScroll("#integralWrapper");
		}.bind(this), 700)*/
	},
	integralWrapperAddAnimate: function() {
		this.sports = this.integralWrapper.find(".rite,.earnPoints,.rule");
		this.sportsAnimate();
		setTimeout(function() {
			this.integralWrapper.css("height", window.innerHeight);
			/*页面y轴滚动*/
			this.integralWrapperIscroll = new IScroll("#integralWrapper");
			$(".integralWrapper").on("touchmove", $.proxy(this.handleIntegralWrapperTouchmove, this));
			$(".integralWrapper").on("touchend", $.proxy(this.handleIntegralWrapperTouchend, this));
		}.bind(this), 1000)
	},
	handleIntegralWrapperTouchmove: function(e) {
		this.integralWrapperArr.push(e.touches[0].clientY);
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
			beforeSend: $.proxy(this.getActicityQueryDataBeforeSend, this),
			success: $.proxy(this.getActicityQueryDataSucc, this),
			error: $.proxy(this.getActicityQueryDataError, this),
			complete: $.proxy(this.getActicityQueryDataComplete, this),
		});
	},
	getActicityQueryDataSucc: function(res) {
		console.log(res)
		if(res.code == "0000") {
			this.activityGiftArray = res.data.activityGiftArray;
			var alreadyReadTypeArray = res.data.alreadyReadTypeArray,
				businessList = res.data.businessList,
				riteHtml = "",
				earnPointsHtml = "";
			for(var i = 0; i < 4; i++) {
				this.businessList[i] = {};
				this.businessList[i] = $.extend(alreadyReadTypeArray[i], businessList[i])
			}

			$(".headerUserMsgUserAvatar").css("background-image", "url(" + res.data.avatar + ")");
			$(".headerUserMsgUserName").html(res.data.userName);
			$(".headerUserMsgAllPointNum").html(res.data.myPoints);
			$(".headerUserMsgTodayPointNum").html(res.data.todayPoints);
			$(".riteDesc").html(res.data.tips);
			$(".popupValidatePicBox").css("background-image", "url(" + res.data.captchaImgUrl + ")");

			for(var i = 0; i < this.activityGiftArray.length; i++) {
				riteHtml += `<div class="rite-each riteEach fl templateBg${this.activityGiftArray[i].templateId}" 
						captcha=${this.activityGiftArray[i].captcha}>
					<div class="rite-each-gift-title riteEachGiftTitle"></div>
					<div class="rite-each-gift-icon riteEachGiftIcon"></div>
					<div class="rite-each-gift-surplus riteEachGiftSurplus"></div>
					<div class="rite-each-gift-status riteEachGiftStatus"><span></span></div>
					<div class="rite-each-gift-btn">
						<div class="rite-each-integral riteEachIntegral"></div>
						<div class="rite-each-status riteEachStatus"></div>
					</div>
				</div>`;
			}
			for(var i = 0; i < this.businessList.length; i++) {
				earnPointsHtml += `<div class="earnPoints-each earnPointsEach clear">
					<img class="earnPoints-each-taskIcon fl" src="${this.businessList[i].icon}">
					<div class="earnPoints-each-taskBtn fr" style="background-image: 
						url(./img/${!!this.businessList[i].isAlreadRead ? "wancheng" : "qukankan"}.png)"></div>
					<div class="earnPoints-each-taskInfo">
						<div class="earnPoints-each-taskTitle">${this.businessList[i].title}</div>
						<div class="earnPoints-each-taskIntegral">${this.businessList[i].description}</div>
					</div>
				</div>`;
			}
			this.riteScroller.html(riteHtml);
			$(".earnPointsContainer").html(earnPointsHtml);
			!!earnPointsHtml && $(".earnPoints").show();
			this.riteEach = this.riteScroller.find(".riteEach");
			$(".riteScroller").css("width", this.riteEach.eq(0).outerWidth(true) * this.riteEach.length);
			for(var i = 0; i < this.riteEach.length; i++) {
				this.refreshStyle(this.riteEach.eq(i), i);
			}
			/*积分兑好礼横向滚动*/
			this.riteWrapperIscroll = new IScroll("#riteWrapper", {
				scrollX: true
			})
			$(".riteWrapper").on("touchmove", $.proxy(this.handleRiteWrapperTouchmove, this));
		} else {
			$(".riteScroller").append($(".riteAbnormal").clone().show()).find(".riteAbnormal").show();
		}
	},
	handleRiteWrapperTouchmove: function(e) {
		this.riteWrapperArr.push(e.touches[0].clientY);
	},
	refreshStyle: function(current, index) {
		var currData = this.activityGiftArray[index],
			startHour = parseInt(currData.currentTime.substring(11, 13)),
			riteEachGiftSurplusHtml = "",
			riteEachGiftStatusHtml = "",
			riteEachStatusHtml = "";
		if(currData.state == 1) { //1 待发布  2 发布中  3 发布中-提前预告  4 发布中-倒计时  5 发布中-活动进行中  6 活动结束  7 活动下线
			riteEachGiftStatusHtml = "该礼品待发布";
			riteEachStatusHtml = "未开始";
		} else if(currData.state == 2) {
			riteEachGiftStatusHtml = "该礼品发布中";
			riteEachStatusHtml = "发布中";
		} else if(currData.state == 3) {
			riteEachGiftStatusHtml = currData.startTime;
			riteEachStatusHtml = "未开始";
		} else if(currData.state == 4) {
			riteEachStatusHtml = "未开始";
			if(currData.isTimeLimit && startHour < 9) {
				riteEachGiftSurplusHtml = "9点场剩余：<span>" + currData.giftRestNum + "</span>";
				riteEachGiftStatusHtml = "9点场倒计时 <span>00:00:00</span>";
			} else if(currData.isTimeLimit && startHour >= 9 && startHour < 13 && currData.giftRestNum <= 0) {
				riteEachGiftSurplusHtml = "9点场剩余：<span>0</span>";
				riteEachGiftStatusHtml = "13点场倒计时 <span>00:00:00</span>";
			} else {
				riteEachGiftStatusHtml = "距开始 <span>00:00:00</span>";
			}
			this.countDownFun(current, index);
		} else if(currData.state == 5) {
			if(currData.isTimeLimit && startHour >= 9 && startHour < 13 && currData.giftRestNum > 0) {
				riteEachGiftSurplusHtml = "9点场剩余：<span>" + currData.giftRestNum + "</span>";
			} else if(currData.isTimeLimit && startHour >= 13 && startHour < 25 && currData.giftRestNum > 0) {
				riteEachGiftSurplusHtml = "13点场剩余：<span>" + currData.giftRestNum + "</span>";
			}
			riteEachGiftStatusHtml = "开抢";
			riteEachStatusHtml = currData.isExchangeToday ? "已兑换" : "兑换";
		} else if(currData.state == 6) {
			if(currData.isTimeLimit && startHour >= 13 && startHour < 25 && currData.giftRestNum <= 0) {
				riteEachGiftSurplusHtml = "13点场剩余：<span>0</span>";
				riteEachGiftStatusHtml = "已抢完";
				riteEachStatusHtml = "已抢完";
			} else {
				riteEachGiftStatusHtml = "活动结束下次再来";
				riteEachStatusHtml = "已结束";
			}
		} else if(currData.state == 7) {
			riteEachGiftStatusHtml = "活动已下线 下次再来";
			riteEachStatusHtml = "已结束";
		}
		$(current).addClass(currData.isTimeLimit ? "timeLimit" : "");
		$(current).find(".riteEachGiftTitle").html(currData.giftName);
		$(current).find(".riteEachGiftIcon").css("background-image", "url(" + currData.picture + ")");
		$(current).find(".riteEachGiftSurplus").html(riteEachGiftSurplusHtml ? riteEachGiftSurplusHtml :
			"剩余数量：<span>" + currData.giftRestNum + "</span>");
		$(current).find(".riteEachGiftStatus").html(riteEachGiftStatusHtml);
		$(current).find(".riteEachIntegral").html(currData.exchangePoint + "积分");
		$(current).find(".riteEachStatus").html(riteEachStatusHtml);
	},
	countDownFun: function(current, index) {
		var currData = this.activityGiftArray[index],
			startTime = new Date(currData.startTime.replace(/-/g, "/")).getTime(),
			currentTime = new Date(currData.currentTime.replace(/-/g, "/")).getTime(),
			times = (startTime - currentTime) / 1000,
			timer = setInterval(function() {
				var day = 0,
					hour = 0,
					minute = 0,
					second = 0; //时间默认值
				if(times > 0) {
					day = Math.floor(times / (60 * 60 * 24));
					hour = Math.floor(times / (60 * 60)) - (day * 24);
					minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
					second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
				}
				if(hour <= 9) hour = '0' + hour;
				if(minute <= 9) minute = '0' + minute;
				if(second <= 9) second = '0' + second;
				$(current).find(".riteEachGiftStatus span").html(hour + ':' + minute + ':' + second);
				if(times <= 0) { //时间到
					clearInterval(timer);
					currData.state = 5; //进行时
					this.refreshStyle(current, index);
				}
				times--;
			}.bind(this), 1000);
	},
	getActicityQueryDataError: function() {
		console.log("error");
	},
	getActicityQueryDataComplete: function(XMLHttpRequest, status) {
		$(".refresh").addClass("changeStyle");
		(status == "timeout" || status == "error") &&
		$(".riteScroller").append($(".riteAbnormal").clone().show()).find(".riteAbnormal").show();
		console.log("查询完成");
	},
	bindEvents: function() {
		$(".headerGift").on("touchend", $.proxy(this.handleHeaderGiftTouchend, this));
		$(".integralScroller").on("touchend", ".riteEach", $.proxy(this.handleRiteEachTouchend, this));
		$(".integralScroller").on("touchend", ".earnPointsEach", $.proxy(this.handleEarnPointsEachTouchend, this));
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
		$(".popupContainer .close,.popupKeepSuccessBtn").on("touchend", $.proxy(this.handlePopupCloseTouchend, this));
		$(".floatingLayer .close,.floatingLayer .btn").on("touchend", $.proxy(this.handleFloatingLayerCloseTouchend, this));
		/*$("#popupSuccessBtn").on("touchend", function() {
			var random = Math.random();
				new CopyDomContent($("#popupSuccessBtn"),random)
		}.bind(this));*/
	},
	handleHeaderGiftTouchend: function(e) {
		$(".gift").show();
		this.iscrollTouchendVertical(e, function() {
			$(".giftContainer").html("");
			this.getQueryGiftData();
			this.sportsAnimate({
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
			var html = "";
			if(res.data.length <= 0) {
				$(".giftAbnormal").show();
				return;
			}
			for(var i = 0; i < res.data.length; i++) {
				var child = res.data[i],
					giftItemDescHtml = "",
					redeemCode = "",
					giftItemBtnBg = "";

				if(child.giftType == "1") { //虚拟礼品
					giftItemDescHtml = "兑换码:" + child.virtualCode;
					redeemCode = child.virtualCode;
					giftItemBtnBg = "./img/copyBtn.png";
				} else if(child.giftType == "2") { //实物礼品
					if(!child.userAddress) { //没邮寄地址
						giftItemDescHtml = "准备发货中（地址需完善）";
						giftItemBtnBg = "./img/fillBtn.png";
					} else if(!child.expressNo) { //还没快递
						giftItemDescHtml = "准备发货中";
					} else { //发了快递
						giftItemDescHtml = child.expressName + "单号:" + child.expressNo;
						redeemCode = child.expressNo;
						giftItemBtnBg = "./img/copyBtn.png";
					}
				}
				html += `<div class="gift-item giftItem giftAnimate clear">
					<div class="gift-item-pic fl">
						<div class="gift-item-picIcon" style="background-image: url(${child.picture});"></div>
					</div>
					<div class="gift-item-btn giftItemBtn fr" redeemCode="${redeemCode}" 
						style="background-image: url(${giftItemBtnBg}); display: ${!!giftItemBtnBg ? "block" : "none"}"></div>
					<div class="gift-item-name">${child.giftName}</div>
					<div class="gift-item-desc giftItemDesc">${giftItemDescHtml}</div>
					<div class="gift-item-time">${child.receiveTime}</div>
				</div>`;

			}
			$(".giftContainer").html(html);
			this.sports = $(".gift").find(".giftAnimate");
			this.sportsAnimate();
		} else {
			this.getQueryGiftDataError();
		}
	},
	getQueryGiftDataError: function() {
		$(".giftAbnormal").show();
	},
	getQueryGiftDataComplete: function() {

	},
	handleRiteEachTouchend: function(e) {
		this.iscrollTouchendTransverse(e, function() { //transform: scale(0.4) eachActivityCift
			this.riteEachCurrDom = $(e.currentTarget);
			this.index = this.riteEachCurrDom.index();
			this.activityCiftData = this.activityGiftArray[this.index];
			var myPoints = $(".headerUserMsgAllPointNum").html().replace(/,/g, "");
			var captchaImgUrl = $(".popupValidatePicBox").css("background-image");
			captchaImgUrl = captchaImgUrl.substring(captchaImgUrl.indexOf("(") + 2, captchaImgUrl.lastIndexOf(")") - 1)

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
				$(".popupValidateBtn").css("background-image", "url(./img/captcha_move.png)");

				$(".popup").show().animate({
					"opacity": 1
				}, 200);
				this.riteEachCurrDom.addClass("scaleShakeAnimate");
				$(".popupValidate").show().siblings().hide().end().addClass("shakeAnimate");
				setTimeout(function() {
					this.riteEachCurrDom.removeClass("scaleShakeAnimate");
					$(".popupValidate").removeClass("shakeAnimate");
				}.bind(this), 1000)
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
		$(".popup").show().animate({
			"opacity": 1
		}, 200);
		$(".popupCommon").show().siblings().hide().end().addClass("shakeAnimate");
		setTimeout(function() {
			$(".popupCommon").removeClass("shakeAnimate");
		}.bind(this), 1000)
	},
	scaleAnimate: function() {
		$(".popup").show().animate({
			"opacity": 1
		}, 200);;
		$(".popupValidatePicBox").addClass("scaleAnimate");
		setTimeout(function() {
			$(".popupValidatePicBox").removeClass("scaleAnimate");
		}.bind(this), 1000)

		var captcha = parseInt(this.riteEachCurrDom.attr("captcha"));
		this.validataAbsolute(captcha);
	},
	handleEarnPointsEachTouchend: function(e) {
		this.iscrollTouchendTransverse(e, function() {
			var current = $(e.currentTarget);
			var index = current.index();

			if(!this.businessList[index].url) {
				return;
			}
			if(!this.businessList[index].isAddPoint) {
				alert(this.businessList[index].url);
				return;
			}

			current.addClass("scaleShakeAnimate");
			setTimeout(function() {
				current.removeClass("scaleShakeAnimate");
			}.bind(this), 1000)

			common_utils.requestDataFun({
				selfTestUrl: "json/addPoint.json",
				url: "/appPointActivity/addPoint.fopcors",
				success: $.proxy(this.getAddPointDataSucc, this, index),
				error: $.proxy(this.getAddPointDataError, this),
				complete: $.proxy(this.getAddPointDataComplete, this),
			});

		}.bind(this))
	},
	getAddPointDataSucc: function(index, res) {
		console.log(res, index)
		if(res.code == "0000") {
			$(".headerUserMsgTodayPointNum").html(res.data.todayPoints);
			$(".headerUserMsgAllPointNum").html(res.data.myPoints);
			alert(this.businessList[index].url);
		}
	},
	getAddPointDataError: function(res) {
		
	},
	getAddPointDataComplete: function(res) {
		
	},
	handleGiftReturnBtnTouchend: function(e) {
		this.iscrollTouchendVertical(e, function() {
			this.getActicityQueryData();
			this.integralWrapperAddAnimate();
			this.sportsAnimate({
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
		if($(e.currentTarget).attr("redeemCode")) {
			new CopyDomContent($(e.currentTarget), $(e.currentTarget).attr("redeemCode"));
			setTimeout(function() {
				$(".floatingLayer").show().animate({
					"opacity": 1
				}, 200);
			}, 100)
			$(".floatingLayerCopySuccess").show().siblings().hide().end().addClass("shakeAnimate");
			setTimeout(function() {
				$(".floatingLayerCopySuccess").removeClass("shakeAnimate");
			}.bind(this), 1000)
		} else {
			setTimeout(function() {
				$(".popup").show().animate({
					"opacity": 1
				}, 200);
			}, 100)
			$(".popupPerfect").show().siblings().hide().end().addClass("shakeAnimate");
			setTimeout(function() {
				$(".popupPerfect").removeClass("shakeAnimate");
			}.bind(this), 1000)
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
			console.log(this.activityCiftData)
			var child = this.activityCiftData;
			$(".popupExchangeTitle span,.popupExchangeGiftTitle").html(child.giftName);
			$(".popupExchangeGift").addClass(("templateBg" + child.templateId) + (!!child.isTimeLimit ? " timeLimit" : ""));
			$(".popupExchangeGiftIcon").css("background-image", "url(" + child.picture + ")");
			$(".popupExchangeDesc span").html(child.exchangePoint);

			$(".popupValidateBtn").css("background-image", "url(./img/captcha_ok.png)");
			$(".popupValidate").animate({
				"margin-top": "-500px",
				"opacity": 0
			}, 800, function() {
				$(".popupValidate").hide().css({
					"margin-top": "0",
					"opacity": 1
				})
				$(".popupExchange").show().siblings().hide().end().addClass("shakeAnimate");
				setTimeout(function() {
					$(".popupExchange").removeClass("shakeAnimate");
				}.bind(this), 1000)
			})
		} else {
			$(".popupValidateHighlight").css("background-color", "rgb(255, 175, 192)");
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
			//this.refreshVerification();
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
			if(res.data.giftType == "1") { //1-虚拟奖品  2-实物奖品
				$(".popupSuccess .materialObject").hide();
				$(".popupSuccessDescription span").html(res.data.virtualCode);
			} else if(res.data.giftType == "2") {
				$(".popupSuccess .fictitious").hide();
				$(".popupSuccessGiftTitle").html(this.activityCiftData.giftName);
				$(".popupSuccessGiftIcon").css("background-image", "url(" + this.activityCiftData.picture + ");")
				$(".popupSuccessUserName").val(res.data.userName);
				$(".popupSuccessPhoneNo").val(res.data.phoneNo);
				$(".popupSuccessAddress").val(res.data.address);
			}
			$(".popupExchange").animate({
				"margin-top": "-500px",
				"opacity": 0
			}, 800, function() {
				$(".popupExchange").hide().css({
					"margin-top": "0",
					"opacity": 1
				})
				$(".popupSuccess").show().siblings().addClass("shakeAnimate");
				setTimeout(function() {
					$(".popupSuccess").removeClass("shakeAnimate");
				}.bind(this), 1000)
			})
		} else if(res.code == 1100) { //验证码失效

		} else {

		}
	},
	getRedeemGiftDataError: function() {

	},
	getRedeemGiftDataComplete: function() {

	},
	handlePopupSuccessBtnTouchend: function(e) {
		new CopyDomContent($("#popupSuccessBtn"), $(".popupSuccessDescription span").html())
		setTimeout(function() {
			$(".floatingLayer").show().animate({
				"opacity": 1
			}, 200);
		}, 100)
		$(".floatingLayerCopySuccess").show().addClass("shakeAnimate");
		setTimeout(function() {
			$(".floatingLayerCopySuccess").removeClass("shakeAnimate");
		}.bind(this), 1000)
	},
	handlePopupCopySuccessCloseTouchend: function() {
		$(".popupCopySuccess").animate({
			"margin-top": "-500px",
			"opacity": 0
		}, 800, function() {
			$(".popupCopySuccess").hide().css({
				"margin-top": "0",
				"opacity": 1
			})
			$(".changePopup").hide().animate({
				"opacity": 0
			}, 200);
		})
	},
	handlePopupSuccessConfirmMsgBtnTouchend: function() {
		this.validataUeseMsg({
			"userName": $(".popupSuccess .popupSuccessUserName"),
			"phoneNo": $(".popupSuccess .popupSuccessPhoneNo"),
			"address": $(".popupSuccess .popupSuccessAddress")
		})
	},
	handlePopupPerfectBtnTouchend: function() {
		this.validataUeseMsg({
			"userName": $(".popupPerfect .popupSuccessUserName"),
			"phoneNo": $(".popupPerfect .popupSuccessPhoneNo"),
			"address": $(".popupPerfect .popupSuccessAddress")
		})
	},
	validataUeseMsg: function(userMsg) {
		if(!userMsg.userName.val()) {
			this.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>请输入您的姓名</div>"
			});
			return;
		}
		if(!/^[1][3,4,5,7,8][0-9]{9}$/.test(userMsg.phoneNo.val())) {
			this.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>手机号码不符合规定（11位纯数字）</div>"
			});
			return;
		}
		if(!userMsg.address.val()) {
			this.shieldlayerToast({ //html， dom, speed, flag
				"html": "<div>请输入完整的信息</div>"
			});
			return;
		}
		common_utils.requestDataFun({
			selfTestUrl: "json/saveMailingAddress.json",
			url: "/appPointActivity/saveMailingAddress.fopcors",
			data: {
				userName: userMsg.userName.val(),
				phoneNo: userMsg.phoneNo.val(),
				address: userMsg.address.val()
			},
			success: $.proxy(this.getSaveMailingAddressDataSucc, this),
			error: $.proxy(this.getSaveMailingAddressDataError, this),
			complete: $.proxy(this.getSaveMailingAddressDataComplete, this),
		});
	},
	getSaveMailingAddressDataSucc: function(res) {
		if(res.code == "0000") {
			$(".floatingLayer").show().animate({
				"opacity": 1
			}, 200);
			$(".floatingLayerKeepSuccess").show().siblings().addClass("shakeAnimate");
			setTimeout(function() {
				$(".floatingLayerKeepSuccess").removeClass("shakeAnimate");
			}.bind(this), 1000)
		}
	},
	getSaveMailingAddressDataError: function() {

	},
	getSaveMailingAddressDataComplete: function() {

	},
	handlePopupCloseTouchend: function() {
		$(".popupContainer").animate({
			"margin-top": "-500px",
			"opacity": 0
		}, 800, function() {
			$(".popupContainer").css({
				"margin-top": "0",
				"opacity": 1
			})
			$(".popup").hide().animate({
				"opacity": 0
			}, 200);
			$(".popupContainer").hide();
			$(".changePopup").hide().animate({
				"opacity": 0
			}, 200);
		})
	},
	handleFloatingLayerCloseTouchend: function(e) {
		var flag = $(e.currentTarget).parent().attr("off") == "all";
		if(flag) {
			$(".popupContainer").animate({
				"margin-top": "-500px",
				"opacity": 0
			}, 800, function() {
				$(".popupContainer").css({
					"margin-top": "0",
					"opacity": 1
				})
				$(".popup").hide().animate({
					"opacity": 0
				}, 200);
			})
		}
		$(".floatingLayerContainer").animate({
			"margin-top": "-500px",
			"opacity": 0
		}, 800, function() {
			$(".floatingLayerContainer").css({
				"margin-top": "0",
				"opacity": 1
			})
			$(".floatingLayer").hide().animate({
				"opacity": 0
			}, 200);
		})
	},
	handlePopupValidateRefBtnTouchend: function() {
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
			this.validataAbsolute(captcha);
		}
	},
	getSingleGiftQueryDataError: function() {
		console.log("error");
	},
	getSingleGiftQueryDataComplete: function() {

	},
	validataAbsolute: function(captcha) {
		var width = $(".popupValidatePicBox").width() - $(".popupValidateGap").outerWidth() * 2 - 2;
		var height = $(".popupValidatePicBox").height() - $(".popupValidateGap").outerWidth() - 2;
		var proportion = Math.sqrt(999999 / width / height);
		var left = captcha % (proportion * width) / proportion + $(".popupValidateGap").outerWidth();
		var top = captcha / (proportion * width) / proportion;
		$(".popupValidateGap").css({
			"left": left,
			"top": top
		})
		$(".popupValidateChip").css({
			"left": "3px",
			"top": top
		})
	},
	iscrollTouchendTransverse: function(e, fn) {
		e.preventDefault();
		e.stopPropagation();
		this.iscrollTouchendCallback(this.riteWrapperArr, function() {
			this.riteWrapperArr = [];
		}.bind(this), function() {
			this.riteWrapperArr = [];
			fn && fn();
		}.bind(this));
	},
	iscrollTouchendVertical: function(e, fn) {
		e.preventDefault();
		e.stopPropagation();
		this.iscrollTouchendCallback(this.integralWrapperArr, function() {
			this.integralWrapperArr = [];
		}.bind(this), function() {
			this.integralWrapperArr = [];
			fn && fn();
		}.bind(this));
	},
	sportsAnimate: function(sportsDom, fn) {
		var sportsDom = sportsDom || {};
		var dom = sportsDom.dom || this.sports;
		dom.css({
			"margin-top": sportsDom.startMarginTop || "70px",
			"opacity": sportsDom.startOpacity || 0
		})
		dom.animate({
			"margin-top": sportsDom.endMarginTop || "0",
			"opacity": sportsDom.endOpacity || 1
		}, sportsDom.speed || 900, function() {
			fn && fn();
		})
	},
	iscrollTouchendCallback: function(tempArr, clearTempArr, fn) {
		if(tempArr.length >= 2) {
			clearTempArr && clearTempArr();
			return;
		} else {
			fn && fn();
		}
	},
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
});
new Page();