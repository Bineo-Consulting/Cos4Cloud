import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { GbifService } from '../../../services/gbif.service';
import { PlacesService } from '../../../services/places.service';

@Component({
  tag: 'app-search',
  styleUrl: 'app-search.css',
  shadow: true,
})
export class AppSearch {

  @Prop() specie: string;
  @Prop() place: string;

  @Event() search: EventEmitter<any>;

  @State() filters: HTMLElement;

  params: any = {}
  iconic_taxa: any = {
    Plantae: 'false',
    Animalia: 'false',
    Fungi: 'false',
    Reptilia: 'false',
  }
  quality_grade: any = {
    research: 'false',
    casual: 'false'
  }
  has: any = {
    id_please: 'false',
    geo: 'false',
    photos: 'false'
  }
  origin: any = {
    natusfera: 'false',
    ispot: 'false'
  }

  onSpecie(ev) {
    const item = (ev || {}).detail
    const name = (item.name || '').split(' ').slice(0, 2).join(' ')
    this.params.taxon_name = name || null
  }

  onPlace(ev) {
    const item = (ev || {}).detail
    this.params.swlat = Number(item.bbox[0])
    this.params.swlng = Number(item.bbox[2])
    this.params.nelat = Number(item.bbox[1])
    this.params.nelng = Number(item.bbox[3])
    this.params.place = item.name || null
  }

  openFilters() {
    this.filters.focus()
  }

  onSearch() {
    const iconic_taxa = Object.keys(this.iconic_taxa).map(key => {
      return this.iconic_taxa[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.iconic_taxa = iconic_taxa.length ? iconic_taxa.join(',') : null

    const quality_grade = Object.keys(this.quality_grade).map(key => {
      return this.quality_grade[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.quality_grade = quality_grade.length ? quality_grade.join(',') : null

    const has = Object.keys(this.has).map(key => {
      return this.has[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.has = has.length ? has.join(',') : null

    const origin = Object.keys(this.origin).map(key => {
      return this.origin[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.origin = origin.length ? origin.join(',') : null

    this.search.emit(this.params)
  }

  onChecked(ev, key?) {
    if (key) {
      setTimeout(() => {
        const el = ev.path[0]
        this[key][el.value] = el.checked ? 'true' : 'false'
      }, 200)
    } else {
      setTimeout(() => {
        const el = ev.path[0]
        this[el.value] = el.checked ? 'true' : 'false'
      }, 200)
    }
  }

  render() {
    return (
      <Host>

        <ion-grid class="app-grid">
          <ion-row>
            <ion-col size="6" size-md="6">
              <app-searchbar
                value={this.specie}
                placeholder="Search species"
                onChoose={(e) => this.onSpecie(e)} service={GbifService}></app-searchbar>
            </ion-col>

            <ion-col size="6" size-md="6">
              <app-searchbar
                value={this.place}
                placeholder="Search places"
                onChoose={(e) => this.onPlace(e)} service={PlacesService}></app-searchbar>
            </ion-col>
          </ion-row>

          <ion-row class="center">
            <ion-col size="3" size-sm="2" size-md="2" size-lg="2">
              <ion-button expand="block" fill="outline"
                onClick={() => this.openFilters()}>Filters</ion-button>
            </ion-col>

            <ion-col size="3" size-sm="2" size-md="2" size-lg="2">
              <ion-button expand="block" onClick={() => this.onSearch()}>Search</ion-button>
            </ion-col>
          </ion-row>

          <ion-row ref={(e) => this.filters = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list>
                <ion-label>Types</ion-label>
                <ion-item>
                  <ion-checkbox slot="start" value="Plantae"
                    checked={this.iconic_taxa.Plantae}
                    onIonChange={(ev) => this.onChecked(ev, 'iconic_taxa')}></ion-checkbox>
                  <ion-label>🌿 Plantae</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="Animalia"
                    checked={this.iconic_taxa.Animalia}
                    onIonChange={(ev) => this.onChecked(ev, 'iconic_taxa')}></ion-checkbox>
                  <ion-label>🐱 Animalia</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="Fungi"
                    checked={this.iconic_taxa.Fungi}
                    onIonChange={(ev) => this.onChecked(ev, 'iconic_taxa')}></ion-checkbox>
                  <ion-label>🍄 Fungi</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="Reptilia"
                    checked={this.iconic_taxa.Reptilia}
                    onIonChange={(ev) => this.onChecked(ev, 'iconic_taxa')}></ion-checkbox>
                  <ion-label>🦎 Reptilia</ion-label>
                </ion-item>
              </ion-list>

              <ion-list>
                <ion-label>Portals</ion-label>
                <ion-item>
                  <ion-checkbox slot="start" value="natusfera"
                    checked={this.origin.natusfera}
                    onIonChange={(ev) => this.onChecked(ev, 'origin')}></ion-checkbox>
                  <ion-label>Natusfera</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="ispot"
                    checked={this.origin.ispot}
                    onIonChange={(ev) => this.onChecked(ev, 'origin')}></ion-checkbox>
                  <ion-label>iSpot</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="artportalen" disabled></ion-checkbox>
                  <ion-label>ArtPortalen</ion-label>
                </ion-item>
              </ion-list>

              <ion-list>
                <ion-label>Quality</ion-label>
                <ion-item>
                  <ion-checkbox slot="start" value="research"
                    checked={this.quality_grade.research}
                    onIonChange={(ev) => this.onChecked(ev, 'quality_grade')}></ion-checkbox>
                  <ion-label>Research</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="casual"
                    checked={this.quality_grade.casual}
                    onIonChange={(ev) => this.onChecked(ev, 'quality_grade')}></ion-checkbox>
                  <ion-label>Casual</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="geo"
                    checked={this.has.geo}
                    onIonChange={(ev) => this.onChecked(ev, 'has')}></ion-checkbox>
                  <ion-label>With geo</ion-label>
                </ion-item>

                <ion-item>
                  <ion-checkbox slot="start" value="photos"
                    checked={this.has.photos}
                    onIonChange={(ev) => this.onChecked(ev, 'has')}></ion-checkbox>
                  <ion-label>With photos</ion-label>
                </ion-item>

              </ion-list>
            </div>
          </ion-row>
        </ion-grid>

      </Host>
    );
  }

}
