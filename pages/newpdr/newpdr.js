//index.js
//获取应用实例
import createCanves from '../../utils/bs-charts.js';

const app = getApp();
const system = wx.getSystemInfoSync()
const canvasWidth = system.screenWidth
const canvasHeight = system.screenHeight * 0.7

let drawTimer = null
//const context = wx.createCanvasContext('canvas')

var data = [];

var gravityNew = 0; //当前传感器数据
var gravityOld = 0; //上次传感器的值
var timeOfLastPeak = 0; //上次波峰的时间
var timeOfThisPeak = 0; //此次波峰的时间
var TimeInterval = 250; //波峰波谷时间差
var timeOfNow = 0; //当前的时间
var peakOfWave = 0; //波峰值
var valleyOfWave = 0; //波谷值
var ThreadValue = 0.4; //初始阈值
var InitialValue = 0.3; //动态阈值需要动态的数据，这个值用于这些动态数据的阈值
var step = 0; //计步
var lastStatus = false; //上一点的状态，上升还是下降
var isDirectionUp = false; //是否上升的标志位
var continueUpCount = 0; //持续上升次数
var continueUpFormerCount = 0; //上一点的持续上升的次数，为了记录波峰的上升次数
var ValueNum = 4;
var tempValue = new Array(ValueNum);
var tempCount = 0;
var lastStep = 0;
var nowStep = 0;
var lastRotate = 0;
var nowRotate = 0;
var lastTime = 0;
var nowTime = 0;
var x = 0;
var y = 0;
var lastX = x;
var lastY = y;
var context;
var isopen = false;
var baseN = 5;
var isfirststep = true;
Page({
	data: {
		fx: '../../images/fx.png',
		text: 'start',
		direction: '东南', //方向
		angle: '120', //角度
		disabled: '',
		start: true,
		stop: false,
		x: "",
		y: "",
		z: "",
		currentStep: 0, //总步数
		direction: '无',
		lastRotate: 0,
		stepData: [],
		xScroll: "",
		yScroll: "",
		nowRotate: 0,
		orderNo: null,
		userId: null,
		userInfo:{},
		sx:0,
		sy:0
	},
	startAccelerometer: function() {
		var vm = this;
		isopen = true;
		wx.startAccelerometer({ //开始加速度计
			interval: 'game'
		});
		wx.startCompass(); //开启罗盘
		vm.setData({
			start: false,
			stop: true
		}); //显示停止按钮


		lastTime = Date.now(); //开启后将当前时间设定为上一个一时间
		lastStep = step; //开启后将当前步数改为准确步数


		wx.onAccelerometerChange(function(res) {
			app.globalData.x = res.x;
			app.globalData.y = res.y;
			app.globalData.z = res.z;
			vm.setData({
				x: res.x,
				y: res.y,
				z: res.z
			});
			vm.onSensorChanged(res.x, res.y, res.z); //记录数据
		});
		wx.onCompassChange(function(res) {
			if (lastRotate == 0) {
				lastRotate = res.direction.toFixed(0);
				vm.setData({
					nowRotate: nowRotate,
					lastRotate: lastRotate
				});
			} else {
				var calRatate = res.direction.toFixed(0);

				if (lastRotate > 345 && calRatate < 15) {
					nowRotate = parseInt(calRatate) + 360;
				} else {
					nowRotate = calRatate;
				}
				vm.setData({
					nowRotate: calRatate,
					lastRotate: lastRotate
				});
				if (Math.abs(nowRotate - lastRotate) > 30) { //表示方向发生偏移
					nowStep = step; //目前总步数
					nowTime = Date.now(); //当前时间

					if (nowStep - lastStep <= 1) {
						//虽然方向发生了偏移,但是如果在偏移方向上未行走步数,则依然表示未发生偏移
						lastRotate = calRatate;
						return;
					}
					switch (true) {
						case lastRotate < 22.5:
							app.globalData.direction = "北";
							vm.setData({
								direction: "北"
							});
							break;
						case lastRotate > 22.5 && lastRotate < 67.5:
							app.globalData.direction = "东北";
							vm.setData({
								direction: "东北"
							});
							break;
						case lastRotate > 67.5 && lastRotate < 112.5:
							app.globalData.direction = "东";
							vm.setData({
								direction: "东"
							});
							break;
						case lastRotate > 112.5 && lastRotate < 157.5:
							app.globalData.direction = "东南";
							vm.setData({
								direction: "东南"
							});
							break;
						case lastRotate > 157.5 && lastRotate < 202.5:
							app.globalData.direction = "南";
							vm.setData({
								direction: "南"
							});
							break;
						case lastRotate > 202.5 && lastRotate < 247.5:
							app.globalData.direction = "西南";
							vm.setData({
								direction: "西南"
							});
							break;
						case lastRotate > 247.5 && lastRotate < 292.5:
							app.globalData.direction = "西";
							vm.setData({
								direction: "西"
							});
							break;
						case lastRotate > 292.5 && lastRotate < 337.5:
							app.globalData.direction = "西北";
							vm.setData({
								direction: "西北"
							});
							break;
					}
					var dataJson = {
						step: 0,
						rotate: 0,
						direction: '无',
						time: 0,
						rangeMeter: 0,
						lastX: 0,
						lastY: 0,
						x: 0,
						y: 0,
						waitCalRotate: 0
					};
					dataJson.step = nowStep - lastStep; //行走步数
					dataJson.rotate = lastRotate; //行走方向
					dataJson.direction = app.globalData.direction; //方向描述
					dataJson.time = ((nowTime - lastTime) / 1000).toFixed(0); //行走时间
					dataJson.rangeMeter = ((nowStep - lastStep) * 0.8).toFixed(1); //行走距离


					//绘制线路
					var waitCalRotate = 0;
					switch (true) {
						case lastRotate <= 90:
							waitCalRotate = lastRotate;
							x = parseFloat(lastX) + Math.sin(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							y = parseFloat(lastY) - Math.cos(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							break;
						case lastRotate > 90 && lastRotate <= 180:
							waitCalRotate = 180 - lastRotate;
							x = parseFloat(lastX) + Math.sin(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							y = parseFloat(lastY) + Math.cos(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							break;
						case lastRotate > 180 && lastRotate <= 270:
							waitCalRotate = 270 - lastRotate;
							x = parseFloat(lastX) - Math.sin(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							y = parseFloat(lastY) + Math.cos(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							break;
						case lastRotate > 270 && lastRotate < 360:
							waitCalRotate = 360 - lastRotate;
							x = parseFloat(lastX) - Math.sin(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							y = parseFloat(lastY) - Math.cos(2 * Math.PI / 360 * waitCalRotate) * dataJson.rangeMeter * baseN;
							break;
					}
					console.log("当前坐标-x:"+x+";y:"+y);
					dataJson.lastX = (parseFloat(lastX) + parseFloat(450)).toFixed(2);
					dataJson.lastY = (parseFloat(lastY) + parseFloat(450)).toFixed(2);
					dataJson.x = (parseFloat(x) + parseFloat(450)).toFixed(2);
					dataJson.y = (parseFloat(y) + parseFloat(450)).toFixed(2);
					dataJson.waitCalRotate = waitCalRotate;
					data.push(dataJson);
					//渲染到页面
					app.globalData.stepData = data;
					vm.setData({
						stepData: data
					});
					vm.dramCanvas(context);
					lastX = x;
					lastY = y;

					lastRotate = calRatate; //发生方向偏移后将当前点作为起始点
					lastStep = nowStep; //发生方向偏移后将当前步数作为起始步数
					lastTime = nowTime; //发生方向偏移后将当前时间作为起始时间
				}
			}
		});
	},
	uuid: function() {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	},
	stopAccelerometer: function() {
		var vm = this;
		wx.stopAccelerometer();
		wx.stopCompass();
		vm.setData({
			start: true,
			stop: false
		});
		isopen = false;
		wx.showToast({
			title: '成功',
			icon: 'success',
			duration: 2000
		});
		
		
		var order = {
			record: []
		};
		order.userId = "0332zwpn0N0aBm1Rcnmn0xmRpn02zwpi";
		order.orderNo = vm.uuid();
		order.record = data;
		console.log(JSON.stringify(order));
		wx.request({
			url: 'http://47.92.174.67/icmh-client/common/pdrFindCar.action', //仅为示例，并非真实的接口地址
			data: JSON.stringify(
				order
			),
			header: {
				'content-type': 'application/json' // 默认值
			},
			method: 'POST',
			success(res) {
				console.log(res.data)
			}
		})
	},
	login: function() {
		wx.login({
		  success: res => {
			console.log(res.code)
			wx.request({
				url: 'http://47.92.174.67/icmh-client/customer/getUserInfoByCode.action',
				data:{"code":res.code,"appCode":'pdr'},
				header: {
					'content-type': 'application/json' // 默认值
				},
				method: 'POST',
				success(res) {
					console.log(res.data)
				}
			});
		  }
		})
	},


	onLoad: function() {
		var vm = this;
		//先绘制坐标图
		context = vm.createCanvas();
		//绘制原点
		context.beginPath();
		context.moveTo(parseFloat(x) + parseFloat(450), parseFloat(y) + parseFloat(450));
		context.lineTo(parseFloat(x) + parseFloat(450), parseFloat(y) + parseFloat(450));
		context.setStrokeStyle('#000000');
		context.stroke();
		context.draw(true);
		
		// vm.setData({
		// 	sx:450px,
		// 	sy:450px
		// });
		// vm.login();
	},
	dramCanvas: function(context) {

		let pathColor = 'blue';
		context.beginPath();
		context.moveTo(parseFloat(lastX) , parseFloat(lastY) );
		context.lineTo(parseFloat(x), parseFloat(y));
		context.setStrokeStyle(pathColor);
		context.closePath();
		context.stroke();
		context.draw(true);
	},
	createCanvas: function() {
		var vm = this;
		let context = wx.createCanvasContext('canvasQr', vm);
		var xScroll = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
		var yScroll = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
		var _xScroll = [-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0];
		var _yScroll = [-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0];
		//绘制X轴
		let xAxisColor = '#000000'; //X轴颜色
		let yAxisColor = '#000000'; //y轴颜色

		context.setTextAlign('center')
		context.setFontSize(8)
		context.setFillStyle(xAxisColor);
		context.translate(450, 450)
		//Y轴
		context.setStrokeStyle(yAxisColor);
		context.beginPath();
		context.moveTo(0, 0);
		// context.lineTo(0, 450);
		context.closePath();
		context.stroke();
		for (let index = 0; index < yScroll.length; index++) {
			let ylenght = (450 / (yScroll.length - 1)) * (index) 
			context.fillText((yScroll[index]).toFixed(0), 0, ylenght)
		}
		//-Y轴
		context.setStrokeStyle(yAxisColor);
		context.beginPath();
		context.moveTo(0, 0);
		//context.lineTo(0, -450);
		context.closePath();
		context.stroke();
		for (let index = 0; index < _yScroll.length; index++) {
			let ylenght = (450 / (_yScroll.length - 1)) * (index)-450
			context.fillText((_yScroll[index]).toFixed(0), 0, ylenght)
		}

		//X轴
		context.setStrokeStyle(xAxisColor);
		context.beginPath();
		context.moveTo(0, 0);
		// context.lineTo(450, 0);
		context.closePath();
		context.stroke();

		for (let index = 0; index < xScroll.length; index++) {
			let xlegth = (450 / (xScroll.length - 1)) * (index) 
			context.fillText(xScroll[index], xlegth, 0)
		}
		//-X轴
		context.setStrokeStyle(xAxisColor);
		context.beginPath();
		context.moveTo(0, 0);
		//context.lineTo(-450, 0);
		context.closePath();
		context.stroke();

		for (let index = 0; index < _xScroll.length; index++) {
			let xlegth = (450 / (_xScroll.length - 1)) * (index)-450
			context.fillText(_xScroll[index], xlegth, 0)
		}
		context.draw(true);
		return context;

	},
	onSensorChanged: function(x, y, z) {
		var vm = this;
		gravityNew = Math.sqrt(x * x + y * y + z * z);
		vm.detectorNewStep(gravityNew);
	},
	detectorNewStep: function(gravityNew) {
		var vm = this;
		if (gravityOld != 0 && vm.detectorPeak(gravityNew, gravityOld)) {
			timeOfLastPeak = timeOfThisPeak;
			timeOfNow = Date.now();
			if (timeOfNow - timeOfLastPeak >= TimeInterval &&
				(peakOfWave - valleyOfWave >= ThreadValue)) {
				timeOfThisPeak = timeOfNow;
				/*
				 * 更新界面的处理，不涉及到算法
				 * 一般在通知更新界面之前，增加下面处理，为了处理无效运动：
				 * 1.连续记录10才开始计步
				 * 2.例如记录的9步用户停住超过3秒，则前面的记录失效，下次从头开始
				 * 3.连续记录了9步用户还在运动，之前的数据才有效
				 * */
				// mStepListeners.countStep();
				var current = step++;
				app.globalData.currentStep = current;
				vm.setData({
					currentStep: current
				});
			}
			if (timeOfNow - timeOfLastPeak >= TimeInterval &&
				(peakOfWave - valleyOfWave >= InitialValue)) {
				timeOfThisPeak = timeOfNow;
				ThreadValue = vm.peakValleyThread(peakOfWave - valleyOfWave);
			}
		}
		gravityOld = gravityNew;
	},
	/*
	 * 检测波峰
	 * 以下四个条件判断为波峰：
	 * 1.目前点为下降的趋势：isDirectionUp为false
	 * 2.之前的点为上升的趋势：lastStatus为true
	 * 3.到波峰为止，持续上升大于等于2次
	 * 4.波峰值大于20
	 * 记录波谷值
	 * 1.观察波形图，可以发现在出现步子的地方，波谷的下一个就是波峰，有比较明显的特征以及差值
	 * 2.所以要记录每次的波谷值，为了和下次的波峰做对比
	 *
	 */
	detectorPeak: function(newValue, oldValue) {
		lastStatus = isDirectionUp;
		if (newValue >= oldValue) {
			isDirectionUp = true;
			continueUpCount++;
		} else {
			continueUpFormerCount = continueUpCount;
			continueUpCount = 0;
			isDirectionUp = false;
		}

		if (!isDirectionUp && lastStatus && (continueUpFormerCount >= 2 || oldValue > 20)) {
			peakOfWave = oldValue;
			return true;
		} else if (!lastStatus && isDirectionUp) {
			valleyOfWave = oldValue;
			return false;
		} else {
			return false;
		}
	},
	/*
	 * 阈值的计算
	 * 1.通过波峰波谷的差值计算阈值
	 * 2.记录4个值，存入tempValue[]数组中
	 * 3.在将数组传入函数averageValue中计算阈值
	 * */
	peakValleyThread: function(value) {
		var vm = this;
		var tempThread = ThreadValue;
		if (tempCount < ValueNum) {
			tempValue[tempCount] = value;
			tempCount++;
		} else {
			tempThread = vm.averageValue(tempValue, ValueNum);
			for (var i = 1; i < ValueNum; i++) {
				tempValue[i - 1] = tempValue[i];
			}
			tempValue[ValueNum - 1] = value;
		}
		return tempThread;
	},
	/*
	 * 梯度化阈值
	 * 1.计算数组的均值
	 * 2.通过均值将阈值梯度化在一个范围里
	 * */
	averageValue: function(value, n) {
		var ave = 0;
		for (var i = 0; i < n; i++) {
			ave += value[i];
		}
		ave = ave / ValueNum;

		if (ave >= 8)
			ave = 4.3;
		else if (ave >= 7 && ave < 8)
			ave = 3.3;
		else if (ave >= 4 && ave < 7)
			ave = 2.3;
		else if (ave >= 3 && ave < 4)
			ave = 2.0;
		else {
			ave = 0.3;
		}
		return ave;
	},
	navTo: function() {
		wx.navigateTo({
			url: "../demo/index"
		})
	},
	recordStart: function() {
		var vm = this;
		if (this.data.text == 'start') {
			this.setData({
				text: 'end'
			})
			this.startAccelerometer();
		} else {
			if (this.data.disabled == 'disabled') return;
			wx.showModal({
				title: '是否结束寻车？',
				content: '点击取消，返回继续寻车',
				success(res) {
					if (res.confirm) {
						vm.setData({
							disabled: 'disabled'
						});
						vm.stopAccelerometer();
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				}
			})
		}


	}
})
