import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'modal-contact',
  styleUrl: 'modal-contact.css',
  shadow: true,
})
export class ModalContact {

  async close() {
    const modal: any = document.querySelector('ion-modal')
    await modal.dismiss()
  }

  render() {
    return (
      <Host>
        <ion-fab-button onClick={this.close} class="close-btn" size="small">
          <ion-icon name="close"></ion-icon>
        </ion-fab-button>

        <header class="modal__header">
          <h2 class="modal__title" id="modal-login-title">
            Contact
          </h2>
        </header>
        <ion-content>
          <h3 id="bineo-consulting" class="center">Bineo Consulting S.L.</h3>
          <ul class="center">
            <li>
              <p><a href="mailto:info@bineo-consulting.com">info@bineo-consulting.com</a></p>
            </li>
            <li>
              <p><a href="tel:+34 687724809">+34 687724809</a></p>
            </li>
            <li>
              <p>Madrid - España</p>
            </li>
          </ul>
        </ion-content>
      </Host>
    );
  }

}
