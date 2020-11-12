import { Component, Host, Prop, State, h } from '@stencil/core';
import { MappingService } from '../../../services/mapping.service';
import { RouterHistory } from '@stencil/router';
import { toQueryString } from '../../../utils/to-query-string';

@Component({
  tag: 'page-observations',
  styleUrl: 'page-observations.css',
  shadow: true,
})
export class PageObservations {

  @State() items: any[] = []
  @Prop() history: RouterHistory;
  page: number = 0;
  @State() images: any = {}
  perPage: number = 80;

  componentWillLoad() {
    this.calcPerPage()
    const queryParams = this.history.location.query
    MappingService.get(queryParams)
    .then((res) => {
      this.items = res
      this.loadImages()
    })
    .catch((error) => {
      alert(error)
    })
  }

  calcPerPage() {
    const queryParams = this.history.location.query
    if (!queryParams.origin) {
      this.perPage = 80
    } else if (queryParams.origin.includes('natusfera')) {
      this.perPage = 80
    } else if (queryParams.origin.includes('ispot')) {
      this.perPage = 49
    }
  }

  search(params) {
    this.page = 0
    const q = toQueryString(params)
    this.history.push('/observations' + q, {
      query: params
    })
    MappingService.get(params)
    .then((res) => {
      console.log(res)
      if (params && params.page) {
        this.items.push(...res)
        this.items = [...this.items]
        if (!this.page) {
          this.page = this.items.length
        }
        this.loadImages()

      } else {
        this.items = res
      }
    })
    .catch((error) => {
      alert(error)
    })
  }

  loadImages() {
    const ii = this.items.filter(i => i.origin === 'iSpot' && !i.$$photos.length)
    const ispot = ii.map(i => i.ID).join(',')
    console.log({ispot})
    MappingService.images(ispot)
    .then(res => {
      ii.map(i => {
        if (res[i.ID]) {
          const photo = 'https:' + res[i.ID].src.replace(/\\\//g, '/')
          this.images = {
            ...this.images,
            [i.ID]: photo
          }
        }
      })
    })
  }

  loadMore() {
    if (this.items && this.items.length) {
      const params = this.history.location.query
      const page = Math.ceil(this.items.length / this.perPage)

      console.log({params, page})
      this.search({
        ...params,
        page
      })
    }
  }

  render() {
    return (
      <Host>
        <app-search
          specie={this.history.location.query.taxon_name}
          place={this.history.location.query.place}
          onSearch={(ev) => this.search(ev.detail)}></app-search>
        <app-grid
          onLoad={() => this.loadMore()}
          show-spinner="true"
          items={this.items}
          images={this.images}></app-grid>
      </Host>
    );
  }

}
