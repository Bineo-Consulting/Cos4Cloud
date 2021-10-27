import { Component, Host, h, Prop } from '@stencil/core';
import resources from '../../../resources'
import { fetchTranslations } from '../../../utils/translation';

@Component({
  tag: 'modal-settings',
  styleUrl: 'modal-settings.css',
  shadow: true,
})
export class ModalSettings {
  @Prop() data: any = {};
  @Prop() header: any;

  i18n: any = {}

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
    const user = JSON.parse(localStorage.user)
    const url = resources.host + '/users/' + user.sub

    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.data = res
    })
  }

  update() {
    const user = JSON.parse(localStorage.user)
    const url = resources.host + '/users/' + user.sub
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        access_token: user.access_token,
        ...this.data
      })
    })
    .then(res => res.json())
    .then(_ => this.close(true))
  }

  close(reload = false) {
    const pop: any = document.querySelector('ion-modal')
    pop.dismiss()
    if (reload) {
      location.reload()
    }
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar>
            <h1>{this.header || this.i18n.menu.settings}</h1>
            <ion-fab-button onClick={this.close} class="close-btn" size="small">
              <ion-icon name="close"></ion-icon>
            </ion-fab-button>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-item>
              <ion-label position="stacked">{this.i18n.profile.nickname}</ion-label>
              <ion-input value={this.data.name} onIonChange={(ev) => this.data.name = ev.detail.value} type="name"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">{this.i18n.profile.name}</ion-label>
              <ion-input value={this.data.displayName} onIonChange={(ev) => this.data.displayName = ev.detail.value} type="name"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">{this.i18n.profile.email}</ion-label>
              <ion-input value={this.data.email} onIonChange={(ev) => this.data.email = ev.detail.value} type="email"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">{this.i18n.profile.profession}</ion-label>
              <ion-input value={this.data.profession} onIonChange={(ev) => this.data.profession = ev.detail.value} type="text"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">{this.i18n.user.city}</ion-label>
              <ion-input value={this.data.city} onIonChange={(ev) => this.data.city = ev.detail.value} type="text"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">{this.i18n.user.description}</ion-label>
              <ion-textarea value={this.data.description} onIonChange={(ev) => this.data.description = ev.detail.value} type="text"></ion-textarea>
            </ion-item>

          </ion-list>
        </ion-content>
        <ion-button onClick={() => this.update()}>{this.i18n.user.update}</ion-button>
      </Host>
    );
  }

}
