var Bmob = require("../../utils/bmob.js");
var that;
var app = getApp();
var openid;
var owner_objectId;
var server_objectId
let objectId;
var user_nickName = "";
var user_avatarUrl = "";
var contact_nickName = "";
var contact_avatarUrl = "";
var current_user_type = 1; //用于判断当前用户类型，1是owner，2是server
var myDate = new Date();
var currentDate = "";
var sameTime = "";
var oldMessages = [];  //每次跟Bmob同步就更新
var timeInterval_id;
var limitChatReflash = 0;//限制聊天刷新频率
/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
  if (!msgUuid.next) {
    msgUuid.next = 0;
  }
  return 'msg-' + (++msgUuid.next);
}

/**
 * 生成聊天室的系统消息
 */
function createSystemMessage(content) {
  return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, isMe, isPic) {
  return { id: msgUuid(), type: 'speak', content, user, isMe, isPic };
}

// 声明聊天室页面
Page({

  /**
   * 聊天室使用到的数据，主要是消息集合以及当前输入框的文本
   */
  data: {
    messages: [],
    inputContent: '',
    lastMessageId: 'none',
    msgObjectId: "",
    objectId: ""
  },

  /**
   * 页面渲染完成后，启动聊天室
   * */
  onReady: function () {

  },

  onShareAppMessage: function () {

  },

  /**
   * 后续后台切换回前台的时候，也要重新启动聊天室
   */
  onShow: function (options) {



  },
  onLoad: function (options) {

    that = this;

 
    owner_objectId = options.owner;
    server_objectId = options.server;
    console.log("owner_objectId" + owner_objectId );
    console.log("server_objectId" + server_objectId);
    currentDate = myDate.getDate().toString();
    if (!server_objectId) {
      this.pushMessage(createSystemMessage('您当前未登陆...'));
    } else {
      user_nickName = wx.getStorageSync('user_nickName');
      user_avatarUrl = wx.getStorageSync('user_avatarUrl');
      //加载默认数据
      that.loadUserInfo();
      loadOldMessages();

    }



    //设定时间任务来获取新的消息,并且限制接口频率
    timeInterval_id = setInterval(function () {
      if (limitChatReflash < 100) {
        loadNewMessages();
        limitChatReflash++;
      } else if (limitChatReflash < 300)  {
        limitChatReflash++;
        if (limitChatReflash%2 == 0)
        loadNewMessages();
      } else {
        limitChatReflash++;
        if (limitChatReflash % 4 == 0)
          loadNewMessages();
      }
     
    }, 8000);


  },
  loadUserInfo: function () {
    if (owner_objectId == wx.getStorageSync('user_objectId')){
      current_user_type = 1;
      console.log("current_user_type = 1;");
      var Member = Bmob.Object.extend("Member");
      var query = new Bmob.Query(Member);
      query.get(server_objectId, {
        success: function (result) {
          contact_nickName = result.get('nickName');
          contact_avatarUrl = result.get('avatarUrl');
        },
        error: function (result, error) {
          console.log("查询失败");
        }
      });
    }else {
      console.log("current_user_type = 2;");
      current_user_type = 2;
      var Member = Bmob.Object.extend("Member");
      var query = new Bmob.Query(Member);
      query.get(owner_objectId, {
        success: function (result) {
          contact_nickName = result.get('nickName');
          contact_avatarUrl = result.get('avatarUrl');
        },
        error: function (result, error) {
          console.log("查询失败");
        }
      });
    }
  },

  onUnload: function () {
    clearInterval(timeInterval_id);
  },


  onHide: function () {

  },


    

  /**
   * 通用更新当前消息集合的方法
   */
  updateMessages: function (updater) {
    var messages = this.data.messages;
    updater(messages);

    this.setData({ messages });

    // 需要先更新 messagess 数据后再设置滚动位置，否则不能生效
    var lastMessageId = messages.length ? messages[messages.length - 1].id : 'none';
    // console.log(lastMessageId);
    this.setData({ lastMessageId });
    // console.log(lastMessageId);
  },

  /**
   * 追加一条消息
   */
  pushMessage: function (message) {
    this.updateMessages(messages => messages.push(message));
  },

  /**
   * 替换上一条消息
   */
  amendMessage: function (message) {
    this.updateMessages(messages => messages.splice(-1, 1, message));
  },

  /**
   * 删除上一条消息
   */
  popMessage: function () {
    this.updateMessages(messages => messages.pop());
  },

  /**
   * 用户输入的内容改变之后
   */
  changeInputContent: function (e) {
    this.setData({ inputContent: e.detail.value });
  },


  /**
   * 查看照片的信息
   */
  showPicture: function (event) {
    try {
      if (event.currentTarget.dataset.picture.length>2){
   
     
        wx.previewImage({
          current: event.currentTarget.dataset.picture, // 当前显示图片的http链接
          urls: [event.currentTarget.dataset.picture] // 需要预览的图片http链接列表
        })
      }
    } catch (e) {
    }

  },

  /**
   * 点击「发送」按钮，通过信道推送消息到服务器
   **/
  sendMessage: function (e) {


    if (!server_objectId) {
      this.pushMessage(createSystemMessage('您当前未登陆...'));
    } else {



      var content = this.data.inputContent;
      if (!content) {
        return false;
      }

      var Member = Bmob.Object.extend("Member");
      var ServerModel = new Member();
      var OwnerModel = new Member();

      //添加一条记录
      var Diary = Bmob.Object.extend("Message");
      var diary = new Diary();

      ServerModel.id = server_objectId;
      OwnerModel.id = owner_objectId;
      diary.set("server", ServerModel);
      diary.set("owner", OwnerModel);
      if (current_user_type == 1){
        diary.set("say", "owner");
      }else {
        diary.set("say", "server");
      }
     
      diary.set("isPic", false);

      diary.set("content", content);
      //添加数据，第一个入口参数是null



      diary.save(null, {
        success: function (result) {

          // loadDefault(that,openid);

          var Member = Bmob.Object.extend("Member");

          let user;
          user = { "avatarUrl": user_avatarUrl, "nickName": user_nickName };

          // that.pushMessage(createUserMessage(content, user, true, false));   
          //取消立即显示的方法
          loadNewMessages();

          that.setData({ inputContent: '' });

        },
        error: function (result, error) {
          // 添加失败
          console.log('创建日记失败');

        }
      });
    }




  },


  //发送图片
  sendPic: function () {//选择图标
    if (server_objectId) {
      var that = this;
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'], //压缩图
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths
          if (tempFilePaths.length > 0) {
            var name = (myDate + ".jpg");//上传的图片的别名，建议可以用日期命名
            var file = new Bmob.File(name, tempFilePaths);
            file.save().then(function (res) {
              console.log(res.url());

              var Member = Bmob.Object.extend("Member");
              var ServerModel = new Member();
              var OwnerModel = new Member();

              //添加一条记录
              var Diary = Bmob.Object.extend("Message");
              var diary = new Diary();

              ServerModel.id = server_objectId;
              OwnerModel.id = owner_objectId;
              diary.set("server", ServerModel);
              diary.set("owner", OwnerModel);
              if (current_user_type == 1) {
                diary.set("say", "owner");
              } else {
                diary.set("say", "server");
              }
              diary.set("content", res.url());
              diary.set("isPic", true);



              diary.save(null, {
                success: function (result) {

                  // loadDefault(that,openid);

                  var Member = Bmob.Object.extend("Member");

                  let user;
                  user = { "avatarUrl": user_avatarUrl, "nickName": user_nickName };

                  // that.pushMessage(createUserMessage(content, user, true, true));
                  //取消立即显示的方法
                  loadNewMessages();


                },
                error: function (result, error) {
                  // 添加失败
                  console.log('创建日记失败');

                }
              });
            }, function (error) {
              console.log(error);
              that.pushMessage(createSystemMessage('图片发送失败，请重试'));
            })
          }

        }
      })
    } else {
      that.pushMessage(createSystemMessage('您还没有登录'));
    }
  },
});




