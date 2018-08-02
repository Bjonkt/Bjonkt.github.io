// Global variables for date(default today)  and location because i don't know how to program correctly
var dt = new Date();
var selecteddate = dt.getFullYear()+"/"+dt.getMonth()+"/"+dt.getDate();
var selectedlocation;

//Show a plot on load
$(function (){
  plotSelectedLocation();
})

// Get Date if user changes date
$(function getSelectedDate() {
  $(".datepicker-here").datepicker({
    autoClose: true,
    onSelect: function(dateText, inst) {
      dt = inst;
      selecteddate = inst.getFullYear()+"/"+inst.getMonth()+"/"+inst.getDate();
      plotSelectedLocation();
    }
  })
});


function plotSelectedLocation() {
  // Het stringetje die de waterstand opslaaddt voor highcharts
  var waterstand = [];

  // Paar (tijdelijke) strings voor de location selection
  var selection = document.getElementById("selectedLocation");
  var title = selection.options[selection.selectedIndex].text;

  var subtitle;
  if(title==="Scheveningen"){
    subtitle = "jeej met 159 man in het water";
  }else if (title === "IJmuiden") {
    subtitle = "Soort van chill, maar eigenlijk niet";
  }else if (title === "Petten") {
    subtitle = "Daar loopt het zo lekker hol";
  }else if (title === "Hoek van Holland") {
    subtitle = "Waar die ene fotograaf Ed altijd zijn foto's maakt "
  }else {
    subtitle = "Wordt daar gesurft dan?"
  }

  var location = selection.options[selection.selectedIndex].value;
  // En de bij passende url
  var url = location + ".json";

  // Laden van de data
  $.getJSON(url, function(json) {

    for (i = 0; i < json.series[0].data.length; i++){
      // Parse the json string to get tide height data
      var datum = new Date(json.series[0].data[i].dateTime);
      var dag = datum.getFullYear()+"/"+datum.getMonth()+"/"+datum.getDate();

      // Only load data of selected date
      if(dag === selecteddate){
        waterstand.push([json.series[0].data[i].value]);
      }else{
        //DO NOTIN
      }
    }

    // Create chart using highcharts
    $('#container').highcharts({
      chart: {
          type: 'spline' //Smooth lijntje
      },
      title: {
          text: title
      },
      subtitle: {
        text: subtitle
      },
      xAxis:{
        type: 'datetime',
        plotLines:[{
          color: "#FF0000",
          width: 1
          //value: Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours() + 2,dt.getMinutes())
        }]
      },
      yAxis: {
          title: {
              text: 'Waterstand in cm'
          }
      },

      plotOptions: {
        series: {
          pointStart: Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(),0,0),
          pointInterval: 60 * 10000,
          marker:{
            enabled:false
          }
        }
      },

      series: [{
          name: 'Waterstand',
          //data: [0,1,4,9,16,25,36,49,64,100]
          //data: datapoints
          data: waterstand,
      }]

      });
      });
  };
