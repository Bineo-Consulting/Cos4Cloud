import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
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
    // id_please: 'false',
    geo: 'false',
    photos: 'false'
  }
  qualities = [
    {key: 'research', value: 'research', label: '👨‍🔬 Research'},
    {key: 'casual', value: 'casual', label: '🤷‍♂️ Casual'},
    // {key: 'id_please', value: 'id_please', label: 'id_please'},
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

  // date = {}
  // dates = [
  //   {key: '7D', value: '7D', label: '7D'},
  //   {key: '30D', value: '30D', label: '30D'},
  //   {key: '3M', value: '3M', label: '3M'},
  //   {key: '6M', value: '6M', label: '6M'},
  //   {key: '1Y', value: '1Y', label: '1Y'},
  //   {key: '2Y', value: '2Y', label: '2Y'},
  //   {key: '3Y', value: '3Y', label: '3Y'},
  //   // {key: 'This week', value: 'This week', label: 'This week'},
  //   // {key: 'This month', value: 'This month', label: 'This month'},
  //   // {key: 'This year', value: 'This year', label: 'This year'},
  // ]
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
      }, 200)
    } else {
      setTimeout(() => {
        const el = ev.path[0]
        this[el.value] = el.checked ? 'true' : 'false'
      }, 200)
    }
  }

  // async openDatePicker(elem) {
  //   await import('/assets/datepicker.js' as VanillajsDatepicker)
  //   this.refs.datepicker = elem
  //   // const DateRangePicker = window['DateRangePicker']
  //   setTimeout(async () => {
  //     const rangepicker = new window['DateRangePicker'](elem, {})
  //   }, 1000)
  // }


  lazyCss(scriptUrl: string) {
    const s = document.getElementById('style-calendar')
    if (s) return new Promise(resolve => resolve(true))
    else return new Promise(resolve => {
      const linkElement = document.createElement('link')
      linkElement.id = 'style-calendar'
      linkElement.rel = 'stylesheet'
      linkElement.charset = 'utf-8'
      linkElement.href = scriptUrl
      linkElement.onload = resolve
      document.body.appendChild(linkElement)
    })
  }

  when: any
  async setupDatePicker(ref1, ref2) {
    if (this.when) return null
    const cssAwait = this.lazyCss('/assets/when.min.css')
    const jsAwait = import('/assets/when.min.js' as VanillajsDatepicker)
    await Promise.all([cssAwait, jsAwait])

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
        dateInput.innerHTML = when
        const [mm, dd, yyyy] = (when.split(' – ')[0] || '').split('/')
        const [mm2, dd2, yyyy2] = (when.split(' – ')[1] || '').split('/')
        this.date.minEventDate = [yyyy, mm, dd].join('-')
        this.date.maxEventDate = [yyyy2, mm2, dd2].join('-')
      })
      const rest = window['innerHeight'] - $event.clientY

      calendar.parentNode.style.position = 'relative'
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
                onClick={() => this.openFilters('portals')}>Portal</ion-chip>
              <ion-chip
                ref={(e) => this.refs.types = e}
                onClick={() => this.openFilters('types')}>Type</ion-chip>
              <ion-chip
                ref={(e) => this.refs.quality = e}
                onClick={() => this.openFilters('quality')}>Quality</ion-chip>
              <ion-chip
                ref={(e) => this.refs.licenses = e}
                onClick={() => this.openFilters('licenses')}>License</ion-chip>

              <ion-chip
                ref={(e) => (this.refs.dateInput = e, this.onMouseDown())}
                onMouseUp={(e) => this.onMouseUp(e)}>Date</ion-chip>
              <span ref={e => this.refs.dateContainer = e}></span>

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
                  <ion-label>{item.label}</ion-label>
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
