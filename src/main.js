const DB_NAME = "office-wfh-recorder";
const STORE_NAME = "day-records";
const STATUS = {
  OFFICE: "office",
  WFH: "wfh",
};

let activeMonth = new Date();
let selectedMode = STATUS.OFFICE;
let records = {};

const elements = {
  calendar: document.querySelector("#calendar"),
  calendarGrid: document.querySelector("#calendarGrid"),
  helperText: document.querySelector("#helperText"),
  monthLabel: document.querySelector("#monthLabel"),
  nextMonth: document.querySelector("#nextMonth"),
  officeCount: document.querySelector("#officeCount"),
  officeMode: document.querySelector("#officeMode"),
  previousMonth: document.querySelector("#previousMonth"),
  todayButton: document.querySelector("#todayButton"),
  unmarkedCount: document.querySelector("#unmarkedCount"),
  wfhCount: document.querySelector("#wfhCount"),
  wfhMode: document.querySelector("#wfhMode"),
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "date" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getRecords() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => {
      const nextRecords = {};
      request.result.forEach((record) => {
        nextRecords[record.date] = record.status;
      });
      resolve(nextRecords);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function saveRecord(date, status) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    if (status) {
      store.put({ date, status });
    } else {
      store.delete(date);
    }

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const days = [];

  for (let i = 0; i < firstDate.getDay(); i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDate.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function setSelectedMode(mode) {
  selectedMode = mode;
  elements.officeMode.classList.toggle("active", selectedMode === STATUS.OFFICE);
  elements.wfhMode.classList.toggle("active", selectedMode === STATUS.WFH);
}

async function updateDay(date) {
  const key = toDateKey(date);
  const nextStatus = records[key] === selectedMode ? null : selectedMode;

  if (nextStatus) {
    records[key] = nextStatus;
  } else {
    delete records[key];
  }

  render();
  await saveRecord(key, nextStatus);
}

function changeMonth(offset) {
  activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + offset, 1);
  render();
}

function render() {
  const days = getMonthDays(activeMonth);
  const monthKeys = days.filter(Boolean).map(toDateKey);
  const officeCount = monthKeys.filter((key) => records[key] === STATUS.OFFICE).length;
  const wfhCount = monthKeys.filter((key) => records[key] === STATUS.WFH).length;
  const unmarkedCount = monthKeys.length - officeCount - wfhCount;
  const monthLabel = formatMonth(activeMonth);

  elements.monthLabel.textContent = monthLabel;
  elements.calendar.setAttribute("aria-label", `${monthLabel} calendar`);
  elements.officeCount.textContent = officeCount;
  elements.wfhCount.textContent = wfhCount;
  elements.unmarkedCount.textContent = unmarkedCount;
  elements.calendarGrid.replaceChildren();

  days.forEach((date, index) => {
    if (!date) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "day empty";
      elements.calendarGrid.append(emptyDay);
      return;
    }

    const key = toDateKey(date);
    const status = records[key];
    const dayButton = document.createElement("button");
    const dateNumber = document.createElement("span");

    dayButton.className = `day ${status || ""} ${key === toDateKey(new Date()) ? "today" : ""}`;
    dayButton.type = "button";
    dayButton.setAttribute("aria-label", `${date.getDate()} ${monthLabel}${status ? `, ${status}` : ""}`);
    dayButton.addEventListener("click", () => updateDay(date));

    dateNumber.className = "date-number";
    dateNumber.textContent = date.getDate();
    dayButton.append(dateNumber);

    if (status) {
      const statusLabel = document.createElement("span");
      statusLabel.className = "status-label";
      statusLabel.textContent = status === STATUS.OFFICE ? "Office" : "WFH";
      dayButton.append(statusLabel);
    }

    elements.calendarGrid.append(dayButton);
  });
}

elements.previousMonth.addEventListener("click", () => changeMonth(-1));
elements.nextMonth.addEventListener("click", () => changeMonth(1));
elements.todayButton.addEventListener("click", () => {
  activeMonth = new Date();
  render();
});
elements.officeMode.addEventListener("click", () => setSelectedMode(STATUS.OFFICE));
elements.wfhMode.addEventListener("click", () => setSelectedMode(STATUS.WFH));

getRecords()
  .then((storedRecords) => {
    records = storedRecords;
  })
  .catch(() => {
    elements.helperText.textContent = "Saved days could not be loaded in this browser.";
  })
  .finally(() => {
    if (elements.helperText.textContent === "Loading saved days...") {
      elements.helperText.textContent = "Click a date to mark it. Click the same date again to clear it.";
    }
    render();
  });
