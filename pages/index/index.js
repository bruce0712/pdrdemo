//index.js
Page({
  data: { 
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function (e) {
    const text = e.currentTarget.dataset.text;
    if (text === 'new') {
      wx.navigateTo({
        url: '../newpdr/newpdr'
      })
    } else{
      wx.navigateTo({
        url: '../history/history'
      })
    }

  }
})
