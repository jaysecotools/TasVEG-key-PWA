// app.js - Enhanced with decision records, environmental context, assemblage logic

let map = L.map('map').setView([-42, 147], 6);
let marker;
let currentLatLng = null;
let photos = [];
let currentResults = []; // Store structured results for decision record

// MAP
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// CLICK TO DROP MARKER
map.on('click', e => {
    setMarker(e.latlng.lat, e.latlng.lng);
});

function setMarker(lat, lon) {
    currentLatLng = { lat, lon };

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon], { draggable: true }).addTo(map);

    marker.on('dragend', e => {
        const pos = e.target.getLatLng();
        currentLatLng = { lat: pos.lat, lon: pos.lng };
        document.getElementById("coords").innerText = pos.lat.toFixed(5) + ", " + pos.lng.toFixed(5);
        // Update elevation band inference
        inferElevationBand(pos.lat);
    });

    document.getElementById("coords").innerText = lat.toFixed(5) + ", " + lon.toFixed(5);
    map.setView([lat, lon], 14);
    
    // Infer elevation from latitude (simple approximation)
    inferElevationBand(lat);
}

function inferElevationBand(latitude) {
    // Simple elevation inference based on latitude (higher latitudes = colder = higher elevation likely)
    // In real implementation, you'd use a DEM API
    const absLat = Math.abs(latitude);
    if (absLat > 42.5) {
        document.getElementById("elevationHint").innerHTML = "📍 High elevation likely";
    } else if (absLat > 41.5) {
        document.getElementById("elevationHint").innerHTML = "📍 Mid elevation possible";
    } else {
        document.getElementById("elevationHint").innerHTML = "📍 Lowland area";
    }
}

// GPS
function getLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        setMarker(pos.coords.latitude, pos.coords.longitude);
    });
}

// PHOTO COMPRESSION
document.getElementById("photoInput").addEventListener("change", async e => {
    const files = [...e.target.files];

    for (let file of files) {
        const compressed = await compress(file, 0.6);
        photos.push(compressed);

        let img = document.createElement("img");
        img.src = compressed;
        document.getElementById("photoPreview").appendChild(img);
    }
});

function compress(file, quality) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const scale = 800 / img.width;
            canvas.width = 800;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
    });
}

