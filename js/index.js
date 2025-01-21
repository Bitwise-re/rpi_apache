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