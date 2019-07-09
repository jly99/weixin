var that;
var app = getApp();
var Bmob = require("../../utils/bmob.js");
var messageValue = '';
var urlArr = [];
var tempFilePaths;
var ress;
var order_address = "";
var order_latitude = 23.10229;
var order_longitude = 113.3345211;
var point;
var isChoseImg = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlArr: [],
    TopTips: '',
    showTopTips: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;

    order_address = wx.getStorageSync('order_address');
    order_latitude = wx.getStorageSync('order_latitude');//维度
    order_longitude = wx.getStorageSync('order_longitude');//经度 

    point = new Bmob.GeoPoint({ latitude: order_latitude, longitude: order_longitude });

    var myaddress = order_address.replace("@@", " ");
    that.setData({//初始化数据
      isSrc: false,
      isLoading: false,
      loading: true,
      isdisabled: false,
      confirmPosition: myaddress
    })
  },

  preImg: function (event) {
    var imgurl = event.currentTarget.dataset.img;
    wx.previewImage({
      current: imgurl, // 当前显示图片的http链接
      urls: [imgurl]// 需要预览的图片http链接列表
    })
  },

  choseImg: function () {
    isChoseImg = true;

    var that = this;
    wx.chooseImage({
      count: 5, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有

      success: function (res) {
        ress = res
        console.log("res    " + res.tempFilePaths);

        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);

        that.setData({
          isSrc: true,
          loading: false,
          urlArr: tempFilePaths
        })
      }
    })

  },

  upImg: function () {

    tempFilePaths = ress.tempFilePaths;
    console.log("upImg tempFilePaths:  " + tempFilePaths)

    var imgLength = tempFilePaths.length;
    console.log("imgLength: " + imgLength);
    if (imgLength > 0) {
      var newDate = new Date();
      var newDateStr = newDate.toLocaleDateString();

      var j = 0;

      for (var i = 0; i < imgLength; i++) {
        var tempFilePath = [tempFilePaths[i]];
        var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
        if (extension) {
          extension = extension[1].toLowerCase();
        }
        var name = newDateStr + "." + extension;//上传的图片的别名

        var file = new Bmob.File(name, tempFilePath);
        file.save().then(function (res) {
          wx.hideNavigationBarLoading()
          var url = res.url();
          console.log("第" + i + "张Url" + url);

          urlArr.push(url);
          j++;
          console.log(j, imgLength);

          if (imgLength == j) {
            console.log("imgLength, urlArr如下。。。。。。");
            console.log(imgLength, urlArr);

            var Order = Bmob.Object.extend("Order");
            var order = new Order();

            order.set("message", messageValue);
            order.set("owner_position", point);          
            order.set("position_detail", order_address);


            var member = Bmob.Object.createWithoutData("Member", wx.getStorageSync('objectId'));
            order.set("owner", member);
            order.set("picPaths", urlArr);

            order.save(null, {
              success: function (result) {
                // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
                console.log("日记创建成功, objectId:" + result.id);
                wx.hideLoading();
                wx.showToast({
                  title: '发起成功',
                  icon: 'success'
                })

                that.setData({
                  isSrc: false,
                  isLoading: false,
                  isdisabled: false,
                })

                wx.navigateBack({
                  delta: 2
                })
              },
              error: function (result, error) {
                // 添加失败
                console.log('创建日记失败');

                wx.showToast({
                  title: '发起失败',
                  icon: 'loading'
                })

                that.setData({
                  isLoading: false,
                  isdisabled: false
                })

                wx.navigateBack({
                  delta: 2
                })
              }
            });

          }

        }, function (error) {
          console.log("error" + error)
        });

      }


    }
  },

  //表单验证
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },

  //提交表单
  formSubmit: function (e) {
    console.log("进入formSubmit函数。。。。。。。");
    console.log("messageValue:  " + messageValue);

    var that = this;
    //先进行表单非空验证
    if (messageValue == '' || !isChoseImg) {

      this.setData({
        showTopTips: true,
        TopTips: '留言图片都需要噢~'
      });
    } else {
      wx.showLoading({
        title: '加载中',
      })
      console.log('校验完毕');
      that.setData({
        isLoading: true,
        isdisabled: true
      })

      this.upImg();

    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },


  message_input: function (res) {
    messageValue = res.detail.value;
  },

  //删除图片
  clearPic: function (e) {
    console.log("clearPic  e.currentTarget.dataset:  ");
    console.log(e.currentTarget.dataset);

    var index = e.currentTarget.dataset.index;
    var tempFilePaths = ress.tempFilePaths;

    console.log("clearPic  index:  " + index);
    console.log("clearPic tempFilePaths:   " + tempFilePaths);
    tempFilePaths.splice(index, 1)
    console.log("clearPicslice tempFilePaths:   " + tempFilePaths);
    this.setData({
      tempFilePaths: tempFilePaths,
      urlArr: tempFilePaths
    });

    if (tempFilePaths.length == 0) {
      this.setData({
        isSrc: false,
      });
    }
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