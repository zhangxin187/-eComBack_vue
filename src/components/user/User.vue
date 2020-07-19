<template>
<div>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card class="box-card">
    <!-- 栅格系统，行+列，将一行分为24列，使用栅格系统快速布局 -->
    <!-- 搜索框与添加用户区域 -->
    <el-row :gutter='15'>
      <el-col :span='8'>
        <el-input placeholder="请输入内容" class='searchInput' v-model='queryInfo.query' clearable
        @clear='clearQuery'>
            <el-button slot="append" icon="el-icon-search" @click='searchQuery'></el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 用户展示列表 -->
    <el-table style="width: 100%" :data='userList' stripe border>
      <!-- type=index 给表格添加索引 -->
      <el-table-column  type="index" label="#">
      </el-table-column>
      <el-table-column  prop="username" label="姓名">
      </el-table-column>
      <el-table-column prop="email" label="邮箱">
      </el-table-column>
      <el-table-column  prop="mobile" label="电话">
      </el-table-column>
      <el-table-column  prop="role_name" label="角色">
      </el-table-column>
      <el-table-column  prop="" label="状态">
        <!-- 作用域插槽，scope.row可以获取表格中这行的数据;elementUI本质就是vue组件 -->
        <template slot-scope="scope">
          <el-switch v-model='scope.row.mg_state' @change='switchBar(scope.row)'>
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column  prop="" label="操作">
        <template slot-scope="scope">
         <el-button type="primary" icon="el-icon-edit" size="mini" @click='showEditDialog(scope.row.id)'></el-button>
         <el-button type="danger" icon="el-icon-delete" size="mini" @click='deleteUser(scope.row.id)'></el-button>
         <!-- 分配角色按钮，要加提示文字，当鼠标移入显示提示文字 -->
         <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
           <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
         </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[2, 4, 8, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加用户的对话框 -->
    <!-- :visible.sync 可实现点叉号 关闭对话窗 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="50%" @closed='addDialogClosed'>
       <!-- 添加用户的表单 -->
      <el-form :model='addUserForm' :rules="addUserRules" ref="addUserRef" label-width="80px" >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" clearable type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="addUserForm.checkPass" clearable type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button el-button @click="resetAddUserForm">取 消</el-button>
        <el-button type="primary"  @click='addUser'>确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible"  width="50%" @closed='editDialogClosed'>
      <el-form  label-width="70px" :model="editUserForm" :rules="editUserRules" ref="editUserRef">
        <el-form-item label="用户名" >
          <el-input v-model='editUserForm.username' disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model='editUserForm.email' clearable></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model='editUserForm.mobile' clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</div>
</template>

<script>
export default {
  data () {
    // 自定义验证规则,放到data中，不放在return之后
    // 邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      // value为待验证的数据，callback为回调函数,验证成功或失败callback必须要被调用
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!regEmail.test(value)) {
        return callback(new Error('邮箱格式不符合规则'))
      }
      // 合法的邮箱
      callback()
    }
    // 手机验证规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (!regMobile.test(value)) return callback(new Error('手机号码格式不符合规则'))
      // 合法的号码
      callback()
    }
    // 验证两次输入的密码是否一致的规则
    var checkPass = (rule, value, callback) => {
      if (this.addUserForm.password !== '' && this.addUserForm.checkPass !== '') {
        if (this.addUserForm.password === this.addUserForm.checkPass) {
          // 两次密码一致
          callback()
        }
        // 两次密码不一致
        callback(new Error('两次输入的密码不一致'))
      }
    }
    return {
      // 获取用户数据列表的参数对象
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码，默认显示第一页
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 2
      },
      // 用户数据对象
      userList: [],
      // 数据总个数，即用户总数量
      total: 0,
      // 添加用户的数据对象
      addUserForm: {
        username: '',
        password: '',
        checkPass: '',
        email: '',
        mobile: ''
      },
      // 添加用户的字段验证规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
          { validator: checkPass, trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
        checkPass: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
          { validator: checkPass, trigger: 'blur' }]
      },
      // 修改用户的验证规则
      editUserRules: {
        email: [
          { required: true, message: '请输入修改后的邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入修改后的手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制添加用户的对话窗显示隐藏
      addDialogVisible: false,
      // 编辑用户的对话框显示隐藏状态
      editDialogVisible: false,
      // 编辑用户的表单数据对象
      editUserForm: {}
    }
  },
  methods: {
    async getUserList () {
      // 向接口发送axios请求，获取数据
      var { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return false
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 当switch开关状态变化，保存用户的状态
    async switchBar (val) {
      // val接收用户状态改变后的这一行数据
      // 调用接口，更新数据
      var { data: res } = await this.$http.put(`users/${val.id}/state/${val.mg_state}`)
      if (res.meta.status !== 200) return this.$message.error('用户状态切换失败')
      this.$message.success('用户状态切换成功')
    },
    // 当前页发生变化，根据新的查询条件获取新的数据
    handleCurrentChange (val) {
      // val为新的当前页码
      this.queryInfo.pagenum = val
      // 获取新的数据
      this.getUserList()
    },
    // 每页显示数据数量发生变化
    handleSizeChange (val) {
      // val为新的每页显示数据条数
      this.queryInfo.pagesize = val
      // 获取新的数据
      this.getUserList()
    },
    // 根据关键字搜索用户
    searchQuery () {
      // input通过数据双向绑定，已经将数据更新到queryinfo.query中去了，这里直接获取新数据
      this.getUserList()
    },
    // 当清空输入框关键字时触发该事件函数，重新获取数据
    clearQuery () {
      this.getUserList()
    },
    // 向接口发生请求，添加用户
    addUser () {
      // 表单整体验证,根据定义的验证规则进行验证
      this.$refs.addUserRef.validate(async (valid) => {
        if (!valid) return this.$message.error('字段不符合规则，新增用户失败')
        // 验证成功
        // 对象赋值后，赋值的是地址，共同指向堆中同一个对象，当修改一个对象，另一个对象也会被修改
        // 先转为字符串再转为对象，能取消它们之间的关联性，使两个变量指向不同的对象
        var form = JSON.parse(JSON.stringify(this.addUserForm))
        // 删除对象当中的二次输入的密码
        delete form.checkPass
        var { data: res } = await this.$http.post('users', form)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        // 隐藏添加用户的对话窗
        this.addDialogVisible = false
        // 重置表单
        this.$refs.addUserRef.resetFields()
        // 重新获取数据列表
        this.getUserList()
      })
    },
    resetAddUserForm () {
      // 重置表单
      this.$refs.addUserRef.resetFields()
      // 隐藏添加用户的对话窗
      this.addDialogVisible = false
    },
    // 删除用户
    async deleteUser (id) {
      // 弹出确认框
      // 返回promise对象，await只能获取成功的结果，错误还需要catch来捕获并return
      var confirmResult = await this.$confirm('是否删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => { return err })
      // 点击确认返回confirm  点击取消返回cancel
      if (confirmResult === 'confirm') {
        var { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        // 重新获取数据
        this.getUserList()
      } else {
        this.$message.info('已取消删除该用户')
      }
    },
    // 展示修改用户的对话框
    async showEditDialog (id) {
      // 让对话框显示
      this.editDialogVisible = true
      // 根据id查询用户的信息，通过作用域插槽scope.row能拿到表格中一行的数据
      // 但是我们不能直接用该数据，该数据是前端渲染到页面的数据，调用后台接口获取数据库中的数据更加准确
      var { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return false
      // 将用户数据添加到修改表单数据对象
      this.editUserForm = res.data
    },
    // 编辑用户提交
    editUser () {
      // 对表单进行检验
      this.$refs.editUserRef.validate(async (valid) => {
        if (!valid) return this.$message.error('修改的字段值不符合验证规则')
        // 向接口发送请求，编辑用户的提交
        var { data: res } = await this.$http.put('users/' + this.editUserForm.id, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('编辑该用户失败')
        // 关闭对话框
        this.editDialogVisible = false
        this.$message.success('修改该用户信息成功')
        // 重新获取数据列表
        this.getUserList()
      })
    },
    // 修改用户的对话框关闭时触发
    editDialogClosed () {
      // 重置表单
      this.$refs.editUserRef.resetFields()
    },
    // 添加用户的对话框关闭时触发
    addDialogClosed () {
      // 重置表单
      this.$refs.addUserRef.resetFields()
    }
  },
  created () {
    // 获取用户数据列表
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
margin-bottom: 15px;
}
.el-table {
  margin-top: 15px;
}
.el-pagination{
  margin-top:10px;
}

</style>
