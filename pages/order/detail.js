var that;
var object_id = "";
var Bmob = require("../../utils/bmob.js");
var picurl = [];
var owner_objectId = "";
var server_objectId = "";
var enterButtonEable = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    object_id = options.orderid;
    console.log("options.orderid:  " + object_id);
    that.queryDataFromBmob();

  },

  preImg: function (event) {
    var imgurl = event.currentTarget.dataset.img;
    console.log("[]");
    console.log([imgurl])
    wx.previewImage({
      current: imgurl, // 当前显示图片的http链接
      urls: picurl // 需要预览的图片http链接列表
    })
  },

  contact_click: function () {
    wx.navigateTo({
      url: '/pages/chat/chatroom?owner=' + owner_objectId + '&server=' + server_objectId
    });
  },

  enterClick: function () {
    console.log("enterClick中enterButtonEable为:        ",enterButtonEable)
    if(!enterButtonEable){
      wx.showToast({
        title: '不能接自己的订单哦',
        icon: "none"
      })
      enterButtonEable = true//判断完毕之后设为默认值
      return;
    }

    var Order = Bmob.Object.extend("Order");
    var query = new Bmob.Query(Order);

    // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
    query.get(object_id, {
      success: function (result) {
        // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了
        var member = Bmob.Object.createWithoutData("Member", wx.getStorageSync('objectId'));
        result.set('server', member);
       
        result.save();
        wx.showToast({
          title: '参与成功',
          icon: 'success'
        })
        setTimeout(function () {
          that.queryDataFromBmob();
        }, 1000);

      },
      error: function (object, error) {

      }
    });
  },


  queryDataFromBmob: function () {

    var Order = Bmob.Object.extend("Order");
    var query = new Bmob.Query(Order);
    query.include("owner");  //own 字段名称，类型 Pointer
    query.include("server");  //own 字段名称，类型 Pointer
    query.get(object_id, { 
      success: function (result) {
        wx.stopPullDownRefresh();

        var position_detail = result.get("position_detail");
        position_detail = position_detail.replace("@@", "-");
        var message = result.get("message");

        var owner_position = result.get('owner_position');

        var picPaths = result.get('picPaths');
        picurl = picPaths; 
        var createdAt = result.createdAt;
        var owner_nickName = result.get('owner').nickName;
        var owner_avatarUrl = result.get('owner').avatarUrl;

        var owner_objectid = result.get('owner').objectId;
        console.log("('owner').objectId:   ", owner_objectid)
        console.log("wx.getStorageSync('objectId'):  ", wx.getStorageSync('objectId'))
        if (wx.getStorageSync('objectId') == owner_objectid){
          enterButtonEable = false;
        }

        that.setData({
          position_detail: position_detail,
          message: message,
          picPaths: picPaths,
          createdAt: createdAt,
          owner_nickName: owner_nickName,
          owner_avatarUrl: owner_avatarUrl
        })


        if (result.get('server')) {
          //有服务者
          var server_nickName = result.get('server').nickName;
          var server_avatarUrl = result.get('server').avatarUrl;
          var user_objectId = wx.getStorageSync('user_objectId');

          console.log(result.get('server'))
          if (result.get('owner').objectId == user_objectId) {
            owner_objectId = user_objectId;
            server_objectId = result.get('server').objectId;
            that.setData({
              isState1: false,
              isState2: true,

              server_nickName: server_nickName,
              server_avatarUrl: server_avatarUrl,
            })
          } else {
            server_objectId = user_objectId;
            owner_objectId = result.get('owner').objectId;
            that.setData({
              isState1: false,
              isState2: true,

              server_nickName: server_nickName,
              server_avatarUrl: server_avatarUrl,
            })
          }


        } else {
          that.setData({
            isState1: true
          })
        }

      },
      error: function (result, error) {
        console.log(error);
      }
    });

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