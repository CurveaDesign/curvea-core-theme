class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      if (!cartItems) return;
      cartItems.updateQuantity(this.dataset.index, 0, event);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') return;
      return this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) this.cartUpdateUnsubscriber();
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    if (!input) return;
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const input = event.target;
    const inputValue = parseInt(input.value);
    const index = input.dataset.index;
    let message = '';

    if (inputValue < parseInt(input.dataset.min)) {
      message = window.quickOrderListStrings.min_error.replace('[min]', input.dataset.min);
    } else if (input.max && inputValue > parseInt(input.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', input.max);
    } else if (input.step && inputValue % parseInt(input.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', input.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      input.setCustomValidity('');
      input.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        event,
        document.activeElement?.getAttribute('name'),
        input.dataset.quantityVariantId,
      );
    }
  }

  onChange(event) {
    if (!event.target.matches('.quantity__input')) return;
    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      return fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((r) => r.text())
        .then((htmlText) => {
          const html = new DOMParser().parseFromString(htmlText, 'text/html');
          ['cart-drawer-items', '.cart-drawer__footer'].forEach((selector) => {
            const target = document.querySelector(selector);
            const source = html.querySelector(selector);
            if (target && source) target.replaceWith(source);
          });
        })
        .catch(console.error);
    }

    return fetch(`${routes.cart_url}?section_id=main-cart-items`)
      .then((r) => r.text())
      .then((htmlText) => {
        const html = new DOMParser().parseFromString(htmlText, 'text/html');
        const sourceQty = html.querySelector('cart-items');
        if (sourceQty) this.innerHTML = sourceQty.innerHTML;
      })
      .catch(console.error);
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items')?.dataset.id,
        selector: '.js-contents',
      },
      { id: 'cart-icon-bubble', section: 'cart-icon-bubble', selector: '.shopify-section' },
      { id: 'cart-live-region-text', section: 'cart-live-region-text', selector: '.shopify-section' },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer')?.dataset.id,
        selector: '.js-contents',
      },
    ].filter((s) => s.section);
  }

  updateQuantity(line, quantity, event, name, variantId) {
    const eventTarget = event.currentTarget instanceof CartRemoveButton ? 'clear' : 'change';
    const marker = CartPerformance.createStartingMarker(`${eventTarget}:user-action`);

    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((s) => s.section),
      sections_url: window.location.pathname,
    });

    fetch(routes.cart_change_url, { ...fetchConfig(), body })
      .then((r) => r.text())
      .then((state) => {
        const parsedState = JSON.parse(state);

        CartPerformance.measure(`${eventTarget}:paint-updated-sections`, () => {
          const quantityElement =
            document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);

          if (parsedState.errors) {
            if (quantityElement) quantityElement.value = quantityElement.getAttribute('value');
            this.updateLiveRegions(line, parsedState.errors);
            return;
          }

          this.classList.toggle('is-empty', parsedState.item_count === 0);
          const drawer = document.querySelector('cart-drawer');
          const footer = document.getElementById('main-cart-footer');

          if (footer) footer.classList.toggle('is-empty', parsedState.item_count === 0);
          if (drawer) drawer.classList.toggle('is-empty', parsedState.item_count === 0);

          this.getSectionsToRender().forEach((section) => {
            const container = document.getElementById(section.id);
            if (!container) return;
            const element = container.querySelector(section.selector) || container;
            element.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          });

          this.updateLiveRegions(line, '');

          const lineItem =
            document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);

          if (lineItem && name && lineItem.querySelector(`[name="${name}"]`)) {
            drawer
              ? trapFocus(drawer, lineItem.querySelector(`[name="${name}"]`))
              : lineItem.querySelector(`[name="${name}"]`).focus();
          } else if (parsedState.item_count === 0 && drawer) {
            trapFocus(drawer.querySelector('.drawer__inner-empty'), drawer.querySelector('a'));
          }
        });

        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: 'cart-items',
          cartData: parsedState,
          variantId: variantId,
        });
      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((el) => el.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        if (errors) errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
        CartPerformance.measureFromMarker(`${eventTarget}:user-action`, marker);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);

    if (lineItemError) {
      lineItemError.querySelector('.cart-item__error-text').textContent = message;
    }

    if (this.lineItemStatusElement) {
      this.lineItemStatusElement.setAttribute('aria-hidden', true);
    }

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');

    if (!cartStatus) return;

    cartStatus.setAttribute('aria-hidden', false);
    setTimeout(() => cartStatus.setAttribute('aria-hidden', true), 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector)?.innerHTML || '';
  }

  enableLoading(line) {
    const main = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    if (main) main.classList.add('cart__items--disabled');

    this.querySelectorAll(`#CartItem-${line} .loading__spinner, #CartDrawer-Item-${line} .loading__spinner`).forEach(
      (el) => el.classList.remove('hidden'),
    );

    document.activeElement?.blur();
    if (this.lineItemStatusElement) this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const main = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    if (main) main.classList.remove('cart__items--disabled');

    this.querySelectorAll(`#CartItem-${line} .loading__spinner, #CartDrawer-Item-${line} .loading__spinner`).forEach(
      (el) => el.classList.add('hidden'),
    );
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(routes.cart_update_url, { ...fetchConfig(), body }).then(() =>
              CartPerformance.measureFromEvent('note-update:user-action', event),
            );
          }, ON_CHANGE_DEBOUNCE_TIMER),
        );
      }
    },
  );
}
