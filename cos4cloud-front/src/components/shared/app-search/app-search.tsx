import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { GbifService } from '../../../services/gbif.service';
import { PlacesService } from '../../../services/places.service';
import { fetchTranslations } from '../../../utils/translation';

@Component({
  tag: 'app-search',
  styleUrl: 'app-search.css',
  shadow: true,
})
export class AppSearch {

  i18n: any = {};
  @Prop() specie: string;
  @Prop() place: string;
  @Prop() query: any;
  @Event() search: EventEmitter<any>;
  
  title: {[key: string]: string} = {
    portal: null,
    type: null,
    quality: null,
    license: null
  }
  filters: { [key: string]: HTMLElement } = {};
  refs: { [key: string]: HTMLElement } = {};

  params: any = {}

  origin: any = {
    natusfera: 'false',
    ispot: 'false',
    plantnet: 'false',
    artportalen: 'false',
    gbif: 'false'
  }
  origins = Object.keys(this.origin) // hamelin

  iconic_taxa: any = {}
  types = [
    {key: 'plantae', value: 'plantae', label: '🌿 Plantae'},
    {key: 'animalia', value: 'animalia', label: '🐱 Animalia'},
    {key: 'fungi' ,value: 'fungi', label: '🍄 Fungi'},
    {key: 'reptilia', value: 'reptilia', label: '🦎 Reptilia'}
  ]

  quality: any = {
    research: 'false',
    casual: 'false',
    geo: 'false',
    photos: 'false'
  }
  qualities = [
    {key: 'research', value: 'research', label: '👨‍🔬 Research'},
    {key: 'casual', value: 'casual', label: '🤷‍♂️ Casual'},
    {key: 'geo', value: 'geo', label: '📍 Geo'},
    {key: 'photos', value: 'photos', label: '🖼 photos'}
  ]

  license = {
    'CC0': 'false',
    'CC BY': 'false',
    'CC BY-NC': 'false',
  }
  licenses = [
    {key: 'none', value: 'none', label: 'CC0'},
    {key: 'CC-BY', value: 'CC-BY', label: 'CC-BY'},
    {key: 'CC-BY-NC', value: 'CC-BY-NC', label: 'CC-BY-NC'},
  ]

