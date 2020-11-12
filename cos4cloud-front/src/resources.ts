export let env: string = '__buildEnv__';
export let host: string = '__HOST__';

const resources = {
  dev: {
    host
  },
  prod: {
    host
  }
};

export default resources[env];
