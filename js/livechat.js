document.addEventListener('DOMContentLoaded', () => {
    const chatLive = document.getElementById('chat-live');

    // new chat line
    const appendChat = (text) => {
        const p = document.createElement('p');
        p.textContent = text;
        chatLive.append(p);
        chatLive.append(document.createElement('br'));

        const BOTTOM_TOLERANCE = 40; // px, absorbs line-height / sub-pixel rounding
        // If scrolled up, leave scrollTop untouched: older messages keep their
        // position and new ones accumulate below without disturbing the view.
        if (chatLive.scrollHeight - chatLive.scrollTop - chatLive.clientHeight <= BOTTOM_TOLERANCE) {
            chatLive.scrollTop = chatLive.scrollHeight; // follow the newest message
        }
    };

    const rpi = new EventSource('livechat.php?action=stream');

    rpi.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== "Mmsg") { return; } // only act on minecraft messages
        appendChat(data.msg);
    };

    rpi.onerror = () => {
        console.warn('SSE disconnected, attempting reconnection...');
    };

    // Handshake
    fetch('livechat.php?action=hello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'hello' }),
    })
        .then((response) => response.json())
        .catch((error) => console.error('handshake failed:', error));

    const form = document.querySelector('.minecraft-chat form');
    form.addEventListener('submit', (event) => {
        // don't submit an empty message: the server rejects it and the browser logs an error
        if (form.elements.chatmsg.value.trim() === '') {
            event.preventDefault();
            return;
        }

        // resets the chat input when msg sent
        setTimeout(() => { // set timeout to fire after the form is sent
            form.elements.chatmsg.value = '';
        }, 0);
    });
});
