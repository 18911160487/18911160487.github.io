function FortunePlatform(setTitleBg) {
	this.init()
}
$.extend(FortunePlatform.prototype, {
	init: function() {
		this.bindEvents();
		this.setTitleColor();
		//this.showLoading();
		this.hideOptionMenu();
		return this;
	},
	setTitle: function(title = '', subtitle = '') {
		window.AlipayJSBridge && AlipayJSBridge.call('setTitle', {
			title: title,
			subtitle: subtitle
		});
		return this;
	},
	setTitleColor: function(setTitleBg = '108ee9') {
		window.AlipayJSBridge && AlipayJSBridge.call("setTitleColor", {
			color: parseInt(setTitleBg, 16),
			reset: false
		});
		return this;
	},
	showLoading: function() {
		window.AlipayJSBridge && AlipayJSBridge.call('showLoading', {
			text: 'Loading'
		});
		return this;
	},
	hideOptionMenu: function() {
		window.AlipayJSBridge && AlipayJSBridge.call('hideOptionMenu');
		return this;
	},
	bindEvents: function() {
		$(this).on("change", $.proxy(this.change, this));
		return this
	},
	change: function() {
		window.AlipayJSBridge && AlipayJSBridge.call('hideLoading');
		return this;
	}
});