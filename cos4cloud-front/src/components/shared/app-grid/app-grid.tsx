import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { RouterHistory } from '@stencil/router';

@Component({
  tag: 'app-grid',
  styleUrl: 'app-grid.css',
  shadow: true,
})
export class AppGrid {

  @Prop() items: any[];
  @Prop() images: any;
  @Prop() showSpinner: boolean = false
  @Event() loadmore: EventEmitter<any>;
  @Prop() history: RouterHistory;

  spinner: HTMLElement;
  observer;
  perPage: number = 30;

  componentWillUpdate() {
    const queryParams: any = location.search
    if (!queryParams.includes('origin')) {
      this.perPage = 30
    } else if (queryParams.includes('natusfera')) {
      this.perPage = 30
    } else if (queryParams.includes('ispot')) {
      this.perPage = 49
    }
  }

  setSpinnerEl(el) {
    this.spinner = el
    const callback = (entries, _) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this.loadmore.emit()
        }
      })
    }
    if (!this.observer) {
      this.observer = new IntersectionObserver(callback, {})
      this.observer.observe(el)
    }
  }

  render() {
    return (
      <Host>
        <div class="grid">
          {this.items.map(item => <card-item item={item} image={this.images[item.ID]}></card-item>)}
        </div>
        {
          this.showSpinner &&
          this.items.length % this.perPage === 0 &&
          <div class="spinner" ref={(el) => this.setSpinnerEl(el)}>
            <ion-spinner></ion-spinner>
          </div>
        }
      </Host>
    );
  }

}
