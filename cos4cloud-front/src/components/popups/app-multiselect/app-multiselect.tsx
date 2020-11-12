import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'app-multiselect',
  styleUrl: 'app-multiselect.css',
  shadow: true,
})
export class AppMultiselect {

  render() {
    return (
      <Host>
        <ion-list>
          <ion-item>
            <ion-label>Pepperoni</ion-label>
            <ion-checkbox slot="end" value="pepperoni" checked></ion-checkbox>
          </ion-item>

          <ion-item>
            <ion-label>Sausage</ion-label>
            <ion-checkbox slot="end" value="sausage" disabled></ion-checkbox>
          </ion-item>

          <ion-item>
            <ion-label>Mushrooms</ion-label>
            <ion-checkbox slot="end" value="mushrooms"></ion-checkbox>
          </ion-item>
        </ion-list>
      </Host>
    );
  }

}
