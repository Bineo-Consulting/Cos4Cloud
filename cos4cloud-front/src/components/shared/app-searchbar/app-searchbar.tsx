import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

const getUnique = (items, key) => 
  items = items.filter((thing, index, self) =>
    index === self.findIndex((t) => (
      t[key] === thing[key]
    ))
  )


@Component({
  tag: 'app-searchbar',
  styleUrl: 'app-searchbar.css',
  shadow: true,
})
export class AppSearchbar {

  @Prop({ mutable: true }) value: string
  @Prop() placeholder: string
  @Prop() service: ServiceType;
  @Prop() service2: ServiceType;
  
  @Event() choose: EventEmitter<any>;

  @State() items = []
  @State() itemsCache = JSON.parse(localStorage.search || '[]')

  async onInput(ev) {
    const term = ev.detail.value || ''
    if (term) {
      if (this.service2) {
        const itemsAsync = this.service.get({
          value: term
        })

        const items2Async = this.service2.get({
          value: term
        })
        const [items, items2] = await Promise.all([itemsAsync, items2Async])
        this.items = [
          ...this.service.process(items, term.toLowerCase()),
          ...this.service2.process(items2, term.toLowerCase())
        ].sort((a, b) => b.score - a.score)
      } else {
        this.items = this.service.process(await this.service.get({ value: term }), term.toLowerCase())
      }
    } else {
      this.items = []
      this.value = null
      this.choose.emit(null)
    }
  }

  setCache(item) {
    let search = JSON.parse(localStorage.search || '[]')
    search.unshift(item)
    search = getUnique(search, 'name')
    search.splice(10)

    localStorage.setItem('search', JSON.stringify(search))
    this.itemsCache = search
  }
  itemClicked(item) {
    this.value = item.name
    this.choose.emit(item)
    this.setCache(item)
  }
  onInputClear() {
    this.value = null
    this.choose.emit(null)
  }

  render() {
    return (
      <Host>
        <ion-searchbar
          debounce="300"
          class="focused"
          mode="md"
          onIonChange={ev => this.onInput(ev)}
          onIonClear={() => this.onInputClear()}
          placeholder={this.placeholder}
          type="search"
          value={this.value}
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"></ion-searchbar>
        <ion-list class="list-dropdown">
          {this.items.map(item => 
            <ion-item onClick={() => this.itemClicked(item)}>
              <ion-label>{item.icon} {item.name}</ion-label>
            </ion-item>
          )}
        </ion-list>

        <ion-list class="cache list-dropdown">
          {this.itemsCache.map(item => 
            <ion-item onClick={() => this.itemClicked(item)}>
              <ion-label>{item.icon} {item.name}</ion-label>
            </ion-item>
          )}
        </ion-list>
      </Host>
    );
  }

}
