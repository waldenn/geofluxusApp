var d3 = require('d3');
var utils = require('utils/utils');

var color = d3.scaleOrdinal(d3.schemeCategory10);
var colorScale = d3.scaleSequential(d3.interpolateSpectral);


module.exports = {

    // loader shown in center of given div as spinning circle when activated
    // options.disable disables given div while loader is active
    Loader: function (div, options) {
        var loaderDiv = document.createElement('div');
        loaderDiv.className = 'loader';
        var backdropDiv = document.createElement('div');
        backdropDiv.className = 'modal-backdrop in';

        this.activate = function (opt) {
            var opt = opt || {};
            loaderDiv.style.top = null;
            if (options != null && options.disable)
                div.classList.add('disabled');
            if (opt.offsetX != null) loaderDiv.style.top = opt.offsetX;
            div.appendChild(loaderDiv);
            div.appendChild(backdropDiv);
        }

        this.deactivate = function () {
            if (options != null && options.disable)
                div.classList.remove('disabled');
            try {
                div.removeChild(loaderDiv);
                div.removeChild(backdropDiv);
            } catch (err) {
                //console.log(err.message)
            }
        }
    },

    // success: function (data, textStatus, jqXHR)
    // error: function(response)
    uploadForm: function (data, url, options) {
        var options = options || {},
            method = options.method || 'POST',
            success = options.success || function () {},
            error = options.error || function () {};
        var formData = new FormData();
        for (var key in data) {
            if (data[key] instanceof Array) {
                data[key].forEach(function (d) {
                    formData.append(key, d);
                })
            } else
                formData.append(key, data[key]);
        }
        $.ajax({
            type: method,
            timeout: 3600000,
            url: url,
            data: formData,
            cache: false,
            dataType: 'json',
            processData: false,
            contentType: false,
            success: success,
            error: error
        });
    },
    colorByName: function (name) {
        name = String(name);
        return color(name.replace(/ .*/, ""));
    },
    toMonthString: function (monthNumber) {
        monthNumber = parseInt(monthNumber) - 1;
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[monthNumber]
    },

    returnD3plusFormatLocale: function () {
        return {
            separator: "",
            suffixes: ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "B", "t", "q", "Q", "Z", "Y"],
            grouping: [3],
            delimiters: {
                thousands: " ",
                decimal: ","
            },
            currency: ["€", ""]
        }
    },

    capitalizeFirstLetter: function (inputString) {
        return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
    },

    calculatePoint: function (i, intervalSize, colorRangeInfo) {
        var {
            colorStart,
            colorEnd,
            useEndAsStart
        } = colorRangeInfo;
        return (useEndAsStart ?
            (colorEnd - (i * intervalSize)) :
            (colorStart + (i * intervalSize)));
    },

    /* Must use an interpolated color scale, which has a range of [0, 1] */
    // interpolateColors: function (dataLength, colorScale, colorRangeInfo) {

    interpolateColors: function (dataLength) {
        const colorRangeInfo = {
            colorStart: 0,
            colorEnd: 1,
            useEndAsStart: false,
        }

        var {
            colorStart,
            colorEnd
        } = colorRangeInfo;
        var colorRange = colorEnd - colorStart;
        var intervalSize = colorRange / dataLength;
        var i, colorPoint;
        var colorArray = [];

        for (i = 0; i < dataLength; i++) {
            colorPoint = this.calculatePoint(i, intervalSize, colorRangeInfo);
            colorArray.push(colorScale(colorPoint));
        }

        return colorArray;
    },

    /**
     * Cuts off a string at a given index
     * 
     * @param {string} string The string to be shortened
     * @param {integer} cutOffPoint The desired amount of characters of the original string to be returned
     */
    textEllipsis: function (string, cutOffPoint) {
        cutOffPoint ? cutOffPoint : 10;
        if (string.length > cutOffPoint)
            return string.substring(0, cutOffPoint) + '...';
        else
            return string;
    },

    scrollToVizRow: function () {
        window.scrollTo({
            top: $(".visualizationRow")[0].getBoundingClientRect().top + window.pageYOffset - 20,
            behavior: 'smooth',
            block: "start",
            inline: "nearest",
        });
    },

    /**
     * Get the center of an array of arrays of coordinates
     *
     * @param {array} data array of arrays of coordinates (first lon, then lat)
     */
    getCenter: function (data, latProp, lonProp) {
        var latXTotal = 0;
        var latYTotal = 0;
        var lonDegreesTotal = 0;

        var lat = latProp ? latProp : 1;
        var lon = lonProp ? lonProp : 0;

        data.forEach((coords) => {
            var lonDegrees = coords[lon];
            var latDegrees = coords[lat];

            var latRadians = (Math.PI * latDegrees) / 180;
            latXTotal += Math.cos(latRadians);
            latYTotal += Math.sin(latRadians);

            lonDegreesTotal += lonDegrees;
        });

        var finalLatRadians = Math.atan2(latYTotal, latXTotal);

        var finalLatDegrees = (finalLatRadians * 180) / Math.PI;
        var finalLonDegrees = lonDegreesTotal / data.length;

        return {
            lat: finalLatDegrees,
            lon: finalLonDegrees,
        };
    }
}