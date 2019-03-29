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
      run: true,
      complete: false
    };

    self.render = function(element) {
      container = element;
      if (currentSettings.chart_code)
        self.drawChart();
    };

    self.drawChart = function() {
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

        anychart.theme(anychart.themes[settings.theme]);
        anychart.appendTheme(anychart.themes.freeboard);

        if (!chart) return null;

        // Invoke second part of code: pass data and apply chart appearance settings
        var code2func = eval(code2);
        code2func.apply(null, [chart, dataSet]);

        chart['container'](container);
        chart['draw']();
      }
    };

    self.runEditor = function() {
      if (!editor) {
        editorOptions.run = false;
        editor = ac['editor'](currentSettings.chart_type);
        editor.deserializeModel(currentSettings.editor_model);
        editor.step('data', false);
        editor.step('chart', false);
        editor.step('export', false);
        editor.data({data: dataSet});

        editor.listen('editorComplete', function() {
          // Get javascript code that creates configured chart
          currentSettings.chart_code = editor['getJavascript']({
            'minify': true,
            'addData': false,
            'addMarkers': true,
            'wrapper': '',
            'container': ''
          });

          currentSettings.editor_model = editor.serializeModel();

          editorOptions.complete = true;
          self.closeEditor();
        });

        editor.listen('close', function(evt) {
          if (!editorOptions.complete && evt.target === editor)
            self.closeEditor();
        });

        editorOptions.complete = false;
        editor.dialogRender();
        editor.dialogVisible(true, 'anychart-ce-freeboard-dialog');
      }
    };

    self.closeEditor = function() {
      editor.dispose();
      editor.removeAllListeners();
      editor = null;

      if (editorOptions.complete)
        self.drawChart();
    };

    self.onCalculatedValueChanged = function(settingName, newValue) {
      switch (settingName) {
        case 'data_source': {
          dataSet.append(newValue);
          if (dataSet.getRowsCount() > currentSettings.max_points)
            dataSet.remove(0);

          if (editorOptions.run) {
            if (freeboard.isEditing())
              self.runEditor();
            else
              editorOptions.run = false;
          }
          break;
        }
      }
    };

    self.onSettingsChanged = function(newSettings) {
      // console.log(currentSettings, newSettings);
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