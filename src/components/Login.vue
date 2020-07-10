<template>
<div class="login">
    <div class="loginBox">
        <!-- 头像区域 -->
        <div class="loginImg">
         <img src="../assets/logo.png" alt="">
        </div>
        <!-- 登陆表单区域 -->
        <div class="loginForm">
            <el-form :model="form" :rules="rules" ref="loginRef" @keyup.enter.native="login">
                <el-form-item  prop="username">
                  <el-input prefix-icon="el-icon-user-solid" v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item  prop="password">
                  <el-input prefix-icon="el-icon-lock" v-model="form.password" show-password  ></el-input>
                </el-form-item>
                <el-form-item class="btns">
                  <el-button type="primary" @click="login" >登陆</el-button>
                  <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</div>
</template>

<script>
export default {
  data: function () {
    return {
      form: {
        username: '',
        password: ''
      },
      // 表单验证规则对象，一定要放在data中
      rules: {
        // 用户名验证规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 密码验证规则
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }]
      }
    }
  },
  methods: {
    reset: function () {
      // 重置表单，调用elementUI提供的表单重置方法
      // 给DOM元素添加ref引用，可以在本组件的$refs中获取到其DOM元素，避免直接获取DOM操作DOM
      this.$refs.loginRef.resetFields()
    },
    login: function () {
      // 点击登陆按钮，先进行表单验证，通过elementUI提供的验证方法进行验证,成功再发送请求
      // 按照上面定义的验证规则rules进行验证
      this.$refs.loginRef.validate(async (valid) => {
      // 校验成功，参数valid为true，失败为false
      // eslint规范 return后面跟东西,不能是一个空return;验证失败,return阻止代码向下执行
        if (!valid) return false
        // 检验成功,通过axios向接口发送请求
        // 在main.js将axios放到了Vue原型对象prototype中,在所有的vue组件中能通过 $http获取到axios,并使用它发送请求
        // 使用对象解构赋值获取到具体的数据对象
        var { data: res } = await this.$http.post('login', this.form)
        // 当用户名或密码错误,接口请求失败时, res.data为空对象; $message消息提示,elementUI提供,我们将其添加到Vue的prototype上了
        if (!res.data) return this.$message.error('登陆失败')
        // 当登陆的用户名和密码正确,客户端存储token,实现登陆功能,保持客户端和服务器的连接
        // 服务器响应的数据里有 服务器生成的token
        // 通过sessionStorage存储token,有效期为关闭浏览器窗口
        sessionStorage.setItem('token', res.data.token)
        // 编程式导航,跳转到Home首页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login{
    height: 100%;
    background-color: #2B4B6B;
}
.loginBox{
        width: 540px;
        height: 320px;
        background-color: #fff;
        position: relative;
        left: 50%;
        top:50%;
        transform: translate(-50%,-50%);
        border-radius: 5px;
    }
     .loginImg{
         position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            padding:10px;
            box-shadow: 0 0 10px #FFFFFF;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;
            img{
                // img也可视作一个容器，可以添加border-radius和背景颜色
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #E7E7E7;
            }
        }
        .loginForm {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 0 20px;
            // padding使盒子变大，将盒模型改为border-box,padding不会改变width，会压缩内容区
            box-sizing: border-box;
        }
        .btns {
            text-align: right;
        }
</style>>
