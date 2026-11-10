// jsdom historically omits HTMLDialogElement.showModal — minimal polyfill for integration tests.
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModalPolyfill() {
      this.setAttribute('open', '')
      this.open = true
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function closePolyfill() {
      this.removeAttribute('open')
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
}
