<template>
    <div class='process'>
      <div class="tempBox">
        <canvas ref="minus" :width="30" :height="height" v-on:click="minus"></canvas>
        <canvas ref="process" :width="width" :height="height"></canvas>
        <canvas ref="plus" :width="30" :height="height" v-on:click="plus"></canvas>
      </div>
    </div>
</template>

<script>
import Vue from 'vue';

let getPixelRatio = function(context) {
  var backingStore = context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1;

  return (window.devicePixelRatio || 1) / backingStore;
};
function getXY(e, obj) {
  // console.log('----e---', e, e.touches[0]);
  // console.log('----e.changedTouches[0]--', e.changedTouches[0]);
  let et = e.touches[0] ? e.touches[0] : (e.changedTouches[0] ? e.changedTouches[0] : e);
  // console.log('----et--', et);
  let x = et.clientX;
  let y = et.clientY;
  return {
    x: x - obj.offsetLeft + (document.body.scrollLeft || document.documentElement.scrollLeft),
    y: y - obj.offsetTop + (document.body.scrollTop || document.documentElement.scrollTop)
  }
}
function getClickXY(e, obj) {
  let x = e.clientX;
  let y = e.clientY;
  return {
    x: x - obj.offsetLeft + (document.body.scrollLeft || document.documentElement.scrollLeft),
    y: y - obj.offsetTop + (document.body.scrollTop || document.documentElement.scrollTop)
  }
}

