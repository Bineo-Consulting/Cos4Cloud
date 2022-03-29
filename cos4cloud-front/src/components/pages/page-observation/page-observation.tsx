import { Component, Host, Prop, State, h } from '@stencil/core';
import { MatchResults, RouterHistory } from '@stencil/router';
import { MappingService } from '../../../services/mapping.service';
import { GbifService } from '../../../services/gbif.service';
import { fetchTranslations } from '../../../utils/translation';

@Component({
  tag: 'page-observation',
  styleUrl: 'page-observation.css',
  shadow: true,
})
export class PageObservation {

  @Prop() history: RouterHistory;
  @Prop() match: MatchResults;
  @State() user: any;
  @State() item: any = {
    $$photos: [],
    $$comments: [],
    $$identifications: []
  };

  @State() comments: any[] = []

  slideOpts = {
    initialSlide: 1,
    slidesPerView: 1,
    speed: 400
  };
  id: string;
  @State() body: string | void;
  @State() specie: string;
  i18n: any = {
    need_login: 'You need to be logged',
    search_species: 'Search species',
    comments: {
      comments: 'Comments',
      type_comment: 'Enter any notes here...',
      add_identification: 'Add identification',
      add_comment_identification: 'Add comment/identification'
    }
  }

  async presentLoading() {
    const loading: any = document.createElement('ion-loading');

    loading.cssClass = 'my-loader';
    loading.message = 'Loading...';

    document.body.appendChild(loading);
    loading.present();
    return loading
  }

  loadingDismiss() {
    const loading: any = document.body.querySelector('ion-loading')
    if (loading) loading.dismiss()
  }

  loading: any;
  checked = false
  async componentWillLoad() {
    this.checked = false

    this.i18n = await fetchTranslations(this.i18n)
    this.id = this.match.params.id
    this.specie = ''
    this.body = ''
    this.item = MappingService.getCache(this.id)
    this.loading = this.presentLoading()
    MappingService.getById(this.id)
    .then((res) => {
      this.item = res
      const comments = [...res.$$identifications, ...this.comments]
      this.comments = comments.sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))
      this.loadingDismiss()
    })
    .catch((_) => {
      this.loadingDismiss()
    })

    const [origin, id] = this.id.includes('-') ? this.id.split('-') : [this.id]

    MappingService.getComments(id, origin)
    .then((res) => {
      const comments = [...this.item.$$identifications, ...(res || [])]
      this.comments = comments.sort((a:any, b:any) => Date.parse(a.created_at) - Date.parse(b.created_at))
    })
    .catch((_) => {})
  }

  componentDidLoad() {
    const scrollEl = document.querySelector('.shadow-scroll')
    scrollEl && scrollEl.scrollTo(0, 0)
  }

  onSpecie(ev) {
    const item = (ev || {}).detail
    const name = (item.name || '').split(' ').slice(0, 2).join(' ')
    this.specie = name
  }

  openMap() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-map';
    modalElement.componentProps = {
      lat: this.item.decimalLatitude,
      lon: this.item.decimalLongitude || this.item.decimalLongitud
    }

    // present the modal
    document.body.appendChild(modalElement);
    return modalElement.present();
  }

  async presentToast(msg) {
    const toast: any = document.createElement('ion-toast');
    toast.message = msg;
    toast.duration = 2000;

    document.body.appendChild(toast);
    return toast.present();
  }

  async openModalLogin() {
    this.presentToast(this.i18n.need_login)
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'page-login';

    // present the modal
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
    this.setUser()
  }

  setUser() {
    this.user = localStorage.user ? JSON.parse(localStorage.user) : null
  }

  async addComment() {
    if (localStorage.user) {
      await MappingService.addComment({
        parent_id: this.id,
        // body: this.body,
        comment: this.body,
        taxon: this.specie,
        item: this.item
      })
      this.componentWillLoad()
    } else {
      this.openModalLogin()
    }
  }

  checkUser() {
    if (!this.checked && !localStorage.user) {
      this.checked = true
      this.openModalLogin()
    }
  }

  get originUrl() {
    if (this.item && this.item.id) {
      const id = this.item.id.includes('-') ? this.item.id.split('-')[1] : this.item.id
      if (this.item.id.includes('plantnet')) {
        return `https://identify.plantnet.org/the-plant-list/observations/${id}`
      }
      if (this.item.id.includes('gbif')) {
        return `https://www.gbif.org/occurrence/${id}`
      }
      return `https://natusfera.org/observations/${id}`
    }
    return '#'
  }

  render() {
    return (
      <Host>
        <ion-slides pager={true} options={this.slideOpts}>
          {this.item.$$photos.map(photo => <ion-slide>
            <img referrer-policy="no-referrer-when-downgrade" src={photo.large_url}/>
          </ion-slide>)}
        </ion-slides>

        <div class="contain cnt-text">
          <div class="text-l">
            <p>{ this.item.$$species_name } ({this.item.quality_grade})</p>
            <div class="interactions">
              <div>
                <ion-icon size="small" name="time-outline"></ion-icon>
                <p>{ this.item.$$date }</p>
              </div>
              <div>
                <ion-icon size="small" name="chatbox-outline"></ion-icon>
                <p>{ this.item.comments_count || 0 }</p>
              </div>
              <div>
                <ion-icon size="small" name="pricetag-outline"></ion-icon>
                <p>{ this.item.identifications_count || 0 }</p>
              </div>
              <div>
                <ion-icon size="small" name="images-outline"></ion-icon>
                <p>{ this.item.observation_photos_count || 0 }</p>
              </div>
            </div>
            <div class="origin">
              <ion-icon size="small" name="earth-outline"></ion-icon>
              <a class="link-none" href={this.originUrl} target="_blank">
                <span class="origin-name">{this.item.origin} {this.item.id_please ? this.i18n.comments.help : ''}</span>
              </a>
            </div>

            {this.item.decimalLatitude && <div class="origin">
              <ion-icon size="small" name="location-outline"></ion-icon>
              <span class="origin-name" onClick={() => this.openMap()}>Lat {this.item.decimalLatitude}, Lon {this.item.decimalLongitude || this.item.decimalLongitud}</span>
            </div>}
          </div>
        </div>

        <div class="contain">
          
          {this.comments.map(comment =>
            <app-comment item={comment}></app-comment>
          )}

          <h3>{this.i18n.comments.add_comment_identification}</h3>
          <app-searchbar
            value={this.specie}
            placeholder={this.i18n.filters.search_species}
            onChoose={e => this.onSpecie(e)}
            service={GbifService}></app-searchbar>
          <ion-item class="comments-wrapper">
            {/*fixed" | "floating" | "stacked*/}
            <ion-label position="floating">{this.i18n.comments.comments}</ion-label>
            <ion-textarea
              position="floating"
              value={this.body}
              onIonFocus={() => this.checkUser()}
              onIonChange={(ev) => this.body = ev.detail.value}
              rows="6"
              cols="20"
              placeholder={this.i18n.comments.type_comment}></ion-textarea>
          </ion-item>
          {<ion-button class="add-identification"
            onClick={() => this.addComment()}>{this.i18n.comments.add_identification}</ion-button>
          }

          <br/><br/>
        </div>
      </Host>
    );
  }

}
