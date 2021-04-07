let db;
const req = indexedDB.open("budget", 1);

function PUTRecord(data) {
  const t = db.transaction(["pending"], "readwrite");
  const s = t.objectStore("pending");
  s.add(data);
}

function validateDB() {
  const t = db.transaction(["pending"], "readwrite");
  const s = t.objectStore("pending");
  const getAll = s.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const t = db.transaction(["pending"], "readwrite");
          const s = t.objectStore("pending");
          s.clear();
        });
    }
  };
}

req.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

req.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    validateDB();
  }
};

req.onerror = function (event) {
  console.log("ERROR: " + event.target.errorCode);
};

window.addEventListener("online", validateDB);
