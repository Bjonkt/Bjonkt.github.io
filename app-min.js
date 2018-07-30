// WHAT IS TODAYS DATE?
var dt = new Date();
var today = dt.getUTCFullYear()+"/"+dt.getUTCMonth()+"/"+dt.getUTCDate();

//SHOW A PLOT ON PAGE LOAD
$(function (){
  plotSelectedLocation();
})

  function plotSelectedLocation() {
    // Het stringetje die de waterstand opslaaddt voor highcharts
    var waterstand = [];

    // Paar (tijdelijke) strings voor de selectie
    var selection = document.getElementById("selectedLocation");
    var title = selection.options[selection.selectedIndex].text;

    var subtitle;
    if(title==="Scheveningen"){
      subtitle = "jeej met 159 man in het water naast de hoofdhaven";
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
        // GET THE DATE FROM THE DATAPOINT
        var datum = new Date(json.series[0].data[i].dateTime);
        var dag = datum.getUTCFullYear()+"/"+datum.getUTCMonth()+"/"+datum.getUTCDate();

          if(dag === today){
            waterstand.push([json.series[0].data[i].value]);
          }else{
            //DO NOTIN
          }

      }

    // Maken van de Plot met behulp van highcharts
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
        type: 'datetime'
      },
      yAxis: {
          title: {
              text: 'Waterstand in cm'
          }
      },

      plotOptions: {
        series: {
          pointStart: Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(),0,0),
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
