import {
  formatTime
} from '../../utils/utils'
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeBar: ['请勿发表任何破坏民族团结、违背社会主义核心价值观、辱骂、暴力等不当言论！！！'],
    noticeBarShow: true,
    banner: ['../../images/banner1.jpg', '../../images/banner2.jpg'],
    tabList: ['说说', '求助', '捞人', '出&收'],
    pageNo: 1,
    list: [],
    listLength: 0,
    tabSelect: 0,
    showCommentPanel: false,
    openid: '',
    show: false,
    scrollTop: 0,
    bannerHeight: 0,
    getMore: false,
    noMore: false,
    commentText: '',
    postId: '',
    commentId: '',
    placeholder: '',
    parentNickname: '',
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    let {
      id,
      index
    } = e.currentTarget.dataset;
    // console.log(e);
    // console.log(id, index);
    wx.previewImage({
      current: this.data.list[id].uploadImgList[index],
      urls: this.data.list[id].uploadImgList,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //如果缓存存在就去缓存里拿openid
    if (this.data.openid.length == 0) {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          openid: userInfo.openid,
        })
      }
    }
    this.renderBanner();
    this.renderIndex();
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
    //获取banner的高度
    this.createSelectorQuery().select('.banner').boundingClientRect(rect => {
      this.setData({
        bannerHeight: rect.height - 3
      })
    }).exec(() => {
      //console.log('查询完成');
    });
    if (this.data.listLength != 0)
      this.refreshIndex();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.vibrateShort({
      type: 'heavy',
    });
    this.setData({
      list: [],
      listLength: 0,
      noMore: false,
    })
    this.renderIndex();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.noMore) {
      this.setData({
        getMore: true,
      });
      //console.log('触底');
      this.renderIndex();
    }
  },


  /**
   * 用户点击tab栏图标
   */
  onTabItemTap() {
    wx.vibrateShort({
      type: 'light',
    })
    this.hideCommentPanel();
  },
  //tab栏触顶浮动
  onPageScroll: function (e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },

  //获取当前选中tab栏下标
  getTabSelect(e) {
    this.setData({
      tabSelect: e.detail,
      show: false,
      list: [],
      noMore: false,
      listLength: 0,
    })
    //console.log(this.data.tabSelect);
    this.renderIndex();
  },
  getCommentText(e) {
    this.setData({
      commentText: e.detail.value,
    })
  },

  //渲染首页数据
  renderIndex() {
    wx.showLoading({
      title: '加载中',
    });
    wx.showNavigationBarLoading();
    let {
      tabSelect,
      list,
      listLength,
    } = this.data;
    db.collection('index').where({
      radioValue: tabSelect,
      auditCode: 1,
    }).skip(listLength).limit(4).orderBy('date', 'desc').get({
      success: (res) => {
        console.log(res);
        const {
          data
        } = res;
        if (data.length != 0) {
          if (data.length < 4) {
            this.setData({
              getMore: false,
              noMore: true,
            })
          }
          this.setData({
            listLength: listLength += data.length,
            show: true,
            //格式化时间并传值
            list: list.concat(data.map(item => {
              return {
                ...item,
                date: formatTime(item.date),
              }
            })),
          })
        } else {
          this.setData({
            getMore: false,
            noMore: true,
          })
        }
        wx.hideLoading();
        wx.hideNavigationBarLoading();
      }
    });
  },

  renderBanner() {
    //横幅
    db.collection('banner').where({
      _id: '945e0ece643a463200012ca176997bf6'
    }).get({
      success: (res) => {
        console.log(res);
        this.setData({
          banner: res.data[0].ImageUrl
        })
      }
    })
  },

  refreshIndex() {
    let {
      tabSelect,
      list,
      listLength,
    } = this.data;
    //console.log(listLength);
    db.collection('index').where({
      radioValue: tabSelect,
      auditCode: 1,
    }).skip(listLength).limit(4).orderBy('date', 'acs').get({
      success: (res) => {
        console.log(res);
        const {
          data
        } = res;
        if (data.length != 0) {
          this.setData({
            listLength: listLength += data.length,
            show: true,
            //格式化时间并传值
            list: data.map(item => {
              return {
                ...item,
                date: formatTime(item.date),
              }
            }).concat(list),
          })
        } else {
          // this.setData({
          //   getMore: false,
          //   noMore: true,
          // })
        }
      }
    });
  },

  //删除帖子
  deletePost(e) {
    console.log(e);
    wx.showModal({
      title: '提示',
      content: '您确定要删除这篇帖子吗？',
      complete: (res) => {
        if (res.cancel) {}
        if (res.confirm) {
          const {
            id,
            index
          } = e.currentTarget.dataset;
          db.collection('index').doc(id).remove({
            success: (res) => {
              console.log(res);
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1300,
              });
              this.setData({
                list: [],
                listLength: 0,
                noMore: false,
              })
              this.renderIndex();
            },
            fail: (res) => {
              console.log(res);
              wx.showToast({
                title: '删除失败',
                icon: 'error',
                duration: 1300,
              });
              this.onShow();
            }
          })
        }
      }
    })

  },

  //提交评论
  submitComment() {
    const {
      commentText,
      commentId,
      postId,
      openid,
      parentNickname,
    } = this.data;
    //去除空格后是否为空
    if (commentText.trim().length == 0) {
      wx.showToast({
        title: '内容为空',
        icon: 'error',
        duration: 1300,
      })
      return;
    } else {
      //
      if (commentId.length == 0) {
        db.collection('index').doc(postId).update({
          data: {
            comment: _.push({
              id: `${Math.floor(Math.random()*1000)}-${new Date().getTime()}`,
              nickName: wx.getStorageSync('userInfo').nickName,
              commentText,
              openid,
              date: formatTime(new Date().getTime()).slice(5),
            }),
          },
          success: (res => {
            wx.showToast({
              title: '评论成功！',
              icon: 'success',
              duration: 1300,
            });
            console.log(res);
            this.hideCommentPanel();
            //this.onShow();
          })
        })
      } else {
        db.collection('index').doc(postId).update({
          data: {
            childComment: _.push({
              each: [{
                id: `${Math.floor(Math.random()*1000)}-${new Date().getTime()}`,
                parentId: commentId,
                parentNickname,
                nickName: wx.getStorageSync('userInfo').nickName,
                commentText: commentText,
                openid,
                date: formatTime(new Date().getTime()).slice(5),
              }],
            }),
          },
          success: (res => {
            console.log(res);
            this.hideCommentPanel();
            this.onShow();
          }),
          fail: (res => {
            console.log(res);
          })
        })
      }
    }
  },
  //回复评论
  replyComment(e) {
    const login = wx.getStorageSync('login');
    if (login) {
      //console.log(e);
      const {
        id,
        commentid,
        nickname,
        openid,
      } = e.currentTarget.dataset;
      //如果是本人点击的评论就弹出删除操作框
      if (openid == this.data.openid) {
        //console.log(commentid);
        wx.showActionSheet({
          itemList: ['删除'],
          itemColor: '#ff0000',
          success: (res => {
            if (res.tapIndex === 0) {
              db.collection('index').doc(id).update({
                data: {
                  comment: _.pull({
                    id: commentid,
                  }),
                  childComment: _.pull({
                    id: commentid,
                  }),
                },
                success: (res => {
                  wx.showToast({
                    title: '删除成功！',
                    icon: 'success',
                    duration: 1300,
                  })
                  //this.onLoad();
                })
              })
            }
          })
        })
        //非本人点击触发回复功能
      } else {
        this.setData({
          parentNickname: nickname,
          placeholder: '回复 ' + nickname + '：',
          showCommentPanel: true,
          postId: id,
          commentId: commentid,
        })

      }
    } else {
      wx.showToast({
        title: '请先登录！',
        icon: 'error',
        duration: 1000
      });
      setTimeout(() =>
        wx.switchTab({
          url: '../personal/personal',
        }), 1000);
    }
  },
  showCommentMenu(e) {
    //console.log(e);
    const {
      commenttext
    } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['复制'],
      success: (res => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: commenttext,
            success: (res => {
              console.log(res);
            })
          })
        }
      })
    })
  },
  openIndexForm: function () {
    const login = wx.getStorageSync('login');
    if (login) {
      wx.navigateTo({
        url: '../indexForm/indexForm?tabSelect=' + this.data.tabSelect,
      })
    } else {
      wx.showToast({
        title: '请先登录！',
        icon: 'error',
        duration: 1000
      });
      setTimeout(() =>
        wx.switchTab({
          url: '../personal/personal',
        }), 1000);
    }
  },
  openNewCommentPanel(e) {
    const login = wx.getStorageSync('login');
    if (login) {
      this.setData({
        placeholder: '评论',
        showCommentPanel: true,
        postId: e.currentTarget.dataset.id,
        commentId: '',
      })
    } else {
      wx.showToast({
        title: '请先登录！',
        icon: 'error',
        duration: 1000
      });
      setTimeout(() =>
        wx.switchTab({
          url: '../personal/personal',
        }), 1000);
    }
  },
  hideCommentPanel() {
    if (this.data.showCommentPanel == true)
      this.setData({
        parentNickname: '',
        placeholder: '',
        showCommentPanel: false,
        postId: '',
        commentId: '',
        commentText: '',
      })
  },
  closeNoticeBar() {
    this.setData({
      noticeBarShow: false
    })
  }
})