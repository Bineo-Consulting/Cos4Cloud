import { Config } from '@stencil/core';
import replace from '@rollup/plugin-replace';

const cloudHost = 'https://europe-west2-cos4cloud-2d9d3.cloudfunctions.net'
const dev: boolean = process.argv && process.argv.indexOf('--dev') > -1;
const apiEnv: string = dev ? 'dev' : 'prod';
const HOST = process.env.HOST || (dev ? 'http://localhost:5001/cos4cloud-2d9d3/europe-west2/api' : cloudHost)

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: 'https://myapp.local/',
    },
  ],
  testing: false,
  plugins: [
    replace({
      exclude: 'node_modules/**',
      values: {
        __buildEnv__: apiEnv,
        __HOST__: HOST,
        __NATUSFERA__: process.env.__NATUSFERA__
      }
    })
  ]
};
