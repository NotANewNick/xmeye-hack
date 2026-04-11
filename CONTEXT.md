# CameraViewer — Project Context

## What This Is

A standalone single-file browser-based camera viewer (`CameraViewer.html`) that replaces the
Windows-only VideoPlayTool IE ActiveX plugin used to access an XM IP camera at `192.168.1.10`.

The original plugin required Internet Explorer and a proprietary ActiveX control. This replacement
works in any modern browser (Chrome, Firefox, Edge) when served through `proxy.py`.

---

## Files

| File | Purpose |
|------|---------|
| `CameraViewer.html` | The entire application — ~3980 lines, single file, no external dependencies |
| `proxy.py` | Python HTTP proxy server. Serves the HTML at `localhost:8000` and forwards all camera requests, solving the browser CORS restriction. Run with: `python3 proxy.py [camera_ip] [port] [user] [pass]` |
| `plugin_src/` | Extracted JavaScript/HTML from the original XM camera web interface — used as reference for CGI API names, field names, and expected behaviour |

---

## How to Run

```bash
cd CameraViewer/
python3 proxy.py 192.168.1.10 8000 admin admin
# Then open http://localhost:8000 in browser
```

---

## Architecture

### Two parallel protocols

**XM CGI (port 80)** — used for all configuration read/write:
- Login: `POST /cgi-bin/login.cgi` with `{Name:"GetSalt"}` → get salt → compute `MD5_8(user+password+salt)` → `{Name:"Login", UserName, PassWord, EncryptType:"MD5"}`
- Read config: `POST /cgi-bin/getconfig.cgi` `{Name:"Config.Key", SessionID, Salt}`
- Write config: `POST /cgi-bin/setconfig.cgi` `{Name:"Config.Key", "Config.Key":{...fields...}, SessionID, Salt}`
- Session kept alive by pinging `KeepAlive` config every 20 seconds
- Some firmware versions encrypt the body with AES (handled by `xmAesEncrypt`/`xmAesDecrypt`)

**ONVIF (port 8899)** — used for live stream discovery, PTZ control, time sync:
- Proxied via `/onvif/` path prefix → proxy routes to `http://192.168.1.10:8899/...`
- Auth: WS-Security UsernameToken with PasswordDigest (SHA1 of nonce+created+password)
- Endpoints discovered via `GetCapabilities` during login
- XM-specific profile tokens: `000` (main stream), `001` (sub stream), `002` (snap stream)

### Proxy routing (proxy.py)
```
Browser → localhost:8000/         → serves CameraViewer.html
Browser → localhost:8000/onvif/*  → http://192.168.1.10:8899/onvif/*
Browser → localhost:8000/cgi-bin/* → http://192.168.1.10/cgi-bin/*
Browser → localhost:8000/other    → http://192.168.1.10/other
```
The proxy also rewrites camera IPs in ONVIF responses so XAddr URLs point back through itself.

---

## XM CGI Config Key Reference

