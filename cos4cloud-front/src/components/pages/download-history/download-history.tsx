import { Component, Host, h, State, Prop } from '@stencil/core';
import resources from '../../../resources'
import { toQueryString } from '../../../utils/to-query-string'
import { MappingService } from '../../../services/mapping.service';
import { timeAgo } from '../../../utils/time-ago'
import { RouterHistory } from '@stencil/router';

@Component({
  tag: 'download-history',
  styleUrl: 'download-history.css',
  shadow: true,
})
export class DownloadHistory {

  @State() items: any[] = []
  @Prop() history: RouterHistory;

  componentWillLoad() {
    this.load()
  }

  load() {
    const { sub } = JSON.parse(localStorage.user || '{}')

    if (!sub) {
      return this.history.goBack()
    }
    const url = `${resources.host}/downloads/search`

    fetch(url, { headers: {
      sub,
      sort: 'desc'
    } })
    .then(res => res.json())
    .then(res => {
      this.items = res.map(item => {
        item.params = Object.entries(item.query)
        .filter(([k]) => k !== 'page' && k !== 'decimalLongitude' && k !== 'decimalLatitude')
        return item
      })
    })
  }

  presentLoading() {
    const loading: any = document.createElement('ion-loading');

    loading.cssClass = 'my-custom-class';
    loading.message = 'Wait...';
    loading.duration = 10000;

    document.body.appendChild(loading);
    loading.present();
    return loading
  }

  async download(query, reason) {
    const t = false
    if (t) return false
    const l = this.presentLoading()
    try {
      await MappingService.export(toQueryString(query), reason || 'other')
      this.load()
    } catch(_) {}
    l.dismiss()
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-title slot="center"><h2>{this.i18n.download.download_history}</h2></ion-title>
        </ion-header>
        <ion-list >
          {this.items.map(item => (<ion-item class="item item-text-wrap">
            <ion-icon name="time-outline"></ion-icon>
            <ion-label>
              <span class="text-left">{ timeAgo(item.created_at) }</span>
              <span class="text-right">{this.i18n.download.format}: <b>csv</b></span>
              <div>
                {item.params.map(([_, val]) => <ion-chip><b>{val}</b></ion-chip>)}
              </div>
              <div>
                {item.reason && <i>{item.reason.join(', ')}</i>}
                {!item.reason && <i>{ 'Other' }</i>}

              </div>
            </ion-label>
            <ion-button onClick={() => this.download(item.query, item.reason)}>{this.i18n.download.re_run}</ion-button>
          </ion-item>))}
        </ion-list>
      </Host>
    );
  }

}
