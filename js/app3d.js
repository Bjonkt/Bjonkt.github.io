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
  var cors = "https://cors-anywhere.herokuapp.com/"
  var startdate = moment().subtract(1, 'days').startOf('hour').format("YYYY-MM-DDTHH:mm:ss") + "Z";
  var enddate = moment().startOf('hour').format("YYYY-MM-DDTHH:mm:ss") + "Z";
  var url = cors + "https://waterberichtgeving.rws.nl/wbviewer/wb_api.php?request=spectra&polar=GR_S_1.1-102&spectra=GD_S_1.28-78&spectra_meta=GD_S_1.1-20&loc="+selection+"&start="+startdate+"&end="+enddate;

  $.getJSON(url,function(json){
    var tijd = json.spectra.times;
    for (var i = 0; i < tijd.length; i++) {
      tijd[i] = moment(tijd[i]*1000).format('YYYY-MM-DD HH:MM:SS')
    }
    var energiedichtheid = json.spectra.values;
    for (var i = 0; i < energiedichtheid.length; i++) {
      for (var j = 0; j < energiedichtheid[i].length; j++) {
        var m0 = energiedichtheid[i][j]*10*0.001;
        energiedichtheid[i][j] = 4*Math.sqrt(m0);
      }
    }
    var data = [{
      y: tijd,
      z: energiedichtheid,
      colorscale: 'Viridis',
      showscale: false,
      type: 'surface'
            }];
    var layout = {
      scene: {
    		xaxis:{title: 'mHz', autorange:'reversed'},
    		yaxis:{title: ''},
    		zaxis:{title: '[cm]'},
    		},
      title: false,
      autosize: true,
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
      }
    };
    Plotly.newPlot('content-chart', data, layout, {responsive:true});
  });
};

// create tables
function createTable(selection,day) {
/*
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
  */
};

function getRealTime(selection) {
  /*
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
*/
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
