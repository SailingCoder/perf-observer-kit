import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import strip from '@rollup/plugin-strip';
import pkg from './package.json';
import { defineConfig } from 'rollup';

// 创建一个替换__VERSION__的插件
const versionReplacer = {
  name: 'version-replacer',
  transform(code) {
    return code.replace(/__VERSION__/g, pkg.version);
  }
};

// 环境定义插件 - 用于条件编译
const envPlugin = {
  name: 'env-plugin',
  transform(code) {
    return code.replace(/process\.env\.NODE_ENV/g, JSON.stringify('production'));
  }
};

// 移除 console.log 等调试相关代码的配置
const stripOptions = {
  include: ['**/*.ts'],
  functions: ['console.debug', 'console.log', 'console.info'],
  sourceMap: true
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
      commonjs(),
      strip(stripOptions),
      terser({
        format: {
          comments: false
        }
      })
    ]
  },
  // UMD 标准浏览器版本
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
      envPlugin,
      resolve(),
      commonjs(),
      strip(stripOptions),
      terser({
        format: {
          comments: false
        }
      })
    ]
  },
  // 浏览器压缩版本
  {
    input: 'src/browser-entry.ts',
    output: {
      file: 'dist/perf-observer-kit.browser.min.js',
      format: 'umd',
      name: 'PerfObserverKit',
      sourcemap: false,  // 减小文件大小
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      versionReplacer,
      envPlugin,
      resolve(),
      commonjs(),
      strip(stripOptions),
      terser({
        compress: {
          drop_console: true
        },
        format: {
          comments: false
        }
      })
    ]
  },
  // 轻量级浏览器版本
  {
    input: 'src/browser-entry-light.ts',
    output: {
      file: 'dist/perf-observer-kit.light.min.js',
      format: 'umd',
      name: 'PerfObserverKit',
      sourcemap: false,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      versionReplacer,
      envPlugin,
      resolve(),
      commonjs(),
      strip({
        ...stripOptions,
        functions: ['console.debug', 'console.log', 'console.info', 'console.warn']
      }),
      terser({
        compress: {
          drop_console: true
        },
        format: {
          comments: false
        }
      })
    ]
  }
]); 