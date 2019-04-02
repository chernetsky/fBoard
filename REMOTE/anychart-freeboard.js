if (!anychart['anychart-freeboard']) {
  anychart['anychart-freeboard'] = function(settings){
    const ac = window['anychart'];
    const self = this;

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
        currentSettings.chart_code = editor['getJavascript']({
          'minify': true,
          'addData': false,
          'addMarkers': true,
          'wrapper': '',
          'container': ''
        });
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