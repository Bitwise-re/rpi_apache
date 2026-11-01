const delay = ms => new Promise(res => setTimeout(res, ms));

var clickedRecently = false
var addressCopyButtonClick = async (e) => {
    //anti-spam
    if(clickedRecently) { return; }
    clickedRecently = true

    // Use the Clipboard API
    navigator.clipboard.writeText($('#server-address serverAddress').text())

    //animate 'Copied !' text
    $('#server-address>p').css('display', 'block');
    for (let index = 0; index < 300; index++) {
        $('#server-address>p').css('top', (e.clientY - index/7).toString()+"px");
        $('#server-address>p').css('left', (e.clientX).toString()+"px");
        await delay(1)
    }
    $('#server-address>p').css('display', 'none');
    clickedRecently = false
}

$(document).ready(function () {
    $('#server-address').on("click", addressCopyButtonClick);
});


