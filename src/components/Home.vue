<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <!-- logo区域 -->
      <div class="logo">
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <!-- 退出登陆按钮 -->
      <el-button type="info" @click='loginOut' class="loginOut">退出登陆</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="asideWidth">
        <!-- 展开和隐藏菜单的按钮 -->
        <div class="toggleBar" @click='collapseToggle'>|||</div>
        <!-- 侧边栏菜单 -->
        <!-- 保持一个子菜单展开，unique：打开路由模式，router：导航以index作为path进行路由跳转 -->
        <el-menu background-color="#333744" text-color="#fff" :unique-opened='true' router :collapse='collapseFlag' :collapse-transition='false'>
          <!-- 利用两层循环生成侧边菜单 -->
          <!-- 一级菜单,index的值要为string，故将number转为string -->
          <el-submenu :index="item.id+''" v-for="item in menus" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标,使用的是阿里图标库 -->
              <i :class="'iconfont '+icons[item.id]" ></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <!-- 二级菜单模板，与一级菜单结构一样 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data: function () {
    return {
      menus: [],
      // 一级菜单的图标,根据菜单的id动态指定相应的图标
      // 菜单的id作为属性名，在模板中icons[item.id]来获取图标的类名
      icons: {
        125: 'icon-users',
        103: 'icon-tijikongjian',
        101: 'icon-shangpin',
        102: 'icon-danju',
        145: 'icon-baobiao'
      },
      // 控制菜单展开或隐藏，默认隐藏
      collapseFlag: false,
      // 侧边栏的宽度
      asideWidth: '200px'
    }
  },
  methods: {
    loginOut: function () {
      // 清空sessionStorage，清空token，实现退出登陆
      sessionStorage.clear()
      // 跳转到登陆页面
      this.$router.push('/login')
    },
    collapseToggle: function () {
      // 切换菜单的显示隐藏状态
      this.collapseFlag = !this.collapseFlag
      // 当菜单隐藏时 侧边栏宽度为65px，当菜单显示时 侧边栏宽度为200px
      if (this.collapseFlag) {
        this.asideWidth = '65px'
      } else {
        this.asideWidth = '200px'
      }
    }
  },
  // 生命周期钩子函数，在vue实例创建成功后，该函数被调用
  async created () {
  // 向接口发送axios请求，获取菜单的数据
    var { data: res } = await this.$http.get('menus')
    // 若请求不成功，则阻止代码向下执行
    if (res.meta.status !== 200) return false
    // 将获取到的数据赋值给data,完成数据的初始化
    this.menus = res.data
    console.log(this.menus)
  }
}
</script>

<style lang="less" scoped>
// element组件的标签名称就是类名，可以通过.el-xx为其添加样式
.el-header{
    background-color: #373D41;
    padding: 0;
    display: flex;
    // 两边贴边，中间平分
    justify-content: space-between;
    // 在侧轴上居中，默认的主轴是X轴
    align-items: center;
}
.el-aside {
    background-color: #333744;
    height: 100%;
}
.el-container {
    height:100%;
}
.logo {
    // flex布局
    display: flex;
    align-items: center;
    img{
        width: 50px;
        height: 50px;
    }
    span{
      color:#fff;
      font-size: 22px;
      margin-left:10px;
    }
    .el-submenu{
      font-size: 12px;
    }
}
.toggleBar{
  color:#fff;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  //增加字符间距
  letter-spacing: .1em;
  background-color: #4A5064;
  line-height: 25px;
}
.el-menu{
  //清除菜单默认的右边框
  border-right: none;
}
</style>
