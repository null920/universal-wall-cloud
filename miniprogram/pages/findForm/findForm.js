// pages/findForm/findForm.js
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [{
        tabName: '丢东西',
      },
      {
        tabName: '捡东西',
      }
    ],
    imgList: [],
    uploadImgList: [],
    goodsClass: '',
    goodsDate: '',
    goodsPlace: '',
    phone: '',
    qq: '',
    wechat: '',
    radioValue: 0,
    textContent: '',
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

  getGoodsClass(e) {
    // console.log(e);
    this.setData({
      goodsClass: e.detail.value
    })
  },
  getGoodsDate(e) {
    this.setData({
      goodsDate: e.detail.value
    })
  },
  getGoodsPlace(e) {
    this.setData({
      goodsPlace: e.detail.value
    })
  },
  getPhone(e) {
    this.setData({
      phone: e.detail.value,
    })

  },
  getQQ(e) {
    this.setData({
      qq: e.detail.value
    })
  },
  getWechat(e) {
    this.setData({
      wechat: e.detail.value
    })
  },
  getRadioValue(e) {
    this.setData({
      radioValue: Number(e.detail.value),
    })
  },
  getTextContent(e) {
    this.setData({
      textContent: e.detail.value
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
        // console.log(res);
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
            imgList.push(item.tempFilePath)
          }
        });
        this.setData({
          imgList
        })
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
    //删除下标为index的元素，删除一个
    imgList.splice(index, 1);
    this.setData({
      imgList
    })
  },

  //上传图片到云
  async uploadCloudImg() {
    let {
      imgList,
      uploadImgList,
    } = this.data;
    const reg_img = /\.\w+$/;
    for (let i = 0; i < imgList.length; i++) {
      let suffix = reg_img.exec(imgList[i]);
      await wx.cloud.uploadFile({
        cloudPath: `find/${Math.floor(Math.random()*10000)}-${new Date().getTime()}${suffix}`,
        filePath: imgList[i],
      }).then(res => {
        console.log('上传成功!', res);
        uploadImgList.push(res.fileID);
        this.setData({
          uploadImgList
        })
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

  //上传数据到云
  async uploadCloudData() {
    let {
      goodsClass,
      goodsDate,
      goodsPlace,
      phone,
      qq,
      wechat,
      radioValue,
      textContent,
      uploadImgList,
      auditCode,
    } = this.data;
    //console.log(uploadImgList);
    const userInfo = wx.getStorageSync('userInfo');
    const {
      avatarCloudUrl,
      nickName,
      gender,
      roleId
    } = userInfo;
    console.log(wechat);
    db.collection('find').add({
      data: {
        avatarCloudUrl,
        nickName,
        gender,
        roleId,
        goodsClass,
        goodsDate,
        goodsPlace,
        phone,
        qq,
        wechat,
        radioValue,
        textContent,
        uploadImgList,
        auditCode,
        noPassReason: '',
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
              duration: 1200,
            })
          }
        })
      }
    })


  },

  /* 
   * 提交表单数据
   */
  async submitForm() {
    const reg_phone = /^(13[0-9]|14[014-9]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    const reg_qq = /^[1-9][0-9]\d{3,9}$/;
    const reg_wechat = /^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/;
    let {
      goodsClass,
      goodsDate,
      goodsPlace,
      phone,
      qq,
      wechat,
    } = this.data;
    if (goodsClass.trim().length == 0 || goodsDate.trim().length == 0 || goodsPlace.trim().length == 0) {
      wx.showToast({
        title: '请填写内容!',
        icon: 'none',
        duration: 1200
      })
      return false;
    } else if (phone.trim().length == 0 && qq.trim().length == 0 && wechat.trim().length == 0) {
      wx.showToast({
        title: '请至少留下一个联系方式!',
        icon: 'none',
        duration: 1200
      })
      return false;
    } else if (phone.trim().length != 0 && !reg_phone.test(phone)) {
      wx.showToast({
        title: '手机号格式错误！',
        icon: 'error',
        duration: 1200
      })
      return false;
    } else if (qq.trim().length != 0 && !reg_qq.test(qq)) {
      wx.showToast({
        title: 'QQ号格式错误！',
        icon: 'error',
        duration: 1200
      })
      return false;
    } else if (wechat.trim().length != 0 && !reg_wechat.test(wechat)) {
      wx.showToast({
        title: '微信格式错误！',
        icon: 'error',
        duration: 1200
      })
      return false;
    };

    wx.showLoading({
      title: '上传中',
      mask: true,
    });
    await this.uploadCloudImg();
    await this.uploadCloudData();
    wx.hideLoading();
  }


})