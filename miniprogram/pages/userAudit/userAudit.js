// pages/userAudit/userAudit.js
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
    tabList: ['首页', '失&拾', '找伴儿'],
    list: [],
    listLength: 0,
    tabSelect: 0,
    showCommentPanel: false,
    show: false,
    getMore: false,
    noMore: false,
    reasonDisplay: false,
    reasonButtonText: '查看理由',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.renderUserAudit();
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
      list: [],
      listLength: 0,
    })
    this.renderUserAudit();
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
    this.onLoad();
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
      this.renderUserAudit();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

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

  getTabSelect(e) {
    this.setData({
      tabSelect: e.detail,
      show: false,
      listLength: 0,
      list: [],
      noMore: false,
    })
    //console.log(this.data.tabSelect);
    this.renderUserAudit();
  },

  renderUserAudit() {
    wx.showLoading({
      title: '加载中',
    });
    const {
      openid
    } = wx.getStorageSync('userInfo');
    //console.log(openid);
    wx.showNavigationBarLoading();
    let {
      tabSelect,
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
      auditCode: _.in([0, 2]),
      _openid: openid,
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
    });
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

  activeNoPassReason() {
    let {
      reasonDisplay
    } = this.data;
    if (reasonDisplay) {
      this.setData({
        reasonButtonText: '查看原因',
        reasonDisplay: !reasonDisplay,
      })
    } else {
      this.setData({
        reasonButtonText: '收起原因',
        reasonDisplay: !reasonDisplay,
      })
    }
  },

})