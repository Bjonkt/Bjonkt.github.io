var fp;
 $(function init() {
   var today = getNL(new Date());
   fp = $("#mdc-text-field").flatpickr({
     autoClose: true,
     defaultDate: today,
     onChange: function(selectedDates, datestr, instance) {
       var dateSelected = moment.utc(datestr).toDate();
       fp.setDate(dateSelected);
       update(dateSelected);
     }
   });
   fp.setDate(today);
   update(today);
 })

// load json data
function createChart(selection,title,day) {
  var day1 = day.toISOString().split("T")[0];
  var day2 = day.addDays(1).toISOString().split("T")[0];
  var url = "json/" + selection + ".json";
  var waterstand = [];
  $.getJSON(url, function(json) {
    var suntimes = SunCalc.getTimes(day,json.series[0].location[0].latitude,json.series[0].location[0].longitude);
    var begin = 18;
    var ending = 163;
    if(DST(day)){
      begin = 12;
      ending = 157;
    }
    for (i = 0; i < json.series[0].data.length; i++){
      // Parse the json string to get tide height data
      var dataday = getNL(new Date(json.series[0].data[i].dateTime)).toISOString().split("T")[0];
      // Only load data of selected date
      if(day1 === dataday || day2 === dataday){
        waterstand.push([json.series[0].data[i].value]);
      }else{
        //DO NOTIN
      }
    }
    // chart
    var chartoptions = {
        chart: {
          type: 'areaspline',
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'roboto'
          },
        },
        title: {
          text: title,
          style: {
            fontSize: '16px'
          }
        },
        subtitle: {
          text: moment(day).format("dddd, D MMMM"),
            style: {
              color: "#424242"
            }
        },
        xAxis:{
          type: 'datetime',
          tickInterval: 3600*1000*3,
          gridLineWidth: 0,
          gridLineColor: "#424242",
          labels: {
            style: {
              color: "#424242"
            }
          },
          plotLines:[{
              color: "#ff1744",
              width: 1,
              value: getNL(new Date()),
              zIndex: 4,
            }],
          plotBands: [{
            color: "#e0e0e0", // Color value
            from: 0, // Start of the plot band
            to: getNL(suntimes.dawn), // End of the plot band
          },
          {
            color: "#efefef", // Color value
            from: getNL(suntimes.dawn), // Start of the plot band
            to: getNL(suntimes.sunrise), // End of the plot band
          },
          {
            color: "#ffffff", // Color value
            from: getNL(suntimes.sunrise), // Start of the plot band
            to: getNL(suntimes.sunset), // End of the plot band
          },
          {
            color: "#efefef", // Color value
            from: getNL(suntimes.sunset), // Start of the plot band
            to: getNL(suntimes.dusk), // End of the plot band
          },
          {
            color: "#e0e0e0", // Color value
            from: getNL(suntimes.dusk),
            to: Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()+1,24,0),
          }],
          crosshair: {dashStyle: 'shortDash'},
        },
        yAxis:{
          title: {
            text: 'Waterstand [cm]'
          },
          gridLineColor: "#c7c7c7",
          crosshair: {dashStyle: 'shortDash'},
          labels: {
            style: {
              color: "#424242"
            }
          }
        },
        series: [{
            name: 'Astronomisch Getij [cm]',
            data: waterstand.slice(begin,ending),
            pointStart: Date.UTC(day.getUTCFullYear(),day.getUTCMonth(),day.getUTCDate(),0,0),
            pointInterval: 60 * 10000,
            marker:{
              enabled:false
            },
            color: "#9ac6f0",
            showInLegend: true,
            threshold: -Infinity,
            fillColor:{
              linearGradient: {
                x1: 0, y1: 0, x2: 0, y2: 1
              },
              stops: [
                [0, Highcharts.Color("#9ac6f0").setOpacity(0.4).get('rgba')],
                [1, Highcharts.Color("#9ac6f0").setOpacity(0).get('rgba')]
              ]
            }
        }],
        exporting: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        responsive: {
          rules: [{
            condition: {
              maxWidth: 500
            },
            chartOptions: {
              yAxis: {
                labels: {
                  align: "left",
                  x:5,
                  y:-5
                },
                title: {
                  enabled: false
                }
              }
            }
          }]
        }
      };
    $("#content-chart").highcharts(chartoptions)
  })
};

