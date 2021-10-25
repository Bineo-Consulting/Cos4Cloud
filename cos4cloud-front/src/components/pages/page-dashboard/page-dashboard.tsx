import { Component, Host, State, h } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation'
import resources from '../../../resources'

const counter = (val) => {
  if (val < 10) {
    return {agg: [val, 10 - val], total: 12}
  } else if (val < 100) {
    return {agg: [val, 100 - val], total: 120}
  } else if (val < 1000) {
    return {agg: [val, 1000 - val], total: 1200}
  } else if (val < 10000) {
    return {agg: [val, 10000 - val], total: 12000}
  }
}

@Component({
  tag: 'page-dashboard',
  styleUrl: 'page-dashboard.css',
  shadow: true,
})
export class PageDashboard {

  i18n: any = {};

  @State() commentsAgg: any
  @State() downloadsAgg: any
  @State() usersAgg: any
  @State() charts: any = {}
  @State() periodComments: string = 'p1Y'
  @State() periodDownloads: string = 'p1Y'
  @State() periodUsers: string = 'p1Y'

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
        this.setChartCounter({
          el: this.charts.commentsCountEl,
          count: (res.comments_count || 0) + (res.identifications_count || 0),
          title: `Comments &<br> Identifications`
        })
      }, 250)
    })

    fetch(resources.host + '/downloads/agg')
    .then(res => res.json())
    .then(res => {
      this.downloadsAgg = res
      setTimeout(() => {
        this.setChartCounter({
          el: this.charts.identificationsCountEl,
          count: res.downloads_count,
          title: 'Downloads'
        })
        this.setPeriodDownloads(this.periodDownloads)
        this.setPie({
          el: this.charts.reasons,
          agg: res.reasons
        })
      }, 250)
    })

    fetch(resources.host + '/users/agg')
    .then(res => res.json())
    .then(res => {
      this.usersAgg = res
      setTimeout(() => {
        this.setPeriodUsers(this.periodUsers)
        this.setPie({
          el: this.charts.professions,
          agg: res.professions
        })
        this.setChartCounter({el: this.charts.usersCountEl, count: res.users_count || 0, title: 'Users'})
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
        labels: Object.keys(this.commentsAgg.last12M.comments),
        legends: [this.i18n.profile.comments, this.i18n.profile.identifications]
      },
      p1M: {
        el: this.charts.comments12M,
        agg: [
          Object.values(this.commentsAgg.last30d.comments),
          Object.values(this.commentsAgg.last30d.identifications)
        ],
        labels: Object.keys(this.commentsAgg.last30d.comments).map((key, i) => {
          return i % 2 ? key : ''
        }),
        legends: [this.i18n.profile.comments, this.i18n.profile.identifications]
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

  setPeriodUsers(p) {
    this.periodUsers = p

    const periods = {
      p1Y: {
        el: this.charts.users12M,
        agg: [Object.values(this.usersAgg.last12M)],
        labels: Object.keys(this.usersAgg.last12M)
      },
      p1M: {
        el: this.charts.users12M,
        agg: [Object.values(this.usersAgg.last30d)],
        labels: Object.keys(this.usersAgg.last30d).map((key, i) => {
          return i % 2 ? key : ''
        })
      }
    }

    this.setBar(periods[this.periodUsers] || periods.p1Y)
  }

  async setPie({el, agg}) {
    const Chartist = await import('chartist')
    const ChartistPluginLegend = (await import('chartist-plugin-legend')).default
    const total = agg.map(i => i.count).reduce((a, b) => b + a, 0)
    new Chartist.Pie(el, {
      labels: agg.map(_ => _.count),
      series: agg.map(i => i.count)
    }, {
      donut: false,
      donutWidth: 60,
      donutSolid: true,
      startAngle: 270,
      showLabel: true,
      plugins: [
        ChartistPluginLegend({
          legendNames: agg.map(i => (i._id || 'Other'))
        })
      ],
      labelInterpolationFnc: function(value) {
        return Math.round(value / total * 100) + '%';
      }
    });
  }

  async setBar({el, agg, labels, legends}) {
    const Chartist = await import('chartist')
    const ChartistPluginLegend = (await import('chartist-plugin-legend')).default

    new Chartist.Bar(el, {
      labels,
      series: agg
    }, {
      seriesBarDistance: 10,
      axisY: {
        onlyInteger: true,
        offset: 20
      },
      plugins: legends ? [
        ChartistPluginLegend({
          legendNames: legends
        })
      ] : null
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

  async setChartCounter({ el, count, title }) {
    const Chartist = await import('chartist')
    const ChartistPluginFillDonut = (await import('chartist-plugin-fill-donut')).default

    const { agg, total } = counter(count)

    console.log('counter', {agg, total})
    const chart = new Chartist.Pie(el, {
        series: agg,
        labels: ['', '']
      }, {
        donut: true,
        donutWidth: 20,
        startAngle: 210,
        total: total,
        showLabel: false,
        plugins: [
          ChartistPluginFillDonut({
            items: [{
              content: '<ion-icon name="speedometer"></ion-icon>',
              position: 'bottom',
              offsetY : 10,
              offsetX: -8,
              fontSize: '20px'
            }, {
              position: 'center',
              offsetY : -10,
              content: `<h3><span class="small">${count} <br>${title}</span></h3>`
            }]
          })
        ]
      });

    chart.on('draw', function(data) {
      if (data.type === 'slice' && data.index == 0) {
        // Get the total path length in order to use for dash array animation
        const pathLength = data.element._node.getTotalLength();

        // Set a dasharray that matches the path length as prerequisite to animate dashoffset
        data.element.attr({
          'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });

        // Create animation definition while also assigning an ID to the animation for later sync usage
        const animationDefinition = {
          'stroke-dashoffset': {
            id: 'anim' + data.index,
            dur: 1200,
            from: -pathLength + 'px',
            to:  '0px',
            easing: Chartist.Svg.Easing.easeOutQuint,
            fill: 'freeze'
          }
        };

        // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
        data.element.attr({
          'stroke-dashoffset': -pathLength + 'px'
        });

        // We can't use guided mode as the animations need to rely on setting begin manually
        // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
        data.element.animate(animationDefinition, true);
      }
    });
  }

  render() {
    return (
      <Host>
        <div class="dashboard-container">
          <ion-title><h2>Dashboard</h2></ion-title>

          <span ref={(el) => this.charts.commentsCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>
          <span ref={(el) => this.charts.identificationsCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>
          <span ref={(el) => this.charts.usersCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>


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
            <span ref={(el) => this.charts.comments12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar mb-100"></span>

            <div class="cnt-header-chart">
              <ion-title class="title-chart"><b>{this.i18n.stats.comm_id_by_portal}</b></ion-title>
            </div>
            <span ref={(el) => this.charts.origins = (el as HTMLElement)} class="ct-chart ct-style-one"></span>
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
            <span ref={(el) => this.charts.downloads12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar mb-100"></span>
            

            <div class="cnt-header-chart">
              <ion-title class="title-chart"><b>{this.i18n.stats.downloads_reasons}</b></ion-title>
            </div>
            <span ref={(el) => this.charts.reasons = (el as HTMLElement)} class="ct-chart ct-style-one"></span>

          </div>}

          {this.usersAgg && <div class="charts">
            <div class="cnt-header-chart">
              <ion-title class="title-chart"><b>Users</b></ion-title>
            </div>

            <div class="cnt-header-chart">
              <ul class="period">
                <li onClick={() => this.setPeriodUsers('p1M')} class={'p1M' === this.periodUsers ? 'active' : ''}>1M</li>
                <li onClick={() => this.setPeriodUsers('p1Y')} class={'p1Y' === this.periodUsers ? 'active' : ''}>1Y</li>
                <li onClick={() => this.setPeriodUsers('pAll')} class={'pAll' === this.periodUsers ? 'active' : ''}>ALL</li>
              </ul>
            </div>
            <span ref={(el) => this.charts.users12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar mb-100"></span>
            

            <div class="cnt-header-chart">
              <ion-title class="title-chart"><b>Professions</b></ion-title>
            </div>
            <span ref={(el) => this.charts.professions = (el as HTMLElement)} class="ct-chart ct-style-one last-chart"></span>

          </div>}
        </div>
      </Host>
    );
  }

}