| Config key | What it controls |
|-----------|-----------------|
| `NetWork.NetCommon` | LAN IP, mask, gateway, ports |
| `NetWork.Wifi` | WiFi SSID, auth, encryption, keys, IP |
| `NetWork.NetNTP` | NTP server, enable |
| `NetWork.NetDDNS.[0]` | DDNS provider, domain, credentials |
| `NetWork.NetEmail` | SMTP server, email recipients |
| `NetWork.NetFTP` | FTP server, path, credentials |
| `NetWork.NetPPPoE` | PPPoE username/password |
| `NetWork.NetIPFilter` | IP allowlist/blocklist |
| `NetWork.RTSP` | RTSP port, auth mode |
| `NetWork.UPNP` | UPnP enable, port mappings |
| `NetWork.Nat` | Cloud/P2P enable, server, port |
| `NetWork.ChnStatus` | Channel status info (read-only) |
| `General.General` | Device name, video standard, language, date/time format, DST settings |
| `General.AutoMaintain` | Auto reboot schedule, auto delete old files |
| `General.Machine` | Device SN/P2P ID (read-only) |
| `Camera.Param.[0]` | Brightness, contrast, saturation, hue, sharpness, IR cut, exposure, WB, BLC, gain, noise filter, slow shutter, corridor mode |
| `Camera.ParamEx.[0]` | Anti-flicker, WDR, defog, image stabilization, day/night mode, flip |
| `Camera.Color.[0]` | Hue, brightness, contrast, saturation, gain, gamma, sharpness |
| `AVEnc.VideoWidget` | OSD overlays, privacy masks (Cover array), color overlays |
| `Simplify.Encode` | Stream encoding for main/sub/snap: codec, resolution, fps, bitrate, audio |
| `AVEnc.SmartH264` / `AVEnc.SmartH264V2` | Smart H264/H265 encoding |
| `Record` | Recording mode (always/motion/scheduled), stream selection |
| `Storage.Snapshot.[0]` | Snapshot interval, stream, quality, storage |
| `Storage.StorageNotExist` | Alarm: no HDD |
| `Storage.StorageFailure` | Alarm: HDD failure |
| `Storage.StorageLowSpace` | Alarm: HDD low space |
| `Alarm.NetAbort` | Alarm: network disconnect |
| `Alarm.NetIPConflict` | Alarm: IP conflict |
| `Detect.MotionDetect.[0]` | Motion detection: enable, sensitivity, region, schedule, event actions |
| `Detect.VideoLoss.[0]` | Video loss detection |
| `Detect.BlindDetect.[0]` | Blind/tamper detection |
| `Alarm.AlarmIn.[0]` | External alarm input |
| `Alarm.AlarmOut.[0]` | External alarm relay output |
| `Detect.HumanDetect.[0]` | Human/person detection (AI) |
| `Detect.FaceDetection.[0]` | Face detection (AI) |
| `Detect.CarShapeDetection.[0]` | Vehicle detection (AI) |
| `Uart.PTZ.[0]` | PTZ serial port config (RS-485) |
| `Uart.Comm.[0]` | RS-232 serial port config |
| `Uart.RS485` | RS-485 settings |
| `NetWork.OnlineUpgrade` | Auto firmware check settings |

### EventHandler fields (alarm event actions)
The alarm event handler object inside detection configs uses these fields
(field name varies by firmware version — code checks both variants):

| Our form field | Camera field variants | Meaning |
|---|---|---|
| Record on Alarm | `Record` | Start recording on trigger |
| Send Email | `SendEmail` / `MailEnable` | Send SMTP alert |
| Upload Snapshot (FTP) | `FTPEnable` / `AlarmFTP` | FTP snapshot upload |
| Snapshot Upload | `AlarmUpload` / `SnapEnable` | Generic snapshot upload |
| Show Popup Message | `TipEnable` / `MessageEnable` | On-screen popup |
| Write to Log | `LogEnable` | Write to event log |
| Trigger Alarm Output | `AlarmOutEnable` / `AlarmOut` | Trigger relay |
| Alarm Out Latch (s) | `AlarmOutLatch` / `EventLatch` | Relay hold duration |

### TimeSchedule format
Recording/snapshot schedules use `TimeSchedule` — array of 7 day objects:
```json
{"DayNo": 0, "TimeSection": ["1 00:00:00-24:00:00", "0 00:00:00-00:00:00", ...]}
```
Type prefixes: `0`=none, `1`=normal/always, `2`=motion-triggered, `4`=alarm-triggered.
Older firmware uses array format instead: `[type, startH, startM, endH, endM]`.
The `_parseTimeSection()` helper handles both.

---

## IP Address Format

XM cameras store IP addresses as little-endian hex strings, e.g. `"0xC0A8010A"` = `192.168.1.10`.
Some firmware versions use plain dotted strings instead.

Helper functions handle both:
- `hexIpToStr(h)` — converts hex or dotted to display string
- `strIpToHex(s)` — converts dotted string to hex
- `ipInCameraFmt(newIp, origVal)` — returns IP in whichever format the camera originally used

---

## ONVIF PTZ Status

**Camera supports ONVIF PTZ** — confirmed working via external ONVIF tool.

**Current issue (under investigation):** PTZ requests reach the camera (`POST /onvif/ptz_service`
appears in proxy terminal) but camera does not move.

**Debug approach added:** "Debug PTZ" button calls `GetConfigurations` and shows the raw result
in the PTZ status line. PTZ errors now surface visibly (previously silently swallowed).

**Suspected causes (in order of likelihood):**
1. Profile token `000` may not have a PTZConfiguration linked → camera rejects ContinuousMove
   with a SOAP fault that we previously ignored
2. `GetCapabilities` may be failing silently → `S.ptzEp` stays as default `/onvif/ptz_service`
   which may or may not be correct
