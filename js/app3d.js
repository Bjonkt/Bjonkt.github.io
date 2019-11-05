var fp;
document.getElementById("container-table").style.display = "none";
document.getElementById("wrapper-date").style.display = "none";
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
  var startdate = moment().subtract(1, 'days').startOf('hour').format("YYYY-MM-DDTHH:mm:ss") + "Z";
  var enddate = moment().startOf('hour').format("YYYY-MM-DDTHH:mm:ss") + "Z";
  var url = "https://waterberichtgeving.rws.nl/wbviewer/wb_api.php?request=spectra&polar=GR_S_1.1-102&spectra=GD_S_1.28-78&spectra_meta=GD_S_1.1-20&loc="+selection+"&start="+startdate+"&end="+enddate;

  $.ajax({
    type: "GET",
    url: url,
    crossDomain: true,
    //data: JSON.stringify(data),
    success: function(json) {
      console.log(json);
      var frequency = Array.apply(null, {length: 50}).map(Number.call, Number)
      for (var i = 0; i < frequency.length; i++) {
          frequency[i] *= 10;
      }
      var time = json.spectra.times;
      for (var i = 0; i < time.length; i++) {
        time[i] = moment(time[i]*1000).format('YYYY-MM-DD HH:MM:SS')
      }
      var energydensity = json.spectra.values;
      for (var i = 0; i < energydensity.length; i++) {
        for (var j = 0; j < energydensity[i].length; j++) {
          var m0 = energydensity[i][j]*10*0.001;
          energydensity[i][j] = 4*Math.sqrt(m0);
        }
      }
      var data = [{
        x: frequency,
        y: time,
        z: energydensity,
        colorscale: 'Rainbow',
        showscale: false,
        type: 'surface'
              }];
      var layout = {
        scene: {
      		xaxis:{title: 'mHz', autorange:'reversed'},
      		yaxis:{title: ''},
      		zaxis:{title: '[cm]'},
          aspectratio: {x: 1, y: 1, z:0.2},
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
    },
    error: function(error){
      console.log("mislukt");
    }
  });
};


function update(day) {
  // location
  var sl = document.getElementById("selectedLocation");
  // create chart createChart(location,day)
  var selection = sl.options[sl.selectedIndex];


  createChart(selection.value,selection.text,day);

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
