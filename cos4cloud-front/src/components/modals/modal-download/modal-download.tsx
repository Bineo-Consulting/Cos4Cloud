import { Component, Host, h, State } from '@stencil/core';

@Component({
  tag: 'modal-download',
  styleUrl: 'modal-download.css',
  shadow: true,
})
export class ModalDownload {

  @State() dirty: boolean = false

  reasons = [
    'biosecurity management/planning',
    'citizen science',
    'collection management',
    'conservation management/planning',
    'ecological research',
    'education',
    'environmental assessment',
    'restoration/remediation',
    'scientific research',
    'systematic research/taxonomy',
    'species modelling',
    'testing',
    'other'
  ]

  reason: any = {}

  onChange(e) {
    console.log(e.detail)
    if (e.detail.checked) {
      this.reason[e.detail.value] = true
    } else {
      delete this.reason[e.detail.value]
    }
    this.dirty = !!Object.keys(this.reason).length
  }

  async close() {
    const modal: any = document.querySelector('ion-modal')
    await modal.dismiss()
  }

  async download() {
    const modal: any = document.querySelector('ion-modal')
    await modal.dismiss({ reason: Object.keys(this.reason) })
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar>
            <h1>{'Download'}</h1>
            <ion-fab-button onClick={this.close} class="close-btn" size="small">
              <ion-icon name="close"></ion-icon>
            </ion-fab-button>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            {this.reasons.map(item => <ion-item>
              <ion-checkbox onIonChange={(e) => this.onChange(e)} value={item}></ion-checkbox>
              <ion-label>{item}</ion-label>
            </ion-item>)}
          </ion-list>
        </ion-content>

        <ion-footer>
          <ion-item>
            <ion-button disabled={!this.dirty} onClick={() => this.download()}>Download</ion-button>
          </ion-item>
        </ion-footer>
      </Host>
    );
  }

}
