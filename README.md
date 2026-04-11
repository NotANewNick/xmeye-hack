# CameraViewer

A single-file browser-based interface for **XM IP cameras** — the open-source
replacement for the Windows-only VideoPlayTool ActiveX plugin.

Works in any modern browser (Chrome, Firefox, Edge) via a lightweight Python
reverse proxy, or directly from the camera's own web server.

---

## Features

| Category | Features |
|----------|----------|
| **Live View** | Snapshot polling, MJPEG stream, adjustable refresh rate, frame save, RTSP URL display |
| **PTZ** | ONVIF ContinuousMove/RelativeMove, XM CGI OPPTZControl, XM CGI ptz.cgi — switchable at runtime |
| **Video** | Stream encoding (codec, resolution, FPS, bitrate, I-frame interval), ONVIF encoder config, video source info, privacy masks |
| **Image** | Brightness, contrast, saturation, hue, gain, acutance, noise filter, WDR, BLC, colour mode, day/night mode, mirror/flip, anti-flicker |
| **Audio** | Codec, sample rate, bit depth, input type, volume |
| **Network** | LAN, WiFi, NTP, DDNS, Email/SMTP, FTP, PPPoE, IP Filter, RTSP, UPnP, Cloud/P2P |
| **Device** | Device info, storage, date/time + timezone + DST, general settings, auto-maintenance, OSD, channel status, HDD manager, firmware info |
| **Recording** | Record control (config/manual/stop), snapshot config, storage position, record schedule, snapshot schedule |
| **Alarm** | Motion detection, video loss, video tamper, alarm input, alarm output, human detection, face detection, car detection, storage exceptions |
| **PTZ Config** | Protocol, address, baudrate, serial settings per channel (ONVIF, PELCO-D, PELCO-P, InteractCmd, Baude) |
| **Serial** | RS-232 and RS-485 port config |
| **Users** | List, create, delete, change password (via ONVIF) |
| **System Log** | System, Access, and Error log types |
| **Maintenance** | Reboot, config export, auto-reboot schedule |

---

## Quick Start

### Option A — Python Proxy (recommended)

The proxy handles CORS and forwards `/onvif/*` to port 8899.

```bash
cd CameraViewer/
python3 proxy.py
```

Open **http://localhost:8000** in your browser.

- Enter camera IP (default `192.168.1.10`), username, and password.
- Click **Connect**.

### Option B — Direct from Camera

Upload `CameraViewer.html` to the camera's web server, then open:

```
http://<camera-ip>/CameraViewer.html
```

CORS restrictions may block CGI calls if accessing from a different origin.

### Option C — CORS-disabled Browser (development)

```bash
# Chrome — launch with CORS disabled (Linux)
google-chrome --disable-web-security --user-data-dir=/tmp/chrome-dev
```

---

## Files

```
CameraViewer/
├── CameraViewer.html   # Complete application — single self-contained file
├── proxy.py            # Python 3 reverse proxy (no dependencies)
└── README.md           # This file
```

The entire application lives in `CameraViewer.html`.  No build step, no
dependencies beyond CryptoJS (loaded from CDN for AES support).

---

## Protocols

### XM CGI (port 80)

All camera configuration reads and writes use the XM proprietary CGI API.

| Endpoint | Purpose |
|----------|---------|
| `POST /cgi-bin/login.cgi` | GetSalt + Login |
| `POST /cgi-bin/getconfig.cgi` | Read any named config block |
| `POST /cgi-bin/setconfig.cgi` | Write any named config block |
| `POST /cgi-bin/OPPTZControl.cgi` | PTZ move (XM native) |
| `POST /cgi-bin/ptz.cgi` | PTZ move (alternative XM endpoint) |
| `GET /webcapture.jpg` | JPEG snapshot |
| `GET /cgi-bin/mjpg/video.cgi` | MJPEG stream |

**Authentication flow:**
1. `GetSalt` — camera returns a salt string and encryption type
2. `Login` — client sends `MD5_8(salt + MD5_8(password))`
3. On success, camera returns `SessionID` used in all subsequent requests
4. Keep-alive ping every 20 s prevents session timeout (~60 s)

