class AnychartTab extends EventTarget {
  /**
   * Constructor.
   * @param {number} index - Tab index.
   * @param {Object=} opt_options - Options.
   */
  constructor(index, opt_options) {
    super();
    this.index = index;
    this.options = opt_options || {};
  }

  getTitle() {
    return this.options.title || `Tab #${this.index}`;
  }

  getContent() {
    return $('<p>Anychart Settings<br/><img src="https://sw.kovidgoyal.net/kitty/_static/kitty.png"></p>');
  }
}


class AnychartSettings extends EventTarget {
  /**
   * Constructor.
   * @param {Element} element - Related dom reference.
   * @param {Object=} opt_options - Options.
   */
  constructor(element, opt_options) {
    super();
    /**
     * Wrapped element.
     * @type {jQuery}
     */
    this.element = $(element);

    /**
     * Options object.
     * @type {Object}
     */
    this.options = opt_options || {};
  }


  /**
   *
   * @return {Function}
   */
  getDialogOkCallback() {
    const self = this;
    return () => {
      const ev = self.createEvent(AnychartSettings.EventType.AC_SETTINGS_APPLY);
      return !self.dispatchEvent(ev);
    };
  }

  /**
   *
   * @return {jQuery|HTMLElement}
   */
  getDialogContent() {
    return $('<p>Anychart Settings</p>');
  }

  /**
   *
   * @return {jQuery}
   */
  getToolsElement() {
    return this.element.closest('li').find('section').find('ul.board-toolbar');
  }

  /**
   *
   * @param {string=} opt_class - White or dark class.
   * @return {jQuery}
   */
  getSettingsButton(opt_class = 'icon-white') {
    const iconWrapper = /** @type {jQuery} */ ($(`<li><i class="icon-cog ${opt_class}"></i></li>`));
    iconWrapper.click(this.getSettingsButtonClickCallback());
    return iconWrapper;
  }

  /**
   *
   * @return {!DialogBox}
   */
  getDialog() {
    return new DialogBox(this.getDialogContent(), "Anychart Settings", "Apply", "Cancel", this.getDialogOkCallback());
  }

  /**
   *
   * @return {Function}
   */
  getSettingsButtonClickCallback() {
    const self = this;
    return (e) => {
      const ev = self.createEvent(AnychartSettings.EventType.AC_DIALOG_SHOW, {originalEvent: e});
      if (self.dispatchEvent(ev))
        self.getDialog();
    }
  }

  /**
   *
   * @param {string} type - Event type.
   * @param {Object=} opt_metaData - Data to be added to event.
   * @param {Object=} opt_eventOptions - Event options (@see https://learn.javascript.ru/dispatch-events).
   * @return {Event}
   */
  createEvent(type, opt_metaData, opt_eventOptions) {
    opt_eventOptions = opt_eventOptions || {cancelable: true}; //Cancelable set as true to use preventDefault() correctly.
    const ev = new Event(type, opt_eventOptions);
    if (opt_metaData) {
      for (let key in opt_metaData) {
        if (opt_metaData.hasOwnProperty(key) && !ev.hasOwnProperty(key)) {
          ev[key] = opt_metaData[key];
        }
      }
    }

    ev['acMessage'] = opt_metaData && opt_metaData['acMessage'] ?
        opt_metaData['acMessage'] :
        `[AnyChart]: Got "${type}" event.`;

    return ev;
  }

  /**
   * Adds settings button.
   */
  wrapFreeboardTools() {
    const e = this.createEvent(AnychartSettings.EventType.AC_WRAP_TOOLS);
    if (this.dispatchEvent(e)) {
      const tools = this.getToolsElement();
      const settingsButton = this.getSettingsButton();
      tools.append(settingsButton);
    }
  }

  render() {
    console.log('TBA');
  }

  dispose() {
    this.removeAllListeners();
    this.element = null;
  }
}


/**
 * Anychart settings event types.
 * @enum {string}
 */
AnychartSettings.EventType = {
  AC_WRAP_TOOLS: 'acwraptools',
  AC_DIALOG_SHOW: 'acdialogshow',
  AC_SETTINGS_APPLY: 'acsettingsapply'
};