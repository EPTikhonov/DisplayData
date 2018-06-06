/*jslint devel: true, browser: true */
/*global $*/
$(function () {
  "use strict";

  var xDropDownIndexClicked = null;
  var yDropDownIndexClicked = null;
  var file = null;
  var xData = [];
  var yData = [];
  var xAxesLabel = "";
  var yAxesLabel = "";
  var chartTitle = "";
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
    getData(lines);
  }

  function errorHandler(evt) {
    if (evt.target.error.name == "NotReadableError") {
      alert("Cannot read file!");
    }
  }

  // getting data from file and adding column values to x & y dropdown menus
  function getData(lines) {
    var list = "";
    // if columns are not empty (undefined)
    if (lines[0].length !== undefined) {
      for (var i = 0; i < lines[0].length; i++) {
        list += "<li><a href = \"#\">" + lines[0][i] + "</a></li>";
      }
    } else {
      console.log("dataset does not contains any columns");
    }
    // display columns in each dropdown menu
    $('#XListItems').html(list);
    $('#YListItems').html(list);

    // if x or y drop down menu has been assigned/clicked, then change data in chart
    if ((xDropDownIndexClicked !== null) && (xDropDownIndexClicked !== null)) {
      // new empty arrays each time dropdown is clicked
      var xCurrentData = [];
      var yCurrentData = [];

      for (var a = 0; b < lines.length - 2; b++) {
        xCurrentData.push(lines[a + 1][xDropDownIndexClicked - 1]);
      }
      for (var b = 0; b < lines.length - 2; b++) {
        yCurrentData.push(lines[b + 1][yDropDownIndexClicked - 1]);
      }
      xData = xCurrentData;
      console.log("xData: " + xCurrentData);
      yData = yCurrentData;
      console.log("yData: " + yCurrentData);
    }
  }

  // config object for chart
  var config = {
    type: chartType,
    data: {
      labels: [],
      datasets: [{
        label: /*"Survivors"*/ "",
        data: /*XData*/ [0, 3, 5],
        //backgroundColor: ["blue", "green", "red", ]

      }]
    },
    options: {
      title: {
        display: true,
        text: chartTitle,
        fontSize: 20,
      },
      scales: {
        xAxes: [{
          //display: true,
          scaleLabel: {
            //display: true,
            labelString: xAxesLabel
          }
        }],
        yAxes: [{
          display: false,
          scaleLabel: {
            display: false,
            labelString: yAxesLabel
          }
        }]
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

  // get index of list items from x dropdown menu
  $('#XListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 3;
    xDropDownIndexClicked = index;
    alert(xDropDownIndexClicked);
    xAxesLabel = $(this).text(); // get x axis label
  });

  // get index of list items from y dropdown menu
  $('#YListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 3;
    yDropDownIndexClicked = index;
    alert(yDropDownIndexClicked);
    yAxesLabel = $(this).text(); // get y axis label
  });

  // chart dropdown
  $('#chartTypeItems').on('click', 'a', function () {
    chartType = $(this).text();
  });

  // displays final chart
  $('#go').on('click', function () {
    chartTitle = document.getElementById("chartTitleInput").value; // get current value of title input
    updateChart(); //  updates from global variables
  });

  function updateChart() {
    var ctx = document.getElementById("canvas").getContext("2d");

    // Remove the old chart and all its event handles
    if (myChart) {
      myChart.destroy();
    }

    var temp = jQuery.extend(true, {}, config);

    temp.type = chartType;
    temp.options.title.text = chartTitle; // TODO: into text?
    temp.data.data = xData /*.map(Number)*/ ;
    console.log(xData);
    //temp.data.data = yData /*.map(Number)*/ ;

    myChart = new Chart(ctx, temp);
  }

});