3. SOAP fault in response was not detected (fixed — `soap()` now throws on `<Fault>` elements)

**Next step:** User needs to press "Debug PTZ" button and report what the ptzStatus line shows.

---

## Live Stream

Two modes selectable from the sidebar dropdown:
- **Snapshot polling** — fetches `/webcapture.jpg?SessionID=...&Salt=...` at configurable interval
- **MJPEG** — tries multiple common MJPEG paths (camera-specific, fallback chain)

True RTSP streaming is not possible from a browser without a relay; RTSP URLs are shown for
use in VLC/external players.

Snapshot URL format (XM-specific): `/webcapture.jpg?command=snap&channel=0&subtype=0&SessionID=X&Salt=Y`

---

## Known Field Name Variations (firmware version differences)

XM firmware varies across camera models. The code checks both variants when reading/writing:

| Concept | Variant A | Variant B |
|---------|-----------|-----------|
| Device name | `MachineName` | `DeviceName` |
| Date format | `DateFormat` | `DataFormat` |
| Date separator | `DateSeparator` | `DataSeparator` |
| Time format | `TimeFormat` (string) | `TimeMode` (0/1 int) |
| DST enable | `DSTEnable` | `DSTenable` |
| DST offset | `DSTOffset` | `DstOffset` |
| White balance | `WhiteBalance` | `WBMode` |
| BLC mode | `BLCMode` | `BLC` |
| Gain strength | `GainStrength` | `Gain` |
| Noise filter day | `NoiseFilterDay` | `DayNFLevel` |
| Noise filter night | `NoiseFilterNight` | `NightNFLevel` |
| Corridor mode | `Correction` | `CorridorMode` |
| HDD full | `HddFullStrategy` | `HddFull` (0/1 int) |
| Auth (WiFi) | `Auth` | `AuthMode` |
| Encryption (WiFi) | `EncrypType` | `EncryptType` |
| WiFi key | `Keys[0]` array | `Key` string |
| RTSP auth | `AuthEnable` | `AuthMode` |
| Cloud server | `NatAddress` | `Server` |
| Cloud port | `NatPort` | `Port` |
| DNS servers | `DnsServers[0/1]` | `DNS1`/`DNS2` |
| Audio codec | `Encode` | `Compression` |
| Audio bitrate | `Bitrate` | `BitRate` |
| Privacy mask | `Cover` array | `CoverEx` array |
| Alarm mail | `SendEmail` | `MailEnable` |
| Alarm FTP | `FTPEnable` | `AlarmFTP` |
| Alarm snapshot | `AlarmUpload` | `SnapEnable` |
| Alarm popup | `TipEnable` | `MessageEnable` |
| Alarm relay | `AlarmOutEnable` | `AlarmOut` |
| Alarm latch | `AlarmOutLatch` | `EventLatch` |

---

## Tab / Page Structure

### Live View
- Live image (snapshot polling or MJPEG)
- Sidebar: profile selector, live mode, refresh rate, PTZ controls + speed slider, stream URLs

### Video Tab
- Stream Encoding (Simplify.Encode) — codec, resolution, fps, bitrate for main/sub/snap
- ONVIF Encoder Profiles
- Video Source (resolution, frame rate)
- Image Settings (Camera.Param) — brightness/contrast/saturation/hue/sharpness/IR cut/exposure/WB/BLC/gain/noise filter/slow shutter/corridor
- Color Settings (Camera.Color)
- Advanced Image (Camera.ParamEx) — anti-flicker/WDR/defog/stabilization/day-night/flip
- Audio Settings (Simplify.Encode audio fields)
- Privacy Masks (AVEnc.VideoWidget Cover array, up to 4 masks)

### Network Tab (sub-tabs)
- LAN, WiFi, NTP, DDNS, Email, FTP, PPPoE, IP Filter, RTSP, UPnP, Cloud/P2P

### Device Tab
- Device Info (read-only: model, serial, firmware, MAC, IP)
- Storage (HDD list, read-only)
- Time (ONVIF: timezone dropdown + DST, sync to browser, set manually)
- General Settings (name, video std, language, date/time format, DST schedule)
- Maintenance (auto reboot, auto delete, export config, reboot)
- PTZ Configuration (RS-485 protocol, baud, parity, data/stop bits per channel)
- RS-232 Serial
- RS-485 Serial
- OSD (on-screen display overlays)
- HDD Manager (format disks)
- Channel Status
- Firmware (info, auto-check, online update, file upload)

