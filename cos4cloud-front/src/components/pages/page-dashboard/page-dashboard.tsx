import { Component, Host, Prop, State, h } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation'
import resources from '../../../resources'

@Component({
  tag: 'page-dashboard',
  styleUrl: 'page-dashboard.css',
  shadow: true,
})
export class PageDashboard {

  i18n: any = {};

  @State() commentsAgg: any
  @State() downloadsAgg: any
  @State() charts: any = {}
  @State() periodComments: string = 'p1Y'
  @State() periodDownloads: string = 'p1Y'

  chartRef: HTMLElement;

  async componentDidLoad() {
    this.i18n = await fetchTranslations(this.i18n)
    this.agg()
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
      this.downloadsAgg = res
      setTimeout(() => {
        this.setPeriodDownloads(this.periodDownloads)
        this.setPie({
          el: this.charts.reasons,
          agg: res.reasons
        })
      }, 350)
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

    this.setBar(periods[this.periodDownloads] || periods.p1Y)
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
        <div class="dashboard-container">
          <ion-title><h2>Dashboard</h2></ion-title>

          {this.commentsAgg && <div class="charts">

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
          </div>}

          {this.downloadsAgg && <div class="charts">
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
        </div>
      </Host>
    );
  }

}
