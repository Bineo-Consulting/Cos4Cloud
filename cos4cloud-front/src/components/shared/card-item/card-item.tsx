import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'card-item',
  styleUrl: 'card-item.css',
  shadow: true,
})
export class CardItem {

  @Prop({mutable: true}) item: any;
  @Prop({mutable: true}) image: string;

  render() {
    return (
      <Host>
        <stencil-route-link url={'/observations/' + this.item.id} activeClass="link-active">
          <div class="card-item">
            <div class="cnt-img">
              <img loading="lazy" src={this.image || this.item.medium_url}/>
            </div>
            <div class="cnt-text">
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
                  <span class="origin-name">{this.item.origin} {this.item.id_please ? ' (Needs Help)' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </stencil-route-link>
      </Host>
    );
  }

}
