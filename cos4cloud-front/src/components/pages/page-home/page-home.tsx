import { Component, Host, Prop, State, h } from '@stencil/core';

import { MappingService } from '../../../services/mapping.service'
import { RouterHistory } from '@stencil/router';
import { toQueryString } from '../../../utils/to-query-string';
import { fetchTranslations } from '../../../utils/translation'

@Component({
  tag: 'page-home',
  styleUrl: 'page-home.css',
  shadow: true,
})
export class PageHome {

  @State() items: any[] = []
  @Prop() history: RouterHistory;
  @State() images: any = {}
  i18n: any = {
    home_title: 'All the biodiversity<br/>observations in one place',
    last_obersations: 'Last observations i18n'
  }

  async componentWillLoad() {
    this.i18n = await fetchTranslations()

    if (!(this.items && this.items.length)) {
      MappingService.get({quality_grade: 'casual', limit: 60})
      .then((res) => {
        this.items = res
        this.loadImages()
      })
      .catch((error) => {
        alert(error)
      })
    }
  }

  loadMore() {
    if (this.items && this.items.length) {
      const params = this.history.location.query
      const page = Math.ceil(this.items.length / 80)

      console.log({params, page})
      this.search({
        ...params,
        page
      })
    }
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

  search(params) {
    const q = toQueryString(params)
    this.history.push('/observations' + q, {
      query: params
    })
  }

  render() {
    return (
      <Host>
        <header class="cnt-1">
          <div class="cnt-1-i">
            <h1 class="title" innerHTML={this.i18n.home_title}></h1>
            <app-search onSearch={(ev) => this.search(ev.detail)}></app-search>
          </div>
        </header>
        <h3 innerHTML={this.i18n.last_obersations}></h3>
        <app-grid items={this.items} images={this.images}></app-grid>
        <app-footer></app-footer>
      </Host>
    );
  }

}
