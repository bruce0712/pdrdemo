// pages/history/history.js
import util from '../../utils/util.js'
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	  var vm = this;
	var userId = "0332zwpn0N0aBm1Rcnmn0xmRpn02zwpi";
	wx.request({
		url: 'http://47.92.174.67/icmh-client/common/getRecords.action', 
		data: JSON.stringify({
			userId:userId
		}),
		header: {
			'content-type': 'application/json' // 默认值
		},
		method: 'POST',
		success(res) {
      Array.from(res.data.data||'').forEach(item=>{
        item.createdDate = util.formatTime(new Date(item.createdDate));
      })
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