function loadOldMessages() {


  var Diary = Bmob.Object.extend("Message");
  var query = new Bmob.Query(Diary);
  query.ascending("createdAt");
  var owner = Bmob.Object.createWithoutData("Member", owner_objectId);
  var server = Bmob.Object.createWithoutData("Member", server_objectId);
  query.equalTo("owner", owner);
  query.equalTo("server", server);
  query.include("server");
  query.include("owner");
  console.log(owner_objectId + server_objectId);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条聊天记录");

        // 循环处理查询到的数据
        oldMessages = results;
        for (var i = 0; i < results.length; i++) {
          var _object = results[i];

          var say = _object.get('say')
          var isPic = _object.get('isPic')
          var createTime = _object.createdAt + "";
          var createTimeShow = " ";

          try {
            if (createTime.substring(8, 10) == currentDate) {
              console.log("这是今天!");
              createTimeShow = createTime.substring(10, 16);
            } else {
              createTimeShow = createTime.substring(0, 16);
            }
            if (createTime.substring(10, 13) == sameTime) {

            } else {
              sameTime = createTime.substring(10, 13);
              that.pushMessage(createSystemMessage(createTimeShow));
            }
          } catch (e) {

          }
          var server = _object.get('server');
          var owner = _object.get('owner');
          //============推送消息============
          //结构 id: msgUuid(), type: 'speak', content, user, isMe, isPic
          if (say == "server") {
            if (current_user_type == 1) {
              var user = { "avatarUrl": server.avatarUrl, "nickName": "对方" };
              that.pushMessage(createUserMessage(_object.get('content'), user, false, isPic));
            } else {
              var user = { "avatarUrl": server.avatarUrl, "nickName": "我" };
              that.pushMessage(createUserMessage(_object.get('content'), user, true, isPic));
            }
          } else {
            //say == "owner"
            if (current_user_type == 1) {
              var user = { "avatarUrl": owner.avatarUrl, "nickName": "我" };
              that.pushMessage(createUserMessage(_object.get('content'), user, true, isPic));
            } else {
              var user = { "avatarUrl": owner.avatarUrl, "nickName": "对方" };
              that.pushMessage(createUserMessage(_object.get('content'), user, false, isPic));
            }
          }
        //============推送消息============
 

        }

      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });





}


