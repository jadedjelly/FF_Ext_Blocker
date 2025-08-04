const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const template = document.getElementById("rangeTemplate");

function createRangeRow(start = "09:00", end = "17:00") {
  const clone = template.content.cloneNode(true);
  clone.querySelector(".start").value = start;
  clone.querySelector(".end").value = end;
  clone.querySelector(".remove").onclick = e => {
    e.target.closest(".range-row").remove();
  };
  return clone;
}

function renderDaySchedule(container, ranges = []) {
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Range";
  addBtn.type = "button";

  const block = document.createElement("div");
  block.className = "day-block";

  const title = document.createElement("div");
  title.className = "day-title";
  title.textContent = container.dayName;
  block.appendChild(title);

  const rangeContainer = document.createElement("div");
  rangeContainer.className = "ranges";
  ranges.forEach(r => {
    rangeContainer.appendChild(createRangeRow(r.start, r.end));
  });

  addBtn.onclick = () => {
    rangeContainer.appendChild(createRangeRow());
  };

  block.appendChild(rangeContainer);
  block.appendChild(addBtn);
  container.appendChild(block);
}

document.addEventListener('DOMContentLoaded', async () => {
  const { allowedWebsites, timeRangesPerDay } = await browser.storage.local.get({
    allowedWebsites: ["https://example.com"],
    timeRangesPerDay: {
      0: [], 1: [{ start: "09:00", end: "17:00" }],
      2: [{ start: "09:00", end: "17:00" }],
      3: [{ start: "09:00", end: "17:00" }],
      4: [{ start: "09:00", end: "17:00" }],
      5: [{ start: "09:00", end: "17:00" }],
      6: []
    }
  });

  document.getElementById('sites').value = allowedWebsites.join('\n');

  const daySchedules = document.getElementById("daySchedules");
  daySchedules.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const wrapper = document.createElement("div");
    wrapper.dayIndex = i;
    wrapper.dayName = dayNames[i];
    renderDaySchedule(wrapper, timeRangesPerDay[i] || []);
    daySchedules.appendChild(wrapper);
  }
});

document.getElementById('save').addEventListener('click', async () => {
  const sites = document.getElementById('sites').value
    .split('\n')
    .map(site => site.trim())
    .filter(Boolean);

  const timeRangesPerDay = {};
  const blocks = document.querySelectorAll(".day-block");

  blocks.forEach((block, i) => {
    const dayIndex = i;
    const ranges = Array.from(block.querySelectorAll(".range-row")).map(row => {
      return {
        start: row.querySelector(".start").value,
        end: row.querySelector(".end").value
      };
    }).filter(r => r.start && r.end);
    timeRangesPerDay[dayIndex] = ranges;
  });

  await browser.storage.local.set({
    allowedWebsites: sites,
    timeRangesPerDay
  });

  document.getElementById('status').textContent = "Settings saved!";
  setTimeout(() => document.getElementById('status').textContent = "", 2000);
});