// create tables
function createTable(selection,day) {
  var day1 = day;
  var day2 = moment.utc(day).add(1,'days');
  var day3 = moment.utc(day).add(2,'days');
  var url = "json/" + selection + "hwlw" + ".json";

  $.getJSON(url,function(json){
    var extremes1 = [];
    var extremes2 = [];
    var extremes3 = [];

    var extremestime1 = [];
    var extremestime2 = [];
    var extremestime3 = [];

    var extremesday1 = [];
    var extremesday2 = [];
    var extremesday3 = [];
    var dataday = moment.utc(new Date());

    for (i = 0; i < json.astronomicaltide.values.value.length; i++){
      // Parse the json string to get tide height data
      if(Object.keys(json.astronomicaltide.values.value[i].datetime).length === 2 || Object.keys(json.astronomicaltide.values.value[i].datetime).length === 3){
        var datejson = json.astronomicaltide.values.value[i].datetime.text;
        dataday = moment.utc(datejson,"YYYYMMDDHHmm");
      } else {
        var datejson = json.astronomicaltide.values.value[i].datetime;
        dataday = moment.utc(datejson,"YYYYMMDDHHmm");
      };
      // Only load data of selected date
      if(moment(dataday).isSame(day1,'day')){
        extremes1.push(json.astronomicaltide.values.value[i].val);
        extremestime1.push(moment.utc(dataday).format("HH:mm"));
        extremesday1.push(moment.utc(dataday).format("dddd, DD MMMM"));
      } else if (moment(dataday).isSame(day2,'day')) {
        extremes2.push(json.astronomicaltide.values.value[i].val);
        extremestime2.push(moment.utc(dataday).format("HH:mm"));
        extremesday2.push(moment.utc(dataday).format("dddd, DD MMMM"));
      } else if (moment(dataday).isSame(day3,'day')) {
        extremes3.push(json.astronomicaltide.values.value[i].val);
        extremestime3.push(moment.utc(dataday).format("HH:mm"));
        extremesday3.push(moment.utc(dataday).format("dddd, DD MMMM"));
      }else{
        //DO NOTIN
      };
    };

    document.getElementById("ddata0").innerHTML = extremesday1[0]
    document.getElementById("ddata1").innerHTML = extremesday2[0]

    for (var i = 0; i < 4; i++) {

      if (extremes1[i] != undefined) {
        document.getElementById("wdata"+i).innerHTML = extremes1[i];
        document.getElementById("tdata"+i).innerHTML = extremestime1[i];
      } else {
        document.getElementById("wdata"+i).innerHTML = "-";
        document.getElementById("tdata"+i).innerHTML = "-";
      }

      var j = i + 4;
      if (extremes2[i] != undefined) {
        document.getElementById("wdata"+j).innerHTML = extremes2[i];
        document.getElementById("tdata"+j).innerHTML = extremestime2[i];
      } else {
        document.getElementById("wdata"+j).innerHTML = "-";
        document.getElementById("tdata"+j).innerHTML = "-";
      }



    }
  });
};

