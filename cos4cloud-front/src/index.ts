declare global {
  export type ServiceType = {
    get({value: string}): Promise<any>
    process(T: any[]): ItemType[]
  }
  export type ItemType = {
    name: string
    value: string
    bbox?: string
    lat?: number
    lon?: number
    icon?: string
  }
}

export { Components, JSX } from './components';
import '@stencil/router';
