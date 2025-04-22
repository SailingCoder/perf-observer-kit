import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
import { defineConfig } from 'rollup';

// 创建一个替换__VERSION__的插件
const versionReplacer = {
  name: 'version-replacer',
  transform(code) {
    return code.replace(/__VERSION__/g, pkg.version);
  }
};

export default defineConfig([
  // ESM 和 CJS 版本
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      versionReplacer,
      resolve(),
      commonjs()
    ]
  },
  // UMD 浏览器版本
  {
    input: 'src/browser-entry.ts',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'PerfObserverKit',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      versionReplacer,
      resolve(),
      commonjs()
    ]
  }
]); 