function getRealTime(selection) {
  var windrichting = 0;
  var windkracht = 0;
  var golfhoogte = 0;
  var golfperiode = 0;
  var fullstring = 'Actueel - ' + 'Golven: ' + golfhoogte+'cm@'+golfperiode+'s'+', Wind: ' + windkracht+'kt'+' ('+windrichting+'°'+')';
  document.getElementById('realtimedata').innerHTML = fullstring;
  var location;
  if (selection=='Den Helder') {
    wavelocation = 'IJgeul-stroommeetpaal%28SPY%29';
    windlocation = 'De-Kooy%28DEKO%29';
  } else if (selection=='Petten') {
    wavelocation = 'IJgeul-stroommeetpaal%28SPY%29';
    windlocation = 'IJgeul-stroommeetpaal%28SPY%29'
  }else if (selection=='IJmuiden') {
    wavelocation = 'IJgeul-stroommeetpaal%28SPY%29';
    windlocation = 'IJgeul-stroommeetpaal%28SPY%29';
  }else if (selection=='Scheveningen') {
    wavelocation = 'Eurogeul-E13%28E13%29';
    windlocation = 'Hoek-van-Holland%28HOEK%29';
  } else if (selection=='Hoek van Holland') {
    wavelocation = 'Eurogeul-E13%28E13%29';
    windlocation = 'Hoek-van-Holland%28HOEK%29';
  }else if (selection='Cadzand') {
    wavelocation = 'Cadzand-boei%28CADW%29';
    windlocation = 'Cadzand-wind%28CAWI%29';
  }
  var waveurl = 'https://waterinfo.rws.nl/api/detail?expertParameter=Significante___20golfhoogte___20in___20het___20spectrale___20domein___20Oppervlaktewater___20golffrequentie___20tussen___2030___20en___20500___20mHz___20in___20cm&locationSlug=' + wavelocation + '&user=publiek';
  var periodurl = 'https://waterinfo.rws.nl/api/detail?expertParameter=Gem.___20golfperiode___20langste___201___2F3___20deel___20v.d.___20golven___20%28tijdsdomein%29___20Oppervlaktewater___20s&locationSlug=' + wavelocation + '&user=publiek';
  var windurl = 'https://waterinfo.rws.nl/api/detail?expertParameter=Windsnelheid___20Lucht___20t.o.v.___20Mean___20Sea___20Level___20in___20m___2Fs&locationSlug=' + windlocation + '&user=publiek';
  var directionurl = 'https://waterinfo.rws.nl/api/detail?expertParameter=Windrichting___20Lucht___20t.o.v.___20ware___20Noorden___20in___20graad&locationSlug='+windlocation+'&user=expert';

  $.when(
    $.get("https://cors-anywhere.herokuapp.com/"+directionurl, function(directiondata) {
      windrichting = Math.round(directiondata.latest.data);
    }),
    $.get("https://cors-anywhere.herokuapp.com/"+periodurl, function(perioddata) {
      golfperiode = perioddata.latest.data;
    }),
    $.get("https://cors-anywhere.herokuapp.com/"+windurl, function(winddata) {
      windkracht = Math.round(winddata.latest.data/0.5144);
    }),
    $.get("https://cors-anywhere.herokuapp.com/"+waveurl, function(wavedata) {
      golfhoogte = Math.round(wavedata.latest.data);
    }),
  ).then(function() {
    fullstring = 'Actueel - ' + 'Golven: ' + golfhoogte+'cm@'+golfperiode+'s'+', Wind: ' + windkracht+'kt'+' ('+windrichting+'°'+')';
    document.getElementById('realtimedata').innerHTML = fullstring;
  });

}

function update(day) {
  // location
  var sl = document.getElementById("selectedLocation");
  // create chart createChart(location,day)
  var selection = sl.options[sl.selectedIndex];

  getRealTime(selection.text);

  createChart(selection.value,selection.text,day);
  // create table createTable(selection,day)
  createTable(selection.value,day);

}

// next day and previous day functions
function nextDay() {
  var date = fp.selectedDates[0];
  var nextday = date.addDays(1);
  fp.setDate(nextday);
  update(nextday);
};

function previousDay(){
  var date = fp.selectedDates[0];
  var previousday = date.addDays(-1);
  fp.setDate(previousday);
  update(previousday);
};

function changeLocation() {
  var date = fp.selectedDates[0];
  var selecteddate = date;
  fp.setDate(selecteddate);
  update(selecteddate);
};

function getUTC(jsdate) {
  var date = jsdate;
  var date_utc = Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),0,0);
  return new Date(date_utc);
};

function getNL(jsdate) {
  var date = jsdate;
  var n = 1;
  if(DST(jsdate)){
    n = 2;
  }
  var date_nl = Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),date.getUTCHours()+n,date.getUTCMinutes(),date.getUTCSeconds());
  return new Date(date_nl);
};

function DST(day) {
  var n = day.getTimezoneOffset();
  var isDST = false;
  if(n==-120){
    isDST = true;
  }
  return isDST;
}

Date.prototype.addDays = function(days){
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};
