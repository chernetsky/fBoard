if (!anychart['anychart-freeboard']) {
  freeboard.addStyle(".anychart-credits-text", "color:red;");

  let licenseStatus = {checked: false};
  let dashboardInfo = {};

  const getUserInfo = () => {
    return new Promise((resolve, reject) => {
      if (licenseStatus.checked || typeof dashboardInfo.dashboardId !== 'undefined') {
        resolve(dashboardInfo);

      } else {
        let userInfo = {};
        const startPromise = new Promise((resolve, reject) => resolve(true));
        startPromise
            .then(r => {
              // Try to get dashboard id
              const pathParts = window.location.pathname.split('/');
              if (pathParts.length === 3 && pathParts[1] === 'board') {
                userInfo.dashboardId = pathParts[2];
                return userInfo;
              } else
                throw {};
            })
            .then(r => {
              if (r)
                return fetch("https://freeboard.io/account/settings");
              else
                throw userInfo;
            })
            .then(r => {
              if (r.ok)
                return r.text();
              else
                throw userInfo;
            })
            .then(data => {
              if (data) {
                const domElements = $.parseHTML(data);
                const dataIds = ['data-user', 'data-billing'];
                for (let i = 0; i < domElements.length; i++) {
                  const $page = $(domElements[i]);
                  if (domElements[i].className === 'page') {
                    for (let j = 0; j < dataIds.length; j++) {
                      const dataElement = $page.find('#' + dataIds[j])[0];
                      if (dataElement) {
                        let text = dataElement.text;
                        userInfo = Object.assign(userInfo, JSON.parse(decodeURIComponent(text.replace(/(%2E)/ig, "%20"))));
                      }
                    }
                    break;
                  }
                }
              }
              resolve(userInfo);
            })
            .catch(function(r) {
              resolve(r);
            });
      }
    });
  };

  anychart['anychart-freeboard'] = function(settings){
    const self = this;

    // Check license
    if (!licenseStatus.checked) {
      getUserInfo()
          .then((r) => {
            if (licenseStatus.checked) {
              // Already checked in another instance
              throw true;

            } else if (r || r.dashboardId) {
              dashboardInfo = r;

              // todo: Сделать правильный url
              const licenseUrl = 'https://anychart.com/license_server_url';
              return fetch(licenseUrl);

            } else {
              // User info is invalid
              throw false;
            }
          })
          .then(function(r) {
            if (r.ok)
              return r.json();
            else {
              // Server error
              throw false;
            }
          })
          .catch(function(r) {
            if (r === true) {
              // License already checked
              return licenseStatus;
            } else {
              // If something wrong
              // todo: debug responses here
              // return {license: "valid", daysLeft: 90};
              // Вызывыаем CE
              // Credits убираем

              // return {license: "trial", daysLeft: 108};
              // Вызывыаем CE
              // Credits: Trial

              return {license: "expired", daysLeft: 0};
              // Модальное окно с поле для ввода кода
              // Credits: LICENSE EXPIRED

              // return {license: "invalid", daysLeft: 0};
              // Не совпадают тарифные планы
              // Модальное окно с поле для ввода кода
              // Credits: Trial

              // return {license: "Not processed", daysLeft: 0};
              // Ошибка сервера и т.п.
              // Модальное окно с поле для ввода кода
              // Credits: Trial
            }
          })
          .then(function(r) {
            console.log("Response", r);
            licenseStatus = r;
            licenseStatus.checked = true;
            self.rebuildChart();
          });
    }

    const ac = window['anychart'];
    ac['licenseKey']('qlik3-dbf550c-dca27a7');

    let currentSettings = settings;
    let container;

    const dataSet = ac.data.set();
    let chart;
    let toolbar;

    let editor;
    let editorOptions = {
      measuresCount: -1,
      complete: false
    };


    self.toolbarDialogShowHandler = function(evt) {
      // todo: Check license
      const licenseStatus = true;

      if (licenseStatus) {
        evt.preventDefault();
        self.openEditorDialog();
        return false;
      }
      return true;
    };


    self.render = function(element) {
      if (!toolbar) {
        toolbar = new AcToolbar(element);
        toolbar.wrapFreeboardTools();
        toolbar.addEventListener(AcToolbar.EventType.AC_DIALOG_SHOW, self.toolbarDialogShowHandler);
      }

      container = element;
      self.drawChart();
    };


    self.drawChart = function() {
      if (!currentSettings.chart_code)
        return;

      if (chart)
        chart.dispose();

      ac['theme'](ac['themes'][currentSettings.theme]);
      ac['appendTheme'](ac['themes']['freeboard']);

      const codeSplit = currentSettings.chart_code.split(/\/\*=rawData.+rawData=\*\//);
      if (codeSplit.length === 2) {
        // Chart creation code part
        const code1 = '(function(){' + codeSplit[0] + 'return chart;})();';
        // Data apply and chart settings code part
        const code2 = '(function(){ return function(chart, dataSet){' + codeSplit[1] + '}})();';

        // Create chart instance
        chart = eval(code1);

        if (!chart) return null;

        // Add and configure default datetime scale
        const dateTimeScale = ac['scales']['dateTime']();
        dateTimeScale.ticks().count(5);
        chart['xScale'](dateTimeScale);

        // Invoke second part of code: pass data and apply chart appearance settings
        const code2func = eval(code2);
        code2func.apply(null, [chart, dataSet]);

        chart['container'](container);
        chart['draw']();
      }
    };


    self.initEditor = function(opt_autoChart) {
      if (!editor) {
        editor = ac['editor'](currentSettings.chart_type);
        editor.step('data', false);
        editor.step('chart', false);
        editor.step('export', false);
        editor.data({data: dataSet});

        if (!opt_autoChart && currentSettings.editor_model) {
          editor['deserializeModel'](currentSettings.editor_model);
        }
      }
    };


    self.saveEditorState = function(opt_doNotSave) {
      if (!opt_doNotSave) {
        let overrides = [];
        switch (licenseStatus.license) {
          case 'valid':
            overrides.push({'key': [['chart'], ['settings'], 'credits().enabled()'], 'value': false});
            break;
          case 'expired':
            overrides.push({'key': [['chart'], ['settings'], 'credits().enabled()'], 'value': true});
            overrides.push({'key': [['chart'], ['settings'], 'credits().text()'], 'value': 'ANYCHART EXPIRED LICENSE'});
            overrides.push({'key': [['chart'], ['settings'], 'credits().url()'], 'value': 'https://www.anychart.com/technical-integrations/samples/qlik-charts/buy/?utm_source=qlik-expired'});
            //addCSSRule(document.styleSheets[0], ".anychart-credits-text", "color", "red");
            break;
          default: {
            // trial, invalid, Not processed
            overrides.push({'key': [['chart'], ['settings'], 'credits().enabled()'], 'value': true});
            overrides.push({'key': [['chart'], ['settings'], 'credits().text()'], 'value': 'AnyChart Trial Version'});
            overrides.push({'key': [['chart'], ['settings'], 'credits().url()'], 'value': 'https://www.anychart.com/technical-integrations/samples/qlik-charts/buy/?utm_source=qlik-trial'});
          }
        }

        currentSettings.chart_code = editor['getJavascript']({
          'minify': true,
          'addData': false,
          'addMarkers': true,
          'wrapper': '',
          'container': ''
        }, overrides);
        currentSettings.editor_model = editor['serializeModel']();

        self.render(container);
      }

      editor['removeAllListeners']();
      editor['dispose']();
      editor = null;
    };


    self.rebuildChart = function(opt_autoChart) {
      self.initEditor(opt_autoChart);
      self.saveEditorState();
    };


    self.openEditorDialog = function() {
      self.initEditor();

      editor['dialogRender']();
      editor['dialogVisible'](true);

      editorOptions.complete = false;
      editor['listenOnce']('editorComplete', function() {
        editorOptions.complete = true;
        currentSettings.customized = 1;
        editor['dialogVisible'](false, true);

        self.saveEditorState();
      });

      editor['listenOnce']('editorClose', function(evt) {
        if (!editorOptions.complete && evt.target === editor)
          self.saveEditorState(true);
      });
    };


    self.onCalculatedValueChanged = function(settingName, newValue) {
      switch (settingName) {
        case 'data_source': {
          dataSet.append(newValue);
          if (dataSet.getRowsCount() > currentSettings.max_points)
            dataSet.remove(0);

          const measuresCount = newValue.length;
          if (!currentSettings.customized && editorOptions.measuresCount !== measuresCount) {
            self.rebuildChart(true);
            editorOptions.measuresCount = measuresCount;
          }
          break;
        }
      }

      if (!currentSettings.chart_code)
        self.render(container);
    };


    self.onSettingsChanged = function(newSettings) {
      const previousSettings = typeof currentSettings === 'object' ? Object.assign(currentSettings) : currentSettings;
      currentSettings = newSettings;

      if (previousSettings.max_points !== newSettings.max_points) {
        newSettings.max_points = newSettings.max_points > 0 ? newSettings.max_points : previousSettings.max_points;
        let rowsToRemove = dataSet['getRowsCount']() - newSettings.max_points;
        for (; rowsToRemove > 0; rowsToRemove--) {
          dataSet.remove(0);
        }
      }

      if (previousSettings.theme !== newSettings.theme) {
        self.render(container);
      }

      if (previousSettings.chart_type !== newSettings.chart_type) {
        self.rebuildChart(true);
      }
    };


    self.getHeight = function() {
      const size = Number(currentSettings.size);
      return !isNaN(size) ? size : 2;
    };


    self.onDispose = function() {
      if (toolbar) {
        toolbar.dispose();
      }

      if (chart) {
        chart.dispose();
        dataSet.dispose();
      }
    };
  }
}