async function getSettings() {
  const defaults = {
    allowedWebsites: ["https://example.com"],
    timeRangesPerDay: {
      0: [], 1: [{ start: "09:00", end: "17:00" }],
      2: [{ start: "09:00", end: "17:00" }],
      3: [{ start: "09:00", end: "17:00" }],
      4: [{ start: "09:00", end: "17:00" }],
      5: [{ start: "09:00", end: "17:00" }],
      6: []
    }
  };
  const stored = await browser.storage.local.get(defaults);
  return stored;
}

function isNowInRanges(ranges) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return ranges.some(({ start, end }) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return currentMinutes >= startMin && currentMinutes < endMin;
  });
}

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const { allowedWebsites, timeRangesPerDay } = await getSettings();
    const day = new Date().getDay();
    const ranges = timeRangesPerDay[day] || [];

    const inAllowedTime = isNowInRanges(ranges);
    const isAllowedSite = allowedWebsites.some(site => details.url.startsWith(site));

    if (!(inAllowedTime && isAllowedSite)) {
      return { redirectUrl: browser.runtime.getURL("block.html") };
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["blocking"]
);