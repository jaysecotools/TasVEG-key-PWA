async function exportJSON(){
const data = await getAllRecords();
download(JSON.stringify(data,null,2),"tasveg-records.json","application/json");
}

async function exportCSV(){
const data = await getAllRecords();

let csv = "id,timestamp,structure,moisture,dominant,elevation,species\n";

data.forEach(r=>{
csv += `${r.id},${r.timestamp},${r.inputs.structure},${r.inputs.moisture},${r.inputs.dominant},${r.inputs.elevation},"${r.inputs.species}"\n`;
});

download(csv,"tasveg-records.csv","text/csv");
}

function download(content,file,type){
const blob = new Blob([content],{type});
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = file;
a.click();
}