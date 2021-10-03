// ==UserScript==
// @name          AIRBUS airnavx - Automizer
// @namespace			https://w3.airbus.com
// @include				https://w3.airbus.com/1T40/search/text
// @description   Job Card batch downloader
// @version				1.0
// @grant					none
// ==/UserScript==

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 3000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

let searchkeyword= '200435-01';

docReady(function() {
    // Başlat
    eventFire(document.getElementById('select_24'), 'click', changeTail());
});

function eventFire(el, etype, callback){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function changeTail() {

  setTimeout(function(){
    
    // MSN yaz
    document.getElementById('tailNumberInput').value = '05036';
    
    // ENTER KEY
    const keyboardEvent = new KeyboardEvent('keydown', {
      code: 'Enter',
      key: 'Enter',
      charCode: 13,
      keyCode: 13,
      view: window,
      bubbles: true
        });
        
    // SPACE KEY
    const keyboardEvent2 = new KeyboardEvent('keydown', {
        code: 'a',
        key: 'a',
        charCode: 97,
        keyCode: 97,
        view: window,
        bubbles: true
          });
    
    // MSN arat
    document.getElementById('tailNumberInput').dispatchEvent(keyboardEvent);
    
    // Uçağı seç
    setTimeout(function(){ 
        eventFire(document.querySelector('.msn-wrapper li md-option'), 'click');
    }, 2000);
    
    // Belgeyi yaz
    setTimeout(function(){ 
        let hanSearchForm = document.querySelector("form[name=searchForm] > input");
      	//let lalala = document.getElementsByClassName("searchBarFullWidth")[0];
        hanSearchForm.focus();
      	setTimeout(function(){ 
            function setKeywordText(text,target) {
                var el = target;
                el.value = text;
                var evt = document.createEvent("Events");
                evt.initEvent("change", true, true);
                el.dispatchEvent(evt);
            }
            setKeywordText(searchkeyword,hanSearchForm);

            // Belgeyi arat
            setTimeout(function(){ 
                eventFire(document.querySelector('.search-button'), 'click', pompalayavrum());
            }, 1000);

            // Yeni görev kartı
            function pompalayavrum () {
                setTimeout(function(){ 
                    eventFire(document.querySelector('md-menu .md-icon-button'), 'click', pompalayavrum2());
                    function pompalayavrum2 () {
                      eventFire(document.querySelector('.job-card-menu-actions a.ng-scope'), 'click', pompalayavrum3());
                      //alert('BOEING IS THE BEST!');
                      function pompalayavrum3 () {
                        setTimeout(function(){
                          var jobcard = document.querySelector('.jobCardForm input');
                          setKeywordText(searchkeyword,jobcard); 
                          setTimeout(function(){
                            // PDF
                            eventFire(document.querySelector('md-dialog.jobCard-dialog md-dialog-actions button'), 'click');
                          }, 2000);
                          
                        }, 1200);
                      }
                    }
                }, 5500);
            }

         }, 2000);

    }, 3000);
    
  }, 2000);
}