function loadNewMessages() {


  var Diary = Bmob.Object.extend("Message");
  var query = new Bmob.Query(Diary);
  query.ascending("createdAt");
  var owner = Bmob.Object.createWithoutData("Member", owner_objectId);
  var server = Bmob.Object.createWithoutData("Member", server_objectId);
  query.equalTo("owner", owner);
  query.equalTo("server", server);
  query.include("server");
  query.include("owner");
  console.log(owner_objectId + server_objectId);
  // 查询所有数据
  query.find({
    success: function (results) {
      console.log("共查询到 " + results.length + " 条聊天记录");

      for (var i = oldMessages.length; i < results.length; i++) {
        var _object = results[i];

        var say = _object.get('say')
        var isPic = _object.get('isPic')
        var createTime = _object.createdAt + "";
        var createTimeShow = " ";
        console.log(createTime.substring(8, 10));
        console.log(currentDate);
        try {
          if (createTime.substring(8, 10) == currentDate) {
            console.log("这是今天!");
            createTimeShow = createTime.substring(10, 16);
          } else {
            createTimeShow = createTime.substring(0, 16);
          }
          if (createTime.substring(10, 13) == sameTime) {

          } else {
            sameTime = createTime.substring(10, 13);
            that.pushMessage(createSystemMessage(createTimeShow));
          }
        } catch (e) {

        }

        var server = _object.get('server');
        var owner = _object.get('owner');


        //============推送消息============
        //结构 id: msgUuid(), type: 'speak', content, user, isMe, isPic
        if (say == "server") {
          if (current_user_type == 1) {
            var user = { "avatarUrl": server.avatarUrl, "nickName": "对方" };
            that.pushMessage(createUserMessage(_object.get('content'), user, false, isPic));
          } else {
            var user = { "avatarUrl": server.avatarUrl, "nickName": "我" };
            that.pushMessage(createUserMessage(_object.get('content'), user, true, isPic));
          }
        } else {
          //say == "owner"
          if (current_user_type == 1) {
            var user = { "avatarUrl": owner.avatarUrl, "nickName": "我" };
            that.pushMessage(createUserMessage(_object.get('content'), user, true, isPic));
          } else {
            var user = { "avatarUrl": owner.avatarUrl, "nickName": "对方" };
            that.pushMessage(createUserMessage(_object.get('content'), user, false, isPic));
          }
        }
        //============推送消息============



      }


      console.log("最后替换掉 oldMessages")
      //最后替换掉 oldMessages
      oldMessages = results;
    },
    error: function (error) {
      console.log("查询失败: " + error.code + " " + error.message);
    }
  });





}