// WHAT IS TODAYS DATE?
var dt = new Date();
var today = dt.getUTCFullYear()+"/"+dt.getUTCMonth()+"/"+dt.getUTCDate();

  $(function () {
    var waterstand = [];
    var url = "getijscheveningen.json";
    $.getJSON(url, function(json) {

//////////////////////////////////////////////////////
////////////// ONLY VIEW DATA OF TODAY ///////////////
//////////////////////////////////////////////////////

        for (i = 0; i < json.series.data.length; i++){
          // GET THE DATE FROM THE DATAPOINT
          var datum = new Date(json.series.data[i].dateTime);
          var dag = datum.getUTCFullYear()+"/"+datum.getUTCMonth()+"/"+datum.getUTCDate();

          if(dag === today){
            waterstand.push([json.series.data[i].value]);
          }else{
            //DO NOTIN
          }

        }

    // Draw chart
    $('#container').highcharts({
      chart: {
          type: 'spline'
      },
      title: {
          text: 'NAP'
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
  });
