// Global variables for date(default today)  and location because i don't know how to program correctly
var dt = new Date();
var tm = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+1);
var dtm = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()+2);
var selecteddate = dt.getFullYear()+"/"+dt.getMonth()+"/"+dt.getDate();
var tomorrow = tm.getFullYear()+"/"+tm.getMonth()+"/"+tm.getDate();
var dayaftertomorrow = dtm.getFullYear()+"/"+dtm.getMonth()+"/"+dtm.getDate();
var selectedlocation;


//Show a plot on load
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
      dt = inst;
      selecteddate = inst.getFullYear()+"/"+inst.getMonth()+"/"+inst.getDate();
      var nd = new Date(inst.getFullYear(),inst.getMonth(),inst.getDate()+1);
      var dat = new Date(inst.getFullYear(),inst.getMonth(),inst.getDate()+2);
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
        var dt = json.astronomicaltide.values.value[i].datetime.text;
        datum = new Date(dt.substring(0,4),dt.substring(4,6)-1,dt.substring(6,8),dt.substring(8,10),dt.substring(10,12));
      } else {
        var dt = json.astronomicaltide.values.value[i].datetime;
        datum = new Date(dt.substring(0,4),dt.substring(4,6)-1,dt.substring(6,8),dt.substring(8,10),dt.substring(10,12));
      };

      dag = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate();

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

function plotSelectedLocation() {
  // Het stringetje die de waterstand opslaaddt voor highcharts
  var waterstand = [];

  // Paar (tijdelijke) strings voor de location selection
  var selection = document.getElementById("selectedLocation");
  var title = selection.options[selection.selectedIndex].text;

  var location = selection.options[selection.selectedIndex].value;

  // En de bij passende url
  var url = "json/" + location + ".json";
  var urltable = "json/" + location + "hwlw" + ".json";

  createTable(urltable);

  // Laden van de data
  $.getJSON(url, function(json) {

    var suntimes = SunCalc.getTimes(dt,json.series[0].location[0].latitude,json.series[0].location[0].longitude);

    for (i = 0; i < json.series[0].data.length; i++){
      // Parse the json string to get tide height data
      var datum = new Date(json.series[0].data[i].dateTime);
      var dag = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate();
      var dag0 = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate()+"/"+datum.getHours();
      var dag1 = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate()+"/"+datum.getHours();

      // Only load data of selected date
      if(dag === selecteddate || dag === tomorrow){
        waterstand.push([json.series[0].data[i].value]);
      }else{
        //DO NOTIN
      }
    }

    //Remove first and last enteries
    waterstand = waterstand.slice(11,156);

    var now = new Date();
    var nowdt = now.getFullYear()+"/"+now.getMonth()+"/"+now.getDate();

    if(selecteddate === nowdt){
      nowdt = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(),now.getMinutes());
    } else {
      nowdt = null;
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
        to: Date.UTC(suntimes.sunrise.getFullYear(), suntimes.sunrise.getMonth(), suntimes.sunrise.getDate(), suntimes.sunrise.getHours(),suntimes.sunrise.getMinutes(),suntimes.sunrise.getSeconds()), // End of the plot band
      },{
        color: "#dddddd", // Color value
        from: Date.UTC(suntimes.sunset.getFullYear(), suntimes.sunset.getMonth(), suntimes.sunset.getDate(),suntimes.sunset.getHours(),suntimes.sunset.getMinutes(),suntimes.sunset.getSeconds()),
        to: Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(),24,0),
      }],
      plotLines:[{
        color: "#FF0000",
        width: 1,
        value: nowdt,
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
      tooltip: {
        crosshairs: {
            dashStyle: "ShortDash"
        },
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
