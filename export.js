async function exportJSON() {
    const data = await getAllRecords();
    download(JSON.stringify(data, null, 2), "tasveg-records.json", "application/json");
}

async function exportCSV() {
    const data = await getAllRecords();

    let csv = "id,timestamp,latitude,longitude,structure,moisture,dominant,elevation,species\n";

    data.forEach(r => {
        const lat = r.location ? r.location.lat : "";
        const lon = r.location ? r.location.lon : "";
        csv += `${r.id},${r.timestamp},${lat},${lon},${r.inputs.structure},${r.inputs.moisture},${r.inputs.dominant},${r.inputs.elevation},"${r.inputs.species}"\n`;
    });

    download(csv, "tasveg-records.csv", "text/csv");
}

function download(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}
