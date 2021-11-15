import { Config } from '@stencil/core';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'

const path = require('path')
const publicDir = path.resolve(__dirname, 'public')
const head = require('fs').readFileSync(path.resolve(publicDir, 'head.html'))

const cloudHost = 'https://cos4bio.eu/api'

const dev: boolean = process.argv && process.argv.indexOf('--dev') > -1;
const apiEnv: string = dev ? 'dev' : 'prod';
const HOST = process.env.HOST || (dev ? 'http://localhost:5001/cos4cloud-2d9d3/us-central1/api' : cloudHost)

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  enableCache: true,
  testing: false,
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null,
      baseUrl: 'https://cos4bio.es/'
    }
  ],
  plugins: [
    replace({
      exclude: 'node_modules/**',
      values: {
        __buildEnv__: apiEnv,
        __HOST__: HOST,
        __NATUSFERA__: process.env.__NATUSFERA__
      }
    }),
    copy({
      targets: [
        {
          src: 'public/swagger.json',
          dest: 'www',
          hook: 'writeBundle'
        },
        {
          src: 'public/*.jpg',
          dest: 'www',
          hook: 'writeBundle'
        },
        {
          src: 'apidoc',
          dest: 'www',
          hook: 'writeBundle'
        },
        {
          src: 'public/en/*.html',
          dest: 'www/en',
          hook: 'writeBundle',
          transform: (contents) => `${head}\n${contents}`
        },
        {
          src: 'public/es/*.html',
          dest: 'www/es',
          hook: 'writeBundle',
          transform: (contents) => `${head}\n${contents}`
        }
      ]
    })
  ]
};
