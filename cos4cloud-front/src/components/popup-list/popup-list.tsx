import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'popup-list',
  styleUrl: 'popup-list.css',
  shadow: true,
})
export class PopupList {

  @Prop() items: {text: string, icon?: string}[];

  dismiss(item) {
    const pop: any = document.querySelector('ion-popover')
    pop.dismiss(item)
  }

  render() {
    return (
      <div class="popup">
        {this.items.map(item =>
          <a tabindex="-1" onClick={() => this.dismiss(item)}>{item.text}</a>
        )}
      </div>
    );
  }

}
