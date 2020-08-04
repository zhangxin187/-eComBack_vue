<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear='searchInputCleared'>
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="searchByKeys"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表 -->
      <el-table :data="orderList"
                border
                stripe>
        <el-table-column type="index"
                         label="#">
        </el-table-column>
        <el-table-column prop="order_number"
                         label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price"
                         label="订单价格"
                         width="80">
        </el-table-column>
        <el-table-column prop="order_pay"
                         label="是否付款"
                         width="80">
          <template slot-scope="scope">
            <el-tag type="danger">{{scope.row.order_pay==0 ?'未付款':'已付款'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send"
                         label="是否发货"
                         width="80">
        </el-table-column>
        <el-table-column prop="create_time"
                         label="下单时间"
                         width="170">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="130">
          <template>
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showAddressDialog"></el-button>
            <el-tooltip effect="dark"
                        content="物流信息"
                        :enterable='false'
                        placement="top">
              <el-button type="success"
                         icon="el-icon-location"
                         size="mini"
                         @click="showExpressDialog"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 20, 30]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
      <!-- 修改地址的对话框 -->
      <el-dialog title="修改地址"
                 :visible.sync="addressDialogVisible"
                 width="50%"
                 @close='handleAddressClosed'>
        <!-- 表单区域 -->
        <el-form :model="addressForm"
                 :rules="addressRules"
                 ref="addressRef"
                 label-width="100px">
          <el-form-item label="省市区/县"
                        prop="address">
            <!-- 级联选择器 -->
            <el-cascader v-model="addressForm.address"
                         :options="cityData"
                         :props="casProps"
                         clearable></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址"
                        prop="detailAddress">
            <el-input v-model="addressForm.detailAddress"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editAddress">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流信息的对话框 -->
      <el-dialog title="查看物流进度"
                 :visible.sync="expressDialogVisible"
                 width="50%">
        <!-- 时间线组件 -->
        <el-timeline>
          <el-timeline-item v-for="(item,index) in expressData"
                            :key="index"
                            :timestamp="item.time">
            {{item.context}}
          </el-timeline-item>
        </el-timeline>

      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// 导入省市区数据
import cityData from '../assets/js/citydata.js'
export default {
  data () {
    return {
      // 获取订单列表的参数对象
      queryInfo: {
        // 关键字
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示数据条数
        pagesize: 5
      },
      // 订单数据列表
      orderList: [],
      // 数据总数
      total: 0,
      // 控制修改地址对话框的显示与隐藏
      addressDialogVisible: false,
      // 修改地址的表单数据对象
      addressForm: {
        // 省市区县，级联选择器选中的节点数组
        address: [],
        // 详细地址
        detailAddress: ''
      },
      // 修改地址的表单数据对象的验证规则
      addressRules: {
        address: [{ required: true, message: '请选择省市区', trigger: 'blur' }],
        detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      // 省市区数据,从js文件导入的省市区数据
      cityData: cityData,
      // 级联选择器的配置对象
      casProps: {
        children: 'children',
        label: 'label',
        value: 'value',
        expandTrigger: 'hover'
      },
      // 控制物流信息对话框的显示与隐藏
      expressDialogVisible: false,
      // 查询出来的物流信息数据
      expressData: []
    }
  },
  methods: {
    // 获取订单列表数据
    async getOrderList () {
      var { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return false
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示数据数量变化时触发
    handleSizeChange (pagesize) {
      // pagesize:变化后每页显示数据数量
      this.queryInfo.pagesize = pagesize
      // 重新获取数据
      this.getOrderList()
    },
    // 当前页发生变化时触发
    handleCurrentChange (pagenum) {
      // pagenum:改变后的当前页
      this.queryInfo.pagenum = pagenum
      // 重新获取数据
      this.getOrderList()
    },
    // 根据query关键字搜索订单数据
    searchByKeys () {
      // 搜索的输入框 和queryInfo.query双向绑定, 故直接获取数据
      this.getOrderList()
    },
    // 当搜索框被清空时
    searchInputCleared () {
      // 重新获取数据
      this.getOrderList()
    },
    // 展示修改地址的对话框
    // 修改地址的功能仅仅展示省市区联动展示,不做真正的修改地址
    showAddressDialog () {
      this.addressDialogVisible = true
    },
    // 修改地址,仅仅展示省市区联动
    editAddress () {
      // 表单验证
      this.$refs.addressRef.validate(valid => {
        if (!valid) return this.$message.error('表单字段值不符合验证规则')
        this.addressDialogVisible = false
        this.$message.success('省市区联动成功')
      })
    },
    // 当修改地址的对话框关闭时触发
    handleAddressClosed () {
      // 清空表单数据
      this.addressForm.address = []
      this.addressForm.detailAddress = ''
    },
    // 展示物流信息的对话框
    async showExpressDialog () {
      // 查询物流信息,使用后台提供的测试id
      var { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return false
      this.expressData = res.data
      this.expressDialogVisible = true
    }

  },
  created () {
    // 获取订单列表数据
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 15px;
}
.el-table {
  margin-top: 15px;
}
</style>
