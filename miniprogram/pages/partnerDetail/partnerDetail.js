// pages/partnerDetail/partnerDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);

    this.setData({
      list: JSON.parse(options.listDetail),
    })

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

  previewImage(e) {
    let {
      index
    } = e.currentTarget.dataset;
    // console.log(e);
    // console.log(id, index);
    wx.previewImage({
      current: this.data.list.uploadImgList[index],
      urls: this.data.list.uploadImgList,
    })
  },

  copyPhone(e) {
    wx.vibrateShort({
      type: 'medium',
    });
    wx.setClipboardData({
      data: e.currentTarget.dataset.value,
    })
  },
  copyQQ(e) {
    wx.vibrateShort({
      type: 'medium',
    });
    wx.setClipboardData({
      data: e.currentTarget.dataset.value,
    })
  },
  copyWechat(e) {
    wx.vibrateShort({
      type: 'medium',
    });
    wx.setClipboardData({
      data: e.currentTarget.dataset.value,
    })
  },
})