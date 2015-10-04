
chrome.app.runtime.onLaunched.addListener(function(launchData) {
    console.log('quake app launch')
    
    //var args = "+skill 3 +map start"
    var args = "";
    
    //chrome.app.window.create('Client/WebQuake.htm' + '?' + encodeURIComponent(args),
    chrome.app.window.create('snes9x.html',
                             { defaultWidth: 540,
                               id:'snes',
                               defaultHeight: 667  },
                             function(w) {
                                 console.log('window created');
                             })

})
