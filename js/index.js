
// ******* SERVER STATUS CHEKING *******

var checkingServerStatus = false; // used for anti-spam
var getServerStatus = ()=>{

    //if already processing, don't process the new request
    if(checkingServerStatus) { return; }
    checkingServerStatus = true;
    $('#server-status-reload').addClass('reloading');

    //reset status
    $('#server-status>caption>span>p')[0].innerText = "LOADING"
    $('#server-status').removeAttr('class');
    $('#players')[0].innerText = "Players : --/--"
    $('#version')[0].innerText = "Version : -.--.-"

    // set timeout for anti-spam
    setTimeout(()=>{
        //get server status
        $.getJSON('https://api.mcsrvstat.us/3/bitwise.re:1070', (data)=>{
            if(!data.online){ //if offline, set corresponding status
                $('#server-status>caption>span>p')[0].innerText = "OFFLINE";
                $('#server-status').addClass('off');
                return;
            }

            // if online, set corresponding status and display server properties (player count & version)
            $('#server-status>caption>span>p')[0].innerText = "ONLINE";
            $('#server-status').addClass('on');
            $('#players')[0].innerText = `Players : ${data.players.online}/${data.players.max}`;
            $('#version')[0].innerText = `Version : ${data.version}`;
        })
        //open again to new requests
        checkingServerStatus = false;
        $('#server-status-reload').removeClass('reloading');
    }, 1000)
}

// when loading page, get server status
jQuery(()=>{
    getServerStatus();
})

const delay = ms => new Promise(res => setTimeout(res, ms));

var clickedRecently = false
var adressCopyButtonClick = async (e) => {
    //anti-spam
    if(clickedRecently) { return; }
    clickedRecently = true

    // Use the Clipboard API
    navigator.clipboard.writeText($('#server-adress serverAdress').text())

    //animate 'Copied !' text
    $('#server-adress>p').css('display', 'block');
    for (let index = 0; index < 300; index++) {
        $('#server-adress>p').css('top', (e.clientY - index/7).toString()+"px");
        $('#server-adress>p').css('left', (e.clientX).toString()+"px");
        await delay(1)
    }
    $('#server-adress>p').css('display', 'none');
    clickedRecently = false
}

$(document).ready(function () {
    $('#server-adress').on("click", adressCopyButtonClick);
});