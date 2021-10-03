// ==UserScript==
// @name          AIRBUS airnavx - Automizer
// @namespace			https://w3.airbus.com
// @include				https://w3.airbus.com/1T40/search/text*
// @description   Job Card batch downloader
// @version				2.1
// @grant					none
// ==/UserScript==

const createUserUi = ( `
  <style>
    .automizer-input::selection {
      background: #ccc;
      color: #000;
    }
    #automizer {
    width: 400px;
    color: #fff;
    background: #1c3e71;
    box-shadow: 0 4px 16px #00000082;
    box-sizing: border-box;
    /*margin: auto;*/
    
    position: absolute;
    top: 200px;
    right: 350px;
    
    z-index: 180;
    }
    #automizer-header {
    background: #122f59;
    border-bottom: 3px solid #66cedd;
    padding: 8px 30px 6px 30px;
    font-size: 18px;
    font-weight: bold;
    cursor: move;
    user-select: none;
    z-index: 200;
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
    padding: 8px 18px 6px 18px;
    }
    .automizer-input {
    width: 100%;
    display: block;
    margin: 8px 0 8px 0;
    box-sizing: border-box;
    border: none;
    padding: 12px;
    color: #fff;
    background: rgba(18, 47, 89, 0.5);
    border-bottom: 3px solid transparent;
    transition: 0.1s ease;
    }
    .automizer-input:hover, .automizer-input:focus, .automizer-input:active {
    /*background: #66cedd29;*/
    background: rgba(18, 47, 89, 1);
    outline: 0 none;
    border-bottom: 3px solid #66cedd;
    }
    #automizer-panel label {
    padding-left: 12px;
    user-select: none;
    }
    #searchkeyword {
    resize: none;
    line-height: 18px;
    }
    #planenumber:disabled, #searchkeyword:disabled {
    background: rgba(30, 28, 28, 0.5);
    color: #ccc;
    border-bottom: 3px solid #13233c;
    pointer-events: none;
    }
    #automizer-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
    margin: 16px 0 8px 0;
    }
    .automizer-button {
    width: 100%;
    background: none;
    padding: 8px;
    background: rgba(18, 47, 89, 0.5);
    color: #fff;
    border: none;
    border-bottom: 3px solid transparent;
    transition: 0.1s ease;
    }
    .automizer-button:hover, .automizer-button:focus {
    background: rgba(18, 47, 89, 1);
    outline: 0 none;
    border-bottom: 3px solid #66cedd;
    cursor: pointer;
    /*box-shadow: 0 0 4px #66cedd*/
    }
    .automizer-button:active {
    background: #66cedd;
    /*box-shadow: 0 0 14px #66cedd inset;*/
    }
    .automizer-button:disabled {
    background: rgba(30, 28, 28, 0.5);
    color: #ccc;
    border-bottom: 3px solid #13233c;
    pointer-events: none;
    }
  </style>

  <div id="automizer">
    <div id="automizer-header">
      Automizer <span id="scriptversion">v2.1</span>
      <p id="copyright" title=" Kullanmak sizin tercihinizdir. Oluşabilecek hiçbir zararda sorumluluk kabul etmiyorum.">© Copyright obdegirmenci</p>
    </div>
    <div id="automizer-panel">
      <label>MSN - TN  - FSN - Eng Mod</label>
      <input id="planenumber" class="automizer-input" type="text" placeholder="00435 TC-LGC - TRENTXWB-84" value="05036">
      <label>Content</label>
      <textarea id="searchkeyword" class="automizer-input" type="text" placeholder="Reason for the Job Refer to the MPD TASK: 200435-01" rows="20">200435-01</textarea>
      <div id="automizer-actions">

        <button id="automizersearch" class="automizer-button">SEARCH</button> <button id="automizerreset" class="automizer-button">RESET</button> <button id="automizerpause" class="automizer-button" disabled>PAUSE</button>

      </div>
    </div>
  </div>
` );

const author = ["obdegirmenci"];
const legal = [""];
const version = [""];

// default numbers 05036 200435-01
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, timestage1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

// Zaman ayarı (Kullanımı azaltıldı)
var timestage1 = 2500; // Sayfa yüklendikten sonra başlat
var timestage2 = 0; // MSN arat
var timestage3 = 1800; // Uçağı seç
var timestage4 = 0; // Belge numarasını yaz
var timestage5 = 0; // Belge numarasını arat
var timestage6 = 0; // İş kartı menüsü
var timestage7 = 0; // Yeni iş kartı
var timestage8 = 0; // Paket adı
var timestage9 = 1000; // PDF indir