// COMPLETE TASVEG DATASET WITH ENHANCED EXCLUSIONS
const communities = [
    {
        code: "WET",
        name: "Wet Eucalypt Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus obliqua", "Eucalyptus regnans", "Eucalyptus delegatensis", "Dicksonia antarctica", "Atherosperma moschatum"],
        exclusions: { moisture: ["dry"], dominant: ["buttongrass", "paperbark"] }
    },
    {
        code: "DGL",
        name: "Dry Eucalypt Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus amygdalina", "Eucalyptus pulchella", "Eucalyptus nitida", "Eucalyptus viminalis", "Banksia marginata"],
        exclusions: { moisture: ["wet", "waterlogged", "alpine"], dominant: ["rainforest", "buttongrass"] }
    },
    {
        code: "R",
        name: "Cool Temperate Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest" },
        species: ["Nothofagus cunninghamii", "Atherosperma moschatum", "Anodopetalum biglandulosum", "Dicksonia antarctica"],
        exclusions: { moisture: ["dry"], dominant: ["eucalypt", "buttongrass", "paperbark"] }
    },
    {
        code: "MYF",
        name: "Mixed Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "mixed", assemblage: "wet_forest" },
        species: ["Eucalyptus obliqua", "Nothofagus cunninghamii"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WDL",
        name: "Eucalypt Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus viminalis", "Eucalyptus ovata", "Allocasuarina verticillata"],
        exclusions: { moisture: ["wet", "waterlogged"], dominant: ["rainforest"] }
    },
    {
        code: "SKL",
        name: "Scrub Woodland Complex",
        traits: { structure: "woodland", moisture: "dry", dominant: "mixed", assemblage: "dry_forest" },
        species: ["Acacia dealbata", "Allocasuarina verticillata", "Banksia marginata"]
    },
    {
        code: "SH",
        name: "Heathland",
        traits: { structure: "scrub", moisture: "dry", assemblage: "heath" },
        species: ["Epacris impressa", "Pultenaea juniperina", "Banksia marginata"],
        exclusions: { structure: ["forest", "woodland"], moisture: ["wet", "waterlogged"] }
    },
    {
        code: "SL",
        name: "Tea-tree Scrub",
        traits: { structure: "scrub", dominant: "melaleuca", assemblage: "scrub" },
        species: ["Leptospermum scoparium", "Melaleuca squarrosa", "Melaleuca ericifolia"]
    },
    {
        code: "MPF",
        name: "Swamp Paperbark Forest",
        traits: { structure: "forest", moisture: "waterlogged", dominant: "paperbark", assemblage: "wetland" },
        species: ["Melaleuca ericifolia", "Melaleuca squarrosa", "Leptospermum lanigerum", "Sphagnum cristatum", "Baumea rubiginosa"],
        exclusions: { moisture: ["dry", "alpine"], dominant: ["eucalypt", "rainforest"] }
    },
    {
        code: "M",
        name: "Buttongrass Moorland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "buttongrass", assemblage: "wetland" },
        species: ["Gymnoschoenus sphaerocephalus"],
        exclusions: { moisture: ["dry"], structure: ["forest", "woodland"] }
    },
    {
        code: "SW",
        name: "Sedgeland / Rushland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "sedges", assemblage: "wetland" },
        species: ["Baumea", "Juncus", "Carex"]
    },
    {
        code: "SPH",
        name: "Sphagnum Peatland",
        traits: { structure: "treeless", moisture: "waterlogged", assemblage: "wetland" },
        species: ["Sphagnum cristatum", "Drosera arcturi"],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },
    {
        code: "SM",
        name: "Saltmarsh",
        traits: { structure: "treeless", moisture: "coastal", assemblage: "coastal" },
        species: ["Sarcocornia quinqueflora", "Tecticornia arbuscula"],
        exclusions: { structure: ["forest", "woodland"], moisture: ["dry", "alpine"] }
    },
    {
        code: "SD",
        name: "Coastal Dune Scrub",
        traits: { structure: "scrub", moisture: "coastal", assemblage: "coastal" },
        species: ["Spinifex sericeus", "Ammophila arenaria", "Banksia marginata"],
        exclusions: { moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "ALP",
        name: "Alpine Complex",
        traits: { structure: "treeless", moisture: "alpine", elevation: "high", assemblage: "alpine" },
        species: ["Richea scoparia", "Donatia novae-zelandiae", "Podocarpus lawrencei"],
        exclusions: { moisture: ["dry", "wet", "coastal"], elevation: ["low", "mid"] }
    },
    {
        code: "ROS",
        name: "Rainforest / Scrub Ecotone",
        traits: { structure: "scrub", moisture: "wet", dominant: "mixed", assemblage: "rainforest_edge" },
        species: ["Nothofagus cunninghamii", "Leptospermum scoparium", "Atherosperma moschatum"]
    }
];

