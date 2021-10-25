import { Component, Host, Prop, State, h } from '@stencil/core';
import { MatchResults } from '@stencil/router';
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
  info() {
    const url = resources.host + '/users/' + this.match.params.name
    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.user = res
    })
  }
  agg() {
    fetch(resources.host + '/comments/agg', {
      headers: {
        sub: this.match.params.name
      }
    })
    .then(res => res.json())
    .then(res => {
      this.commentsAgg = res
      setTimeout(() => {
        this.setChartCounter({
          el: this.charts.commentsCountEl,
          count: (res.comments_count || 0) + (res.identifications_count || 0),
          title: `Comments &<br> Identifications`
        })
        this.setPeriodComments(this.periodComments)
        this.setPie({
          el: this.charts.origins,
          agg: res.origins
        })
      }, 250)
    })

    fetch(resources.host + '/downloads/agg', {
      headers: {
        sub: this.match.params.name
      }
    })
    .then(res => res.json())
    .then(res => {
      this.downloadsAgg = res
      setTimeout(() => {
        this.setChartCounter({
          el: this.charts.downloadsCountEl,
          count: res.downloads_count || 0,
          title: this.i18n.stats.downloads
        })
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

        <div class="ct-chart-counters">
          <span ref={(el) => this.charts.commentsCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>
          <span ref={(el) => this.charts.downloadsCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>
        </div>

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
          <span ref={(el) => this.charts.comments12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar"></span>

          <div class="cnt-header-chart">
            <ion-title class="title-chart"><b>{this.i18n.stats.comm_id_by_portal}</b></ion-title>
          </div>
          <span ref={(el) => this.charts.origins = (el as HTMLElement)} class="ct-chart ct-style-one"></span>

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
          <span ref={(el) => this.charts.downloads12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar"></span>
          

          <div class="cnt-header-chart">
            <ion-title class="title-chart"><b>{this.i18n.stats.downloads_reasons}</b></ion-title>
          </div>
          <span ref={(el) => this.charts.reasons = (el as HTMLElement)} class="ct-chart ct-style-one last-chart"></span>

        </div>}
      </Host>
    );
  }

}
