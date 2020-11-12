import { Component, Host, Prop, State, h } from '@stencil/core';
import { MatchResults, RouterHistory } from '@stencil/router';
import { MappingService } from '../../../services/mapping.service';
import { GbifService } from '../../../services/gbif.service';

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

  slideOpts = {
    initialSlide: 1,
    slidesPerView: 1,
    speed: 400
  };
  id: number | string;
  body: string | void;
  specie: string;

  componentWillLoad() {
    this.id = Number(this.match.params.id)
    MappingService.getById(this.id)
    .then((res) => {
      console.log({res})
      this.item = res
    })
    .catch((error) => {
      alert(error)
    })
  }

  onSpecie(ev) {
    const item = (ev || {}).detail
    const name = (item.name || '').split(' ').slice(0, 2).join(' ')
    this.specie = name
  }

  openMap() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-map';
    modalElement.componentProps = {
      lat: this.item.latitude,
      lon: this.item.longitude
    }

    // present the modal
    document.body.appendChild(modalElement);
    return modalElement.present();
  }

  async openModalLogin() {
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

  async addIdentification() {
    if (localStorage.user) {
      await MappingService.addIdentification({
        parent_id: this.id,
        body: this.body,
        taxon: this.specie
      })
      this.componentWillLoad()
    } else {
      this.openModalLogin()
    }
  }

  render() {
    return (
      <Host>
        <ion-slides pager={true} options={this.slideOpts}>
          {this.item.$$photos.map(photo => <ion-slide>
            <img src={photo.medium_url}/>
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
              <ion-icon size="small" name="globe-outline"></ion-icon>
              <span class="origin-name">Natusfera {this.item.id_please ? ' (Needs Help)' : ''}</span>
            </div>

            <div class="origin">
              <ion-icon size="small" name="earth-outline"></ion-icon>
              <span class="origin-name" onClick={() => this.openMap()}>Lat {this.item.latitude}, Lon {this.item.longitude}</span>
            </div>
          </div>
        </div>

        <div class="contain">
          <h3>Comments</h3>
          {this.item.$$comments.map(comment =>
            <app-comment item={comment}></app-comment>
          )}
          {this.item.$$identifications.map(identification =>
            <app-comment item={identification}></app-comment>
          )}

          <h3>Add comment/identification</h3>
          <app-searchbar
            value={this.specie}
            placeholder="Search species"
            onChoose={(e) => this.onSpecie(e)} service={GbifService}></app-searchbar>
          <ion-item>
            {/*fixed" | "floating" | "stacked*/}
            <ion-label position="floating">Comments</ion-label>
            <ion-textarea
              onChange={(ev) => this.body = ev.detail}
              rows="6"
              cols="20"
              placeholder="Enter any notes here..."></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-button
              onClick={() => this.addIdentification()}>Add Identification</ion-button>
          </ion-item>

          <br/><br/>
        </div>
      </Host>
    );
  }

}
