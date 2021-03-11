import { Component, State, h } from '@stencil/core';
import { fetchTranslations } from '../../utils/translation';
import resources from '../../resources'

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {

  @State() user: any = null;
  i18n: any = {
    filters: {
      search_species: 'Search species',
      search_places: 'Search places'
    }
  }

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n, resources.cache_i18n)
  }

  openLanguages(ev) {
    const popover: any = Object.assign(document.createElement('ion-popover'), {
      component: 'popup-list',
      componentProps: {
        items: [{
          text: 'English',
          value: 'en',
          selected: localStorage.lang === 'en'
        }, {
          text: 'Español',
          value: 'es',
          selected: localStorage.lang === 'es'
        }, {
          text: 'Français',
          value: 'fr',
          selected: localStorage.lang === 'fr'
        }, {
          text: 'Deutsche',
          value: 'de',
          selected: localStorage.lang === 'de'
        }]
      },
      event: ev
    });
    popover.id = 'popover-languages'
    document.body.appendChild(popover);
    popover.present();
    popover.onDidDismiss().then((res) => {
      if (res.data && res.data.value && localStorage.lang !== res.data.value) {
        localStorage.lang = res.data.value
        location.reload(false)
      }
    })
    return null
  }

  openNotifications() {
    // create the modal with the `modal-page` component
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-page';
    modalElement.cssClass = 'my-custom-class';

    // present the modal
    document.body.appendChild(modalElement);
    return modalElement.present();
  }

  async openModalLogin() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'page-login';

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
    this.setUser()
  }

  checkUser() {
    if (this.user && this.user.access_token) {
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
  }

  setUser() {
    this.user = localStorage.user ? JSON.parse(localStorage.user) : null
    if (!this.user && !(this.user || {}).access_token && location.hash) {
      const params = {}
      ;(location.hash || '#').slice(1).split('&').map(i => {
        params[i.split('=')[0]] = i.split('=')[1] || null
      })
      this.user = {
        ...params,
        login: 'openid'
      }
      localStorage.setItem('user', JSON.stringify(this.user))
    }
    if (location.hash) {
      // alert(location.href)
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    setTimeout(() => this.checkUser(), 1000)
  }

  openProfile() {
    location.href = (`/users/${this.user.login}`)
  }

  render() {
    this.setUser()
    return (
      <div>
        <nav role="navigation">
          <div class="logo">
            <a href="/">
              <img src="/assets/svg/logo-c4c.svg" alt="Bineo logo"/>
            </a>
          </div>

          <ul class="desktop-menu">
            <li class="language pcssc-dropdown" onClick={(ev) => this.openLanguages(ev)}>
              <ion-icon name="globe-outline"></ion-icon>
              <img class="icon-arrow" src="/assets/svg/arrow.svg" alt="arrow"/>
            </li>
            <li class="user">
              <a>
                {this.user ? (<figure
                                  class="avatar avatar-lg"
                                  data-initial={this.user.login ? (this.user.login[0] + this.user.login[1]) : '??'}
                                  onClick={() => this.openProfile()}>
                                </figure>) : (<img class="icon-user"
                                                  onClick={() => this.openModalLogin()}
                                                  src="/assets/svg/user.svg"
                                                  alt="user"/>)}
                
              </a>
            </li>
            <div class="pcssc-dropdown">
              <a tabindex="0" class="dropdown-toggle focus-toggle pure-button">
                <img class="icon-notifications" src="/assets/svg/notifications.svg" alt="notifications"/>
              </a>
              <label htmlFor="menu-toggle" class="pure-button click-toggle" aria-label="Toggle">Dropdown Buton</label>
            </div>
          </ul>
        </nav>

        <main class="shadow-scroll">
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="page-home" exact={true} />
              <stencil-route url="/observations" component="page-observations" exact={true} />
              <stencil-route url="/observations/:id" component="page-observation" exact={true} />
              <stencil-route url="/users/:name" component="page-user" />
            </stencil-route-switch>
          </stencil-router>
        </main>
      </div>
    );
  }
}
