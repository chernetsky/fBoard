(function() {
  /**
   * Hide settings fields that are supposed to be hidden
   */
  (function() {
    freeboard.addStyle("#setting-row-chart_code", "display:none");
    freeboard.addStyle("#setting-row-editor_model", "display:none");
    freeboard.addStyle("#setting-row-widget_id", "display:none");
  })();


  freeboard.loadWidgetPlugin({
    type_name: 'anychart_freeboard_plugin',
    display_name: 'Anychart',
    description: '<strong>AnyChart -- best charting solutions!</strong>',
    external_scripts: [
      'https://cdn.anychart.com/releases/8.5.0/js/anychart-bundle.min.js',
      'https://cdn.anychart.com/releases/8.5.0/fonts/css/anychart-font.min.css',
      'http://127.0.0.1:8080/anychart-editor.min.js',
      'http://127.0.0.1:8080/anychart-editor.min.css',
      'http://127.0.0.1:8080/anychart-freeboard.js'
    ],

    fill_size: true,
    settings: [
      {
        name: 'data_source',
        display_name: 'Data source',
        type: 'calculated',
        multi_input: true,
        required: true
      },
      {
        name: 'max_points',
        display_name: 'Maximum points',
        type: 'number',
        default_value: 100
      },
      {
        name: 'chart_type',
        display_name: 'Chart type',
        type: 'option',
        default_value: 'line',
        options: [
          {
            name: 'Line',
            value: 'line'
          },
          {
            name: 'Area',
            value: 'area'
          },
          {
            name: 'Column',
            value: 'column'
          },
          {
            name: 'Scatter',
            value: 'scatter'
          },
          {
            name: 'Pie',
            value: 'pie'
          }
        ]
      },
      {
        name: 'size',
        display_name: 'Size',
        type: 'option',
        default_value: 4,
        options: [
          {
            name: '2',
            value: 2
          },
          {
            name: '3',
            value: 3
          },
          {
            name: '4',
            value: 4
          }
        ]
      },
      // {
      //   name: 'run_editor',
      //   display_name: 'Run editor',
      //   type: 'boolean',
      //   default_value: false,
      //   description: 'Run chart editor after close this dialog'
      // },
      // Hidden fields for widget inner purpose
      {
        name: 'chart_code',
        display_name: 'Chart code',
        type: 'text',
        description: "This field is for widget's internal using purpose"
      },
      {
        name: 'editor_model',
        display_name: 'Editor model',
        type: 'text',
        description: "This field is for widget's internal using purpose"
      },
      {
        name: 'widget_id',
        type: 'text',
        description: "This field is for widget's internal using purpose"
      }
    ],

    newInstance: function(settings, newInstanceCallback) {
      newInstanceCallback(new window['anychart']['anychart-freeboard'](settings));
    }
  });
}());