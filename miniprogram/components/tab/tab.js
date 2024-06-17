// components/tab/tab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabList: Array,
    scrollTop: Number,
    bannerHeight: Number,
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabSelect: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    selectTab(e) {
      let {
        id
      } = e.currentTarget.dataset;
      this.setData({
        tabSelect: id,
      });
      this.triggerEvent('getTabSelect', id);
    },

  }
})