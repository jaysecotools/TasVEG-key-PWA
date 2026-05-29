// report.js - Enhanced reporting and export functions

function exportFullReport() {
    if (!currentResults.length) {
        alert("Run analysis first to generate a report.");
        return;
    }
    
    const inputs = {
        structure: document.getElementById("structure").value,
        moisture: document.getElementById("moisture").value,
        dominant: document.getElementById("dominant").value,
        elevation: document.getElementById("elevation").value,
        species: document.getElementById("species").value
    };
    
    const context = getEnvironmentalContext();
    
    let reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TasVEG Field Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.4; }
        h1 { color: #1b6133; border-bottom: 2px solid #1b6133; }
        h2 { color: #2c7da0; margin-top: 20px; }
        .section { margin-bottom: 25px; }
        .result { background: #f5f5f5; padding: 12px; margin: 8px 0; border-left: 4px solid #1b6133; }
        .high-confidence { border-left-color: #2e7d32; }
        .moderate-confidence { border-left-color: #f9a825; }
        .low-confidence { border-left-color: #c62828; }
        .meta { color: #666; font-size: 0.9em; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #eef2ef; }
        .footer { margin-top: 40px; text-align: center; font-size: 0.8em; color: #666; }
    </style>
</head>
<body>
    <h1>🌿 TasVEG Field Assessment Report</h1>
    <div class="meta">Generated: ${new Date().toLocaleString()}</div>
    
    <div class="section">
        <h2>📍 Site Information</h2>
        <table>
            <tr><th>Location</th><td>${currentLatLng ? currentLatLng.lat.toFixed(6) + ", " + currentLatLng.lon.toFixed(6) : "Not recorded"}</td></tr>
            <tr><th>Date/Time</th><td>${new Date().toISOString()}</td></tr>
            <tr><th>Photos</th><td>${photos.length} captured</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>🌲 Field Observations</h2>
        <table>
            <tr><th>Structure</th><td>${inputs.structure || "—"}</td></tr>
            <tr><th>Moisture</th><td>${inputs.moisture || "—"}</td></tr>
            <tr><th>Dominant</th><td>${inputs.dominant || "—"}</td></tr>
            <tr><th>Elevation</th><td>${inputs.elevation || "—"}</td></tr>
            <tr><th>Species</th><td>${inputs.species || "—"}</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>🌍 Environmental Context</h2>
        <table>
            <tr><th>Substrate</th><td>${context.substrate || "—"}</td></tr>
            <tr><th>Drainage</th><td>${context.drainage || "—"}</td></tr>
            <tr><th>Exposure</th><td>${context.exposure || "—"}</td></tr>
            <tr><th>Fire History</th><td>${context.fire_history || "—"}</td></tr>
            <tr><th>Disturbance</th><td>${context.disturbance || "—"}</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>📊 Analysis Results</h2>
        <p><strong>Decision Record</strong> - Structured assessment based on field data</p>
    `;
    
    currentResults.slice(0, 5).forEach(r => {
        const conf = getConfidence(r.score);
        reportHtml += `
        <div class="result ${conf.label.toLowerCase().replace(' ', '-')}">
            <strong>${r.code} — ${r.name}</strong><br>
            Score: ${r.score} | ${conf.icon} ${conf.label} (${r.percentage}%)
        </div>
        `;
    });
    
    reportHtml += `
    </div>
    
    <div class="section">
        <h2>📝 Assessment Notes</h2>
        <p>This assessment was conducted using the TasVEG Field System.</p>
        <p>${currentResults[0] ? `Primary recommendation: <strong>${currentResults[0].code} - ${currentResults[0].name}</strong> with ${currentResults[0].confidence}.` : "No confident identification possible."}</p>
    </div>
    
    <div class="footer">
        TasVEG Field System - Professional Edition<br>
        Report generated offline
    </div>
</body>
</html>
    `;
    
    // Open in new window for printing/saving
    const reportWindow = window.open();
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
}

function compareSites(site1Id, site2Id) {
    // Function to compare two saved sites
    alert("Site comparison feature - load two saved records to compare communities over time");
}

function trackChanges() {
    // Load history of a location to see how community has changed
    alert("Change tracking - select a location to view historical assessments");
}

// Add to window for global access
window.exportFullReport = exportFullReport;
window.compareSites = compareSites;
window.trackChanges = trackChanges;
