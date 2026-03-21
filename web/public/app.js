import { tagline } from './message.js';

const el = document.querySelector('#client-note');
if (el) {
  el.textContent = tagline();
}
