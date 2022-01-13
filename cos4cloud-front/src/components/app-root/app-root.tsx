import { Component, State, h, Prop } from '@stencil/core';
import { fetchTranslations } from '../../utils/translation';
import resources from '../../resources'
import { toQueryString } from '../../utils/to-query-string';
import { RouterHistory, LocationSegments, injectHistory } from '@stencil/router';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {

  @State() user: any = null;
  @State() pid: any = null;
  @Prop() history: RouterHistory;
  @Prop() location: LocationSegments;

  i18n: any = {
    filters: {
      search_species: 'Search species',
      search_places: 'Search places'
    }
  }

  main: HTMLElement
  nav: HTMLElement

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
          text: 'Català',
          value: 'ca',
          selected: localStorage.lang === 'ca'
        },{
          text: 'Français',
          value: 'fr',
          selected: localStorage.lang === 'fr'
        }, {
          text: 'Deutsche',
          value: 'de',
          selected: localStorage.lang === 'de'
        }, {
          text: 'Ελληνικά',
          value: 'el',
          selected: localStorage.lang === 'el'
        }, {
          text: 'Svenska',
          value: 'se',
          selected: localStorage.lang === 'se'
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

  async settings(title = null) {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-settings';
    modalElement.componentProps = {
      header: title,
      firstTime: !!title
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
          text: this.i18n.menu.logout,
          value: 'logout'
        }, {
          text: 'Feedback',
          value: 'feedback',
          href: 'https://ug8wvluhfv1.typeform.com/to/J6YaWmzG'
        }, {
          text: this.i18n.menu.settings,
          value: 'settings'
        }, {
          text: this.i18n.menu.history,
          value: 'download_history'
        }, {
          text: 'Dashboard',
          value: 'dashboard'
        }] : [{
          text: this.i18n.login.login,
          value: 'login'
        }, {
          text: 'Feedback',
          value: 'feedback',
          href: 'https://ug8wvluhfv1.typeform.com/to/J6YaWmzG'
        }, {
          text: 'Dashboard',
          value: 'dashboard'
        }]
      },
      event: ev
    });
    popover.id = 'popover-languages'
    document.body.appendChild(popover);
    popover.present();
    popover.onDidDismiss().then((res) => {
      console.log({data: res.data})
      if (res.data && res.data.value === 'logout') {
        this.logout()
      } else if (res.data && res.data.value === 'settings') {
        this.settings()
      } else if (res.data && res.data.value === 'login') {
        this.openModalLogin()
      } else if (res.data && res.data.value === 'download_history') {
        history.pushState('', 'Download history', '/download_history');
        this.history.push(`/download_history`, {});
      } else if (res.data && res.data.value === 'dashboard') {
        history.pushState('', 'Dasboard', '/dashboard');
        this.history.push(`/dashboard`, {});
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
    modalElement.id = 'modal-login'
    modalElement.componentProps = {
      id: 'modal-login'
    }

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
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        user: {
          ...res,
          access_token
        }
      })
    })

  }

  checkUser() {
    if (this.user && this.user.access_token) {
      const user = JSON.parse(localStorage.user || '{}')
      const url = resources.host + '/users/' + (user.sub || this.user.sub || this.user.access_token)
      fetch(url, {
        headers: {
          access_token: this.user.access_token
        }
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
          if (this.user && (!this.user.email || !this.user.accepted_terms)) {
            this.settings('Complete your profile')
          }
        }
      })
    }
  }

  setUser() {
    let redirect = ''
    this.user = localStorage.user ? JSON.parse(localStorage.user) : null

    if (!this.user && !(this.user || {}).access_token && location.hash) {
      const params: any = {}
      ;(location.hash || '#').slice(1).split('&').map(i => {
        params[i.split('=')[0]] = i.split('=')[1] || null
      })
      this.user = {
        ...params
      }
      if (params.state) {
        redirect = params.state
      }
      localStorage.setItem('user', JSON.stringify(this.user))
    }
    if (location.hash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    if (redirect) {
      setTimeout(() => {
        this.history.push(`${decodeURIComponent(redirect)}`, {})
      }, 150)
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

  pidScroll: any
  onScroll(_) {
    clearTimeout(this.pid)
    this.pidScroll = setTimeout(() => {
      if (this.main.scrollTop > 100) {
        this.nav.classList.add('scrolled')
      } else {
        this.nav.classList.remove('scrolled')
      }
    }, 50)
  }

  render() {
    return (
      <div class={"bg-video " + this.location.pathname} onScroll={e => this.onScroll(e)}>
        {/*<video playsinline autoplay muted loop poster="/assets/valley-day/Valley-day.png" id="bgvid">
          <source src="/assets/valley-day/Valley-day.mp4" type="video/mp4"/>
        </video>*/}

        <nav class={this.location.pathname} ref={e => this.nav = e} role="navigation">
          <div class="logo">
            <stencil-route-link url="/">
              <img src="/assets/icon/logo.svg" alt="Bineo logo"/>
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
                                                  src="/assets/svg/user.svg?v=1"
                                                  alt="user"/>)}
                
              </a>
            </li>
            <li class="menu pcssc-dropdown" onClick={(ev) => this.openMenu(ev)}>
              <ion-icon name="ellipsis-horizontal"></ion-icon>
            </li>
          </ul>
        </nav>

        <main ref={e => this.main = e} class="shadow-scroll" onScroll={e => this.onScroll(e)}>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="page-home" exact={true} />
              <stencil-route url="/observations" component="page-observations" exact={true} />
              <stencil-route url="/observations/:id" component="page-observation" exact={true} />
              <stencil-route url="/users/:name" component="page-user" />
              <stencil-route url="/download_history" component="download-history"/>
              <stencil-route url="/dashboard" component="page-dashboard"/>
            </stencil-route-switch>
          </stencil-router>
        </main>
      </div>
    );
  }
}

injectHistory(AppRoot);