// pages/updateLogs/updateLogs.js
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
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.renderUpdateLogs();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  renderUpdateLogs() {
    db.collection('updateLogs').where({
      _id: '46bd39b4643a4cfd00000fe3352889da',
    }).get({
      success: (res => {
        console.log(res);
        this.setData({
          list: res.data[0].logList.map(item => {
            return {
              ...item,
              day: formatTime(item.date).slice(0, 10),
              time: formatTime(item.date).slice(11),
            }
          }).reverse(),
        });
        console.log(this.data.list)
      })
    })
  }
})