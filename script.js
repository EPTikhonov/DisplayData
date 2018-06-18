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
  var combinedChartData = [];
  var quickSummaryData = [];
  var xAxesLabel = "";
  var yAxesLabel = "";
  var chartTitle = "";
  var chartType = "";
  var chart;

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

  function handleFiles(files) {
    // Check for the various File API support.
    if (window.FileReader) {
      // FileReader is supported.
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

  // takes in the file
  function loadHandler(event) {
    var csv = event.target.result;
    processData(csv);
  }

  // takes csv and splits the text into an array
  function processData(csv) {
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    while (allTextLines.length) {
      lines.push(allTextLines.shift().split(','));
    }
    getData(lines);
  }

  // error for if file is not csv
  function errorHandler(evt) {
    if (evt.target.error.name == "NotReadableError") {
      alert("Cannot read file!");
    }
  }

  // getting data from file, setting values for x & y dropdown menues, and calculating quick summary info
  function getData(lines) {
    var dropDownList = "";
    // if columns are not empty (undefined), add items in x & y dropdown
    if (lines[0].length !== undefined) {
      for (var i = 0; i < lines[0].length; i++) {
        dropDownList += "<li><a href = \"#\">" + lines[0][i] + "</a></li>";
      }
    } else {
      console.log("dataset does not contains any columns");
    }
    // display columns in each dropdown menu
    $('#XListItems').html(dropDownList);
    $('#YListItems').html(dropDownList);
    $('#selectListItems').html(dropDownList);

    // if x dropdown has been clicked/assigned a value
    if (xDropDownIndexClicked !== null) {
      var xCurrentData = []; // new empty arrays each time dropdown is clicked
      var xNumRows = (lines.length - lines[xDropDownIndexClicked].length);
      // add all values from each row into a xCurrentData array
      for (var x = 0; x < xNumRows; x++) {
        xCurrentData.push(lines[x + 1][xDropDownIndexClicked]);
      }
      xData = xCurrentData.map(Number); // change from String to numbers
      xData.sort(function (a, b) { // sort from least to greatest
        return a - b;
      });
    }

    // if y dropdown has been clicked/assigned a value
    if (yDropDownIndexClicked !== null) {
      var yCurrentData = []; // new empty arrays each time dropdown is clicked
      var yNumRows = (lines.length - lines[yDropDownIndexClicked].length);
      // add all values from each row into a yCurrentData array
      for (var y = 0; y < yNumRows; y++) {
        yCurrentData.push(lines[y + 1][yDropDownIndexClicked]);
      }
      yData = yCurrentData.map(Number); // change from String to numbers
      yData.sort(function (a, b) { // sort from least to greatest
        return a - b;
      });
    }

    // if both x & y dropdown's have been clicked/assigned a value
    if ((xDropDownIndexClicked !== null) && (yDropDownIndexClicked !== null)) {
      var currentData = []; // new empty arrays each time dropdown is clicked
      // put x and y into small arrays in one larger array as final data for the chart
      for (var a = 0; a < xData.length; a++) {
        currentData.push([xData[a], yData[a]]);
      }
      combinedChartData = currentData;
    }

    if (quickSummaryIndexClicked !== null) {
      var quickSummaryCurrentData = [];
      var quickSummaryNumRows = (lines.length - lines[quickSummaryIndexClicked].length);

      for (var z = 0; z < quickSummaryNumRows; z++) {
        quickSummaryCurrentData.push(lines[z + 1][quickSummaryIndexClicked]);
      }

      quickSummaryData = quickSummaryCurrentData.map(Number);

      quickSummaryData.sort(function (a, b) {
        return a - b;
      }); // sorting numbers from least to greatest without turning to string from sort method

      var total = 0; // used for getting mean
      var median = 0; // used for getting median

      var mode = null,
        modeMap = {},
        maxElement = quickSummaryData[0],
        maxCount = 1; // used for getting mode(s)

      quickSummaryData.forEach(function (currentItem) {
        total += currentItem; // for getting the mean

        // if array length is divisable by 2, median = (num1 + num2) / 2
        if (quickSummaryData.length % 2 === 0) {
          median = (quickSummaryData[quickSummaryData.length / 2 - 1] + quickSummaryData[quickSummaryData.length / 2]) / 2;
        } else { // median = num / 2
          median = quickSummaryData[(quickSummaryData.length - 1) / 2];
        }

        // getting mode(s)
        for (var i = 0; i < quickSummaryData.length; i++) {
          var element = quickSummaryData[i];
          if (modeMap[element] == null)
            modeMap[element] = 1;
          else
            modeMap[element]++;

          if (modeMap[element] > maxCount) {
            maxElement = element;
            maxCount = modeMap[element];
          } else if (modeMap[element] == maxCount) {
            maxElement += ', ' + element;
            maxCount = modeMap[element];
          }
          mode = maxElement;
        }

        // from an object to an array of values, to a set
        var modeMapSet = new Set(Object.values(modeMap));

        // if modeMap elements are all equal, set mode to N/A
        if (modeMapSet.size == 1) { // if modeMapSet size is 1, then all values are equivalent
          mode = "N/A";
        }
      });

      $('#min').html(Math.min.apply(null, quickSummaryData));
      $('#median').html(median.toFixed(2));
      $('#max').html(Math.max.apply(null, quickSummaryData));
      $('#mean').html((total / quickSummaryData.length).toFixed(2));
      $('#mode').html(mode);
      $('#numOfRows').html(quickSummaryNumRows);

      quickSummaryIndexClicked = null;
    }
  }
  // resetting quick summary info when upload button is clicked
  $('#upload_button').on('click', function () {
    $('#selectBtnTitle').html("select");
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
    var index = $('a').index(this) - 4;
    xDropDownIndexClicked = index;
    xAxesLabel = $(this).text(); // get x axis label
    handleFiles(file);
  });

  // get index of list items from y dropdown menu
  $('#YListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 6;
    yDropDownIndexClicked = index;
    yAxesLabel = $(this).text(); // get y axis label
    handleFiles(file);
  });

  $('#selectListItems').on('click', 'a', function () {
    // get clicked index
    var index = $('a').index(this) - 12;
    quickSummaryIndexClicked = index;

    $('#selectBtnTitle').html($(this).text()); // change button text to what item was clicked/selected from dropdown menu
    handleFiles(file);
  });

  // chart dropdown
  $('#chartTypeItems').on('click', 'a', function () {
    chartType = $(this).text() + "Chart";
  });

  // displays updated chart and shows download button
  $('#go').on('click', function () {
    chartTitle = document.getElementById("chartTitleInput").value; // get current value of title input
    updateChart(); //  updates from global variables
    $('#downloadChart').show(); // dispays download chart button when go button is clicked
  });

  function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('number');
    data.addColumn('number');

    data.addRows(
      combinedChartData
    );

    var options = {
      title: chartTitle,
      legend: 'none',
      crosshair: {
        trigger: 'both'
      },
      hAxis: {
        title: xAxesLabel
      },
      vAxis: {
        title: yAxesLabel
      }
    };

    chart = new google.visualization[chartType](document.getElementById('canvas'));

    // when the chart is ready, get the Image's url and set to href of the download link
    google.visualization.events.addListener(chart, 'ready', function () {
      $('#downloadChart').attr('href', chart.getImageURI());
    });

    chart.draw(data, options);
  }

  function updateChart() {
    google.charts.load('current', {
      packages: ['corechart', 'line']
    });
    google.charts.setOnLoadCallback(drawChart);
  }
});