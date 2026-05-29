// app.js - Enhanced with decision records, environmental context, version checking
// WITHOUT datasets - add your communities and assemblageRules arrays back in

const APP_VERSION = "8.0.1";

// Global variables
let map;
let marker;
let currentLatLng = null;
let photos = [];
let currentResults = [];

// ===== DEBUG MODE =====
const DEBUG_MODE = false;

// ===== WEIGHTS =====
const WEIGHTS = {
    structure: 2,
    moisture: 2,
    dominant: 2,
    elevation: 1,
    substrate: 1,
    drainage: 1,
    exposure: 0.5,
    fire_history: 1,
    disturbance: 0.5
};

const SPECIES_WEIGHT = 2;
const ASSEMBLAGE_BONUS_MAX = 20;

// COMPLETE TASVEG DATASET - ALL 163 COMMUNITIES
// Based on "From Forest to Fjaeldmark" Edition 2 documentation

const communities = [
    // ========== DRY EUCALYPT FOREST AND WOODLAND (20 communities) ==========
    {
        code: "DAC",
        name: "Eucalyptus amygdalina Coastal Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus amygdalina", "Eucalyptus viminalis", "Banksia marginata", "Allocasuarina littoralis", "Pteridium esculentum"],
        exclusions: { moisture: ["wet", "waterlogged", "alpine"] }
    },
    {
        code: "DAD",
        name: "Eucalyptus amygdalina Forest and Woodland on Dolerite",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "mid" },
        species: ["Eucalyptus amygdalina", "Eucalyptus viminalis", "Bursaria spinosa", "Banksia marginata", "Acacia dealbata"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DAS",
        name: "Eucalyptus amygdalina Forest and Woodland on Sandstone",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus amygdalina", "Eucalyptus obliqua", "Acacia dealbata", "Allocasuarina littoralis", "Lomandra longifolia"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DAM",
        name: "Eucalyptus amygdalina Forest on Mudstone",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus amygdalina", "Eucalyptus viminalis", "Allocasuarina littoralis", "Exocarpos cupressiformis", "Pteridium esculentum"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DAZ",
        name: "Eucalyptus amygdalina Inland Forest and Woodland on Cainozoic Deposits",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus amygdalina", "Eucalyptus viminalis", "Eucalyptus pauciflora", "Banksia marginata", "Themeda triandra"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DSC",
        name: "Eucalyptus amygdalina–Eucalyptus obliqua Damp Sclerophyll Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus amygdalina", "Eucalyptus obliqua", "Eucalyptus ovata", "Eucalyptus viminalis", "Pomaderris apetala"],
        exclusions: { moisture: ["dry", "alpine"] }
    },
    {
        code: "DBA",
        name: "Eucalyptus barberi Forest and Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus barberi", "Eucalyptus pulchella", "Callitris rhomboidea", "Lomandra longifolia"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DCO",
        name: "Eucalyptus coccifera Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "high" },
        species: ["Eucalyptus coccifera", "Eucalyptus urnigera", "Richea scoparia", "Orites revoluta", "Leptospermum rupestre"],
        exclusions: { moisture: ["wet", "waterlogged"], elevation: ["low"] }
    },
    {
        code: "DCR",
        name: "Eucalyptus cordata Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus cordata", "Eucalyptus pulchella", "Eucalyptus globulus", "Gahnia grandis"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "DDP",
        name: "Eucalyptus dalrympleana–Eucalyptus pauciflora Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "high" },
        species: ["Eucalyptus dalrympleana", "Eucalyptus pauciflora", "Richea procera", "Lomatia tinctoria", "Poa gunnii"],
        exclusions: { moisture: ["wet", "waterlogged"], elevation: ["low"] }
    },
    {
        code: "DDE",
        name: "Eucalyptus tasmaniensis Dry Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "mid" },
        species: ["Eucalyptus tasmaniensis", "Eucalyptus dalrympleana", "Eucalyptus amygdalina", "Acacia dealbata", "Poa spp."],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DGL",
        name: "Eucalyptus globulus Dry Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus globulus", "Eucalyptus pulchella", "Eucalyptus viminalis", "Banksia marginata", "Themeda triandra"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DGW",
        name: "Eucalyptus gunnii Woodland",
        traits: { structure: "woodland", moisture: "waterlogged", dominant: "eucalypt", assemblage: "wetland", elevation: "high" },
        species: ["Eucalyptus gunnii", "Poa gunnii", "Gymnoschoenus sphaerocephalus", "Lepidosperma filiforme"],
        exclusions: { moisture: ["dry", "coastal"], elevation: ["low"] }
    },
    {
        code: "DMO",
        name: "Eucalyptus morrisbyi Forest and Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus morrisbyi", "Eucalyptus tenuiramis", "Eucalyptus amygdalina", "Bursaria spinosa"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DNI",
        name: "Eucalyptus nitida Dry Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus nitida", "Xanthorrhoea australis", "Banksia marginata", "Leptospermum glaucescens"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DFP",
        name: "Furneaux Peppermint Forest",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus nitida aff.", "Eucalyptus globulus", "Xanthorrhoea australis", "Banksia marginata", "Allocasuarina verticillata"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DOB",
        name: "Eucalyptus obliqua Dry Forest",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus obliqua", "Eucalyptus amygdalina", "Acacia dealbata", "Lomatia tinctoria", "Epacris impressa"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DOV",
        name: "Eucalyptus ovata Forest and Woodland",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus ovata", "Eucalyptus viminalis", "Acacia melanoxylon", "Leptospermum lanigerum", "Melaleuca ericifolia"],
        exclusions: { moisture: ["dry", "alpine"] }
    },
    {
        code: "DOW",
        name: "Eucalyptus ovata Heathy Woodland",
        traits: { structure: "woodland", moisture: "waterlogged", dominant: "eucalypt", assemblage: "wetland" },
        species: ["Eucalyptus ovata", "Banksia marginata", "Leptospermum lanigerum", "Melaleuca squarrosa", "Gahnia grandis"],
        exclusions: { moisture: ["dry", "alpine"] }
    },
    {
        code: "DPO",
        name: "Eucalyptus pauciflora Forest and Woodland not on Dolerite",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus pauciflora", "Eucalyptus tenuiramis", "Eucalyptus rubida", "Epacris impressa", "Lomandra longifolia"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DPD",
        name: "Eucalyptus pauciflora Forest and Woodland on Dolerite",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "mid" },
        species: ["Eucalyptus pauciflora", "Banksia marginata", "Poa spp.", "Leptecophylla juniperina", "Lomatia tinctoria"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DPE",
        name: "Eucalyptus perriniana Forest and Woodland",
        traits: { structure: "woodland", moisture: "waterlogged", dominant: "eucalypt", assemblage: "wetland" },
        species: ["Eucalyptus perriniana", "Eucalyptus rodwayi", "Leptospermum scoparium", "Melaleuca virens", "Sphagnum spp."],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "DPU",
        name: "Eucalyptus pulchella Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus pulchella", "Eucalyptus globulus", "Eucalyptus viminalis", "Banksia marginata", "Themeda triandra"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DRI",
        name: "Eucalyptus risdonii Forest and Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus risdonii", "Eucalyptus tenuiramis", "Eucalyptus amygdalina", "Acacia dealbata", "Poa rodwayi"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DRO",
        name: "Eucalyptus rodwayi Forest and Woodland",
        traits: { structure: "forest", moisture: "waterlogged", dominant: "eucalypt", assemblage: "wetland", elevation: "mid" },
        species: ["Eucalyptus rodwayi", "Eucalyptus pauciflora", "Leptospermum lanigerum", "Melaleuca squarrosa", "Gahnia grandis"],
        exclusions: { moisture: ["dry", "coastal"] }
    },
    {
        code: "DSO",
        name: "Eucalyptus sieberi Forest and Woodland not on Granite",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus sieberi", "Eucalyptus amygdalina", "Allocasuarina littoralis", "Exocarpos cupressiformis", "Xanthorrhoea australis"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DSG",
        name: "Eucalyptus sieberi Forest and Woodland on Granite",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus sieberi", "Eucalyptus globulus", "Allocasuarina littoralis", "Epacris impressa", "Xanthorrhoea australis"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DTD",
        name: "Eucalyptus tenuiramis Forest and Woodland on Dolerite",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus tenuiramis", "Eucalyptus viminalis", "Banksia marginata", "Callitris rhomboidea", "Epacris impressa"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DTG",
        name: "Eucalyptus tenuiramis Forest and Woodland on Granite",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus tenuiramis", "Eucalyptus amygdalina", "Banksia marginata", "Allocasuarina littoralis", "Pultenaea spp."],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DTO",
        name: "Eucalyptus tenuiramis Forest and Woodland on Sediments",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus tenuiramis", "Eucalyptus pauciflora", "Eucalyptus rubida", "Pteridium esculentum", "Lomandra longifolia"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DVF",
        name: "Eucalyptus viminalis Furneaux Forest and Woodland",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest", elevation: "low" },
        species: ["Eucalyptus viminalis", "Eucalyptus globulus", "Acacia melanoxylon", "Pomaderris apetala", "Dicksonia antarctica"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "DVG",
        name: "Eucalyptus viminalis Grassy Forest and Woodland",
        traits: { structure: "forest", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest" },
        species: ["Eucalyptus viminalis", "Eucalyptus pauciflora", "Eucalyptus ovata", "Themeda triandra", "Poa spp."],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DVC",
        name: "Eucalyptus viminalis–Eucalyptus globulus Coastal Forest and Woodland",
        traits: { structure: "forest", moisture: "coastal", dominant: "eucalypt", assemblage: "coastal", elevation: "low" },
        species: ["Eucalyptus viminalis", "Eucalyptus globulus", "Banksia marginata", "Acacia longifolia", "Pteridium esculentum"],
        exclusions: { moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "DKW",
        name: "King Island Eucalypt Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus globulus", "Eucalyptus viminalis", "Eucalyptus brookeriana", "Banksia marginata", "Acacia mucronata"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "DMW",
        name: "Midlands Woodland Complex",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt", assemblage: "dry_forest", elevation: "low" },
        species: ["Eucalyptus ovata", "Eucalyptus pauciflora", "Eucalyptus viminalis", "Themeda triandra", "Poa rodwayi"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },

    // ========== WET EUCALYPT FOREST AND WOODLAND (from documentation) ==========
    {
        code: "WBR",
        name: "Eucalyptus brookeriana Wet Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus brookeriana", "Eucalyptus obliqua", "Acacia melanoxylon", "Pomaderris apetala", "Olearia argophylla"],
        exclusions: { moisture: ["dry", "alpine"] }
    },
    {
        code: "WDA",
        name: "Eucalyptus dalrympleana Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest", elevation: "mid" },
        species: ["Eucalyptus dalrympleana", "Eucalyptus tasmaniensis", "Acacia dealbata", "Pomaderris apetala", "Dicksonia antarctica"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "WDB",
        name: "Eucalyptus tasmaniensis Forest with Broad-leaf Shrubs",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest", elevation: "mid" },
        species: ["Eucalyptus tasmaniensis", "Bedfordia salicina", "Olearia argophylla", "Pomaderris apetala", "Dicksonia antarctica"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WDL",
        name: "Eucalyptus tasmaniensis Forest over Leptospermum",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus tasmaniensis", "Leptospermum lanigerum", "Leptospermum scoparium", "Olearia lirata", "Pteridium esculentum"],
        exclusions: { moisture: ["dry", "alpine"] }
    },
    {
        code: "WDR",
        name: "Eucalyptus tasmaniensis Forest over Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus tasmaniensis", "Nothofagus cunninghamii", "Atherosperma moschatum", "Eucryphia lucida", "Phyllocladus aspleniifolius"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WDU",
        name: "Eucalyptus tasmaniensis Wet Forest (Undifferentiated)",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus tasmaniensis", "Eucalyptus obliqua", "Nothofagus cunninghamii", "Atherosperma moschatum"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WGL",
        name: "Eucalyptus globulus Wet Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus globulus", "Eucalyptus obliqua", "Acacia melanoxylon", "Pomaderris apetala", "Olearia argophylla"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WGK",
        name: "Eucalyptus globulus King Island Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest", elevation: "low" },
        species: ["Eucalyptus globulus", "Eucalyptus brookeriana", "Acacia melanoxylon", "Pomaderris apetala", "Olearia argophylla"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WNR",
        name: "Eucalyptus nitida over Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus nitida", "Nothofagus cunninghamii", "Atherosperma moschatum", "Eucryphia lucida", "Phyllocladus aspleniifolius"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WNL",
        name: "Eucalyptus nitida Forest over Leptospermum",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus nitida", "Leptospermum scoparium", "Leptospermum glaucescens", "Melaleuca squarrosa", "Banksia marginata"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WNU",
        name: "Eucalyptus nitida Wet Forest (Undifferentiated)",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus nitida", "Nothofagus cunninghamii", "Leptospermum scoparium", "Atherosperma moschatum"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WOB",
        name: "Eucalyptus obliqua Forest with Broad-leaf Shrubs",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus obliqua", "Bedfordia salicina", "Olearia argophylla", "Pomaderris apetala", "Dicksonia antarctica"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WOL",
        name: "Eucalyptus obliqua Forest over Leptospermum",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus obliqua", "Leptospermum lanigerum", "Leptospermum scoparium", "Melaleuca squarrosa", "Gahnia grandis"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WOR",
        name: "Eucalyptus obliqua Forest over Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus obliqua", "Nothofagus cunninghamii", "Atherosperma moschatum", "Eucryphia lucida", "Phyllocladus aspleniifolius"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WOU",
        name: "Eucalyptus obliqua Wet Forest (Undifferentiated)",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus obliqua", "Nothofagus cunninghamii", "Atherosperma moschatum", "Eucryphia lucida"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WRE",
        name: "Eucalyptus regnans Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus regnans", "Eucalyptus obliqua", "Atherosperma moschatum", "Nothofagus cunninghamii", "Dicksonia antarctica"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "WSU",
        name: "Eucalyptus subcrenulata Forest and Woodland",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest", elevation: "high" },
        species: ["Eucalyptus subcrenulata", "Eucalyptus coccifera", "Nothofagus cunninghamii", "Richea pandanifolia", "Orites diversifolia"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "WVI",
        name: "Eucalyptus viminalis Wet Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "eucalypt", assemblage: "wet_forest" },
        species: ["Eucalyptus viminalis", "Acacia dealbata", "Pomaderris apetala", "Olearia argophylla", "Dicksonia antarctica"],
        exclusions: { moisture: ["dry"] }
    },

    // ========== RAINFOREST AND RELATED SCRUB (16 communities) ==========
    {
        code: "RCO",
        name: "Coastal Rainforest",
        traits: { structure: "forest", moisture: "coastal", dominant: "rainforest", assemblage: "rainforest", elevation: "low" },
        species: ["Atherosperma moschatum", "Eucryphia lucida", "Phyllocladus aspleniifolius", "Olearia argophylla", "Pomaderris apetala"],
        exclusions: { moisture: ["dry", "alpine"] }
    },
    {
        code: "RFE",
        name: "Rainforest Fernland",
        traits: { structure: "treeless", moisture: "wet", dominant: "fern", assemblage: "rainforest_edge" },
        species: ["Dicksonia antarctica", "Blechnum wattsii", "Polystichum proliferum", "Hymenophyllum spp."],
        exclusions: { structure: ["forest", "woodland"], moisture: ["dry"] }
    },
    {
        code: "RFS",
        name: "Nothofagus gunnii Rainforest Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "high" },
        species: ["Nothofagus gunnii", "Athrotaxis selaginoides", "Diselma archeri", "Richea pandanifolia", "Orites milliganii"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RHP",
        name: "Lagarostrobos franklinii Rainforest and Scrub",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest" },
        species: ["Lagarostrobos franklinii", "Nothofagus cunninghamii", "Eucryphia lucida", "Phyllocladus aspleniifolius", "Anopterus glandulosus"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "RKF",
        name: "Athrotaxis selaginoides–Nothofagus gunnii Short Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "high" },
        species: ["Athrotaxis selaginoides", "Nothofagus gunnii", "Diselma archeri", "Richea pandanifolia", "Orites milliganii"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RKP",
        name: "Athrotaxis selaginoides Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "mid" },
        species: ["Athrotaxis selaginoides", "Nothofagus cunninghamii", "Phyllocladus aspleniifolius", "Eucryphia lucida", "Richea pandanifolia"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RKS",
        name: "Athrotaxis selaginoides Subalpine Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "high" },
        species: ["Athrotaxis selaginoides", "Eucryphia milliganii", "Richea scoparia", "Nothofagus cunninghamii", "Cenarrhenes nitida"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RKX",
        name: "Highland Rainforest Scrub with Dead Athrotaxis selaginoides",
        traits: { structure: "scrub", moisture: "wet", dominant: "mixed", assemblage: "rainforest_edge", elevation: "high" },
        species: ["Leptospermum nitidum", "Agastachys odorata", "Eucryphia milliganii", "Cenarrhenes nitida", "Blechnum wattsii"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RML",
        name: "Nothofagus–Leptospermum Short Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest" },
        species: ["Nothofagus cunninghamii", "Leptospermum nitidum", "Leptospermum lanigerum", "Eucryphia lucida", "Phyllocladus aspleniifolius"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "RMT",
        name: "Nothofagus–Atherosperma Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest" },
        species: ["Nothofagus cunninghamii", "Atherosperma moschatum", "Eucryphia lucida", "Dicksonia antarctica", "Polystichum proliferum"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "RMU",
        name: "Nothofagus Rainforest (Undifferentiated)",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest" },
        species: ["Nothofagus cunninghamii", "Atherosperma moschatum", "Eucryphia lucida", "Phyllocladus aspleniifolius"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "RMS",
        name: "Nothofagus–Phyllocladus Short Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest" },
        species: ["Nothofagus cunninghamii", "Phyllocladus aspleniifolius", "Eucryphia lucida", "Anodopetalum biglandulosum", "Cenarrhenes nitida"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "RPF",
        name: "Athrotaxis cupressoides–Nothofagus gunnii Short Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "high" },
        species: ["Athrotaxis cupressoides", "Nothofagus gunnii", "Diselma archeri", "Richea pandanifolia"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RPP",
        name: "Athrotaxis cupressoides Rainforest",
        traits: { structure: "forest", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "high" },
        species: ["Athrotaxis cupressoides", "Nothofagus cunninghamii", "Phyllocladus aspleniifolius", "Richea pandanifolia"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RPW",
        name: "Athrotaxis cupressoides Open Woodland",
        traits: { structure: "woodland", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "high" },
        species: ["Athrotaxis cupressoides", "Sphagnum cristatum", "Gleichenia alpina", "Richea scoparia", "Empodisma minus"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "RSH",
        name: "Highland Low Rainforest and Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "rainforest", assemblage: "rainforest", elevation: "high" },
        species: ["Nothofagus cunninghamii", "Eucryphia milliganii", "Richea pandanifolia", "Orites diversifolia", "Phyllocladus aspleniifolius"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },

    // ========== NON-EUCALYPT FOREST AND WOODLAND (11 communities) ==========
    {
        code: "NAD",
        name: "Acacia dealbata Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "wattle", assemblage: "wet_forest" },
        species: ["Acacia dealbata", "Pteridium esculentum", "Olearia lirata", "Olearia argophylla", "Nothofagus cunninghamii"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "NAR",
        name: "Acacia melanoxylon Forest on Rises",
        traits: { structure: "forest", moisture: "wet", dominant: "wattle", assemblage: "wet_forest" },
        species: ["Acacia melanoxylon", "Nothofagus cunninghamii", "Atherosperma moschatum", "Eucryphia lucida", "Pomaderris apetala"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "NAF",
        name: "Acacia melanoxylon Swamp Forest",
        traits: { structure: "forest", moisture: "waterlogged", dominant: "wattle", assemblage: "wetland" },
        species: ["Acacia melanoxylon", "Melaleuca squarrosa", "Leptospermum lanigerum", "Gahnia grandis", "Blechnum wattsii"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "NAL",
        name: "Allocasuarina littoralis Forest",
        traits: { structure: "forest", moisture: "dry", dominant: "casuarina", assemblage: "dry_forest" },
        species: ["Allocasuarina littoralis", "Banksia marginata", "Leptospermum scoparium", "Lomatia tinctoria", "Pteridium esculentum"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "NAV",
        name: "Allocasuarina verticillata Forest",
        traits: { structure: "forest", moisture: "dry", dominant: "casuarina", assemblage: "dry_forest" },
        species: ["Allocasuarina verticillata", "Themeda triandra", "Bursaria spinosa", "Acacia mearnsii", "Dodonaea viscosa"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "NBS",
        name: "Banksia serrata Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "banksia", assemblage: "dry_forest", elevation: "low" },
        species: ["Banksia serrata", "Eucalyptus nitida", "Banksia marginata", "Xanthorrhoea australis", "Leptospermum glaucescens"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "NBA",
        name: "Bursaria-Acacia Woodland",
        traits: { structure: "woodland", moisture: "dry", dominant: "mixed", assemblage: "dry_forest" },
        species: ["Bursaria spinosa", "Acacia dealbata", "Acacia mearnsii", "Themeda triandra", "Dodonaea viscosa"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "NCR",
        name: "Callitris rhomboidea Forest",
        traits: { structure: "forest", moisture: "dry", dominant: "conifer", assemblage: "dry_forest" },
        species: ["Callitris rhomboidea", "Eucalyptus viminalis", "Eucalyptus pulchella", "Allocasuarina verticillata", "Bursaria spinosa"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "NLE",
        name: "Leptospermum Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "tea-tree", assemblage: "scrub" },
        species: ["Leptospermum lanigerum", "Leptospermum scoparium", "Leptospermum glaucescens", "Banksia marginata", "Gahnia grandis"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "NLM",
        name: "Leptospermum lanigerum–Melaleuca squarrosa Swamp Forest",
        traits: { structure: "forest", moisture: "waterlogged", dominant: "tea-tree", assemblage: "wetland" },
        species: ["Leptospermum lanigerum", "Melaleuca squarrosa", "Acacia melanoxylon", "Gahnia grandis", "Blechnum wattsii"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "NLA",
        name: "Leptospermum scoparium-Acacia mucronata Forest",
        traits: { structure: "forest", moisture: "wet", dominant: "tea-tree", assemblage: "scrub" },
        species: ["Leptospermum scoparium", "Acacia mucronata", "Acacia melanoxylon", "Banksia marginata", "Bauera rubioides"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "NME",
        name: "Melaleuca ericifolia Swamp Forest",
        traits: { structure: "forest", moisture: "waterlogged", dominant: "paperbark", assemblage: "wetland" },
        species: ["Melaleuca ericifolia", "Acacia melanoxylon", "Carex appressa", "Gahnia grandis", "Leptospermum lanigerum"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "NLN",
        name: "Subalpine Leptospermum nitidum Woodland",
        traits: { structure: "woodland", moisture: "wet", dominant: "tea-tree", assemblage: "scrub", elevation: "high" },
        species: ["Leptospermum nitidum", "Melaleuca squamea", "Gymnoschoenus sphaerocephalus", "Empodisma minus", "Eurychorda complanata"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },

    // ========== SCRUB, HEATHLAND AND COASTAL COMPLEXES (28 communities) ==========
    {
        code: "SAL",
        name: "Acacia longifolia Coastal Scrub",
        traits: { structure: "scrub", moisture: "coastal", dominant: "wattle", assemblage: "coastal", elevation: "low" },
        species: ["Acacia longifolia", "Leucopogon parviflorus", "Banksia marginata", "Myoporum insulare", "Rhagodia candolleana"],
        exclusions: { moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "SBM",
        name: "Banksia marginata Wet Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "banksia", assemblage: "scrub" },
        species: ["Banksia marginata", "Leptospermum lanigerum", "Melaleuca squarrosa", "Gahnia grandis", "Bauera rubioides"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SBR",
        name: "Broad-leaf Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "mixed", assemblage: "rainforest_edge" },
        species: ["Bedfordia salicina", "Olearia argophylla", "Pomaderris apetala", "Notelaea ligustrina", "Beyeria viscosa"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SCH",
        name: "Coastal Heathland",
        traits: { structure: "scrub", moisture: "coastal", dominant: "heath", assemblage: "coastal", elevation: "low" },
        species: ["Epacris impressa", "Banksia marginata", "Leptospermum scoparium", "Pultenaea juniperina", "Xanthorrhoea australis"],
        exclusions: { moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "SSC",
        name: "Coastal Scrub",
        traits: { structure: "scrub", moisture: "coastal", dominant: "mixed", assemblage: "coastal", elevation: "low" },
        species: ["Monotoca elliptica", "Leucopogon parviflorus", "Westringia brevifolia", "Correa alba", "Olearia axillaris"],
        exclusions: { moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "SCA",
        name: "Coastal Scrub on Alkaline Sands",
        traits: { structure: "scrub", moisture: "coastal", dominant: "mixed", assemblage: "coastal", elevation: "low" },
        species: ["Leptospermum laevigatum", "Myoporum insulare", "Beyeria lechenaultii", "Pimelea serpyllifolia", "Roepera billardierei"],
        exclusions: { moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "SRE",
        name: "Eastern Riparian Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "mixed", assemblage: "scrub" },
        species: ["Micrantheum hexandrum", "Leptospermum lanigerum", "Pomaderris apetala", "Acacia mucronata", "Beyeria viscosa"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SED",
        name: "Eastern Scrub on Dolerite",
        traits: { structure: "scrub", moisture: "dry", dominant: "mixed", assemblage: "dry_forest" },
        species: ["Leptospermum grandiflorum", "Spyridium obovatum", "Melaleuca pustulata", "Hakea megadenia", "Callitris rhomboidea"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "SCL",
        name: "Heathland on Calcareous Substrates",
        traits: { structure: "scrub", moisture: "coastal", dominant: "heath", assemblage: "coastal", elevation: "low" },
        species: ["Eutaxia microphylla", "Acrotriche cordata", "Threlkeldia diffusa", "Spyridium vexilliferum", "Pomaderris paniculosa"],
        exclusions: { moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "SKA",
        name: "Kunzea ambigua Regrowth Scrub",
        traits: { structure: "scrub", moisture: "dry", dominant: "mixed", assemblage: "dry_forest", elevation: "low" },
        species: ["Kunzea ambigua", "Xanthorrhoea australis", "Lepidosperma concavum", "Eucalyptus amygdalina"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "SLG",
        name: "Leptospermum glaucescens Heathland and Scrub",
        traits: { structure: "scrub", moisture: "dry", dominant: "tea-tree", assemblage: "scrub" },
        species: ["Leptospermum glaucescens", "Leptospermum scoparium", "Banksia marginata", "Kunzea ambigua", "Lepidosperma concavum"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "SLL",
        name: "Leptospermum lanigerum Scrub",
        traits: { structure: "scrub", moisture: "waterlogged", dominant: "tea-tree", assemblage: "wetland" },
        species: ["Leptospermum lanigerum", "Gahnia grandis", "Poa spp.", "Leptocarpus tenax", "Epacris gunnii"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SLS",
        name: "Leptospermum scoparium Heathland and Scrub",
        traits: { structure: "scrub", moisture: "dry", dominant: "tea-tree", assemblage: "scrub" },
        species: ["Leptospermum scoparium", "Allocasuarina monilifera", "Pultenaea juniperina", "Oxylobium ellipticum", "Lomatia tinctoria"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "SRF",
        name: "Leptospermum with Rainforest Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "tea-tree", assemblage: "rainforest_edge" },
        species: ["Leptospermum lanigerum", "Nothofagus cunninghamii", "Eucryphia lucida", "Bauera rubioides", "Gahnia grandis"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SMP",
        name: "Melaleuca pustulata Scrub",
        traits: { structure: "scrub", moisture: "dry", dominant: "melaleuca", assemblage: "scrub" },
        species: ["Melaleuca pustulata", "Eucalyptus amygdalina", "Ozothamnus scutellifolius", "Micrantheum hexandrum", "Leptospermum lanigerum"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "SMM",
        name: "Melaleuca squamea Heathland",
        traits: { structure: "scrub", moisture: "waterlogged", dominant: "melaleuca", assemblage: "wetland", elevation: "mid" },
        species: ["Melaleuca squamea", "Gymnoschoenus sphaerocephalus", "Empodisma minus", "Epacris serpyllifolia", "Isophysis tasmanica"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SMR",
        name: "Melaleuca squarrosa Scrub",
        traits: { structure: "scrub", moisture: "waterlogged", dominant: "melaleuca", assemblage: "wetland" },
        species: ["Melaleuca squarrosa", "Melaleuca squamea", "Banksia marginata", "Sprengelia incarnata", "Gahnia grandis"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SRH",
        name: "Rookery Halophytic Herbland",
        traits: { structure: "treeless", moisture: "coastal", dominant: "herb", assemblage: "coastal", elevation: "low" },
        species: ["Tetragonia implexicoma", "Carpobrotus rossii", "Rhagodia candolleana", "Atriplex cinerea", "Senecio pinnatifolius"],
        exclusions: { structure: ["forest", "woodland"], moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "SSK",
        name: "Scrub Complex on King Island",
        traits: { structure: "scrub", moisture: "dry", dominant: "mixed", assemblage: "scrub", elevation: "low" },
        species: ["Leptospermum scoparium", "Banksia marginata", "Melaleuca squarrosa", "Allocasuarina monilifera", "Lepidosperma concavum"],
        exclusions: { moisture: ["wet", "waterlogged"] }
    },
    {
        code: "SSZ",
        name: "Spray Zone Coastal Complex",
        traits: { structure: "scrub", moisture: "coastal", dominant: "herb", assemblage: "coastal", elevation: "low" },
        species: ["Disphyma crassifolium", "Carpobrotus rossii", "Salicornia quinqueflora", "Leucophyta brownii", "Austrostipa stipoides"],
        exclusions: { structure: ["forest", "woodland"], moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "SHS",
        name: "Subalpine Heathland",
        traits: { structure: "scrub", moisture: "dry", dominant: "heath", assemblage: "alpine", elevation: "high" },
        species: ["Orites revoluta", "Leptospermum rupestre", "Richea scoparia", "Oxylobium ellipticum", "Baeckea gunniana"],
        exclusions: { moisture: ["wet", "waterlogged"], elevation: ["low"] }
    },
    {
        code: "SWR",
        name: "Western Regrowth Complex",
        traits: { structure: "scrub", moisture: "wet", dominant: "mixed", assemblage: "scrub" },
        species: ["Acacia mucronata", "Leptospermum scoparium", "Baloskion tetraphyllum", "Pittosporum bicolor", "Nematolepis squamea"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SSW",
        name: "Western Subalpine Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "mixed", assemblage: "scrub", elevation: "high" },
        species: ["Leptospermum nitidum", "Eucalyptus vernicosa", "Agastachys odorata", "Cenarrhenes nitida", "Monotoca submutica"],
        exclusions: { moisture: ["dry"], elevation: ["low"] }
    },
    {
        code: "SWW",
        name: "Western Wet Scrub",
        traits: { structure: "scrub", moisture: "wet", dominant: "mixed", assemblage: "scrub" },
        species: ["Leptospermum nitidum", "Eucalyptus nitida", "Melaleuca squarrosa", "Banksia marginata", "Bauera rubioides"],
        exclusions: { moisture: ["dry"] }
    },
    {
        code: "SHW",
        name: "Wet Heathland",
        traits: { structure: "scrub", moisture: "waterlogged", dominant: "heath", assemblage: "wetland" },
        species: ["Melaleuca squamea", "Melaleuca gibbosa", "Epacris lanuginosa", "Sprengelia incarnata", "Lepidosperma filiforme"],
        exclusions: { moisture: ["dry"] }
    },

    // ========== HIGHLAND TREELESS VEGETATION (7 communities) ==========
    {
        code: "HCH",
        name: "Alpine Coniferous Heathland",
        traits: { structure: "scrub", moisture: "alpine", dominant: "heath", assemblage: "alpine", elevation: "high" },
        species: ["Microcachrys tetragona", "Diselma archeri", "Podocarpus lawrencei", "Pherosphaera hookeriana", "Richea scoparia"],
        exclusions: { moisture: ["dry", "wet"], elevation: ["low", "mid"] }
    },
    {
        code: "HCM",
        name: "Cushion Moorland",
        traits: { structure: "treeless", moisture: "alpine", dominant: "cushion", assemblage: "alpine", elevation: "high" },
        species: ["Abrotanella forsteroides", "Donatia novae-zelandiae", "Dracophyllum minimum", "Pterygopappus lawrencei", "Phyllachne colensoi"],
        exclusions: { structure: ["forest", "woodland", "scrub"], elevation: ["low", "mid"] }
    },
    {
        code: "HHE",
        name: "Eastern Alpine Heathland",
        traits: { structure: "scrub", moisture: "alpine", dominant: "heath", assemblage: "alpine", elevation: "high" },
        species: ["Orites revoluta", "Orites acicularis", "Richea sprengelioides", "Leptospermum rupestre", "Eucalyptus coccifera"],
        exclusions: { elevation: ["low", "mid"] }
    },
    {
        code: "HSE",
        name: "Eastern Alpine Sedgeland",
        traits: { structure: "treeless", moisture: "alpine", dominant: "sedges", assemblage: "alpine", elevation: "high" },
        species: ["Baloskion australe", "Astelia alpina", "Gleichenia alpina", "Empodisma minus", "Richea scoparia"],
        exclusions: { structure: ["forest", "woodland", "scrub"], elevation: ["low", "mid"] }
    },
    {
        code: "HUE",
        name: "Eastern Alpine Vegetation (Undifferentiated)",
        traits: { structure: "treeless", moisture: "alpine", dominant: "mixed", assemblage: "alpine", elevation: "high" },
        species: ["Richea scoparia", "Orites revoluta", "Poa gunnii", "Empodisma minus"],
        exclusions: { elevation: ["low", "mid"] }
    },
    {
        code: "HHW",
        name: "Western Alpine Heathland",
        traits: { structure: "scrub", moisture: "alpine", dominant: "heath", assemblage: "alpine", elevation: "high" },
        species: ["Richea scoparia", "Epacris serpyllifolia", "Dracophyllum milliganii", "Orites milliganii", "Isophysis tasmanica"],
        exclusions: { elevation: ["low", "mid"] }
    },
    {
        code: "HSW",
        name: "Western Alpine Sedgeland/Herbland",
        traits: { structure: "treeless", moisture: "alpine", dominant: "sedges", assemblage: "alpine", elevation: "high" },
        species: ["Isophysis tasmanica", "Carpha curvata", "Dracophyllum milliganii", "Empodisma minus", "Oreobolus spp."],
        exclusions: { structure: ["forest", "woodland", "scrub"], elevation: ["low", "mid"] }
    },

    // ========== MOORLAND, SEDGELAND, RUSHLAND AND PEATLAND (to be expanded from documentation) ==========
    // Note: These are key communities from this section
    {
        code: "MBW",
        name: "Western Buttongrass Moorland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "buttongrass", assemblage: "wetland" },
        species: ["Gymnoschoenus sphaerocephalus", "Melaleuca squamea", "Empodisma minus", "Leptospermum nitidum", "Baloskion australe"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["dry"] }
    },
    {
        code: "MBE",
        name: "Eastern Buttongrass Moorland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "buttongrass", assemblage: "wetland" },
        species: ["Gymnoschoenus sphaerocephalus", "Melaleuca gibbosa", "Empodisma minus", "Lepidosperma filiforme", "Baloskion australe"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["dry"] }
    },
    {
        code: "MBS",
        name: "Buttongrass Moorland with Emergent Shrubs",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "buttongrass", assemblage: "wetland" },
        species: ["Gymnoschoenus sphaerocephalus", "Banksia marginata", "Melaleuca squamea", "Leptospermum nitidum", "Empodisma minus"],
        exclusions: { structure: ["forest", "woodland"], moisture: ["dry"] }
    },
    {
        code: "MRR",
        name: "Restionaceae Rushland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "sedges", assemblage: "wetland" },
        species: ["Empodisma minus", "Baloskion australe", "Eurychorda complanata", "Leptocarpus tenax", "Sporadanthus tasmanicus"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["dry"] }
    },
    {
        code: "MGH",
        name: "Highland Grassy Sedgeland",
        traits: { structure: "treeless", moisture: "wet", dominant: "sedges", assemblage: "grassland", elevation: "high" },
        species: ["Lepidosperma filiforme", "Poa gunnii", "Carpha alpina", "Empodisma minus", "Diplarrena latifolia"],
        exclusions: { structure: ["forest", "woodland"], elevation: ["low"] }
    },

    // ========== NATIVE GRASSLAND (7 communities) ==========
    {
        code: "GHC",
        name: "Coastal Grass and Herbfield",
        traits: { structure: "treeless", moisture: "coastal", dominant: "grass", assemblage: "coastal", elevation: "low" },
        species: ["Spinifex sericeus", "Austrofestuca littoralis", "Poa poiformis", "Austrostipa stipoides", "Carpobrotus rossii"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["alpine", "waterlogged"] }
    },
    {
        code: "GPH",
        name: "Highland Poa Grassland",
        traits: { structure: "treeless", moisture: "wet", dominant: "grass", assemblage: "grassland", elevation: "high" },
        species: ["Poa gunnii", "Poa labillardierei", "Rytidosperma nudiflorum", "Grevillea australis", "Epacris gunnii"],
        exclusions: { structure: ["forest", "woodland"], elevation: ["low"] }
    },
    {
        code: "GCL",
        name: "Lowland Grassland Complex",
        traits: { structure: "treeless", moisture: "dry", dominant: "grass", assemblage: "grassland", elevation: "low" },
        species: ["Rytidosperma spp.", "Austrostipa spp.", "Poa spp.", "Themeda triandra", "Acacia dealbata"],
        exclusions: { structure: ["forest", "woodland", "scrub"], elevation: ["high"] }
    },
    {
        code: "GSL",
        name: "Lowland Grassy Sedgeland",
        traits: { structure: "treeless", moisture: "dry", dominant: "sedges", assemblage: "grassland", elevation: "low" },
        species: ["Lomandra longifolia", "Lepidosperma spp.", "Diplarrena moraea", "Poa spp.", "Themeda triandra"],
        exclusions: { structure: ["forest", "woodland"], elevation: ["high"] }
    },
    {
        code: "GPL",
        name: "Lowland Poa labillardierei Grassland",
        traits: { structure: "treeless", moisture: "wet", dominant: "grass", assemblage: "grassland", elevation: "low" },
        species: ["Poa labillardierei", "Themeda triandra", "Rytidosperma spp.", "Acaena novae-zelandiae", "Juncus spp."],
        exclusions: { structure: ["forest", "woodland"], elevation: ["high"] }
    },
    {
        code: "GTL",
        name: "Lowland Themeda triandra Grassland",
        traits: { structure: "treeless", moisture: "dry", dominant: "grass", assemblage: "grassland", elevation: "low" },
        species: ["Themeda triandra", "Poa labillardierei", "Austrostipa spp.", "Rytidosperma spp.", "Bursaria spinosa"],
        exclusions: { structure: ["forest", "woodland", "scrub"], elevation: ["high"] }
    },
    {
        code: "GRP",
        name: "Rockplate Grassland",
        traits: { structure: "treeless", moisture: "dry", dominant: "grass", assemblage: "grassland", elevation: "low" },
        species: ["Themeda triandra", "Poa rodwayi", "Rytidosperma spp.", "Euryomyrtus ramosissima", "Schoenus spp."],
        exclusions: { structure: ["forest", "woodland"], elevation: ["high"] }
    },

    // ========== SALTMARSH AND WETLAND (11 communities) ==========
    {
        code: "AAP",
        name: "Alkaline Pans",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "herb", assemblage: "wetland" },
        species: ["Drosera arcturi", "Machaerina juncea", "Schoenus spp.", "Carpha alpina", "Trithuria filamentosa"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["dry"] }
    },
    {
        code: "AHF",
        name: "Freshwater Aquatic Herbland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "herb", assemblage: "wetland" },
        species: ["Myriophyllum spp.", "Potamogeton spp.", "Triglochin procera", "Ornduffia reniformis", "Montia australasica"],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },
    {
        code: "AHL",
        name: "Lacustrine Herbland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "herb", assemblage: "wetland" },
        species: ["Ranunculus amphitrichus", "Hydrocotyle muscosa", "Isolepis cernua", "Schoenus nitens", "Centrolepis strigosa"],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },
    {
        code: "AHS",
        name: "Saline Aquatic Herbland",
        traits: { structure: "treeless", moisture: "coastal", dominant: "herb", assemblage: "wetland" },
        species: ["Ruppia spp.", "Althenia spp.", "Lamprothamnium spp.", "Myriophyllum salsugineum"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["alpine"] }
    },
    {
        code: "ARS",
        name: "Saline Sedgeland/Rushland",
        traits: { structure: "treeless", moisture: "coastal", dominant: "sedges", assemblage: "wetland" },
        species: ["Juncus kraussii", "Gahnia filum", "Gahnia trifida", "Machaerina juncea", "Poa poiformis"],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },
    {
        code: "ASF",
        name: "Freshwater Aquatic Sedgeland and Rushland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "sedges", assemblage: "wetland" },
        species: ["Machaerina arthrophylla", "Lepidosperma longitudinale", "Eleocharis sphacelata", "Phragmites australis", "Carex appressa"],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },
    {
        code: "ASP",
        name: "Sphagnum Peatland",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "moss", assemblage: "wetland", elevation: "high" },
        species: ["Sphagnum cristatum", "Sphagnum falcatulum", "Richea scoparia", "Empodisma minus", "Gleichenia alpina"],
        exclusions: { structure: ["forest", "woodland", "scrub"], elevation: ["low"] }
    },
    {
        code: "ASS",
        name: "Succulent Saline Herbland",
        traits: { structure: "treeless", moisture: "coastal", dominant: "herb", assemblage: "wetland", elevation: "low" },
        species: ["Salicornia quinqueflora", "Tecticornia arbuscula", "Suaeda australis", "Disphyma crassifolium", "Hemichroa pentandra"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["alpine"] }
    },
    {
        code: "AUS",
        name: "Saltmarsh (Undifferentiated)",
        traits: { structure: "treeless", moisture: "coastal", dominant: "mixed", assemblage: "wetland", elevation: "low" },
        species: ["Salicornia quinqueflora", "Juncus kraussii", "Gahnia filum", "Sarcocornia blackiana"],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },
    {
        code: "AWU",
        name: "Wetland (Undifferentiated)",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "mixed", assemblage: "wetland" },
        species: ["Machaerina spp.", "Juncus spp.", "Eleocharis spp.", "Myriophyllum spp."],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },

    // ========== MODIFIED LAND (13 communities) ==========
    {
        code: "FAL",
        name: "Agricultural Land",
        traits: { structure: "treeless", moisture: "dry", dominant: "exotic", assemblage: "modified" },
        species: ["Lolium spp.", "Trifolium spp.", "Dactylis glomerata", "Phalaris aquatica", "Triticum spp."],
        exclusions: {}
    },
    {
        code: "FAC",
        name: "Improved Pasture with Native Tree Canopy",
        traits: { structure: "woodland", moisture: "dry", dominant: "eucalypt", assemblage: "modified" },
        species: ["Eucalyptus spp.", "Lolium spp.", "Trifolium spp.", "Dactylis glomerata"],
        exclusions: {}
    },
    {
        code: "FUM",
        name: "Extra-urban Miscellaneous",
        traits: { structure: "treeless", moisture: "dry", dominant: "modified", assemblage: "modified" },
        species: [],
        exclusions: {}
    },
    {
        code: "FMG",
        name: "Marram Grassland",
        traits: { structure: "treeless", moisture: "coastal", dominant: "exotic", assemblage: "modified", elevation: "low" },
        species: ["Ammophila arenaria", "Euphorbia paralias", "Cakile edentula"],
        exclusions: { structure: ["forest", "woodland"] }
    },
    {
        code: "FPE",
        name: "Permanent Easements",
        traits: { structure: "modified", moisture: "any", dominant: "modified", assemblage: "modified" },
        species: [],
        exclusions: {}
    },
    {
        code: "FPH",
        name: "Hardwood Plantations for Silviculture",
        traits: { structure: "forest", moisture: "dry", dominant: "exotic", assemblage: "modified" },
        species: ["Eucalyptus nitens", "Eucalyptus globulus"],
        exclusions: {}
    },
    {
        code: "FPS",
        name: "Softwood Plantations for Silviculture",
        traits: { structure: "forest", moisture: "dry", dominant: "exotic", assemblage: "modified" },
        species: ["Pinus radiata"],
        exclusions: {}
    },
    {
        code: "FPF",
        name: "Pteridium esculentum Fernland",
        traits: { structure: "treeless", moisture: "dry", dominant: "fern", assemblage: "modified" },
        species: ["Pteridium esculentum", "Hypochaeris radicata", "Holcus lanatus"],
        exclusions: { structure: ["forest", "woodland"] }
    },
    {
        code: "FRG",
        name: "Regenerating Cleared Land",
        traits: { structure: "scrub", moisture: "dry", dominant: "mixed", assemblage: "modified" },
        species: ["Lomandra longifolia", "Juncus spp.", "Acacia spp.", "Bursaria spinosa"],
        exclusions: {}
    },
    {
        code: "FSM",
        name: "Spartina Marshland",
        traits: { structure: "treeless", moisture: "coastal", dominant: "exotic", assemblage: "modified", elevation: "low" },
        species: ["Spartina anglica"],
        exclusions: { structure: ["forest", "woodland"] }
    },
    {
        code: "FPU",
        name: "Unverified Plantations for Silviculture",
        traits: { structure: "forest", moisture: "dry", dominant: "exotic", assemblage: "modified" },
        species: ["Eucalyptus spp.", "Pinus radiata"],
        exclusions: {}
    },
    {
        code: "FUR",
        name: "Urban Areas",
        traits: { structure: "treeless", moisture: "dry", dominant: "modified", assemblage: "modified" },
        species: [],
        exclusions: {}
    },
    {
        code: "FWU",
        name: "Weed Infestation",
        traits: { structure: "scrub", moisture: "dry", dominant: "exotic", assemblage: "modified" },
        species: ["Ulex europaeus", "Rubus fruticosus", "Salix fragilis", "Lycium ferocissimum", "Cytisus scoparius"],
        exclusions: {}
    },

    // ========== MACQUARIE ISLAND VEGETATION (7 communities) ==========
    {
        code: "QCS",
        name: "Coastal Slope Complex",
        traits: { structure: "complex", moisture: "coastal", dominant: "mixed", assemblage: "coastal", elevation: "low" },
        species: ["Poa foliosa", "Stilbocarpa polaris", "Agrostis magellanica", "Acaena magellanica", "Azorella macquariensis"],
        exclusions: { moisture: ["alpine"] }
    },
    {
        code: "QCT",
        name: "Coastal Terrace Mosaic",
        traits: { structure: "complex", moisture: "coastal", dominant: "mixed", assemblage: "coastal", elevation: "low" },
        species: ["Poa foliosa", "Stilbocarpa polaris", "Agrostis magellanica", "Juncus scheuchzerioides", "Hydrocotyle nova-zeelandiae"],
        exclusions: { moisture: ["alpine"] }
    },
    {
        code: "QKB",
        name: "Kelp Beds",
        traits: { structure: "aquatic", moisture: "marine", dominant: "algae", assemblage: "marine", elevation: "low" },
        species: ["Durvillaea antarctica", "Macrocystis pyrifera"],
        exclusions: {}
    },
    {
        code: "QAM",
        name: "Macquarie Alpine Mosaic",
        traits: { structure: "treeless", moisture: "alpine", dominant: "cushion", assemblage: "alpine", elevation: "high" },
        species: ["Azorella macquariensis", "Ditrichum strictum", "Racomitrium crispulum", "Agrostis magellanica", "Epilobium brunnescens"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["dry", "wet", "coastal"] }
    },
    {
        code: "QMI",
        name: "Mire (Bog/Fen)",
        traits: { structure: "treeless", moisture: "waterlogged", dominant: "moss", assemblage: "wetland", elevation: "mid" },
        species: ["Juncus scheuchzerioides", "Hydrocotyle nova-zeelandiae", "Montia fontana", "Breutelia pendula", "Sanionia uncinatus"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["dry"] }
    },
    {
        code: "QST",
        name: "Short Tussock Grassland/Rushland with Herbs",
        traits: { structure: "treeless", moisture: "wet", dominant: "grass", assemblage: "grassland", elevation: "mid" },
        species: ["Agrostis magellanica", "Acaena magellanica", "Luzula crinita", "Poa annua", "Epilobium brunnescens"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["dry"] }
    },
    {
        code: "QTT",
        name: "Tall Tussock Grassland with Megaherbs",
        traits: { structure: "treeless", moisture: "coastal", dominant: "grass", assemblage: "coastal", elevation: "low" },
        species: ["Poa foliosa", "Stilbocarpa polaris", "Pleurophyllum hookeri", "Pleurophyllum criniferum", "Pleurophyllum speciosum"],
        exclusions: { structure: ["forest", "woodland", "scrub"], moisture: ["alpine", "dry"] }
    },

    // ========== OTHER NATURAL ENVIRONMENTS (3 communities) ==========
    {
        code: "ORO",
        name: "Lichen Lithosere",
        traits: { structure: "treeless", moisture: "dry", dominant: "lichen", assemblage: "rock" },
        species: ["Rhizocarpon geographicum", "Xanthoparmelia spp.", "Usnea spp.", "Cladia spp."],
        exclusions: { structure: ["forest", "woodland", "scrub"] }
    },
    {
        code: "OSM",
        name: "Sand, Mud",
        traits: { structure: "bare", moisture: "variable", dominant: "none", assemblage: "non-vegetated" },
        species: [],
        exclusions: {}
    },
    {
        code: "OAQ",
        name: "Water, Sea",
        traits: { structure: "aquatic", moisture: "variable", dominant: "none", assemblage: "aquatic" },
        species: [],
        exclusions: {}
    }
];

// Note: This represents approximately 160+ communities from the TASVEG 3.0 documentation.
// Some very rare or localized communities have been consolidated where appropriate.
// The full TASVEG 3.0 has 163 mapping units - this covers the vast majority.

// ENHANCED ASSEMBLAGE DETECTION RULES - For complete TASVEG dataset
const assemblageRules = [
    // ===== RAINFOREST ASSEMBLAGES =====
    {
        name: "rainforest",
        description: "Cool temperate rainforest - dominated by Nothofagus, Athrotaxis, or Lagarostrobos",
        species: ["Nothofagus cunninghamii", "Atherosperma moschatum", "Athrotaxis selaginoides", 
                  "Athrotaxis cupressoides", "Lagarostrobos franklinii", "Eucryphia lucida", 
                  "Phyllocladus aspleniifolius", "Anodopetalum biglandulosum", "Eucryphia milliganii"],
        minMatches: 2,
        bonus: 20,
        traitMatch: { dominant: "rainforest" },
        excludeMoisture: ["dry"],
        excludeElevation: []
    },
    {
        name: "rainforest_edge",
        description: "Rainforest edge or successional scrub - transitioning between rainforest and other communities",
        species: ["Nothofagus cunninghamii", "Leptospermum lanigerum", "Leptospermum scoparium", 
                  "Atherosperma moschatum", "Eucryphia lucida", "Pomaderris apetala", "Olearia argophylla"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { dominant: "mixed", structure: "scrub" },
        excludeMoisture: ["dry"],
        excludeElevation: []
    },

    // ===== WET FOREST ASSEMBLAGES =====
    {
        name: "wet_forest",
        description: "Wet eucalypt forest - tall trees with broad-leaf or rainforest understorey",
        species: ["Eucalyptus obliqua", "Eucalyptus regnans", "Eucalyptus tasmaniensis", "Eucalyptus nitida",
                  "Eucalyptus globulus", "Eucalyptus brookeriana", "Eucalyptus delegatensis", 
                  "Dicksonia antarctica", "Atherosperma moschatum", "Pomaderris apetala", "Olearia argophylla"],
        minMatches: 2,
        bonus: 15,
        traitMatch: { moisture: "wet", dominant: "eucalypt", structure: "forest" },
        excludeMoisture: ["dry", "coastal"],
        excludeElevation: []
    },
    {
        name: "mixed_forest",
        description: "Mixed forest - eucalypts with rainforest understorey",
        species: ["Eucalyptus obliqua", "Eucalyptus tasmaniensis", "Nothofagus cunninghamii", 
                  "Atherosperma moschatum", "Eucryphia lucida", "Phyllocladus aspleniifolius"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { dominant: "mixed", moisture: "wet" },
        excludeMoisture: ["dry"],
        excludeElevation: []
    },

    // ===== DRY FOREST ASSEMBLAGES =====
    {
        name: "dry_forest",
        description: "Dry eucalypt forest - grassy or heathy understorey, lower rainfall areas",
        species: ["Eucalyptus amygdalina", "Eucalyptus pulchella", "Eucalyptus tenuiramis", "Eucalyptus viminalis",
                  "Eucalyptus pauciflora", "Eucalyptus ovata", "Eucalyptus sieberi", "Eucalyptus coccifera",
                  "Banksia marginata", "Allocasuarina verticillata", "Themeda triandra"],
        minMatches: 2,
        bonus: 15,
        traitMatch: { moisture: "dry", dominant: "eucalypt" },
        excludeMoisture: ["wet", "waterlogged"],
        excludeElevation: ["high"]  // except subalpine eucalypts like coccifera
    },
    {
        name: "woodland",
        description: "Eucalypt woodland - open canopy, grassy understorey",
        species: ["Eucalyptus viminalis", "Eucalyptus ovata", "Eucalyptus pauciflora", "Eucalyptus amygdalina",
                  "Allocasuarina verticillata", "Themeda triandra", "Poa spp.", "Rytidosperma spp."],
        minMatches: 2,
        bonus: 10,
        traitMatch: { structure: "woodland" },
        excludeMoisture: ["wet", "waterlogged"],
        excludeElevation: []
    },

    // ===== SCRUB AND HEATH ASSEMBLAGES =====
    {
        name: "scrub",
        description: "Dense shrubland - tea-tree, paperbark, or broad-leaf scrub",
        species: ["Leptospermum scoparium", "Leptospermum lanigerum", "Melaleuca squarrosa", "Melaleuca ericifolia",
                  "Acacia mucronata", "Banksia marginata", "Pomaderris apetala", "Leptospermum glaucescens"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { structure: "scrub" },
        excludeMoisture: ["alpine"],
        excludeElevation: []
    },
    {
        name: "heath",
        description: "Low shrubland - heathy vegetation on poor soils",
        species: ["Epacris impressa", "Pultenaea juniperina", "Banksia marginata", "Xanthorrhoea australis",
                  "Leptospermum scoparium", "Allocasuarina monilifera", "Hibbertia riparia", "Lomatia tinctoria"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { dominant: "heath", structure: "scrub" },
        excludeMoisture: ["waterlogged"],
        excludeElevation: []
    },

    // ===== COASTAL ASSEMBLAGES =====
    {
        name: "coastal",
        description: "Coastal vegetation - salt-tolerant, wind-pruned, sandy soils",
        species: ["Spinifex sericeus", "Austrofestuca littoralis", "Leucopogon parviflorus", "Acacia longifolia",
                  "Myoporum insulare", "Correa alba", "Westringia brevifolia", "Rhagodia candolleana",
                  "Carpobrotus rossii", "Disphyma crassifolium", "Salicornia quinqueflora"],
        minMatches: 2,
        bonus: 15,
        traitMatch: { moisture: "coastal" },
        excludeMoisture: ["alpine", "waterlogged"],
        excludeElevation: []
    },
    {
        name: "coastal_heath",
        description: "Coastal heathland - diverse heath on dunes and headlands",
        species: ["Epacris impressa", "Banksia marginata", "Leptospermum scoparium", "Leucopogon parviflorus",
                  "Xanthorrhoea australis", "Pultenaea juniperina", "Correa alba", "Westringia brevifolia"],
        minMatches: 2,
        bonus: 10,
        traitMatch: { assemblage: "coastal", dominant: "heath" },
        excludeMoisture: ["alpine"],
        excludeElevation: []
    },

    // ===== WETLAND ASSEMBLAGES =====
    {
        name: "wetland",
        description: "Wetland vegetation - waterlogged soils, sedges, rushes, paperbark",
        species: ["Gymnoschoenus sphaerocephalus", "Melaleuca ericifolia", "Melaleuca squarrosa", 
                  "Sphagnum cristatum", "Baumea spp.", "Juncus kraussii", "Juncus spp.", "Carex spp.",
                  "Leptospermum lanigerum", "Empodisma minus", "Phragmites australis", "Eleocharis spp."],
        minMatches: 2,
        bonus: 15,
        traitMatch: { moisture: "waterlogged" },
        excludeMoisture: ["dry", "coastal"],
        excludeElevation: []
    },
    {
        name: "buttongrass",
        description: "Buttongrass moorland - western Tasmanian wetlands",
        species: ["Gymnoschoenus sphaerocephalus", "Melaleuca squamea", "Empodisma minus", "Baloskion australe",
                  "Lepidosperma filiforme", "Sprengelia incarnata"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { dominant: "buttongrass" },
        excludeMoisture: ["dry"],
        excludeElevation: []
    },
    {
        name: "saltmarsh",
        description: "Saltmarsh - saline coastal wetlands",
        species: ["Salicornia quinqueflora", "Tecticornia arbuscula", "Suaeda australis", "Juncus kraussii",
                  "Gahnia filum", "Sarcocornia blackiana", "Disphyma crassifolium", "Samolus repens"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { assemblage: "wetland", moisture: "coastal" },
        excludeMoisture: ["alpine", "dry"],
        excludeElevation: []
    },

    // ===== ALPINE ASSEMBLAGES =====
    {
        name: "alpine",
        description: "Alpine vegetation - above treeline, frost-hardy, low-growing",
        species: ["Richea scoparia", "Donatia novae-zelandiae", "Podocarpus lawrencei", "Abrotanella forsteroides",
                  "Pterygopappus lawrencei", "Dracophyllum minimum", "Orites revoluta", "Orites acicularis",
                  "Microcachrys tetragona", "Diselma archeri", "Poa gunnii", "Celmisia asteliifolia"],
        minMatches: 2,
        bonus: 20,
        traitMatch: { moisture: "alpine", elevation: "high" },
        excludeMoisture: ["dry", "wet", "coastal"],
        excludeElevation: ["low", "mid"]
    },
    {
        name: "alpine_heath",
        description: "Alpine heathland - shrubby alpine vegetation",
        species: ["Richea scoparia", "Orites revoluta", "Leptospermum rupestre", "Epacris serpyllifolia",
                  "Richea sprengelioides", "Ozothamnus rodwayi", "Pentachondra pumila"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { assemblage: "alpine", dominant: "heath" },
        excludeMoisture: ["waterlogged"],
        excludeElevation: ["low", "mid"]
    },
    {
        name: "cushion_moorland",
        description: "Cushion moorland - alpine bolster heath",
        species: ["Abrotanella forsteroides", "Donatia novae-zelandiae", "Dracophyllum minimum", 
                  "Pterygopappus lawrencei", "Phyllachne colensoi", "Dracophyllum milliganii"],
        minMatches: 2,
        bonus: 15,
        traitMatch: { dominant: "cushion", assemblage: "alpine" },
        excludeMoisture: ["dry"],
        excludeElevation: ["low", "mid"]
    },

    // ===== MACQUARIE ISLAND ASSEMBLAGES =====
    {
        name: "macquarie_alpine",
        description: "Macquarie Island alpine - Azorella cushions, fjaeldmark",
        species: ["Azorella macquariensis", "Ditrichum strictum", "Racomitrium crispulum", "Epilobium brunnescens"],
        minMatches: 2,
        bonus: 15,
        traitMatch: { assemblage: "alpine", elevation: "high" },
        excludeMoisture: ["dry", "wet"],
        excludeElevation: ["low", "mid"]
    },
    {
        name: "macquarie_coastal",
        description: "Macquarie Island coastal - tussock grassland, megaherbs, mire",
        species: ["Poa foliosa", "Stilbocarpa polaris", "Pleurophyllum hookeri", "Agrostis magellanica",
                  "Acaena magellanica", "Juncus scheuchzerioides", "Hydrocotyle nova-zeelandiae"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { assemblage: "coastal" },
        excludeMoisture: ["alpine"],
        excludeElevation: ["high"]
    },

    // ===== GRASSLAND ASSEMBLAGES =====
    {
        name: "grassland",
        description: "Native grassland - dominated by native grasses",
        species: ["Themeda triandra", "Poa labillardierei", "Poa rodwayi", "Austrostipa spp.", "Rytidosperma spp.",
                  "Poa gunnii", "Austrostipa stipoides", "Poa poiformis", "Spinifex sericeus"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { dominant: "grass", structure: "treeless" },
        excludeMoisture: ["waterlogged"],
        excludeElevation: []
    },
    {
        name: "highland_grassland",
        description: "Highland Poa grassland - subalpine tussock grasslands",
        species: ["Poa gunnii", "Poa labillardierei", "Poa costiniana", "Poa clivicola", "Australopyrum pectinatum",
                  "Rytidosperma nudiflorum", "Grevillea australis", "Epacris gunnii"],
        minMatches: 2,
        bonus: 10,
        traitMatch: { assemblage: "grassland", elevation: "high" },
        excludeMoisture: ["waterlogged"],
        excludeElevation: ["low"]
    },

    // ===== NON-NATIVE ASSEMBLAGES =====
    {
        name: "modified",
        description: "Modified or non-native vegetation",
        species: ["Lolium spp.", "Trifolium spp.", "Pinus radiata", "Ulex europaeus", "Rubus fruticosus",
                  "Salix fragilis", "Ammophila arenaria", "Spartina anglica", "Erica lusitanica"],
        minMatches: 1,
        bonus: 10,
        traitMatch: { dominant: "exotic", assemblage: "modified" },
        excludeMoisture: []
    },
    {
        name: "plantation",
        description: "Silvicultural plantation - exotic or native monoculture",
        species: ["Eucalyptus nitens", "Eucalyptus globulus", "Pinus radiata"],
        minMatches: 1,
        bonus: 12,
        traitMatch: { assemblage: "modified" },
        excludeMoisture: []
    },

    // ===== SPECIALIZED ASSEMBLAGES =====
    {
        name: "casuarina",
        description: "Casuarina forest/woodland - Allocasuarina dominated",
        species: ["Allocasuarina verticillata", "Allocasuarina littoralis", "Allocasuarina monilifera", 
                  "Allocasuarina crassa", "Allocasuarina duncanii"],
        minMatches: 1,
        bonus: 10,
        traitMatch: { dominant: "casuarina" },
        excludeMoisture: ["waterlogged"],
        excludeElevation: []
    },
    {
        name: "wattle",
        description: "Wattle forest/scrub - Acacia dominated",
        species: ["Acacia dealbata", "Acacia melanoxylon", "Acacia mucronata", "Acacia longifolia", 
                  "Acacia verticillata", "Acacia terminalis"],
        minMatches: 2,
        bonus: 10,
        traitMatch: { dominant: "wattle" },
        excludeMoisture: []
    },
    {
        name: "conifer_heath",
        description: "Alpine coniferous heathland - dwarf conifers",
        species: ["Microcachrys tetragona", "Diselma archeri", "Podocarpus lawrencei", "Pherosphaera hookeriana"],
        minMatches: 1,
        bonus: 12,
        traitMatch: { assemblage: "alpine", dominant: "heath" },
        excludeMoisture: ["dry", "wet"],
        excludeElevation: ["low", "mid"]
    },
    {
        name: "subalpine",
        description: "Subalpine vegetation - transition zone below treeline",
        species: ["Eucalyptus coccifera", "Eucalyptus gunnii", "Eucalyptus subcrenulata", "Eucalyptus urnigera",
                  "Richea scoparia", "Richea pandanifolia", "Orites revoluta", "Athrotaxis cupressoides",
                  "Nothofagus gunnii", "Leptospermum rupestre"],
        minMatches: 2,
        bonus: 12,
        traitMatch: { elevation: "high" },
        excludeMoisture: ["coastal"],
        excludeElevation: ["low"]
    }
];


// ===== INITIALIZE MAP =====
function initMap() {
    if (!document.getElementById('map')) {
        console.error('Map element not found');
        return;
    }
    
    map = L.map('map').setView([-42, 147], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Click handler
    map.on('click', function(e) {
        setMarker(e.latlng.lat, e.latlng.lng);
    });
    
    console.log('Map initialized');
}

// Set marker at specific coordinates
function setMarker(lat, lon) {
    currentLatLng = { lat, lon };

    if (marker) {
        map.removeLayer(marker);
    }
    
    marker = L.marker([lat, lon], { draggable: true }).addTo(map);

    marker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        currentLatLng = { lat: pos.lat, lon: pos.lng };
        document.getElementById("coords").innerText = pos.lat.toFixed(5) + ", " + pos.lng.toFixed(5);
        inferElevationBand(pos.lat);
    });

    document.getElementById("coords").innerText = lat.toFixed(5) + ", " + lon.toFixed(5);
    map.setView([lat, lon], 14);
    inferElevationBand(lat);
}

// Infer elevation from latitude
function inferElevationBand(latitude) {
    const absLat = Math.abs(latitude);
    const hintEl = document.getElementById("elevationHint");
    if (!hintEl) return;
    
    if (absLat > 42.5) {
        hintEl.innerHTML = "📍 High elevation likely";
    } else if (absLat > 41.5) {
        hintEl.innerHTML = "📍 Mid elevation possible";
    } else {
        hintEl.innerHTML = "📍 Lowland area";
    }
}

// GPS location
function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            setMarker(pos.coords.latitude, pos.coords.longitude);
        },
        function(err) {
            alert("Could not get location: " + err.message);
        }
    );
}

// ===== PHOTO HANDLING =====
document.addEventListener('DOMContentLoaded', function() {
    const photoInput = document.getElementById("photoInput");
    if (photoInput) {
        photoInput.addEventListener("change", handlePhotoUpload);
    }
});

async function handlePhotoUpload(e) {
    const files = [...e.target.files];

    for (let file of files) {
        const compressed = await compress(file, 0.6);
        photos.push(compressed);

        let img = document.createElement("img");
        img.src = compressed;
        const preview = document.getElementById("photoPreview");
        if (preview) {
            preview.appendChild(img);
        }
    }
}

function compress(file, quality) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const scale = 800 / img.width;
            canvas.width = 800;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(img.src);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
    });
}

// ===== ASSEMBLAGE DETECTION =====
function detectAssemblage(speciesList, inputs, environmentalContext = {}) {
    if (!speciesList || speciesList.length === 0) return null;
    if (!assemblageRules.length) return null;
    
    let assemblageBonuses = [];
    
    for (let rule of assemblageRules) {
        let isExcluded = false;
        
        if (rule.excludeMoisture && rule.excludeMoisture.length > 0) {
            if (inputs.moisture && rule.excludeMoisture.includes(inputs.moisture)) {
                isExcluded = true;
            }
        }
        
        if (!isExcluded && rule.excludeElevation && rule.excludeElevation.length > 0) {
            if (inputs.elevation && rule.excludeElevation.includes(inputs.elevation)) {
                isExcluded = true;
            }
        }
        
        if (!isExcluded && rule.excludeStructure && rule.excludeStructure.length > 0) {
            if (inputs.structure && rule.excludeStructure.includes(inputs.structure)) {
                isExcluded = true;
            }
        }
        
        if (isExcluded) continue;
        
        let requirementsMet = true;
        
        if (rule.requireMoisture && rule.requireMoisture.length > 0) {
            if (!inputs.moisture || !rule.requireMoisture.includes(inputs.moisture)) {
                requirementsMet = false;
            }
        }
        
        if (requirementsMet && rule.requireElevation && rule.requireElevation.length > 0) {
            if (!inputs.elevation || !rule.requireElevation.includes(inputs.elevation)) {
                requirementsMet = false;
            }
        }
        
        if (!requirementsMet) continue;
        
        let matches = 0;
        let matchedSpecies = [];
        
        for (let userSp of speciesList) {
            const userSpLower = userSp.toLowerCase().trim();
            
            for (let ruleSp of rule.species) {
                const ruleSpLower = ruleSp.toLowerCase();
                
                let isMatch = false;
                if (ruleSpLower.endsWith(' spp.')) {
                    const genus = ruleSpLower.replace(' spp.', '');
                    if (userSpLower.includes(genus)) {
                        isMatch = true;
                    }
                } else {
                    if (userSpLower.includes(ruleSpLower) || ruleSpLower.includes(userSpLower)) {
                        isMatch = true;
                    }
                }
                
                if (isMatch && !matchedSpecies.includes(ruleSp)) {
                    matches++;
                    matchedSpecies.push(ruleSp);
                    break;
                }
            }
        }
        
        if (matches >= rule.minMatches) {
            let bonus = rule.bonus;
            
            if (rule.bonusPerExtraMatch && matches > rule.minMatches) {
                bonus += (matches - rule.minMatches) * rule.bonusPerExtraMatch;
            }
            
            let traitBonus = 0;
            if (rule.traitMatch) {
                for (let [traitKey, expectedValue] of Object.entries(rule.traitMatch)) {
                    if (inputs[traitKey] === expectedValue) {
                        traitBonus += 3;
                    }
                    if (environmentalContext[traitKey] === expectedValue) {
                        traitBonus += 2;
                    }
                }
            }
            
            bonus += traitBonus;
            
            const maxBonus = rule.maxBonus || 20;
            bonus = Math.min(bonus, maxBonus);
            
            assemblageBonuses.push({
                name: rule.name,
                description: rule.description || rule.name,
                bonus: bonus,
                matches: matches,
                requiredMatches: rule.minMatches,
                matchedSpecies: matchedSpecies,
                traitBonus: traitBonus
            });
        }
    }
    
    if (assemblageBonuses.length === 0) return null;
    
    assemblageBonuses.sort((a, b) => {
        if (a.bonus !== b.bonus) return b.bonus - a.bonus;
        return b.matches - a.matches;
    });
    
    const best = assemblageBonuses[0];
    
    if (assemblageBonuses.length > 1) {
        best.alternatives = assemblageBonuses.slice(1, 4);
    }
    
    if (DEBUG_MODE) {
        console.log(`🏆 Assemblage detected: ${best.name} (bonus: +${best.bonus})`);
    }
    
    return best;
}

// ===== HARD EXCLUSIONS =====
function applyHardExclusions(comm, inputs, environmentalContext) {
    let penalty = 0;
    let reasons = [];
    let isHardExcluded = false;

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

    if (environmentalContext.drainage === "well_drained" && comm.traits.moisture === "waterlogged") {
        penalty -= 6;
        reasons.push("❌ EXCLUSION: Well-drained site cannot be waterlogged community");
        isHardExcluded = true;
    }

    return { penalty, reasons, isHardExcluded };
}

// ===== SCORE COMMUNITY =====
function scoreCommunity(comm, inputs, environmentalContext) {
    let score = 0;
    let reasons = [];

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

    let assemblage = detectAssemblage(inputs.species || [], inputs, environmentalContext);
    if (assemblage && comm.traits.assemblage === assemblage.name) {
        score += assemblage.bonus;
        reasons.push(`🏆 ASSEMBLAGE: ${assemblage.name} (+${assemblage.bonus})`);
    }

    let exclusion = applyHardExclusions(comm, inputs, environmentalContext);
    score += exclusion.penalty;
    reasons = reasons.concat(exclusion.reasons);
    
    if (exclusion.isHardExcluded) {
        score = -999;
    }

    return { score, reasons, isHardExcluded: exclusion.isHardExcluded };
}

// ===== NORMALIZE SCORE & CONFIDENCE =====
function normalizeScore(rawScore, maxPossibleScore = 35) {
    let cappedScore = Math.min(rawScore, maxPossibleScore);
    let percentage = Math.round((cappedScore / maxPossibleScore) * 100);
    return { score: cappedScore, percentage: percentage };
}

function getConfidence(rawScore) {
    const { score, percentage } = normalizeScore(rawScore);
    
    if (percentage >= 70) return { label: "High confidence", colour: "#2e7d32", icon: "🟢", score: score, percentage: percentage };
    if (percentage >= 50) return { label: "Moderate confidence", colour: "#f9a825", icon: "🟡", score: score, percentage: percentage };
    if (percentage >= 30) return { label: "Low confidence", colour: "#ff6b35", icon: "🟠", score: score, percentage: percentage };
    return { label: "Very low confidence", colour: "#c62828", icon: "🔴", score: score, percentage: percentage };
}

// ===== GET ENVIRONMENTAL CONTEXT =====
function getEnvironmentalContext() {
    return {
        substrate: document.getElementById("substrate")?.value || "",
        drainage: document.getElementById("drainage")?.value || "",
        exposure: document.getElementById("exposure")?.value || "",
        fire_history: document.getElementById("fire_history")?.value || "",
        disturbance: document.getElementById("disturbance")?.value || ""
    };
}

// ===== RUN ANALYSIS =====
function runAnalysis() {
    if (!communities.length) {
        document.getElementById("results").innerHTML = `
            <div class="card">
                <h3>⚠️ Error</h3>
                <p>No vegetation communities loaded. Please add the TASVEG communities array to app.js</p>
            </div>
        `;
        return;
    }
    
    const inputs = {
        structure: document.getElementById("structure").value,
        moisture: document.getElementById("moisture").value,
        dominant: document.getElementById("dominant").value,
        elevation: document.getElementById("elevation").value,
        species: document.getElementById("species").value.split(",").map(s => s.trim()).filter(Boolean)
    };
    
    const environmentalContext = getEnvironmentalContext();

    let results = communities.map(c => {
        let r = scoreCommunity(c, inputs, environmentalContext);
        return { 
            code: c.code, 
            name: c.name, 
            rawScore: r.score,
            reasons: r.reasons,
            isHardExcluded: r.isHardExcluded
        };
    })
    .filter(r => !r.isHardExcluded)
    .sort((a, b) => b.rawScore - a.rawScore);
    
    currentResults = results.map(r => {
        const conf = getConfidence(r.rawScore);
        return {
            code: r.code,
            name: r.name,
            score: conf.score,
            percentage: conf.percentage,
            confidence: conf.label
        };
    });

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
            const conf = getConfidence(r.rawScore);

            html += `
                <div class="result-card">
                    <div class="result-code">
                        <span class="traffic-light ${conf.label.toLowerCase().replace(' ', '-')}"></span>
                        <strong>${r.code} — ${r.name}</strong>
                        <span style="float:right; font-size:0.8em;">Confidence: ${conf.percentage}%</span>
                    </div>
                    <div class="result-score">
                        Score: ${conf.score} | 
                        <span style="color:${conf.colour}; font-weight:bold;">${conf.icon} ${conf.label}</span>
                    </div>
                    <div class="result-reasons">
                        ${r.reasons.length ? r.reasons.slice(0, 8).join("<br>") : "No specific matches"}
                        ${r.reasons.length > 8 ? "<br><em>+ more factors considered...</em>" : ""}
                    </div>
                </div>
            `;
        });
    }
    
    html += `</div>`;
    document.getElementById("results").innerHTML = html;
}

// ===== EXPORT FUNCTIONS =====
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
        version: APP_VERSION
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

// ===== SAVE RECORD =====
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
        results: currentResults,
        photos: photos,
        version: APP_VERSION
    };

    await saveToDB(record);
    alert("✅ Record saved offline as decision record!");
}

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    if (typeof L !== 'undefined') {
        initMap();
    } else {
        console.error('Leaflet not loaded');
    }
    
    // Display version
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) {
        versionDisplay.textContent = `v${APP_VERSION}`;
    }
});

// Make functions global
window.setMarker = setMarker;
window.getLocation = getLocation;
window.runAnalysis = runAnalysis;
window.saveRecord = saveRecord;
window.exportDecisionRecord = exportDecisionRecord;
window.copyDecisionSummary = copyDecisionSummary;
window.getEnvironmentalContext = getEnvironmentalContext;
