var Bmob = require('../../utils/bmob.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
var that;

var order_address = "";
var order_latitude = 23.10229;
var order_longitude = 113.3345211;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current_address: '广西大学办公楼-南门'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this;
    setTimeout(function () {
      that.mapCtx.moveToLocation();
    }, 3000);
    //配置腾讯地图SDK
    qqmapsdk = new QQMapWX({
      key: 'HF3BZ-ILCCF-G3YJX-NQM6B-CXM7O-VRBQ7'
    });

    //配置地图控制物
    wx.getSystemInfo({
      success: function (res) {

        that.setData({
          controls: [{
            id: 1,
            iconPath: '/images/location_center.png',
            position: {
              left: res.windowWidth / 2 - 11,
              top: res.windowHeight * 0.37 - 33,
              width: 22,
              height: 33
            },
            clickable: false
          },
          {
            id: 2,
            iconPath: '/images/get_location.png',
            position: {
              left: 10,
              top: res.windowHeight * 0.74 - 68,
              width: 45,
              height: 45
            },
            clickable: true
          },
          ]
        })


      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('mainMap');

  

  },


  translateMarker: function () {
    this.mapCtx.translateMarker({
      markerId: 0,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: 23.10229,
        longitude: 113.3345211,
      },
      animationEnd() {
        console.log('animation end')
      }
    })
  },

  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }]
    })
  },

  userClick: function () {
    var value = wx.getStorageSync('user_objectId');
    console.log("value  " + value);

    if (value) {
      //登陆过
      console.log("前面登陆过，无需再次验证")
      wx.redirectTo({
        url: '../user/Member'
      })

    } else {
      //执行登陆
      wx.navigateTo({
        url: '../user/Auth'
      })
    }
  },

  home_listClick: function () {
    wx.showToast({
      title: '敬请期待',  
      icon: "none"
    })
  },

  enterClick: function () {

    wx.setStorageSync('order_address', order_address);
    wx.setStorageSync('order_latitude', order_latitude);
    wx.setStorageSync('order_longitude', order_longitude);

    var user_objectId = wx.getStorageSync("user_objectId");

    if (user_objectId) {
      wx.navigateTo({
        url: '../order/create'
      })
    } else {
      wx.redirectTo({
        url: '/pages/user/Auth',
      })
    }


  },


  //地图视野发生改变
  regionchange: function (event) {

    if (event.type == "end") {
      that.mapCtx.getCenterLocation({
        success: function (res) {
          order_latitude = res.latitude;
          order_longitude = res.longitude;
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (res) {
              if (res.status == 0) {
                var address = res.result.address;
                var recommend_address = "";


                order_address = address;


                try {
                  recommend_address = res.result.formatted_addresses.recommend;
                  address = recommend_address;
                  order_address = res.result.formatted_addresses.recommend + "@@" + res.result.address;
                }
                catch (err) {
                  address = res.result.address;
                  console.log("没有推荐地址");
                  order_address = address;
                }

                that.setData({
                  current_address: address
                });
              } else {
                console.log("地图解析失败")
              }

            }

          });
        }
      })
    }
  },


  controlsTap: function (event) {

    that.mapCtx.moveToLocation();

  },

  toList: function () {

    var user_objectId = wx.getStorageSync("user_objectId");

    if (user_objectId) {
      wx.navigateTo({
        url: '/pages/order/list',
      })
    } else {
      wx.navigateTo({
        url: '/pages/user/Auth',
      })
    }

  },

  tomyList: function () {
    var user_objectId = wx.getStorageSync("user_objectId");

    if (user_objectId) {
      wx.navigateTo({
        url: '/pages/order/my',
      })
    } else {
      wx.navigateTo({
        url: '/pages/user/Auth',
      })
    }
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