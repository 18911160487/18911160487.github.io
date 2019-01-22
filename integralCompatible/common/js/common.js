function Common_utils() {
	this.commonUrl = "";
	this.funThrottleFlag = true;
	this.isNewVersion = false; //判断管家是否是4.5.0以后的版本
	this.init();
}
$.extend(Common_utils.prototype, {
	init: function() {
		this.judgementPlatform();
		this.setHTMLFontSize();
		this.bindEvents();
	},
	judgementPlatform: function() {
		var ua = navigator.userAgent.toLowerCase();
		var hostname = location.protocol + "//" + location.hostname;
		this.platformType = ua.indexOf('amcfmapp') != -1 || ua.indexOf('amchqtapp') != -1 ? "app" : ua.indexOf('micromessenger') != -1 ? "weixin" : "h5";
		this.commonUrl = hostname == "http://127.0.0.1" || hostname == "http://mtest.chinaamc.com" || hostname == "https://mtest.chinaamc.com" ?
			"http://mtest.chinaamc.com/mphoneAnt2/mp" : "https://m.chinaamc.com/mphone/mp";
		var versionStr = ua.substr(ua.indexOf("amcfmapp/") + 9);
		var versionArr = versionStr.substr(0, versionStr.indexOf(" ")).split(".");
		if(versionArr[0][0] > "4" || (versionArr[0][0] >= "4" && versionArr[1][0] >= "5")) {
			this.isNewVersion = true;
		} 
	},
	funThrottle: function(fn, speed) { // 函数节流
		if(this.funThrottleFlag) {
			this.funThrottleFlag = false;
		} else {
			return;
		}
		var timer = null;
		var speed = speed || 300;
		clearTimeout(timer);
		timer = setTimeout(function() {
			fn && fn();
			this.funThrottleFlag = true;
		}.bind(this), speed);
	},
	setHTMLFontSize: function() {
		var ww;
		var maxw = 750;
		var minw = 320;
		var width = document.body.clientWidth || window.innerWidth;
		var ua = navigator.userAgent.toLowerCase();
		if(width > maxw) {
			ww = maxw
		} else if(width < minw) {
			ww = minw
		} else {
			ww = width
		}
		var fontSize = ww / maxw * 100;
		$("html").css("font-size", fontSize + "px");
		if(parseInt(fontSize) != parseInt($("html").css("font-size"))) {
			var htmlFontSize = parseFloat($("html").css("font-size"));
			var probability = fontSize / htmlFontSize;
			$("html").css("font-size", htmlFontSize * probability * probability + "px");
		}
		/*if(this.platformType == "app" && ua.indexOf("sm-n9600") != -1) {  //三星note 9 默认字体放大1.1倍
			$("html").css("font-size", ww / maxw * 100 * (1 / 1.1) + "px")
		}
		if(this.platformType == "app" && ua.indexOf("pafm00") != -1) {  //oppo find x 默认字体缩小0.9倍
			$("html").css("font-size", ww / maxw * 100 / (1 / 1.1) + "px")
		}*/
	},
	bindEvents: function() {
		$(window).on("resize", $.proxy(this.handleWindowResize, this))
	},
	handleWindowResize: function() {
		this.setHTMLFontSize()
	},
	requestDataFun: function(dataObj) {
		location.hostname == "127.0.0.1" ? $.ajax({
			url: dataObj.selfTestUrl,
			beforeSend: dataObj.beforeSend,
			timeout: 20000,
			data: dataObj.data || {},
			dataType: "json",
			success: dataObj.success,
			error: dataObj.error,
			complete: dataObj.complete
		}) : $.ajax({
			type: 'POST',
			beforeSend: dataObj.beforeSend,
			url: common_utils.commonUrl + dataObj.url,
			timeout: 20000,
			data: $.extend({
				"platformType": this.platformType
			}, dataObj.data || {}),
			dataType: "json",
			crossDomain: true,
			xhrFields: {
				withCredentials: true
			},
			success: dataObj.success,
			error: dataObj.error,
			complete: dataObj.complete
		})
	},
});
var common_utils = new Common_utils();