/*jslint devel: true, browser: true */
/*global $*/
$(function () {
  "use strict";

  /*
  // get file from import button
  $("#export_button").click(function (e) {
    //e.preventDefault();
    var test = $("#datasetFile").trigger('click');
    console.log(test);
  });

  $("#export_button").click(function (e) {

    $("#canvas").get(0).toBlob(function (blob) {
      saveAs(blob, "chart_1.png");
    });
  });

});
*/

// config object for chart
var config = {
  type: "bar",
  data: {
    labels: ["1st class", "2nd class", "3rd class"],
    datasets: [{
      label: "Survivors",
      data: [
        323, 277, 709
      ],
      backgroundColor: ["blue", "green", "red", ]
    }]
  },
  options: {
    title: {
      display: true,
      text: "Number of Survivors in Pclass",
      fontSize: 20,
    },
    legend: {
      display: true, // make false if bar
      position: "bottom"
    },
    chartArea: {
      backgroundColor: 'white'
    }
  }
};

var myChart;

// creating backgroundColor option for chart
Chart.pluginService.register({
  beforeDraw: function (chart, easing) {
    if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
      var helpers = Chart.helpers;
      var ctx = chart.chart.ctx;
      var chartArea = chart.chartArea;

      ctx.save();
      ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    }
  }
});

// chart title input
var chartTitle = document.getElementById("chartTitleInput");

chartTitle.addEventListener("keyup", function (e) {
  if (e.keyCode === 13) {
    var input = chartTitle.value;
    changeChartTitle(input);
  }
});

// chart dropdown
$("#doughnut").click(function () {
  changeChartType('doughnut');
});
$("#pie").click(function () {
  changeChartType('pie');
});
$("#bar").click(function () {
  changeChartType('bar');
});
$("#line").click(function () {
  changeChartType('line');
});

// col dropdown



// row dropdown

function changeChartType(newType) {
  var ctx = document.getElementById("canvas").getContext("2d");

  // Remove the old chart and all its event handles
  if (myChart) {
    myChart.destroy();
  }

  var temp = jQuery.extend(true, {}, config);
  temp.type = newType;
  myChart = new Chart(ctx, temp);
}

function changeLabel1(newLabel) {
  var ctx = document.getElementById("canvas").getContext("2d");

  // Remove the old chart and all its event handles
  if (myChart) {
    myChart.destroy();
  }

  var temp = jQuery.extend(true, {}, config);
  temp.data[1].labels = newLabel;
  myChart = new Chart(ctx, temp);
}

function changeLabel2(newLabel2) {
  var ctx = document.getElementById("canvas").getContext("2d");

  // Remove the old chart and all its event handles
  if (myChart) {
    myChart.destroy();
  }

  var temp = jQuery.extend(true, {}, config);
  temp.data[1].datasets[0].label = newLabel2;
  myChart = new Chart(ctx, temp);
}

function changeChartTitle(newTitle) {
  var ctx = document.getElementById("canvas").getContext("2d");

  // Remove the old chart and all its event handles
  if (myChart) {
    myChart.destroy();
  }

  var temp = jQuery.extend(true, {}, config);
  temp.options.title.text = newTitle;
  myChart = new Chart(ctx, temp);
}

function importDataset() {

  var dataset = $("#import_operation")[0].files[0];

  var reader = new FileReader();

  reader.onload = function (e) {
    // put into SQL database
    var test = JSON.parse(e.target.result);
    console.log(test);
  };

  reader.readAsText(json);
}


});