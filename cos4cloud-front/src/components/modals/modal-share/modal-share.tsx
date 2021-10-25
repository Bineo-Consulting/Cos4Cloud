import { Component, Host, h, Prop, State } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation';

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

@Component({
  tag: 'modal-share',
  styleUrl: 'modal-share.css',
  shadow: true,
})
export class ModalShare {

  name = 'ModalShare'
  i18n: any = {}

  @Prop() item: any
  @Prop() url: string = location.pathname
  @State() copied = ''

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
  }  

  get titleShare() {
    const desc = this.item.description ? `: ${this.item.description}` : ''
    const elipsis = desc.length > 120 ? '...' : ''
    const owner = `@${this.item.name}`
    return encodeURIComponent(owner + desc.slice(0, 120) + elipsis)
  }
  get shareUrl() {
    return 'https://cos4bio.eu/users/' + this.item.sub
  }
  get shareTwitter() {
    return `https://twitter.com/share?url=${this.shareUrl}&text=${this.titleShare}&via=Cos4Bio`
  }
  get shareFacebook() {
    return `https://www.facebook.com/sharer/sharer.php?u=${this.shareUrl}`
  }
  get shareMail() {
    return `mailto:?subject=${this.titleShare}&body=${this.shareUrl}`
  }
  get shareWhatsapp() {
    return `https://api.whatsapp.com/send?text=${this.titleShare} ${this.shareUrl}`
  }

  share() {
    const navigator: any = window.navigator
    if (navigator.share) {
      navigator.share({
        title: `@${this.item.name}`,
        text: `@${this.item.name}` + (this.item.description ? `: ${this.item.description}` : ''),
        url: this.shareUrl,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error))
    } else {
      copyTextToClipboard(this.shareUrl)
      this.copied = 'Link Copied'
    }
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
            <h1>{this.i18n.share}</h1>
            <ion-fab-button onClick={this.close} class="close-btn" size="small">
              <ion-icon name="close"></ion-icon>
            </ion-fab-button>
          </ion-toolbar>
        </ion-header>
        
        <div class="container">
          <ion-label>{this.i18n.share} <b>@{this.item.name}</b> {this.i18n.social}</ion-label>
        </div>

        <ion-item class="copy-url" text-center>
          <ion-icon slot="end"
            color="primary"
            name="clipboard-outline"
            title={`share:link ${this.url}`} large
            onClick={() => this.share()}></ion-icon>
          <ion-input mode="md" readonly class="core" value={this.shareUrl}
            onClick={() => this.share()}></ion-input>
        </ion-item>

        <div class="icons">
          <a rel="noopener" target="_blank" class="share-btn share-btn-lg share-btn-facebook"
            href={this.shareFacebook}
            title="Share on Facebook">
            <ion-icon color="primary" name="logo-facebook" large></ion-icon>
          </a>
          <a rel="noopener" target="_blank" class="share-btn share-btn-lg share-btn-twitter"
            href={this.shareTwitter}
            title="Share on Twitter">
            <ion-icon color="primary" name="logo-twitter" large></ion-icon>
          </a>
          <a rel="noopener" target="_blank" class="share-btn share-btn-lg share-btn-email"
            href={this.shareMail}
            title="Share via Email">
            <ion-icon color="primary" name="mail-outline" large></ion-icon>
          </a>
          <a rel="noopener" target="_blank" class="share-btn share-btn-lg share-btn-more"
            href={this.shareWhatsapp}
            title="More options">
            <ion-icon color="primary" name="logo-whatsapp" large></ion-icon>
          </a>
        </div>

      </Host>
    );
  }

}
