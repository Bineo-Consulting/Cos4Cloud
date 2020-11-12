import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'app-footer',
  styleUrl: 'app-footer.css',
  shadow: true,
})
export class AppFooter {

  render() {
    return (
      <Host>
        <footer>
{/*          <h3>Take bio-earth with you</h3>
          <div class="download">
            <img src="./assets/svg/download-ios.svg" alt=""/>
            <img src="./assets/svg/download-md.svg" alt=""/>
          </div>*/}

          <div class="cnt-footer">
            <div class="nav-footer">
              <div class="tabs">
                <a href="/about.html">About</a>
                <a href="/help.html">Help</a>
                <a href="/privacy.html">Privacy Policy</a>
                <a href="/terms.html">Terms of Service</a>
                <a href="/contact.html">Contact</a>
              </div>
            </div>

            <div class="rrss">
              <p>Follow us:</p>
              <div class="icons-rrss">
                <a href="https://www.linkedin.com/company/cos4cloud-project/" target="_blank"><img loading="lazy" src="./assets/svg/in-logo.svg" alt="Linkedin logo"/></a>
                <a href="https://twitter.com/Cos4Cloud" target="_blank"><img loading="lazy" src="./assets/svg/tw-logo.svg" alt="Twitter logo"/></a>
                <a href="https://www.instagram.com/cos4cloud/" target="_blank"><img loading="lazy" src="./assets/svg/ig-logo.svg" alt="Instagram logo"/></a>
                <a href="https://www.youtube.com/channel/UC38cKrW3viJrb0GM1JrWAQw" target="_blank"><img loading="lazy" src="./assets/svg/yt-logo.svg" alt="Youtube logo"/></a>
              </div>
            </div>
          </div>
        </footer>
      </Host>
    );
  }

}
