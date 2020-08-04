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
      <!-- 警告提示 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                show-icon
                :closable='false'>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="mr-top">
        <el-col>
          <span>选择的商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader v-model="selectedKeys"
                       :options="goodsCateList"
                       :props="goodsCateCasProps"
                       clearable
                       @change="handleCasChange"></el-cascader>
        </el-col>
      </el-row>

      <!--参数-属性 Tab栏  -->
      <el-tabs v-model="activeName"
               @tab-click='handleTabClick'>
        <el-tab-pane label="动态参数"
                     name="many">
          <!-- 动态参数渲染区域 -->
          <el-button type="primary"
                     :disabled='isBtnDisabled'
                     @click="addParamsDialogVisible=true">添加参数</el-button>
          <el-table :data="manyTableData"
                    border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 参数项标签 -->
                <el-tag :key="index"
                        v-for="(item,index) in scope.row.attrValsArr"
                        closable
                        :disable-transitions="false"
                        @close="handleTagClose(scope.row,index)">
                  {{item}}
                </el-tag>

                <!-- 动态添加标签 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="tagInputRef"
                          size="small"
                          @keyup.enter.native="addAttrTag(scope.row)"
                          @blur="addManyAttrTag(scope.row)">
                </el-input>
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>

            </el-table-column>
            <el-table-column type="index"
                             label="#"></el-table-column>
            <el-table-column prop="attr_name"
                             label="参数名称"></el-table-column>
            <el-table-column prop="cat_name"
                             label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           icon="el-icon-edit"
                           size="small"
                           @click="showEditParamsDialog(scope.row)">修改</el-button>
                <el-button type="danger"
                           icon="el-icon-delete"
                           size="small"
                           @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性"
                     name="only">
          <!-- 静态属性渲染区域 -->
          <el-button type="primary"
                     :disabled='isBtnDisabled'
                     @click="addParamsDialogVisible=true">添加属性</el-button>
          <el-table :data="onlyTableData"
                    border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag :key="index"
                        v-for="(item,index) in scope.row.attrValsArr"
                        closable
                        :disable-transitions="false"
                        @close="handleTagClose(scope.row,index)">
                  {{item}}
                </el-tag>

                <!-- 动态添加标签 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="tagInputRef"
                          size="small"
                          @keyup.enter.native="addAttrTag(scope.row)"
                          @blur="addOnlyAttrTag(scope.row)">
                </el-input>
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"
                             label="#"></el-table-column>
            <el-table-column prop="attr_name"
                             label="属性名称"></el-table-column>
            <el-table-column prop="cat_name"
                             label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           icon="el-icon-edit"
                           size="small"
                           @click="showEditParamsDialog(scope.row)">修改</el-button>
                <el-button type="danger"
                           icon="el-icon-delete"
                           size="small"
                           @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数对话框，添加动态参数和静态属性共用一个对话框 -->
      <el-dialog :title="'添加'+titleText"
                 :visible.sync="addParamsDialogVisible"
                 width="50%"
                 @close='addParamsDialogClosed'>
        <el-form label-width="120px"
                 :model="addParamsForm"
                 :rules="addParamsRules"
                 ref="addParamsRef">
          <el-form-item :label="titleText+'名称'"
                        prop="attr_name">
            <el-input v-model='addParamsForm.attr_name'></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="addParamsDialogVisible=false">取消</el-button>
          <el-button type="primary"
                     @click="addParams">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 修改参数的对话框 -->
      <el-dialog :title="'修改'+titleText"
                 :visible.sync="editParamsDialogVisible"
                 width="50%"
                 @close='editParamsDialogClosed'>
        <el-form label-width="120px"
                 :model="editParamsForm"
                 :rules="editParamsRules"
                 ref="editParamsRef">
          <el-form-item :label="titleText+'名称'"
                        prop="attr_name">
            <el-input v-model='editParamsForm.attr_name'></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="editParamsDialogVisible=false">取消</el-button>
          <el-button type="primary"
                     @click="editParams">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有商品分类列表数据
      goodsCateList: [],
      // 级联选择器的配置对象
      goodsCateCasProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的分类，因为是级联选择器，所以必须用数组来存放选择的分类
      selectedKeys: [],
      //  tab栏绑定值,属性值为选中的选项卡的name
      //  属性值和获取参数、属性列表的sel参数值一样
      // only:获取静态参数  many:获取动态属性
      activeName: 'many',
      // 静态属性列表
      onlyTableData: [],
      // 动态参数列表
      manyTableData: [],
      // 控制添加参数对话框的显示与隐藏
      addParamsDialogVisible: false,
      // 添加参数的表单数据对象
      addParamsForm: {
        attr_name: ''
      },
      // 添加参数的表单验证规则
      addParamsRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 控制修改参数的表单显示与隐藏
      editParamsDialogVisible: false,
      // 修改参数的表单数据对象
      editParamsForm: {
        attr_name: ''
      },
      // 修改参数的表单验证规则对象
      editParamsRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取所有商品分类列表数据
    async getGoodsCateList () {
      var { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return false
      this.goodsCateList = res.data
    },
    // 当级联选择器的选中发生变化时触发
    handleCasChange () {
      // 只允许选择三级分类
      if (this.selectedKeys.length !== 3) {
        // 选中的不是三级分类
        // 清空级联选择器绑定的该数组,不能让其选择非三级分类
        this.selectedKeys = []
        // 清空之前获取的参数列表数据
        this.onlyTableData = []
        this.manyTableData = []
      }
      // 当选中了三级分类，获取相应分类的参数和属性
      this.getParamsList()
    },

    // 获取参数和属性列表,可以共用一个方法，根据sel请求参数的不同 来区分获取动态参数列表还是静态属性列表
    // 在组件内部也可以使用计算属性，不仅仅用于模板中
    async getParamsList () {
      var { data: res } = await this.$http.get(`categories/${this.selectedCateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return false
      // 遍历res.data数组，将attr_vals字符串转为数组并存储到当前对象中
      res.data.forEach((item) => {
        // 若字符串为空，split还是会将其拼接为数组，且数组有第一个元素，为空字符串,相应在表格当中渲染一个空标签
        if (item.attr_vals === '') {
          // 当字符串为空，存一个空数组
          item.attrValsArr = []
        } else {
          item.attrValsArr = item.attr_vals.split(' ')
        }
        // inputVisible: 控制动态添加标签的输入框显示与隐藏
        // inputValue: 与动态添加标签的input双向绑定的值
        // 将这两个属性添加到每个参数的数据对象中，使表格中每个展开行的动态添加标签的input 绑定独立的visible和value
        // 之前将这两个属性 添加在data中,所有动态添加标签的input绑定的是同一个visible和value
        // 这样将visible置为true，则所有的动态添加标签的input 显示出来,且向input输入内容时
        // 由于数据双向绑定，所有动态添加标签的input被渲染相同的输入内容
        item.inputVisible = false
        item.inputValue = ''
      })

      // 通过activeName来判断 是获取动态参数还是静态属性
      if (this.activeName === 'only') {
        // 获取的是静态属性
        this.onlyTableData = res.data
      } else {
        // 获取的是动态参数
        this.manyTableData = res.data
      }
    },
    // 当点击tab选项卡时触发
    handleTabClick () {
      // 获取参数或属性列表
      this.getParamsList()
    },
    // 添加参数
    addParams () {
      // 表单验证
      this.$refs.addParamsRef.validate(async valid => {
        if (!valid) return this.$message.error('表单验证不通过')
        // 调用接口，添加参数
        var { data: res } = await this.$http.post(`categories/${this.selectedCateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return false
        this.getParamsList()
        this.addParamsDialogVisible = false
        this.$message.success('添加参数成功')
      })
    },
    // 当添加参数的对话框关闭时触发
    addParamsDialogClosed () {
      // 重置表单
      this.$refs.addParamsRef.resetFields()
      this.addParamsDialogVisible = false
    },
    // 当表格中展开行的参数属性值标签移除时触发
    async handleTagClose (row, index) {
      // row:表格中该行绑定的数据  index:当前删除标签的索引
      // 前端页面删除该标签,从绑定数据的参数属性值数组中删除该索引
      row.attrValsArr.splice(index, 1)
      // 编辑提交参数,将修改保存到后台数据库
      this.saveAttribute(row)
    },

    // 编辑提交参数,将编辑的参数提交到后台数据库
    // 用于提交 参数删除标签和添加标签
    async saveAttribute (row) {
      // 调用接口,编辑提交参数
      var { data: res } = await this.$http.put(`categories/${this.selectedCateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        // 将数组转为字符串,参数要求为空格间隔的字符串
        attr_vals: row.attrValsArr.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('更新参数项失败')
      this.$message.success('更新参数项成功')
    },

    // 点击button,显示输入框
    showInput (row) {
      // 之前给每个参数数据对象中添加了控制input显示与隐藏的Visible 和 双向绑定的Vlue
      row.inputVisible = true
      // 在下次DOM更新循环结束后执行回调，即当input加载出来再执行回调
      // Vue 实现响应式并不是数据发生变化之后 DOM 立即变化，而是按一定的策略进行 DOM 的更新
      // 若不加nextTick,则让输入框获取焦点,此时输入框还未加载出来
      this.$nextTick(() => {
        // 输入框获取焦点
        // this.$refs.tagInputRef.$refs.input 获取原生的表单输入框
        this.$refs.tagInputRef.$refs.input.focus()
      })
    },
    // 动态添加参数标签
    addManyAttrTag (row) {
      // 之前给每个参数数据对象中添加了控制input显示与隐藏的Visible 和 双向绑定的Vlue
      // 故直接对row进行操作
      // 当输入的内容不为空，添加标签
      if (row.inputValue.trim().length !== 0) {
        // 前端页面添加标签,对该行绑定数据的数组追加元素
        row.attrValsArr.push(row.inputValue)
        // 保存编辑的参数属性值
        this.saveAttribute(row)
      }
      // 隐藏输入框
      row.inputVisible = false
      // 清空输入框绑定的值
      row.inputValue = ''
    },
    addOnlyAttrTag (row) {
      if (row.inputValue.trim().length !== 0) {
        // 静态属性的每个属性下的属性值只能有一个,当已经有了属性值时,则不能再添加属性值标签
        if (row.attrValsArr.length === 1) {
          this.$message.error('静态属性只能有一个属性值')
        } else {
          // 当前属性下没有属性值，可以添加属性值标签
          // 前端页面添加标签,对该行绑定数据的数组追加元素
          row.attrValsArr.push(row.inputValue)
          // 保存编辑的参数属性值
          this.saveAttribute(row)
        }
      }
      // 隐藏输入框
      row.inputVisible = false
      // 清空输入框绑定的值
      row.inputValue = ''
    },

    // 展示修改参数的对话框
    showEditParamsDialog (row) {
      this.editParamsDialogVisible = true
      // 将该行的参数名赋值给 修改参数的表单绑定的数据对象，将参数名渲染在表单中
      this.editParamsForm.attr_name = row.attr_name
      // 将参数id保存到data中,便于后续调用接口发送请求
      this.editParamsForm.attr_id = row.attr_id
    },
    // 保存修改后的参数
    editParams () {
      // 表单验证
      this.$refs.editParamsRef.validate(async valid => {
        if (!valid) return this.$message.error('表单验证失败')
        var { data: res } = await this.$http.put(`categories/${this.selectedCateId}/attributes/${this.editParamsForm.attr_id}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return false
        this.getParamsList()
        this.editParamsDialogVisible = false
        this.$message.success('修改参数成功')
      })
    },
    // 当修改参数的对话框关闭时触发
    editParamsDialogClosed () {
      // 清空表单
      this.$refs.editParamsRef.resetFields()
    },
    // 删除参数
    async deleteParams (row) {
      // 删除确认框
      var result = await this.$confirm('是否删除该删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'cancel') {
        return this.$message.info('已取消删除')
      }
      var { data: res } = await this.$http.delete(`categories/${this.selectedCateId}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return false
      this.getParamsList()
      this.$message.success('成功删除该参数')
    }
  },
  created () {
    // 获取所有商品分类列表数据
    this.getGoodsCateList()
  },
  computed: {
    // 获取选中的三级分类的id
    selectedCateId () {
      if (this.selectedKeys.length === 3) {
        //  选择了三级分类,返回三级分类的id
        return this.selectedKeys[this.selectedKeys.length - 1]
      }
      // 当未选中三级分类，则返回空
      return null
    },
    // 控制添加按钮的禁用状态
    isBtnDisabled () {
      // 当选中了三级分类则selectedKeys的长度为3
      // 当选中了三级分类则添加按钮可用 disabled的值设为false,未选中则添加按钮禁用 disabled的值设为true
      return this.selectedKeys.length !== 3
    },
    // 动态计算当前添加对话框的标题,添加静态属性和动态参数共用一个对话框
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }

}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 15px;
}
.mr-top {
  margin-top: 15px;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 7px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
