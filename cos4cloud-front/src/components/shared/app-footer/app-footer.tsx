import { Component, Host, h } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation'

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

  async componentWillLoad() {
    this.i18n = await fetchTranslations()
  }

  render() {
    return (
      <Host>
        <footer>
          <div class="cnt-footer">
            <div class="nav-footer">
              <div class="tabs">
                <a href="/about.html" innerHTML={this.i18n.footer.about}></a>
                <a href="/apidoc/index.html">API</a>
                <a href="/help.html" innerHTML={this.i18n.footer.help}></a>
                <a href="/privacy.html" innerHTML={this.i18n.footer.privacy}></a>
                <a href="/terms.html" innerHTML={this.i18n.footer.terms}></a>
                <a href="/contact.html" innerHTML={this.i18n.footer.contact}></a>
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
