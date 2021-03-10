import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'app-searchbar',
  styleUrl: 'app-searchbar.css',
  shadow: true,
})
export class AppSearchbar {

  @Prop({ mutable: true }) value: string
  @Prop() placeholder: string
  @Prop() service: ServiceType;
  
  @Event() choose: EventEmitter<any>;

  @State() items = [];

  async onInput(ev) {
    if (ev.detail.value) {
      const items = await this.service.get({
        value: ev.target.value
      })
      this.items = this.service.process(items)
    } else {
      this.items = []
      this.value = null
      this.choose.emit(null)
    }
  }

  itemClicked(item) {
    this.value = item.name
    this.choose.emit(item)
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
          onIonClear={ev => this.onInputClear()}
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
      </Host>
    );
  }

}
