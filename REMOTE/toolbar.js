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

    /**
     * @type {?string}
     * @private
     */
    this.dashboardId_ = null;

    /**
     *
     * @type {Object}
     */
    this.licenseStatus_ = {};
  }


  setStatus(dashboardId, licenseStatus) {
    this.dashboardId_ = dashboardId;
    this.licenseStatus_ = licenseStatus;
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
    return this.element.parent().find('.board-toolbar');
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
    let content = '';
    // switch (this.licenseStatus_.license) {
    //   case 'expired':
    //     break;
    //   case 'invalid':
    //     break;
    // }
    let contentHtml = '<p>License status: <b>' + this.licenseStatus_.license + '</b></p>';
    if (this.licenseStatus_.message) {
      contentHtml += '<p>Message: ' + this.licenseStatus_.message + '</p>';
    }

    // todo: debug
    // this.dashboardId_ = this.dashboardId_ || 'lhDktD';
    //
    contentHtml += `
<div id="about-message"><span class="text"></span></div>
<form id="ac-activation-form">
    <input id="code" class="ac-input" maxlength="32" placeholder="Paste your activation code">
    <div class="ac-buttons">
        <button id="activate" name="activate" type="submit" class="ac-btn primary">Activate</button>
        <a id="buy" class="ac-btn warning" target="_blank" href="https://www.anychart.com/technical-integrations/samples/qlik-charts/buy/?utm_source=qlik-buy">Buy</a>
    </div>
</form>
<script>
  const form = document.querySelector('#ac-activation-form');
  const input = form.code;
  const about = document.getElementById('about-message');
  
  function setMessage(txt, error = false) {
    about.classList.remove(error ? 'success' : 'error');
    about.classList.add(error ? 'error' : 'success');
    about.children[0].innerText = txt;
  }

  input.addEventListener('input', function() {
    setMessage('');
  });
  
  form.addEventListener('submit', sendCode);


function sendCode(e) {
   e.preventDefault();
  
  const code = input.value;
  if (code.length === 32) {
    const requestBody = 'dashboardId=${this.dashboardId_}&activationCode=' + code;
    fetch('https://www.anychart.com/licenses-checker/fblink', {
      method: 'POST',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      body: requestBody
    })
    .then(r => r.json())
    .then(r => {
      setMessage(r.message, true);
    });
    
  } else {
      setMessage('Invalid activation code length', true);
  }
}
</script>
`;

    content = $(contentHtml);

    return new DialogBox(content, "Anychart License", "Ok", null, this.getDialogOkCallback());
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