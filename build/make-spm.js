const mtop = require('./mtop.common')
const path = require('path')
const fs = require('fs')
console.log(typeof mtop)

class setSpm {
  constructor() {
    this.run()
  }
  async run() {
    await this.getProdcutKey() // 校验是否有 PK
    console.log('end', this.prodcutKey)
  }
  getProdcutKey() {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, '../src/device-config.js'),'utf-8', (err, data) => {
        if (err) return console.log('readFile error:', err)
        const pk = this.getDataVal(data, 'productKey')[0]
        this.prodcutKey = pk
        if (!pk) console.log('请先设置prodcutKey(必填)： \n 设置路径 /src/device-config.js -> debug.params.prodcutKey')
        resolve(pk)
      })
    })
  }

  // 获取参数的值
  getDataVal(data, key) {
    data = data.slice(data.indexOf(key))
    data = data.split('\n')[0]
    var single = data.match(/\'\w*\'/g) || [];
    var double = data.match(/\"\w*\"/g) || [];
    return [...single, ...double].map(function(element){
        return element.slice(1, -1);
    });
  }

}

new setSpm()