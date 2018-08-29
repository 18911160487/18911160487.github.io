function ContainerHighcharts(res) {
	this.data = res.data;
	this.baseNum = 0;
	this.minimum = 0;
	this.maximum = 0;
	this.chartData = [];
	this.init()
}
$.extend(ContainerHighcharts.prototype, {
	init: function() {
		this.bindEvents();
		this.handleGetChartDataSucc()
	},
	bindEvents: function() {
		$("#fundDetailDataContainer").on("touchstart", $.proxy(this.handleFundDetailDataContainerTouchstart, this));
		$("#fundDetailDataContainer").on("touchend", $.proxy(this.handleFundDetailDataContainerTouchend, this));
		$("#fundDetailDataContainer").on("touchmove", $.proxy(this.handleFundDetailDataContainerTouchmove, this))
	},
	handleFundDetailDataContainerTouchstart: function(e) {
		this.isShowBrokenLine(e.touches[0].clientX, e);
	},
	handleFundDetailDataContainerTouchend: function(e) {
		e.preventDefault();
		e.stopPropagation();
		setTimeout(function() {
			$(".fundDetailDataChange").hide();
		}.bind(this), 3000)
		this.myChart.setOption({
			tooltip: {
				show: false
			}
		})
		return false;
	},
	handleFundDetailDataContainerTouchmove: function(e) {
		this.isShowBrokenLine(e.touches[0].clientX, e);
	},
	isShowBrokenLine: function(sum, e) {
		e.preventDefault();
		e.stopPropagation();
		if(sum > (window.innerWidth * 0.95 - 65) * this.data.dataList.length / 240 + 68 || sum < 55) {
			this.handleFundDetailDataContainerTouchend(e);
		} else {
			$(".fundDetailDataChange").show();
			this.myChart.setOption({
				tooltip: this.tooltip()
			})
		}
		return false;
	},
	handleGetChartDataSucc: function() {
		$(".fundNumber,.fundDetail").show();
		var fundList = this.data.dataList;
		var refreshTime = this.data.time.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5");
		$(".fundDetailEstimates").html(this.data.bizDate + " " + fundList[fundList.length-1].time);
		$(".fundDetailDataChangeTime").html(fundList[fundList.length-1].time);
		$(".fundLoadingUpdateTime").html(refreshTime.split(" ")[1]);
		$(".fundNetValueTime").html(this.data.bizDate.substring(5, 10) + " " + fundList[fundList.length-1].time);
		$(".fundNewNetValueTime").html(this.data.netValueDate.substring(5, 10) ? this.data.netValueDate.substring(5, 10) : '--');
		$(".fundDetailNetValueNumber").html(fundList[fundList.length - 1].estimate);
		$(".fundNetValueNumber").html(this.data.valuation);
		this.setIncreaseDomStyle($(".fundDetailIncreaseNumber,.fundDDCINumber").html(fundList[fundList.length - 1].forecastGrowth));
		this.setIncreaseDomStyle($(".fundIncreaseNumber").html(this.data.valuationIncrease));
		$(".fundNewNetValueNumber").html(this.data.netValue ? this.data.netValue : '--');
		this.setIncreaseDomStyle($(".fundDayIncreaseNumber").html(this.data.netValueIncrease ? this.data.netValueIncrease : '--'));
		this.baseNum = parseFloat(this.data.valuation);
		this.today_n = refreshTime.replace(/-/g, "/").split(" ")[0];
		for(var i = 0; i < fundList.length; i += 1) {
			fundList[i].time = new Date(this.today_n + " " + fundList[i].time).getTime()
		}
		for(var i = 0; i < 242; i += 1) {
			if(fundList.length > i) {
				this.chartData.push({
					"name": fundList[i].time,
					"value": [fundList[i].time, parseFloat(fundList[i].forecastGrowth), fundList[i].estimate]
				})
			} else {
				var time = fundList[fundList.length - 1].time + (i - fundList.length + 1 + (i >= 121 ? 90 : 0)) * 60 * 1000;
				this.chartData.push({
					"name": time,
					"value": [time, null, null]
				})
			}
		}
		var newFundList = JSON.parse(JSON.stringify(fundList));
		newFundList.sort(function(arr, brr) {
			return parseFloat(arr.forecastGrowth) - parseFloat(brr.forecastGrowth)
		});
		this.minimum = parseFloat(newFundList[0].forecastGrowth);
		this.maximum = parseFloat(newFundList[newFundList.length - 1].forecastGrowth);
		this.containerHighcharts()
	},
	setIncreaseDomStyle: function(dom) {
		if(dom.html() == '--') {
			return
		}
		var html = parseFloat(dom.html()).toFixed(2);
		dom.html((html > 0 ? "+" + html : html) + '%').css("color", parseFloat(html) > 0 ? "#f4333c" : parseFloat(html) < 0 ? "#1c9a00" : "#808080")
	},
	tooltip: function() {
		return {
			show: true,
			trigger: 'axis',
			axisPointer: {
				type: 'cross'
			},
			formatter: function(params) {
				var date = new Date(params[0].name);
				var h = date.getHours();
				var m = date.getMinutes();
				var time = (h > 9 ? h : ("0" + h)) + ":" + (m > 9 ? m : ("0" + m));
				$(".fundDetailDataChangeTime").html(params[0].value[1] ? time : $(".fundDetailDataChangeTime").html());
				this.setIncreaseDomStyle($(".fundDDCINumber").html(params[0].value[1] ? params[0].value[1] : $(".fundDDCINumber").html()));
				return null;
			}.bind(this)
		}
	},
	containerHighcharts: function() {
		var baseNum = this.baseNum;
		var minimum = this.minimum;
		var maximum = this.maximum;
		var today_n = this.today_n.replace(/-/g, "/");
		var chartData = this.chartData;
		this.myChart = echarts.init(document.getElementById("fundDetailDataContainer"));
		this.myChart.setOption({
			tooltip: this.tooltip(),
			grid: {
				left: '3%',
				right: '3%',
				bottom: '0%',
				top: '4%',
				containLabel: true
			},
			color: '#2f85ff',
			xAxis: {
				type: 'category',
				axisLabel: {
					show: true,
					textStyle: {
						color: '#fff'
					},
					formatter: function(value) {
						var value = parseInt(value);
						var h = new Date(value).getHours();
						var m = new Date(value).getMinutes();
						return h + ":" + m;
					}
				},
				axisPointer: {
					label: {
						show: false,
						formatter: function(params) {
							return '';
						}
					}
				},
				nameTextStyle: {
					color: '#fff',
					align: 'right',
					fontSize: 10
				},
				axisLine: {
					lineStyle: {
						color: '#d2d7d9'
					}
				},
				axisTick: {
					"show": false
				}
			},
			yAxis: {
				type: 'value',
				splitNumber: 3,
				/*min: function(value) {
					//console.log(value)
					return value.min - (value.max - value.min) / 3;
				},*/
				axisLabel: {
					formatter: function(value) {
						//console.log(value)
						return value.toFixed(3) + "%";
					},
					textStyle: {
						color: '#808080'
					}
				},
				axisPointer: {
					label: {
						show: false,
						formatter: function(params) {
							return ''
						}
					}
				},
				nameTextStyle: {
					color: '#fff'
				},
				axisLine: {
					lineStyle: {
						color: '#fff'
					}
				},
				splitLine: {
					lineStyle: {
						type: 'dashed'
					}
				}
			},
			series: [{
				data: chartData,
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: '1',
				lineStyle: {
					color: '#108ee9',
					width: 1
				},
			}]
		}, true)
	}
});