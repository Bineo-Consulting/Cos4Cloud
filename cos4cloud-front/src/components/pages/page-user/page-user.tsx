import { Component, Host, Prop, State, h } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { fetchTranslations } from '../../../utils/translation'
import resources from '../../../resources'

@Component({
  tag: 'page-user',
  styleUrl: 'page-user.css',
  shadow: true,
})
export class PageUser {

  @Prop() match: MatchResults;
  i18n: any = {};
  @Prop() user: any;
  @Prop() owner: any;

  @State() commentsAgg: any
  @State() downloadsAgg: any
  @State() charts: any = {}
  @State() periodComments: string = 'p1Y'
  @State() periodDownloads: string = 'p1Y'

  chartRef: HTMLElement;

  async componentDidLoad() {
    this.i18n = await fetchTranslations(this.i18n)
    const user = JSON.parse(localStorage.user || 'false')
    this.owner = user ? user.sub === this.match.params.name : null
    this.info()

    this.agg()
  }
  info() {
    const url = resources.host + '/users/' + this.match.params.name
    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.user = res
    })
  }
  agg() {
    fetch(resources.host + '/comments/agg')
    .then(res => res.json())
    .then(res => {
      this.commentsAgg = res
      setTimeout(() => {
        this.setPeriodComments(this.periodComments)
        this.setPie({
          el: this.charts.origins,
          agg: res.origins
        })
      }, 250)
    })

    fetch(resources.host + '/downloads/agg')
    .then(res => res.json())
    .then(res => {
      setTimeout(() => {
        this.downloadsAgg = res
        this.setPeriodDownloads(this.periodDownloads)
        this.setPie({
          el: this.charts.reasons,
          agg: res.reasons
        })
      }, 250)
    })
  }

  setPeriodComments(p) {
    this.periodComments = p

    const periods = {
      p1Y: {
        el: this.charts.comments12M,
        agg: [
          Object.values(this.commentsAgg.last12M.comments),
          Object.values(this.commentsAgg.last12M.identifications)
        ],
        labels: Object.keys(this.commentsAgg.last12M.comments)
      },
      p1M: {
        el: this.charts.comments12M,
        agg: [
          Object.values(this.commentsAgg.last30d.comments),
          Object.values(this.commentsAgg.last30d.identifications)
        ],
        labels: Object.keys(this.commentsAgg.last30d.comments).map((key, i) => {
          return i % 2 ? key : ''
        })
      }
    }
    this.setBar(periods[this.periodComments] || periods.p1Y)
  }

  setPeriodDownloads(p) {
    this.periodDownloads = p

    const periods = {
      p1Y: {
        el: this.charts.downloads12M,
        agg: [Object.values(this.downloadsAgg.last12M)],
        labels: Object.keys(this.downloadsAgg.last12M)
      },
      p1M: {
        el: this.charts.downloads12M,
        agg: [Object.values(this.downloadsAgg.last30d)],
        labels: Object.keys(this.downloadsAgg.last30d).map((key, i) => {
          return i % 2 ? key : ''
        })
      }
    }

    console.log({periods})
    this.setBar(periods[this.periodDownloads] || periods.p1Y)
  }

  async share() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-share';
    modalElement.cssClass = 'modal-share'
    modalElement.componentProps = {
      item: this.user
    }

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
  }

  async setPie({el, agg}) {
    const Chartist = await import('chartist')
    const ChartistPluginLegend = (await import('chartist-plugin-legend')).default
    //const chartistPluginTooltip = (await import ('chartist-plugin-tooltip')).default

    new Chartist.Pie(el, {
      labels: agg.map(_ => ' '),
      series: agg.map(i => i.count)
    }, {
      donut: true,
      donutWidth: 60,
      donutSolid: true,
      startAngle: 270,
      showLabel: true,
      plugins: [
        ChartistPluginLegend({
          legendNames: agg.map(i => (i._id || 'Other'))
        })
      ]
    });
  }

  async setBar({el, agg, labels}) {
    const Chartist = await import('chartist')
    const ChartistPluginLegend = (await import('chartist-plugin-legend')).default
    // await import('chartist-plugin-legend')

    new Chartist.Bar(el, {
      labels,
      series: agg
    }, {
      // high: 14,
      seriesBarDistance: 10,
      // distributeSeries: true,
      axisY: {
        onlyInteger: true,
        offset: 20
      },
      plugins: [
        ChartistPluginLegend({
          legendNames: ['Comments', 'Identifications']
        })
      ]
    }, [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0];
          }
        }
      }]
    ]).on('draw', (data) => {
      if (data.type === 'bar') {
        data.element.attr({
          style: 'stroke-width: 10px'
        });
      }
    });
  }

  render() {
    return (
      <Host>
        <div class="cnt-header-user">
          {this.user && <header>
            <div class="wrapper">
              <div class="user-photo">
                <img src="/assets/svg/user.svg" alt="user photo"/>
              </div>
              <ion-icon tabindex="-1" onClick={() => this.share()} class="share" name="share-social"></ion-icon>
            </div>
          </header>}
        </div>
        {this.user && <div class="cnt-header-title">
          <ion-title class="nickname"><b>{this.user.displayName}</b></ion-title>
        </div>}
        {this.user && this.user.description && <div class="cnt-header-description">
          <p class="description">{this.user.description}</p>
        </div>}
        <div class="user-statistics">

          {this.user && <ion-list>
            <ion-item>
              <ion-title position="stacked"><small>{this.i18n.profile.nickname}</small></ion-title>
              <ion-label type="name"><b>{this.user.name}</b></ion-label>
            </ion-item>

            <ion-item>
              <ion-title position="stacked"><small>{this.i18n.profile.name}</small></ion-title>
              <ion-label type="name"><b>{this.user.displayName}</b></ion-label>
            </ion-item>

            {this.owner && <ion-item>
              <ion-title position="stacked"><small>Email</small></ion-title>
              <ion-label type="email"><b>{this.user.email}</b></ion-label>
            </ion-item>}

            <ion-item>
              <ion-title position="stacked"><small>{this.i18n.profile.profession}</small></ion-title>
              <ion-label type="text"><b>{this.user.profession}</b></ion-label>
            </ion-item>

            {this.user.city && <ion-item>
              <ion-title position="stacked"><small>{this.i18n.profile.city}</small></ion-title>
              <ion-label type="text"><b>{this.user.city}</b></ion-label>
            </ion-item>}
          </ion-list>}

        </div>
        {this.user && this.commentsAgg && <div class="user-statistics">
          <ion-list>
            <ion-item>
              <ion-title><small>{this.i18n.profile.comments}:</small></ion-title>
              <progress id="comm" value={this.commentsAgg.comments_count} max="100"> {this.commentsAgg.comments_count} </progress>
            </ion-item>
            <ion-item>
              <ion-title><small>{this.i18n.profile.identifications}:</small></ion-title>
              <progress id="ident" value={this.commentsAgg.identifications_count} max="100"> {this.commentsAgg.identifications_count} </progress>
            </ion-item>
          </ion-list>
        </div>}

        {this.user && <div class="charts">

          <div class="cnt-header-chart">
            <ion-title class="title-chart"><b>{this.i18n.stats.comments_identi}</b></ion-title>
          </div>
          <div class="cnt-header-chart">
            <ul class="period">
              <li onClick={() => this.setPeriodComments('p1M')} class={'p1M' === this.periodComments ? 'active' : ''}>1M</li>
              <li onClick={() => this.setPeriodComments('p1Y')} class={'p1Y' === this.periodComments ? 'active' : ''}>1Y</li>
              <li onClick={() => this.setPeriodComments('pAll')} class={'pAll' === this.periodComments ? 'active' : ''}>ALL</li>
            </ul>
          </div>
          <span ref={(el) => this.charts.comments12M = (el as HTMLElement)} class="ct-chart chart-bar"></span>

          <div class="cnt-header-chart">
            <ion-title class="title-chart"><b>{this.i18n.stats.comm_id_by_portal}</b></ion-title>
          </div>
          <span ref={(el) => this.charts.origins = (el as HTMLElement)} class="ct-chart"></span>

          <div class="cnt-header-chart">
            <ion-title class="title-chart"><b>{this.i18n.stats.downloads}</b></ion-title>
          </div>

          <div class="cnt-header-chart">
            <ul class="period">
              <li onClick={() => this.setPeriodDownloads('p1M')} class={'p1M' === this.periodDownloads ? 'active' : ''}>1M</li>
              <li onClick={() => this.setPeriodDownloads('p1Y')} class={'p1Y' === this.periodDownloads ? 'active' : ''}>1Y</li>
              <li onClick={() => this.setPeriodDownloads('pAll')} class={'pAll' === this.periodDownloads ? 'active' : ''}>ALL</li>
            </ul>
          </div>
          <span ref={(el) => this.charts.downloads12M = (el as HTMLElement)} class="ct-chart chart-bar"></span>
          

          <div class="cnt-header-chart">
            <ion-title class="title-chart"><b>{this.i18n.stats.downloads_reasons}</b></ion-title>
          </div>
          <span ref={(el) => this.charts.reasons = (el as HTMLElement)} class="ct-chart last-chart"></span>

        </div>}
      </Host>
    );
  }

}
