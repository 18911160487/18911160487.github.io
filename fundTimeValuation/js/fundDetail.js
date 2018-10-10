function Page() {
	this.commonUrl = "";
	this.foresightList = [];
	this.foresightSelectIndex = 0;
	this.bullishIsSelect = false;
	this.bearishIsSelect = false;
	this.userClickSignsum = 0;
	this.vote = "";
	this.userClickSumFlag = true;
	this.foresightList = [{
		"goodVote": 0,
		"badVote": 0
	}, {
		"goodVote": 0,
		"badVote": 0
	}, {
		"goodVote": 0,
		"badVote": 0
	}, {
		"goodVote": 0,
		"badVote": 0
	}]
	this.init();
}
$.extend(Page.prototype, {
	init: function() {
		this.setDomStyle();
		this.bindEvents();
		this.pageAuthorization()
	},
	pageAuthorization: function() {
		location.hostname == "127.0.0.1" || location.hostname == "18911160487.github.io" ?
			this.handlePageAuthorization() :
			common_utils.judgmentPath().pageAuthorization($.proxy(this.handlePageAuthorization, this));
	},
	handlePageAuthorization: function() {
		this.loadChartData();
		this.loadForesightData(this.vote);
	},
	setDomStyle: function() {
		$(".fundLoading").removeClass("hide");
		$(".container").css("height", window.innerHeight - $('.fundBottomFixed').height());
		$(".fundFileBg").css("height", $(".container").height() >= $(".containerContent").height() ?
			($(".container").height() - $(".containerContent").height() + 1) : 0);
		this.iScroll = new IScroll("#container");
		$(".container").on("touchmove", $.proxy(this.handleContainerTouchMove, this));
		$(".container").on("touchend", $.proxy(this.handleContainerTouchEnd, this));
		for(var i = 0; i < $(".fundForesightEachTimeSlot").length; i += 1) {
			$(".fundForesightBullish").append('<div class="fund-foresight-Bullish-people fl fundForesightBullishPeople"></div>');
			$(".fundForesightBearish").append('<div class="fund-foresight-bearish-people fr fundForesightBearishPeople"></div>');
		}
	},
	defaultSelectSomeIndex: function(dom, index) {
		for(var i = 0; i < dom.length; i += 1) {
			if(index != undefined && i == index) {
				dom.eq(index).show();
			} else {
				dom.eq(i).hide();
			}
		}
	},
	handleContainerTouchMove: function(e) {
		if(e.touches[0].clientY <= 0) {
			var scrollTo = $(".container").height() - $(".containerContent").height();
			this.iScroll.scrollTo(0, scrollTo);
		}
		this.y = this.iScroll.y;
		$(".fundLoadingState").html(this.y > 60 ? "松开立即刷新" : this.y >= 0 && "下拉可刷新").parent().removeClass("changeStyle");
	},
	handleContainerTouchEnd: function() {
		if(this.y > 60) {
			this.userClickSignsum = 0;
			for(var i = 0; i < $(".fundForesightEachTimeSlot").length; i += 1) {
				$(".fundForesightBullishPeople,.fundForesightBearishPeople").eq(i).html("");
			}
			$(".fundLoadingState").html("正在刷新").parent().addClass("changeStyle");
			this.handlePageAuthorization();
		}
	},
	loadForesightData: function(vote) {
		this.userClickSignsum += 1;
		this.requestDataFun({
			selfTestUrl: "json/fundForesight.json",
			url: "/fundValuation/voteForFund.fopcors",
			success: $.proxy(this.loadForesightDataSucc, this),
			error: $.proxy(this.loadForesightDataError, this),
			complete: $.proxy(this.loadForesightDataComplete, this),
			data: {
				"auth_code": common_utils.auth_code,
				"app_id": common_utils.app_id,
				"fundCode": fundDetailTile.fundCode,
				"netValue": $(".fundNewNetValueNumber").html(),
				"vote": vote
			}
		})
	},
	loadForesightDataSucc: function(res) {
		//alert(JSON.stringify(res));
		if(res.code == "0000") {
			$(fortunePlatform).change();
			$(".toast").hide();
			$(".fundForesightDesc").html(res.data.voteAndNetValue);
			if(this.userClickSignsum <= 1) {
				this.foresightList = res.data.valuationVoteCountVos;
				this.bullishIsSelect = res.data.vote == "1";
				this.bearishIsSelect = res.data.vote == "2";
				this.bullishIsSelect && this.currentImgChangeSrc($(".fundForesightBullishContainer img"), "yixuanzhong", $('.fundForesightBullishState'), "已看好");
				this.bearishIsSelect && this.currentImgChangeSrc($(".fundForesightBearishContainer img"), "yixuanzhong", $('.fundForesightBearishState'), "已看空");
				this.fundForesight();
			}
		} else {
			this.loadForesightDataError();
		}
	},
	fundForesight: function() {
		console.log(JSON.stringify(this.foresightList))
		this.createFundForesightPeople(this.foresightList);
		this.foresightSelectDate(this.foresightList[this.foresightSelectIndex], this.foresightSelectIndex);
	},
	loadForesightDataError: function() {
		$(fortunePlatform).change();
		this.fundForesight();
	},
	loadChartDataComplete: function(XMLHttpResquest, status) {
		if(status == 'timeout') {
			this.loadForesightDataError();
		}
	},
	createFundForesightPeople: function(foresightList) {
		for(var i = 0; i < $(".fundForesightEachTimeSlot").length; i += 1) {
			if($(".fundForesightBullishPeople").eq(i).html() == '') {
				var goodVote = foresightList && foresightList[i].goodVote ? foresightList[i].goodVote : 0;
				var badVote = foresightList && foresightList[i].badVote ? foresightList[i].badVote : 0;
				$(".fundForesightBullishPeople").eq(i).html("<div>" + (goodVote - 1) +
					"人</div><div>" + goodVote + "人</div><div>" + (goodVote + 1) + "人</div>");
				$(".fundForesightBearishPeople").eq(i).html("<div>" + (badVote - 1) +
					"人</div><div>" + badVote + "人</div><div>" + (badVote + 1) + "人</div>");
				$(".fundForesightBullishPeople,.fundForesightBearishPeople").css("margin-top", -$(".fundForesightBearishPeople").height() / 3 + "px")
			}
		}
	},
	currentImgChangeSrc: function(currentImg, currentSrc, currentDom, currentContent) {
		var src = currentImg.attr("src");
		currentImg.attr("src", src.substring(0, src.lastIndexOf("_") + 1) + currentSrc + src.substring(src.lastIndexOf(".")));
		currentDom && currentDom.html(currentContent);
		return true;
	},
	foresightSelectDate: function(foresightObj, index) {
		this.defaultSelectSomeIndex($(".fundForesightBullishPeople"), index);
		this.defaultSelectSomeIndex($(".fundForesightBearishPeople"), index);
		$(".fundForesightEachTimeSlot").eq(index).addClass("changeColor").siblings().removeClass("changeColor");
		foresightObj && this.fillBullishPeople(foresightObj.goodVote, foresightObj.badVote);
	},
	fillBullishPeople: function(goodVote, badVote) {
		$(".fundForesightBullishNumber").html(!goodVote && !badVote ? "50%" : Math.round(goodVote / (goodVote + badVote) * 100) + "%");
		$(".fundForesightBearishNumber").html(!goodVote && !badVote ? "50%" : (100 - Math.round(goodVote / (goodVote + badVote) * 100)) + "%");
		var bullishNum = parseInt($(".fundForesightBullishNumber").html());
		var bearishNum = parseInt($(".fundForesightBearishNumber").html());
		bullishNum += 7;
		var width = !goodVote && !badVote ? "57%" : bullishNum >= 100 ? "115%" : bullishNum >= 85 ? "85%" :
			bullishNum <= 7 ? "0%" : bullishNum <= 27 ? "27%" : bullishNum + "%";
		$(".fundForesightBullishSpeed").animate({
			"width": width
		}, 1000)
	},
	bindEvents: function() {
		$(".toast").on("touchmove", $.proxy(this.handleToastTouchmove, this));
		$(".abnormalRefresh").on("touchend", $.proxy(this.handleAbnormalRefreshClick, this));
		$(".fundForesightEachTimeSlot").on("touchend", $.proxy(this.handleFundForesightEachTimeSlotClick, this));
		$(".fundForesightBullishContainer").on("touchend", $.proxy(this.handleFundForesightBullishContainerClick, this));
		$(".fundForesightBearishContainer").on("touchend", $.proxy(this.handleFundForesightBearishContainerClick, this));
		$(".fundBuyBtn").on("touchend", $.proxy(this.handleFundBuyBtnClick, this));
	},
	handleToastTouchmove: function() {
		return false;
	},
	handleAbnormalRefreshClick: function() {
		location.href = location.href;
	},
	handleFundForesightEachTimeSlotClick: function(e) {
		e.stopPropagation();
		this.foresightSelectDate(this.foresightList[$(e.currentTarget).index()], this.foresightSelectIndex = $(e.currentTarget).index());
	},
	handleFundForesightBullishContainerClick: function(e) {
		e.stopPropagation();
		if(!this.userClickSumFlag) {
			this.shieldlayerToast("<div>操作频繁，请稍后再试</div>");
			return;
		}
		setTimeout(function() {
			this.userClickSumFlag = true;
		}.bind(this), 2000);
		this.bullishIsSelect = !this.bullishIsSelect;
		this.userClickSumFlag = false;
		this.oldVote = this.vote;
		this.vote = this.bullishIsSelect ? "1" : "3";
		console.log(this.bullishIsSelect, this.bearishIsSelect, this.vote)

		var height = $(".fundForesightBullishPeople").height();
		var bullishMarginTop = parseInt($(".fundForesightBullishPeople").css("margin-top"));
		var bearishMarginTop = parseInt($(".fundForesightBearishPeople").css("margin-top"));
		for(var i = 0; i < this.foresightList.length; i++) {
			if(this.bullishIsSelect) {
				if(this.bearishIsSelect) {
					this.foresightList[i].goodVote += 1;
					this.foresightList[i].badVote -= 1;
					if(i == this.foresightList.length - 1) {
						this.bullishIsSelect = true;
						this.bearishIsSelect = false;
					}
					this.currentImgChangeSrc($(".fundForesightBullishContainer img"), "yixuanzhong", $('.fundForesightBullishState'), "已看好");
					this.currentImgChangeSrc($(".fundForesightBearishContainer img"), "weixuanzhong", $('.fundForesightBearishState'), "看空");
					$(".fundForesightBullishPeople").animate({"margin-top": bullishMarginTop - height / 3}, 300)
					$(".fundForesightBearishPeople").animate({"margin-top": bearishMarginTop + height / 3}, 300)
				} else {
					this.foresightList[i].goodVote += 1;
					if(i == this.foresightList.length - 1) {
						this.bullishIsSelect = true;
					}
					this.currentImgChangeSrc($(".fundForesightBullishContainer img"), "yixuanzhong", $('.fundForesightBullishState'), "已看好");
					$(".fundForesightBullishPeople").animate({"margin-top": bullishMarginTop - height / 3}, 300)
				}
			} else {
				if(this.bearishIsSelect) {

				} else {
					this.foresightList[i].goodVote -= 1;
					if(i == this.foresightList.length - 1) {
						this.bullishIsSelect = false;
					}
					this.currentImgChangeSrc($(".fundForesightBullishContainer img"), "weixuanzhong", $('.fundForesightBullishState'), "看好");
					$(".fundForesightBullishPeople").animate({"margin-top": bullishMarginTop + height / 3}, 300)
				}
			}
		}
		this.fundForesight();
		this.loadForesightData(this.vote);
	},
	handleFundForesightBearishContainerClick: function(e) {
		e.stopPropagation();
		if(!this.userClickSumFlag) {
			this.shieldlayerToast("<div>操作频繁，请稍后再试</div>");
			return;
		}
		setTimeout(function() {
			this.userClickSumFlag = true;
		}.bind(this), 2000);
		this.bearishIsSelect = !this.bearishIsSelect;
		this.userClickSumFlag = false;
		this.oldVote = this.vote;
		this.vote = this.bearishIsSelect ? "2" : "3";
		console.log(this.bullishIsSelect, this.bearishIsSelect, this.vote)
		var height = $(".fundForesightBullishPeople").height();
		var bullishMarginTop = parseInt($(".fundForesightBullishPeople").css("margin-top"));
		var bearishMarginTop = parseInt($(".fundForesightBearishPeople").css("margin-top"));
		for(var i = 0; i < this.foresightList.length; i++) {
			if(this.bearishIsSelect) {
				if(this.bullishIsSelect) {
					this.foresightList[i].goodVote -= 1;
					this.foresightList[i].badVote += 1;
					if(i == this.foresightList.length - 1) {
						this.bullishIsSelect = false;
						this.bearishIsSelect = true;
					}
					this.currentImgChangeSrc($(".fundForesightBullishContainer img"), "weixuanzhong", $('.fundForesightBullishState'), "看好");
					this.currentImgChangeSrc($(".fundForesightBearishContainer img"), "yixuanzhong", $('.fundForesightBearishState'), "已看空");
					$(".fundForesightBullishPeople").animate({"margin-top": bullishMarginTop + height / 3}, 300)
					$(".fundForesightBearishPeople").animate({"margin-top": bearishMarginTop - height / 3}, 300)
				} else {
					this.foresightList[i].badVote += 1;
					if(i == this.foresightList.length - 1) {
						this.bearishIsSelect = true;
					}
					this.currentImgChangeSrc($(".fundForesightBearishContainer img"), "yixuanzhong", $('.fundForesightBearishState'), "已看空");
					$(".fundForesightBearishPeople").animate({"margin-top": bearishMarginTop - height / 3}, 300)
				}
			} else {
				if(this.bullishIsSelect) {

				} else {
					this.foresightList[i].badVote -= 1;
					if(i == this.foresightList.length - 1) {
						this.bearishIsSelect = false;
					}
					this.currentImgChangeSrc($(".fundForesightBearishContainer img"), "weixuanzhong", $('.fundForesightBearishState'), "看空");
					$(".fundForesightBearishPeople").animate({"margin-top": bearishMarginTop + height / 3}, 300)
				}
			}
		}
		this.fundForesight();
		this.loadForesightData(this.vote);
	},

	handleFundBuyBtnClick: function() {
		if(!this.buyScheme) {
			return;
		}
		location.href = this.buyScheme;
	},
	loadChartData: function() {
		this.requestDataFun({
			selfTestUrl: "json/fundDetail.json",
			url: "/fundValuation/singleFundValuation.fopcors",
			success: $.proxy(this.loadChartDataSucc, this),
			error: $.proxy(this.loadChartDataError, this),
			complete: $.proxy(this.loadChartDataComplete, this),
			data: {
				"auth_code": common_utils.auth_code,
				"app_id": common_utils.app_id,
				"fundCode": fundDetailTile.fundCode
			}
		})
	},
	loadChartDataSucc: function(res) {
		if(res.code == "0000") {
			if(res.data.dataList.length == 0) {
				this.loadChartDataError();
				return;
			}
			$(".toast").hide();
			$(".fundLoadingState").html("下拉可刷新").parent().removeClass("changeStyle");
			$(fortunePlatform).change();
			this.buyScheme = res.data.buyScheme;
			new ContainerHighcharts(res);
		} else {
			this.loadChartDataError();
			$(".fundLoadingUpdateTime,.fundNetValueTime,.fundIncreaseNumber,.fundNewNetValueTitle,.fundDayIncreaseNumber," +
				".fundDetailNetValueNumber,.fundDetailIncreaseNumber,.fundDDCINumber").html("--");
		}
	},
	loadChartDataError: function() {
		$(fortunePlatform).change();
		$(".abnormal").show();
	},
	loadChartDataComplete: function(XMLHttpResquest, status) {
		if(status == 'timeout') {
			this.loadChartDataError();
		}
	},
	requestDataFun: function(dataObj) {
		location.hostname == "127.0.0.1" ? $.ajax({
			url: dataObj.selfTestUrl,
			timeout: 20000,
			data: dataObj.data || {},
			dataType: "json",
			success: dataObj.success,
			error: dataObj.error || $.proxy(this, "comonError"),
			complete: dataObj.complete || $.proxy(this, "complete")
		}) : $.ajax({
			type: 'POST',
			url: common_utils.commonUrl + dataObj.url,
			timeout: 20000,
			data: $.extend({
				"auth_code": common_utils.auth_code,
				"app_id": common_utils.app_id
			}, dataObj.data || {}),
			dataType: "json",
			crossDomain: true,
			xhrFields: {
				withCredentials: true
			},
			success: dataObj.success,
			error: dataObj.error || $.proxy(this, "comonError"),
			complete: dataObj.complete || $.proxy(this, "complete")
		})
	},
	comonError: function() {
		this.shieldlayerToast("<div>网络异常，请稍后重试<div>");
	},
	complete: function(XMLHttpResquest, status) {
		if(status == 'timeout') {
			this.comonError();
		}
	},
	shieldlayerToast: function(html = "", dom = $(".toast"), speed) {
		if(dom.css("display") == "block") {
			return;
		}
		dom.show().html(html);
		setTimeout(function() {
			dom.hide();
		}, speed ? speed : 3000)
	}
});
new Page();