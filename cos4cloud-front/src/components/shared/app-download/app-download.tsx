import { Component, Host, h, Event, EventEmitter } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation';

@Component({
  tag: 'app-download',
  styleUrl: 'app-download.css',
  shadow: true,
})
export class AppDownload {

  @Event() download: EventEmitter<any>;

  reason: string = ''
  i18n: any = {};

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
  }

  async openModalLogin() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'page-login';

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
  }

  async openDownload() {
    const user = localStorage.user ? JSON.parse(localStorage.user) : null

    if (!user) return this.openModalLogin()
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-download';

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    const {data} = await modalElement.onWillDismiss();
    if (data.reason) {
      this.download.emit(data.reason)
    }
  }

  // this.download.emit()
  render() {
    return (
      <Host>
        <div class="wrapper">
          <ion-button fill="none" onClick={() => this.openDownload()}><ion-icon name="download"></ion-icon>{this.i18n.download.download_title}</ion-button>
        </div>
      </Host>
    );
  }

}
