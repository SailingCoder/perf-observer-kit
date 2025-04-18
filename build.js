const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// 使用 Rollup 构建 UMD 版本
try {
  console.log('构建 UMD 版本...');
  execSync('npx rollup -c rollup.config.js', { stdio: 'inherit' });
  console.log('UMD 版本构建完成!');
} catch (error) {
  console.error('UMD 版本构建失败:', error);
  process.exit(1);
}

// 创建压缩版本
try {
  console.log('创建压缩版本...');
  const browserCode = fs.readFileSync(path.join(distDir, 'perf-observer-kit.browser.js'), 'utf-8');
  
  // 简单的压缩（移除注释和多余空格）
  const minified = browserCode
    .replace(/\/\/.*$/gm, '') // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
    .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
    .replace(/\s*([{};,:])\s*/g, '$1') // 移除符号周围的空格
    .trim();
  
  fs.writeFileSync(path.join(distDir, 'perf-observer-kit.browser.min.js'), minified);
  console.log('压缩版本创建完成!');
} catch (error) {
  console.error('创建压缩版本失败:', error);
}

console.log('构建完成!'); 