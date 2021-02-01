import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: false,
})
export class AppRoot {

  @State() user: any = null;

  openLanguages(ev) {
    const popover: any = Object.assign(document.createElement('ion-popover'), {
      component: 'popup-list',
      componentProps: {
        items: [{
          text: 'English',
          value: 'en'
        }, {
          text: 'Spanish',
          value: 'es'
        }, {
          text: 'French'
        }, {
          text: 'German'
        }]
      },
      event: ev
    });
    popover.id = 'popover-languages'
    document.body.appendChild(popover);
    popover.present();
    popover.onDidDismiss().then((res) => {
      console.log('dismiss', res.data)
      if (res.data && res.data.value) {
        localStorage.lang = res.data.value
        location.reload()
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
      alert(location.href)
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
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
