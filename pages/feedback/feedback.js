var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js')

var app = getApp();
var that;
var username = wx.getStorageSync("my_nick");

Page({
  data: {
    // list_remind: '加载中',
    // status: false,  //是否显示列表
    // itemopen: false,
    // feednum: 0, //反馈的次数
    // hasFeed: false,
    title: '',
    content: '',
    info: '',
    showTopTips: false,
    TopTips: '',
  },
  onLoad: function () {
    that = this;
    that.setData({//初始化数据
      src: "",
      isSrc: false,
      // ishide: "0",
      // autoFocus: true,
      isLoading: false,
      loading: true,
      isdisabled: false
    })

    //获取设备和用户信息
    wx.getSystemInfo({
      success: function (res) {
        var info = '---\r\n**用户信息**\r\n';
        info += '用户名：' + username;
        info += '\r\n手机型号：' + res.model;
        info += '（' + res.platform + ' - ' + res.windowWidth + 'x' + res.windowHeight + '）';
        info += '\r\n微信版本号：' + res.version;
        info += '\r\nTogether版本号：' + app.version;
        that.setData({
          info: info
        });
        console.log(info);
      }
    });

  },
  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {
    wx.hideToast()

  },
  onShow: function () {
    console.log("调用onShow")
  },

  //上传图片
  uploadPic: function () {
    var that = this;

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          isSrc: true,
          src: tempFilePaths
        })
      }
    })

    console.log("图片上传完成");
  },

  //删除图片
  clearPic: function () {//删除图片
    that.setData({
      isSrc: false,
      src: ""
    })
    console.log("图片删除完成");
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
  submitForm: function (e) {
    var title = e.detail.value.title;
    var content = e.detail.value.content;

    console.log("title：   " + title);
    console.log("content   " + content);

    //先进行表单非空验证
    if (title == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入反馈标题'
      });
    } else if (content == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入反馈内容'
      });
    } else {
      that.setData({
        isLoading: true,
        isdisabled: true
      })
      wx.showModal({
        title: '提示',
        content: '是否确认提交反馈',
        success: function (res) {
          console.log("res.confirm:  " + res.confirm);
          if (res.confirm) {
            var Feedback = Bmob.Object.extend("Feedback");
            var feedback = new Feedback();


            var member = Bmob.Object.createWithoutData("Member", wx.getStorageSync('objectId'));
            feedback.set("feedUser", member);


            feedback.set("title", title);
            feedback.set("content", content);
            feedback.set("feedinfo", that.data.info);
            if (that.data.isSrc == true) {
              var name = that.data.src; //上传图片的别名
              var file = new Bmob.File(name, that.data.src);
              file.save();
              console.log("Pic name:   " + name);
              feedback.set("feedpic", name);
            }
            feedback.save(null, {
              success: function (result) {
                console.log("反馈成功");
                that.setData({
                  isLoading: false,
                  isdisabled: false,
                  eventId: result.id,
                })

                //重置表单
                that.setData({
                  title: '',
                  content: "",
                  src: "",
                  isSrc: false,
                })

                wx.redirectTo({
                  url: '/pages/user/Member',
                })

              },
              error: function (result, error) {
                //添加失败
                console.log("反馈失败=");
                console.log(error);
                that.setData({
                  isLoading: false,
                  isdisabled: false
                })
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
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  }

});