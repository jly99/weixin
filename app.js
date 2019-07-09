var Bmob = require('utils/bmob.js');
Bmob.initialize("693e23f1d098ca8f44d704d1f00efbd2", "348e140ed81fa50e9befb73744ed7e76");
App({
  onLaunch: function () {

    var user = new Bmob.User();
    var newOpenid = wx.getStorageSync('openid')
    if (!newOpenid) {
      wx.login({
        success: function (res) {
          user.loginWithWeapp(res.code).then(function (user) {
            var openid = user.get("authData").weapp.openid;
            console.log(user, 'user', user.id, res);

            wx.setStorageSync('openid', openid)

          }, function (err) {
            console.log(err, 'err');
          });
        }

      });
    }
    
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

  },
  globalData: {
    userInfo: null
  },

  "permisssion": {
  "scope.userlocation": {
    "desc": "您的位置信息将用于小程序确定您的位置并为您匹配附近订单"
    }
  }
})