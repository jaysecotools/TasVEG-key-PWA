let db;
const req = indexedDB.open("tasvegDB", 1);

req.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("records")) {
        db.createObjectStore("records", { keyPath: "id" });
    }
};

req.onsuccess = e => {
    db = e.target.result;
};

req.onerror = e => {
    console.error("IndexedDB error:", e.target.error);
};

function saveToDB(record) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database not ready");
            return;
        }
        const tx = db.transaction("records", "readwrite");
        const store = tx.objectStore("records");
        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => resolve();
    });
}

function getAllRecords() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database not ready");
            return;
        }
        const tx = db.transaction("records", "readonly");
        const store = tx.objectStore("records");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
