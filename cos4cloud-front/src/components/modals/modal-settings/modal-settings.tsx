import { Component, Host, h, Prop } from '@stencil/core';
import resources from '../../../resources'

@Component({
  tag: 'modal-settings',
  styleUrl: 'modal-settings.css',
  shadow: true,
})
export class ModalSettings {
  @Prop() data: any = {};
  @Prop() header: any;

  componentWillLoad() {
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
    .then(_ => this.close())
  }

  close() {
    const pop: any = document.querySelector('ion-modal')
    pop.dismiss()
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar>
            <h1>{this.header || 'Setting'}</h1>
            <ion-fab-button onClick={this.close} class="close-btn" size="small">
              <ion-icon name="close"></ion-icon>
            </ion-fab-button>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            <ion-item>
              <ion-label position="stacked">Nickname</ion-label>
              <ion-input value={this.data.name} onIonChange={(ev) => this.data.name = ev.detail.value} type="name"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Name</ion-label>
              <ion-input value={this.data.displayName} onIonChange={(ev) => this.data.displayName = ev.detail.value} type="name"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Email (for notifications)</ion-label>
              <ion-input value={this.data.email} onIonChange={(ev) => this.data.email = ev.detail.value} type="email"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Profession</ion-label>
              <ion-input value={this.data.profession} onIonChange={(ev) => this.data.profession = ev.detail.value} type="text"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">City</ion-label>
              <ion-input value={this.data.city} onIonChange={(ev) => this.data.city = ev.detail.value} type="text"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Description</ion-label>
              <ion-textarea value={this.data.description} onIonChange={(ev) => this.data.description = ev.detail.value} type="text"></ion-textarea>
            </ion-item>

          </ion-list>
        </ion-content>
        <ion-button onClick={() => this.update()}>Update</ion-button>
      </Host>
    );
  }

}
