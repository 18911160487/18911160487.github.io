function Common_utils() {
	this.getServerObj = {};
	this.commonUrl = "";
	this.hostnameAndDomainName = {
		"2018010901712206": "http://www.anjue.com",
		"2017110709788899": "http://mtest.chinaamc.com",
		"2018071960678475": "https://mtest.chinaamc.com",
		"2018071960663452": "https://preview.yunfengdie.cn",
		"2017110709788866": "https://fundcaifuhao.antfortune.com",
		"2016111102721276": "https://m.chinaamc.com",
		"2018071960682496": "https://ant.chinaamc.com"
	};
	this.init();
}
$.extend(Common_utils.prototype, {
	init: function() {
		this.setHTMLFontSize();
		this.bindEvents();
	},
	judgmentPath: function() {
		var hostname = location.protocol + "//" + location.hostname;
		var app_id = "";
		for(var i in this.hostnameAndDomainName) {
			if(hostname == this.hostnameAndDomainName[i]) {
				app_id = i;
				break;
			}
		}
		this.commonUrl = app_id == "2018010901712206" || app_id == "2017110709788899" ||
			app_id == "2018071960678475" || app_id == "2018071960663452" ?
			"http://mtest.chinaamc.com/antAmc2/ant" : "https://ant.chinaamc.com/antAmc/ant";
		this.redirectComminUrl = "https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=" + app_id + "&scope=auth_user&redirect_uri=";
		return this;
	},
	pageAuthorization: function(fn) {
		var str = location.search.substring(1);
		var arr = str.split("&");
		for(var i = 0; i < arr.length; i += 1) {
			this.getServerObj[arr[i].split("=")[0]] = arr[i].split("=")[1]
		}
		this.auth_code = this.getServerObj.auth_code;
		this.app_id = this.getServerObj.app_id;
		if(!!this.auth_code) {
			fn && fn()
		} else {
			if(location.href == "about:srcdoc") {} else {
				location.href = this.redirectComminUrl + location.href;
			}
		}
		return this;
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
	}
});
var common_utils = new Common_utils();