const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve (dir) {
  return path.join(__dirname,  dir)
}
module.exports = defineConfig({
  assetsDir: 'static',
  parallel: false,
  publicPath: './',

  lintOnSave: false,
  configureWebpack:{
    resolve: {
      // resolve是webpack的内置选项，顾名思义，决定要做的事情，也就是说当使用 import "jquery"，该如何去执行这件事
      // 情就是resolve配置项要做的，import jQuery from "./additional/dist/js/jquery" 这样会很麻烦，可以起个别名简化操作
      extensions: ['.js', '.vue', '.json'], // 省略扩展名，也就是说.js,.vue,.json文件导入可以省略后缀名，这会覆盖默认的配置，所以要省略扩展名在这里一定要写上
      alias: {
        //后面的$符号指精确匹配，也就是说只能使用 import vuejs from "vue" 这样的方式导入vue.esm.js文件，不能在后面跟上 vue/vue.js
        'vue$': 'vue/dist/vue.esm.js',
        // resolve('src') 其实在这里就是项目根目录中的src目录，使用 import somejs from "@/some.js" 就可以导入指定文件，是不是很高大上
        '@': resolve('src'),
        'common':resolve('public')
      }
    }
  },
  devServer: {
    https: true
  }

})