  date = {
    minEventDate: null,
    maxEventDate: null
  }

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)

    if (this.query) {
      const origins = (this.query.origin || '').split(',')
      origins.map(item => {
        this.origin[item] = 'true'
      })
      this.origin = {...this.origin}

      const iconic_taxa = (this.query.iconic_taxa || '').split(',')
      iconic_taxa.map(item => {
        this.iconic_taxa[item] = 'true'
      })
      this.iconic_taxa = {...this.iconic_taxa}

    }
  }

  componentDidLoad() {
    this.setTitle()
  }

  onSpecie(ev) {
    const item = (ev || {}).detail
    if (item) {
      const name = (item.name || '').split(' ').slice(0, 2).join(' ')
      this.params.taxon_name = name || null
    } else {
      this.params.taxon_name = null
    }
  }

  onPlace(ev) {
    const item = (ev || {}).detail
    if (item && item.bbox) {
      this.params.decimalLatitude = [Number(item.bbox[0]), Number(item.bbox[1])]
      this.params.decimalLongitude = [Number(item.bbox[2]), Number(item.bbox[3])]
      this.params.place = item.name || null
    } else if (item) {
      const name = (item.name || '').split(' ').slice(0, 2).join(' ')
      this.params.taxon_name = name || null
    } else {
      this.params.decimalLongitude = null
      this.params.decimalLatitude = null
      this.params.swlat = null
      this.params.swlng = null
      this.params.nelat = null
      this.params.nelng = null
      this.params.place = null
      this.params.taxon_name = null
    }
  }

  onSearchSelect(ev) {
    const item = (ev || {}).detail
    if (item && item.bbox) {
      this.params.decimalLatitude = [Number(item.bbox[0]), Number(item.bbox[1])]
      this.params.decimalLongitude = [Number(item.bbox[2]), Number(item.bbox[3])]
      this.params.place = item.name || null
    } else if (item) {
      const name = (item.name || '').split(' ').slice(0, 2).join(' ')
      this.params.taxon_name = name || null
    } else {
      this.params.decimalLongitude = null
      this.params.decimalLatitude = null
      this.params.swlat = null
      this.params.swlng = null
      this.params.nelat = null
      this.params.nelng = null
      this.params.place = null
      this.params.taxon_name = null
    }
  }

  onSearch() {
    const iconic_taxa = Object.keys(this.iconic_taxa).map(key => {
      return this.iconic_taxa[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.iconic_taxa = iconic_taxa.length ? iconic_taxa.join(',') : null

    const origin = Object.keys(this.origin).map(key => {
      return this.origin[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.origin = origin.length ? origin.join(',') : null

    const license = Object.keys(this.license).map(key => {
      return this.license[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.license = license.length ? license.join(',') : null

    const quality = Object.keys(this.quality).map(key => {
      return this.quality[key] === 'true' ? key : null
    }).filter(Boolean)

    this.params.quality_grade = [
      quality.includes('casual') ? 'casual' : null,
      quality.includes('research') ? 'research' : null
    ].filter(Boolean).join(',') || null

    this.params.has = [
      quality.includes('geo') ? 'geo' : null,
      quality.includes('photos') ? 'photos' : null
    ].filter(Boolean).join(',') || null

    this.params.minEventDate = this.date.minEventDate || null
    this.params.maxEventDate = this.date.maxEventDate || null

    this.search.emit(this.params)
  }

  openFilters(key = 'all') {
    const offl = this.refs[key].offsetLeft
    this.filters[key].focus()
    this.filters[key].style.left = `${offl}px`
  }

  onChecked(ev, key = null) {
    if (key) {
      setTimeout(() => {
        const el = ev.path[0]
        this[key][el.value] = el.checked ? 'true' : 'false'
        this.setTitle()
      }, 200)
    } else {
      setTimeout(() => {
        const el = ev.path[0]
        this[el.value] = el.checked ? 'true' : 'false'
        this.setTitle()
      }, 200)
    }
  }

  when: any
  async setupDatePicker(ref1, ref2) {
    if (this.when) return null
    // const cssAwait = null//this.lazyCss('/assets/when.min.css')
    const jsAwait = import('/assets/when.min.js' as VanillajsDatepicker)
    await Promise.all([jsAwait])

    const varWhen = 'When'
    const when: any = window[varWhen]
    this.when = new when({
      input: ref1,
      // labelTo: this.labelTo,
      // labelFrom: this.labelFrom,
      locale: localStorage.lang || 'en',
      double: false,
      inline: false,
      singleDate: false,
      showHeader: true,
      container: ref2
    })
    return null
  }

  onMouseDown() {
    setTimeout(() => {
      this.setupDatePicker(this.refs.dateInput, this.refs.dateContainer)
    }, 100)
  }
  onMouseUp($event) {
    if (!this.when) return setTimeout(() => this.onMouseUp($event), 200)
    setTimeout(() => {
      const calendar: any = this.refs.calendar.querySelector('.calendar')
      calendar && calendar.addEventListener('click', _ => {
        const dateInput: any = this.refs.dateInput
        const when = dateInput.value

        console.log({when})
        dateInput.innerHTML = when
        const [mm, dd, yyyy] = (when.split(' – ')[0] || '').split('/')
        const [mm2, dd2, yyyy2] = (when.split(' – ')[1] || '').split('/')
        this.date.minEventDate = [yyyy, mm, dd].join('-')
        this.date.maxEventDate = [yyyy2, mm2, dd2].join('-')
        this.refs.dateInput.classList.add('active')
      })
      const rest = window['innerHeight'] - $event.clientY

      calendar.parentNode.style.position = 'relative'
      calendar.parentNode.classList.add('calendar-div')
      calendar.classList.remove('top-left-triangle')
      calendar.classList.remove('top-right-triangle')
      calendar.classList.remove('.bottom-left-triangle')
      calendar.classList.remove('.bottom-right-triangle')
      const top = this.refs.dateInput.offsetTop
      const left = this.refs.dateInput.offsetLeft

      calendar.style.top = `${top + 42}px`
      calendar.style.left = `${-330}px`
    }, 100)
  }
  clearDate() {
    this.date = {
      minEventDate: null,
      maxEventDate: null
    }
    this.refs.dateInput.innerHTML = 'Date'
    this.refs.dateInput.classList.remove('active')
  }

  get portalTitle() {
    return Object.entries(this.origin).filter(([_, v]) => v === 'true').map(([k]) => k).filter(Boolean).join('+') || null
  }
  get typeTitle() {
    return Object.entries(this.iconic_taxa).filter(([_, v]) => v === 'true').map(([k]) => k).filter(Boolean).join('+') || null
  }
  get qualityTitle() {
    return Object.entries(this.quality).filter(([_, v]) => v === 'true').map(([k]) => this.i18n.filters[k]).filter(Boolean).join('+') || null
  }
  get licenseTitle() {
    return Object.entries(this.license).filter(([_, v]) => v === 'true').map(([k]) => k).filter(Boolean).join('+') || null
  }

  setTitle() {
    const portal = this.portalTitle
    if (portal !== this.title.portal) {
      this.title.portal = portal
      this.refs.portals.innerHTML = this.title.portal || 'Portal'
      if (portal) this.refs.portals && this.refs.portals.classList.add('active')
      else this.refs.portals && this.refs.portals.classList.remove('active')
    }
    const type = this.typeTitle
    if (type !== this.title.type) {
      this.title.type = type
      this.refs.types.innerHTML = this.title.type || 'Portal'
      if (type) this.refs.types && this.refs.types.classList.add('active')
      else this.refs.types && this.refs.types.classList.remove('active')
    }
    const quality = this.qualityTitle
    if (quality !== this.title.quality) {
      this.title.quality = quality
      this.refs.quality.innerHTML = this.title.quality || 'Portal'
      if (quality) this.refs.quality && this.refs.quality.classList.add('active')
      else this.refs.quality && this.refs.quality.classList.remove('active')
    }
    const license = this.licenseTitle
    if (license !== this.title.license) {
      this.title.license = license
      this.refs.licenses.innerHTML = this.title.license || 'Portal'
      if (license) this.refs.licenses && this.refs.licenses.classList.add('active')
      else this.refs.licenses && this.refs.licenses.classList.remove('active')
    }
  }

  render() {
    return (
      <Host>

        <ion-grid class="app-grid">
          <ion-row>
            <ion-col size="9" size-sm="10">
              <app-searchbar
                value={this.specie}
                placeholder={this.i18n.filters.search}
                onChoose={(e) => this.onSearchSelect(e)}
                service={GbifService}
                service2={PlacesService}></app-searchbar>
            </ion-col>

            <ion-col size="3" size-sm="2">
              <ion-button expand="block" onClick={() => this.onSearch()}>{this.i18n.filters.search}</ion-button>
            </ion-col>

            {/*<ion-col size="6" size-md="6">
              <app-searchbar
                value={this.place}
                placeholder={this.i18n.filters.search_places}
                onChoose={(e) => this.onPlace(e)} service={PlacesService}></app-searchbar>
            </ion-col>*/}
          </ion-row>

          <ion-row class="center">
            <ion-col size="12" ref={e => this.refs.calendar = e}>

              <ion-chip
                ref={(e) => this.refs.portals = e}
                onClick={() => this.openFilters('portals')}>{this.portalTitle || 'Portal'}</ion-chip>
              <ion-chip
                ref={(e) => this.refs.types = e}
                onClick={() => this.openFilters('types')}>{this.typeTitle || 'Type'}</ion-chip>
              <ion-chip
                ref={(e) => this.refs.quality = e}
                onClick={() => this.openFilters('quality')}>{this.qualityTitle || 'Quality'}</ion-chip>
              <ion-chip
                ref={(e) => this.refs.licenses = e}
                onClick={() => this.openFilters('licenses')}>{this.licenseTitle || 'License'}</ion-chip>

              <ion-chip
                ref={(e) => (this.refs.dateInput = e, this.onMouseDown())}
                onMouseUp={(e) => this.onMouseUp(e)}>Date</ion-chip>
              <span ref={e => this.refs.dateContainer = e}></span>
              <ion-chip
                ref={(e) => this.refs.clearDateInput = e}
                onClick={_ => this.clearDate()}
                class="clean">Clear</ion-chip>

            </ion-col>
          </ion-row>

          <ion-row ref={(e) => this.filters.portals = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.portals}</ion-label>
                {this.origins.map(origin => <ion-item>
                  <ion-checkbox slot="start" value={origin}
                    checked={this.origin[origin]}
                    onIonChange={(ev) => this.onChecked(ev, 'origin')}></ion-checkbox>
                  <ion-label>{origin}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

          <ion-row ref={(e) => this.filters.types = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.types}</ion-label>
                {this.types.map(item => <ion-item>
                  <ion-checkbox slot="start" value={item.value}
                    checked={this.iconic_taxa[item.key]}
                    onIonChange={(ev) => this.onChecked(ev, 'iconic_taxa')}></ion-checkbox>
                  <ion-label>{item.label}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

          <ion-row ref={(e) => this.filters.quality = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.quality}</ion-label>
                {this.qualities.map(item => <ion-item>
                  <ion-checkbox slot="start" value={item.value}
                    checked={this.quality[item.key]}
                    onIonChange={(ev) => this.onChecked(ev, 'quality')}></ion-checkbox>
                  <ion-label>{this.i18n.filters[item.key]}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

          <ion-row ref={(e) => this.filters.licenses = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.licenses}</ion-label>
                {this.licenses.map(item => <ion-item>
                  <ion-checkbox slot="start" value={item.value}
                    checked={this.licenses[item.key]}
                    onIonChange={(ev) => this.onChecked(ev, 'license')}></ion-checkbox>
                  <ion-label>{item.label}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

        </ion-grid>

      </Host>
    );
  }

}
