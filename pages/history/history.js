// pages/history/history.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList:[]
  },
  back:function(){
    wx.navigateTo({
      url: '../index/index'
    })
  },
  forward:function(e){
	console.log(e.currentTarget.dataset);
	var orderNo = e.currentTarget.dataset.orderno;
	console.log(orderNo);
	wx.setStorage({
	  key:"orderNo",
	  data:orderNo
	})  
    wx.navigateTo({
      url: '../historypdr/historypdr'
    })
  },
  formatDate:function(date){
  	var date = new Date(date),
  		Y = date.getFullYear(),
  		m = date.getMonth() + 1,
  		d = date.getDate(),
  		H = date.getHours(),
  		i = date.getMinutes(),
  		s = date.getSeconds();
  	if (m < 10) {
  		m = '0' + m;
  	}
  	if (d < 10) {
  		d = '0' + d;
  	}
  	if (H < 10) {
  		H = '0' + H;
  	}
  	if (i < 10) {
  		i = '0' + i;
  	}
  	if (s < 10) {
  		s = '0' + s;
  	}
  	var t = Y + '-' + m + '-' + d + ' ' +H +':'+i+':'+s ;
  	return t;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  var vm = this;
	var userId = "0332zwpn0N0aBm1Rcnmn0xmRpn02zwpi";
	wx.request({
		url: 'http://16861e90p7.imwork.net/icmh-client/common/getRecords.action', 
		data: JSON.stringify({
			userId:userId
		}),
		header: {
			'content-type': 'application/json' // 默认值
		},
		method: 'POST',
		success(res) {
			vm.setData({
				historyList: res.data.data
			});
			console.log(vm.data.historyList);
		}
	})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})