### Recording Tab
- Record Control (always/motion/scheduled per stream)
- Snapshot Config (interval, quality, stream)
- Storage Location
- Record Schedule (7-day × 3-period grid, types: none/always/motion/alarm)
- Snapshot Schedule

### Alarm Tab
- Motion Detection
- Video Loss
- Blind/Tamper Detection
- Alarm Input (external sensor)
- Alarm Output (relay)
- Human Detection (AI)
- Storage Exceptions (no HDD, HDD failure, low space, network disconnect, IP conflict)
- Face Detection (AI)
- Vehicle Detection (AI)

### Users Tab
- List users, change password, delete user, create user (via ONVIF)

### Event Log Tab
- System log viewer (via ONVIF GetSystemLog)

---

## Outstanding / Known Issues

1. **PTZ ContinuousMove** — requests reach camera but camera does not respond. Root cause unknown
   pending "Debug PTZ" button output. SOAP fault detection now in place.

2. **ROI settings** (`AVEnc.ROI`) — requires canvas drawing UI, not yet implemented.

3. **Smart H264/H265** (`AVEnc.SmartH264` / `AVEnc.SmartH264V2`) — not yet in encoding UI.

4. **Intelligent Alarm / Smart Alarm** (`Detect.Analyze`, `Alarm_Intelligent.js`) — not implemented.

5. **Customer Flow counting** (`Info_CustomerFlow.js`) — not implemented.

6. **QR Code / App download info** (`Info_QR.js`) — not implemented.

7. **Full XM user management** — currently uses ONVIF for user ops; XM CGI has a richer user
   management API (`System.ExUserMap`, `GetAllUser`, `GetAllGroup`) not yet used.

8. **Display/OSD layout** (`System_Display.js`) — channel title positioning not fully implemented.

---

## Timezone (ONVIF TZ format)

The ONVIF `SetSystemDateAndTime` uses POSIX TZ strings. **POSIX sign is inverted from UTC:**
- UTC+8 (China) = POSIX `CST-8` (local is 8 hours EAST = subtract 8 to get UTC)
- UTC-5 (Eastern US) = POSIX `EST5` (local is 5 hours WEST = add 5 to get UTC)

The dropdown in the Time section covers UTC−12:00 through UTC+14:00 with half-hour variants.
Current camera TZ is matched on load; unrecognised values are shown as "(current)" and preserved.

---

## WiFi Notes

- Password field is never pre-filled (camera may return empty or encrypted value)
- Leave password field empty on save to keep existing password
- DHCP/Static toggle: when DHCP is selected, IP fields are hidden and not sent
- IP format detection: code preserves whether camera uses hex (`0x...`) or dotted string format
- Auth type saved to both `Auth` and `AuthMode` fields for firmware compatibility
- WPA uses `Keys[0]`; WEP uses `KeyIndex` to select active key from 4-key array

---

## Session History — What Was Built & When

### Session 1–2 (foundation)
- Full login flow: XM CGI GetSalt → MD5_8 → session auth
- AES body encryption support for newer firmware
- ONVIF discovery: GetDeviceInformation, GetProfiles, GetStreamUri, GetSnapshotUri
- Snapshot polling live view + MJPEG fallback chain
- Basic settings pages: LAN, NTP, DDNS, Email, FTP, PPPoE, IP Filter
- Motion detect, video loss, blind detect, alarm in/out
- User management (ONVIF), system log, OSD, record control, snapshot config
- proxy.py: CORS bridge, `/set-cam-credentials` endpoint, URL rewriting

### Session 3 (gap-fill pass 1)
- Fixed snapshot display (black box issue — now shows in live view correctly)
- Added WiFi settings tab
- Added full image settings (Camera.Param, Camera.ParamEx, Camera.Color)
- Added PTZ config (RS-485 serial, baud/parity/data/stop bits)
- Added RS-232 and RS-485 serial config
- Added OSD improvements
- Fixed hexIpToStr/strIpToHex + added ipInCameraFmt for format detection

