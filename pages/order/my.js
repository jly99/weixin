var Bmob = require("../../utils/bmob.js");
var that;
var isMyOrder = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    isFilterByMe: true
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
    that.queryTestFromBmob();
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

  preImg: function (event) {
    var imgurl = event.currentTarget.dataset.img;
    wx.previewImage({
      current: imgurl, // 当前显示图片的http链接
      urls: [imgurl] // 需要预览的图片http链接列表
    })
  },

  barButtonClick_1: function () {
    isMyOrder = true;
    that.queryTestFromBmob();
    that.setData({
      isFilterByMe: true
    })
  },

  barButtonClick_2: function () {
    isMyOrder = false;
    that.queryTestFromBmob();
    that.setData({
      isFilterByMe: false
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    that.queryTestFromBmob();
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

  detailClick: function (event) {
    var orderid = event.currentTarget.dataset.objid;
    if (orderid.length > 0) {
      wx.navigateTo({
        url: '/pages/order/detail?orderid=' + orderid
      });
    }
  }, 

  //======================bmob数据操作=======================

  queryTestFromBmob: function () {

        // 创建查询
        var Order = Bmob.Object.extend("Order");
        var query = new Bmob.Query(Order);
        query.include("owner");  //own 字段名称，类型 Pointer
        // location附近的位置
        

        var isme = Bmob.Object.createWithoutData("Member", wx.getStorageSync('objectId'));

        if (isMyOrder){
          query.equalTo("owner", isme);
        }else {
          query.equalTo("server", isme);
        }
        
        console.log("wx.getStorageSync('objectId'):     " + wx.getStorageSync('objectId'));
        // 查询
        query.find({
          success: function (results) {

            console.log("results:   " + results);
            console.log("共查询到 " + results.length + " 条记录");
            var tempList = [];
            for (var i = results.length-1; i >= 0; i--) {
              var objectId = results[i].id;


              var position_detail = results[i].get("position_detail");
              var message = results[i].get("message");
              var owner_position = results[i].get('owner_position');

              var picPaths = results[i].get('picPaths');
              var createdAt = results[i].createdAt;
              var nickName = results[i].get('owner').nickName;
              var avatarUrl = results[i].get('owner').avatarUrl;
              console.log(picPaths);
              var jsonA;
              jsonA = {

                "position_detail": position_detail.substring(0, position_detail.lastIndexOf('@@')) || '',//split("@@")
                "objectId": objectId || '',
                "owner_position": owner_position || '',
                "nickName": nickName || '',
                "message": message || '',
                "picPaths": picPaths || '',
                "createdAt": createdAt || '',
                "avatarUrl": avatarUrl || ''
              }
              tempList.push(jsonA);
            }

            wx.stopPullDownRefresh();
            that.setData({
              orderList: tempList
            })

          }
        });
  


  },




})