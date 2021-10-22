import { Component, State, h, Prop } from '@stencil/core';
import { fetchTranslations } from '../../utils/translation';
import resources from '../../resources'
import { toQueryString } from '../../utils/to-query-string';
import { RouterHistory, injectHistory } from '@stencil/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {

  @State() user: any = null;
  @State() pid: any = null;
  @Prop() history: RouterHistory;

  i18n: any = {
    filters: {
      search_species: 'Search species',
      search_places: 'Search places'
    }
  }

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n, resources.cache_i18n)
    this.setUser()
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

  async settings(title?) {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-settings';
    modalElement.componentProps = {
      header: title
    }

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
  }

  openMenu(ev) {
    const user = JSON.parse(localStorage.user || 'false')
    const popover: any = Object.assign(document.createElement('ion-popover'), {
      component: 'popup-list',
      componentProps: {
        items: user ? [{
          text: 'Logout',
          value: 'logout'
        }, {
          text: 'Settings',
          value: 'settings'
        }, {
          text: 'Download history',
          value: 'download_history'
        }] : [{
          text: 'Login',
          value: 'login'
        }]
      },
      event: ev
    });
    popover.id = 'popover-languages'
    document.body.appendChild(popover);
    popover.present();
    popover.onDidDismiss().then((res) => {
      if (res.data && res.data.value === 'logout') {
        this.logout()
      } else if (res.data && res.data.value === 'settings') {
        this.settings()
      } else if (res.data && res.data.value === 'login') {
        this.openModalLogin()
      } else if (res.data && res.data.value === 'download_history') {
        history.pushState('', 'Download history', '/download_history');
        this.history.push(`/download_history`, {});
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

  async updateUser(res) {
    const { access_token, sub } = JSON.parse(localStorage.user)

    const url = resources.host + '/users/' + sub
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        ...res,
        access_token
      })
    })

  }

  checkUser() {
    if (this.user && this.user.access_token) {
      const user = JSON.parse(localStorage.user || '{}')
      const url = resources.host + '/users/' + (user.sub || this.user.sub || this.user.access_token)
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({access_token: this.user.access_token})
      })
      .then(res => res.text())
      .then(aux => {
        const res: any = JSON.parse(aux || '{}')
        if (!res.active) {
          this.user = null
          localStorage.removeItem('user')
        } else {
          localStorage.setItem('user', JSON.stringify({...user, ...res, access_token: this.user.access_token}))
          this.user = {...user, ...res, access_token: this.user.access_token}
          this.updateUser(res)
          if (this.user && !this.user.email) {
            this.settings('Complete your profile')
          }
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
        ...params
      }
      localStorage.setItem('user', JSON.stringify(this.user))
    }
    if (location.hash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    if (!this.pid) {
      this.pid = setInterval(() => this.checkUser(), 5 * 60 * 1000)
    }
    setTimeout(() => this.checkUser(), 300)
  }

  openProfile() {
    // location.href = (`/users/${this.user.sub || this.user.name || this.user.login}`)
    this.history.push(`/users/${this.user.sub || this.user.name || this.user.login}`, {})
  }

  render() {
    return (
      <div>
        <nav role="navigation">
          <div class="logo">
            <stencil-route-link url="/">
              <img src="/assets/svg/logo-c4c.svg" alt="Bineo logo"/>
            </stencil-route-link>
          </div>

          <ul class="desktop-menu">
            <li class="language pcssc-dropdown" onClick={(ev) => this.openLanguages(ev)}>
              <ion-icon name="globe-outline"></ion-icon>
              {/*<img class="icon-arrow" src="/assets/svg/arrow.svg" alt="arrow"/>*/}
            </li>
            <li class="user">
              <a>
                {this.user ? (<figure
                                  class="avatar avatar-lg"
                                  data-initial={this.user.name ? (this.user.name[0] + this.user.name[1]) : '..'}
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
            <li class="menu pcssc-dropdown" onClick={(ev) => this.openMenu(ev)}>
              <ion-icon name="ellipsis-horizontal"></ion-icon>
            </li>
          </ul>
        </nav>

        <main class="shadow-scroll">
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="page-home" exact={true} />
              <stencil-route url="/observations" component="page-observations" exact={true} />
              <stencil-route url="/observations/:id" component="page-observation" exact={true} />
              <stencil-route url="/users/:name" component="page-user" />
              <stencil-route url="/download_history" component="download-history"/>
            </stencil-route-switch>
          </stencil-router>
        </main>
      </div>
    );
  }
}

injectHistory(AppRoot);