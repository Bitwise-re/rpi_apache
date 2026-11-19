# Rpi Apache

A BIOS-themed homepage for a Raspberry Pi Apache server. It provides a retro
web UI with a colour theme toggle, live Minecraft server status and a web chat
bridged to Minecraft.

## Stack

- Static `index.html` with component styles in `css/index.css`
- Colour palettes as CSS custom properties in `css/light.css` and `css/dark.css`
- Vanilla DOM handling plus jQuery 3.7.1 (loaded from Google CDN with SRI) in `js/`
- `livechat.php` for the chat bridge; no database or build step
- Images and the Perfect DOS VGA 437 font in `medias/`

## Features

- **Theme toggle** — `js/theme.js` toggles `.dark` on `<html>` and persists the
  choice in `localStorage` under `theme`. Without a saved choice it follows the
  OS `prefers-color-scheme` setting.
- **Minecraft server status** — `js/minecraft-server-status.js` queries
  `https://api.mcsrvstat.us/3/bitwise.re:1070` and updates the players, version
  and online/offline indicator. The reload button is anti-spam throttled.
- **Minecraft web chat** — `js/livechat.js` uses Server-Sent Events for incoming
  messages and a POST form for outgoing ones. `livechat.php` exposes three
  actions:
  - `hello` (POST): handshake / connectivity check
  - `send` (POST): forwards `chatmsg` and optional `username` to Minecraft
  - `stream` (GET): SSE stream of incoming Minecraft messages

## Requirements

- Apache with PHP (CLI is enough for `php -l`)
- The `mcchat` daemon exposing its Unix socket at `/run/mcchat/mcchat.sock`,
  readable and writable by the web server user. Without it, chat endpoints
  respond with `503`.
- Internet access from the browser for the jQuery CDN, the GitHub avatar and
  the Minecraft status API

## Running locally

Serve the directory with any static server that also executes PHP, e.g.:

```sh
php -S localhost:8000
```

Then open <http://localhost:8000>. The theme and server status work without a
backend; the chat endpoints need the `mcchat` socket described above.

## Deployment

`.github/workflows/main.yml` runs on every push to `main`, connects over SSH
using the `SSH_HOST`, `SSH_USERNAME`, `SSH_KEY` and `SSH_PORT` secrets and runs
`git pull` in `/var/www/html`. Pushes to other branches (such as `livechat`)
are not deployed automatically.

## License

Apache License 2.0 — see [LICENSE](LICENSE).
