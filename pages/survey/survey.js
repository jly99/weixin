var that = this;
var Bmob = require("../../utils/bmob.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    TopTips: '',
  },

  ceshi: function (e) {
    console.log("e.currentTarget.dataset:");
    console.log(e.currentTarget);

    var index = e.currentTarget.dataset.index;
    console.log("ceshi  index:  " + index);

    wx.setStorageSync("index", index)
  },

  surveySubmit: function (e) {
    var that = this;

    wx.showModal({
      title: '提示',
      content: '是否确认提交反馈',
      success: function (res) {
        console.log("res.confirm:  " + res.confirm);
        if (res.confirm) {
          var index = wx.getStorageSync("index");

          var Feedback = Bmob.Object.extend("Feedback");
          var feedback = new Feedback();

          var member = Bmob.Object.createWithoutData("Member", wx.getStorageSync('objectId'));
          feedback.set("feedUser", member);

          if (index == "1") {
            feedback.set("survey", "非常愿意");
          } else if (index == "2") {
            feedback.set("survey", "愿意");
          } else if (index == '3') {
            feedback.set("survey", "看心情");
          } else if (index == '4') {
            feedback.set("survey", "不愿意");
          }

          feedback.save(null, {
            success: function (result) {
              console.log("反馈成功");
              wx.showToast({
                title: '感谢您的参与',
              })
              wx.redirectTo({
                url: '/pages/user/Member',
              })
            },
            error: function (result, error) {
              //添加失败
              console.log("反馈失败=");
              console.log(error);
              wx.redirectTo({
                url: '/pages/user/Member',
              })
            }
          })
        } else {
          wx.redirectTo({
            url: '/pages/user/Member',
          })
        }
      }
    })
    setTimeout(function () {
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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