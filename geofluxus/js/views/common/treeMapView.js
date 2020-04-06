define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/d3plus',
        'visualizations/treeMap',
        'collections/collection',
        'app-config',
        'save-svg-as-png',
        'file-saver',
        'utils/utils'
    ],

    function (
        BaseView,
        _,
        d3,
        d3plus,
        TreeMap,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/TreeMapView
         * @augments module:views/BaseView
         */
        var TreeMapView = BaseView.extend(
            /** @lends module:views/TreeMapView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    TreeMapView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    this.options = options;
                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },

                render: function (data) {
                    let flows = this.options.flows;
                    let groupBy;
                    let tooltipConfig = {};

                    // /////////////////////////////
                    // Time dimension
                    if (this.options.dimensions[0][0] == "time") {
                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            groupBy = ["year"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.year
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                ]
                            }

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            groupBy = ["year", "month"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.year
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                ]
                            }
                        }

                        // /////////////////////////////
                        // Space dimension
                    } else if (this.options.dimensions[0][0] == "space") {

                        // Areas:
                        if (!this.options.dimensions.isActorLevel) {
                            groupBy = ["areaName"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.areaName
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                ]
                            }
                        } else {
                            // Actor level
                            groupBy = ["actorName"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.actorName
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                ]
                            }
                        }

                        // /////////////////////////////
                        // Economic Activity dimension
                    } else if (this.options.dimensions[0][0] == "economicActivity") {
                        // Granularity = Activity group
                        if (this.options.dimensions[0][1] == "origin__activity__activitygroup" || this.options.dimensions[0][1] == "destination__activity__activitygroup") {
                            groupBy = ["activityGroupCode"];
                            tooltipConfig = {
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Activity group", function (d) {
                                        return d.activityGroupCode + " " + d.activityGroupName;
                                    }],
                                ]
                            }

                            // Granularity: Activity
                        } else if (this.options.dimensions[0][1] == "origin__activity" || this.options.dimensions[0][1] == "destination__activity") {
                            groupBy = ["activityGroupCode", "activityCode"];
                            tooltipConfig = {
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Activity", function (d) {
                                        return d.activityCode + " " + d.activityName;
                                    }],
                                    ["Activity group", function (d) {
                                        return d.activityGroupCode + " " + d.activityGroupName;
                                    }],
                                ]
                            }
                        }

                        // /////////////////////////////
                        // Treatment method dimension
                    } else if (this.options.dimensions[0][0] == "treatmentMethod") {

                        if (this.options.dimensions[0][1] == "origin__process__processgroup" || this.options.dimensions[0][1] == "destination__process__processgroup") {
                            groupBy = ["processGroupCode"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.processGroupCode
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Treatment method group", function (d) {
                                        return d.processGroupCode + " " + d.processGroupName;
                                    }],
                                ]
                            }

                            // Granularity: Activity
                        } else if (this.options.dimensions[0][1] == "origin__process" || this.options.dimensions[0][1] == "destination__process") {
                            groupBy = ["processGroupCode", "processCode"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.processCode
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Treatment method", function (d) {
                                        return d.processCode + " " + d.processName;
                                    }],
                                    ["Treatment method group", function (d) {
                                        return d.processGroupCode + " " + d.processGroupName;
                                    }],
                                ]
                            }
                        }

                    }

                    // Create a new D3Plus TreeMap object which will be rendered in this.options.el:
                    this.TreeMap = new TreeMap({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
                        tooltipConfig: tooltipConfig,
                    });
                },

                toggleFullscreen: function (event) {
                    this.el.classList.toggle('fullscreen');
                    this.refresh();
                    event.stopImmediatePropagation();
                },

                exportCSV: function (event) {
                    if (!this.transformedData) return;

                    var header = ['Origin', 'Origin Code',
                            'Destination', 'Destination Code',
                            'Amount (t/year)'
                        ],
                        rows = [],
                        _this = this;
                    rows.push(header.join(',\t'));
                    this.transformedData.links.forEach(function (link) {
                        var origin = link.source,
                            destination = link.target,
                            originName = origin.name,
                            destinationName = destination.name,
                            amount = link.value.toFixed(3);

                        var originCode = origin.code,
                            destinationCode = destination.code;

                        var row = ['"' + originName + '",', originCode + ',"', destinationName + '",', destinationCode + ',', amount];
                        rows.push(row.join('\t'));
                    });
                    var text = rows.join('\r\n');
                    var blob = new Blob([text], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");

                    event.stopImmediatePropagation();
                },

                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return TreeMapView;
    }
);