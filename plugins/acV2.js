(function() {
  /**
   * Hide settings fields that are supposed to be hidden
   */
  (function() {
    freeboard.addStyle("#setting-row-chart_code", "display:none");
    freeboard.addStyle("#setting-row-editor_model", "display:none");
    freeboard.addStyle("#setting-row-customized", "display:none");
  })();


  freeboard.loadWidgetPlugin({
    type_name: 'anychart_freeboard_plugin',
    display_name: 'Anychart',
    description: '<strong>AnyChart -- best charting solutions!</strong>',
    external_scripts: [
      'https://cdn.anychart.com/releases/8.5.0/js/anychart-bundle.min.js',
      'https://cdn.anychart.com/releases/8.5.0/fonts/css/anychart-font.min.css',
      '/freeboard/REMOTE/lib/anychart-editor.min.js',
      '/freeboard/REMOTE/lib/anychart-editor.min.css',

      '/freeboard/REMOTE/anychart-freeboard.js',
      '/freeboard/REMOTE/themes-combined.js',
      '/freeboard/REMOTE/toolbar.js',
      '/freeboard/REMOTE/license-checker.js'

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
      {
        name: 'theme',
        display_name: 'Select theme',
        type: 'option',
        default_value: 'defaultTheme',
        options: [
          {
            name: 'Default',
            value: 'defaultTheme'
          },
          {
            name: 'Coffee',
            value: 'coffee'
          },
          {
            name: 'Dark blue',
            value: 'darkBlue'
          },
          {
            name: 'Dark earth',
            value: 'darkEarth'
          },
          {
            name: 'Dark glamour',
            value: 'darkGlamour'
          },
          {
            name: 'Dark provence',
            value: 'darkProvence'
          },
          {
            name: 'Dark turquoise',
            value: 'darkTurquoise'
          },
          {
            name: 'Light blue',
            value: 'lightBlue'
          },
          {
            name: 'Light earth',
            value: 'lightEarth'
          },
          {
            name: 'Light glamour',
            value: 'lightGlamour'
          },
          {
            name: 'Light provence',
            value: 'lightProvence'
          },
          {
            name: 'Light turquoise',
            value: 'lightTurquoise'
          },
          {
            name: 'Monochrome',
            value: 'monochrome'
          },
          {
            name: 'Morning',
            value: 'morning'
          },
          {
            name: 'Pastel',
            value: 'pastel'
          },
          {
            name: 'Sea',
            value: 'sea'
          },
          {
            name: 'Wines',
            value: 'wines'
          }
        ]
      },
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
        name: 'customized',
        type: 'number',
        default_value: 0,
        description: "This field is for widget's internal using purpose"
      }
    ],

    newInstance: function(settings, newInstanceCallback) {
      newInstanceCallback(new window['anychart']['anychart-freeboard'](settings));
    }
  });
}());