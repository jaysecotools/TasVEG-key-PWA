// export.js - Updated for structured results

async function exportJSON() {
    const records = await getAllRecords();
    const dataStr = JSON.stringify(records, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tasveg_all_records_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

async function exportCSV() {
    const records = await getAllRecords();
    
    if (!records.length) {
        alert("No records to export");
        return;
    }
    
    // Define CSV headers for decision record format
    const headers = [
        'id', 'timestamp', 'latitude', 'longitude',
        'structure', 'moisture', 'dominant', 'elevation', 'species',
        'substrate', 'drainage', 'exposure', 'fire_history', 'disturbance',
        'top_code', 'top_name', 'top_score', 'top_confidence',
        'second_code', 'second_name', 'second_score', 'second_confidence',
        'third_code', 'third_name', 'third_score', 'third_confidence',
        'photos_count'
    ];
    
    const rows = records.map(record => {
        const results = record.results || [];
        return [
            record.id,
            record.timestamp,
            record.location?.lat || '',
            record.location?.lon || '',
            record.inputs?.structure || '',
            record.inputs?.moisture || '',
            record.inputs?.dominant || '',
            record.inputs?.elevation || '',
            record.inputs?.species || '',
            record.environmental_context?.substrate || '',
            record.environmental_context?.drainage || '',
            record.environmental_context?.exposure || '',
            record.environmental_context?.fire_history || '',
            record.environmental_context?.disturbance || '',
            results[0]?.code || '',
            results[0]?.name || '',
            results[0]?.score || '',
            results[0]?.confidence || '',
            results[1]?.code || '',
            results[1]?.name || '',
            results[1]?.score || '',
            results[1]?.confidence || '',
            results[2]?.code || '',
            results[2]?.name || '',
            results[2]?.score || '',
            results[2]?.confidence || '',
            (record.photos || []).length
        ];
    });
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasveg_records_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportDecisionRecord() {
    // Already defined in app.js - kept for compatibility
    if (typeof window.exportDecisionRecord === 'function') {
        window.exportDecisionRecord();
    }
}
