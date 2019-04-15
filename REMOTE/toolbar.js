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
     *
     * @type {Object}
     */
    this.licenseStatus_ = {};
  }


  licenseStatus(value) {
    this.licenseStatus_ = value;
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

    contentHtml += `
<b id="about-message">&nbsp;</b>
<form id="activation">
    <input id="code" class="acqlik-input" maxlength="32" placeholder="Paste your activation code">
    <div class="acqlik-buttons">
        <button id="activate" name="activate" type="submit" class="acqlik-btn primary">Activate</button>
        <a id="buy" class="acqlik-btn warning" target="_blank" href="https://www.anychart.com/technical-integrations/samples/qlik-charts/buy/?utm_source=qlik-buy">Buy</a>
    </div>
</form>
<script>
  const form = document.forms[0];
  const input = form.code;
  
  input.addEventListener('input', function() {
    document.getElementById('about-message').innerText = '&nbsp;';
  });
  
  form.addEventListener('submit', sendCode);

function sendCode(e) {
  function showError(txt){
    document.getElementById('about-message').style.display = "block";
    document.getElementById('about-message').classList.remove('success');
    document.getElementById('about-message').classList.add('error');
    document.getElementById('about-message').innerText = txt;
  }

  e.preventDefault();
  
  const code = input.value;
  if (code.length === 32) {
    const key = document.getElementById('key-value').innerText;
    const body = 'downloadKey=' + key + '&activationCode=' + code + '&chartType={{chartType}}';
    fetch('https://www.anychart.com/licenses-checker/fblink', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: body
    }).then(r => r.json()).then(r => {
      if (r.message.indexOf("can't find") !== -1) {
         showError('Activation failed. Please contact support.');
      }else if (r.message.indexOf("code missing") !== -1) {
        showError('Activation code missing.');
      }else if (r.message.indexOf("successful") !== -1) {
        document.forms[0].style.display = 'none';
        document.getElementById('about-message').style.display = "block";
        document.getElementById('about-message').classList.remove('error');
        document.getElementById('about-message').classList.add('success');
        document.getElementById('about-message').innerText = 'Activation successful. Please reload your page (press Shift+F5).';
      }
    });
  } else {
      showError('Invalid activation code length');
  }
}
</script>
`;

    content = $(contentHtml);

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