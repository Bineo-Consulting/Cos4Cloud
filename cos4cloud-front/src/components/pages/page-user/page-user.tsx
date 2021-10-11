import { Component, Host, Prop, h } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { fetchTranslations } from '../../../utils/translation'
import resources from '../../../resources'

@Component({
  tag: 'page-user',
  styleUrl: 'page-user.css',
  shadow: true,
})
export class PageUser {

  @Prop() match: MatchResults;
  i18n: any = {};
  @Prop() user: any;
  @Prop() owner: any;

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
    const user = JSON.parse(localStorage.user || 'false')
    this.owner = user ? user.sub === this.match.params.name : null
    // if (this.user) {
    //   this.info()
    // } else {
    this.info()
    // }
  }
  info() {
    const url = resources.host + '/users/' + this.match.params.name
    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.user = res
    })
  }


  async share() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-share';
    modalElement.cssClass = 'modal-share'
    modalElement.componentProps = {
      item: this.user
    }

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
  }

  render() {
    return (
      <Host>
        <div class="cnt-header-user">
          {this.user && <header>
            <div class="wrapper">
              <div class="user-photo">
                <img src="/assets/svg/user.svg" alt="user photo"/>
              </div>
              <ion-icon onClick={() => this.share()} class="share" name="share-social"></ion-icon>
            </div>
          </header>}
        </div>
        {this.user && <div class="cnt-header-title">
          <ion-title class="nickname"><b>{this.user.displayName}</b></ion-title>
        </div>}
        <div class="user-statistics">

          {this.user && <ion-list>
            <ion-item>
              <ion-title position="stacked"><small>Nickname</small></ion-title>
              <ion-label type="name"><b>{this.user.name}</b></ion-label>
            </ion-item>

            <ion-item>
              <ion-title position="stacked"><small>Name</small></ion-title>
              <ion-label type="name"><b>{this.user.displayName}</b></ion-label>
            </ion-item>

            {this.owner && <ion-item>
              <ion-title position="stacked"><small>Email</small></ion-title>
              <ion-label type="email"><b>{this.user.email}</b></ion-label>
            </ion-item>}

            <ion-item>
              <ion-title position="stacked"><small>Profession</small></ion-title>
              <ion-label type="text"><b>{this.user.profession}</b></ion-label>
            </ion-item>
          </ion-list>}

        </div>
        <div class="user-statistics">
          <ion-list>
            <ion-item>
              <ion-title><small>Comments:</small></ion-title>
              <progress id="comm" value="72" max="100"> 72 </progress>
            </ion-item>
            <ion-item>
              <ion-title><small>Identifications:</small></ion-title>
              <progress id="ident" value="32" max="100"> 32 </progress>
            </ion-item>
          </ion-list>
        </div>
      </Host>
    );
  }

}
