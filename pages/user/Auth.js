// pages/authorize/authorize.js
var Bmob = require("../../utils/bmob.js");
var exist = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  allow: function (res) {
    console.log(res)
    if (res.detail.userInfo) {
      var nickName = res.detail.userInfo.nickName;
      var avatarUrl = res.detail.userInfo.avatarUrl;
      var openid = wx.getStorageSync('openid');
      console.log("openid:   " + openid);

      //创建类和实例
      var Member = Bmob.Object.extend("Member");
      var member = new Member();
      
      var currentUser = Bmob.User.current(); //将当前用户的用户名写入数据库
      currentUser.set("nickname", nickName);
      currentUser.save(null, {
        success: function (result) {
          // 添加成功
          console.log("将当前用户的用户名写入数据库成功")
        },
        error: function (result, error) {
          // 添加失败
          console.log('将当前用户的用户名写入数据库成功');

        }
      });

      var query = new Bmob.Query(Member);
      query.equalTo("openid", openid);

      query.find({
        success: function (results) {
          console.log("共查询到 " + results.length + " 条记录");

          if (results.length == 0) {
            member.set("openid", openid);
            member.set("nickName", nickName);
            member.set("avatarUrl", avatarUrl);

            //添加数据，第一个入口参数是null
            member.save(null, {
              success: function (result) {
                // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
                console.log("成功, objectId:" + result.id);

                wx.setStorageSync("user_objectId", result.id);
                wx.setStorageSync('user_nickName', nickName);
                wx.setStorageSync('user_avatarUrl', avatarUrl);
                wx.setStorageSync('objectId', result.id);
                console.log("Auth 中缓存的objectId为：   ", result.id)
                wx.redirectTo({
                  url: '/pages/main/home',
                });
              },
              error: function (result, error) {
                // 添加失败
                console.log(error)
                wx.showToast({
                  title: '',
                  icon: 'none',
                  duration: 1000,
                })

              }
            });
          } else {
            results[0].set("avatarUrl", avatarUrl);
            results[0].set("nickName", nickName);

            wx.setStorageSync("user_objectId", results[0].id);
            wx.setStorageSync('user_nickName', nickName);
            wx.setStorageSync('user_avatarUrl', avatarUrl);
            wx.setStorageSync('objectId', results[0].id);

            results[0].save();

            wx.redirectTo({
              url: '/pages/main/home',
            });

          }

        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });


    } else {
      wx.showToast({
        title: '授权失败',
        icon: 'none',
        duration: 1000,
      })
    }


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

  },

})