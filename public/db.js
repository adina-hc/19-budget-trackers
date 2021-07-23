let db;

const reqName = indexedDB.open("budgetTracker", 1)

reqName.onupgradeneeded = (event) => {
    db = event.target.result
    
    db.createObjectStore("pending", { autoIncrement : true })
}

reqName.onsuccess = (event) => {
    db = event.target.result;
    if(navigator.onLine){
        scrubDatabase()
    }
}

function saveRecord(data) {
    const trans = db.transaction(["pending"], "readwrite");
    const store = trans.objectStore("pending")

    store.add(data)
}

function scrubDatabase() {
    console.log("hi")

    const access = db.transaction(["pending"], "readwrite");
    const objStore = access.objectStore("pending");
    const getAll = objStore.getAll();

    getAll.onsuccess = function(){
        console.log(getAll)
        if(getAll.result.length > 0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(getAll.result)
            }).then(res => {
                console.log(res)
                return res.json()
            }).then(clearingDB => {
                const access = db.transaction(["pending"], "readwrite");
                const objStore = access.objectStore("pending");
                objStore.clear();
            })
        }
    }
}

window.addEventListener("online", scrubDatabase)