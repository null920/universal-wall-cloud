const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: ["个人信息", "消息列表"],
    tabSelect: 0,
    radioList: ['男', '女'],
    gender: -1,
    avatarUrl: '',
    avatarCloudUrl: '',
    nickName: '',
    firstLogin: false,
    hasChangedAvatar: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {
      avatarUrl,
      nickName,
      gender
    } = wx.getStorageSync('userInfo');
    this.setData({
      avatarUrl,
      nickName,
      gender,
      tabSelect: options.tabSelect,
    })
    if (options.firstLogin == 1) {
      this.setData({
        firstLogin: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideHomeButton();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  //获取当前选中tab栏下标
  getTabSelect(e) {
    this.setData({
      tabSelect: e.detail,
    })
    //console.log(this.data.tabSelect);
  },

  getAvatarUrl(e) {
    //console.log(e);
    this.setData({
      avatarUrl: e.detail.avatarUrl,
      hasChangedAvatar: true,
    });
  },
  getNickName(e) {
    this.setData({
      nickName: e.detail.value,
    })
    //console.log(e.detail.value);
  },
  getRadioValue(e) {
    this.setData({
      gender: Number(e.detail.value),
    })
  },


  //提交表单
  async submitForm() {
    wx.showLoading({
      title: '上传中',
    });
    let {
      avatarUrl,
      nickName,
      gender,
      hasChangedAvatar,
    } = this.data;
    if (nickName.length == 0) {
      wx.showToast({
        title: '昵称不可为空！',
        icon: 'error',
        duration: 1200
      })
      return false;
    };
    let userInfo = wx.getStorageSync('userInfo');
    let {
      avatarCloudUrl,
      roleId,
      backgroundImg,
      openid,
    } = userInfo;
    //修改了头像
    if (hasChangedAvatar) {
      const fs = wx.getFileSystemManager();
      fs.saveFile({
        tempFilePath: avatarUrl,
        success: (res) => {
          console.log('头像缓存成功', res.savedFilePath);
          avatarUrl = res.savedFilePath;
          const reg_img = /\.\w+$/;
          let suffix = reg_img.exec(avatarUrl);
          wx.cloud.uploadFile({
            cloudPath: `user/${Math.floor(Math.random()*10000)}-${new Date().getTime()}${suffix}`,
            filePath: avatarUrl,
          }).then(res => {
            console.log('头像上传成功！', res);
            avatarCloudUrl = res.fileID;
            userInfo = {
              avatarUrl,
              avatarCloudUrl,
              nickName,
              gender,
              roleId,
              openid,
              backgroundImg,
            }
            wx.setStorageSync('userInfo', userInfo);
            console.log(userInfo);
            if (this.data.firstLogin) {
              db.collection('user').add({
                data: {
                  avatarUrl,
                  avatarCloudUrl,
                  nickName,
                  gender,
                  roleId,
                  backgroundImg,
                },
                success: (res) => {
                  console.log('添加了用户数据', res);
                  wx.switchTab({
                    url: '../personal/personal',
                  });
                  wx.showToast({
                    title: '保存成功!',
                    icon: 'success',
                    duration: 1300,
                  });
                }
              });
            } else {
              db.collection('user').where({
                _openid: openid
              }).update({
                data: {
                  avatarUrl,
                  avatarCloudUrl,
                  nickName,
                  gender,
                },
                success: (res) => {
                  console.log('更新用户信息', res);
                  wx.switchTab({
                    url: '../personal/personal',
                  });
                  wx.showToast({
                    title: '保存成功!',
                    icon: 'success',
                    duration: 1300,
                  });
                },
                fail: (res) => {
                  console.log('出错了', res);
                }
              })
            }
          }).catch(error => {
            console.log(error);
            wx.showToast({
              title: '保存失败',
              icon: 'error',
              duration: 1300
            })
            return;
          })
        }
      })
      //未修改头像
    } else {
      userInfo = {
        avatarUrl,
        avatarCloudUrl,
        nickName,
        gender,
        roleId,
        openid,
        backgroundImg
      }
      wx.setStorageSync('userInfo', userInfo);
      //第一次登录
      if (this.data.firstLogin) {
        db.collection('user').add({
          data: {
            avatarUrl,
            avatarCloudUrl,
            nickName,
            gender,
            roleId,
            backgroundImg,
          },
          success: (res) => {
            console.log('添加了用户数据', res);
            wx.switchTab({
              url: '../personal/personal',
            });
            wx.showToast({
              title: '保存成功!',
              icon: 'success',
              duration: 1300,
            });
          }
        });
        //非第一次登录
      } else {
        db.collection('user').where({
          _openid: openid
        }).update({
          data: {
            avatarUrl,
            avatarCloudUrl,
            nickName,
            gender,
          },
          success: (res) => {
            console.log('更新用户信息', res);
            wx.switchTab({
              url: '../personal/personal',
            });
            wx.showToast({
              title: '保存成功!',
              icon: 'success',
              duration: 1300,
            });
          },
          fail: (res) => {
            console.log('出错了', res);
          }
        })
      }
    }
    wx.hideLoading();

  },



})