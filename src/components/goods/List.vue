<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row :gutter='15'>
        <el-col :span='8'>
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear='handleClearQuery'>
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="searchGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"
                     @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodsList"
                border
                stripe>
        <el-table-column label="#"
                         type="index"></el-table-column>
        <el-table-column label="商品名称"
                         prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)"
                         prop="goods_price"
                         width="110"></el-table-column>
        <el-table-column label="商品重量"
                         prop="goods_weight"
                         width="80"></el-table-column>
        <el-table-column label="商品数量"
                         prop="goods_number"
                         width="80"></el-table-column>
        <el-table-column label="创建时间"
                         width="170">
          <!-- 使用prop直接绑定时间数据,时间未经过处理,所以使用作用域插槽+插值表达式+过滤器来显示处理后的时间 -->
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="120">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditGoodsDialog(scope.row)"></el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[10, 20, 30, 40]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>

      <!-- 编辑商品数据的对话框 -->
      <el-dialog title="编辑商品"
                 :visible.sync="eidtGoodsdialogVisible"
                 width="50%">
        <!-- 表单区域 -->
        <el-form :model="editGoodsForm"
                 :rules="editGoodsrules"
                 ref="editGoodsRef"
                 label-width="100px">
          <el-form-item label="商品名称"
                        prop="goods_name">
            <el-input v-model="editGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格"
                        prop="goods_price">
            <el-input v-model="editGoodsForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量"
                        prop="goods_weight">
            <el-input v-model="editGoodsForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量"
                        prop="goods_number">
            <el-input v-model="editGoodsForm.goods_number"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="deidtGoodsdialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editGoods">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取商品列表数据的相关参数
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页
        pagenum: 1,
        // 每页显示数据条数
        pagesize: 10
      },
      // 商品列表数据总数
      total: 0,
      // 商品列表数据
      goodsList: [],
      // 控制编辑商品对话框的显示与隐藏
      eidtGoodsdialogVisible: false,
      // 编辑商品的表单数据对象
      editGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        cat_id: 6
      },
      // 编辑商品的表单验证规则
      editGoodsrules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }]
      },
      // 待删除的商品id
      deleteGoodsId: null
    }
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList () {
      var { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return false
      this.total = res.data.total
      this.goodsList = res.data.goods
    },
    // 当前页发生变化
    handleCurrentChange (pagenum) {
      // pagenum:新的当前页,要跳转的页码
      // 对queryInfo进行修改
      this.queryInfo.pagenum = pagenum
      // 基于新的queryInfo重新查询数据
      this.getGoodsList()
    },
    // 每页显示的数据数量发生变化
    handleSizeChange (pagesize) {
      // pagesize:新的每页显示数据数量
      // 对queryInfo进行修改
      this.queryInfo.pagesize = pagesize
      // 基于新的queryInfo重新查询数据
      this.getGoodsList()
    },
    // 根据关键字查询商品
    searchGoods () {
      // 关键字双向绑定在queryInfo中,故直接调用获取商品数据列表的方法
      this.getGoodsList()
    },
    // 当输入框点击清空按钮时触发
    handleClearQuery () {
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoods (goodsID) {
      // 是否删除确认框
      var result = await this.$confirm('是否删除该商品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => { return err })
      if (result === 'cancel') return this.$message.info('已取消删除')
      // 确认删除
      var { data: res } = await this.$http.delete('goods/' + goodsID)
      if (res.meta.status !== 200) return false
      this.getGoodsList()
      this.$message.success('成功删除该商品')
    },
    // 添加商品
    addGoods () {
      // 添加商品对应一个路由组件,使用对话框嵌套添加商品的功能不太友好
      // 编程式导航跳转到 添加商品的路由
      this.$router.push('/goods/add')
    },
    // 展示编辑商品的对话框
    showEditGoodsDialog (row) {
      this.deleteGoodsId = row.goods_id
      this.editGoodsForm.goods_name = row.goods_name
      this.editGoodsForm.goods_price = row.goods_price
      this.editGoodsForm.goods_number = row.goods_number
      this.editGoodsForm.goods_weight = row.goods_weight
      this.eidtGoodsdialogVisible = true
    },
    // 提交编辑商品
    editGoods () {
      // 表单验证
      this.$refs.editGoodsRef.validate(async valid => {
        if (!valid) return this.$message.error('表单字段值不符合规则')
        // 调用接口，发送请求
        var { data: res } = await this.$http.put('goods/' + this.deleteGoodsId, this.editGoodsForm)
        if (res.meta.status !== 201) {
          this.eidtGoodsdialogVisible = false
          return this.$message.error('修改商品信息失败')
        } else {
          this.eidtGoodsdialogVisible = false
          this.getGoodsList()
          this.$message.success('修改商品信息成功')
        }
      })
    }

  },
  created () {
    // 获取商品列表数据
    this.getGoodsList()
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
