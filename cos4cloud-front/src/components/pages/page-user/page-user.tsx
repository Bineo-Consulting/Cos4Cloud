import { Component, Host, Prop, h } from '@stencil/core';
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

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
  }

  logout() {
    const user = JSON.parse(localStorage.user)
    //https://cos4cloud-2d9d3.web.app/#
    // access_token=dea15728bce3b9bc6e4749bde88ea63ca72968b3&
    // expires_in=1800&
    // token_type=bearer&
    // scope=&
    // state=xyz
    console.log({user})
    localStorage.removeItem('user')
    // location.href = '/'
    const url = 'https://www.authenix.eu/oauth/logout' + toQueryString({
      client_id: 'c1d079f6-e0be-4c25-df4a-a881bb41afa1',
      code: '',
      token: user.access_token,
      token_type_hint: 'access_token',
      return: encodeURIComponent(location.origin)
    })
    // const url = 'https://www.authenix.eu/openid/logout' + toQueryString({
    //   id_token_hint: user.access_token,
    //   state: 'xyz',
    //   post_logout_redirect_uri: encodeURIComponent(location.origin)
    // })
    // alert(url)
    location.href = url
    // window.open(url,'targetWindow', `toolbar=no,
    //   location=no,
    //   status=no,
    //   menubar=no,
    //   scrollbars=yes,
    //   resizable=yes,
    //   width=350,
    //   height=350`)
  }

  info() {
    const user = JSON.parse(localStorage.user)

    const url = resources.host + '/userInfo?access_token=' + user.access_token
    fetch(url)
    .then(res => res.json())
    .then(res => {
      console.log({res})
      // alert(JSON.stringify(res))
    })
  }
  refresh() {
    const user = JSON.parse(localStorage.user)

    const url = resources.host + '/userRefresh?access_token=' + user.access_token
    fetch(url)
    .then(res => res.json())
    .then(res => {
      console.log({res})
      // alert(JSON.stringify(res))
    })
  }

  render() {
    return (
      <Host>
        <div class="cnt-header-user">
          <header>
            <div>
              <div class="user-photo">
                <img src="/assets/svg/user.svg" alt="user photo"/>
              </div>
              <p class="nickname">{this.match.params.name}</p>
            </div>

            <div class="user-information">
              <div class="user-role">
                <p>User role</p>
              </div>
              <div class="user-description">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Nisi dolore dicta excepturi officiis molestias perspiciatis quod suscipit quaerat voluptas ipsa?
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Nisi dolore dicta excepturi officiis molestias perspiciatis quod suscipit quaerat voluptas ipsa?
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Nisi dolore dicta excepturi officiis molestias perspiciatis quod suscipit quaerat voluptas ipsa?</p>
              </div>
            </div>

            <div class="user-statistics">
              <p>{this.i18n.user.identifications}</p>
              <p>{this.i18n.user.species}</p>
              <div class="user-btn-settings btn btn-1">
                <ion-button onClick={() => this.logout()}>-{this.i18n.user.logout}-</ion-button>
                <ion-button onClick={() => this.info()}>{this.i18n.user.info}</ion-button>
                {/*<ion-button onClick={() => this.refresh()}>Refresh</ion-button>*/}
              </div>
            </div>
          </header>
        </div>
      </Host>
    );
  }

}
