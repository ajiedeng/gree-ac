<template>
  <div class="main">
    <div :class="{gray: !powerstate||!onlinestate}" class="headerContent">
      <Process :actionCallback="setTemp" :canNotChange="mode === 2 " :disable="!powerstate||!onlinestate" :maxValue="30" :minValue="16"
               :value="targetTemperature" v-if="true"/>
      <div class="tempInner">{{onlinestate? (powerstate? (mode? panelConfig['mode'][mode].text+'已开启':''): '设备已关闭') :
        '设备离线'}}
      </div>
    </div>

    <iot-tab>
        <!-- 控制区块 -->
        <iot-tab-item label="控制">
            <push-group>
              <push-button
                v-for="(val, key) in list_powerstate" :key="key"
                v-model="model_power" :range="val.range" :icon="val.icon" :label="val.label"
                :disabled="!onlinestate"
              />
              <push-button
                v-for="(val, key) in list_mode" :key="key+1"
                :icon="val.icon" :label="val.label" :range="val.range" @change="onChange" v-model="model_mode"
                :disabled="!powerstate||!onlinestate"
              />
            </push-group>
              <h5 class="title">风速</h5>
            <div :class="{isLight:(this.mode === 13)&& (powerstate || !onlinestate)}" >
              <slider :disabled="this.mode === 13 ||!powerstate||!onlinestate" :max="(this.mode === 12||this.mode === 2)? 5:7" :min="0" :outer-stops="windLabel" :show-stops="true" :step="1" align="center"  type="isLight" v-model="windSpeed"  @change="onChangewind" :showPoints="true"/><!--柜机Slider -->
             <!-- <slider :disabled="this.mode === 13 ||!powerstate||!onlinestate" :max="(this.mode === 12||this.mode === 2)? 5:(sleepOnOff&&this.mode !== 13 ? 6 : 7)" :min="0" :outer-stops="windLabel" :show-stops="true" :step="1" align="center" type="isLight" v-model="windSpeed"  @change="onChangewind" :showPoints="true"/> --><!--挂机Slider -->
            </div>
              <div>
                <push-bar
                  v-for="(val, key) in AutoLRSet" v-bind:key="key+10"
                  :data="val" :type="val.type"
                  :check="val.check"
                  :disabled="val.disabled||!powerstate||!onlinestate"
                />
              </div>
            <div>
              <push-bar
                v-for="(val, key) in AutoUDSet" v-bind:key="key+11"
                :data="val" :type="val.type"
                :check="val.check"
                :disabled="val.disabled||!powerstate||!onlinestate"
              />
            </div>
              <push-bar
                v-for="(val, key) in deviceStatus" v-bind:key="key+2"
                :data="val" :type="val.type"
                :check="val.check"
                :disabled="val.disabled||!powerstate||!onlinestate"
                >
              </push-bar>

          <!-- 组件区域 -->
        </iot-tab-item>
        <!-- 指令区域 -->
        <iot-tab-item label="指令">
            <function-corpus :list="functionCorpus" :loading="functionCorpusLoading"/>
        </iot-tab-item>
    </iot-tab>

  </div>
</template>

<script type="text/ecmascript-6">
import {mapState} from 'vuex'
import functionCorpus from './components/functionCorpus.vue'
import {IotTab, IotTabItem, PushBar, PushButton, PushGroup, Slider} from 'genie-ui'
import Process from './components/processNew'
import panelConfig from './components/controlPanelconfig'

