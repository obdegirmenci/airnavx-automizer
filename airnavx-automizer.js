// ==UserScript==
// @name          AIRBUS airnavx - Automizer
// @namespace			https://w3.airbus.com
// @include				https://w3.airbus.com/1T40/search/text
// @description   Job Card batch downloader
// @version				1.2
// @grant					none
// ==/UserScript==

// --FUNCTIONS--

// --DOCUMENT LOAD--
let automizerdialog = ( `
  <style>
    #automizer {
      width: 400px;
      color: #fff;
      background: #1c3e71;
      border: 2px solid #122f59;
      border-radius: 8px;
      box-shadow: 0 5px 16px #00000082;
      box-sizing: border-box;
      position: absolute;
      top: 200px;
      right: 250px;
      z-index: 20;
    }
    #automizer-header {
      background: #122f59;
      border-bottom: 3px solid #66cedd;
      padding: 8px 16px 6px 16px;
      font-size: 18px;
      font-weight: bold;
      cursor: move;
      user-select: none;
      z-index: 30;
    }
    #scriptversion {
      font-size: 12px;
      font-weight: normal;
    }
    #copyright {
      margin: 4px 0 4px 0;
      font-size: 10px;
      font-weight: normal;
    }
    #automizer-panel {
      padding: 8px 16px 6px 16px;
    }
    .automizer-input {
      width: 100%;
      display: block;
      /* float: right; */
      margin: 8px 0 8px 0;
      box-sizing: border-box;
      border: none;
      padding: 10px;
      color: #fff;
      background: rgba(18, 47, 89, 0.5);
      border: 1px solid #122f59;
      border-radius: 4px;
    }
    .automizer-input:hover, .automizer-input:focus {
      background: rgba(18, 47, 89, 1);
      border: 1px solid #66cedd;
    }
    #automizer-panel label {
      padding-left: 10px;
    }
    #searchkeyword {
      height: 250px;
      resize: none;
    }
  </style>

  <div id="automizer">
    <div id="automizer-header">
      Automizer <span id="scriptversion">v1.2</span>
      <p id="copyright">© Copyright obdegirmenci</p>
    </div>
    <div id="automizer-panel">
      <label>MSN - TN  - FSN - Eng Mod</label>
      <input id="planenumber" class="automizer-input" type="text" placeholder="00435 TC-LGC - TRENTXWB-84">
      <label>Content</label>
      <textarea id="searchkeyword" class="automizer-input" type="text" placeholder="FUEL..."></textarea>
      <button id="automizersearch" class="resetButtonStyle md-primary md-raised md-button">SEARCH</button> <button class="resetButtonStyle md-primary md-raised md-button">RESET</button>
    </div>
  </div>
` );

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, timestage1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

// Zaman ayarı
var timestage1 = 2500; // Sayfa yüklendikten sonra başlat
var timestage2 = 2000; // MSN arat
var timestage3 = 1800; // Uçağı seç
var timestage4 = 0; // Belge numarasını yaz
var timestage5 = 0; // Belge numarasını arat
var timestage6 = 0; // İş kartı menüsü
var timestage7 = 3800; // Yeni iş kartı
var timestage8 = 1200; // Paket adı
var timestage9 = 2000; // PDF indir


// --VARIABLES--
//let searchkeyword= "200435-01";
var tailnumber;
var searchkeyword;
// Sayfa yüklendikten sonra başlat
docReady(function() {
  const starter = function() {
    //alert('helloe')
    tailnumber = document.getElementById("planenumber").value;
    searchkeyword = document.getElementById("searchkeyword").value;
    eventFire(document.getElementById("select_24"), "click", changeTail() );
  };
    document.body.insertAdjacentHTML("beforeend", automizerdialog);
    document.getElementById("automizersearch").addEventListener("click", starter);
    dragElement(document.getElementById("automizer"));
    //eventFire(document.getElementById("select_24"), "click", changeTail() );
} );
// CLICK EVENT
function eventFire(el, etype, callback) {
  if (el.fireEvent) {
    el.fireEvent("on" + etype);
  } else {
    var evObj = document.createEvent("Events");
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
// CHANGE TEXT
function setKeywordText(text,target) {
    var el = target;
    el.value = text;
    var evt = document.createEvent("Events");
    evt.initEvent("change", true, true);
    el.dispatchEvent(evt);
}
// ENTER KEY
const keyboardEvent = new KeyboardEvent("keydown", {
  code: "Enter",
  key: "Enter",
  charCode: 13,
  keyCode: 13,
  view: window,
  bubbles: true
} );

// Filtre
function changeTail() {
  setTimeout(function(){
    // MSN yaz
    // test number 05036 200435-01
    document.getElementById("tailNumberInput").value = tailnumber;
    // MSN arat
    document.getElementById("tailNumberInput").dispatchEvent(keyboardEvent);
    // Uçağı seç
    setTimeout(function() {
      eventFire( document.querySelector(".msn-wrapper li md-option" ), "click" );
      searchdoc();
    }, timestage3);
  }, timestage2);
}

// Belge
function searchdoc() {
  setTimeout(function() {
    let hanSearchForm = document.querySelector("form[name=searchForm] > input");
    setTimeout(function() { 
      // Belge numarasını yaz
      setKeywordText(searchkeyword,hanSearchForm);
      // Belge numarasını arat
      setTimeout(function() { 
          eventFire(document.querySelector(".search-button"), "click", jobcard() );
      }, timestage5);
    }, timestage6);
  }, timestage4);
}

// İş kartı menüsü
function jobcard() {
  setTimeout(function() {
    eventFire(document.querySelector("md-menu .md-icon-button"), "click", printtaskjob() );
    
    // Yeni iş kartı
    function printtaskjob() {
      //alert('heeeo');
      eventFire(document.querySelector(".job-card-menu-actions a.ng-scope"), "click", printpdf() );
      // Paket adı
      function printpdf() {
        setTimeout(function() {
          var packagename = document.querySelector(".jobCardForm input");
          setKeywordText(searchkeyword,packagename); 
          // PDF indir
          /*setTimeout(function() {
            eventFire(document.querySelector("md-dialog.jobCard-dialog md-dialog-actions button"), "click");
          }, timestage9);*/
        }, timestage8);
      }
    }
  }, timestage7);
}

/*
//////////////////
//////////////////
//////////////////
*/

// Make the DIV element draggable:
//dragElement(document.getElementById("automizer"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}