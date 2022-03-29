import { Component, Host, Prop, h } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation'

@Component({
  tag: 'app-comment',
  styleUrl: 'app-comment.css',
  shadow: true,
})
export class AppComment {

  @Prop() item: any;
  i18n: any = {
    comments: {
      has_identified: 'has identified this observation',
      someone: 'Someone' 
    }
  }

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
  }

  render() {
    return (
      <Host>
        <div class="card-comment">
          <div class="user-info underlined">
            <div class="personal-info">
              <div class="avatar">
                <img class="img-fit" loading="lazy" src="/assets/svg/img.jpg" alt="avatar"/>
              </div>
              <div class="user-text">
                <h6>
                  <b>{this.item.user?.name || this.item.user?.id || this.i18n.comments.someone}</b>
                  <span> · </span>
                  <small class="date">{this.item.$$date}</small>
                </h6>
              </div>
            </div>
          </div>
          <div class="observation">
            <div class="observation-info">
              {this.item.taxon?.url && <div class="img-observation">
                <img class="img-fit" loading="lazy" src={(this.item.taxon || {}).url}/>
              </div>}
              {this.item.taxon?.name && <div class="cnt-text">
                <h5>{(this.item.taxon || {}).name}</h5>
              </div>}
            </div>
          </div>
          <p class="people-agree">{this.item.body || this.item.comment}</p>
        </div>
      </Host>
    );
  }

}