// Sayfa yüklendikten sonra başlat
docReady(function() {
  var getTailNumber;
  var userKeyword;
  var quaueIndex = 0;
  var userTextArea;
  var userLines;
  var clickDownload;
  var currentStage;
  var isPaused = false;
  
  document.body.insertAdjacentHTML("beforeend", createUserUi);
  const uiApp = document.getElementById("automizer");
  const uiHeader = document.getElementById("automizer-header");
  const uiBody = document.getElementById("automizer-panel");

  const tailNumber = document.getElementById("planenumber");

  const buttonSearch = document.getElementById("automizersearch");
  const buttonReset = document.getElementById("automizerreset");
  const buttonPause = document.getElementById("automizerpause");
  
  const starter = function() {
    buttonSearch.disabled = true;
    buttonReset.disabled = true;
    buttonPause.disabled = false;
    filterCheck();
    getTailNumber = tailNumber.value;
    userTextArea = document.getElementById("searchkeyword");

    document.getElementById("planenumber").disabled = true;
    userTextArea.disabled = true;

    userLines = userTextArea.value.split("\n").filter(item => item);
    userTextArea.scrollTop = 0;
    setQuaue();
    eventFire(document.getElementById("select_24"), "click", changeTail() );
  };

  const resetFilter = function() {
    currentStage = resetFilter.name;

    eventFire( document.querySelector("button.resetButtonStyle"), "click" );
    eventFire( document.querySelector("button.clear-button"), "click" );

    document.getElementById("planenumber").disabled = false;
    userTextArea.disabled = false;

    buttonSearch.disabled = false;
    buttonPause.disabled = true;
    pauseSearch(true);
  };

  const pauseSearch = function(isReset) {
    console.log('AKTİF AŞAMA: ' + currentStage);
    
    if (isPaused !== true) {
      if (isReset === true) {
        console.log("Liste tamamlandı sıfırlandı");
        return writeResult(3);
      } else {
        isPaused = true;
        buttonPause.textContent = "PAUSED";
        buttonReset.disabled = false;
        return writeResult(3);
      }
    } else if (isReset === true) {
      console.log("Liste tamamlanmadan sıfırlandı");
      isPaused = false;
      buttonPause.textContent = "PAUSE";
      buttonReset.disabled = true;
      quaueIndex = 0;
    } else {
      isPaused = false;
      buttonPause.textContent = "PAUSE";
      buttonReset.disabled = true;
      return searchDoc();
    }

  };

  const minimizePanel = function() {
    uiBody.style.display === "none" ? uiBody.style.display = "block" : uiBody.style.display = "none";
  };

  buttonSearch.addEventListener("click", starter);
  buttonReset.addEventListener("click", resetFilter);
  buttonPause.addEventListener("click", pauseSearch);
  uiHeader.addEventListener("dblclick", minimizePanel);
  dragElement(uiApp);

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
      document.getElementById("tailNumberInput").value = getTailNumber;
      // MSN arat
      document.getElementById("tailNumberInput").dispatchEvent(keyboardEvent);
      // Uçağı seç
      /*setTimeout(function() {
        eventFire( document.querySelector(".msn-wrapper li md-option" ), "click" );
        searchDoc();
      }, timestage3);*/
    }, timestage2);
  }

  // Belge
  function searchDoc() {
    setTimeout(function() {
      var searchForm = document.querySelector("form[name=searchForm] > input");
      // Belge numarasını yaz
      setKeywordText(userKeyword, searchForm);
      // Belge numarasını arat
      eventFire(document.querySelector(".search-button"), "click", isJobCardExist() );
    }, timestage4);
  }

  // İş kartı menüsü
  function jobCard() {
    
    if (currentStage === "resetFilter") {
      
      console.log("İş kartı kontrolü resetten dolayı aramaktan vazgeçildi");
      clearInterval(setTimer);
      return;

    } else {

      setTimeout(function() {
        eventFire(document.querySelector("md-menu .md-icon-button"), "click", printTaskJob() );

        // Yeni iş kartı
        function printTaskJob() {
          eventFire(document.querySelector(".job-card-menu-actions a.ng-scope"), "click", isDialogExist() );
        }
      }, timestage7);

    }
    
  }

  // Paket adı
  function printPdf() {
      setTimeout(function() {
      var packagename = document.querySelector(".jobCardForm input");
      setKeywordText(userKeyword, packagename); 
      isDialogExist(1); // Kapat
      // PDF indir
      clickDownload = setTimeout(function() {
        // İndir
        //eventFire(document.querySelector("md-dialog.jobCard-dialog md-dialog-actions button"), "click");
        console.log("İndirme başlatıldı");
        clearTimeout(clickDownload);
        // Pencereyi manuel kapat (Test için. Otomatik İndirmeyi kapat.)
        eventFire( document.querySelector("md-dialog.jobCard-dialog button.close-button"), "click");
      }, timestage9);
    }, timestage8);
  }
  
  var filterCheck = function () {
    setTimeout(function() {
      
      // Select the node that will be observed for mutations
      var targetNode = document.querySelector(".msn-wrapper ul" );
      
      // Options for the observer (which mutations to observe)
      var config = { childList: true};
      
      // Callback function to execute when mutations are observed
      var callback = function(mutationsList, observer) {
        console.log("Filtre değişti");
        eventFire( document.querySelector(".msn-wrapper li md-option" ), "click" );
        searchDoc();
      };
      
      // Create an observer instance linked to the callback function
      var observer = new MutationObserver(callback);
      
      // Start observing the target node for configured mutations
      return observer.observe(targetNode, config);
      
      // Later, you can stop observing
      //observer.disconnect();
    }, 100); // Filtre için biraz pay
  };
  
  function isJobCardExist() {
    currentStage = isJobCardExist.name;

    if (isPaused === false) {
      var searchCycle = 0;

      let setTimer = setInterval(() => {
        if (document.querySelector("md-menu.buttonlike-menu")) {
          console.log("Belge bulundu");
          clearInterval(setTimer);
          searchCycle = 0;
          jobCard();
        } else {
          if (searchCycle < 2 && isPaused === false ) {
            searchCycle = searchCycle + 1;
            console.log("Belge bulunamadı");
            if (currentStage === "resetFilter") {
              console.log("Kart döngüsünde resetten dolayı aramaktan vazgeçildi");
              clearInterval(setTimer);
              return;
            }
          } else {
            console.log("Aramaktan vazgeçildi");
            clearInterval(setTimer);
            isPaused === false ? writeResult(1) : console.log("DÖNGÜDE DURDURDUM");
          }
        }
      }, 2800);
    } else {
      console.log("Aramaktan vazgeçildi");
      //writeResult(3);
    }
      
  }
  
  function isDialogExist(final) {
    currentStage = isDialogExist.name;

    var waitCycle = 0;
    let setTimer = setInterval(() => {
      if (!final) {
        if (document.querySelector("md-dialog.jobCard-dialog")) {
          console.log("Diyalog bulundu");
          clearInterval(setTimer);
          printPdf();
        } else {
          console.log("Diyalog bulunamadı");
        }
      } else {
        ///// İndirilemediyse iptal et
        if (waitCycle < 20) {
          if (currentStage === "resetFilter") {
            console.log("Diyalog döngüsünde resetten dolayı aramaktan vazgeçildi");
            clearInterval(setTimer);
            return;
          } else {
            if (document.querySelector("md-dialog.jobCard-dialog")) {
              waitCycle = waitCycle + 1;
              console.log("Diyalog penceresi açık");
            } else {
              waitCycle = 0;
              console.log("Diyalog penceresi kapalı");
              clearInterval(setTimer);
              writeResult();
            }
          }
        } else {
          eventFire( document.querySelector("md-dialog.jobCard-dialog button.close-button"), "click");
          waitCycle = 0;
          console.log("İndirme başlatılamadı");
          clearInterval(setTimer);
          clearTimeout(clickDownload);
          writeResult(2);
        }

      }
    }, 800);
  }
  
  function writeResult(error) {
    var resultSuccess = " - COMPLETED ";
    var resultEndOfList = " - ALL COMPLETED ";
    var resultErrorCard = " - JOB CARD NOT FOUND ";
    var resultErrorFile = " - DOWNLOAD ERROR ";
    var resultCancel = " - OPERATION CANCELED ";

    errorType = () => {
      switch (error) {
        case undefined:
          return resultEndOfList;
        case 1:
          return  resultErrorCard;
        case 2:
          return resultErrorFile;
        case 3:
          return resultCancel;
      }
    }
    

    if (error !== 3) {
      if (quaueIndex < (userLines.length-1) ) {
        userLines[quaueIndex] = "[" + (quaueIndex+1) + "]" + (error ? errorType() : resultSuccess) + "[" + userLines[quaueIndex] + "]";
        quaueIndex = quaueIndex + 1 ;
        setQuaue();
        searchDoc();
      }
      else {
        userLines[quaueIndex] = "[" + (quaueIndex+1) + "]" + errorType() + "[" + userLines[quaueIndex] + "]";
        
        let finalCount = userLines.length;

        userLines[quaueIndex+1] = "✈ ...";
        userLines[quaueIndex+2] = "----------------[REPORT]----------------";

        let logLine = 3;
        let errCount = 0;
        const regex = /(?: - DOWNLOAD ERROR | - JOB CARD NOT FOUND )/g;
        userLines.forEach( x => {
          if (regex.test(x) ) {
            userLines[quaueIndex+logLine] = x;
            logLine++;
            errCount++;
            console.log(x);
          } else {
            if (errCount > 0) {
              userLines[quaueIndex+logLine] = `${finalCount - errCount} / ${finalCount}`;
            } else {
              userLines[quaueIndex+logLine] = `${finalCount} / ${finalCount}`;
            }
            userLines[quaueIndex+logLine+1] = "✈ ...";
          }
        });

        setQuaue();

        quaueIndex = 0;
        userKeyword = "";
        resetFilter();
        buttonReset.disabled = false;

      }
    } else {
      console.log("writeResult DURDURULDU, sıradaki ayarlandı");
    }
     
  }
  
  function setQuaue() {
    userKeyword = userLines[quaueIndex];
    console.log(userKeyword + " COUNT:" + quaueIndex);
    userTextArea.value = userLines.join("\n");

    if (quaueIndex > 20) {
      userTextArea.scrollTop = userTextArea.scrollTop + 18;
    }
    else {}
  }
  
  /*
  ////////////////////////////////////
  SÜRÜKLE BIRAK
  ////////////////////////////////////
  */
  
  // Make the DIV element draggable:
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

  ////////////////////////////////////
  ////////////////////////////////////
} );
