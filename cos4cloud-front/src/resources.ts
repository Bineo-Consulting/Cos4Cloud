export let env: string = '__buildEnv__';
export let host: string = '__HOST__';

const resources = {
  dev: {
    host,
    cache_i18n: false,
    version: '1.0'
  },
  prod: {
    host,
    cache_i18n: true,
    version: Date.now()
  }
};

export default resources[env];
