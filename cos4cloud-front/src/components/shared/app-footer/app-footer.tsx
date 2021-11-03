import { Component, Host, h } from '@stencil/core';
import { fetchTranslations, getLocale } from '../../../utils/translation'

@Component({
  tag: 'app-footer',
  styleUrl: 'app-footer.css',
  shadow: true,
})
export class AppFooter {

  i18n: any = {
    footer: {
      about: 'About',
      help: 'Help',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      follow_us: 'Follow Us'
    }
  }
  langs = ['es', 'en']
  lang: string

  async componentWillLoad() {
    this.i18n = await fetchTranslations()
    this.lang = this.langs.includes(getLocale()) ? getLocale() : 'en'
  }

  async openContact() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-contact';
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
  }

  render() {
    return (
      <Host>
        <footer>
          <div class="cnt-footer">
            <div class="nav-footer">
              <div class="tabs">
                <a href={`/${this.lang}/about.html`} target="_blank" innerHTML={this.i18n.footer.about}></a>
                {/*<a href={`/${this.lang}/privacy.html`} innerHTML={this.i18n.footer.privacy}></a>*/}
                <a href={`/${this.lang}/terms.html`} target="_blank" innerHTML={this.i18n.footer.term}></a>
                <a onClick={() => this.openContact()} target="_blank" innerHTML={this.i18n.footer.contact}></a>
                <a href={`/${this.lang}/help.html`} target="_blank" innerHTML={this.i18n.footer.help}></a>
                <a href="/apidoc/index.html" target="_blank">API</a>
              </div>
            </div>

            <div class="rrss">
              <p innerHTML={this.i18n.footer.follow_us}></p>
              <div class="icons-rrss">
                <a href="https://www.linkedin.com/company/cos4cloud-project/" target="_blank"><img loading="lazy" src="./assets/svg/in-logo.svg" alt="Linkedin logo"/></a>
                <a href="https://twitter.com/Cos4Cloud" target="_blank"><img loading="lazy" src="./assets/svg/tw-logo.svg" alt="Twitter logo"/></a>
                <a href="https://www.instagram.com/cos4cloud/" target="_blank"><img loading="lazy" src="./assets/svg/ig-logo.svg" alt="Instagram logo"/></a>
                <a href="https://www.youtube.com/channel/UC38cKrW3viJrb0GM1JrWAQw" target="_blank"><img loading="lazy" src="./assets/svg/yt-logo.svg" alt="Youtube logo"/></a>
              </div>
            </div>
          </div>
        </footer>
      </Host>
    );
  }

}
