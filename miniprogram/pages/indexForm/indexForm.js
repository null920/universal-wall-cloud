// pages/indexForm/indexForm.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [{
      tabName: "说说",
    }, {
      tabName: "求助",
    }, {
      tabName: "捞人",
    }, {
      tabName: "出&收"
    }],
    imgList: [],
    uploadImgList: [],
    textContent: '',
    radioValue: 0,
    //审核码：0代表未审核，1代表审核通过，2代表审核不通过
    auditCode: 0,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      radioValue: Number(options.tabSelect),
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

  getTextContent(e) {
    this.setData({
      textContent: e.detail.value
    })
  },

  /*
   * value为0代表说说，1代表求助，2代表捞人，3代表出&收
   */
  getRadioValue(e) {
    this.setData({
      radioValue: Number(e.detail.value),
    })
  },

  //加载图片
  uploadImg() {
    let {
      imgList
    } = this.data;
    wx.chooseMedia({
      count: 6 - imgList.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: (res) => {
        const {
          tempFiles
        } = res;
        const maxSize = 4 * 1024 * 1024;
        tempFiles.forEach(item => {
          if (item.size > maxSize) {
            wx.showToast({
              title: '图片最大支持4M',
              icon: 'none',
              duration: 1500
            })
          } else {
            imgList.push(item.tempFilePath);
          }
        });
        this.setData({
          imgList
        });
      }
    })
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    let url = e.currentTarget.dataset.id;
    wx.previewImage({
      urls: [url],
    })
  },

  //删除正在编辑的图片
  deleteImg(e) {
    let {
      index
    } = e.currentTarget.dataset;
    let {
      imgList
    } = this.data;
    imgList.splice(index, 1);
    this.setData({
      imgList
    })
  },

  //上传图片到云，使用Promise异步转同步
  async uploadCloudImg() {
    let {
      imgList,
      uploadImgList,
    } = this.data;
    const reg_img = /\.\w+$/;
    //let length = imgList.length;
    for (let i = 0; i < imgList.length; i++) {
      let suffix = reg_img.exec(imgList[i]);
      await wx.cloud.uploadFile({
        //图片文件的命名使用0-10000之间的随机数+时间戳
        cloudPath: `index/${Math.floor(Math.random()*10000)}-${new Date().getTime()}${suffix}`,
        filePath: imgList[i],
        timeout: 60000,
      }).then(res => {
        console.log('上传成功！', res);
        uploadImgList.push(res.fileID);
        //刷新数据
        this.setData({
          uploadImgList
        });
      }).catch(error => {
        console.log(error);
        wx.showToast({
          title: '出错了',
          icon: 'error',
          duration: 1500
        })
      });
    }
  },

  //提交数据到云
  async uploadCloudData() {
    let {
      textContent,
      radioValue,
      uploadImgList,
      auditCode,
    } = this.data;
    console.log(uploadImgList);
    const userInfo = wx.getStorageSync('userInfo');
    const {
      avatarCloudUrl,
      nickName,
      gender,
      roleId,
    } = userInfo;
    db.collection('index').add({
      data: {
        textContent,
        radioValue,
        uploadImgList,
        avatarCloudUrl,
        nickName,
        gender,
        roleId,
        auditCode,
        noPassReason: '',
        comment: [],
        childComment: [],
        date: new Date().getTime(),
      },
      success: (res) => {
        console.log(res);
        wx.navigateBack({
          delta: 1,
          success: () => {
            wx.showToast({
              title: '已提交审核',
              icon: 'success',
              duration: 1500,
            });
          }
        })
      }
    })
  },


  /** 
   * 提交表单数据
   * 数据结构：
   * textContent：内容，String
   * radioValue：发布的tab页，int，0代表说说，1代表求助，2代表捞人，3代表出&收
   * uploadImgList：图片，String数组 存储的是云存储上的图片的地址
   * date:发布信息的时间戳，date
   * 异步转同步
   */
  async submitForm() {
    let {
      textContent,
    } = this.data;
    if (textContent.trim().length == 0) {
      wx.showToast({
        title: '至少写点东西吧!',
        icon: 'none',
        duration: 1200
      })
      return false;
    };
    wx.showLoading({
      title: '上传中',
      mask: true,
    });
    //图片上传成功才上传数据
    await this.uploadCloudImg();
    await this.uploadCloudData();
    wx.hideLoading();
  }


})