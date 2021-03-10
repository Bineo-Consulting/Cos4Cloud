import { Component, Host, State, h } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation'

@Component({
  tag: 'page-login',
  styleUrl: 'page-login.css',
  shadow: true,
})
export class PageLogin {

  @State() login: string;
  @State() password: string;
  i18n: any = {}

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
  }

  close() {
    const pop: any = document.querySelector('ion-modal')
    pop.dismiss()
  }

  signin() {
    console.log(this.login, this.password)
    localStorage.setItem('user', JSON.stringify({
      login: this.login
    }))
    this.close()
  }

  authenix() {
    const clientId = 'e51ef41e-79ae-6944-ed71-1d2c15220a9f'
    const redirect = encodeURIComponent(location.origin).replace(/\/$/, '')
    const url = `https://www.authenix.eu/oauth/authorize?response_type=token id_token&client_id=${clientId}&redirect_uri=${redirect}&state=xyz&nonce=123&prompt=select_account`
    location.href = url
  }

  render() {
    return (
      <Host>
        <ion-fab-button onClick={this.close} class="close-btn" size="small">
          <ion-icon name="close"></ion-icon>
        </ion-fab-button>

        <header class="modal__header">
          <h2 class="modal__title" id="modal-login-title">
            {this.i18n.login.login}
          </h2>
        </header>
        <main class="modal__content modal-login-content" id="modal-login-content">

          {/*<div class="login-rrss">
            <ion-button>Facebook</ion-button>
            <ion-button>Google</ion-button>
          </div>*/}

{/*          <ion-item>
            <ion-label position="stacked">{this.i18n.login.user}</ion-label>
            <ion-input
              onIonChange={(ev) => this.login = ev.detail.value}
              name="login" type="login"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">{this.i18n.login.password}</ion-label>
            <ion-input
              onIonChange={(ev) => this.password = ev.detail.value}
              name="password" type="password"></ion-input>
          </ion-item>*/}
          <p>Texto descriptivo de login y authenix ... {this.i18n.login.message}</p>
          <br/>

          {/*<ion-button onClick={() => this.signin()}>{this.i18n.login.login}</ion-button>*/}

          <ion-button onClick={() => this.authenix()}>
            Login
          </ion-button>

          {/*<p>or</p>
          <div class="login-organization">
            <input type="text" id="organization" name="organization" placeholder="Type your organization name ..."/>
          </div>
          <div class="cant-login">
            <p>Can't log in?</p><a href="#">Ask here</a>
          </div>*/}

        </main>
      </Host>
    );
  }

}