### Session 4 (gap-fill pass 2 — "check everything again" + /effort high)
Added all missing functions:
- `loadNetRtsp`/`saveNetRtsp` — RTSP port, auth mode
- `loadNetUpnp`/`saveNetUpnp` — UPnP enable + port mapping table
- `loadNetCloud`/`saveNetCloud` — Cloud/P2P server, device SN
- `loadAudioSettings`/`saveAudioSettings` — codec, sample rate, bitrate, volume
- `loadPrivacyMasks`/`savePrivacyMasks` — 4 privacy mask rectangles (0–8191 coords)
- `loadRecordSchedule`/`saveRecordSchedule` — 7-day × 3-period schedule grid
- `loadSnapSchedule`/`saveSnapSchedule` — snapshot schedule grid
- `loadHddManager`/`formatHdd` — HDD list + format button
- `loadChanStatus` — channel status display
- `loadFirmwareInfo`/`checkOnlineUpdate`/`uploadFirmware` — firmware management
- `loadFaceDetect`/`saveCarDetect`/`loadCarDetect`/`saveFaceDetect` — AI detection
- Fixed `saveStorageExceptions` to save AutoReboot, LowSpacePercentage, CheckInterval
- Expanded `buildAlarmHandlerHtml` to all 8 event action fields
- Expanded `loadGeneral`/`saveGeneral` with date format, time format, full DST (10 fields)
- Added Data/Stop bits to PTZ and RS-232 config

### Session 5 (WiFi + PTZ + timezone)
- **WiFi rewrite**: DHCP/Static toggle, IP format detection, auth-dependent password
  visibility, WEP vs WPA key handling, DNS fields, format-preserving save
- **WiFi password**: never pre-fill from camera, only update if user types new value
- **Timezone**: replaced text input with full dropdown (38 entries, UTC-12 to UTC+14,
  half-hour variants), POSIX TZ strings, matches camera's current value on load
- **PTZ GetCapabilities**: during login, calls GetCapabilities to discover real
  service endpoints; sets `S.hasPtzCapability=true` when PTZ XAddr found
- **PTZ visibility**: shows PTZ section when `hasPtz || hasPtzCapability`
- **PTZ errors now visible**: errors surface in ptzStatus div + console.error
- **SOAP fault detection**: `soap()` now throws on `<Fault>` elements
- **SOAP 1.1 support**: `soap(ep, action, body, true)` for cameras needing text/xml
- **PTZ speed slider**: added to sidebar
- **ptzDebug button**: calls GetConfigurations to show what PTZ configs camera reports

---

## PTZ Debug — NEXT STEP

After restarting, user needs to:
1. Load page, connect to camera
2. Click **"Debug PTZ"** button in the PTZ sidebar section
3. Report what appears in the small status line below the speed slider

Expected output will be one of:
- `PTZ configs: cfg:XXX (name) | ep:/onvif/ptz_service | profTok:000` → PTZ configs found, check if profTok matches
- `GetConfigurations failed: SOAP Fault: ... NoPTZProfile` → profile lacks PTZ config, need AddPTZConfiguration
- `GetConfigurations failed: SOAP Fault: ... InvalidToken` → wrong profile token
- `GetConfigurations failed: HTTP 401` → auth issue on PTZ endpoint
- `GetConfigurations returned no PTZ configs` → camera has no PTZ ONVIF config

Also: when pressing a direction button, the ptzStatus line now shows the camera's exact
SOAP fault message if one is returned.

---

## Code Patterns Used Throughout

```javascript
// Read a config
var r = await cfgGet('Some.Key');
if (r.Ret !== 100) throw new Error('Ret=' + r.Ret);
var obj = r['Some.Key'];

// Write a config (read-modify-write pattern — always read first)
var r = await cfgGet('Some.Key');
var obj = Object.assign({}, r['Some.Key']);
obj.Field = newValue;
var s = await cfgSet('Some.Key', {'Some.Key': obj});
if (s.Ret !== 100) throw new Error('Ret=' + s.Ret);

// ONVIF SOAP call
var doc = await soap(S.devEp, 'http://www.onvif.org/ver10/device/wsdl/SomeAction',
    '<tds:SomeAction/>');
var value = xv(doc, 'TagName');            // get first matching tag's text
var elements = xa(doc, 'TagName');         // get all matching tags

// Dual field name (firmware compat)
if (obj.FieldA !== undefined) obj.FieldA = value;
if (obj.FieldB !== undefined) obj.FieldB = value;
```

---

## Proxy Notes

`proxy.py` also has a `/set-cam-credentials` POST endpoint. The HTML calls this after
login to push the username/password to the proxy so it can handle HTTP Digest auth on
endpoints like `/webcapture.jpg` that use HTTP-level auth rather than session cookies.
