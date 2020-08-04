<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 1. 为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="main"
           ref="mainRef"
           style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 导入echarts第三方库,用于绘制图表
import echarts from 'echarts'
export default {
  methods: {
    // 生成数据报表折线图
    async setReportForm () {
      // 2.基于准备好的dom，初始化echarts实例
      // vue不推荐直接操作DOM,故用引用ref来获取DOM元素
      var myChart = echarts.init(this.$refs.mainRef)

      // 3.指定图表的配置项和数据
      // 获取图表数据
      var { data: res } = await this.$http.get('reports/type/1')
      if (res.meta.status !== 200) return false
      // 需要合并的选项
      var options = {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
      // 要将获取的数据res,data和后台提供的数据进行合并,若不合并则该数据显示的图表不完全
      // 使用lodash.merge能合并对象,深层次递归合并，若对象当中的属性有复杂数据类型，则也会对该复杂数据类型属性进行递归合并
      // lodash已经添加到Vue的prototype上,this._来获取lodash
      this._.merge(res.data, options)

      // 4.使用指定的配置项和数据生成图表
      myChart.setOption(res.data)
    }
  },
  // 该生命周期时，DOM已经渲染完毕,生成数据报表有对DOM的操作,故要将其放在mounted钩子中
  mounted () {
    this.setReportForm()
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 15px;
}
</style>
