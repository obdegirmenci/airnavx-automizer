// ==UserScript==
// @name          AIRBUS airnavx - Automizer
// @namespace			https://w3.airbus.com
// @include				https://w3.airbus.com/1T40/search/text
// @description   Job Card batch downloader
// @version				1.1
// @grant					none
// ==/UserScript==

// --FUNCTIONS--

// --DOCUMENT LOAD--
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
var timestage1 = 3000; // Sayfa yüklendikten sonra başlat
var timestage2 = 2000; // MSN arat
var timestage3 = 2000; // Uçağı seç
var timestage4 = 3000; // Belge numarasını yaz
var timestage5 = 1000; // Belge numarasını arat
var timestage6 = 2000; // İş kartı menüsü
var timestage7 = 5500; // Yeni iş kartı
var timestage8 = 1200; // Paket adı
var timestage9 = 2000; // PDF indir


// --VARIABLES--
let searchkeyword= "200435-01";

// Sayfa yüklendikten sonra başlat
docReady(function() {
    eventFire(document.getElementById("select_24"), "click", changeTail() );
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

function changeTail() {
  setTimeout(function(){
    // MSN yaz
    document.getElementById("tailNumberInput").value = "05036";
    // MSN arat
    document.getElementById("tailNumberInput").dispatchEvent(keyboardEvent);
    // Uçağı seç
    setTimeout(function() {
      eventFire( document.querySelector(".msn-wrapper li md-option" ), "click" );
    }, timestage3);
    
    // Belge numarasını yaz
    setTimeout(function() {
      let hanSearchForm = document.querySelector("form[name=searchForm] > input");
      // Arama kutusuna odaklan
      hanSearchForm.focus();

      setTimeout(function() { 
        setKeywordText(searchkeyword,hanSearchForm);
        // Belge numarasını arat
        setTimeout(function() { 
            eventFire(document.querySelector(".search-button"), "click", pompalayavrum() );
        }, timestage5);

        // İş kartı menüsü
        function pompalayavrum() {
          setTimeout(function() { 
            eventFire(document.querySelector("md-menu .md-icon-button"), "click", pompalayavrum2() );
            
            // Yeni iş kartı
            function pompalayavrum2() {
              eventFire(document.querySelector(".job-card-menu-actions a.ng-scope"), "click", pompalayavrum3() );
              // Paket adı
              function pompalayavrum3() {
                setTimeout(function() {
                  var jobcard = document.querySelector(".jobCardForm input");
                  setKeywordText(searchkeyword,jobcard); 
                  // PDF indir
                  setTimeout(function() {
                    eventFire(document.querySelector("md-dialog.jobCard-dialog md-dialog-actions button"), "click");
                  }, timestage9);
                }, timestage8);
              }
            }
          }, timestage7);
        }
      }, timestage6);
    }, timestage4);
  }, timestage2);
}