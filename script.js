/*jslint devel: true, browser: true */
/*global $*/
$(function () {
  "use strict";
  var XDropDownIndexClicked = null;
  var YDropDownIndexClicked = null;
  var file = null;
  var XData = [];
  var YData = [];
  var chartTitleText = "";
  var chartType = "";

  // get file from input and store as variable
  ($('#csvFileInput')).on('change', function () {
    file = this.files;
    handleFiles(file);
  });

  // show selected file name
  $('input[type="file"]').change(function (e) {
    var fileName = e.target.files[0].name;
    $('#fileName').html("Selected: " + fileName);
  });

  // download current chart as png
  $("#downloadChart").click(function () {
    $("#canvas").get(0).toBlob(function (blob) {
      saveAs(blob, "chart.png");
    });
  });

  function handleFiles(files) {
    // Check for the various File API support.
    if (window.FileReader) {
      // FileReader are supported.
      getAsText(files[0]);
    } else {
      alert('FileReader is not supported in this browser.');
    }
  }

  function getAsText(fileToRead) {
    var reader = new FileReader();
    // Handle errors load
    reader.onload = loadHandler;
    reader.onerror = errorHandler;
    // Read file into memory as UTF-8      
    reader.readAsText(fileToRead);
  }

  function loadHandler(event) {
    var csv = event.target.result;
    processData(csv);
  }

  function processData(csv) {
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    while (allTextLines.length) {
      lines.push(allTextLines.shift().split(','));
    }
    addColItems(lines);
  }

  function errorHandler(evt) {
    if (evt.target.error.name == "NotReadableError") {
      alert("Cannot read file!");
    }
  }

  // add column values to x & y dropdown menus
  function addColItems(lines) {
    var list = "";
    // if columns are not empty (undefined)
    if (lines[0].length !== undefined) {
      for (var i = 0; i < lines[0].length; i++) {
        list += "<li><a href = \"#\">" + lines[0][i] + "</a></li>";
      }
    } else {
      console.log("dataset does not contains any columns");
    }
    $('#XListItems').html(list);
    $('#YListItems').html(list); // display columns in dropdown menu

    // if x or y drop down menu has been assigned/clicked, then change data in chart
    if ((XDropDownIndexClicked !== null) && (XDropDownIndexClicked !== null)) {
      var Xdata = [];
      var Ydata = [];
      for (var a = 0; b < lines.length - 2; b++) {
        Xdata.push(lines[a + 1][XDropDownIndexClicked - 1]);
      }
      for (var b = 0; b < lines.length - 2; b++) {
        Ydata.push(lines[b + 1][YDropDownIndexClicked - 1]);
      }
      changeXChartData(Xdata);
      changeYChartData(Ydata);
    }
  }

  // get index of list items from x dropdown menu
  $('#XListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 3;
    XDropDownIndexClicked = index;
    handleFiles(file);
  });

  // get index of list items from y dropdown menu
  $('#YListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 3;
    YDropDownIndexClicked = index;
    handleFiles(file);
  });

  // config object for chart
  var config = {
    type: "bar",
    data: {
      labels: ["1st class"],
      datasets: [{
        label: "Survivors",
        data: /*XData*/ [4, 6, 5],
        //backgroundColor: ["blue", "green", "red", ]
      }]
    },
    options: {
      title: {
        display: true,
        text: chartTitleText,
        fontSize: 20,
      },
      legend: {
        display: true, // make a checkbox for true or false
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

  function changeChartTitle(newTitle) {
    var ctx = document.getElementById("canvas").getContext("2d");

    // Remove the old chart and all its event handles
    if (myChart) {
      myChart.destroy();
    }

    //chartTitleText = newTitle;
    var temp = jQuery.extend(true, {}, config);
    temp.options.title.text = newTitle;
    myChart = new Chart(ctx, temp);
  }

  // TODO: What if data is empty in some areas?
  function changeXChartData(data) {
    var ctx = document.getElementById("canvas").getContext("2d");

    // Remove the old chart and all its event handles
    if (myChart) {
      myChart.destroy();
    }

    var temp = jQuery.extend(true, {}, config);

    XData = data;
    temp.data.data = XData/*.map(Number)*/;
    console.log(temp.data.data);
    myChart = new Chart(ctx, temp);
  }

  function changeYChartData(data) {
    var ctx = document.getElementById("canvas").getContext("2d");

    // Remove the old chart and all its event handles
    if (myChart) {
      myChart.destroy();
    }

    var temp = jQuery.extend(true, {}, config);

    YData = data;
    temp.data.data = YData/*.map(Number)*/;
    console.log(temp.data.data);
    myChart = new Chart(ctx, temp);
  }

});