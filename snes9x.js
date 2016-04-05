var reload = chrome.runtime.reload;

FS_SIZE = 1024*1024*50 // 50mb?

function gamepads() {
    var conn = 'webkitGamepadConnected' // "gamepadconnected"
    var disconn = 'webkitGamepadDisconnected' //gamepaddisconnected
    window.addEventListener(conn, function(e) {
        console.log("gamepadconnected: Gamepad connected at index %d: %s. %d buttons, %d axes.",
                    e.gamepad.index, e.gamepad.id,
                    e.gamepad.buttons.length, e.gamepad.axes.length);
    });

    window.addEventListener(disconn, function(e) {
        console.log("gamepaddisconnected: Gamepad disconnected from index %d: %s",
                    e.gamepad.index, e.gamepad.id);
    });


    var interval;

    if (false && !('ongamepadconnected' in window)) {
        // No gamepad events available, poll instead.
        console.log('setup polling for gamepads')
        interval = setInterval(pollGamepads, 500);
    }

    function pollGamepads() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        for (var i = 0; i < gamepads.length; i++) {
            var gp = gamepads[i];
            if (gp) {
                var info = "polling: Gamepad connected at index " + gp.index + ": " + gp.id +
                    ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.";
                console.log('found gamepad',info,gp)
                //gameLoop();
                clearInterval(interval);
            }
        }
    }

}

gamepads()

function renderROM(entry) {
    var p = document.createElement('p')
    var a = document.createElement('a')
    a.href = '#'
    a.innerText = entry.name
    a.addEventListener('click', function(e) {
        startGame(entry.name)
    })
    p.appendChild(a)
    return p
}

function renderROMs() {
    var div = document.getElementById('roms')
    if (ROMS.length > 0) {
        div.innerHTML = '<p>Previously entered ROMs</p>'
    } else {
        div.innerHTML = ''
    }
    for (var i=0;i<ROMS.length;i++) {
        var p = renderROM(ROMS[i])
        div.appendChild(p)
    }
}

function maybeLoadROMStartup() {
    if (true && window.ROMS.length > 0) {
        startGame(window.ROMS[0].name)
    }
    
}

function domContentLoaded() {

    window.ROMS = []
    
    webkitRequestFileSystem(window.PERSISTENT, FS_SIZE, function(fs) {
        console.log('got pers fs')
        var reader = fs.root.createReader()
        console.log('reader',reader)
        reader.readEntries( function(entries) {
            console.log('entries',entries)
            for (var i=0; i<entries.length; i++) {
                if (entries[i].name != '.snes9x') {
                    ROMS.push(entries[i])
                }
            }
            renderROMs()
            maybeLoadROMStartup()
        })
    }, function(e) { console.error('error reading FS',e) } )

    document.getElementById("savefolder").addEventListener('click', function(evt) {
        chrome.fileSystem.chooseEntry({type:'openDirectory'}, function(result) {
            console.log('choosedirectory result',result);
            var key = chrome.fileSystem.retainEntry(result)
            chrome.storage.local.set({'retainstr':key})
            // todo put in command with callback, timeout..
            send_mount(result)
        })
    })
    
  document.getElementById('romfile').addEventListener(
      'change', handleFileSelect, false);
}

function maybeRestoreEntry() {
    console.log('restore entry');
    chrome.storage.local.get('retainstr', function(d){
        if (d['retainstr']) {
            console.log('attempt restore entry',d['retainstr'])
            chrome.fileSystem.restoreEntry(d['retainstr'], function(result) {
                console.log('restored entry result',result);
                if (result) {
                    send_mount(result)
                }
            })
        }
    })
    
}

function send_mount(entry) {
    console.log("SEND_MOUNT",entry);
    var snes9x = document.getElementById("snes9x")
    if (snes9x) {
                document.getElementById("snes9x").postMessage({command:"mount",
                                                           id: Math.floor(Math.random() * Math.pow(2,32)),
                                                           filesystem:entry.filesystem,
                                                               fullPath:entry.fullPath})
    } else {
        console.error('cant send_mount, native module not loaded');
    }
}

function handleFileSelect(evt) {
  var file = evt.target.files[0];
  var reader = new FileReader();
  var result = null;

  console.log('reader.readAsArrayBuffer');
  reader.onloadend = onReadSuccess;
  reader.onerror = errorHandler;
  reader.readAsArrayBuffer(file);

  function onReadSuccess() {
    result = this.result;

    console.log('window.webkitRequestFileSystem');
    window.webkitRequestFileSystem(
        window.PERSISTENT, FS_SIZE, onRequestQuotaSuccess, errorHandler);
  }

  function onRequestQuotaSuccess(fs) {
    console.log('fs.root.getFile');
    fs.root.getFile(file.name, {create: true}, onGetFileSuccess, errorHandler);
  }

  function onGetFileSuccess(fileEntry) {
    console.log('fileEntry.createWriter');
    fileEntry.createWriter(onCreateWriterSuccess, errorHandler);
  }

  function onCreateWriterSuccess(writer) {
    console.log('writer.write');
    writer.onwriteend = onWriteSuccess;
    writer.onerror = errorHandler;
    var blob = new Blob([result]);
    writer.write(blob);
  }

  function onWriteSuccess() {
    console.log('startGame: ' + file.name);
      startGame(file.name);


      
  }
}

function errorHandler(error) {
  console.log('Error: ' + error);
}

function startGame(filename) {
  // Width and height in pixels of the SNES screen.
  var snesWidth = 256;
  var snesHeight = 239;
var SCALE=2
  var nacl = document.createElement('embed');
  nacl.setAttribute('id', 'snes9x');
  nacl.setAttribute('width', snesWidth * SCALE);  // Scale screen by 2x.
    nacl.setAttribute('height', snesHeight * SCALE);
    nacl.setAttribute('PS_STDOUT','dev/tty');
    nacl.setAttribute('PS_TTY_PREFIX','tty:');
    nacl.setAttribute('PS_EXIT_MESSAGE','exit');


    
  nacl.setAttribute('src', 'snes9x.nmf');
  nacl.setAttribute('type', 'application/x-nacl');
  nacl.setAttribute('ARG0',  'snes9x');
  nacl.setAttribute('ARG1',  filename);
  nacl.setAttribute('ARG2',  '-v1');  // Use "blocky" image scaling.


    
  // Remove previous embed element.
  document.getElementById('listener').innerHTML = '';
    document.getElementById('listener').appendChild(nacl);

    console.warn("waiting for debugger to attach...")

    // Not owner bug
        maybeRestoreEntry() // restore filesystem entry and pass message

    setTimeout( function() {
        // send a message
        //console.log('sending message now!')
        /*
        nacl.postMessage({'message': 'hey there',
                          'value':669})

        nacl.postMessage({'command': 'eat poop',
                          'id':669})
*/
    }, 1000)
    
    listener.addEventListener('message', function(message) {
        if (typeof message.data == 'string' && message.data.startsWith('tty:')) {
            console.log('%c ' + message.data.slice(4,message.data.length), 'color:#a32')
        } else {
            console.log('nacl message',message.data)
        }
    }, true);
}

document.addEventListener('DOMContentLoaded', domContentLoaded);
