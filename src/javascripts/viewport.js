import {
  hypotenuse,
  isHTMLElement,
} from './utils';

export function scrollLeft() {
  return typeof window.pageXOffset === 'number'
    ? window.pageXOffset
    : document.documentElement.scrollLeft
      || document.body.scrollLeft
      || window.scrollX
      || 0;
}

export function scrollTop() {
  return typeof window.pageYOffset === 'number'
    ? window.pageYOffset
    : document.documentElement.scrollTop
      || document.body.scrollTop
      || window.scrollY
      || 0;
}

const VIEWPORT_MODEL_ATTRIBUTES = {
  border: 'none',
  boxSizing: 'border-box',
  display: 'block',
  height: '100vh',
  left: '0',
  maxHeight: '100%',
  maxWidth: '100%',
  padding: '0',
  position: 'fixed',
  top: '0',
  visibility: 'hidden',
  width: '100vw',
  zIndex: '-9999999',
};

let modelElement;
let modelIsReady = false;

let scrollToggleElement = document.body;

let scrollingIsDisabled = false;
let scrollingIsLocked = false;

let scrollX;
let scrollY;

export default class Viewport {
  static setScrollToggleElement(element) {
    scrollToggleElement = (isHTMLElement(element) && !scrollingIsDisabled)
      ? element
      : document.body;
  }

  static get scrollingIsEnabled() {
    return !scrollingIsDisabled;
  }

  static get scrollingIsLocked() {
    return scrollingIsLocked;
  }

  static disableScrolling(isLocked = false, forceHideScrollbar = false) {
    if (scrollingIsDisabled) {
      return;
    }

    let { 
      hasHorizontalScrollBar,
      hasVerticalScrollBar,
    } = this;

    scrollX = scrollLeft();
    scrollY = scrollTop();

    scrollToggleElement.style.overflow = 'hidden';
    scrollToggleElement.style.position = 'fixed';
    scrollToggleElement.style.left = `-${scrollX}px`;
    scrollToggleElement.style.top  = `-${scrollY}px`;

    if (hasHorizontalScrollBar && !forceHideScrollbar) {
      document.documentElement.style.overflowX = 'scroll';
    }

    if (hasVerticalScrollBar && !forceHideScrollbar) {
      document.documentElement.style.overflowY = 'scroll';
    }

    scrollingIsLocked = isLocked;
    scrollingIsDisabled = true;
  }

  static enableScrolling(unlock = false) {
    if (!scrollingIsDisabled) {
      return;
    }

    if (!scrollingIsLocked || (scrollingIsLocked && unlock)) {
      document.documentElement.style.removeProperty('overflow-x');
      document.documentElement.style.removeProperty('overflow-y');

      scrollToggleElement.style.removeProperty('overflow');
      scrollToggleElement.style.removeProperty('position');
      scrollToggleElement.style.removeProperty('left');
      scrollToggleElement.style.removeProperty('top');

      window.scrollTo(scrollX, scrollY);

      scrollingIsLocked = false;
      scrollingIsDisabled = false;
    }
  }

  static scrollTo(left, top) {
    if (scrollingIsDisabled) {
      scrollX = left;
      scrollY = top;

      scrollToggleElement.style.left = `-${left}px`;
      scrollToggleElement.style.top  = `-${top}px`;
    } else {
      window.scrollTo(left, top);
    }
  }

  // @model_properties
  static get hasHorizontalScrollBar() {
    return window.innerHeight > document.documentElement.scrollHeight;
  }

  static get hasVerticalScrollBar() {
    return window.innerWidth > document.documentElement.scrollWidth;
  }

  static get centerPoint() {
    this.createModel();

    return {
      x: this.centerX,
      y: this.centerY,
    };
  }

  static get centerX() {
    this.createModel();
    return modelElement.offsetWidth / 2;
  }

  static get centerY() {
    this.createModel();
    return modelElement.offsetHeight / 2;
  }

  static get width() {
    this.createModel();
    return modelElement.offsetWidth;
  }

  static get height() {
    this.createModel();
    return modelElement.offsetHeight;
  }

  static get diagonal() {
    this.createModel();
    return hypotenuse(
      modelElement.offsetWidth,
      modelElement.offsetHeight,
    );
  }

  static get documentWidth() {
    const { body } = document;
    const html = document.documentElement;
    return Math.max(
      body.scrollWidth,
      body.offsetWidth, 
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth,
    );
  }

  static get documentHeight() {
    const { body } = document;
    const html = document.documentElement;
    return Math.max(
      body.scrollHeight,
      body.offsetHeight, 
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    );
  }

  static getHorizontalPageScrollPercentage() {
    return (scrollLeft() / this.documentWidth) * 100;
  }

  static getVerticalPageScrollPercentage() {
    return (scrollTop() / this.documentHeight) * 100;
  }

  // Model

  static get modelElement() {
    this.createModel();
    return modelElement;
  }

  static get modelIsReady() {
    return modelIsReady;
  }

  static get modelIsCreated() {
    return isHTMLElement(modelElement);
  }

  static createModel() {
    if (!modelIsReady) {
      modelElement = document.createElement('DIV');
      document.body.appendChild(modelElement);
      Object.assign(modelElement.style, VIEWPORT_MODEL_ATTRIBUTES);
      modelIsReady = true;
    }

    return this;
  }

  static destroyModel() {
    if (modelIsReady) {
      document.body.removeChild(modelElement);
      modelElement.remove();
      modelIsReady = false;
    }

    return this;
  }
}
