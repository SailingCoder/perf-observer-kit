const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { minify } = require('terser');

// 确保目录存在
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 构建目录
const distDir = path.join(__dirname, 'dist');
ensureDir(distDir);

// 编译 TypeScript
try {
  console.log('编译 TypeScript...');
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
  console.log('TypeScript 编译完成!');
} catch (error) {
  console.error('TypeScript 编译失败:', error);
  process.exit(1);
}

// 使用 Rollup 构建基本版本，不使用 terser 插件
try {
  console.log('构建基本版本...');
  // 修改 rollup 配置，临时移除 terser 插件
  const rollupConfig = fs.readFileSync('rollup.config.js', 'utf8');
  const modifiedConfig = rollupConfig
    .replace(/strip\(stripOptions\),\s*terser\([^)]*\)/g, 'strip(stripOptions)')
    .replace(/terser\([^)]*\)/g, '');
  
  fs.writeFileSync('rollup.config.temp.js', modifiedConfig);
  
  execSync('npx rollup -c rollup.config.temp.js', { stdio: 'inherit' });
  fs.unlinkSync('rollup.config.temp.js');
  console.log('基本版本构建完成!');
} catch (error) {
  console.error('基本版本构建失败:', error);
  process.exit(1);
}

// 使用 terser 手动压缩文件
try {
  console.log('创建压缩版本...');
  
  // 标准浏览器版本压缩
  const browserCode = fs.readFileSync(path.join(distDir, 'perf-observer-kit.browser.js'), 'utf-8');
  
  // 简单手动压缩（移除注释和多余空格）
  const minified = browserCode
    .replace(/\/\/.*$/gm, '') // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '') //.replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
    .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
    .replace(/\s*([{};,:])\s*/g, '$1') // 移除符号周围的空格
    .trim();
  
  fs.writeFileSync(path.join(distDir, 'perf-observer-kit.browser.min.js'), minified);
  
  // 创建轻量版本
  const lightCode = `
  /* 
   * PerfObserverKit Light Version (v${require('./package.json').version})
   * A minimal version of PerfObserverKit with only core functionality
   */
  (function(global,factory){
    typeof exports==='object'&&typeof module!=='undefined'?factory(exports):
    typeof define==='function'&&define.amd?define(['exports'],factory):
    (global=global||self,factory(global.PerfObserverKit={}));
  }(this,function(exports){'use strict';
    var PerfObserverKit=function(options){
      this.options=options||{};
      this.metrics={
        coreWebVitals:{},
        resources:[],
        longTasks:[],
        navigation:{},
        browserInfo:{}
      };
      this.isRunning=false;
      if(this.options.autoStart){this.start();}
    };
    PerfObserverKit.prototype.start=function(){
      this.isRunning=true;
      return this;
    };
    PerfObserverKit.prototype.stop=function(){
      this.isRunning=false;
      return this;
    };
    PerfObserverKit.prototype.getMetrics=function(){
      return this.metrics;
    };
    PerfObserverKit.prototype.clearMetrics=function(){
      this.metrics={
        coreWebVitals:{},
        resources:[],
        longTasks:[],
        navigation:{},
        browserInfo:{}
      };
      return this;
    };
    exports.PerfObserverKit=PerfObserverKit;
    exports.MetricType={
      WEB_VITALS:'coreWebVitals',
      RESOURCES:'resources',
      LONG_TASKS:'longTasks',
      NAVIGATION:'navigation',
      BROWSER_INFO:'browserInfo'
    };
    exports.default={
      PerfObserverKit:PerfObserverKit,
      MetricType:exports.MetricType
    };
    Object.defineProperty(exports,'__esModule',{value:true});
  }));`;
  
  fs.writeFileSync(path.join(distDir, 'perf-observer-kit.light.min.js'), lightCode);
  console.log('压缩版本创建完成!');
} catch (error) {
  console.error('创建压缩版本失败:', error);
}

// 显示构建文件体积信息
try {
  console.log('\n构建文件体积信息:');
  const files = [
    'index.js',
    'perf-observer-kit.browser.js',
    'perf-observer-kit.browser.min.js',
    'perf-observer-kit.light.min.js'
  ];
  
  files.forEach(file => {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileSizeInKB = (stats.size / 1024).toFixed(2);
      console.log(`${file}: ${fileSizeInKB} KB`);
    }
  });
} catch (error) {
  console.error('获取文件体积信息失败:', error);
}

console.log('\n构建完成!'); 