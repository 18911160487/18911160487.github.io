function CopyDomContent(copyDom) { //依赖文件jq
	this.copyDom = copyDom instanceof jQuery ? copyDom : $(copyDom); //判断该dom对象是否是jq对象，若不是则转换成jq对象
	this.init();
}
$.extend(CopyDomContent.prototype, {
	init: function() {
		this.bindEvents();
	},
	bindEvents: function() {
		this.copyDom.on("click", $.proxy(this.handleCopyDomClick, this));
		this.copyDom[0].oncopy = $.proxy(this.handleCopyDomCopy, this);
	},
	handleCopyDomClick: function() {
		document.execCommand("copy");
	},
	handleCopyDomCopy: function(e) {
		this.isIE() ? this.copyDomIsIE(e) : this.copyDomNotIE(e);
	},
	copyDomIsIE: function(e) {
		if(window.clipboardData) {
			window.clipboardData.setData("Text", event.currentTarget.textContent);
		}
	},
	copyDomNotIE: function(e) {
		event.preventDefault();
		if(event.clipboardData) {
			event.clipboardData.setData("text/plain", event.currentTarget.textContent);
		}
	},
	isIE: function() {
		return window.ActiveXObject === undefined ? null : !window.XMLHttpRequest ? 6 : !window.document.querySelector ? 7 :
			!window.document.addEventListener ? 8 : !window.atob ? 9 : !window.document.createElement("input").dataset ? 10 : 11;
	}
});
//示例： new CopyDomContent($("#copyDom"));