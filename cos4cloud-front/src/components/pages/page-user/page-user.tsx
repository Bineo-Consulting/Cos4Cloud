import { Component, Host, Prop, h } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { toQueryString } from '../../../utils/to-query-string';
import { fetchTranslations } from '../../../utils/translation'

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
    location.href = '/'
    const url = 'https://www.authenix.eu/oauth/logout' + toQueryString({
      code: '',
      token: user.access_token,
      token_type_hint: 'access_token',
      return: encodeURIComponent(location.origin)
    })
    location.href = url
  }

  info() {
    const user = JSON.parse(localStorage.user)

    const url = 'https://europe-west2-cos4cloud-2d9d3.cloudfunctions.net/userInfo?access_token=' + user.access_token
    fetch(url)
    .then(res => res.json())
    .then(res => {
      console.log({res})
      alert(res)
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
                <ion-button onClick={() => this.logout()}>{this.i18n.user.logout}</ion-button>
                <ion-button onClick={() => this.info()}>{this.i18n.user.info}</ion-button>
              </div>
            </div>
          </header>
        </div>
      </Host>
    );
  }

}
