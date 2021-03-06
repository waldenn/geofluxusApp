define([
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (D3plusViz, d3plus) {
    /**
     *
     * Bar chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class BarChart extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Bar Chart
         */
        constructor(options) {
            super(options);

            let _this = this;
            var options = options || {};

            // sort data (for months)
            let xSort = options.x != 'monthCode' ? null :  function(a, b) {
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                var res = 0;
                [a, b].forEach(function(t, idx) {
                    var code = t.monthCode,
                        month = months.indexOf(code.substring(0, 3)),
                        year = parseInt(code.substring(3, 8));
                    res += (month + 12 * year) * (-1)**(idx%2);
                })

                return res;
            };


            let groupByValue = options.groupBy ? options.groupBy : null;

            let labelFunction = function (d) {
                if (options.isActorLevel) {
                    return d.actorName
                } else if (groupByValue) {
                    return d[groupByValue];
                } else {
                    return d[options.x]
                }
            }

            let axisConfig = {
                barConfig: {
                    stroke: this.elementColor, // Axis color
                },
                shapeConfig: {
                    stroke: this.elementColor, // Ticks on axis
                    labelConfig: {
                        fontColor: this.elementColor, // Labels on axis
                    }
                }
            }

            new d3plus.Plot()
                // .title(options.tooltipConfig.title)
                .tooltipConfig(options.tooltipConfig)
                .data(options.data)
                .groupBy(groupByValue)
                .x(options.x)
                //.time(options.x)
                .y("amount")
                .baseline(0)
                .discrete("x")
                .xSort(xSort)
                .color(function (d) {
                    return d["color"];
                })
                .select(options.el)
                .label(labelFunction)
                .duration(0)
                .legend(options.hasLegend)
                .xConfig(axisConfig)
                .yConfig(axisConfig)
                .legendConfig({
                    shapeConfig: {
                        labelConfig: {
                            fontColor: this.elementColor,
                        }
                    }
                })
                .shape("Bar")
                .stacked(options.isStacked)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
                })
                .controlPadding(0)
                .loadingHTML(this.loadingHTML)
                .render(function () {
                    _this.addButtons();
                });
        }
    }
    return BarChart;
});