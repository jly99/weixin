// pages/login/login.js
var Bmob = require("../../utils/bmob.js");
var userName = ''
var passWord = ''
var phoneNumber = ''
var sex
var enterEnable = false;
var that

Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [{
        name: '男',
        value: '男',
        // checked: 'true'
      },
      {
        name: '女',
        value: '女'
      }
    ],

    enterButtonEnable: false,
  },

  sex_input: function(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    console.log("e:   ", e)
    sex = e.detail.value
  },

  username_input: function(res) {
    userName = res.detail.value
  },

  password_input: function(res) {
    var that = this
    passWord = res.detail.value
    that.checkInput();
  },

  phonenumber_input: function(res) {
    phoneNumber = res.detail.value
  },

  checkInput: function() {
    if (passWord.length > 3 && enterEnable == false) {
      enterEnable = true;
      that.setData({
        enterButtonEnable: true
      });
    } else if ((passWord.length <= 3) && enterEnable == true) {
      enterEnable = false;
      that.setData({
        enterButtonEnable: false
      });
    } else {

    }
  },

  register: function() {
    console.log("register...........")
    wx.login({
      success: function(res) {
        console.log("register...........success")
        console.log(res.code)
        if (res.code) {
          console.log("res.code........")
          Bmob.User.requestOpenId(res.code, {
            //获取userData(根据个人的需要，如果需要获取userData的需要在应用密钥中配置你的微信小程序AppId和AppSecret，且在你的项目中要填写你的appId)
            success: function(userData) {
              console.log("wx.getUserInfo success.........")
              var user = new Bmob.User(); //开始注册用户
              user.set("username", userName);
              user.set("password", passWord);
              user.set("mobilePhoneNumber", phoneNumber);
              // user.set("sex", sex);

              user.set("userData", userData);
              user.signUp(null, {
                success: function(res) {
                  console.log("注册成功!");
                  wx.showToast({
                    title: '注册成功',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.redirectTo({
                    url: '../user/Auth',
                  })
                },
                error: function(userData, error) {
                  console.log(error)
                  switch (error.code) {
                    case 202:
                      wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: '用户名已被注册',
                      })
                      break;

                    default:
                      wx.showModal({
                        title: '错误',
                        showCancel: false,
                        content: error.message,
                      })
                      break;
                  }

                }
              });
            },
            error: function(error) {
              // Show the error message somewhere
              console.log("Error: " + error.code + " " + error.message);
            }
          });

        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },

  To_login: function() {
    wx.redirectTo({
      url: '../login/login',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
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