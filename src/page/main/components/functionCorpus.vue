<template>
  <div class="functionCorpus">
    <h5 class="title">目前支持的口令</h5>
    <div v-if="!loading">
      <dl v-for="(val, key) in list" v-bind:key="key">
        <dt>{{val.functionName}}</dt>
        <dd v-for="(subVal, subVey) in val.corpusList" v-bind:key="subVey">
          <span>{{subVal}}</span>
        </dd>
      </dl>
    </div>

    <span class="text" v-if="!loading && list.length === 0">没有任何语料</span>
    <span class="text" v-if="loading">正在加载中...</span>
  </div>
</template>

<script type="text/ecmascript-6">

export default {
  name: 'functionCorpus',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default() {
        return []
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.text{
  display: block;
  color: #333;
  font-size: 14px;
  line-height: 50px;
  text-align: center;
}
.functionCorpus{
  color: #333;
  font-size: 14px;
  .title{
    padding: 0 18px;
    font-weight: bold;
    line-height: 50px;
  }
  dl{
    display: flex;
    padding-bottom: 20px;
    flex-direction: column;
    dt{
      padding: 15px 20px 0;
      border-top: 1px solid #DFE2EB;
    }
    dd{
      margin-top: 15px;
      padding: 0 20px;
      span{
        display: inline-block;
        padding: 7px 20px;
        background-image: linear-gradient(90deg, #00B8FF 0%, #0082FF 100%);
        box-shadow: 0 2px 12px 0 rgba(43,56,82,0.11);
        border-radius: 20px 20px 20px 2px;
        color: #fff;
        line-height: 22px;
      }
    }
  }
}
</style>
