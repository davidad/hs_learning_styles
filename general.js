function get_person_slider_data(person,cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET","http://aditi.davidad.net:24024/hs/ls/"+person+".json",true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4) {
      if (xhr.status == 200) {
        cb(JSON.parse(xhr.responseText));
      } else if(settings) {
        cb([ ["Active", 0, "Reflective"], ["Sensing", 0, "Intuitive"], ["Visual", 0, "Verbal"], ["Sequential", 0, "Global"] ]);
      } else {
        cb([]);
      }
    }
  };
  xhr.send();
}

function single_slider_div(datum) {
  for(var i=0;i<2;i++) {
    if(typeof(datum[i])=="string") {
      datum[i] = datum[i].replace(/</,'&lt;'); // XSS is bad
    }
  }
  var sliderDiv = document.createElement("div");
  sliderDiv.id = datum[0] + "-" + datum[2] + "-div";
  var listid = datum[0]+'-'+datum[2]+'-list';
  var dis = settings ? "" : " disabled";
  sliderDiv.innerHTML = '<div><span>'+datum[0]+'</span><span>'+datum[2]+'</span></div><input type=range step="0.01" min="-1.2" max="1.2" value="'+datum[1]+'" id="'+datum[0]+'-'+datum[2]+'-slider" data-left-name="'+datum[0]+'" data-right-name="'+datum[2]+'" list="'+listid+'"'+dis+'><datalist id="'+listid+'"><option value="-1.0">'+datum[0]+'</option><option value="0.0"></option><option value="1.0">'+datum[2]+'</option</datalist>';
  return sliderDiv;
}

function render_slider_data(element) {
  get_person_slider_data(person, function(data) {
    var n=data.length;
    if(n==0) {
      var nonep = document.createElement("p");
      nonep.innerHTML='None specified. Ask this person to install <a href="https://github.com/davidad/hs_learning_styles/">the extension</a> and set them!'
      element.appendChild(nonep);
    } else {
      for (var i=0; i<n; i++) {
        element.appendChild(single_slider_div(data[i]));
      }
    }
  });
}

var settings = false;
if(document.location.pathname.indexOf("settings") != -1) {
  var settings = true;
  var person = document.getElementsByTagName("nav")[0].getElementsByTagName("a")[0].href.replace(/.*\//,'');
  var employer_li = document.getElementById("settings_company_name").parentNode;
  var slider_li = document.createElement("li");
  slider_li.innerHTML = '<label>Learning styles</label><div id="sliders"></div><div class="settings-directions directions">If you move any of the sliders from zero, clicking Update Settings will place them all on your profile.</div>';
  employer_li.parentNode.insertBefore(slider_li,employer_li);
  render_slider_data(document.getElementById('sliders'));
  document.getElementsByClassName("settings-submit")[0].addEventListener("click",function() {
    var sliders = slider_li.getElementsByTagName("input");
    var updata = [];
    for(var i=0, n=sliders.length; i<n; i++) {
      var d=[];
      d[0]=sliders[i].getAttribute("data-left-name");
      d[2]=sliders[i].getAttribute("data-right-name");
      d[1]=sliders[i].value;
      updata[i]=d;
    }
    var upjson = JSON.stringify(updata);
    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://aditi.davidad.net:24024/hs/ls/"+person+".json",true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Content-length", upjson.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(upjson);
  });
} else {
  var person = document.location.pathname.replace(/.*\//,'')
  document.getElementById('content').innerHTML += '<div id="sliders"><h2>Learning Styles</h2></div>';
  render_slider_data(document.getElementById('sliders'));
}
