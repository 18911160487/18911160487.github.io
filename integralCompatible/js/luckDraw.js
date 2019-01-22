function Page() {
	this.loadingPage = $(".loading"); //加载页保存到变量
	this.loadingAnimateNum = 0;
	this.loadingAnimateTimer = null;
	this.storagePrizeIndex = [0, 1, 2, 4, 7, 6, 5, 3];
	this.changeIndex = 0;
	this.prizeTimer = null;
	this.lightTimer = null;
	this.lightFlag = true;
	this.userPrizeIndex = -1;
	this.speed = 200;
	this.userPrizeFlag = true;
	this.requestFlag = true;
	this.availableNum = 0; //用户抽奖次数
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
		$('#load').load('common/page/load.html', function() {
			load.showLoadingAnimate();
		}.bind(this));
		$('#toast').load('common/page/toast.html');
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
			this.getQueryRouletteData();
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
		load.hideLoadingAnimate();
		$(".abnormal").show();
	},
	getQueryRouletteData: function() {
		common_utils.requestDataFun({
			selfTestUrl: "json/queryRoulette.json",
			url: "/appPointActivity/queryRoulette.fopcors",
			success: $.proxy(this.getQueryRouletteSucc, this),
			error: $.proxy(this.getQueryRouletteErr, this),
			complete: $.proxy(this.getQueryRouletteComplete, this)
		});
	},
	getQueryRouletteSucc: function(res) {
		console.log(res)
		if(res.code == "0000") {
			this.captcha = res.data.captcha;
			var rouletteList = res.data.rouletteList;
			var prizeList = res.data.prizeList;
			var userPrizeHtml = "";
			$(".luckWrapper").show();
			$(".luckDrawCount").html('<span>您还有</span>' + (this.availableNum = res.data.availableNum) + '<span>次抽奖机会</span>');
			$(".luckDrawIntegral").html('<span>我的积分：</span>' + res.data.myPoints);
			$(".luckDrawIntegralConsume span,.integralConsume").html(res.data.exchangePoints);
			for(var i = 0; i < rouletteList.length; i++) {
				$(".luckDrawEach").eq(this.storagePrizeIndex[i]).attr("orderId", rouletteList[i].orderId)
					.find("img").attr("src", rouletteList[i].picture);
			}
			for(var i = 0; i < prizeList.length; i++) {
				var child = prizeList[i];
				userPrizeHtml += '<div class="prize-item prizeItem clear">' +
					'<div class="prize-item-userName">' + child.nickName + '</div>' +
					'<div class="prize-item-draw">获得</div>' +
					'<div class="prize-item-prize">' + child.giftName + '</div>' +
					'</div>';
			}
			$(".prizeContainer").html(userPrizeHtml);
			this.userPrizeStartMove();
		} else {
			this.getQueryRouletteErr();
		}
	},
	getQueryRouletteErr: function() {
		console.log("error");
		$(".abnormal").show();
	},
	getQueryRouletteComplete: function() {
		load.hideLoadingAnimate();
	},
	bindEvents: function() {
		$(".abnormalBtn").on("click", $.proxy(this.accountLoginSuccess, this));
		$(".luckDrawBtn").on("click", $.proxy(this.handleLuckDrawBtnClick, this));
		$(".popupContainerBtn").on("click", $.proxy(this.handlePopupContainerBtnClick, this));
		$(".popup").on("touchmove", $.proxy(this.handlePopupTouchmove, this));
	},
	handleLuckDrawBtnClick: function() {
		if(this.availableNum <= 0) {
			this.createPopupTextDom("积分不足", "<div>您积分不足！</div><div>去完成任务赚积分吧。</div>");
			return;
		}
		if(this.requestReturnFlagFun()) {
			this.lightTimerFun();
			this.play(this.speed, $.proxy(this.handleDrawPrizeSucc, this));
			common_utils.requestDataFun({
				selfTestUrl: "json/drawPrize.json",
				url: "/appPointActivity/drawPrize.fopcors",
				data: {
					captcha: this.captcha
				},
				success: $.proxy(this.getDrawPrizeSucc, this),
				error: $.proxy(this.getDrawPrizeErr, this),
				complete: $.proxy(this.getDrawPrizeComplete, this)
			});
		}
	},
	getDrawPrizeSucc: function(res) {
		console.log(res)
		if(res.code == "0000") {
			this.drawPrizeData = res.data;
			this.availableNum = res.data.availableNum;
			setTimeout(function() {
				this.userPrizeIndex = res.data.przie.orderId;
			}.bind(this), 5000)
		} else {
			this.getDrawPrizeErr();
		}
	},
	handleDrawPrizeSucc: function() {
		var giftType = this.drawPrizeData.przie.giftType;
		var name = this.drawPrizeData.przie.name;
		var redEnvelopeMoney = this.drawPrizeData.przie.redEnvelopeMoney;
		if(giftType == "1" || giftType == "2") { //礼品类型 （1 虚拟 2 实物礼品 3 红包 4 积分5谢谢参与）
			this.createPopupTextDom("您已中奖", "<div>恭喜您！</div><div>获得" + name + "，</div><div>可在我的礼品查看。</div>");
		} else if(giftType == "3") {
			this.createPopupTextDom("<span>" + redEnvelopeMoney + "</span>元", "<div>恭喜您！</div><div>获得" + 
				redEnvelopeMoney + "元红包，</div><div>可在我的礼品查看。</div>");
		} else if(giftType == "4") {
			this.createPopupTextDom(name, "<div>恭喜您！</div><div>获得" + name + "，</div><div>积分实时到账。</div>");
		} else if(giftType == "5") {
			this.createPopupTextDom("谢谢参与", "<div>很遗憾，</div><div>感谢您的参与,</div><div>请继续支持我们。</div>");
		}
		$(".luckDrawCount").html('<span>您还有</span>' + (this.drawPrizeData.availableNum) + '<span>次抽奖机会</span>');
		$(".luckDrawIntegral").html('<span>我的积分：</span>' + this.drawPrizeData.myPoints);
		this.requestFlag = true;
	},
	createPopupTextDom: function(title, desc) {
		$(".popup").show();
		$(".popupContainerTitle").html(title);
		$(".popupContainerDescMiddle").html(desc);
	},
	getDrawPrizeErr: function() {
		console.log("error");
		clearInterval(this.prizeTimer);
		$(".abnormal").show();
	},
	getDrawPrizeComplete: function() {},
	lightTimerFun: function() {
		var num = 2;
		this.lightTimer = setInterval(function() {
			$(".luckDrawBorderLight img").attr("src", "img/luckDraw/light_" + num + ".png");
			num++;
			if(num > 2) {
				num = 1;
			}
			if(!this.lightFlag) {
				clearInterval(this.lightTimer);
			}
		}.bind(this), 500);
	},
	play: function(speed, fn) {
		clearInterval(this.prizeTimer);
		this.prizeTimer = setTimeout(function() {
			$(".luckDrawEach").eq(this.storagePrizeIndex[this.changeIndex]).removeClass("changeStyle")
				.siblings(".luckDrawEach").addClass("changeStyle");
			this.changeIndex++;
			if(this.changeIndex >= this.storagePrizeIndex.length) {
				this.changeIndex = 0;
			}
			if(this.userPrizeFlag) {
				speed /= 1.15;
				if(speed <= this.speed / 6) {
					this.userPrizeFlag = false;
				}
			} else {
				speed *= 1.05;
				if(speed >= this.speed * 1.5) {
					speed = this.speed * 1.5;
				}
			}
			var orderId = $(".luckDrawEach").eq(this.storagePrizeIndex[this.changeIndex]).attr("orderId");
			if(this.userPrizeIndex >= 0 && this.userPrizeIndex == orderId) {
				setTimeout(function() {
					this.lightFlag = false;
					$(".luckDrawEach").eq(this.storagePrizeIndex[this.changeIndex]).removeClass("changeStyle")
						.siblings(".luckDrawEach").addClass("changeStyle");
					this.changeIndex = 0;
					this.userPrizeIndex = -1;
					this.speed = 200;
					this.userPrizeFlag = true;
					setTimeout(function() {
						fn && fn();
					}, 800)
				}.bind(this), speed);
			} else {
				this.play(speed, fn);
			}
		}.bind(this), speed)
	},
	userPrizeStartMove: function() {
		var marginTop = $(".prizeItem").eq(0).height();
		this.startMove($(".prizeContainer"), {
			"margin-top": -marginTop
		}, 30, function() {
			$(".prizeContainer").css("margin-top", 0).append($(".prizeItem").eq(0));
			this.userPrizeStartMove();
		}.bind(this))
	},
	startMove: function(startMoveEle, json, speed, fn) {
		clearInterval(this.startMoveTimer);
		this.startMoveTimer = setInterval(function() {
			var flag = true;
			for(var attr in json) {
				var current = 0;
				current = parseInt(startMoveEle.css(attr));
				var speed = json[attr] - current;
				speed = speed > 0 ? 1 : -1;
				if(json[attr] != current) {
					flag = false;
				}
				startMoveEle.css(attr, current + speed);
			}
			if(flag) {
				clearInterval(this.startMoveTimer);
				fn && fn();
			}
		}, speed);
	},
	handlePopupContainerBtnClick: function() {
		$(".popup").hide();
		$(".luckDrawEach").removeClass("changeStyle");
	},
	handlePopupTouchmove: function() {
		return false;
	},
})
new Page();