const profileSelect = document.querySelector("#profile");
const statusEl = document.querySelector("#status");
const profileNameEl = document.querySelector("#profile-name");
const timezoneEl = document.querySelector("#timezone");
const platformEl = document.querySelector("#platform");

for (const profile of globalThis.FingerprintFogProfiles) {
  const option = document.createElement("option");
  option.value = profile.name;
  option.textContent = profile.label;
  profileSelect.append(option);
}

chrome.storage.sync.get({ selectedProfile: "random" }, ({ selectedProfile }) => {
  profileSelect.value = selectedProfile;
});

profileSelect.addEventListener("change", async () => {
  await chrome.storage.sync.set({ selectedProfile: profileSelect.value });
  statusEl.textContent = "Profile saved. Reload the tab to apply it.";
  statusEl.classList.remove("off");
});

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const refreshStatus = async () => {
  const tab = await getActiveTab();
  if (!tab?.id || tab.url?.startsWith("chrome://")) {
    statusEl.textContent = "Open a normal web page to test protection.";
    statusEl.classList.add("off");
    return;
  }

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.__fingerprintfog || null
    });
    const fog = result.result;
    if (fog?.enabled) {
      statusEl.textContent = "Protection is active on this page.";
      statusEl.classList.remove("off");
      profileNameEl.textContent = fog.profile.label || fog.profileName;
      timezoneEl.textContent = fog.profile.timezone;
      platformEl.textContent = fog.profile.platform;
    } else {
      statusEl.textContent = "Protection is not active here yet.";
      statusEl.classList.add("off");
    }
  } catch (_error) {
    statusEl.textContent = "Reload this page to check protection.";
    statusEl.classList.add("off");
  }
};

document.querySelector("#reload").addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (tab?.id) {
    await chrome.tabs.reload(tab.id);
    window.close();
  }
});

document.querySelector("#local-test").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:8001/web/fingerprint-test.html" });
});

document.querySelector("#cover-tracks").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://coveryourtracks.eff.org/" });
});

refreshStatus();
