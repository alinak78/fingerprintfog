(() => {
  const PROFILE_KEY = "__fingerprintfog_profile";
  const profiles = globalThis.FingerprintFogProfiles;

  const pickProfile = (selectedProfile) => {
    if (selectedProfile && selectedProfile !== "random") {
      const profile = profiles.find((candidate) => candidate.name === selectedProfile);
      if (profile) {
        return profile;
      }
    }

    try {
      const cached = sessionStorage.getItem(PROFILE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_error) {
      // Fall through to a fresh profile.
    }

    const profile = profiles[Math.floor(Math.random() * profiles.length)];
    try {
      sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (_error) {
      // Storage may be blocked on some pages; the profile will be per load.
    }
    return profile;
  };

  const inject = (profile) => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected.js");
    script.dataset.profile = JSON.stringify(profile);
    (document.documentElement || document.head).prepend(script);
    script.addEventListener("load", () => script.remove());
  };

  chrome.storage.sync.get({ selectedProfile: "random" }, (settings) => {
    inject(pickProfile(settings.selectedProfile));
  });
})();
