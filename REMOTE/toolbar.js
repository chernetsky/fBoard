/**
 *
 */
class AcToolbar extends EventTarget {
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
      const ev = self.createEvent(AcToolbar.EventType.AC_SETTINGS_APPLY);
      return !self.dispatchEvent(ev);
    };
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
    const content = $('<h2>Anychart License Text Title</h2>' +
        '<p><a href="http://anychart.com" target="_blank">Lorem Ipsum is simply dummy text</a> of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>' +
        '<p>It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>')

    return new DialogBox(content, "Anychart License Dialog Title", "Ok", null, this.getDialogOkCallback());
  }

  /**
   *
   * @return {Function}
   */
  getSettingsButtonClickCallback() {
    const self = this;
    return (e) => {
      const ev = self.createEvent(AcToolbar.EventType.AC_DIALOG_SHOW, {originalEvent: e});
      if (self.dispatchEvent(ev)) {
        // Show license dialog
        self.getDialog();
      }
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
    const e = this.createEvent(AcToolbar.EventType.AC_WRAP_TOOLS);
    if (this.dispatchEvent(e)) {
      const tools = this.getToolsElement();
      const settingsButton = this.getSettingsButton();
      tools.prepend(settingsButton);
    }
  }

  dispose() {
    this.element = null;
  }
}


/**
 * Anychart settings event types.
 * @enum {string}
 */
AcToolbar.EventType = {
  AC_WRAP_TOOLS: 'acwraptools',
  AC_DIALOG_SHOW: 'acdialogshow',
  AC_SETTINGS_APPLY: 'acsettingsapply'
};