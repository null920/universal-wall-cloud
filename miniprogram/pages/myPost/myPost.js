// pages/myPost/myPost.js
import {
  formatTime
} from '../../utils/utils'
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: ["首页", "失&拾", "找伴儿"],
    list: [],
    listLength: 0,
    tabSelect: 0,
    showCommentPanel: false,
    show: false,
    openid: '',
    getMore: false,
    noMore: false,
    keyboradHeight: 0,
    commentText: '',
    postId: '',
    commentId: '',
    placeholder: '',
    parentNickname: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (this.data.openid.length == 0) {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          openid: userInfo.openid,
        })
      }
    }
    this.renderMyPost();
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
    this.setData({
      listLength: 0,
      list: [],
    })
    this.renderMyPost();
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
    wx.vibrateShort({
      type: 'heavy',
    });
    this.setData({
      list: [],
      listLength: 0,
    })
    this.onShow();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (!this.data.noMore) {
      this.setData({
        getMore: true,
      });
      this.renderMyPost();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getTabSelect(e) {
    this.setData({
      tabSelect: e.detail,
      show: false,
      list: [],
      noMore: false,
      listLength: 0,
    })
    //console.log(this.data.tabSelect);
    this.renderMyPost();
  },
  getCommentText(e) {
    this.setData({
      commentText: e.detail.value,
    })
  },

  renderMyPost() {
    wx.showLoading({
      title: '加载中',
    });
    wx.showNavigationBarLoading();
    let {
      tabSelect,
      openid,
      list,
      listLength,
    } = this.data;
    let set;
    switch (tabSelect) {
      case 0:
        set = 'index';
        break;
      case 1:
        set = 'find';
        break;
      case 2:
        set = 'partner';
        break;
      default:
        break;
    }
    //console.log(set);
    db.collection(set).where({
      _openid: openid,
      auditCode: 1,
    }).skip(listLength).limit(4).orderBy('date', 'desc').get({
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
    })
  },

  deletePost(e) {
    const {
      tabSelect,
    } = this.data;
    let set;
    switch (tabSelect) {
      case 0:
        set = 'index';
        break;
      case 1:
        set = 'find';
        break;
      case 2:
        set = 'partner';
        break;
      default:
        break;
    }
    wx.showModal({
      title: '提示',
      content: '您确定要删除这篇帖子吗？',
      complete: (res) => {
        if (res.cancel) {

        }
        if (res.confirm) {
          const id = e.currentTarget.dataset.id;
          db.collection(set).doc(id).remove({
            success: (res) => {
              console.log(res);
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500,
              });
              this.onPullDownRefresh();
            },
            fail: (res) => {
              console.log(res);
              wx.showToast({
                title: '删除失败',
                icon: 'error',
                duration: 1500,
              })
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
    if (commentText.trim().length == 0) {
      wx.showToast({
        title: '内容为空',
        icon: 'error',
        duration: 1300,
      })
      return;
    } else {
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
            console.log(res);
            this.hideCommentPanel();
            this.onShow();
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
    //console.log(e);
    const {
      id,
      commentid,
      nickname,
      openid,
    } = e.currentTarget.dataset;
    //如果是本人点击的评论就弹出删除操作框
    if (openid == this.data.openid) {
      wx.showActionSheet({
        itemList: ['删除'],
        itemColor: '#ff0000',
        success: (res => {
          if (res.tapIndex === 0) {
            db.collection('index').doc(id).update({
              data: {
                comment: _.pull({
                  id: commentid,
                })
              },
              success: (res => {
                console.log(res);
                this.onShow();
              })
            })
          }
        })
      })
    } else {
      this.setData({
        parentNickname: nickname,
        placeholder: '回复 ' + nickname + '：',
        showCommentPanel: true,
        postId: id,
        commentId: commentid,
      })
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
  openNewCommentPanel(e) {
    this.setData({
      placeholder: '评论',
      showCommentPanel: true,
      postId: e.currentTarget.dataset.id,
      commentId: '',
    })
  },
  //动态获取键盘高度
  keyboardHeightChange(e) {
    let {
      keyboradHeight
    } = this.data
    if (keyboradHeight !== e.detail.height) {
      this.setData({
        keyboradHeight: e.detail.height
      })
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
      })
  },
  copyPhone(e) {
    wx.vibrateShort({
      type: 'medium',
    });
    wx.setClipboardData({
      data: e.currentTarget.dataset.value,
      success(res) {
        console.log(res)
      }
    })
  },
  copyQQ(e) {
    wx.vibrateShort({
      type: 'medium',
    });
    wx.setClipboardData({
      data: e.currentTarget.dataset.value,
      success(res) {
        console.log(res)
      }
    })
  },
  copyWechat(e) {
    wx.vibrateShort({
      type: 'medium',
    });
    wx.setClipboardData({
      data: e.currentTarget.dataset.value,
      success(res) {
        console.log(res)
      }
    })
  },
  openPartnerDetail(e) {
    const index = e.currentTarget.dataset.id;
    console.log(index);
    let listDetail = JSON.stringify(this.data.list[index]);
    //console.log(listDetail);
    wx.navigateTo({
      url: '../partnerDetail/partnerDetail?listDetail=' + listDetail,
    })
  },
})