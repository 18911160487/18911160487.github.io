function Page(btnPlacementAreaArr, container, imgFormat, cdnPrefix) {
	this.btnPlacementAreaArr = btnPlacementAreaArr || [];
	this.container = container ? container instanceof jQuery ? container : $(container) : $("#container");
	this.imgFormat = imgFormat || "jpg"; //图片后缀
	this.cdnPrefix = cdnPrefix || ""; //图片路径是否使用cdn路径
	this.innerBtnMsgArr = []; //放置btn位置信息
	this.init();
}
$.extend(Page.prototype, {
	init: function() {
		this.setHTMLFontSize();
		this.createStructure();
	},
	setHTMLFontSize: function() {
		function htmlSize() {
			var ww;
			var maxw = 750;
			var minw = 320;
			if(window.innerWidth > maxw) {
				ww = maxw;
			} else if(window.innerWidth < minw) {
				ww = minw;
			} else {
				ww = window.innerWidth;
			}
			document.getElementsByTagName('html')[0].style.fontSize = ww / maxw * 100 + 'px';
		}
		htmlSize();
		window.onresize = function() {
			htmlSize();
		}
	},
	createStructure: function() {
		var html = '';
		for(var i = 0; i < this.btnPlacementAreaArr.length; i++) {
			var imgSrc = this.cdnPrefix + 'img/' + i + '.' + this.imgFormat + '?random=' + new Date().getTime();
			html += '<div class="clear"><img src="' + imgSrc + '" class="bgImg">';
			if(this.btnPlacementAreaArr[i].length > 0) {
				for(var j = 0; j < this.btnPlacementAreaArr[i].length; j++) {
					this.innerBtnMsgArr.push({
						"config": this.btnPlacementAreaArr[i][j].config,
						"innerBtnMsg": this.btnPlacementAreaArr[i][j].innerBtnMsg
					});
					html += this.btnPlacementAreaArr[i].length > 0 ? "<div class='innerBtn'></div>" : "";
				}
			}
			html += '</div>';
		}
		this.container.html(html);
		this.innerBtn = this.container.find(".innerBtn");
		for(var i = 0; i < this.innerBtnMsgArr.length; i++) {
			var htmlFontSize = parseFloat($("html").css("font-size"));
			var innerBtnMsg = this.innerBtnMsgArr[i].innerBtnMsg;
			console.log(parseFloat(innerBtnMsg.width), htmlFontSize / 50)
			this.innerBtn.eq(i).css({
				"width": parseFloat(innerBtnMsg.width) / 50 + "rem",
				"height": parseFloat(innerBtnMsg.height) / 50 + "rem",
				"left": parseFloat(innerBtnMsg.left) / 50 + "rem",
				"top": parseFloat(innerBtnMsg.top) / 50 + "rem"
			});
			this.innerBtnMsgArr[i].config && amcTools ? amcTools.addLinkForElement(this.innerBtn.eq(i)[0], this.innerBtnMsgArr[i].config) : "";
		}
	}
});
new Page([
	[],
	[{
		"config": {
			"default": 'https://m.chinaamc.com/mphone/mp/purchase/deposit/003003/wgw',
			"gj": "amcfm://trade/deposit?fundCode=003003",
			"wx": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a95e4f94bcdf351&redirect_uri=https%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2FwxRedirect%2Fgo%3FredirectUrl%3Dhttps%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2Fpurchase%2Fdeposit%2F003003%2Fwx&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
		},
		"innerBtnMsg": {
			"width": "307px",
			"height": "43px",
			"left": "34px",
			"top": "83px"
		}
	}],
	[],
	[],
	[],
	[{
			"config": {
				"default": 'https://m.chinaamc.com/mphone/mp/purchase/deposit/003003/wgw',
				"gj": "amcfm://trade/deposit?fundCode=003003",
				"wx": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a95e4f94bcdf351&redirect_uri=https%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2FwxRedirect%2Fgo%3FredirectUrl%3Dhttps%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2Fpurchase%2Fdeposit%2F003003%2Fwx&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
			},
			"innerBtnMsg": {
				"width": "125px",
				"height": "86px",
				"left": "0",
				"top": "0"
			}
		},
		{
			"config": {
				"default": 'https://m.chinaamc.com/mphone/mp/purchase/deposit/003003/wgw',
				"gj": "amcfm://trade/deposit?fundCode=003003",
				"wx": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a95e4f94bcdf351&redirect_uri=https%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2FwxRedirect%2Fgo%3FredirectUrl%3Dhttps%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2Fpurchase%2Fdeposit%2F003003%2Fwx&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
			},
			"innerBtnMsg": {
				"width": "125px",
				"height": "86px",
				"left": "125px",
				"top": "0"
			}
		},
		{
			"config": {
				"default": 'https://m.chinaamc.com/mphone/mp/purchase/deposit/003003/wgw',
				"gj": "amcfm://trade/deposit?fundCode=003003",
				"wx": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a95e4f94bcdf351&redirect_uri=https%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2FwxRedirect%2Fgo%3FredirectUrl%3Dhttps%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2Fpurchase%2Fdeposit%2F003003%2Fwx&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
			},
			"innerBtnMsg": {
				"width": "125px",
				"height": "86px",
				"left": "250px",
				"top": "0"
			}
		}
	],
	[]
]);