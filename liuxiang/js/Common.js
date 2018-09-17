function Common() {
	this.resizeNewUnidimensionalObj = {}; //重置一维对象
	this.imgArray = $("[data-src]");
	this.init();
}
$.extend(Common.prototype, {
	init: function() {
		this.setHTMLFontSize();
		this.lazyLoad();
		this.bindEvents();
	},
	urlParse: function() { //获取url参数
		var arr = location.search.substr(1).split("&");
		var obj = {};
		!!arr[0] && arr.map((value, index) =>
			obj[decodeURIComponent(arr[index].split("=")[0])] = decodeURIComponent(arr[index].split("=")[1]));
		return obj;
	},
	flattenArr: function(arr) { //重置一维数组方法
		return JSON.stringify(arr).replace(/[\[\]]/g, "").split(",");
	},
	flattenObj: function(obj, preKey) { //重置一维对象方法
		for(var key in obj) {
			if(typeof obj[key] === "object") {
				if(preKey) {
					flatten(obj[key], `${preKey}_${key}`);
				} else {
					flatten(obj[key], key);
				}
			} else if(preKey) {
				this.resizeNewUnidimensionalObj[`${preKey}_${key}`] = obj[key];
			} else {
				this.resizeNewUnidimensionalObj[key] = obj[key];
			}
		}
		return this.resizeNewUnidimensionalObj;
	},
	letterAppearCount: function(str, fn) { //某个字母在某个字符串中出现的次数
		str.split("").sort().join("").replace(/(.)\1*/g, value => fn && fn(value));
	},
	accMul: function(arg1, arg2) {
		let m = 0;
		const s1 = arg1.toString();
		const s2 = arg2.toString();
		m += s1.split(".").length > 1 ? s1.split(".")[1].length : 0;
		m += s2.split(".").length > 1 ? s2.split(".")[1].length : 0;
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / 10 ** m;
	},
	digitUppercase: function(n) { //数字转换成大写汉子
		const fraction = ['角', '分'];
		const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
		const unit = [
			['元', '万', '亿'],
			['', '拾', '佰', '仟']
		];
		let num = Math.abs(n);
		let s = '';
		fraction.forEach((item, index) => {
			s += (digit[Math.floor(this.accMul(num, 10 * 10 ** index)) % 10] + item).replace(/零./, '');
		});
		s = s || '整';
		num = Math.floor(num);
		for(let i = 0; i < unit[0].length && num > 0; i += 1) {
			let p = '';
			for(let j = 0; j < unit[1].length && num > 0; j += 1) {
				p = digit[num % 10] + unit[1][j] + p;
				num = Math.floor(num / 10);
			}
			s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
		}
		return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
	},
	setHTMLFontSize: function() { //设置根元素字体大小
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
	lazyLoad: function() { //图片懒加载
		var loadedIndex = [];
		this.imgArray.each((index, ele) => $(ele).offset().top - $(document).scrollTop() < window.innerHeight &&
			$(ele).attr("src", $(ele).attr("data-src")) && loadedIndex.unshift(index));
		loadedIndex.map((value, index) => this.imgArray.splice(loadedIndex[index], 1));
	},
	bindEvents: function() {
		$(window).on("scroll", $.proxy(this.handleWindowScroll, this));
		$(window).on("resize", $.proxy(this.handleWindowResize, this));
	},
	handleWindowScroll: function() {
		this.lazyLoad();
	},
	handleWindowResize: function() {
		this.setHTMLFontSize();
	}
});
//new Common();