// pages/member/member.js
var Bmob = require("../../utils/bmob.js");
var needLogin = true;
var app = getApp()
var that;
Page({
  data: {
    avatarUrl: "/images/default-avatar.png",
    nickName: "请登录",
    isLogin: false
  },


  toAboutUs: function () {
    wx.navigateTo({
      url: '/pages/aboutUs/aboutUs',
    })
  },

  toSurvey: function () {
    wx.navigateTo({
      url: '/pages/survey/survey',
    })
  },

  toFeedback: function () {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },

  homeButtonClick: function () {
    wx.redirectTo({
      url: '../main/home',
    })
  },

  log_out:function() {   
    console.log("member界面currentUser():    ", wx.getStorageSync("currentUser"))
    // Bmob.User.logOut();
    // var currentUser = Bmob.User.current();  //缓存中还有currentUser的信息，要清楚缓存
    wx.removeStorageSync("currentUser")
    console.log("member界面清除缓存之后currentUser():    ", wx.getStorageSync("currentUser"))

    console.log("退出登录")
    wx.redirectTo({
      url: '../login/login',
    })
  },

  updateUserInfo: function (object_id, avatarUrl, nickName) {
    //========更新用户数据========
    console.log("更新用户数据");

    var Member = Bmob.Object.extend("Member");
    var query = new Bmob.Query(Member);
    // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
    query.get(object_id, {
      success: function (result) {
        // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了

        result.set('avatarUrl', avatarUrl);
        result.set('nickName', nickName);
        result.save();
        // The object was retrieved successfully.
      },
      error: function (object, error) {

      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
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
    try {
      var value = wx.getStorageSync('user_objectId');
      var user_nickName = wx.getStorageSync('user_nickName');
      var user_avatarUrl = wx.getStorageSync('user_avatarUrl');
      if (value) {
        wx.getUserInfo({
          success: function (res) {
            var userInfo = res.userInfo
            var nickName = userInfo.nickName
            var avatarUrl = userInfo.avatarUrl

            if ((avatarUrl != user_avatarUrl) || (nickName != user_nickName)) {

              console.log("(avatarUrl != user_avatarUrl) || (nickName != user_nickName)");

              user_avatarUrl = avatarUrl;
              user_nickName = nickName;
              wx.setStorageSync('user_nickName', nickName);
              wx.setStorageSync('user_avatarUrl', avatarUrl);

              that.updateUserInfo(value, avatarUrl, nickName);
            }

            needLogin = false;
            wx.setStorageSync('needLogin', needLogin);
            that.setData({
              avatarUrl: user_avatarUrl,
              nickName: user_nickName,
              isLogin: true
            })



          }
        })




        //如果得到用户的openid则不执行操作，就是说已经登陆过了 
      } else {
        console.log('执行login1')
      }
    } catch (e) {

    }

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

  },



  // addressClick: function () {
  //   if (!needLogin) {
  //     wx.navigateTo({
  //       url: '/pages/address/address'
  //     });
  //   }
  // },


  // loginClick: function () {
  //   if (needLogin) {
  //     wx.navigateTo({
  //       url: '/pages/login/login'
  //     });
  //   }
  // },

})