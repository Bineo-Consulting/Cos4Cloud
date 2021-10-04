import { Component, Host, Prop, h, State } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { toQueryString } from '../../../utils/to-query-string';
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
  @State() user: any;

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
    this.user = JSON.parse(localStorage.user)
    if (this.user) this.info()
  }

  logout() {
    const user = JSON.parse(localStorage.user)
    localStorage.removeItem('user')
    const url = 'https://www.authenix.eu/oauth/logout' + toQueryString({
      client_id: 'a55d6976-a46c-3989-97a4-a958936b480a',
      code: '',
      token: user.access_token,
      token_type_hint: 'access_token',
      return: encodeURIComponent(location.origin)
    })
    location.href = url
  }

  info() {
    const user = JSON.parse(localStorage.user)
    const url = resources.host + '/userInfo?access_token=' + user.access_token
    fetch(url)
    .then(res => res.json())
    .then(res => {
      console.log('checkUser:', res.active)
      if (!res.active) {
        this.user = null
        localStorage.removeItem('user')
      }
    })
  }
  refresh() {
    const user = JSON.parse(localStorage.user)
    const url = resources.host + '/userRefresh?access_token=' + user.access_token
    fetch(url)
    .then(res => res.json())
    .then(res => {
      console.log({res})
    })
  }
  async login() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'page-login';

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
  }

  render() {
    return (
      <Host>
        <div class="cnt-header-user">
          <header>
            <div class="wrapper">
              <div class="user-photo">
                <img src="/assets/svg/user.svg" alt="user photo"/>
              </div>
              <p class="nickname">{this.match.params.name}</p>
            </div>
          </header>
        </div>
        <div class="user-statistics">
          <div class="user-btn-settings btn btn-1">
            {this.user && <ion-button onClick={() => this.logout()}>{this.i18n.user.logout}</ion-button>}
            {!this.user && <ion-button onClick={() => this.login()}>{this.i18n.login.login}</ion-button>}
          </div>
        </div>
      </Host>
    );
  }

}
