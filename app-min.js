// Define Global veriables
var dt = new Date();
var tm = new Date();
var qm = new Date();

var selecteddate;
var tomorrow;
var dayaftertomorrow;

var selectedlocation;
var suntimes;

// Get dates in NL time
$(function(){
  dt = convertToNL(dt);
  tm = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+1);
  qm = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+2);

  selecteddate = dt.getFullYear()+"/"+dt.getMonth()+"/"+dt.getDate();
  tomorrow = tm.getFullYear()+"/"+tm.getMonth()+"/"+tm.getDate();
  dayaftertomorrow = qm.getFullYear()+"/"+qm.getMonth()+"/"+qm.getDate();
})

// Converts local time zone to NL time
function convertToNL(localtime) {
  var UTCDate = Date.UTC(localtime.getUTCFullYear(), localtime.getUTCMonth(), localtime.getUTCDate(),
  localtime.getUTCHours() + 2, localtime.getUTCMinutes(), localtime.getUTCSeconds());
  var NLDate = new Date(UTCDate);
  return NLDate;
};

// Plot the graph when page is being loaded
$(function (){
  plotSelectedLocation();
  var dp = $('.datepicker-here').datepicker({startDate: dt}).data('datepicker');
  dp.selectDate(dt);
})

// Get Date if user changes date
$(function getSelectedDate() {
  $(".datepicker-here").datepicker({
    autoClose: true,
    onSelect: function(dateText, inst) {
      dt = convertToNL(inst);
      selecteddate = dt.getFullYear()+"/"+dt.getMonth()+"/"+dt.getDate();
      var nd = convertToNL(new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+1));
      var dat = convertToNL(new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+2));
      tomorrow = nd.getFullYear()+"/"+nd.getMonth()+"/"+nd.getDate();
      dayaftertomorrow = dat.getFullYear()+"/"+dat.getMonth()+"/"+dat.getDate();
      plotSelectedLocation();
    }
  })
});

// This function creates the table containing the extreme values.
function createTable(urltable){
  $.getJSON(urltable, function(json) {
    var waterstandHWLW = [];
    var watertijd = [];
    var waterdatum = [];

    for (i = 0; i < json.astronomicaltide.values.value.length; i++){
      var datum;
      var dag;

      // Parse the json string to get tide height data
      if(Object.keys(json.astronomicaltide.values.value[i].datetime).length === 2 || Object.keys(json.astronomicaltide.values.value[i].datetime).length === 3){
        var datejson = json.astronomicaltide.values.value[i].datetime.text;
        datum = new Date(datejson.substring(0,4),datejson.substring(4,6)-1,datejson.substring(6,8),datejson.substring(8,10),datejson.substring(10,12));
        dag = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate();
      } else {
        var datejson = json.astronomicaltide.values.value[i].datetime;
        datum = new Date(datejson.substring(0,4),datejson.substring(4,6)-1,datejson.substring(6,8),datejson.substring(8,10),datejson.substring(10,12));
        dag = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate();
      };

      // Only load data of selected date
      if(dag === selecteddate || dag === tomorrow || dag === dayaftertomorrow){
        waterstandHWLW.push(json.astronomicaltide.values.value[i].val);
        watertijd.push(moment(datum).format("HH:mm"));
        waterdatum.push(moment(datum).format("ddd DD"));
      }else{
        //DO NOTIN
      };
    };

    for (var i = 0; i < 8; i++) {
      // Data naar tabel
        document.getElementById("wdata"+i).innerHTML = waterstandHWLW[i];
        document.getElementById("tdata"+i).innerHTML = watertijd[i];
        document.getElementById("ddata"+i).innerHTML = waterdatum[i];
    }
  });
}

// This function creates the graph
function plotSelectedLocation() {
  var waterstand = [];
  var selection = document.getElementById("selectedLocation");
  var title = selection.options[selection.selectedIndex].text;
  var location = selection.options[selection.selectedIndex].value;

  var url = "json/" + location + ".json";
  var urltable = "json/" + location + "hwlw" + ".json";
  createTable(urltable);

  // Load Data
  $.getJSON(url, function(json) {
    suntimes = SunCalc.getTimes(dt,json.series[0].location[0].latitude,json.series[0].location[0].longitude);
    for (i = 0; i < json.series[0].data.length; i++){
      // Parse the json string to get tide height data
      var datum = new Date(json.series[0].data[i].dateTime);
      datum = new Date(datum.getUTCFullYear(),datum.getUTCMonth(),datum.getUTCDate(),datum.getUTCHours(),datum.getUTCMinutes());
      datum = convertToNL(datum);
      var dag = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate();

      // Only load data of selected date
      if(dag === selecteddate || dag === tomorrow){
        waterstand.push([json.series[0].data[i].value]);
      }else{
        //DO NOTIN
      }
    }

    //Remove first and last enteries
    waterstand = waterstand.slice(11,156);

    var now = convertToNL(new Date());
    var currenttime = now.getFullYear()+"/"+now.getMonth()+"/"+now.getDate();

    if(selecteddate === currenttime){
      currenttime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(),now.getMinutes());
    } else {
      currenttime = null;
    }

    // Create chart using highcharts
    $('#chartcontainer').highcharts({
      chart: {
          type: 'spline' //Smooth lijntje
      },
      title: {
          text: "Astronomisch Getij"
      },
      subtitle: {
        text: title
      },

      xAxis:{
        type: 'datetime',
        tickInterval: 3600*1000,
        gridLineWidth: 1,
        plotBands: [{
        color: "#dddddd", // Color value
        from: Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(),0,0), // Start of the plot band
        to: convertToNL(suntimes.sunrise), // End of the plot band
      },{
        color: "#dddddd", // Color value
        from: convertToNL(suntimes.sunset),
        to: Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(),24,0),
      }],
      plotLines:[{
        color: "#FF0000",
        width: 1,
        value: currenttime,
        zIndex: 3,
      }],
      },
      yAxis: {
          title: {
              text: 'Waterstand [cm]'
          }
      },

      plotOptions: {
        series: {
          name: 'Waterstand [cm]',
          pointStart: Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(),0,0),
          pointInterval: 60 * 10000,
          marker:{
            enabled:false
          }
        }
      },

      series: [{
          showInLegend: false,
          data: waterstand
      }],

      credits: {
        text: "Staat jouw spot er niet bij? Extra features in gedachte? Andere vragen of opmerkingen? Mail dan naar prahprahpro@gmail.com",
        href: null
      },

      exporting: {
        enabled: false
      }

      });
      });
  };

  function nextDay() {
    dt = convertToNL(new Date(dt.getFullYear(),dt.getMonth(),dt.getDate() + 1));
    $(".datepicker-here").datepicker().data("datepicker").selectDate(dt);
  }

  function previousDay(){
    dt = convertToNL(new Date(dt.getFullYear(),dt.getMonth(),dt.getDate() - 1));
    $(".datepicker-here").datepicker().data("datepicker").selectDate(dt);
  }
