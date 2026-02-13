const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaults = [
  { start: "09:00", end: "17:30", breakMins: 30 },
  { start: "09:00", end: "17:30", breakMins: 30 },
  { start: "09:00", end: "17:30", breakMins: 30 },
  { start: "09:00", end: "17:30", breakMins: 30 },
  { start: "09:00", end: "17:30", breakMins: 30 },
  { start: "00:00", end: "00:00", breakMins: 0 },
  { start: "00:00", end: "00:00", breakMins: 0 }
];

const tableBody = document.getElementById("timeTableBody");
const weeklyHours = document.getElementById("weeklyHours");
const resetButton = document.getElementById("resetButton");

function getWeekDates() {
  const today = new Date();
  const day = today.getDay(); // Sun: 0, Mon: 1, ...
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + mondayOffset);

  return weekdays.map((name, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateText = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    return { name, dateText };
  });
}

function toMinutes(timeValue) {
  const [h, m] = timeValue.split(":").map(Number);
  return h * 60 + m;
}

function formatHM(totalMinutes) {
  if (totalMinutes <= 0) return "0:00";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}:${String(mins).padStart(2, "0")}`;
}

function calcDayMinutes(start, end, breakMins) {
  let diff = toMinutes(end) - toMinutes(start);

  // Handle overnight shifts by rolling into the next day.
  if (diff < 0) diff += 24 * 60;

  const net = diff - breakMins;
  return net > 0 ? net : 0;
}

function makeRow(dayInfo, values, index) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="day-cell" data-label="Day">
      <div class="day-name">${dayInfo.name}</div>
      <div class="day-date">${dayInfo.dateText}</div>
    </td>
    <td data-label="Start time">
      <input type="time" class="start" value="${values.start}" aria-label="${dayInfo.name} start time" />
    </td>
    <td data-label="End time">
      <input type="time" class="end" value="${values.end}" aria-label="${dayInfo.name} end time" />
    </td>
    <td data-label="Break (mins)">
      <input
        type="number"
        class="break"
        value="${values.breakMins}"
        min="0"
        step="5"
        aria-label="${dayInfo.name} break minutes"
      />
    </td>
    <td data-label="Total hours">
      <div class="total-badge" id="total-${index}">0:00</div>
    </td>
  `;
  return row;
}

function updateTotals() {
  let weekMinutes = 0;
  const rows = [...tableBody.querySelectorAll("tr")];

  rows.forEach((row, idx) => {
    const startInput = row.querySelector(".start");
    const endInput = row.querySelector(".end");
    const breakInput = row.querySelector(".break");
    const badge = row.querySelector(".total-badge");

    const breakMins = Math.max(0, Number(breakInput.value) || 0);
    breakInput.value = breakMins;

    const minutes = calcDayMinutes(startInput.value, endInput.value, breakMins);
    weekMinutes += minutes;

    badge.textContent = formatHM(minutes);

    const isDefaultOffDay = idx > 4 && minutes === 0;
    badge.classList.toggle("invalid", !isDefaultOffDay && minutes === 0);
  });

  weeklyHours.textContent = formatHM(weekMinutes);
}

function renderTable() {
  tableBody.innerHTML = "";
  const weekDates = getWeekDates();
  weekDates.forEach((dayInfo, i) => {
    tableBody.appendChild(makeRow(dayInfo, defaults[i], i));
  });

  tableBody.addEventListener("input", updateTotals);
  updateTotals();
}

function resetWeek() {
  const rows = [...tableBody.querySelectorAll("tr")];
  rows.forEach((row, i) => {
    row.querySelector(".start").value = defaults[i].start;
    row.querySelector(".end").value = defaults[i].end;
    row.querySelector(".break").value = defaults[i].breakMins;
  });
  updateTotals();
}

resetButton.addEventListener("click", resetWeek);
renderTable();
