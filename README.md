# FingerprintFog

A tiny demo project that simulates browser fingerprint obfuscation by rotating a few browser-exposed attributes across sessions.

## Files
- `app.py` - Streamlit demo UI
- `data.py` - base fingerprint + realistic value pools
- `simulator.py` - baseline and obfuscated session generation
- `tracker.py` - toy tracker similarity logic
- `requirements.txt` - packages to install

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
