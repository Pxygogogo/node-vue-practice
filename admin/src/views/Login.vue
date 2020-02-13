<template>
  <div class="login-container">
   <el-card class="login-card" header="请先登录">
     <el-form :model="model" @submit.native.prevent="login">
       <el-form-item label="用户名">
         <el-input v-model="model.username" placeholder="请输入用户名..." required></el-input>
       </el-form-item>
       <el-form-item label="密码">
         <el-input v-model="model.password" placeholder="请输入密码..." required type="password"></el-input>
       </el-form-item>
       <el-form-item>
         <el-button type="primary" native-type="submit" >登录</el-button>
       </el-form-item>
     </el-form>
   </el-card>
  </div>
</template>

<script>
export default {
  data(){
    return{
      model:{}
    }
  },
  methods:{
    async login(){
      const res = await this.$http.post('login',this.model)
      localStorage.token = res.data.token
      this.$router.push('/')
      this.$message({
        type:'success',
        message:'登录成功！'
      })
    }
  }
  
}
</script>

<style>

.login-card{
  width: 30rem;
  margin: 5rem auto;
}


</style>
