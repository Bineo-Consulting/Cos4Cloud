import { Component, Host, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'app-download',
  styleUrl: 'app-download.css',
  shadow: true,
})
export class AppDownload {

  @Event() download: EventEmitter<any>;

  reason: string = ''

  async openDownload() {
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
          <ion-button fill="none" onClick={() => this.openDownload()}><ion-icon name="download"></ion-icon>Download</ion-button>
        </div>
      </Host>
    );
  }

}
