// Declare database
let db;

// Open database
const reqName = indexedDB.open("budgetTracker", 1)

// Change the database version when upgraded
reqName.onupgradeneeded = (event) => {
    db = event.target.result
    
    db.createObjectStore("pending", { autoIncrement : true })
}

// When opening and the page is online, scrub database
reqName.onsuccess = (event) => {
    db = event.target.result;
    if(navigator.onLine){
        scrubDatabase()
    }
}

// Save records into the database on 'pending', having access to read and write
function saveRecord(data) {
    const trans = db.transaction(["pending"], "readwrite");
    const store = trans.objectStore("pending")

    store.add(data)
}

// Access the data to obtain all the records to post
function scrubDatabase() {
    console.log("hi")

    const access = db.transaction(["pending"], "readwrite");
    const objStore = access.objectStore("pending");
    const getAll = objStore.getAll();

    getAll.onsuccess = function(){
        console.log(getAll)
        // if there is data, fetch and post
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

// Online event, fired when the browser accesses the network and navigator is online
window.addEventListener("online", scrubDatabase)