import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'app-comments',
  styleUrl: 'app-comments.css',
  shadow: true,
})
export class AppComments {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