export default {
  name: 'Main',
  components: { Process, functionCorpus, IotTab, IotTabItem, PushBar, Slider, PushButton, PushGroup },
  data () {
    return {
      // 指令
      functionCorpus: [],
      functionCorpusLoading: true,
      windLabel: ['静音', '自动', '低档', '中低档', '中档', '中高档', '高档', '强劲'],
      windconfig: [150, 255, 151, 152, 153, 154, 155, 158], // 静音档：150        强劲档：158     中低档：152    低档：151       高档：155      中高档：154     自动档：255    中档：153
      panelConfig,
      windSpeed: 2
    }
  },
  computed: {
    model_power: {
      get: function () {
        return this.$store.state.publicInfo.attr['powerstate']
      },
      set: function (val) {
        if (this.$store.state.publicInfo.attr.sleepOnOff) {
          this.$store.dispatch('setDeviceStatus', {
            powerstate: val,
            sleepOnOff: 0,
          });
          return true
        } else {
          this.$store.dispatch('setDeviceStatus', {
            powerstate: val
          })
        }
      }
    },
    model_mode: {
      get: function () {
        return this.$store.state.publicInfo.attr['mode']
      },
      set: function(val) {
        // console.warn(this.$store.state.publicInfo.attr, val, '999999999999999');
        const real = this.$store.state.publicInfo.attr.powerstate && this.$store.state.publicInfo.attr.onlinestate === 'online';
        const windspeed = this.$store.state.publicInfo.attr.windspeed;
        if (real) {
          if (val === 13) {
            this.$store.dispatch('setDeviceStatus', {
              mode: val,
              windspeed: 151,
              sleepOnOff: 0
            })
          }
          if ((val === 2 || val === 12) && windspeed === 158) {
            this.$store.dispatch('setDeviceStatus', {
              mode: val,
              windspeed: 155,
              sleepOnOff: 0
            })
          }
          if ((val === 2 || val === 12) && windspeed === 150) {
            this.$store.dispatch('setDeviceStatus', {
              mode: val,
              windspeed: 151,
              sleepOnOff: 0
            })
          }
          this.$store.dispatch('setDeviceStatus', {
            mode: val,
            sleepOnOff: 0
          })
        } else {
          return false;
        }
      }
    },

    ...mapState({
      AutoLRSet () {
        return [
          {
            text: '上下扫风',
            desc: '',
            type: 'arrow',
            disabled: false,
            clickBack: val => {
              const that = this;
              that.$router.push('/autoUp');
            }
          }
        ]
      },
      AutoUDSet () {
        return [
          {
            text: '左右扫风',
            desc: '',
            type: 'arrow',
            disabled: false,
            clickBack: val => {
              const that = this;
              that.$router.push('/autoLr');
            }
          }
        ]
      },
      deviceStatus (state) {
        const attr = state.publicInfo.attr;
        const sleepOnOff = attr.sleepOnOff === 1;
        const OSD = attr.OSD === 1;
        const healthfunction = attr.healthfunction === 1;
        return [
          {
            check: OSD,
            title: '更多功能',
            text: '灯光',
            type: 'switch',
            disabled: false,
            clickBack: val => {
              this.$store.dispatch('setDeviceStatus', {
                OSD: val.check ? 0 : 1
              })
            }
          },
          {
            check: healthfunction,
            text: '健康',
            type: 'switch',
            disabled: false,
            clickBack: val => {
              this.$store.dispatch('setDeviceStatus', {
                healthfunction: val.check ? 0 : 1
              })
            }
          },
          {
            check: this.mode === 13 || this.mode === 12 || this.mode === 2 ? false : sleepOnOff,
            text: '睡眠',
            type: 'switch',
            disabled: this.mode === 13 || this.mode === 12 || this.mode === 2,
            clickBack: val => {
              this.$store.dispatch('setDeviceStatus', {
                sleepOnOff: val.check ? 0 : 1
              })
            }
          }
        ]
      },
      list_mode (state) {
        return [
          {
            range: [{
              value: 9, // 取值
              disabledStyle: {opacity: '0.5'}, // 禁用样式
              iconStyle: {}, // icon样式
              buttonStyle: { color: '#fff', background: '#FFA43D', borderColor: '#FFA43D' },
              active: true // 选中样式快捷书写，当v-model的值和range中的值一致时，样式为选中，常用于互斥
            }],
            label: '制冷', // 文字
            icon: 'iconzhilenglanse'
          },
          {
            range: [{
              value: 10, // 取值
              disabledStyle: {opacity: '0.5'}, // 禁用样式
              iconStyle: {}, // icon样式
              buttonStyle: { color: '#fff', background: '#FFA43D', borderColor: '#FFA43D' },
              active: true // 选中样式快捷书写，当v-model的值和range中的值一致时，样式为选中，常用于互斥
            }],
            label: '制热', // 文字
            icon: 'iconzhinuanlanse'
          },
          {
            range: [{
              value: 13, // 取值
              disabledStyle: {opacity: '0.5'}, // 禁用样式
              iconStyle: {}, // icon样式
              buttonStyle: { color: '#fff', background: '#FFA43D', borderColor: '#FFA43D' },
              active: true // 选中样式快捷书写，当v-model的值和range中的值一致时，样式为选中，常用于互斥
            }],
            label: '除湿', // 文字
            icon: 'iconchushilanse'
          },
          {
            range: [{
              value: 12, // 取值
              disabledStyle: {opacity: '0.5'}, // 禁用样式
              iconStyle: {}, // icon样式
              buttonStyle: { color: '#fff', background: '#FFA43D', borderColor: '#FFA43D' },
              active: true // 选中样式快捷书写，当v-model的值和range中的值一致时，样式为选中，常用于互斥
            }],
            label: '送风', // 文字
            icon: 'iconsongfenglanse'
          },
          {
            range: [{
              value: 2, // 取值
              disabledStyle: {opacity: '0.5'}, // 禁用样式
              iconStyle: {}, // icon样式
              buttonStyle: { color: '#fff', background: '#FFA43D', borderColor: '#FFA43D' },
              active: true // 选中样式快捷书写，当v-model的值和range中的值一致时，样式为选中，常用于互斥
            }],
            label: '自动', // 文字
            icon: 'iconzidonglanse'
          }
        ]
      },
      list_powerstate (state) {
        return [
          {
            range: [
              { value: 1, disabledStyle: {opacity: '0.5'}, iconStyle: {opacity: '1'}, active: true },
              { value: 0, disabledStyle: {opacity: '0.5'} }
            ],
            disabledStyle: {opacity: '0.5'},
            label: '电源', // 文字
            icon: 'icondianyuanlanse'
          }
        ]
      },
      targetTemperature (state) {
        return state.publicInfo.attr.targetTemperature
      },
      // 产品信息详情
      productInfo: state => {
        return state.base.productInfo
      },
      mode: state => {
        return state.publicInfo.attr.mode
      },
      windspeed: state => {
        return state.publicInfo.attr.windspeed
      },
      // 在线状态
      onlinestate: state => {
        const onlinestate = state.publicInfo.attr.onlinestate;
        return onlinestate === 'online'
      },
      // 开关状态
      powerstate: state => {
        const powerstate = state.publicInfo.attr.powerstate;
        return powerstate === 1;
      },
      // 睡眠状态
      sleepOnOff: state => {
        const sleepOnOff = state.publicInfo.attr.sleepOnOff;
        return sleepOnOff === 1;
      }
    })
  },
  created () {
    console.log('this.$route.query：', this.$route.query);
    console.log('++++++++++this.productInfo ', this.productInfo.title)
    this.$nextTick(() => {
      this.setNavbar() // 设置topbar
      // 获取语料
      this.getProductFunctionCorpus()
    });
    if (this.mode === 12 || this.mode === 2) {
      this.windLabel = ['自动', '低档', '中低档', '中档', '中高档', '高档'];
      this.windconfig = [255, 151, 152, 153, 154, 155];
    }
    const windspeed = this.$store.state.publicInfo.attr['windspeed'];
    this.windSpeed = this.windconfig.indexOf(windspeed);
    // console.log('deviceStatus======', this.windspeed, this.windSpeed);
  },
  beforeDestroy () {
    AI.allListenRemove() // 页面兼听事件取消
  },
  methods: {
    // 设置topbar
    setNavbar () {
      AI.setNavbar({
        title: (this.productInfo.title === '设备名称') ? '格力空调分体机' : this.productInfo.title
      })
    },
    restartPolling () {
      window.clearInterval(this.timer);
      this.timer = window.clearInterval(() => {
        AI.polling.continue();
      }, 5000)
    },
    // 获取语料
    getProductFunctionCorpus () {
      AI.getProductFunctionCorpus().then((resp) => {
        this.functionCorpus = resp.model
        this.functionCorpusLoading = false
      }).catch((res) => {
        this.functionCorpusLoading = false
        console.log('失败返回', res)
      })
    },
    setTemp(Val) {
      // console.log('----setTemp----', Val);
      this.$store.dispatch('setDeviceStatus', {
        targetTemperature: Val
      });
    },
    onChange() {
      if (this.powerstate) {
        return true
      }
    },
    onChangewind(val) {
      // 静音档：150低档：151中低档：152中档：153中高档：154高档：155超强档：158自动档：255
      // console.log(val, 'change--------', this.windconfig);
      this.$store.dispatch('setDeviceStatus', {
        windspeed: this.windconfig[val]
      })
    }
  },
  watch: {
    'onlinestate': function (newVal, oldVal) {
      console.info(`newVal==${newVal}, oldVal==${oldVal}`);
      if (newVal === false) {
        this.restartPolling();
      } else if (oldVal === true) {
        window.clearInterval(this.timer);
        this.timer = 0;
      }
    },
    'sleepOnOff': function (val, oldVal) {
      console.warn('1111sleepOnOff: %s, old: %s', val, oldVal);
    },
    'mode': function (val, oldVal) {
      // console.warn('mode: %s, old: %s', val, oldVal);
      if (val === 12 || val === 2) {
        this.windLabel = ['自动', '低档', '中低档', '中档', '中高档', '高档'];
        this.windconfig = [255, 151, 152, 153, 154, 155];
      } else {
        this.windLabel = ['静音', '自动', '低档', '中低档', '中档', '中高档', '高档', '强劲'];
        this.windconfig = [150, 255, 151, 152, 153, 154, 155, 158];
      }
      const windspeed = this.$store.state.publicInfo.attr['windspeed'];
      this.windSpeed = this.windconfig.indexOf(windspeed);
    },
    'windspeed': function (val, oldVal) {
      const windspeed = this.$store.state.publicInfo.attr['windspeed'];
      this.windSpeed = this.windconfig.indexOf(windspeed);
    },
    'windconfig': function (val, oldVal) {
      // console.log('windconfig----------: %s, old: %s', val, oldVal, this.windconfig)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.title{
  padding: 10px 15px 0;
  font-size: 16px;
  color: #333;
  line-height: 40px;
}
.headerContent{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:linear-gradient(180deg,rgba(0,130,255,1) 0%,rgba(0,184,255,1) 100%);
  padding-bottom: 35px;
  padding-top: 30px;
  .tempInner{
    margin-top: 28px;
    height:21px;
    font-size:15px;
    font-weight:400;
    color:rgba(255,255,255,1);
    line-height:21px;
  }
  .title {
    color: #4a4a4a;
    font-weight: bold;
    padding-top: 5px;
  }
}

.headerContent.gray {
  background: linear-gradient(180deg, rgba(98, 114, 143, 1) 0%, rgba(137, 153, 181, 1) 100%);
}
.tn-pushButton{
  width: calc(100%/3);
}
.tn-pushGroup:first-child{
  border-bottom: solid 10px #F1F2F7;
}

.tn-pushBar{
  padding: 0 !important;
}
.tn-pushBar-item{
  padding-left: 4vw;
}
.tn-slider{
  border-bottom: 1px solid #ebebeb;
}
.isLight .tn-slider--disabled .tn-slider__point--active span{
  color:rgb(0, 130, 255);
}
.functionCorpus{
  height: 300px;
  overflow: scroll;
}
.tn-pushBar-box:last-child .tn-pushBar-item{
  border-bottom: 1px solid #ebebeb;
}
</style>
