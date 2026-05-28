let map = L.map('map').setView([-42, 147], 6);
let marker;
let currentLatLng = null;
let photos = [];

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
    });

    document.getElementById("coords").innerText = lat.toFixed(5) + ", " + lon.toFixed(5);
    map.setView([lat, lon], 14);
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

// COMPLETE TASVEG DATASET WITH EXCLUSIONS
const communities = [
    {
        code: "WET",
        name: "Wet Eucalypt Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt" },
        species: ["Eucalyptus obliqua", "Eucalyptus regnans", "Eucalyptus delegatensis", "Dicksonia antarctica", "Atherosperma moschatum"]
    },
    {
        code: "DGL",
        name: "Dry Eucalypt Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt" },
        species: ["Eucalyptus amygdalina", "Eucalyptus pulchella", "Eucalyptus nitida", "Eucalyptus viminalis", "Banksia marginata"]
    },
    {
        code: "R",
        name: "Cool Temperate Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest" },
        species: ["Nothofagus cunninghamii", "Atherosperma moschatum", "Anodopetalum biglandulosum", "Dicksonia antarctica"]
    },
    {
        code: "MYF",
        name: "Mixed Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "mixed" },
        species: ["Eucalyptus obliqua", "Nothofagus cunninghamii"]
    },
    {
        code: "WDL",
        name: "Eucalypt Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt" },
        species: ["Eucalyptus viminalis", "Eucalyptus ovata", "Allocasuarina verticillata"]
    },
    {
        code: "SKL",
        name: "Scrub Woodland Complex",
        traits: { structure: "woodland", moisture: "dry", dominant: "mixed" },
        species: ["Acacia dealbata", "Allocasuarina verticillata", "Banksia marginata"]
    },
    {
        code: "SH",
        name: "Heathland",
        traits: { structure: "scrub", moisture: "dry" },
        species: ["Epacris impressa", "Pultenaea juniperina", "Banksia marginata"]
    },
    {
        code: "SL",
        name: "Tea-tree Scrub",
        traits: { structure: "scrub", dominant: "melaleuca" },
        species: ["Leptospermum scoparium", "Melaleuca squarrosa", "Melaleuca ericifolia"]
    },
    {
        code: "MPF",
        name: "Swamp Paperbark Forest",
        traits: { structure: "forest", moisture: "waterlogged", dominant: "paperbark" },
        species: ["Melaleuca ericifolia", "Melaleuca squarrosa", "Leptospermum lanigerum", "Sphagnum cristatum", "Baumea rubiginosa"]
    },
    {
        code: "M",
        name: "Buttongrass Moorland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "buttongrass" },
        species: ["Gymnoschoenus sphaerocephalus"]
    },
    {
        code: "SW",
        name: "Sedgeland / Rushland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "sedges" },
        species: ["Baumea", "Juncus", "Carex"]
    },
    {
        code: "SPH",
        name: "Sphagnum Peatland",
        traits: { structure: "treeless", moisture: "waterlogged" },
        species: ["Sphagnum cristatum", "Drosera arcturi"]
    },
    {
        code: "SM",
        name: "Saltmarsh",
        traits: { structure: "treeless", moisture: "coastal" },
        species: ["Sarcocornia quinqueflora", "Tecticornia arbuscula"]
    },
    {
        code: "SD",
        name: "Coastal Dune Scrub",
        traits: { structure: "scrub", moisture: "coastal" },
        species: ["Spinifex sericeus", "Ammophila arenaria", "Banksia marginata"]
    },
    {
        code: "ALP",
        name: "Alpine Complex",
        traits: { structure: "treeless", moisture: "alpine", elevation: "high" },
        species: ["Richea scoparia", "Donatia novae-zelandiae", "Podocarpus lawrencei"]
    }
];

const WEIGHTS = {
    structure: 4,
    moisture: 3,
    dominant: 4,
    elevation: 2
};

const SPECIES_WEIGHT = 6;

function applyExclusions(comm, inputs) {
    let penalty = 0;
    let reasons = [];

    if (inputs.structure === "treeless" && comm.traits.structure === "forest") {
        penalty -= 6;
        reasons.push("✖ Structure mismatch: treeless vs forest");
    }

    if (inputs.dominant === "buttongrass" && comm.code !== "M") {
        penalty -= 4;
        reasons.push("✖ Buttongrass dominant only matches Buttongrass Moorland");
    }

    if (inputs.elevation === "high" && comm.traits.elevation === "low") {
        penalty -= 3;
        reasons.push("✖ Elevation mismatch");
    }

    if (inputs.dominant === "paperbark" && comm.traits.dominant !== "paperbark") {
        penalty -= 3;
        reasons.push("✖ Paperbark indicates Swamp Paperbark Forest");
    }

    return { penalty, reasons };
}

function scoreCommunity(comm, inputs) {
    let score = 0;
    let reasons = [];

    for (let key in comm.traits) {
        let weight = WEIGHTS[key] || 1;

        if (inputs[key] === comm.traits[key]) {
            score += weight;
            reasons.push(`✔ ${key}: ${comm.traits[key]} (+${weight})`);
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
                if (sp.toLowerCase().includes(obs.toLowerCase())) {
                    score += SPECIES_WEIGHT;
                    reasons.push(`🌿 Species match: ${sp} (+${SPECIES_WEIGHT})`);
                }
            });
        });
    }

    let exclusion = applyExclusions(comm, inputs);
    score += exclusion.penalty;
    reasons = reasons.concat(exclusion.reasons);

    return { score, reasons };
}

function getConfidence(score) {
    if (score >= 12) return { label: "High confidence", colour: "#2e7d32", icon: "🟢" };
    if (score >= 6) return { label: "Moderate confidence", colour: "#f9a825", icon: "🟡" };
    return { label: "Low confidence", colour: "#c62828", icon: "🔴" };
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

    let results = communities.map(c => {
        let r = scoreCommunity(c, inputs);
        return { ...c, ...r };
    }).sort((a, b) => b.score - a.score);

    let html = "<h3>🌿 Top Likely Communities</h3>";

    results.slice(0, 7).forEach(r => {
        const conf = getConfidence(r.score);

        html += `
            <div class="result-card">
                <div class="result-code">
                    <span class="traffic-light ${conf.label.toLowerCase().replace(' ', '-')}"></span>
                    <strong>${r.code} — ${r.name}</strong>
                </div>
                <div class="result-score">
                    Score: ${r.score} | 
                    <span style="color:${conf.colour}; font-weight:bold;">${conf.icon} ${conf.label}</span>
                </div>
                <div class="result-reasons">
                    ${r.reasons.length ? r.reasons.join("<br>") : "No specific matches"}
                </div>
            </div>
        `;
    });

    if (results.length === 0) {
        html = "<p>No matching communities found.</p>";
    }

    document.getElementById("results").innerHTML = html;
}

// SAVE RECORD
async function saveRecord() {
    if (!currentLatLng) {
        alert("Please set a location on the map first (click or use GPS).");
        return;
    }

    const structureEl = document.getElementById("structure");
    const moistureEl = document.getElementById("moisture");
    const dominantEl = document.getElementById("dominant");
    const elevationEl = document.getElementById("elevation");
    const speciesEl = document.getElementById("species");

    const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        location: currentLatLng,
        inputs: {
            structure: structureEl.value,
            moisture: moistureEl.value,
            dominant: dominantEl.value,
            elevation: elevationEl.value,
            species: speciesEl.value
        },
        photos: photos,
        resultsHtml: document.getElementById("results").innerHTML
    };

    await saveToDB(record);
    alert("✅ Record saved offline!");
}
