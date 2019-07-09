// pages/login/login.js
var Bmob = require("../../utils/bmob.js");
var userName = ''
var passWord = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  username_input: function(res) {
    userName = res.detail.value
  },

  password_input: function(res) {
    passWord = res.detail.value
  },

  log_in: function() {
    Bmob.User.logIn(userName, passWord, {
      success: function(user) {
        console.log("登录成功")

        var currentUser = Bmob.User.current();
        wx.setStorageSync("currentUser", currentUser)
        console.log("currentUser:   ", currentUser)

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        })

        wx.redirectTo({
          url: '../user/Auth',
        })
      },
      error: function(user, error) {
        console.log("登录失败")
        wx.showToast({
          title: '登录失败,请检查用户名和密码！',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

  To_register: function() {
    wx.redirectTo({
      url: '../login/register',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var user = wx.getStorageSync("currentUser")
    console.log("user:     ", user)
    if (user) {
      console.log("老用户登录成功")
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })
      wx.redirectTo({
        url: '../main/home',
      })
    } else {
      console.log("首次登录，需要登录信息")
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})