// ASSEMBLAGE DETECTION RULES
const assemblageRules = [
    {
        name: "rainforest",
        species: ["Nothofagus cunninghamii", "Atherosperma moschatum", "Anodopetalum biglandulosum"],
        minMatches: 2,
        bonus: 15,
        traitMatch: { dominant: "rainforest" }
    },
    {
        name: "dry_forest",
        species: ["Eucalyptus amygdalina", "Eucalyptus pulchella", "Eucalyptus nitida"],
        minMatches: 2,
        bonus: 10,
        traitMatch: { moisture: "dry", dominant: "eucalypt" }
    },
    {
        name: "wet_forest",
        species: ["Eucalyptus obliqua", "Eucalyptus regnans", "Eucalyptus delegatensis", "Dicksonia antarctica"],
        minMatches: 2,
        bonus: 10,
        traitMatch: { moisture: "wet", dominant: "eucalypt" }
    },
    {
        name: "wetland",
        species: ["Gymnoschoenus sphaerocephalus", "Sphagnum cristatum", "Baumea", "Juncus"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { moisture: "waterlogged" }
    },
    {
        name: "alpine",
        species: ["Richea scoparia", "Donatia novae-zelandiae", "Podocarpus lawrencei"],
        minMatches: 1,
        bonus: 15,
        traitMatch: { moisture: "alpine", elevation: "high" }
    }
];

const WEIGHTS = {
    structure: 4,
    moisture: 3,
    dominant: 4,
    elevation: 2,
    substrate: 2,
    drainage: 2,
    exposure: 1,
    fire_history: 2,
    disturbance: 1
};

const SPECIES_WEIGHT = 6;
const ASSEMBLAGE_BONUS_MAX = 20;

function detectAssemblage(speciesList, inputs) {
    let assemblageBonuses = [];
    
    for (let rule of assemblageRules) {
        let matches = 0;
        for (let sp of speciesList) {
            for (let ruleSp of rule.species) {
                if (sp.toLowerCase().includes(ruleSp.toLowerCase()) || 
                    ruleSp.toLowerCase().includes(sp.toLowerCase())) {
                    matches++;
                    break;
                }
            }
        }
        
        if (matches >= rule.minMatches) {
            let traitBonus = 0;
            if (rule.traitMatch) {
                for (let [key, value] of Object.entries(rule.traitMatch)) {
                    if (inputs[key] === value) traitBonus += 5;
                }
            }
            assemblageBonuses.push({
                name: rule.name,
                bonus: rule.bonus + traitBonus,
                matches: matches
            });
        }
    }
    
    // Return highest bonus if multiple assemblages detected
    if (assemblageBonuses.length > 0) {
        assemblageBonuses.sort((a, b) => b.bonus - a.bonus);
        return assemblageBonuses[0];
    }
    return null;
}

function applyHardExclusions(comm, inputs, environmentalContext) {
    let penalty = 0;
    let reasons = [];
    let isHardExcluded = false;

    // Structure mismatch penalty (increased)
    if (inputs.structure === "treeless" && comm.traits.structure === "forest") {
        penalty -= 8;
        reasons.push("❌ EXCLUSION: Treeless structure cannot be forest");
        isHardExcluded = true;
    }
    
    if (inputs.structure === "forest" && comm.traits.structure === "treeless") {
        penalty -= 6;
        reasons.push("❌ EXCLUSION: Forest structure cannot be treeless community");
        isHardExcluded = true;
    }

    // Moisture vs dominant hard exclusion
    if (inputs.moisture === "dry" && comm.traits.dominant === "rainforest") {
        penalty -= 12;
        reasons.push("❌ HARD EXCLUSION: Rainforest cannot occur in dry conditions");
        isHardExcluded = true;
    }
    
    if (inputs.moisture === "alpine" && comm.traits.dominant === "rainforest") {
        penalty -= 12;
        reasons.push("❌ HARD EXCLUSION: Rainforest does not occur in alpine zone");
        isHardExcluded = true;
    }
    
    if (inputs.moisture === "coastal" && comm.traits.moisture === "alpine") {
        penalty -= 12;
        reasons.push("❌ HARD EXCLUSION: Coastal and alpine are mutually exclusive");
        isHardExcluded = true;
    }
    
    if (inputs.moisture === "alpine" && comm.traits.moisture === "coastal") {
        penalty -= 12;
        reasons.push("❌ HARD EXCLUSION: Alpine and coastal are mutually exclusive");
        isHardExcluded = true;
    }

    // Dominant exclusions
    if (inputs.dominant === "buttongrass" && comm.code !== "M") {
        penalty -= 6;
        reasons.push("❌ EXCLUSION: Buttongrass dominant only matches Buttongrass Moorland");
        isHardExcluded = true;
    }
    
    if (inputs.dominant === "rainforest" && comm.traits.dominant !== "rainforest" && comm.code !== "ROS") {
        penalty -= 8;
        reasons.push("❌ EXCLUSION: Rainforest dominant only matches Rainforest communities");
        isHardExcluded = true;
    }

    // Elevation exclusions
    if (inputs.elevation === "high" && comm.traits.elevation === "low") {
        penalty -= 5;
        reasons.push("❌ EXCLUSION: Elevation mismatch (high vs low)");
        isHardExcluded = true;
    }
    
    if (inputs.elevation === "low" && comm.traits.elevation === "high") {
        penalty -= 5;
        reasons.push("❌ EXCLUSION: Elevation mismatch (low vs high)");
        isHardExcluded = true;
    }

    // Paperbark indicator
    if (inputs.dominant === "paperbark" && comm.traits.dominant !== "paperbark") {
        penalty -= 5;
        reasons.push("❌ EXCLUSION: Paperbark indicates Swamp Paperbark Forest");
        isHardExcluded = true;
    }

    // Environmental context exclusions
    if (environmentalContext.substrate === "limestone" && comm.code === "M") {
        penalty -= 6;
        reasons.push("❌ EXCLUSION: Buttongrass rarely occurs on limestone");
    }
    
    if (environmentalContext.drainage === "well_drained" && comm.traits.moisture === "waterlogged") {
        penalty -= 6;
        reasons.push("❌ EXCLUSION: Well-drained site cannot be waterlogged community");
        isHardExcluded = true;
    }
    
    if (environmentalContext.drainage === "poor" && (comm.traits.moisture === "dry" || comm.traits.moisture === "coastal")) {
        penalty -= 4;
        reasons.push("⚠ Poor drainage conflicts with dry/coastal community");
    }
    
    if (environmentalContext.fire_history === "recent" && (comm.code === "R" || comm.code === "MYF")) {
        penalty -= 10;
        reasons.push("❌ EXCLUSION: Rainforest cannot survive recent fire");
        isHardExcluded = true;
    }
    
    if (environmentalContext.disturbance === "cleared" && comm.traits.structure === "forest") {
        penalty -= 6;
        reasons.push("⚠ Cleared site unlikely to be intact forest");
    }

    return { penalty, reasons, isHardExcluded };
}

function scoreCommunity(comm, inputs, environmentalContext) {
    let score = 0;
    let reasons = [];

    // Trait matching
    for (let key in comm.traits) {
        let weight = WEIGHTS[key] || 1;

        if (inputs[key] === comm.traits[key]) {
            score += weight;
            reasons.push(`✓ ${key}: ${comm.traits[key]} (+${weight})`);
        } else if (inputs[key]) {
            let penalty = -Math.round(weight / 2);
            score += penalty;
            reasons.push(`⚠ ${key}: expected "${comm.traits[key]}" got "${inputs[key]}" (${penalty})`);
        }
    }

    // Species matching
    if (inputs.species && inputs.species.length > 0 && comm.species) {
        inputs.species.forEach(obs => {
            comm.species.forEach(sp => {
                if (sp.toLowerCase().includes(obs.toLowerCase()) || 
                    obs.toLowerCase().includes(sp.toLowerCase())) {
                    score += SPECIES_WEIGHT;
                    reasons.push(`🌿 Species match: ${sp} (+${SPECIES_WEIGHT})`);
                }
            });
        });
    }

    // Assemblage detection (this is gold!)
    let assemblage = detectAssemblage(inputs.species || [], inputs);
    if (assemblage && comm.traits.assemblage === assemblage.name) {
        score += assemblage.bonus;
        reasons.push(`🏆 ASSEMBLAGE LOCK: ${assemblage.name} detected! (+${assemblage.bonus})`);
    } else if (assemblage && assemblage.name === "rainforest" && comm.traits.assemblage === "rainforest_edge") {
        score += Math.round(assemblage.bonus * 0.7);
        reasons.push(`🌿 Rainforest assemblage suggests rainforest-edge community (+${Math.round(assemblage.bonus * 0.7)})`);
    }

    // Exclusions
    let exclusion = applyHardExclusions(comm, inputs, environmentalContext);
    score += exclusion.penalty;
    reasons = reasons.concat(exclusion.reasons);
    
    if (exclusion.isHardExcluded) {
        score = -999; // Effectively remove from top results
    }

    return { score, reasons, isHardExcluded: exclusion.isHardExcluded };
}

function getConfidence(score) {
    if (score >= 18) return { label: "High confidence", colour: "#2e7d32", icon: "🟢" };
    if (score >= 10) return { label: "Moderate confidence", colour: "#f9a825", icon: "🟡" };
    if (score >= 4) return { label: "Low confidence", colour: "#ff6b35", icon: "🟠" };
    return { label: "Very low confidence", colour: "#c62828", icon: "🔴" };
}

// Get environmental context from form
function getEnvironmentalContext() {
    return {
        substrate: document.getElementById("substrate")?.value || "",
        drainage: document.getElementById("drainage")?.value || "",
        exposure: document.getElementById("exposure")?.value || "",
        fire_history: document.getElementById("fire_history")?.value || "",
        disturbance: document.getElementById("disturbance")?.value || ""
    };
}

function runAnalysis() {
    const structureEl = document.getElementById("structure");
    const moistureEl = document.getElementById("moisture");
    const dominantEl = document.getElementById("dominant");
    const elevationEl = document.getElementById("elevation");
    const speciesEl = document.getElementById("species");

    const inputs = {
        structure: structureEl.value,
        moisture: moistureEl.value,
        dominant: dominantEl.value,
        elevation: elevationEl.value,
        species: speciesEl.value.split(",").map(s => s.trim()).filter(Boolean)
    };
    
    const environmentalContext = getEnvironmentalContext();

    let results = communities.map(c => {
        let r = scoreCommunity(c, inputs, environmentalContext);
        return { 
            code: c.code, 
            name: c.name, 
            score: r.score, 
            reasons: r.reasons,
            isHardExcluded: r.isHardExcluded
        };
    })
    .filter(r => !r.isHardExcluded) // Remove hard-excluded communities
    .sort((a, b) => b.score - a.score);
    
    // Store structured results for decision record
    currentResults = results.map(r => ({
        code: r.code,
        name: r.name,
        score: r.score,
        confidence: getConfidence(r.score).label
    }));

    let html = `
        <div class="card">
            <h3>🌿 Decision Record</h3>
            <p class="small">Structured analysis results - ${new Date().toLocaleString()}</p>
    `;
    
    if (results.length === 0) {
        html += "<p>No matching communities found after applying exclusions.</p>";
    } else {
        html += `<div class="button-group" style="margin-bottom:12px;">
                    <button onclick="exportDecisionRecord()" style="background:#2c7da0;">📋 Export Decision Record</button>
                    <button onclick="copyDecisionSummary()" style="background:#2c7da0;">📋 Copy Summary</button>
                </div>`;
        
        results.slice(0, 7).forEach(r => {
            const conf = getConfidence(r.score);
            const confidencePercent = Math.min(100, Math.round((r.score / 25) * 100));

            html += `
                <div class="result-card">
                    <div class="result-code">
                        <span class="traffic-light ${conf.label.toLowerCase().replace(' ', '-')}"></span>
                        <strong>${r.code} — ${r.name}</strong>
                        <span style="float:right; font-size:0.8em;">Confidence: ${confidencePercent}%</span>
                    </div>
                    <div class="result-score">
                        Score: ${r.score} | 
                        <span style="color:${conf.colour}; font-weight:bold;">${conf.icon} ${conf.label}</span>
                    </div>
                    <div class="result-reasons">
                        ${r.reasons.length ? r.reasons.slice(0, 8).join("<br>") : "No specific matches"}
                        ${r.reasons.length > 8 ? "<br><em>+ more factors considered...</em>" : ""}
                    </div>
                </div>
            `;
        });
        
        // Add assemblage summary
        const assemblage = detectAssemblage(inputs.species || [], inputs);
        if (assemblage) {
            html += `
                <div style="background:#e8f5e9; padding:10px; border-radius:8px; margin-top:10px;">
                    <strong>🏆 Assemblage Detected:</strong> ${assemblage.name.toUpperCase()} 
                    (bonus: +${assemblage.bonus})
                </div>
            `;
        }
    }
    
    html += `</div>`;
    document.getElementById("results").innerHTML = html;
}

// Export decision record as structured JSON
function exportDecisionRecord() {
    if (!currentResults.length) {
        alert("No analysis results to export. Run analysis first.");
        return;
    }
    
    const record = {
        type: "tasveg_decision_record",
        timestamp: new Date().toISOString(),
        location: currentLatLng,
        environmental_context: getEnvironmentalContext(),
        inputs: {
            structure: document.getElementById("structure").value,
            moisture: document.getElementById("moisture").value,
            dominant: document.getElementById("dominant").value,
            elevation: document.getElementById("elevation").value,
            species: document.getElementById("species").value
        },
        results: currentResults,
        photos_count: photos.length,
        version: "8.0"
    };
    
    const dataStr = JSON.stringify(record, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tasveg_decision_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function copyDecisionSummary() {
    if (!currentResults.length) {
        alert("No results to copy.");
        return;
    }
    
    let summary = `TasVEG Decision Record\n${new Date().toLocaleString()}\n`;
    summary += `Location: ${currentLatLng ? currentLatLng.lat.toFixed(5) + ", " + currentLatLng.lon.toFixed(5) : "Not set"}\n`;
    summary += `\nTop Results:\n`;
    
    currentResults.slice(0, 3).forEach((r, i) => {
        summary += `${i+1}. ${r.code} - ${r.name} (Score: ${r.score}, ${r.confidence})\n`;
    });
    
    navigator.clipboard.writeText(summary);
    alert("Decision summary copied to clipboard!");
}

// SAVE RECORD - updated to use decision record format
async function saveRecord() {
    if (!currentLatLng) {
        alert("Please set a location on the map first (click or use GPS).");
        return;
    }

    const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        location: currentLatLng,
        environmental_context: getEnvironmentalContext(),
        inputs: {
            structure: document.getElementById("structure").value,
            moisture: document.getElementById("moisture").value,
            dominant: document.getElementById("dominant").value,
            elevation: document.getElementById("elevation").value,
            species: document.getElementById("species").value
        },
        results: currentResults, // Structured results array
        photos: photos,
        version: "8.0"
    };

    await saveToDB(record);
    alert("✅ Record saved offline as decision record!");
}
