(() => {
  const PROFILE_KEY = "__fingerprintfog_profile";

  const profiles = [
    {
      name: "mac-new-york",
      screenWidth: 1440,
      screenHeight: 900,
      availWidth: 1440,
      availHeight: 875,
      colorDepth: 24,
      pixelDepth: 24,
      timezone: "America/New_York",
      timezoneOffset: 300,
      language: "en-US",
      languages: ["en-US", "en"],
      platform: "MacIntel",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      hardwareConcurrency: 8,
      deviceMemory: 8,
      webglVendor: "Intel Inc.",
      webglRenderer: "Intel Iris OpenGL Engine",
      seed: 1729
    },
    {
      name: "windows-chicago",
      screenWidth: 1366,
      screenHeight: 768,
      availWidth: 1366,
      availHeight: 728,
      colorDepth: 24,
      pixelDepth: 24,
      timezone: "America/Chicago",
      timezoneOffset: 360,
      language: "en-US",
      languages: ["en-US", "en"],
      platform: "Win32",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      hardwareConcurrency: 4,
      deviceMemory: 4,
      webglVendor: "Google Inc. (Intel)",
      webglRenderer: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0)",
      seed: 2718
    },
    {
      name: "linux-los-angeles",
      screenWidth: 1920,
      screenHeight: 1080,
      availWidth: 1920,
      availHeight: 1040,
      colorDepth: 24,
      pixelDepth: 24,
      timezone: "America/Los_Angeles",
      timezoneOffset: 480,
      language: "en-GB",
      languages: ["en-GB", "en"],
      platform: "Linux x86_64",
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      hardwareConcurrency: 6,
      deviceMemory: 8,
      webglVendor: "Google Inc. (NVIDIA)",
      webglRenderer: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Direct3D11 vs_5_0 ps_5_0)",
      seed: 3141
    }
  ];

  const pickProfile = () => {
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

  inject(pickProfile());
})();
