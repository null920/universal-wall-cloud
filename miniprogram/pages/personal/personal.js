// pages/personal/personal.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    login: false,
    backgroundImg: '',
    backgroundImgCloud: '',
    avatarUrl: '',
    avatarCloudUrl: '',
    nickName: '',
    gender: -1,
    roleId: 0,
    openid: '',
    myPostNum: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //console.log('执行onload了');
    const login = wx.getStorageSync('login');
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      login: !!login
    })
    if (userInfo) {
      const {
        avatarUrl,
        avatarCloudUrl,
        nickName,
        gender,
        roleId,
        backgroundImg,
      } = userInfo;
      this.setData({
        avatarUrl,
        avatarCloudUrl,
        nickName,
        gender,
        roleId,
        backgroundImg
      })
    }
    if (this.data.openid.length == 0) {
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getOpenId'
        },
        complete: (res => {
          //console.log(res);
          this.setData({
            openid: res.result.openid,
          })
          if (this.data.openid == 'oM1Za5RwhBiyWEEG8XwPEHmnxLuI') {
            this.setData({
              roleId: 1,
            })
          }
        })
      });
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
    this.onLoad();
    wx.stopPullDownRefresh();
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

  /**
   * 用户点击tab栏图标
   */
  onTabItemTap() {
    wx.vibrateShort({
      type: 'light',
    })
  },

  /**
   * 登录
   * 用户数据暂时存在缓存
   * 若用户是第一次登录获取用户的头像和昵称，存入缓存
   * roleId为0代表普通用户，roleId为1代表管理员
   */
  async toLogin() {
    wx.showLoading({
      title: '加载中',
    })
    const {
      openid
    } = this.data;
    let res1 = await db.collection('user').where({
      _openid: openid,
    }).get();
    console.log(res1);
    const data = res1.data;
    if (data.length == 0) {
      //云端图片缓存到本地
      if (this.data.backgroundImg == '') {
        let res2 = await wx.cloud.downloadFile({
          fileID: 'cloud://universal-3g84a3pofdf6e571.756e-universal-3g84a3pofdf6e571-1316946127/user/userBackground/wall.JPEG',
        });
        const fs = wx.getFileSystemManager();
        fs.saveFile({
          tempFilePath: res2.tempFilePath,
          success: (res) => {
            console.log('背景图片缓存成功', res.savedFilePath);
            this.setData({
              backgroundImg: res.savedFilePath
            });
            wx.hideLoading();
          }
        })
      } else {
        wx.hideLoading();
      }
      wx.showModal({
        title: '提示',
        content: '是否授权给本小程序？(根据微信新规，我们无法获取到您的头像和昵称)',
        complete: (res) => {
          if (res.cancel) {
            wx.showToast({
              title: '您拒绝了授权',
              icon: 'error',
              duration: 1300
            });
          }
          if (res.confirm) {
            wx.getUserProfile({
              desc: '获取用户的头像和昵称',
              success: (res) => {
                const {
                  userInfo: {
                    avatarUrl,
                    nickName,
                  }
                } = res;
                const {
                  gender,
                  roleId,
                  backgroundImg,
                } = this.data;
                const userInfo = {
                  avatarUrl,
                  avatarCloudUrl: avatarUrl,
                  nickName,
                  gender,
                  roleId,
                  openid,
                  backgroundImg
                }
                console.log(userInfo);
                wx.setStorageSync('userInfo', userInfo);
                wx.setStorageSync('login', true);
                this.setData({
                  login: true,
                  avatarUrl,
                  nickName
                });
                wx.redirectTo({
                  url: '../personalDetail/personalDetail?tabSelect=0&firstLogin=1',
                  success: () => {
                    wx.showModal({
                      title: '提示',
                      content: '这是您第一次登录，请填写信息，如果您不想填写可以直接点击保存信息，使用默认信息(目前背景图片信息都存在缓存中，如果清理缓存或更换设备将无法读取，不影响帖子)',
                    })
                  }
                })
              }
            })
          }
        }
      })
    } else {
      wx.hideLoading();
      console.log('用户已经登录过，恢复用户数据');
      if (wx.getStorageSync('userInfo')) {
        wx.setStorageSync('login', true);
        this.setData({
          login: true
        })
      } else {
        const {
          avatarUrl,
          avatarCloudUrl,
          gender,
          nickName,
          roleId,
          _openid,
          backgroundImg
        } = data[0];
        const userInfo = {
          avatarUrl,
          avatarCloudUrl,
          gender,
          nickName,
          roleId,
          openid: _openid,
          backgroundImg,
        }
        if (userInfo) {
          wx.setStorageSync('userInfo', userInfo);
          wx.setStorageSync('login', true);
          this.setData({
            login: true,
          });
        } else {
          console.log('出错了');
        }
      }
    }
  },


  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出吗？',
      complete: (res) => {
        if (res.cancel) {}
        if (res.confirm) {
          //wx.removeStorageSync('userInfo')
          wx.removeStorageSync('login');
          this.setData({
            login: false
          })
        }
      }
    })
  },

  /**
   * 修改个人主页的背景图片
   */
  modifyBackground() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res);
        const fs = wx.getFileSystemManager();
        fs.saveFile({
          tempFilePath: res.tempFiles[0].tempFilePath,
          success: (res) => {
            console.log('图片缓存成功', res.savedFilePath);
            this.setData({
              backgroundImg: res.savedFilePath,
            });
            let userInfo = wx.getStorageSync('userInfo');
            userInfo.backgroundImg = res.savedFilePath;
            wx.setStorageSync('userInfo', userInfo);
            // db.collection('user').doc(this.data.openid).update({
            //   data: {
            //     backgroundImg: res.savedFilePath
            //   },
            //   success: (res) => {
            //     console.log('修改了背景', res);
            //   }
            // })
          }
        })
      }
    })
  },

  previewImage(e) {
    wx.vibrateShort({
      type: 'medium',
    })
    let url = e.currentTarget.dataset.id;
    wx.previewImage({
      urls: [url],
    })
  },

  openInformation() {
    wx.navigateTo({
      url: '../personalDetail/personalDetail?tabSelect=0',
    })
  },
  openMessages() {
    wx.navigateTo({
      url: '../personalDetail/personalDetail?tabSelect=1',
    })
  },
  openMyPost() {
    wx.navigateTo({
      url: '../myPost/myPost',
    })
  },
  openAudit() {
    const {
      roleId
    } = this.data;
    if (roleId == 1) {
      wx.navigateTo({
        url: '../managerAudit/managerAudit',
      })
    } else {
      wx.navigateTo({
        url: '../userAudit/userAudit',
      })
    }
  },
  openUpdateLogs() {
    wx.navigateTo({
      url: '../updateLogs/updateLogs',
    })
  },
})