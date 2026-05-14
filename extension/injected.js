(() => {
  const currentScript = document.currentScript;
  const profile = JSON.parse(currentScript.dataset.profile);

  const defineGetter = (target, prop, getter) => {
    try {
      Object.defineProperty(target, prop, {
        get: getter,
        configurable: true
      });
    } catch (_error) {
      // Some browsers lock individual properties. Leave unsupported fields alone.
    }
  };

  const navigatorProfile = {
    platform: profile.platform,
    language: profile.language,
    languages: () => [...profile.languages],
    userAgent: profile.userAgent,
    hardwareConcurrency: profile.hardwareConcurrency,
    deviceMemory: profile.deviceMemory
  };

  for (const [prop, value] of Object.entries(navigatorProfile)) {
    defineGetter(Navigator.prototype, prop, () =>
      typeof value === "function" ? value() : value
    );
  }

  const screenProfile = {
    width: profile.screenWidth,
    height: profile.screenHeight,
    availWidth: profile.availWidth,
    availHeight: profile.availHeight,
    colorDepth: profile.colorDepth,
    pixelDepth: profile.pixelDepth
  };

  for (const [prop, value] of Object.entries(screenProfile)) {
    defineGetter(Screen.prototype, prop, () => value);
  }

  const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
  Intl.DateTimeFormat.prototype.resolvedOptions = function resolvedOptions() {
    return {
      ...originalResolvedOptions.call(this),
      locale: profile.language,
      timeZone: profile.timezone
    };
  };

  Date.prototype.getTimezoneOffset = function getTimezoneOffset() {
    return profile.timezoneOffset;
  };

  const noiseFor = (index) => {
    const x = Math.sin(index + profile.seed) * 10000;
    return x - Math.floor(x) > 0.5 ? 1 : -1;
  };

  const addCanvasNoise = (canvas) => {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context || canvas.width === 0 || canvas.height === 0) {
      return;
    }

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 32) {
        imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noiseFor(i)));
        imageData.data[i + 1] = Math.max(
          0,
          Math.min(255, imageData.data[i + 1] + noiseFor(i + 1))
        );
        imageData.data[i + 2] = Math.max(
          0,
          Math.min(255, imageData.data[i + 2] + noiseFor(i + 2))
        );
      }
      context.putImageData(imageData, 0, 0);
    } catch (_error) {
      // Cross-origin tainted canvases cannot be read. Keep default behavior.
    }
  };

  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function toDataURL(...args) {
    addCanvasNoise(this);
    return originalToDataURL.apply(this, args);
  };

  const originalToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function toBlob(...args) {
    addCanvasNoise(this);
    return originalToBlob.apply(this, args);
  };

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function getImageData(...args) {
    const imageData = originalGetImageData.apply(this, args);
    for (let i = 0; i < imageData.data.length; i += 32) {
      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noiseFor(i)));
    }
    return imageData;
  };

  const patchWebGL = (Prototype) => {
    if (!Prototype) {
      return;
    }

    const originalGetParameter = Prototype.prototype.getParameter;
    const originalGetExtension = Prototype.prototype.getExtension;
    const debugInfo = {
      UNMASKED_VENDOR_WEBGL: 0x9245,
      UNMASKED_RENDERER_WEBGL: 0x9246
    };

    Prototype.prototype.getExtension = function getExtension(name) {
      if (name === "WEBGL_debug_renderer_info") {
        return debugInfo;
      }
      return originalGetExtension.call(this, name);
    };

    Prototype.prototype.getParameter = function getParameter(parameter) {
      if (parameter === this.VENDOR || parameter === debugInfo.UNMASKED_VENDOR_WEBGL) {
        return profile.webglVendor;
      }
      if (parameter === this.RENDERER || parameter === debugInfo.UNMASKED_RENDERER_WEBGL) {
        return profile.webglRenderer;
      }
      return originalGetParameter.call(this, parameter);
    };
  };

  patchWebGL(window.WebGLRenderingContext);
  patchWebGL(window.WebGL2RenderingContext);

  window.__fingerprintfog = {
    enabled: true,
    profileName: profile.name,
    profile
  };
})();
