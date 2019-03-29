if (!anychart['anychart-freeboard']) {
  /**
   * Global anychart object
   */
  var ac;

  anychart['anychart-freeboard'] = function(settings){
    var ac = anychart;
    var self = this;

    var currentSettings = settings;
    var container;

    var chart;
    var dataSet = ac.data.set();

    var editor;
    var editorOptions = {
      run: false,
      complete: false,
      measuresCount: -1,
      customized: false
    };

    self.render = function(element) {
      container = element;

      self.drawChart();

      var dataRow = dataSet.row(0);
      if (dataRow) {
        var measuresCount = dataRow.length;
        if (!editorOptions.customized && editorOptions.measuresCount !== measuresCount) {
          self.rebuildChart(true);
          editorOptions.measuresCount = measuresCount;
        }
      }
    };

    self.drawChart = function() {
      if (!currentSettings.chart_code)
        return;

      if (chart)
        chart.dispose();

      var codeSplit = currentSettings.chart_code.split(/\/\*=rawData.+rawData=\*\//);
      if (codeSplit.length === 2) {
        // Chart creation code part
        var code1 = '(function(){' + codeSplit[0] + 'return chart;})();';

        // Data apply and chart settings code part
        var code2 = '(function(){ return function(chart, dataSet){' + codeSplit[1] + '}})();';

        // Create chart instance
        chart = eval(code1);

        anychart.theme(anychart.themes[currentSettings.theme]);
        anychart.appendTheme(anychart.themes.freeboard);

        if (!chart) return null;

        // Invoke second part of code: pass data and apply chart appearance settings
        var code2func = eval(code2);
        code2func.apply(null, [chart, dataSet]);

        chart['container'](container);
        chart['draw']();
      }
    };

    self.initEditor = function(opt_dropOldChart) {
      if (!editor) {
        editor = ac['editor'](currentSettings.chart_type);
        editor.step('data', false);
        editor.step('chart', false);
        editor.step('export', false);
        editor.data({data: dataSet});

        if (!opt_dropOldChart && currentSettings.editor_model)
          editor.deserializeModel(currentSettings.editor_model);
      }
    };

    self.saveEditorState = function(opt_saveCode, opt_customized) {
      editorOptions.run = false;

      if (opt_saveCode) {
        currentSettings.chart_code = editor['getJavascript']({
          'minify': true,
          'addData': false,
          'addMarkers': true,
          'wrapper': '',
          'container': ''
        });
        currentSettings.editor_model = editor['serializeModel']();

        editorOptions.customized = opt_customized ? 1 : editorOptions.customized;

        var dataRow = dataSet.row(0);
        editorOptions.measuresCount = dataRow.length;
      }
      editor['removeAllListeners']();
      editor['dispose']();
      editor = null;
    };

    self.rebuildChart = function(opt_dropOldChart) {
      self.initEditor(opt_dropOldChart);
      self.saveEditorState(true);
      self.render(container);
    };

    self.openEditorDialog = function() {
      self.initEditor();

      editor['dialogRender']();
      editor['dialogVisible'](true);

      currentSettings.complete = false;
      editor['listenOnce']('editorComplete', function() {
        self.saveEditorState(true, true);
        currentSettings.complete = true;
        editor['dialogVisible'](false, true);
      });

      editor['listenOnce']('editorClose', function(evt) {
        if (!currentSettings.complete && evt.target == editor)
          self.saveEditorState();
      });
    };

    self.onCalculatedValueChanged = function(settingName, newValue) {
      switch (settingName) {
        case 'data_source': {
          dataSet.append(newValue);
          if (dataSet.getRowsCount() > currentSettings.max_points)
            dataSet.remove(0);
          break;
        }
      }

      if (!currentSettings.chart_code)
        self.render(container);
    };

    self.onSettingsChanged = function(newSettings) {
      var previousSettings = typeof currentSettings === 'object' ? Object.assign(currentSettings) : currentSettings;
      currentSettings = newSettings;

      if (previousSettings.theme !== currentSettings.theme) {
        anychart.theme(anychart.themes[currentSettings.theme]);
        anychart.appendTheme(anychart.themes.freeboard);
      }

      if (newSettings.run_editor && freeboard.isEditing()) {
        editorOptions.run = true;
      } else {
        self.drawChart();
      }

      if (previousSettings.max_points !== newSettings.max_points) {
        newSettings.max_points = newSettings.max_points > 0 ? newSettings.max_points : previousSettings.max_points;
        var rowsToRemove = dataSet.getRowsCount() - newSettings.max_points;
        for (; rowsToRemove > 0; rowsToRemove--) {
          dataSet.remove(0);
        }
      }

      //self.render(container);
    };

    self.getHeight = function() {
      var size = Number(currentSettings.size);
      return !isNaN(size) ? size : 2;
    };

    self.onDispose = function() {
      if (chart) {
        chart.dispose();
        dataSet.dispose();
      }
    };
  }
}