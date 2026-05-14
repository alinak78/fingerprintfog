# FingerprintFog

A tiny demo project for validating browser fingerprint obfuscation.

It has two layers:

1. A Python/Streamlit simulation that shows how rotating browser-exposed attributes can reduce a toy tracker's confidence.
2. A Chrome-compatible demo extension that actually patches selected browser APIs in page JavaScript, so you can test the idea against local checks and sites like Cover Your Tracks.

## Files
- `app.py` - Streamlit demo UI
- `data.py` - base fingerprint + realistic value pools
- `simulator.py` - baseline and obfuscated session generation
- `tracker.py` - toy tracker similarity logic
- `requirements.txt` - packages to install
- `extension/` - unpacked browser extension that patches fingerprint APIs
- `web/fingerprint-test.html` - local browser fingerprint collector

## Run locally in VS Code

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Demo flow
1. Show the baseline fingerprint.
2. Generate one obfuscated session.
3. Run the experiment to compare baseline vs obfuscated sessions.
4. Point out that the tracker links fewer obfuscated sessions.

## Validate real browser obfuscation

The Streamlit app is only a simulation. To validate real browser behavior, load the extension and compare what websites can read from browser APIs.

### 1. Run a local baseline

Serve the project locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/web/fingerprint-test.html` in Chrome with the extension disabled. Save or copy the JSON output.

### 2. Load the extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this project's `extension/` folder.
5. Reload `http://localhost:8000/web/fingerprint-test.html`.

The local test page should now show `fog.enabled: true` and changed values for fields such as:

- `navigator.userAgent`
- `navigator.platform`
- `navigator.language`
- `navigator.languages`
- `screen.width` / `screen.height`
- timezone and timezone offset
- canvas hash
- WebGL vendor and renderer

### 3. Test with Cover Your Tracks

Run [Cover Your Tracks](https://coveryourtracks.eff.org/) twice:

1. With the extension disabled.
2. With the extension enabled.

Compare the detailed report fields and the reported identifying bits. A useful result is not just "different once"; the better signal is that repeated sessions are less stable and harder to link.

### Important limitations

This extension is a validation prototype, not production privacy software.

- JavaScript `navigator.userAgent` is patched, but HTTP request headers are not rewritten.
- Timezone formatting is partially patched; full timezone emulation is more involved.
- Random or inconsistent fingerprints can be detectable. Real anti-fingerprinting tools usually choose coherent profiles and keep them stable for an appropriate scope.
- Some browser properties are locked down or read before the extension script runs.
