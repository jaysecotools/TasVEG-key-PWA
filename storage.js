let db;
const req=indexedDB.open("tasvegDB",1);

req.onupgradeneeded=e=>{
db=e.target.result;
db.createObjectStore("records",{keyPath:"id"});
};

req.onsuccess=e=>db=e.target.result;

function saveToDB(record){
return new Promise(res=>{
const tx=db.transaction("records","readwrite");
tx.objectStore("records").put(record);
tx.oncomplete=()=>res();
});
}

function getAllRecords(){
return new Promise(res=>{
const tx=db.transaction("records","readonly");
const r=tx.objectStore("records").getAll();
r.onsuccess=()=>res(r.result);
});
}