import { Component, Host, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'app-download',
  styleUrl: 'app-download.css',
  shadow: true,
})
export class AppDownload {

  @Event() download: EventEmitter<any>;

  render() {
    return (
      <Host>
        <div class="wrapper">
          <ion-button fill="none" onClick={() => this.download.emit()}><ion-icon name="download"></ion-icon>CSV</ion-button>
        </div>
      </Host>
    );
  }

}
