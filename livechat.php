<?php

// mcchat mod socket
const MCCHAT_SOCKET = '/run/mcchat/mcchat.sock';

// formats the data to a json both the client and api accepts
function fjson($data) {
    try {
        return json_encode(
            $data,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR
        );
    } catch (JsonException $e) {
        // never let an encoding failure turn into a bare 500
        return '{"ok":false,"error":"json encoding failed"}';
    }
}

// reports a socket error in the format the current request expects, then stops
function mcchat_fail($message, $purpose, $socket = null) {
    if ($socket !== null) {
        fclose($socket);
    }

    if ($purpose === "sse") {
        echo "event: error\n";
        echo 'data: ' . fjson(['error' => $message]) . "\n\n";
        @flush();
        exit;
    }

    http_response_code(503);
    header('Content-Type: application/json');
    echo fjson(['success' => false, 'error' => $message]);
    exit;
}

// opens a socket
function mcchat_socket($timeout = 2.0, $purpose = "once") {
    $errno = 0;
    $errstr = '';
    $socket = @stream_socket_client('unix://' . MCCHAT_SOCKET, $errno, $errstr, $timeout);

    if ($socket === false) {
        mcchat_fail("socket {$errstr} ({$errno})", $purpose);
    }

    stream_set_timeout($socket, (int) $timeout);
    stream_set_read_buffer($socket, 0);

    mcchat_send_frame($socket, ['type' => 'hello']);

    stream_set_timeout($socket, 2);
    $line = fgets($socket);
    $reply = $line === false ? null : json_decode(trim($line), true);
    if (($reply['type'] ?? '') !== "ack") {
        $received = $line === false ? 'nothing' : trim($line);
        mcchat_fail("expected ack response, received: {$received}", $purpose, $socket);
    }

    return $socket;
}

// use this to write to socket to avoid forgetting to flush
function mcchat_send_frame($socket, $frame) {
    fwrite($socket, fjson($frame) . "\n");
    fflush($socket);
}

// file entry point

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Handshake
if ($action === 'hello') {
    if ($method !== 'POST') {
        http_response_code(405);
        exit;
    }

    $socket = mcchat_socket();
    fclose($socket);

    header('Content-Type: application/json');
    echo fjson(['success' => true]);
    exit;
}

// Send message (web -> minecraft)
if ($action === 'send') {
    if ($method !== 'POST') {
        http_response_code(405);
        exit;
    }

    $body = $_POST['chatmsg'] ?? '';
    $username = $_POST['username'] ?? '';

    if ($body === '') {
        http_response_code(405);
        exit;
    }

    $fusername = $username === '' ? '' : ("<" . $username . "> ");

    $msg = "[webchat] " . $fusername . $body;
    $socket = mcchat_socket();

    mcchat_send_frame($socket, [
        'type' => 'Wmsg',
        'msg' => $msg,
    ]);

    fclose($socket);
    exit;
}

// Listener (SSE)
if ($action === 'stream') {
    if ($method !== 'GET') {
        http_response_code(405);
        exit;
    }

    @set_time_limit(0);
    @ini_set('zlib.output_compression', '0');

    if (function_exists('apache_setenv')) {
        @apache_setenv('no-gzip', '1');
    }

    while (ob_get_level() > 0) {
        @ob_end_flush();
    }

    header('Content-Type: text/event-stream; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    echo "retry: 3000\n\n";
    @flush();

    $socket = mcchat_socket(purpose: "sse");

    // main listen loop (for new messages in chat)
    while (!feof($socket)) {
        $line = fgets($socket);

        if ($line === false) {
            $meta = stream_get_meta_data($socket);

            if (!empty($meta['timed_out'])) {
                echo ": keep-alive\n\n";
                @flush();
                continue;
            }
            break;
        }

        $frame = json_decode(trim($line), true);

        if (!is_array($frame)) {
            continue;
        }

        if (($frame['type'] ?? '') === 'Mmsg') {
            echo 'data: ' . fjson($frame) . "\n\n";
            @flush();
        }
    }

    fclose($socket);
    exit;
}

http_response_code(404);
