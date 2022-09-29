<template>
  <div class="app">
    <el-container>
      <el-aside class="el-aside"  width="260px">
        <Aside></Aside>
      </el-aside>
      <el-container>
        <!--<el-header>录制内容</el-header>-->
        <el-main >
          <Record></Record>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
    import Aside from "@/components/AsideView"
    import Record from "@/components/Record"
    export default {
        name: "HomePage",
        components:{Aside, Record},
    }
</script>

<style scoped>
  .el-header, .el-footer {
    background-color: #bec2b8;
    color: #ffffff;
    font-weight: bolder;
    /*text-align: center;*/
    line-height: 60px;
  }
  span{
    font-family: FZLTHK, FZLTHK-Regular;
  }

  .el-aside {
    background-color: #2c3e50;
    height:100vh;
    color: #ffffff;
    overflow: hidden;
    /*text-align: center;*/
    font-family:"Microsoft YaHei UI",Arial,"Times New Roman";

    /*line-height: 100vh;*/
  }


  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    /*line-height: 160px;*/
  }

  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
</style>