let on = ('ontouchstart' in document) ? {
  start: 'touchstart', move: 'touchmove', end: 'touchend'
} : {
  start: 'mousedown', move: 'mousemove', end: 'mouseup'
};
let stopVal = 0;
let callbackFlag = true;
let startPointIn = false;
let Process = Vue.extend({
  name: 'Process',

  components: {},

  props: {
    // slideStop
    actionCallback: {
      type: Function,
      default: () => {}
    },
    // 是否禁用
    disable: {
      type: Boolean,
      default: false
    },
    // 是否可滑动
    canNotChange: {
      type: Boolean,
      default: true
    },
    // 宽度
    width: {
      type: Number,
      default: 230
    },
    // 宽度
    height: {
      type: Number,
      default: 200
    },
    // 内圈宽度
    innerCircleWidth: {
      type: Number,
      default: 75
    },
    // 内圈标题
    innerCircleTitle: {
      type: String,
      default: '温度设置'
    },
    // 圆求宽度
    ballWidth: {
      type: Number,
      default: 12
    },
    startBallWidth: {
      type: Number,
      default: 5
    },
    endBallWidth: {
      type: Number,
      default: 5
    },
    // 圆弧宽度
    borderWidth: {
      type: Number,
      default: 5
    },
    // max值
    maxValue: {
      type: Number,
      default: 32
    },
    // max值
    minValue: {
      type: Number,
      default: 16
    },
    value: {
      type: Number,
      default: 16
    },

  },
  data() {
    return {
      showValue: this.value,
    }
  },
  mounted() {
    const {actionCallback} = this;
    const {showValue} = this;
    let canvas = this.$refs.process;
    // let ctx = canvas.getContext('2d');
    // let or = this.width / 2 - this.ballWidth;
    // let br = this.ballWidth;
    let moveFlag = false;
    canvas.addEventListener(on.start, (e) => {
      // console.log('start', e);
      e.stopPropagation();
      e.preventDefault();
      if (!this.disable) {
        // moveFlag = true;
        startPointIn = this.startPointInCircle(e, canvas);
      }
    }, false);
    canvas.addEventListener(on.move, (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (this.disable || this.canNotChange) {
        return
      }
      moveFlag = true;
      if (moveFlag && startPointIn) {
        // console.log('move', e);
        // console.log('---this---', this);
        this.redraw(e, canvas, moveFlag)
      }
    }, false);

    canvas.addEventListener(on.end, (e) => {
      // console.log('end', e);
      e.stopPropagation();
      e.preventDefault();
      if (this.disable || this.canNotChange) {
        return
      }
      if (actionCallback && !this.disable && startPointIn) {
        console.log('---startPointIn---', startPointIn);
        this.redraw(e, canvas, moveFlag, true);
        callbackFlag && actionCallback(stopVal);
      }
      moveFlag = false;
    }, false);
    // console.log((showValue - this.minValue) / (this.maxValue - this.minValue) * 1.5 + 0.25);

    if (!this.canNotChange) {
      // console.log('------this.canNotChange------', this.canNotChange);
      this.drawClickButtons();
    }
    let tempVal;
    if (showValue < this.minValue || showValue > this.maxValue || showValue === undefined) {
      tempVal = showValue;
      console.log(`${showValue} ℃ --不在范围内`);
      if (!this.canNotChange) {
        tempVal = (this.minValue + this.maxValue) / 2;
        this.$toast({
          text: showValue + '℃ --不在范围内',
          duration: 2500
        });
      }
    } else {
      tempVal = showValue;
    }
    this.drawCircle((tempVal - this.minValue) / (this.maxValue - this.minValue) * 1.3 + 0.35);
  },
  computed: {},

  watch: {
    // 外部更改数据，重设数据
    disable (val, oldVal) {
      // console.log('-----val---', val);
      this.initCircle();
    },
    canNotChange (val, oldVal) {
      // console.log('-----val---', val);
      this.initCircle();
    },
    innerCircleTitle (val, oldVal) {
      // console.log('-----val---', val);
      this.initCircle();
    },
    value (val, oldVal) {
      // console.log('-----val---', val);
      let tempVal;
      if (val < this.minValue || val > this.maxValue || val === undefined) {
        tempVal = val;
        console.log(`${val} ℃ 不在范围内`);
        if (!this.canNotChange) {
          tempVal = (this.minValue + this.maxValue) / 2;
          this.$toast({
            text: val + '℃ 不在范围内',
            duration: 2500
          });
        }
      } else {
        tempVal = val;
      }
      this.drawCircle((tempVal - this.minValue) / (this.maxValue - this.minValue) * 1.3 + 0.35);
    },
    // // 触发touchEnd
    // dragging(val) {
    //   if (!val) {
    //     this.setVal()
    //   }
    // },
    // min() {
    //   this.setVal()
    // },
    // max() {
    //   this.setVal()
    // }
  },
  methods: {
    initCircle() {
      const {showValue} = this;
      let tempVal;
      if (showValue < this.minValue || showValue > this.maxValue || showValue === undefined) {
        tempVal = showValue;
        console.log(`${showValue} ℃ 不在范围内`);
        if (!this.canNotChange) {
          tempVal = (this.minValue + this.maxValue) / 2;
          this.$toast({
            text: showValue + '℃ 不在范围内',
            duration: 2500
          });
        }
      } else {
        tempVal = showValue;
      }
      this.drawCircle((tempVal - this.minValue) / (this.maxValue - this.minValue) * 1.3 + 0.35);
      this.drawClickButtons();
    },
    drawCircle(n) {
      // console.log('----------n-----', n);
      let canvas = this.$refs.process;
      let ctx = canvas.getContext('2d');
      let ratio = getPixelRatio(ctx);
      canvas.width = this.width * ratio;
      canvas.height = this.height * ratio;
      canvas.style.width = this.width + 'px';
      canvas.style.height = this.height + 'px';
      // console.log('-----radio----', ratio);
      let ox = this.width * ratio / 2;
      let oy = this.width * ratio / 2;
      let or = this.width * ratio / 2 - this.ballWidth * ratio;
      let br = this.ballWidth * ratio;
      // let startBr = this.startBallWidth * ratio;
      // let endBr = this.endBallWidth * ratio;
      // ctx.scale(ratio, ratio);

      function offset(r, d) { // 根据弧度与距离计算偏移坐标
        return {x: -Math.sin(r) * d, y: Math.cos(r) * d};
      }

      const draw = (n) => {
        // console.log(Math.cos(n*1*Math.PI),'jiaodu')
        // console.log('----n---', n);
        let jiaodu = 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // if (this.canNotChange) {
        //   if (this.disable) {
        //     ctx.strokeStyle = '#B6BECC';
        //   } else {
        //     ctx.strokeStyle = '#fff';
        //   }
        //   ctx.lineWidth = this.borderWidth * ratio;
        //   ctx.beginPath();
        //   // ctx.lineCap = 'round';
        //   ctx.arc(ox, oy, or, 0.85 * Math.PI, 2 * Math.PI);// 四分三圆
        //   ctx.stroke();
        //   ctx.beginPath();
        //   ctx.arc(ox, oy, or, 0, 0.15 * Math.PI);// 四分三圆
        //   ctx.stroke();
        // } else
        //   {
        if (n < 1.65) { // 画已选中的圆
          jiaodu = n + 0.5;

          if (this.disable) {
            ctx.strokeStyle = '#B6BECC';
          } else if (this.canNotChange) {
            if (this.disable) {
              ctx.strokeStyle = '#B6BECC';
            } else {
              ctx.strokeStyle = '#fff';
            }
            ctx.lineWidth = this.borderWidth * ratio;
            ctx.beginPath();
            // ctx.lineCap = 'round';
            ctx.arc(ox, oy, or, 0.85 * Math.PI, 2 * Math.PI);// 四分三圆
            ctx.stroke();
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.arc(ox, oy, or, 0, 0.15 * Math.PI);// 四分三圆
            ctx.stroke();
            ctx.strokeStyle = '#FFF';
          } else {
            ctx.strokeStyle = '#fff';
          }
          ctx.lineWidth = this.borderWidth * ratio;
          ctx.beginPath();
          ctx.lineCap = 'round';
          // ctx.arc(ox,oy,or,0,Math.PI,true);// 半圆
          ctx.arc(ox, oy, or, 0.85 * Math.PI, jiaodu * Math.PI)
          ;// 四分三圆
          // ctx.arc(ox,oy,or,0,2*Math.PI,true);// 整圆
          ctx.stroke();
          // 画未选中的圆
          if (this.disable) {
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.canNotChange && (ctx.strokeStyle = '#B6BECC');
          } else {
            if (this.canNotChange) { ctx.strokeStyle = 'rgba(255,255,255,1)' } else { ctx.strokeStyle = 'rgba(0,0,0,0.1)' }
          }
          ctx.lineWidth = this.borderWidth * ratio;
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.arc(ox, oy, or, jiaodu * Math.PI, 0.15 * Math.PI);// 四分三圆
          ctx.stroke();
        } else {
          // 先画1.5以前的
          jiaodu = n + 0.5 - 2;
          if (this.disable) {
            ctx.strokeStyle = '#B6BECC';
          } else if (this.canNotChange) {
            if (this.disable) {
              ctx.strokeStyle = '#B6BECC';
            } else {
              ctx.strokeStyle = '#fff';
            }
            ctx.lineWidth = this.borderWidth * ratio;
            ctx.beginPath();
            // ctx.lineCap = 'round';
            ctx.arc(ox, oy, or, 0.85 * Math.PI, 2 * Math.PI);// 四分三圆
            ctx.stroke();
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.arc(ox, oy, or, 0, 0.15 * Math.PI);// 四分三圆
            ctx.stroke();
            ctx.strokeStyle = '#FFF';
          } else {
            ctx.strokeStyle = '#fff';
          }
          ctx.lineWidth = this.borderWidth * ratio;
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.arc(ox, oy, or, 0.85 * Math.PI, 2 * Math.PI);// 四分三圆
          ctx.stroke();

          if (this.disable) {
            ctx.strokeStyle = '#B6BECC';
          } else if (this.canNotChange) {
            ctx.strokeStyle = '#FFF';
          } else {
            ctx.strokeStyle = '#fff';
          }
          ctx.lineWidth = this.borderWidth * ratio;
          ctx.beginPath();
          ctx.arc(ox, oy, or, 0, jiaodu * Math.PI);// 四分三圆
          ctx.stroke();
          // 画未选中的圆
          if (this.disable) {
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.canNotChange && (ctx.strokeStyle = '#B6BECC');
          } else {
            if (this.canNotChange) { ctx.strokeStyle = 'rgba(255,255,255,1)' } else { ctx.strokeStyle = 'rgba(0,0,0,0.1)' }
          }
          ctx.lineWidth = this.borderWidth * ratio;
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.arc(ox, oy, or, jiaodu * Math.PI, 0.15 * Math.PI);// 四分三圆
          ctx.stroke();
        }
        // }
        // start circle
        // if (this.disable) {
        //   ctx.fillStyle = '#B6BECC';
        // } else {
        //   ctx.fillStyle = '#fff';
        // }
        // ctx.beginPath();
        // let startD = offset(0.4 * Math.PI, or);
        // ctx.arc(ox + startD.x, oy + startD.y, startBr, 0, 2 * Math.PI, true);
        // ctx.fill();

        // ctx.beginPath(); // end circle
        // if (this.canNotChange) {
        //   if (this.disable) {
        //     ctx.fillStyle = '#B6BECC';
        //   } else {
        //     ctx.fillStyle = '#fff';
        //   }
        // } else {
        //   if (this.disable) {
        //     ctx.fillStyle = '#596983';
        //   } else {
        //     ctx.fillStyle = '#107EC5';
        //   }
        // }
        // let endD = offset(1.6 * Math.PI, or);
        // ctx.arc(ox + endD.x, oy + endD.y, endBr, 0, 2 * Math.PI, true);
        // ctx.fill();
        // slider button
        if (!this.canNotChange) {
          if (this.disable) {
            ctx.fillStyle = '#B6BECC';
          } else if (this.canNotChange) {
            ctx.fillStyle = '#FFF';
          } else {
            ctx.fillStyle = '#fff';
          }
          ctx.beginPath(); // 圆弧
          let d = offset(n * 1 * Math.PI, or);
          ctx.arc(ox + d.x, oy + d.y, br, 0, 2 * Math.PI, true);
          ctx.fill();
        }

        // 画内圈以及文字
        // if (this.disable) {
        //   ctx.fillStyle = '#B6BECC';
        // } else {
        //   ctx.fillStyle = '#fff';
        // }
        // ctx.beginPath(); // 圆弧
        // ctx.arc(this.width * ratio / 2, this.height * ratio / 2, this.innerCircleWidth * ratio, 0, 2 * Math.PI);
        // ctx.fill();

        if (this.disable) {
          ctx.fillStyle = '#B6BECC';
        } else if (this.canNotChange) {
          ctx.fillStyle = '#FFF';
        } else {
          ctx.fillStyle = '#fff';
        }
        ctx.font = 60 * ratio + 'px PingFangSC-Regular';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // +14
        // (showValue-this.minValue)/(this.maxValue-this.minValue)*1.5+0.25
        this.showValue = Math.round((n - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue);
        if (!this.canNotChange) {
          if (Math.round((n - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue) < -10) {
            ctx.fillText(Math.round((n - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue), (this.width / 2 - 11) * ratio, (this.width / 2 + 8) * ratio);
          } else {
            ctx.fillText(Math.round((n - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue), this.width * ratio / 2, (this.width / 2 + 8) * ratio);
          }
        } else {
          ctx.font = 32 * ratio + 'px PingFangSC-Regular';
          ctx.fillText('自动', this.width * ratio / 2, (this.width / 2 + 2) * ratio);
        }
        // unit
        if (this.disable) {
          ctx.fillStyle = '#B6BECC';
        } else if (this.canNotChange) {
          ctx.fillStyle = '#FFF';
        } else {
          ctx.fillStyle = '#fff';
        }
        ctx.font = 12 * ratio + 'px PingFangSC-Regular';
        !this.canNotChange && ctx.fillText('℃', (this.width / 2 + 55) * ratio, (this.width / 2 - 20) * ratio);
        // title
        if (this.disable) {
          ctx.fillStyle = '#B6BECC';
        } else if (this.canNotChange) {
          ctx.fillStyle = '#FFF';
        } else {
          ctx.fillStyle = '#fff';
        }
        ctx.font = 12 * ratio + 'px PingFangSC-Regular';
        ctx.fillText(this.innerCircleTitle, this.width * ratio / 2, (this.width / 2 - 55) * ratio);

        // minValue
        if (this.disable) {
          ctx.fillStyle = 'rgba(182,190,204,0.6)';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
        }
        ctx.font = 12 * ratio + 'px PingFangSC-Regular';
        ctx.fillText(this.minValue + '℃', 25 * ratio, (this.width - 40) * ratio);
        // maxValue
        if (this.disable) {
          ctx.fillStyle = 'rgba(182,190,204,0.6)';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
        }
        ctx.font = 12 * ratio + 'px PingFangSC-Regular';
        ctx.fillText(this.maxValue + '℃', (this.width - 25) * ratio, (this.width - 40) * ratio);
      };
      draw(n)
    },
    startPointInCircle(e, canvas) {
      // let ratio = getPixelRatio(canvas.getContext('2d'));
      let ox = this.width / 2;
      let oy = this.width / 2;
      let k = getXY(e, canvas);
      let r = Math.atan2(k.x - ox, oy - k.y);
      let touchCircleWidth = Math.sqrt(Math.pow((k.x - ox), 2) + Math.pow((k.y - oy), 2));
      if (touchCircleWidth < 60) {
        // 点击范围要在内圈之外，点击圈内不改变滑动值
        return false;
      } else {
        let hd = (Math.PI + r) / (Math.PI);
        return hd >= 0.3 && hd <= 1.70
      }
    },
    redraw(e, canvas, moveFlag, endFlag) {
      // let ratio = getPixelRatio(canvas.getContext('2d'));
      let ox = this.width / 2;
      let oy = this.width / 2;
      let k = getXY(e, canvas);
      let r = Math.atan2(k.x - ox, oy - k.y);
      let touchCircleWidth = Math.sqrt(Math.pow((k.x - ox), 2) + Math.pow((k.y - oy), 2));
      console.log('-----touchCircleWidth------', touchCircleWidth);
      if (touchCircleWidth < 60) {
        // 点击范围要在内圈之外，点击圈内不改变滑动值
        callbackFlag = false;
        return
      } else {
        callbackFlag = true
      }
      let hd = (Math.PI + r) / (Math.PI);
      // console.log('+++this-hd--', hd);
      let canCycle = Math.round((hd - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue) < stopVal &&
        stopVal - Math.round((hd - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue) > this.maxValue - this.minValue;
      // console.log(canCycle, hd, Math.round((hd - 0.25) / 1.5 * (this.maxValue - this.minValue) + this.minValue));
      // 半圆的滑动范围判断
      stopVal = Math.round((hd - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue);
      // console.log('---redraw--stopVal--', stopVal);
      console.log('-------hd----', hd);
      if (hd <= 1.65 && hd >= 0.35 && !canCycle) {
        console.log('----come--in---hd----', hd);
        // +14
        stopVal = Math.round((hd - 0.35) / 1.3 * (this.maxValue - this.minValue) + this.minValue);
        if (moveFlag) {
          if (endFlag) {
            if (this.timer) {
              clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
              // console.log('---timeout----', (stopVal - this.minValue) / (this.maxValue - this.minValue) * 1.5 + 0.25);
              this.drawCircle((stopVal - this.minValue) / (this.maxValue - this.minValue) * 1.3 + 0.35);
            }, 50);
          }
        } else {
          this.drawCircle((stopVal - this.minValue) / (this.maxValue - this.minValue) * 1.3 + 0.35);
        }
        moveFlag && this.drawCircle(hd);
      } else if (startPointIn && hd > 1.65 && !canCycle) {
        if (moveFlag) {
          if (endFlag) {
            if (this.timer) {
              clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
              // console.log('---timeout----', 1.5 + 0.25);
              this.drawCircle(1.65);
            }, 50);
          }
        }
      } else if (startPointIn && hd < 0.35 && !canCycle) {
        if (moveFlag) {
          if (endFlag) {
            if (this.timer) {
              clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
              // console.log('---timeout----', 0.25);
              this.drawCircle(0.35);
            }, 50);
          }
        }
      }
      if (stopVal < this.minValue) {
        stopVal = this.minValue;
      } else if (stopVal > this.maxValue) {
        stopVal = this.maxValue
      }
    },
    drawClickButtons() {
      let canvasPlus = this.$refs.plus;
      let ratio = getPixelRatio(canvasPlus.getContext('2d'));
      canvasPlus.width = 30 * ratio;
      canvasPlus.height = this.height * ratio;
      canvasPlus.style.width = '30px';
      canvasPlus.style.height = this.height + 'px';
      let canvasMinus = this.$refs.minus;
      canvasMinus.width = 30 * ratio;
      canvasMinus.height = this.height * ratio;
      canvasMinus.style.width = '30px';
      canvasMinus.style.height = this.height + 'px';
      let plusCtx = canvasPlus.getContext('2d');
      let minusCtx = canvasMinus.getContext('2d');

      plusCtx.clearRect(0, 0, canvasPlus.width, canvasPlus.height);
      minusCtx.clearRect(0, 0, canvasMinus.width, canvasMinus.height);
      if (this.canNotChange) {
        console.log('----cannotchange--');
        return
      }
      // 画 +
      // plusCtx.scale(1.5, 1.5);
      if (this.disable) {
        plusCtx.strokeStyle = '#B6BECC';
      } else if (this.canNotChange) {
        plusCtx.strokeStyle = '#FFF';
      } else {
        plusCtx.strokeStyle = '#fff';
      }
      plusCtx.beginPath();
      plusCtx.lineCap = 'round';
      plusCtx.lineWidth = 2 * ratio;
      plusCtx.moveTo(7 * ratio, 115 * ratio);
      plusCtx.lineTo(23 * ratio, 115 * ratio);
      plusCtx.moveTo(15 * ratio, 107 * ratio);
      plusCtx.lineTo(15 * ratio, 123 * ratio);
      plusCtx.stroke();
      // 画 -
      // minusCtx.scale(ratio, ratio);
      if (this.disable) {
        minusCtx.strokeStyle = '#B6BECC';
      } else if (this.canNotChange) {
        minusCtx.strokeStyle = '#FFF';
      } else {
        minusCtx.strokeStyle = '#fff';
      }
      minusCtx.beginPath();
      minusCtx.lineCap = 'round';
      minusCtx.lineWidth = 2 * ratio;
      minusCtx.moveTo(7 * ratio, 115 * ratio);
      minusCtx.lineTo(23 * ratio, 115 * ratio);
      minusCtx.stroke();
    },
    minus: function(e) {
      const {actionCallback, disable} = this;
      // console.log('----minus-', e);
      if (this.disable || this.canNotChange) {
        return
      }
      const {y} = getClickXY(e, this.$refs.minus);
      // console.log('---clickX, clickY--', x, y);
      if (y > 75 && y < 155) {
        if (this.showValue <= this.minValue) {
          this.$toast({
            text: '温度最低 ' + this.minValue + '℃',
            duration: 2500
          });
          return null
        } else {
          this.showValue--;
          this.drawCircle((this.showValue - this.minValue) / (this.maxValue - this.minValue) * 1.3 + 0.35);
          if (actionCallback && !disable) {
            actionCallback(this.showValue);
          }
        }
      } else {
        console.log('超出点击区域');
      }
    },
    plus: function(e) {
      const {actionCallback, disable} = this;
      // console.log('---plus--this', this);
      // console.log('----plus-', e);
      if (this.disable || this.canNotChange) {
        return
      }
      const {y} = getClickXY(e, this.$refs.plus);
      // console.log('---clickX, clickY--', x, y);
      if (y > 75 && y < 155) {
        // console.log('----this.showValue', this.showValue);
        if (this.showValue >= this.maxValue) {
          this.$toast({
            text: '温度最高 ' + this.maxValue + '℃',
            duration: 2500
          });
          return null
        } else {
          this.showValue++;
          this.drawCircle((this.showValue - this.minValue) / (this.maxValue - this.minValue) * 1.3 + 0.35);
          if (actionCallback && !disable) {
            actionCallback(this.showValue);
          }
        }
      } else {
        console.log('超出点击区域');
      }
    }
  }
});
Process.install = function (Vue) {
  Vue.component(Process.name, Process)
};
export default Process
</script>

<style lang="less" scoped>
  .tempBox{
    >canvas{
      display: inline-block;
    }
  }
  .process {
    // width: 100%;
    //  height: 100%;
    // position:relative;
    canvas {
      margin: 0 auto;
    }

    .processBottom {
      padding: 12px 35px 0 35px;
      font-size: 16px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
    }

    .processLeft {
      color: #fff;
      float: left;
      width: 50%;
      transform: translateY(-200%);
      text-align: left;
    }

    .processRight {
      color: #fff;
      float: right;
      width: 50%;
      text-align: right;
      transform: translateY(-200%);
    }
  }

</style>
