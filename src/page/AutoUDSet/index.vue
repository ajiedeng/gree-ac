<template>
 <div class="autoPage">
   <div class="dw-swing">上下扫风</div>
        <div class="bgImg" id="echartContainer">
          <ul class='pie' @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
            <li class='slice-1 slice' :class="{bgLight: (show[0])}" > </li>
            <li class='slice-2 slice' :class="{bgLight: (show[1])}"> </li>
            <li class='slice-3 slice' :class="{bgLight: (show[2])}" > </li>
            <li class='slice-4 slice' :class="{bgLight: (show[3])}" > </li>
            <li class='slice-5 slice' :class="{bgLight: (show[4])}"> </li>
          </ul>
      </div>
      <p class="text">注：1.点击任意一个扫风位置，可精确定格扫风；2.滑动整个区域，
        可全部扫风；暂不支持选择多的位置（全扫除外）。</p>
   </div>
</template>
<script>
import {mapState} from 'vuex'
import Vue from 'vue';
import { Toast } from 'genie-ui';
Vue.use(Toast);
export default {
  name: 'index',
  data () {
    return {
      start: null,
      end: null,
      show: [0, 0, 0, 0, 0]
    }
  },
  // 设置navbar
  created() {
    this.$nextTick(() => {
      this.setNavbar(); // 设置topbar
    });
  },
  mounted() {
    this.onSelcet(this.upDownlAngleSelect);
  },
  computed: {
    ...mapState({
    // 上下扫风
      upDownlAngleSelect: state => {
        return state.publicInfo.attr.upDownlAngleSelect
      }
    })
  },
  methods: {
    setNavbar() {
      AI.setNavbar({
        title: '扫风设置'
      })
    },
    onSelcet(val) {
      // 关闭：0当前位置定格：1上定格：2偏上定格：3中定格：4偏下定格：5下定格：6
      switch (val) {
        case 0:
          console.log(val, 'valllllllllll');
          this.show = [0, 0, 0, 0, 0];
          break;
        case 1:
          this.show = [1, 1, 1, 1, 1];
          break;
        case 2:
          this.show = [1, 0, 0, 0, 0];
          break;
        case 3:
          this.show = [0, 1, 0, 0, 0];
          break;
        case 4:
          this.show = [0, 0, 1, 0, 0];
          break;
        case 5:
          this.show = [0, 0, 0, 1, 0];
          break;
        case 6:
          this.show = [0, 0, 0, 0, 1];
          break;
      }
    },
    getDirc(p1, p2) {
      const x = Math.abs(p1.x - p2.x);
      const y = Math.abs(p1.y - p2.y);
      return Math.sqrt(x ** 2 + y ** 2);
    },
    showToast(v) {
      this.$toast({
        text: '暂不支持该功能',
        duration: 1000
      })
    },
    ancrIndex (ancr) {
      if (ancr > 0 && ancr < 18) {
        return 1
      } else if (ancr > 18 && ancr < 36) {
        return 2
      } else if (ancr > 36 && ancr < 54) {
        return 3
      } else if (ancr > 54 && ancr < 72) {
        return 4
      } else {
        return 5
      }
    },
    setShow(start, end) {
      if (!start || !end) { return }
      this.show = [0, 0, 0, 0, 0]
      for (let i = start; i <= end; i++) {
        this.show[ i - 1 ] = 1;
      }
      this.$forceUpdate()
    },
    getSelect () {
      const start = this.ancrIndex(this.start);
      const end = this.ancrIndex(this.end);
      // console.warn(start, end, 'start----end', this.start, this.end);
      if (start < end) {
        this.setShow(start, end)
      } else {
        this.setShow(end, start)
      }
    },
    handle(e) {
      const dom = document.querySelector('#echartContainer ul');
      const width = dom.clientWidth;

      const center = {
        x: width / 2 + 72,
        y: width / Math.sqrt(2) - 60
      };
      const radius = width / 2;
      // console.error(JSON.stringify(center), 'JSON.stringify(center)');

      if (!e.touches || !e.touches[0]) {
        return;
      }
      const {clientX: x, clientY: y} = e.touches[0] || e.changedTouches[0];

      // console.error('ponit:', x, y);

      if (x > center.x) {
        // 在扇形右侧区域
        // console.log('x > center.x');
        // TODO
        return;
      }

      if (this.getDirc({x, y}, center) > radius) {
        // 在扇形左侧区域，但与圆心距离过远
        // console.log('this.getDirc({x, y}, center) > width / 2');
        // TODO
        return;
      }

      const distanceToCenterX = center.x - x;
      const arc = Math.acos(distanceToCenterX / this.getDirc({x, y}, center));
      // console.error('getDirc({x,y},center)',getDirc({x,y},center), distanceToCenterX)
      // console.error('arc',arc)
      let ancr = arc * 180 / Math.PI;

      if (ancr > 45) {
        // TODO
        return;
      }

      // console.error('before', ancr)
      if (y > center.y) {
        ancr += 45;
      } else {
        ancr = 45 - ancr
      }
      // console.error(ancr)
      return ancr;
    },
    handleTouchStart(e) {
      if (this.handle(e)) {
        let selectLength = this.show.filter(e => e === 1).length
        if (selectLength > 1) {
          this.show = [0, 0, 0, 0, 0]
          this.show[this.ancrIndex(this.handle(e)) - 1] = 1
        } else {
          if (this.show[this.ancrIndex(this.handle(e)) - 1] === 0) {
            this.show = [0, 0, 0, 0, 0]
            this.show[this.ancrIndex(this.handle(e)) - 1] = 1
          } else {
            this.show = [0, 0, 0, 0, 0]
            this.show[this.ancrIndex(this.handle(e)) - 1] = 0
          }
        }

        this.start = this.handle(e);
      }
    },
    handleTouchMove(e) {
      if (!this.handle(e)) {
        return
      }
      if (!this.start && this.handle(e)) {
        this.start = this.handle(e);
        return
      }
      this.end = this.handle(e);
      if (this.start && this.end) {
        this.getSelect()
      }
    },
    handleTouchEnd(e) {
      let selectLength = this.show.filter(e => e === 1).length;
      let values = [2, 3, 4, 5, 6]
      console.log(selectLength, 'selectLength');
      if (selectLength === 5) {
        this.$store.dispatch('setDeviceStatus', {
          upDownlAngleSelect: 1
        });
      } else if (selectLength === 0) {
        this.$store.dispatch('setDeviceStatus', {
          upDownlAngleSelect: 0
        });
      } else if (selectLength === 1) {
        let selectIdx = this.show.indexOf(1);
        this.$store.dispatch('setDeviceStatus', {
          upDownlAngleSelect: values[selectIdx]
        });
      } else {
        this.showToast();
      }
    }
  },
  watch: {
    'upDownlAngleSelect': function (val, oldVal) {
      this.onSelcet(val);
    }
  }
}
</script>
<style scoped>
.autoPage{
  height: 100%;
  background: #F1F2F7;
  width: 100%;
  overflow: hidden;
}
.dw-swing{
  padding: 36px 0 36px 15px;
  color:rgba(43,56,82,1);
  font-size:16px;
}
.text{
  color:rgba(153,153,153,1);
  font-size:10px;
  line-height:14px;
  width: 296px;
  margin: 0 auto;
  text-align: left;
  position: absolute;
  bottom:100px;
  left: 0;
  right:0;
}
.pie{
  width: 100%;
  height: 100%;
}
.bgImg {
  position: relative;
  left: 72px;
  top:-60px;
  margin: 0 auto;
  padding: 0;
  width: 468px;
  height: 468px;
  list-style: none;
  overflow: hidden;
  transform: rotate(-45deg); /*针对mac safari浏览器兼容*/
  border-radius: 234px;
}

.slice {
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 50%;
  transform-origin: 0% 100%;
  border-bottom: 1px solid #D9D9D9;
  background: #fff;
}
.bgLight {
  background: #34BCFF;
}
.slice-1 {
  transform: rotate(-18deg) skewY(-72deg);
}
.slice-2 {
  transform: rotate(-36deg) skewY(-72deg);
}
.slice-3 {
  transform: rotate(-54deg) skewY(-72deg);
}
.slice-4 {
  transform: rotate(-72deg) skewY(-72deg);
}
.slice-5 {
  transform: rotate(-90deg) skewY(-72deg);
}
</style>
