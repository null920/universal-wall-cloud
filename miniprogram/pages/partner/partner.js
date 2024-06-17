// pages/partner/partner.js
import {
  formatTime
} from '../../utils/utils';
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: ["找男生", "找女生"],
    list: [],
    listLength: 0,
    pageNo: 1,
    tabSelect: 0,
    newMessages: 0,
    show: false,
    openid: '',
    getMore: false,
    noMore: false,
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
    this.renderPartner();
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
    this.setData({
      listLength: 0,
      list: [],
    })
    this.onLoad();
    wx.vibrateShort({
      type: 'heavy',
    });
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
      this.renderPartner();
    }
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
  //获取当前选中tab栏下标
  getTabSelect(e) {
    this.setData({
      tabSelect: e.detail,
      show: false,
      listLength: 0,
      list: [],
      noMore: false,
    })
    //console.log(this.data.tabSelect);
    this.renderPartner();
  },


  renderPartner() {
    wx.showLoading({
      title: '加载中',
    })
    wx.showNavigationBarLoading();
    let {
      tabSelect,
      list,
      listLength,
    } = this.data;
    db.collection('partner').where({
      radioValue: tabSelect,
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
            //pageNo: pageNo + 1,
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
    wx.showModal({
      title: '提示',
      content: '您确定要删除这篇帖子吗？',
      complete: (res) => {
        if (res.cancel) {}
        if (res.confirm) {
          const id = e.currentTarget.dataset.id;
          //console.log(id);
          db.collection('partner').doc(id).remove({
            success: (res) => {
              console.log(res);
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1300,
              });
              this.onLoad();
            },
            fail: (res) => {
              console.log(res);
              wx.showToast({
                title: '删除失败',
                icon: 'error',
                duration: 1300,
              })
            }
          })
        }
      }
    })
  },

  openMessages() {
    wx.navigateTo({
      url: '../message/message?tabSelect=1',
    })
  },
  openPartnerForm() {
    const login = wx.getStorageSync('login');
    if (login) {
      wx.navigateTo({
        url: '../partnerForm/partnerForm?tabSelect=' + this.data.tabSelect,
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
  openPartnerDetail(e) {
    const index = e.currentTarget.dataset.id;
    console.log(index);
    let listDetail = JSON.stringify(this.data.list[index]);
    //console.log(listDetail);
    wx.navigateTo({
      url: '../partnerDetail/partnerDetail?listDetail=' + listDetail,
    })
  }
})