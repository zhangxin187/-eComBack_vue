<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮，row+col利于页面布局 -->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 分类表格区域 -->
      <el-table :data="goodsCateList"
                row-key="cat_id"
                border
                :tree-props="treeProps">
        <el-table-column prop="cat_name"
                         label="分类名称">
        </el-table-column>
        <el-table-column prop="cat_deleted"
                         label="是否有效">
          <template slot-scope="scope">
            <i v-if="scope.row.cat_deleted"
               class="el-icon-success"
               style="color:green"></i>
            <i v-else
               class="el-icon-error"
               style="color:red"></i>
          </template>
        </el-table-column>
        <el-table-column prop="cat_level"
                         label="排序">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level==0">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level==1"
                    type="success">二级</el-tag>
            <el-tag v-else
                    type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditCateDialog(scope.row)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="deleteCate(scope.row.cat_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5,8, 10, 15]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>

      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类"
                 :visible.sync="addCateDialogVisible"
                 width="50%"
                 @close='addCateDialogClosed'>
        <el-form label-width="80px"
                 :model="addCateForm"
                 :rules="addCateRules"
                 ref="addCateRef">
          <el-form-item label="分类名称"
                        prop="cat_name">
            <el-input v-model='addCateForm.cat_name'></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- 级联选择器 -->
            <el-cascader v-model="selectedKeys"
                         :options="parentCateList"
                         :props="goodsCateCasProps"
                         @change="handleChange"
                         clearable></el-cascader>
          </el-form-item>
        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="addCateDialogVisible=false">取消</el-button>
          <el-button type="primary"
                     @click="addCate">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 编辑分类对话框 -->
      <el-dialog title="编辑分类"
                 :visible.sync="editCateDialogVisible"
                 width="50%"
                 @close='editCateDialogClosed'>
        <el-form label-width="80px"
                 :model="editCateForm"
                 :rules="editCateRules"
                 ref="editCateRef">
          <el-form-item label="分类名称"
                        prop="cat_name">
            <el-input v-model='editCateForm.cat_name'></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="editCateDialogVisible=false">取消</el-button>
          <el-button type="primary"
                     @click="editCate">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取分类的查询参数
      queryInfo: {
        // 当前页,默认显示第一页
        pagenum: 1,
        // 每页显示数据条数
        pagesize: 5,
        // 默认查询三层分类列表数据
        type: 3
      },
      // 数据总数
      total: 0,
      // 商品分类列表数据
      goodsCateList: [],
      // 树形表格的配置对象
      treeProps: {
        // 指定子节点
        children: 'children'
      },
      // 控制添加分类的对话框显示或隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: ''
      },
      // 添加分类的表单数据验证规则
      addCateRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 前两级分类的数据列表
      parentCateList: [],
      // 级联选择器的配置对象
      goodsCateCasProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 级联选择器选择的分类节点,选择的是分类的id
      selectedKeys: [],
      // 选中的父级分类id,将分类添加到该父级分类中
      parentId: 0,
      // 添加分类的层级
      cate_level: 0,
      // 控制编辑分类的对话框显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类的表单数据
      editCateForm: {
        cat_name: ''
      },
      // 编辑分类表单的验证规则
      editCateRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 正在编辑的分类id
      editingCateId: 0
    }
  },
  methods: {
    // 获取商品分类列表数据
    async getGoodsCategories () {
      var { data: res } = await this.$http('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return false
      this.goodsCateList = res.data.result
      this.total = res.data.total
    },
    // 当每页显示数据数量发生变化时触发
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      // 重新获取分类数据
      this.getGoodsCategories()
    },
    // 当前页发生变化时触发
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      // 重新获取分类数据
      this.getGoodsCategories()
    },
    // 展示添加分类的对话框
    async showAddCateDialog () {
      this.addCateDialogVisible = true
      // 该项目最多只能有三级分类，故不能向三级分类再添加分类，所以只需要获取前两级分类即可
      var { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return false
      this.parentCateList = res.data
      console.log(this.parentId)
      console.log(this.selectedKeys)
    },
    // 当级联选择器的选中发生变化时触发
    handleChange () {
      // 当未选择父级分类，则该分类添加为一级分类
      if (this.selectedKeys.length === 0) {
        this.parentId = 0
      } else {
        // 取出父级分类,将selectKeys数组中的最后一位保存到data
        this.parentId = this.selectedKeys[this.selectedKeys.length - 1]
      }
      // 保存添加分类的层级,分类层级与选中分类数组的长度一样
      // 0:一级分类  1:二级分类  2:三级分类
      this.cate_level = this.selectedKeys.length
    },
    // 添加分类
    addCate () {
      // 表单验证
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) return this.$message.error('表单验证不通过，添加分类失败')
        // 发起请求，添加分类
        var { data: res } = await this.$http.post('categories', {
          cat_pid: this.parentId,
          cat_name: this.addCateForm.cat_name,
          cat_level: this.cate_level
        })
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        // 重新获取数据
        this.getGoodsCategories()
        this.addCateDialogVisible = false
        this.$message.success('添加分类成功')
      })
    },
    // 添加分类对话框关闭时触发
    addCateDialogClosed () {
      // 清空表单
      this.$refs.addCateRef.resetFields()
      // 清空选中分类和父级分类
      this.selectedKeys = []
      this.parentId = 0
    },
    // 展示修改分类的对话框
    showEditCateDialog (data) {
      this.editCateDialogVisible = true
      // 将该分类的分类名渲染到表单中
      this.editCateForm.cat_name = data.cat_name
      this.editingCateId = data.cat_id
    },
    // 提交编辑分类
    editCate () {
      // 验证表单
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) return this.$message.error('表单验证不通过')
        var { data: res } = await this.$http.put('categories/' + this.editingCateId, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) return false
        this.getGoodsCategories()
        this.editCateDialogVisible = false
        this.$message.success('成功编辑该分类')
      })
    },
    // 当编辑分类的对话框关闭时触发
    editCateDialogClosed () {
      this.$refs.editCateRef.resetFields()
      this.editingCateId = 0
    },
    // 删除分类
    async deleteCate (id) {
      var result = await this.$confirm('是否删除该分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      if (result === 'cancel') {
        this.$message.info('已取消删除操作')
      } else {
        // 根据id删除分类
        var { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) return false
        this.getGoodsCategories()
        this.$message.success('成功删除该分类')
      }
    }

  },
  created () {
    // 获取商品分类列表数据
    this.getGoodsCategories()
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
.el-cascader {
  width: 100%;
}
</style>
