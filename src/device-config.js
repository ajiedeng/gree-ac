export default {
  base: {
    env: 'dev',
    platform: 'genie',
    icon: ['//at.alicdn.com/t/font_1542317_ck2zok1b96q.js'],
    debugVConsole: false,
    deviceInfo: {
      title: '格力空调柜机'
    }
  },
  debug: {
    stagingMap: 'release',
    params: {
      productKey: '',
      devId: ''
    }
  }
}
