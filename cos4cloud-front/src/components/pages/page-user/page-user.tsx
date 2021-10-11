import { Component, Host, Prop, h } from '@stencil/core';
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

  chartRef: HTMLElement;

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
    const user = JSON.parse(localStorage.user || 'false')
    this.owner = user ? user.sub === this.match.params.name : null
    // if (this.user) {
    //   this.info()
    // } else {
    this.info()
    // }

    this.setCharts()
  }
  info() {
    const url = resources.host + '/users/' + this.match.params.name
    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.user = res
    })
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

  async setCharts(el?) {
    if (el) {
      const Chartist = await import('chartist')
      // const Chartist = window['Chartist']
      new Chartist.Pie(el, {
        series: [20, 10, 30, 40]
      }, {
        // donut: true,
        // donutWidth: 60,
        // donutSolid: true,
        // startAngle: 270,
        // showLabel: true
        donut: true,
        donutWidth: 60,
        donutSolid: true,
        startAngle: 270,
        showLabel: true,
        // labelOffset: 30,
        // labelDirection: 'explode',
        // distributeSeries: true,
      });
    }
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
              <ion-title position="stacked"><small>Nickname</small></ion-title>
              <ion-label type="name"><b>{this.user.name}</b></ion-label>
            </ion-item>

            <ion-item>
              <ion-title position="stacked"><small>Name</small></ion-title>
              <ion-label type="name"><b>{this.user.displayName}</b></ion-label>
            </ion-item>

            {this.owner && <ion-item>
              <ion-title position="stacked"><small>Email</small></ion-title>
              <ion-label type="email"><b>{this.user.email}</b></ion-label>
            </ion-item>}

            <ion-item>
              <ion-title position="stacked"><small>Profession</small></ion-title>
              <ion-label type="text"><b>{this.user.profession}</b></ion-label>
            </ion-item>

            {this.user.city && <ion-item>
              <ion-title position="stacked"><small>City</small></ion-title>
              <ion-label type="text"><b>{this.user.city}</b></ion-label>
            </ion-item>}
          </ion-list>}

        </div>
        <div class="user-statistics">
          <ion-list>
            <ion-item>
              <ion-title><small>Comments:</small></ion-title>
              <progress id="comm" value="72" max="100"> 72 </progress>
            </ion-item>
            <ion-item>
              <ion-title><small>Identifications:</small></ion-title>
              <progress id="ident" value="32" max="100"> 32 </progress>
            </ion-item>
          </ion-list>
        </div>

        <div class="charts">

          {this.user && <div class="cnt-header-title">
            <ion-title class="nickname"><b>Stats</b></ion-title>
          </div>}

          <span ref={(el) => this.setCharts(el as HTMLElement)}class="ct-chart"></span>
          <span ref={(el) => this.setCharts(el as HTMLElement)}class="ct-chart"></span>
          <span ref={(el) => this.setCharts(el as HTMLElement)}class="ct-chart"></span>
          
        </div>
      </Host>
    );
  }

}
