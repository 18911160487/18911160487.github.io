function Page() {
	this.commonUrl = "";
	this.index = 0;
	this.iScrollArr = [];
	this.loadFlagArr = [];
	this.fundListDetailtTouches = [];
	this.currentTime = new Date().getTime();
	this.fundDetailNetValueDateFlagArr = [];
	this.init()
}
$.extend(Page.prototype, {
	init: function() {
		this.resizeDomStyle();
		this.pageAuthorization();
		this.bindEvents()
	},
	resizeDomStyle: function() {
		var html = "";
		for(var i = 0; i < $(".fundType").length; i += 1) {
			html += '<div class="fund-iscroll fundIscroll" id="iscrollSlide_' + i +
				'"><div class="fund-iscroll-container fundIscrollContainer"></div></div>';
			this.fundDetailNetValueDateFlagArr.push(true);
		}
		$(".swiperContainer").html(html);
		var fundDetailTile = JSON.parse(localStorage.getItem("fundDetailTile"));
		this.index = !!fundDetailTile && !!fundDetailTile.currentTime &&
			(this.currentTime - fundDetailTile.currentTime > 60 * 60 * 1000) ?
			0 : parseInt(fundDetailTile && !!fundDetailTile.fundType ? fundDetailTile.fundType : 0);
	},
	pageAuthorization: function() {
		location.hostname == "127.0.0.1" || location.hostname == "18911160487.github.io" ?
			this.getFundDetailList() :
			common_utils.judgmentPath().pageAuthorization($.proxy(this.getFundDetailList, this));
	},
	getFundDetailList: function() {
		fortunePlatform.showLoading();
		this.requestDataFun({
			selfTestUrl: "json/fundDetailList2.json",
			url: "/fundValuation/allFundValuation.fopcors",
			success: $.proxy(this.getFundDetailListSucc, this),
			data: {
				"auth_code": common_utils.auth_code,
				"app_id": common_utils.app_id,
				"typeTag": this.index
			}
		})
	},
	getFundDetailListSucc: function(res) {
		//alert(JSON.stringify(res))
		if(res.code == "0000") {
			var fundList = res.data.estimateList;
			if(fundList.length == 0) {
				this.comonError();
				return;
			}
			$(".container").show();
			$(fortunePlatform).change();
			this.loadFlagArr[this.index] = true;
			var fundDetailNetValueDate = fundList[0].netValueDate;
			for(var i = 1; i < fundList.length; i += 1) {
				if(fundDetailNetValueDate != fundList[i].netValueDate) {
					this.fundDetailNetValueDateFlagArr[this.index] = false;
				}
				fundDetailNetValueDate = fundList[i].netValueDate;
			}
			$(".fundValuationDate").html(res.data.bizDate.substr(5));
			$(".fundNetValueDate").html(this.fundDetailNetValueDateFlagArr[this.index] ? res.data.estimateList[0].netValueDate.substr(5) : "");
			this.fundIscroll = $(".fundIscrollContainer");
			this.fundIscroll.eq(this.index).html("");
			for(var i = 0; i < fundList.length; i += 1) {
				this.fundIscroll.eq(this.index).append('<div class="fund-list-detail border-bottom fundListDetail clear">' +
					'<div class="fund-detail-catalog fundDetailCatalog fl">' +
					'<div class="fund-detail-name fundName">' + fundList[i].fundName + '</div>' +
					'<div class="fund-detail-code fundCode">' + fundList[i].fundCode + '</div>' +
					'</div>' +
					'<div class="fund-detail-numerical-value fundDetailNumericalValue fr clear">' +
					'<div class="fund-detail-valuation fl">' +
					'<div class="fund-detail-valuation-num">' + fundList[i].estimate + '</div>' +
					'<div class="fund-detail-valuation-increase">' + fundList[i].forecastGrowth + '</div>' +
					'</div>' +
					'<div class="fund-detail-netValue fl">' +
					'<div class="fund-detail-netValue-num" style="margin-top: ' + (this.fundDetailNetValueDateFlagArr[this.index] ? "" : ".1rem") + '">' + fundList[i].netValue + '</div>' +
					'<div class="fund-detail-netValue-increase">' + fundList[i].netValueIncrease + '</div>' +
					'<div class="fund-detail-netValue-date"style="display: ' + (this.fundDetailNetValueDateFlagArr[this.index] || !fundList[i].netValueDate ? "none" : "block") + '">（' + fundList[i].netValueDate.substr(5) + '）</div>' +
					'</div>' +
					'</div>' +
					'</div>')
			}
			this.setIncreaseDomStyle(this.fundIscroll.eq(this.index).find(".fund-detail-valuation-increase"));
			this.setIncreaseDomStyle(this.fundIscroll.eq(this.index).find(".fund-detail-netValue-increase"));
			var fundFileBgHeight = $(".swiperContainer").height() - $(".fundIscrollContainer").eq(this.index).height() + 1;
			this.fundIscroll.eq(this.index).append('<div style="height: ' + (fundFileBgHeight) + 'px"></div>');

			this.isOverflowY(this.index);
			this.fundIscrollIscroll();
			var refreshTime = res.data.time.substr(res.data.time.length - 6);
			this.currentTime = new Date(res.data.time.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
				"$1/$2/$3 $4:$5:$6")).getTime();
			this.shieldlayerToast("数据更新成功  " + refreshTime.substr(0, 2) + ":" +
				refreshTime.substr(2, 2) + ":" + refreshTime.substr(4, 2), $(".updateTime"));
			$(".fundDetailCatalog").css("width", Math.floor($('.fundIscroll').eq(this.index).width()) -
				Math.ceil($('.fundIscroll').eq(this.index).find('.fundDetailNumericalValue').width()))
		} else {
			this.comonError();
		}
	},
	fundIscrollIscroll: function() {
		if(this.iScrollArr.length > 0) {
			for(var i = 0; i < $(".fundType").length; i += 1) {
				this.iScrollArr[i].refresh();
			}
			this.iScrollArr = [];
		}
		for(var i = 0; i < $(".fundType").length; i += 1) {
			var iScroll = new IScroll("#iscrollSlide_" + i);
			this.iScrollArr.push(iScroll);
		}
		$(".fundIscroll").eq(this.index).on("touchend", ".fundListDetail", $.proxy(this.handleFundListDetailTouchend, this));
		$(".fundIscroll").eq(this.index).on("touchmove", $.proxy(this.handleFundListDetailTouchmove, this));
		$(".fundIscroll").eq(this.index).on("touchstart", ".fundListDetail", $.proxy(this.handleFundListDetailTouchstart, this));
	},
	handleFundListDetailTouchstart: function(e) {
		this.tempTop = $(e.currentTarget).offset().top;
	},
	handleFundListDetailTouchmove: function(e) {
		if(e.touches[0].clientY <= 0) {
			var scrollTo = $(".fundIscroll").eq(this.index).height() -
				$(".fundIscroll").eq(this.index).find(".fundIscrollContainer").height();
			this.iScrollArr[this.index].scrollTo(0, scrollTo);
		}
		this.fundListDetailtTouches.push(e.touches[0].clientX);
	},
	handleFundListDetailTouchend: function(e) {
		if(Math.abs($(e.currentTarget).offset().top - this.tempTop) > $(e.currentTarget).height() / 3 ||
			(this.fundListDetailtTouches.length >= 2 && Math.abs(this.fundListDetailtTouches[0] -
				this.fundListDetailtTouches[this.fundListDetailtTouches.length - 1]) > $(e.currentTarget).height() / 3)) {
			this.fundListDetailtTouches = [];
			return;
		}
		var fundCode = $(e.currentTarget).find(".fundCode").html();
		var fundName = $(e.currentTarget).find(".fundName").html();
		localStorage.setItem("fundDetailTile", JSON.stringify({
			"fundCode": fundCode,
			"fundName": fundName,
			"fundType": this.index,
			"currentTime": this.currentTime
		}));
		location.href = "./fundDetail.html";
	},
	bindEvents: function() {
		$(".abnormalRefresh").on("touchend", $.proxy(this.handleAbnormalRefreshClick, this));
		$(".refresh").on("touchend", $.proxy(this.handleRefreshClick, this));
		$(".fundType").on("touchend", $.proxy(this.handleFundTypeClick, this))
	},
	handleAbnormalRefreshClick: function() {
		location.href = location.href;
	},
	handleRefreshClick: function() {
		this.iScrollArr = [];
		fortunePlatform.showLoading();
		for(var i = 0; i < this.loadFlagArr.length; i += 1) {
			this.loadFlagArr[i] = false;
		}
		this.getFundDetailList()
	},
	handleFundTypeClick: function(e) {
		setTimeout(function() {
			this.fundDetailNetValueDateFlagArr = [];
			for(var i = 0; i < $(".fundType").length; i += 1) {
				this.fundDetailNetValueDateFlagArr.push(true);
			}
			this.index = $(e.currentTarget).index();
			this.isOverflowY(this.index);
			/*if(this.loadFlagArr[this.index]) {
				return;
			}*/
			this.fundIscrollIscroll();
			fortunePlatform.showLoading();
			this.pageAuthorization();
		}.bind(this), 1)
	},
	isOverflowY: function(index) {
		$(".fundTitle").eq(index).addClass("changeColor").parent().parent().siblings().find(".fundTitle").removeClass("changeColor");
		$(".fundIscroll").eq(index).show().siblings().hide()
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
		//alert("error")
		$(".abnormal").show();
		$(fortunePlatform).change();
	},
	complete: function(XMLHttpResquest, status) {
		if(status == 'timeout') {
			this.comonError();
		}
	},
	shieldlayerToast: function(html, dom = $(".toast"), speed) {
		if(dom.css("display") == "block") {
			return
		}
		dom.show().html(html);
		setTimeout(function() {
			dom.hide()
		}, speed ? speed : 3000)
	},
	setIncreaseDomStyle: function(dom) {
		for(var i = 0; i < dom.length; i += 1) {
			var html = dom.eq(i).html();
			dom.eq(i).html(parseFloat(html) > 0 ? "+" + html : html).css("color",
				parseFloat(html) > 0 ? "#f4333c" : parseFloat(html) < 0 ? "#1c9a00" : "#808080");
		}
	}
});
new Page();