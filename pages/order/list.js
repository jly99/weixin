var Bmob = require("../../utils/bmob.js");
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    isFilterByPosition: true
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

  preImg: function (event) {
    var imgurl = event.currentTarget.dataset.img;
    wx.previewImage({
      current: imgurl, // 当前显示图片的http链接
      urls: [imgurl] // 需要预览的图片http链接列表
    })
  },

  detailClick: function (event) {
    var orderid = event.currentTarget.dataset.objid;
    console.log("orderid = event.currentTarget.dataset.objid:   " + orderid);

    if (orderid.length > 0) {
      console.log("orderid.length" + orderid.length);
      wx.navigateTo({
        url: '/pages/order/detail?orderid=' + orderid
      });
    }
  },

  //======================bmob数据操作=======================

  queryTestFromBmob: function () {

    var latitude;
    var longitude;

    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        latitude = res.latitude;
        longitude = res.longitude;

        // owner_position对应Web后台的一个字段名称  
        //应该根据当前所在位置建立userGeoPoint，userObject.get("owner_position"); 应该换成当前位置的经纬度
        var point = new Bmob.GeoPoint({ latitude: latitude, longitude: longitude })
        var userGeoPoint = point;
        // 创建查询
        var Order = Bmob.Object.extend("Order");
        var query = new Bmob.Query(Order);
        query.include("owner");  //own 字段名称，类型 Pointer
        // location附近的位置
        query.near("owner_position", userGeoPoint);

        var isme = Bmob.Object.createWithoutData("Member", wx.getStorageSync('objectId'));
        query.notEqualTo("owner", isme);
        console.log("wx.getStorageSync('objectId'):     " + wx.getStorageSync('objectId'));
        query.limit(20);

        
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

              var server = results[i].get('server');
              console.log("list中的server:   " + server);
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
              if (!server) {
                tempList.push(jsonA);
              }

            }
          
            wx.stopPullDownRefresh();
            that.setData({
              orderList: tempList
            })
            
          }
        });
      }
    })



  }


})