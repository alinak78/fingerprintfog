import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt

from data import BASE_FINGERPRINT
from simulator import generate_baseline_sessions, generate_obfuscated_sessions, obfuscate_session
from tracker import similarity_score, normalized_similarity_score, predict_same_user

st.set_page_config(page_title="FingerprintFog Demo", page_icon="🕵️", layout="wide")
st.title("🕵️ FingerprintFog")
st.subheader("Browser Fingerprint Obfuscation Demo")

st.markdown(
    "This demo shows how rotating a few browser-exposed features can make a simple tracker "
    "less confident that multiple sessions come from the same user."
)

st.header("1) Baseline fingerprint")
st.json(BASE_FINGERPRINT)

st.header("2) Generate one obfuscated session")
if st.button("Generate New Obfuscated Session"):
    new_session = obfuscate_session(BASE_FINGERPRINT)
    score = normalized_similarity_score(BASE_FINGERPRINT, new_session)
    same_user = predict_same_user(BASE_FINGERPRINT, new_session)

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("**Original fingerprint**")
        st.json(BASE_FINGERPRINT)
    with col2:
        st.markdown("**Obfuscated fingerprint**")
        st.json(new_session)

    st.write(f"Similarity score: **{score:.2f}**")
    st.write(f"Tracker prediction: **{'Same user' if same_user else 'Different user'}**")

st.header("3) Compare baseline vs obfuscated sessions")
num_sessions = st.slider("Number of sessions", min_value=10, max_value=100, value=30, step=10)

if st.button("Run Experiment"):
    baseline_sessions = generate_baseline_sessions(num_sessions)
    obfuscated_sessions = generate_obfuscated_sessions(num_sessions)

    baseline_rows = []
    for i, session in enumerate(baseline_sessions, start=1):
        score = similarity_score(BASE_FINGERPRINT, session)
        pred = predict_same_user(BASE_FINGERPRINT, session)
        baseline_rows.append({
            "condition": "baseline",
            "session_id": i,
            "screen": f"{session['screen_width']}x{session['screen_height']}",
            "timezone": session["timezone"],
            "language": session["language"],
            "platform": session["platform"],
            "similarity_score": score,
            "tracker_prediction": "same user" if pred else "different user",
        })

    obf_rows = []
    for i, session in enumerate(obfuscated_sessions, start=1):
        score = similarity_score(BASE_FINGERPRINT, session)
        pred = predict_same_user(BASE_FINGERPRINT, session)
        obf_rows.append({
            "condition": "obfuscated",
            "session_id": i,
            "screen": f"{session['screen_width']}x{session['screen_height']}",
            "timezone": session["timezone"],
            "language": session["language"],
            "platform": session["platform"],
            "similarity_score": score,
            "tracker_prediction": "same user" if pred else "different user",
        })

    baseline_df = pd.DataFrame(baseline_rows)
    obf_df = pd.DataFrame(obf_rows)
    combined_df = pd.concat([baseline_df, obf_df], ignore_index=True)

    baseline_match_rate = (baseline_df["tracker_prediction"] == "same user").mean()
    obf_match_rate = (obf_df["tracker_prediction"] == "same user").mean()

    st.subheader("Summary")
    st.write(f"Baseline linked as same user: **{baseline_match_rate * 100:.1f}%**")
    st.write(f"Obfuscated linked as same user: **{obf_match_rate * 100:.1f}%**")

    st.subheader("Session table")
    st.dataframe(combined_df, use_container_width=True)

    st.subheader("Average similarity score")
    plot_df = pd.DataFrame({
        "Condition": ["Baseline", "Obfuscated"],
        "Average Similarity": [baseline_df["similarity_score"].mean(), obf_df["similarity_score"].mean()],
    })

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.bar(plot_df["Condition"], plot_df["Average Similarity"])
    ax.set_ylabel("Average similarity score")
    ax.set_title("Baseline vs Obfuscated")
    st.pyplot(fig)
