# FingerprintFog

FingerprintFog is a demo project for testing browser fingerprint obfuscation.

It includes:

- a Python/Streamlit simulation of fingerprint obfuscation
- a Chrome extension that changes JavaScript-visible browser fingerprint values
- a local test page that shows whether the extension is working
- a toolbar popup with profile selection and a Cover Your Tracks shortcut

This is a validation prototype, not production privacy software.

## Project Files

- `app.py` - Streamlit simulation UI
- `data.py` - base fingerprint data and possible rotated values
- `simulator.py` - creates baseline and obfuscated simulated sessions
- `tracker.py` - toy tracker similarity scoring
- `requirements.txt` - Python packages for the Streamlit demo
- `extension/` - Chrome extension files
- `web/fingerprint-test.html` - local browser fingerprint test page

## Quick Test

Use this flow to prove the extension changes browser-exposed fingerprint values.

### Option A: Run the Streamlit Simulation

Use this if you want to see the toy tracker experiment first.

Install the Python packages:

```bash
cd /Users/alina/Desktop/sab/fingerprintfog
pip3 install -r requirements.txt
python3 -m pip install streamlit
pip3 install streamlit
```

Run the Streamlit app:

```bash
python3 -m streamlit run app.py
```

Then open the URL Streamlit prints, usually:

```text
http://localhost:8501
```

In the Streamlit app:

1. Click **Generate New Obfuscated Session**
2. Compare the original and obfuscated fingerprints
3. Click **Run Experiment**
4. Check whether the tracker links fewer obfuscated sessions as the same user

### Option B: Test the Real Chrome Extension

Use this if you want to validate browser-exposed values in Chrome.

### 1. Start the Local Test Server

Open Terminal and run:

```bash
cd /Users/alina/Desktop/sab/fingerprintfog
python3 -m http.server 8000
```

Leave Terminal open.

If you see this error:

```text
OSError: [Errno 48] Address already in use
```

use a different port:

```bash
python3 -m http.server 8001
```

### 2. Open the Local Fingerprint Test Page

In Chrome, open one of these URLs:

```text
http://localhost:8000/web/fingerprint-test.html
```

or, if you used port `8001`:

```text
http://localhost:8001/web/fingerprint-test.html
```

Before loading the extension, the page should say:

```text
Unprotected
```

The raw JSON should show:

```json
"fog": null
```

This is your original browser fingerprint.

### 3. Load the Chrome Extension

In Chrome:

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select this folder:

```text
/Users/alina/Desktop/sab/fingerprintfog/extension
```

Important: select the `extension` folder, not the whole `fingerprintfog` folder.

### 4. Reload the Test Page

Go back to the local test page and press:

```text
Command + R
```

Now the page should say:

```text
Protected
```

The raw JSON should show something like:

```json
"fog": {
  "enabled": true,
  "profileName": "linux-los-angeles"
}
```

That proves the extension is active.

### 5. Compare Before and After

Compare the original fingerprint with the protected fingerprint.

Fields that should change include:

- `userAgent`
- `platform`
- `language`
- `languages`
- `hardwareConcurrency`
- `deviceMemory`
- `timezone`
- `timezoneOffset`
- `screen`
- `canvasHash`
- `webgl`

If those values changed, FingerprintFog is obfuscating JavaScript-visible fingerprint data.

## Use the Toolbar Popup

After loading the extension, click the FingerprintFog icon in Chrome's toolbar.

The popup lets you:

- choose `Random per tab`
- choose a fixed profile like `Mac / New York`, `Windows / Chicago`, or `Linux / Los Angeles`
- reload the current tab
- open the local test page
- open Cover Your Tracks

After changing the profile, click **Reload tab** or press `Command + R` on the page.

## Test with Cover Your Tracks

Cover Your Tracks is an external browser fingerprinting test from EFF:

```text
https://coveryourtracks.eff.org/
```

Recommended test:

1. Disable FingerprintFog in `chrome://extensions`
2. Open Cover Your Tracks and run the test
3. Save or screenshot the result
4. Enable FingerprintFog again
5. Reload Cover Your Tracks
6. Run the test again
7. Compare the detailed fingerprint fields

Expected result:

- Some JavaScript-visible fields should change
- The FingerprintFog popup should say protection is active on the Cover Your Tracks tab
- Cover Your Tracks may still detect contradictions or leaks

Contradictions are useful. They show which fingerprint signals still need work.

## Streamlit Commands

These are the exact commands for the simulation app:

```bash
cd /Users/alina/Desktop/sab/fingerprintfog
pip install -r requirements.txt
streamlit run app.py
```

If `streamlit` is not found, try:

```bash
python3 -m streamlit run app.py
```

If dependencies install under Python 3 specifically, use:

```bash
python3 -m pip install -r requirements.txt
python3 -m streamlit run app.py
```

Then open:

```text
http://localhost:8501
```

## What This Proves

The local test page proves:

- the extension loads successfully
- JavaScript running on a webpage sees modified fingerprint values
- canvas and WebGL outputs can be changed
- different browser sessions can expose different profiles

It does not fully prove:

- real trackers cannot link the user
- HTTP headers are hidden
- every fingerprinting surface is covered
- the profile is impossible to detect as fake

## Current Limitations

- The extension patches JavaScript-visible APIs only.
- It does not rewrite HTTP request headers.
- Some real fingerprinting sites may detect mismatches.
- Fonts, audio fingerprinting, WebRTC, media devices, permissions, and other advanced signals are not fully handled.
- This is for research and concept validation only.

## Troubleshooting

If the page still says `Unprotected`:

- make sure the extension is enabled in `chrome://extensions`
- make sure you selected the `extension` folder with **Load unpacked**
- reload the extension from `chrome://extensions`
- reload the test page with `Command + R`
- use `http://localhost:8000/...` or `http://localhost:8001/...`, not a `file://` URL

If `localhost:8000` does not open:

- the server may not be running
- try port `8001`
- keep the Terminal window open while testing

If the popup says protection is not active:

- reload the current webpage
- avoid testing on `chrome://` pages, because extensions cannot run there
- test on the local page or a normal website
