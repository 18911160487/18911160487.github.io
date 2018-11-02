function RenderingComponent() {
	this.integralWrapperArr = []; //用来存储页面滚动数据
	this.riteWrapperArr = []; //用来存储页面横向滚动数据
	this.riteScroller = $(".riteScroller");
	this.businessList = [];
	this.init();
}
$.extend(RenderingComponent.prototype, {
	init: function() {
		//this.integralAddAnimate(1, 10000)
	},
	getActicityQueryDataSucc: function(res) {
		this.activityGiftArray = res.data.activityGiftArray;
		this.alreadyReadTypeArray = res.data.alreadyReadTypeArray;
		this.businessList = res.data.businessList;
		var riteHtml = "",
			earnPointsHtml = "";
		$(".headerUserMsgUserAvatar").css("background-image", "url(" + res.data.avatar + ")");
		$(".headerUserMsgUserName").html(res.data.nickName);
		$(".headerUserMsgTodayPointNum").html(res.data.todayPoints);
		$(".riteDesc").html(res.data.tips);
		$(".popupValidatePicBox").css("background-image", "url(" + res.data.captchaImgUrl + ")");
		if(this.activityGiftArray.length <= 0) {
			$(".riteScroller").append($(".riteAbnormal").clone().show()).find(".riteAbnormal").show();
		}
		for(var i = 0; i < this.activityGiftArray.length; i++) {
			var child = this.activityGiftArray[i];
			riteHtml += `<div class="rite-each riteEach swiper-slide fl templateBg${child.templateId}" 
						captcha=${child.captcha}>
					<div class="rite-each-gift-title riteEachGiftTitle"></div>
					<div class="rite-each-gift-icon riteEachGiftIcon" giftName="${child.giftName}" description="${child.description}"></div>
					<div class="rite-each-gift-surplus riteEachGiftSurplus"></div>
					<div class="rite-each-gift-status riteEachGiftStatus"><span></span></div>
					<div class="rite-each-gift-btn">
						<div class="rite-each-integral riteEachIntegral"></div>
						<div class="rite-each-status riteEachStatus"></div>
					</div>
				</div>`;
		}
		for(var i = 0; i < this.businessList.length; i++) {
			var child = this.businessList[i];
			earnPointsHtml += `<div class="earnPoints-each earnPointsEach clear" isAlreadyRead="0" businessType="${child.businessType}">
					<img class="earnPoints-each-taskIcon fl" src="${child.icon}">
					<div class="earnPoints-each-taskBtn earnPointsEachTaskBtn fr" style="background-image: url(./img/qukankan.png"></div>
					<div class="earnPoints-each-taskInfo">
						<div class="earnPoints-each-taskTitle">${child.title}</div>
						<div class="earnPoints-each-taskIntegral">${child.description}</div>
					</div>
				</div>`;
		}!!riteHtml && this.riteScroller.html(riteHtml);
		$(".earnPointsContainer").html(earnPointsHtml);
		!!earnPointsHtml && $(".earnPoints").show();
		this.riteEach = this.riteScroller.find(".riteEach");
		if($(".earnPoints").css("display") == "block") {
			for(var i = 0; i < $(".earnPointsEach").length; i++) {
				for(var j = 0; j < this.alreadyReadTypeArray.length; j++) {
					var businessType = $(".earnPointsEach").eq(i).attr("businessType");
					
					var flag = !!this.alreadyReadTypeArray[j].isAlreadyRead && this.alreadyReadTypeArray[j].businessType == businessType;
					if(flag) {
						$(".earnPointsEach").eq(i).attr("isAlreadyRead", 1);
						$(".earnPointsEachTaskBtn").eq(i).css("background-image", `url(./img/wancheng.png)`);
						break;
					}
					
				}
			}
		}
		console.log(this.riteEach.eq(0).outerWidth(true) * this.riteEach.length)
		$(".riteScroller").css("width", this.riteEach.eq(0).outerWidth(true) * this.riteEach.length);
		
		for(var i = 0; i < this.riteEach.length; i++) {
			this.refreshStyle(this.riteEach.eq(i), i);
		}
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
	getQueryGiftDataSucc: function(res) {
		var html = "";
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
			html += `<div class="gift-item giftItem giftAnimate clear" activityId="${child.activityId}" giftId="${child.giftId}" requestId="${child.requestId}">
					<div class="gift-item-pic giftItemPic fl" giftName="${child.giftName}" description="${child.description}">
						<div class="gift-item-picIcon giftItemPicIcon" style="background-image: url(${child.picture});"></div>
					</div>
					<div class="gift-item-btn giftItemBtn fr" redeemCode="${redeemCode}" 
						style="background-image: url(${giftItemBtnBg}); display: ${!!giftItemBtnBg ? "block" : "none"}"></div>
					<div class="gift-item-name">${child.giftName}</div>
					<div class="gift-item-desc giftItemDesc">${giftItemDescHtml}</div>
					<div class="gift-item-time">${child.receiveTime}</div>
				</div>`;
		}
		$(".giftContainer").html(html);
	},
	getRedeemGiftDataSucc: function(res, activityCiftData) {
		if(res.data.businessType == "1") { //1-虚拟奖品  2-实物奖品
			$(".popupSuccess .materialObject").hide();
			$(".popupSuccessDescription span").html(res.data.virtualCode);
		} else if(res.data.businessType == "2") {
			$(".popupSuccess .fictitious").hide();
			$(".popupSuccessGiftTitle").html(activityCiftData.giftName);
			$(".popupSuccessGiftIcon").css("background-image", "url(" + activityCiftData.picture + ");")
			$(".popupSuccessUserName").val(res.data.userName);
			$(".popupSuccessPhoneNo").val(res.data.phoneNo);
			$(".popupSuccessAddress").val(res.data.address);
		}
	},
	scaleShakeAnimate: function(scaleShakeDom, className) {
		scaleShakeDom.addClass(className);
		setTimeout(function() {
			scaleShakeDom.removeClass(className);
		}.bind(this), 1000)
		return this;
	},
	popupStartAnimate: function(popupDom, fn) {
		popupDom.show().animate({
			"opacity": 1
		}, 300, function() {
			fn && fn();
		}.bind(this));
		return this;
	},
	popupEndAnimate: function(popupDom, fn) {
		popupDom.animate({
			"opacity": 0
		}, 200, function() {
			popupDom.hide();
			fn && fn();
		}.bind(this));
		return this;
	},
	popupContainerStartAnimate: function(popupContainerDom, className, fn) {
		var className = className || "shakeAnimate";
		popupContainerDom.show().siblings().hide().end().addClass(className);
		setTimeout(function() {
			popupContainerDom.removeClass(className);
			fn && fn();
		}.bind(this), 1000)
		return this;
	},
	popupContainerEndAnimate: function(popupContainerDom, fn) {
		popupContainerDom.animate({
			"margin-top": "-500px",
			"opacity": 0
		}, 800, function() {
			popupContainerDom.css({
				"margin-top": "0",
				"opacity": 1
			}).hide();
			fn && fn();
		}.bind(this))
		return this;
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
		return this;
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
	integralAddAnimate: function(beforeNum, nowNum) {
		var difference = nowNum - beforeNum;
		var speed = Math.ceil(difference >= 0 ? difference / 140 : -difference / 140);
		var timer = setInterval(function() {
			$(".headerUserMsgAllPointNum").html(this.splitNum(beforeNum));
			if(beforeNum >= nowNum) {
				clearInterval(timer);
			}
			beforeNum = ((beforeNum + speed) >= nowNum ? nowNum : (beforeNum + speed));
		}.bind(this), 10)
	},
	splitNum: function(num) {
		var num = (num.toString(10).split("").reverse().join("").replace(/\d{1,3}/g, value =>
			value.length >= 3 ? value + "," : value).split("").reverse().join(""));
		return num.length % 4 == 0 ? num.substring(1) : num;
	},
	iscrollTouchendTransverse: function(e, fn) {
		e.preventDefault();
		e.stopPropagation();
		renderingComponent.iscrollTouchendCallback(this.riteWrapperArr, function() {
			this.riteWrapperArr = [];
		}.bind(this), function() {
			this.riteWrapperArr = [];
			fn && fn();
		}.bind(this));
	},
	iscrollTouchendVertical: function(e, fn) {
		e.preventDefault();
		e.stopPropagation();
		renderingComponent.iscrollTouchendCallback(this.integralWrapperArr, function() {
			this.integralWrapperArr = [];
		}.bind(this), function() {
			this.integralWrapperArr = [];
			fn && fn();
		}.bind(this));
	},
	iscrollTouchendCallback: function(tempArr, clearTempArr, fn) {
		var tempArr = [...new Set(tempArr)];
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

var renderingComponent = new RenderingComponent();