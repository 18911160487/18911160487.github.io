function Common_utils() {
	this.commonUrl = "";
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
			"https://mtest.chinaamc.com/mphoneAnt/mp" : "https://m.chinaamc.com/mphone/mp";
	},
	setHTMLFontSize: function() {
		var ww;
		var maxw = 750;
		var minw = 320;
		if(window.innerWidth > maxw) {
			ww = maxw
		} else if(window.innerWidth < minw) {
			ww = minw
		} else {
			ww = window.innerWidth
		}
		document.getElementsByTagName('html')[0].style.fontSize = ww / maxw * 100 + 'px'
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