**Return codes:**
- `Ret=100` — success
- `Ret=101` — wrong credentials
- `Ret=102` — account locked
- `Ret=607` — insufficient permissions (try admin account)

### ONVIF (port 8899)

SOAP 1.2 with WS-Security UsernameToken (SHA-1 PasswordDigest).

The proxy maps `/onvif/*` → `http://<camera>:8899/onvif/*`.

| Service path | Used for |
|-------------|----------|
| `/onvif/device_service` | GetDeviceInformation, GetCapabilities |
| `/onvif/media_service` | GetProfiles, GetStreamUri, GetSnapshotUri, encoder config |
| `/onvif/ptz_service` | PTZ move/stop/status/diagnostics |
| `/onvif/image_service` | Imaging settings (fallback) |
| `/onvif/event_service` | System log |

**Stream profile tokens:**
- `000` — Main stream (high resolution)
- `001` — Sub stream (lower resolution)
- `002` — Snap stream

---

## PTZ Troubleshooting

If the camera does not move when using the PTZ controls:

1. Use the **Debug PTZ** button in the live view sidebar.
2. Open the browser console (F12) for full diagnostic output.
3. The diagnostic runs 5 steps:
   - **GetProfiles** — checks which profiles have a PTZConfiguration assigned
   - **GetConfigurations** — lists PTZ config tokens and their node tokens
   - **GetNodes** — lists what movement spaces the node supports
   - **GetStatus** — reads current position and move status
   - **ContinuousMove** — sends a test move (Up, speed=0.1) and logs the raw response

4. If ONVIF ContinuousMove fails, try the **Control Method** dropdown:
   - `CGI OPPTZControl` — XM native PTZ (POST to `/cgi-bin/OPPTZControl.cgi`)
   - `CGI ptz.cgi` — alternative XM PTZ endpoint

**Common causes of PTZ not working:**
- Active stream profile (`000`) has no PTZConfiguration assigned in ONVIF
- PTZ node reports zero-range `SupportedPTZSpaces` (camera is fixed lens)
- Camera requires CGI control rather than ONVIF PTZ

---

## IP Address Format

XM cameras store IP addresses as little-endian 32-bit hex strings
(e.g. `192.168.1.10` → `0x0A01A8C0`).

The code transparently converts between formats:
- `hexIpToStr()` — hex or dotted string → dotted string for display
- `strIpToHex()` — dotted string → hex for writing back
- `ipInCameraFmt()` — preserves the format the camera originally used

---

## Camera Firmware Compatibility

Different XM firmware versions use different field names for the same setting.
The code checks both names on read and writes to whichever was present.

Known variants:
| Field | Variant A | Variant B |
|-------|-----------|-----------|
| Device name | `MachineName` | `DeviceName` |
| Date format | `DateFormat` | `DataFormat` |
| Video standard | `VideoStandard` | `PALNTSCStandard` |
| White balance | `WBMode` | `WhiteBalance` |

---

## AES Encryption (newer firmware)

Some firmware versions encrypt all CGI requests and responses with AES-128-CBC.
When the camera advertises `DataEncryptionType=AES` in the `GetSalt` response,
the login flow generates a random AES key, RSA-encrypts it, and all subsequent
API calls are encrypted transparently.  CryptoJS is loaded from CDN for this.

---

## Browser Requirements

- Chrome 90+, Firefox 88+, Edge 90+
- `crypto.subtle` (Web Crypto API) must be available — requires HTTPS or
  localhost (both satisfied by `proxy.py`)

---

## Known Limitations

- **No live H.264/H.265 decode** — the browser cannot decode the camera's
  native RTSP stream.  Live view uses JPEG snapshots or HTTP MJPEG.
  For true video, paste the RTSP URL into VLC.
- **WiFi changes require a reboot** to take effect.
- **Firmware upgrade** uploads the file but depends on camera-side support for
  the `/cgi-bin/upgrade.cgi` endpoint.
- **Privacy masks** are edited as raw coordinate values — no canvas overlay.

---

## License

MIT — free to use, modify, and redistribute.
