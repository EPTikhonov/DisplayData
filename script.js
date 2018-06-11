/*jslint devel: true, browser: true */
/*global $*/
$(function () {
  "use strict";

  var xDropDownIndexClicked = null;
  var yDropDownIndexClicked = null;
  var quickSummaryIndexClicked = null;
  var file = null;
  var xData = [];
  var yData = [];
  var quickSummaryData = [];
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
    //console.log("lines: "+lines);
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
    // if columns are not empty (undefined), add items in x & y dropdown
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
    $('#selectListItems').html(list);

    if (xDropDownIndexClicked !== null) {
      var xCurrentData = []; // new empty arrays each time dropdown is clicked
      var xNumRows = (lines.length - lines[xDropDownIndexClicked].length);
      for (var x = 0; x < xNumRows; x++) {
        xCurrentData.push(lines[x + 1][xDropDownIndexClicked]);
      }
      xData = xCurrentData.map(Number);
    }

    if (yDropDownIndexClicked !== null) {
      var yCurrentData = []; // new empty arrays each time dropdown is clicked
      var yNumRows = (lines.length - lines[yDropDownIndexClicked].length);
      for (var y = 0; y < yNumRows; y++) {
        yCurrentData.push(lines[y + 1][yDropDownIndexClicked]);
      }
      yData = yCurrentData.map(Number);
    }



    if (quickSummaryIndexClicked !== null) {
      var quickSummaryCurrentData = [];
      var quickSummaryNumRows = (lines.length - lines[quickSummaryIndexClicked].length);

      // lines[0][1], the 0 is the index (column) clicked (get this)
      for (var z = 0; z < quickSummaryNumRows; z++) {
        quickSummaryCurrentData.push(lines[z + 1][quickSummaryIndexClicked]);
      }

      quickSummaryData = quickSummaryCurrentData.map(Number);

      var total = 0;
      var median = 0;

      quickSummaryData.sort(function (a, b) {
        return a - b
      }); // sorting numbers from least to greatest without turning to string from sort method
      quickSummaryData.forEach(function (data) {
        total += data;

        if (quickSummaryData.length % 2 === 0) {
          median = (quickSummaryData[quickSummaryData.length / 2 - 1] + quickSummaryData[quickSummaryData.length / 2]) / 2;
        } else {
          median = quickSummaryData[(quickSummaryData.length - 1) / 2];
        }
      });

      $('#min').html(Math.min.apply(null, quickSummaryData));
      $('#median').html(median.toFixed(2));
      $('#max').html(Math.max.apply(null, quickSummaryData));
      $('#mean').html((total / quickSummaryData.length).toFixed(2));
      $('#range').html(quickSummaryData[0] + " - " + quickSummaryData[quickSummaryData.length - 1]);
      console.log(quickSummaryData);
      $('#numOfRows').html(quickSummaryNumRows);

      quickSummaryIndexClicked = null;
    }
  }

  // config object for chart
  var config = {
    type: chartType,
    data: {
      //labels: [],
      datasets: [{
        //label: "",
        data: [],
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
          display: true,
          scaleLabel: {
            display: true,
            labelString: ""
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: ""
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

  $('#upload_button').on('click', function () {
    $('#selectBtnTitle').html("select");
    // resetting quick summary calculations
    $('#min').html("");
    $('#median').html("");
    $('#max').html("");
    $('#mean').html("");
    $('#range').html("");
    $('#numOfRows').html("");
  });

  // get index of list items from x dropdown menu
  $('#XListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 2;
    xDropDownIndexClicked = index;
    xAxesLabel = $(this).text(); // get x axis label
    handleFiles(file);
  });

  // get index of list items from y dropdown menu
  $('#YListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 4;
    yDropDownIndexClicked = index;
    yAxesLabel = $(this).text(); // get y axis label
    handleFiles(file);
  });

  $('#selectListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 11;
    quickSummaryIndexClicked = index;

    $('#selectBtnTitle').html($(this).text()); // change button text to what item was clicked/selected from dropdown menu
    handleFiles(file);
    // when upload is clicked again then reset all values to  nothing
  });

  // chart dropdown
  $('#chartTypeItems').on('click', 'a', function () {
    chartType = $(this).text();
  });

  // displays final chart
  $('#go').on('click', function () {
    chartTitle = document.getElementById("chartTitleInput").value; // get current value of title input
    updateChart(); //  updates from global variables
    $('#downloadChart').show(); // dispays download chart button when go button is clicked
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
    temp.data.datasets[0].data = xData;
    temp.options.scales.xAxes[0].scaleLabel.labelString = xAxesLabel;
    temp.options.scales.yAxes[0].scaleLabel.labelString = yAxesLabel;
    //yAxesLabel
    //temp.data.data = yData;

    myChart = new Chart(ctx, temp);
  }

});