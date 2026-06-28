const STORAGE_KEY = "imperioDoradoState.v1";
const urlParams = new URLSearchParams(window.location.search);
const DATA_VERSION = "20260628-g22";
const BUILDING_MAX_LEVEL = 25;
const CONSTRUCTION_BASE_LEVEL_MS = 2 * 60 * 1000;
const CONSTRUCTION_LEVEL_MULTIPLIER = 1.4;
const ALCAZAR_UPGRADE_REQUIREMENTS = {
  2: [{ id: "muralla", level: 1 }],
  3: [{ id: "almacen", level: 2 }, { resource: "grain", level: 2 }],
  4: [{ id: "academia", level: 3 }, { id: "cuartel", level: 3 }],
  5: [{ id: "muralla", level: 4 }, { resource: "stone", level: 4 }],
  6: [{ id: "mercado", level: 5 }, { id: "hospital", level: 5 }],
  7: [{ id: "cuartel", level: 6 }, { resource: "wood", level: 6 }],
  8: [{ id: "academia", level: 7 }, { id: "muralla", level: 7 }],
  9: [{ id: "almacen", level: 8 }, { id: "forja", level: 8 }],
  10: [{ id: "muralla", level: 9 }, { id: "casa-alianza", level: 9 }],
  11: [{ id: "academia", level: 10 }, { id: "hospital", level: 10 }],
  12: [{ id: "cuartel", level: 11 }, { id: "salon-guerra", level: 11 }],
  13: [{ id: "almacen", level: 12 }, { resource: "iron", level: 12 }],
  14: [{ id: "muralla", level: 13 }, { id: "mercado", level: 13 }],
  15: [{ id: "academia", level: 14 }, { id: "forja", level: 14 }],
  16: [{ id: "cuartel", level: 15 }, { id: "hospital", level: 15 }],
  17: [{ id: "almacen", level: 16 }, { id: "embajada", level: 16 }],
  18: [{ id: "muralla", level: 17 }, { id: "salon-guerra", level: 17 }],
  19: [{ id: "academia", level: 18 }, { resource: "grain", level: 18 }],
  20: [{ id: "forja", level: 19 }, { id: "prision", level: 19 }],
  21: [{ id: "muralla", level: 20 }, { id: "almacen", level: 20 }],
  22: [{ id: "academia", level: 21 }, { id: "cuartel", level: 21 }],
  23: [{ id: "hospital", level: 22 }, { id: "embajada", level: 22 }],
  24: [{ id: "forja", level: 23 }, { id: "salon-guerra", level: 23 }],
  25: [{ id: "muralla", level: 24 }, { id: "academia", level: 24 }, { id: "almacen", level: 24 }]
};
const WORLD_COORD_MAX_X = 512;
const WORLD_COORD_MAX_Y = 1024;
const SERVER_EVENT_LIMIT = 80;
const resetDemo = urlParams.has("reset");
const initialScreen = urlParams.get("screen");

if (resetDemo) {
  localStorage.removeItem(STORAGE_KEY);
  window.history.replaceState(null, "", window.location.pathname);
}

const resources = [
  { id: "grain", name: "Trigo", color: "#d6bd60" },
  { id: "wood", name: "Madera", color: "#9b6a38" },
  { id: "stone", name: "Piedra", color: "#aeb0a6" },
  { id: "iron", name: "Hierro", color: "#9ba9b5" },
  { id: "silver", name: "Plata", color: "#d8d9dc" },
  { id: "gold", name: "Oro", color: "#f1bf45" }
];

const buildings = [
  {
    id: "alcazar",
    name: "Alcazar Real",
    icon: "i-crown",
    x: 52,
    y: 27,
    level: 8,
    role: "Gobierno",
    status: "Fortaleza Nv. 8",
    bonus: "+14% poder",
    body: "Centro del bastion. Desbloquea edificios, marchas y capacidad de almacen.",
    action: "Mejorar",
    cost: { stone: 1400, wood: 900, silver: 260 }
  },
  {
    id: "academia",
    name: "Academia de Navegacion",
    icon: "i-book",
    x: 67,
    y: 25,
    level: 6,
    role: "Investigacion",
    status: "Cola libre",
    bonus: "+9% ciencia",
    body: "Investiga cartografia, polvora, logistica, economia y tacticas de tercios.",
    action: "Investigar",
    cost: { grain: 650, iron: 420, silver: 320 }
  },
  {
    id: "cuartel",
    kind: "barracks",
    name: "Cuartel Norte",
    icon: "i-sword",
    x: 74,
    y: 40,
    level: 7,
    role: "Tropas",
    status: "480 soldados",
    bonus: "+11% infanteria",
    body: "Entrena piqueros, arcabuceros y caballeria ligera para marchas y defensa.",
    action: "Entrenar",
    cost: { grain: 900, iron: 500, silver: 180 }
  },
  {
    id: "cuartel-sur",
    kind: "barracks",
    name: "Cuartel Sur",
    icon: "i-sword",
    x: 84,
    y: 44,
    level: 4,
    role: "Tropas",
    status: "Cola militar",
    bonus: "+6% ataque",
    body: "Segundo cuartel del bastion. Aumenta la cola de entrenamiento y aporta ataque.",
    action: "Entrenar",
    cost: { grain: 760, iron: 420, silver: 140 }
  },
  {
    id: "astillero",
    name: "Astillero Real",
    icon: "i-ship",
    x: 21,
    y: 43,
    level: 5,
    role: "Armada",
    status: "2 galeones",
    bonus: "+8% marcha naval",
    body: "Construye galeones para expediciones, comercio maritimo y rutas de alianza.",
    action: "Botar nave",
    cost: { wood: 1300, iron: 360, silver: 220 }
  },
  {
    id: "forja",
    name: "Forja de Artilleria",
    icon: "i-hammer",
    x: 61,
    y: 50,
    level: 5,
    role: "Equipo",
    status: "Bronce fino",
    bonus: "+7% ataque",
    body: "Fabrica piezas de artilleria, acero de Toledo y equipo para el heroe.",
    action: "Forjar",
    cost: { iron: 720, wood: 320, silver: 280 }
  },
  {
    id: "mercado",
    name: "Mercado de Indias",
    icon: "i-scroll",
    x: 39,
    y: 50,
    level: 6,
    role: "Economia",
    status: "Caravana lista",
    bonus: "+12% comercio",
    body: "Intercambia recursos con aliados y prepara convoyes para el mapa del mundo.",
    action: "Comerciar",
    cost: { grain: 350, wood: 350, silver: 120 }
  },
  {
    id: "embajada",
    name: "Embajada Imperial",
    icon: "i-user",
    x: 31,
    y: 35,
    level: 1,
    role: "Refuerzos",
    status: "Sin emisarios",
    bonus: "+5% refuerzos",
    body: "Permite recibir refuerzos de la alianza y aumentar la capacidad de tropas aliadas en la fortaleza.",
    action: "Gestionar",
    cost: { stone: 780, wood: 520, silver: 210 }
  },
  {
    id: "prision",
    name: "Prision Real",
    icon: "i-shield",
    x: 69,
    y: 39,
    level: 1,
    role: "Control",
    status: "Celdas vacias",
    bonus: "+4% defensa",
    body: "Mas adelante permitira capturar heroes enemigos tras grandes batallas y rallies.",
    action: "Custodiar",
    cost: { stone: 950, iron: 360, silver: 260 }
  },
  {
    id: "salon-guerra",
    name: "Salon de Guerra",
    icon: "i-sword",
    x: 50,
    y: 43,
    level: 1,
    role: "Rally",
    status: "Sin convocatoria",
    bonus: "+5% ataque conjunto",
    body: "Organiza rallies de alianza, aumenta el tamano de las convocatorias y mejora ataques coordinados.",
    action: "Convocar",
    cost: { wood: 850, iron: 420, silver: 320 }
  },
  {
    id: "almacen",
    kind: "storage",
    name: "Almacen Real",
    icon: "i-bag",
    x: 47,
    y: 56,
    level: 5,
    role: "Capacidad",
    status: "Depositos",
    bonus: "+35.000 capacidad",
    body: "Guarda los recursos producidos por la ciudad. Si llega al limite, las granjas y minas dejan de acumular.",
    action: "Ampliar",
    cost: { stone: 900, wood: 700, silver: 180 }
  },
  {
    id: "hospital",
    kind: "hospital",
    name: "Hospital Real",
    icon: "i-plus",
    x: 76,
    y: 57,
    level: 4,
    role: "Defensa",
    status: "120 camas",
    bonus: "+10% curacion",
    body: "Protege tropas heridas tras ataques, rallies y cacerias de monstruos.",
    action: "Curar",
    cost: { grain: 600, silver: 160 }
  },
  {
    id: "hospital-puerto",
    kind: "hospital",
    name: "Hospital Puerto",
    icon: "i-plus",
    x: 63,
    y: 60,
    level: 3,
    role: "Defensa",
    status: "90 camas",
    bonus: "+5% defensa",
    body: "Hospital auxiliar junto al puerto. Amplia camas, curacion y defensa de guarnicion.",
    action: "Curar",
    cost: { grain: 520, silver: 130 }
  },
  {
    id: "muralla",
    name: "Muralla Abaluartada",
    icon: "i-shield",
    x: 50,
    y: 64,
    level: 8,
    role: "Proteccion",
    status: "Baluartes armados",
    bonus: "+16% defensa",
    body: "Sostiene trampas, torres y refuerzos cuando el bastion recibe una marcha enemiga.",
    action: "Reforzar",
    cost: { stone: 1250, iron: 470, wood: 220 }
  },
  {
    id: "sabios",
    name: "Casa de Sabios",
    icon: "i-scroll",
    x: 34,
    y: 59,
    level: 3,
    role: "Recompensas",
    status: "2 cofres/semana",
    bonus: "Matematicas",
    body: "Resuelve retos para reclamar hasta dos paquetes gratuitos por semana.",
    action: "Resolver",
    cost: {}
  },
  {
    id: "casa-alianza",
    name: "Casa de Alianza",
    icon: "i-user",
    x: 28,
    y: 53,
    level: 4,
    role: "Alianza",
    status: "Orden activa",
    bonus: "+4 ayudas",
    body: "Centro social de la Orden. Desde aqui se accede a chat, ayudas, rallies y actividad de alianza.",
    action: "Gestionar",
    cost: { stone: 620, wood: 540, silver: 180 }
  },
  {
    id: "granja-trigo-1",
    kind: "resource",
    resource: "grain",
    name: "Granja I",
    icon: "i-crown",
    x: 65,
    y: 70,
    level: 5,
    role: "Comida",
    status: "+300/h",
    bonus: "+300 trigo/h",
    body: "Campo de trigo. Produce comida para tropas, curacion y construccion.",
    action: "Producir",
    cost: { wood: 320, stone: 180, silver: 70 }
  },
  {
    id: "granja-trigo-2",
    kind: "resource",
    resource: "grain",
    name: "Granja II",
    icon: "i-crown",
    x: 73,
    y: 68,
    level: 4,
    role: "Comida",
    status: "+240/h",
    bonus: "+240 trigo/h",
    body: "Segunda granja. Tener varias granjas aumenta la produccion total de comida.",
    action: "Producir",
    cost: { wood: 280, stone: 150, silver: 60 }
  },
  {
    id: "aserradero-1",
    kind: "resource",
    resource: "wood",
    name: "Aserradero",
    icon: "i-hammer",
    x: 28,
    y: 66,
    level: 4,
    role: "Madera",
    status: "+220/h",
    bonus: "+220 madera/h",
    body: "Aserradero de pino. Alimenta construcciones, astillero y comercio.",
    action: "Producir",
    cost: { grain: 240, stone: 190, silver: 60 }
  },
  {
    id: "cantera-1",
    kind: "resource",
    resource: "stone",
    name: "Cantera",
    icon: "i-shield",
    x: 22,
    y: 57,
    level: 4,
    role: "Piedra",
    status: "+210/h",
    bonus: "+210 piedra/h",
    body: "Cantera de sillares. Es clave para murallas, alcazar y hospitales.",
    action: "Producir",
    cost: { grain: 260, wood: 210, silver: 60 }
  },
  {
    id: "mina-hierro-1",
    kind: "resource",
    resource: "iron",
    name: "Mina Hierro",
    icon: "i-sword",
    x: 88,
    y: 62,
    level: 3,
    role: "Hierro",
    status: "+150/h",
    bonus: "+150 hierro/h",
    body: "Mina de hierro. Necesaria para tercios, forja, artilleria y defensa.",
    action: "Producir",
    cost: { grain: 340, wood: 240, silver: 90 }
  }
];

const fortressPlots = [
  { id: "base-alcazar", zone: "base", label: "Alcazar", x: 50, y: 13, buildingId: "alcazar" },
  { id: "base-academia", zone: "base", label: "Academia", x: 62, y: 31, buildingId: "academia" },
  { id: "base-forja", zone: "base", label: "Solar de forja", x: 72, y: 32 },
  { id: "base-mercado", zone: "base", label: "Solar de mercado", x: 31, y: 32 },
  { id: "base-embajada", zone: "base", label: "Solar de embajada", x: 43, y: 32 },
  { id: "base-prision", zone: "base", label: "Solar de prision", x: 82, y: 33 },
  { id: "base-alianza", zone: "base", label: "Solar de alianza", x: 25, y: 40 },
  { id: "base-salon-guerra", zone: "base", label: "Solar de guerra", x: 51, y: 37 },
  { id: "base-sabios", zone: "base", label: "Solar de sabios", x: 37, y: 40 },
  { id: "base-almacen", zone: "base", label: "Solar de almacen", x: 76, y: 40 },
  { id: "base-astillero", zone: "base", label: "Solar naval", x: 62, y: 40 },
  { id: "base-muralla", zone: "base", label: "Muralla", x: 50, y: 57, buildingId: "muralla" },

  { id: "military-1", zone: "military", label: "Solar militar", x: 14, y: 46, allowed: "Cuartel u hospital" },
  { id: "military-2", zone: "military", label: "Solar militar", x: 30, y: 46, allowed: "Cuartel u hospital" },
  { id: "military-3", zone: "military", label: "Solar militar", x: 70, y: 46, allowed: "Cuartel u hospital" },
  { id: "military-4", zone: "military", label: "Solar militar", x: 86, y: 46, allowed: "Cuartel u hospital" },
  { id: "military-5", zone: "military", label: "Solar militar", x: 20, y: 55, allowed: "Cuartel u hospital" },
  { id: "military-6", zone: "military", label: "Solar militar", x: 36, y: 55, allowed: "Cuartel u hospital" },
  { id: "military-7", zone: "military", label: "Solar militar", x: 64, y: 55, allowed: "Cuartel u hospital" },
  { id: "military-8", zone: "military", label: "Solar militar", x: 80, y: 55, allowed: "Cuartel u hospital" },
  { id: "military-9", zone: "military", label: "Solar militar", x: 24, y: 64, allowed: "Cuartel u hospital" },
  { id: "military-10", zone: "military", label: "Solar militar", x: 40, y: 64, allowed: "Cuartel u hospital" },
  { id: "military-11", zone: "military", label: "Solar militar", x: 60, y: 64, allowed: "Cuartel u hospital" },
  { id: "military-12", zone: "military", label: "Solar militar", x: 76, y: 64, allowed: "Cuartel u hospital" },

  { id: "resource-1", zone: "resource", label: "Parcela de recursos", x: 15, y: 73 },
  { id: "resource-2", zone: "resource", label: "Parcela de recursos", x: 30, y: 74 },
  { id: "resource-3", zone: "resource", label: "Parcela de recursos", x: 70, y: 74 },
  { id: "resource-4", zone: "resource", label: "Parcela de recursos", x: 85, y: 73 },
  { id: "resource-5", zone: "resource", label: "Parcela de recursos", x: 18, y: 81 },
  { id: "resource-6", zone: "resource", label: "Parcela de recursos", x: 35, y: 83 },
  { id: "resource-7", zone: "resource", label: "Parcela de recursos", x: 65, y: 83 },
  { id: "resource-8", zone: "resource", label: "Parcela de recursos", x: 82, y: 81 },
  { id: "resource-9", zone: "resource", label: "Parcela de recursos", x: 42, y: 88 },
  { id: "resource-10", zone: "resource", label: "Parcela de recursos", x: 58, y: 88 }
];

const initialFortressAssignments = Object.fromEntries(
  fortressPlots.filter((plot) => plot.buildingId).map((plot) => [plot.id, plot.buildingId])
);

const fortressZones = [
  { id: "zone-core", label: "Edificios base", x: 45, y: 45, w: 57, h: 44, tone: "base" },
  { id: "zone-military", label: "Barracones y hospitales", x: 77, y: 49, w: 32, h: 32, tone: "military" },
  { id: "zone-resource", label: "Campos de recursos", x: 55, y: 70, w: 76, h: 28, tone: "resource" }
];

const mapMarkers = [
  {
    id: "home",
    name: "Bastion Dorado",
    icon: "i-crown",
    kind: "ally",
    x: 48,
    y: 49,
    level: 8,
    alliance: "OD",
    range: "Tu ciudad",
    reward: "Protegida",
    body: "Capital costera del jugador. Desde aqui salen marchas terrestres y navales."
  },
  {
    id: "wonder",
    name: "Torre del Virrey",
    icon: "i-crown",
    kind: "ally",
    x: 51,
    y: 31,
    level: 10,
    alliance: "Reino",
    range: "Centro",
    reward: "Titulos",
    body: "Wonder del reino. Mas adelante se conquistara con rallies de alianza."
  },
  {
    id: "ally-1",
    name: "Puerto de la Orden",
    icon: "i-ship",
    kind: "ally",
    x: 39,
    y: 53,
    level: 9,
    alliance: "OD",
    range: "Aliado",
    reward: "Refuerzo",
    body: "Ciudad aliada cercana. Servira para ayuda, refuerzos y rutas de alianza."
  },
  {
    id: "ally-2",
    name: "Villa del Maestre",
    icon: "i-shield",
    kind: "ally",
    x: 56,
    y: 57,
    level: 7,
    alliance: "OD",
    range: "Aliado",
    reward: "Refuerzo",
    body: "Miembro de la Orden del Dorado. En guerra formara parte del bloque defensivo."
  },
  {
    id: "enemy-1",
    name: "Fuerte Rival",
    icon: "i-shield",
    kind: "enemy",
    x: 28,
    y: 66,
    level: 7,
    alliance: "SN",
    range: "00:24",
    reward: "Botin",
    body: "Ciudad de otro jugador. Antes de atacar conviene espiar y coordinar alianza."
  },
  {
    id: "enemy-2",
    name: "Bastida del Norte",
    icon: "i-shield",
    kind: "enemy",
    x: 73,
    y: 39,
    level: 12,
    alliance: "LE",
    range: "00:31",
    reward: "Botin alto",
    body: "Castillo fuerte de otra alianza. Buen objetivo para rally si tu ataque directo no llega."
  },
  {
    id: "enemy-3",
    name: "Faro Corsario",
    icon: "i-ship",
    kind: "enemy",
    x: 81,
    y: 69,
    level: 6,
    alliance: "MR",
    range: "00:22",
    reward: "Plata",
    body: "Posicion costera rival. Los galeones y la artilleria tendran ventaja en futuras reglas navales."
  },
  {
    id: "monster-boar",
    name: "Licantropo de Sierra",
    icon: "i-target",
    sprite: "boar",
    image: "./assets/monster-licantropo.png",
    kind: "monster",
    x: 20,
    y: 37,
    level: 1,
    range: "00:12",
    material: "frag-morrion",
    reward: "Piezas comunes",
    body: "Bestia de monte. Monstruo de entrada para conseguir piezas de casco y experiencia."
  },
  {
    id: "monster-griffin",
    name: "Ogro de la Cantera",
    icon: "i-target",
    sprite: "griffin",
    image: "./assets/monster-ogro-martillo.png",
    kind: "monster",
    x: 67,
    y: 52,
    level: 3,
    range: "00:18",
    material: "frag-sword",
    reward: "Materiales",
    body: "Bruto de roca. Requiere energia del heroe y da piezas de arma."
  },
  {
    id: "monster-basilisk",
    name: "Ogro del Garrote",
    icon: "i-target",
    sprite: "basilisk",
    image: "./assets/monster-ogro-garrote.png",
    kind: "monster",
    x: 84,
    y: 25,
    level: 5,
    range: "00:27",
    material: "frag-coraza",
    reward: "Piezas azules",
    body: "Monstruo acorazado. Su defensa es alta y recompensa piezas de armadura."
  },
  {
    id: "monster-dragon",
    name: "Dragon Rojo",
    icon: "i-target",
    sprite: "dragon",
    image: "./assets/monster-dragon-rojo.png",
    kind: "monster",
    x: 90,
    y: 51,
    level: 11,
    range: "00:52",
    material: "frag-cannon",
    reward: "Botin imperial",
    body: "Objetivo de elite. Sus premios deben sentirse como una caceria de alianza."
  },
  {
    id: "grain-1",
    name: "Campos de Trigo",
    icon: "i-crown",
    kind: "resource",
    resource: "grain",
    x: 33,
    y: 43,
    level: 2,
    range: "00:08",
    reward: "Trigo",
    body: "Casilla de recoleccion. Se ocupa con tropas hasta llenar su carga o agotar el tile."
  },
  {
    id: "wood-1",
    name: "Bosque Real",
    icon: "i-hammer",
    kind: "resource",
    resource: "wood",
    x: 44,
    y: 24,
    level: 3,
    range: "00:10",
    reward: "Madera",
    body: "Bosque de mapa. Cuanto mayor sea el nivel, mas capacidad de recurso tiene."
  },
  {
    id: "stone-1",
    name: "Cantera Imperial",
    icon: "i-shield",
    kind: "resource",
    resource: "stone",
    x: 58,
    y: 73,
    level: 4,
    range: "00:11",
    reward: "Piedra",
    body: "Cantera del reino. Los recursos vuelven con la marcha cuando esta regresa al castillo."
  },
  {
    id: "mine-1",
    name: "Mina de Sierra",
    icon: "i-hammer",
    kind: "resource",
    resource: "iron",
    x: 24,
    y: 73,
    level: 4,
    range: "00:11",
    reward: "Hierro",
    body: "Tile de recoleccion. Envia tropas para extraer hierro sin combate."
  },
  {
    id: "silver-1",
    name: "Veta de Plata",
    icon: "i-scroll",
    kind: "resource",
    resource: "silver",
    x: 76,
    y: 60,
    level: 5,
    range: "00:16",
    reward: "Plata",
    body: "Casilla rara. La plata se recolecta mas lenta, pero acelera forja, academia y tropas."
  },
  ...generateKingdomMarkers()
];

const HOME_MARKER_ID = "home";

const worldRegions = [
  { id: "capital", label: "Centro del Reino", x: 51, y: 31, w: 17, h: 10, tone: "royal" },
  { id: "od", label: "Orden del Dorado", x: 48, y: 52, w: 24, h: 16, tone: "ally" },
  { id: "sn", label: "Sombra Norte", x: 25, y: 68, w: 19, h: 14, tone: "enemy" },
  { id: "le", label: "Liga Esmeralda", x: 75, y: 34, w: 21, h: 15, tone: "enemy" },
  { id: "mr", label: "Mar de Rojo", x: 82, y: 72, w: 18, h: 13, tone: "enemy" },
  { id: "frontier", label: "Frontera Rica", x: 56, y: 82, w: 34, h: 12, tone: "resource" }
];

function generateKingdomMarkers() {
  return [
    ...generateAllianceCluster({
      tag: "OD",
      kind: "ally",
      origin: { x: 47, y: 51 },
      names: ["Real de Alcantara", "Fortin San Telmo", "Casa de Contratacion", "Puerto Nuevo", "Baluarte de Cadiz", "Villa de la Flota"],
      icon: "i-crown",
      start: 3
    }),
    ...generateAllianceCluster({
      tag: "SN",
      kind: "enemy",
      origin: { x: 23, y: 66 },
      names: ["Castillo Umbrio", "Bastida Negra", "Torre de Hierro", "Fuerte de Niebla", "Marca del Lobo", "Atalaya Fria", "Villa Sombria"],
      icon: "i-shield",
      start: 4
    }),
    ...generateAllianceCluster({
      tag: "LE",
      kind: "enemy",
      origin: { x: 75, y: 36 },
      names: ["Fuerte Esmeralda", "Puesto Verde", "Ciudad de Laurel", "Baluarte del Este", "Arsenal del Paso", "Torre de Jade", "Guardia Alta"],
      icon: "i-shield",
      start: 11
    }),
    ...generateAllianceCluster({
      tag: "MR",
      kind: "enemy",
      origin: { x: 83, y: 70 },
      names: ["Puerto Bermejo", "Fortaleza Salina", "Dique Corsario", "Bastion de Sangre", "Cala Armada", "Torre del Mar"],
      icon: "i-ship",
      start: 18
    }),
    ...generateResourceTiles()
  ];
}

function generateAllianceCluster({ tag, kind, origin, names, icon, start }) {
  const offsets = [
    [-7, -6], [-2, -7], [5, -6], [-8, -1], [8, -1], [-4, 5], [4, 6], [0, 0]
  ];
  return names.map((name, index) => {
    const [dx, dy] = offsets[index % offsets.length];
    const x = clampPercent(origin.x + dx + ((index % 3) - 1) * 0.9);
    const y = clampPercent(origin.y + dy + (index % 2 ? 1.1 : -0.6));
    return {
      id: `${kind}-${tag.toLowerCase()}-${start + index}`,
      name,
      icon,
      kind,
      x,
      y,
      level: 5 + ((start + index) % 11),
      alliance: tag,
      range: kingdomRangeLabel(x, y),
      reward: kind === "ally" ? "Refuerzo" : "Botin",
      body: kind === "ally"
        ? `Ciudad aliada de ${tag}. En el reino grande sirve como punto de reunion y refuerzo.`
        : `Castillo de la alianza ${tag}. Espia, marca o prepara rally antes de atacar.`
    };
  });
}

function generateResourceTiles() {
  const resourceTypes = [
    { resource: "grain", icon: "i-crown", names: ["Campos", "Graneros", "Huertas"] },
    { resource: "wood", icon: "i-hammer", names: ["Bosque", "Robledal", "Pinar"] },
    { resource: "stone", icon: "i-shield", names: ["Cantera", "Pedrera", "Sillar"] },
    { resource: "iron", icon: "i-hammer", names: ["Mina", "Ferreria", "Filon"] },
    { resource: "silver", icon: "i-scroll", names: ["Veta", "Real de Plata", "Galeria"] }
  ];
  const points = [
    [13, 16], [19, 26], [30, 18], [41, 15], [58, 17], [70, 18], [86, 16],
    [10, 44], [18, 50], [29, 40], [38, 63], [47, 72], [61, 68], [72, 58], [88, 47],
    [12, 86], [23, 82], [35, 88], [49, 84], [60, 91], [75, 86], [90, 82],
    [6, 60], [94, 61], [53, 9], [52, 95]
  ];
  return points.map(([x, y], index) => {
    const type = resourceTypes[index % resourceTypes.length];
    const level = 1 + ((index + Math.floor(x + y)) % 6);
    const name = `${type.names[index % type.names.length]} ${resourceName(type.resource)}`;
    return {
      id: `tile-${type.resource}-${index + 1}`,
      name,
      icon: type.icon,
      kind: "resource",
      resource: type.resource,
      x,
      y,
      level,
      range: kingdomRangeLabel(x, y),
      reward: resourceName(type.resource),
      body: `Casilla de ${resourceName(type.resource).toLowerCase()} Nv. ${level}. Se agota al recolectar y luego reaparece en otra zona del reino.`
    };
  });
}

function generateMonsterTiles() {
  return [];
}

function romanSuffix(index) {
  return ["I", "II", "III", "IV", "V", "VI"][index % 6];
}

function kingdomRangeLabel(x, y) {
  const home = { x: 48, y: 49 };
  const distance = Math.hypot(x - home.x, y - home.y);
  return `D ${Math.round(distance * 10)}`;
}

const doctrineTypes = [
  {
    id: "resource",
    name: "Recoleccion",
    icon: "i-hammer",
    body: "Tropas sugeridas para minas, bosques, canteras y granjas del mundo."
  },
  {
    id: "monster",
    name: "Caza",
    icon: "i-target",
    body: "Composicion para monstruos. El heroe es obligatorio para cazar."
  },
  {
    id: "enemy",
    name: "Ataque",
    icon: "i-shield",
    body: "Composicion sugerida contra fuertes rivales y futuras marchas ofensivas."
  }
];

const researchBranches = [
  {
    id: "empire",
    name: "Imperio",
    icon: "i-crown",
    body: "Economia, produccion, almacen, construccion y recoleccion.",
    nodes: [
      {
        id: "resource-production",
        name: "Administracion Rural",
        max: 10,
        tier: 1,
        cost: { wood: 420, stone: 260, silver: 140 },
        timeMs: 15000,
        effect: "+5% produccion automatica por nivel"
      },
      {
        id: "grain-yield",
        name: "Campos de Castilla",
        max: 10,
        tier: 1,
        requires: [{ id: "resource-production", level: 2 }],
        cost: { grain: 320, wood: 260, silver: 120 },
        timeMs: 14500,
        effect: "+3% produccion de trigo por nivel"
      },
      {
        id: "wood-yield",
        name: "Ordenanzas de Madera",
        max: 10,
        tier: 1,
        requires: [{ id: "resource-production", level: 2 }],
        cost: { wood: 360, stone: 180, silver: 120 },
        timeMs: 14500,
        effect: "+3% produccion de madera por nivel"
      },
      {
        id: "stone-yield",
        name: "Canteros del Rey",
        max: 10,
        tier: 1,
        requires: [{ id: "resource-production", level: 3 }],
        cost: { stone: 420, wood: 240, silver: 140 },
        timeMs: 15000,
        effect: "+3% produccion de piedra por nivel"
      },
      {
        id: "iron-yield",
        name: "Hornos de Vizcaya",
        max: 10,
        tier: 2,
        requires: [{ id: "stone-yield", level: 2 }],
        cost: { iron: 360, wood: 320, silver: 160 },
        timeMs: 16500,
        effect: "+3% produccion de hierro por nivel"
      },
      {
        id: "gathering-speed",
        name: "Capataz de Minas",
        max: 10,
        tier: 2,
        requires: [{ id: "resource-production", level: 3 }],
        cost: { grain: 380, wood: 300, silver: 150 },
        timeMs: 15000,
        effect: "+6% velocidad de recoleccion por nivel"
      },
      {
        id: "troop-load",
        name: "Carretas de Indias",
        max: 10,
        tier: 2,
        requires: [{ id: "gathering-speed", level: 3 }],
        cost: { wood: 560, iron: 220, silver: 190 },
        timeMs: 17500,
        effect: "+5% carga de tropas por nivel"
      },
      {
        id: "storage-engineering",
        name: "Depositos Reales",
        max: 10,
        tier: 2,
        requires: [{ id: "resource-production", level: 4 }],
        cost: { stone: 620, wood: 440, silver: 180 },
        timeMs: 17000,
        effect: "+6.000 capacidad de almacen por nivel"
      },
      {
        id: "construction-method",
        name: "Maestros de Obra",
        max: 10,
        tier: 3,
        requires: [{ id: "storage-engineering", level: 3 }],
        cost: { wood: 620, stone: 620, silver: 220 },
        timeMs: 18000,
        effect: "+5% velocidad de construccion por nivel"
      },
      {
        id: "research-method",
        name: "Metodo Escolastico",
        max: 10,
        tier: 3,
        requires: [{ id: "construction-method", level: 2 }],
        cost: { grain: 480, silver: 340 },
        timeMs: 16000,
        effect: "+5% velocidad de investigacion por nivel"
      }
    ]
  },
  {
    id: "combat",
    name: "Combate",
    icon: "i-sword",
    body: "Desbloqueo de tropas, ataque, defensa, salud y especializacion de unidades.",
    nodes: [
      {
        id: "troop-attack",
        name: "Ataque de Tercios",
        max: 10,
        tier: 1,
        cost: { grain: 520, iron: 420, silver: 180 },
        timeMs: 16000,
        effect: "+3% ataque de tropas por nivel"
      },
      {
        id: "troop-defense",
        name: "Disciplina de Formacion",
        max: 10,
        tier: 1,
        cost: { grain: 500, stone: 360, silver: 170 },
        timeMs: 15000,
        effect: "+3% defensa de tropas por nivel"
      },
      {
        id: "infantry-attack",
        name: "Picas Cerradas",
        max: 10,
        tier: 1,
        requires: [{ id: "troop-attack", level: 2 }],
        cost: { grain: 540, iron: 360, silver: 170 },
        timeMs: 16000,
        effect: "+4% ataque de piqueros por nivel"
      },
      {
        id: "ranged-attack",
        name: "Descarga de Arcabuces",
        max: 10,
        tier: 1,
        requires: [{ id: "troop-attack", level: 2 }],
        cost: { grain: 520, iron: 460, silver: 190 },
        timeMs: 16500,
        effect: "+4% ataque de arcabuceros por nivel"
      },
      {
        id: "cavalry-attack",
        name: "Carga de Caballeria",
        max: 10,
        tier: 2,
        requires: [{ id: "troop-attack", level: 3 }, { id: "troop-defense", level: 2 }],
        cost: { grain: 660, iron: 480, silver: 220 },
        timeMs: 17500,
        effect: "+4% ataque de caballeria por nivel"
      },
      {
        id: "siege-attack",
        name: "Bateria de Asedio",
        max: 10,
        tier: 2,
        requires: [{ id: "cavalry-attack", level: 2 }],
        cost: { wood: 620, iron: 680, silver: 260 },
        timeMs: 19000,
        effect: "+5% ataque de artilleria por nivel"
      },
      {
        id: "troop-health",
        name: "Veterania de Campana",
        max: 10,
        tier: 2,
        requires: [{ id: "troop-defense", level: 3 }],
        cost: { grain: 680, silver: 260, iron: 340 },
        timeMs: 19000,
        effect: "Reduce heridos en combate"
      },
      {
        id: "troop-tier",
        name: "Tropas Veteranas",
        max: 10,
        tier: 3,
        requires: [{ id: "troop-attack", level: 4 }, { id: "troop-defense", level: 4 }],
        cost: { grain: 780, iron: 620, silver: 260 },
        timeMs: 22000,
        effect: "Desbloquea niveles superiores de tropa en cuarteles"
      },
      {
        id: "training-capacity",
        name: "Levas Organizadas",
        max: 10,
        tier: 3,
        requires: [{ id: "troop-tier", level: 2 }],
        cost: { grain: 680, iron: 420, silver: 210 },
        timeMs: 18000,
        effect: "+10 tropas por cola de entrenamiento"
      },
      {
        id: "training-speed",
        name: "Tambor de Leva",
        max: 10,
        tier: 3,
        requires: [{ id: "training-capacity", level: 2 }],
        cost: { grain: 560, wood: 260, silver: 180 },
        timeMs: 16000,
        effect: "+5% velocidad de entrenamiento por nivel"
      }
    ]
  },
  {
    id: "command",
    name: "Mando",
    icon: "i-map",
    body: "Marchas, espionaje, rallies, refuerzos y control del mapa.",
    nodes: [
      {
        id: "march-size",
        name: "Orden de Marcha",
        max: 10,
        tier: 1,
        cost: { grain: 620, wood: 340, silver: 220 },
        timeMs: 18000,
        effect: "+80 tropas maximas por marcha"
      },
      {
        id: "march-speed",
        name: "Camino Real",
        max: 10,
        tier: 1,
        cost: { wood: 520, stone: 300, silver: 190 },
        timeMs: 17000,
        effect: "+4% velocidad de marcha por nivel"
      },
      {
        id: "scout-precision",
        name: "Cartografos Secretos",
        max: 10,
        tier: 1,
        requires: [{ id: "march-speed", level: 2 }],
        cost: { silver: 320, wood: 220, gold: 2 },
        timeMs: 16500,
        effect: "Reduce coste de espionaje y mejora informes"
      },
      {
        id: "bonus-march-slot",
        name: "Estado Mayor",
        max: 5,
        tier: 2,
        requires: [{ id: "march-size", level: 3 }, { id: "march-speed", level: 3 }],
        cost: { grain: 1100, iron: 840, silver: 420 },
        timeMs: 28000,
        effect: "Desbloquea slots de marcha adicionales"
      },
      {
        id: "rally-tactics",
        name: "Junta de Guerra",
        max: 10,
        tier: 2,
        requires: [{ id: "march-size", level: 4 }],
        cost: { grain: 900, iron: 620, silver: 360 },
        timeMs: 24000,
        effect: "+5% tropas aliadas simuladas en rallies"
      },
      {
        id: "rally-size",
        name: "Estandartes de Alianza",
        max: 10,
        tier: 3,
        requires: [{ id: "rally-tactics", level: 3 }],
        cost: { grain: 1200, iron: 900, silver: 520 },
        timeMs: 30000,
        effect: "+4% ataque de rally por nivel"
      },
      {
        id: "reinforcement-capacity",
        name: "Capitanias de Refuerzo",
        max: 10,
        tier: 3,
        requires: [{ id: "bonus-march-slot", level: 1 }],
        cost: { grain: 880, wood: 540, silver: 330 },
        timeMs: 23000,
        effect: "Prepara futuras guarniciones aliadas"
      }
    ]
  },
  {
    id: "defense",
    name: "Defensa",
    icon: "i-shield",
    body: "Muralla, hospitales, guarnicion, trampas y resistencia de la ciudad.",
    nodes: [
      {
        id: "wall-defense",
        name: "Baluartes Reforzados",
        max: 10,
        tier: 1,
        cost: { stone: 720, iron: 320, silver: 190 },
        timeMs: 17000,
        effect: "+4% defensa de muralla por nivel"
      },
      {
        id: "garrison-defense",
        name: "Guardia de Plaza",
        max: 10,
        tier: 1,
        cost: { grain: 540, iron: 420, silver: 190 },
        timeMs: 17000,
        effect: "+3% defensa de guarnicion por nivel"
      },
      {
        id: "trap-engineering",
        name: "Ingenios de Foso",
        max: 10,
        tier: 1,
        requires: [{ id: "wall-defense", level: 2 }],
        cost: { wood: 460, stone: 520, iron: 260 },
        timeMs: 17500,
        effect: "Aumenta defensa futura de trampas"
      },
      {
        id: "city-health",
        name: "Raciones de Asedio",
        max: 10,
        tier: 2,
        requires: [{ id: "garrison-defense", level: 3 }],
        cost: { grain: 760, silver: 260, stone: 360 },
        timeMs: 19500,
        effect: "Reduce heridos al defender y en combates largos"
      },
      {
        id: "hospital-capacity",
        name: "Cirujanos Reales",
        max: 10,
        tier: 2,
        requires: [{ id: "city-health", level: 2 }],
        cost: { grain: 680, wood: 240, silver: 220 },
        timeMs: 18000,
        effect: "+12 camas por hospital y nivel"
      },
      {
        id: "healing-speed",
        name: "Botica Militar",
        max: 10,
        tier: 2,
        requires: [{ id: "hospital-capacity", level: 2 }],
        cost: { grain: 620, silver: 260 },
        timeMs: 16000,
        effect: "+5% velocidad de curacion por nivel"
      },
      {
        id: "counter-raid",
        name: "Contraasalto",
        max: 10,
        tier: 3,
        requires: [{ id: "wall-defense", level: 4 }, { id: "garrison-defense", level: 4 }],
        cost: { stone: 900, iron: 620, silver: 320 },
        timeMs: 23000,
        effect: "Reduce perdidas en combate"
      },
      {
        id: "anti-scout",
        name: "Red de Informantes",
        max: 10,
        tier: 3,
        requires: [{ id: "counter-raid", level: 2 }],
        cost: { silver: 520, gold: 4, wood: 360 },
        timeMs: 22000,
        effect: "Prepara defensa contra espionaje enemigo"
      }
    ]
  },
  {
    id: "hero",
    name: "Heroe",
    icon: "i-user",
    body: "Caza de monstruos, energia, experiencia, botin y mando del capitan.",
    nodes: [
      {
        id: "monster-tier",
        name: "Rastreo de Monstruos",
        max: 10,
        tier: 1,
        cost: { grain: 540, silver: 260, gold: 4 },
        timeMs: 19000,
        effect: "Permite enfrentarse a monstruos de mayor nivel"
      },
      {
        id: "hero-monster-attack",
        name: "Caza Mayor",
        max: 10,
        tier: 1,
        requires: [{ id: "monster-tier", level: 1 }],
        cost: { iron: 460, silver: 320, gold: 5 },
        timeMs: 21000,
        effect: "+8% ataque del heroe contra monstruos por nivel"
      },
      {
        id: "monster-loot",
        name: "Despiece de Bestias",
        max: 10,
        tier: 1,
        requires: [{ id: "hero-monster-attack", level: 2 }],
        cost: { grain: 420, silver: 300, gold: 4 },
        timeMs: 19000,
        effect: "+6% botin de monstruos por nivel"
      },
      {
        id: "monster-stamina",
        name: "Tactica de Caceria",
        max: 10,
        tier: 2,
        requires: [{ id: "monster-tier", level: 3 }],
        cost: { grain: 560, iron: 300, gold: 4 },
        timeMs: 20500,
        effect: "Reduce heridos contra monstruos"
      },
      {
        id: "hero-energy",
        name: "Vigor del Capitan",
        max: 10,
        tier: 2,
        requires: [{ id: "monster-stamina", level: 2 }],
        cost: { grain: 420, silver: 300, gold: 4 },
        timeMs: 18000,
        effect: "+20 energia maxima del heroe"
      },
      {
        id: "hero-xp-boost",
        name: "Cronicas de Campana",
        max: 10,
        tier: 2,
        requires: [{ id: "monster-loot", level: 2 }],
        cost: { wood: 420, silver: 260, gold: 3 },
        timeMs: 17000,
        effect: "+6% experiencia del heroe por nivel"
      },
      {
        id: "hero-command",
        name: "Mando del Capitan",
        max: 10,
        tier: 3,
        requires: [{ id: "hero-xp-boost", level: 3 }, { id: "hero-energy", level: 3 }],
        cost: { silver: 520, gold: 6, iron: 420 },
        timeMs: 24000,
        effect: "+3% ataque de marchas con heroe por nivel"
      }
    ]
  },
  {
    id: "forge",
    name: "Forja",
    icon: "i-hammer",
    body: "Equipo, artilleria, galeones y calidad de materiales.",
    nodes: [
      {
        id: "forge-efficiency",
        name: "Taller de Toledo",
        max: 10,
        tier: 1,
        cost: { iron: 520, wood: 280, silver: 220 },
        timeMs: 17000,
        effect: "-3% coste de forja por nivel"
      },
      {
        id: "material-recovery",
        name: "Aprovechar Fragmentos",
        max: 10,
        tier: 1,
        requires: [{ id: "forge-efficiency", level: 2 }],
        cost: { iron: 420, silver: 260, gold: 3 },
        timeMs: 17500,
        effect: "Reduce piezas necesarias en mejoras altas"
      },
      {
        id: "gear-attack",
        name: "Filos de Toledo",
        max: 10,
        tier: 2,
        requires: [{ id: "forge-efficiency", level: 3 }],
        cost: { iron: 620, silver: 360, gold: 4 },
        timeMs: 20000,
        effect: "+2% ataque de tropas por nivel"
      },
      {
        id: "gear-defense",
        name: "Corazas de Milan",
        max: 10,
        tier: 2,
        requires: [{ id: "material-recovery", level: 2 }],
        cost: { iron: 580, stone: 320, silver: 340 },
        timeMs: 20000,
        effect: "+2% defensa de ciudad por nivel"
      },
      {
        id: "artillery-foundry",
        name: "Fundicion de Canones",
        max: 10,
        tier: 3,
        requires: [{ id: "gear-attack", level: 3 }],
        cost: { iron: 900, wood: 520, silver: 420 },
        timeMs: 24000,
        effect: "+4% ataque de artilleria por nivel"
      },
      {
        id: "naval-engineering",
        name: "Ingenieria Naval",
        max: 10,
        tier: 3,
        requires: [{ id: "artillery-foundry", level: 2 }],
        cost: { wood: 1200, iron: 520, silver: 460 },
        timeMs: 26000,
        effect: "+3% velocidad y ataque naval por nivel"
      }
    ]
  }
];

const troopCatalog = [
  {
    id: "pikemen",
    name: "Piqueros",
    role: "Infanteria",
    unlockTier: 1,
    trainCost: { grain: 10, iron: 4, silver: 1 },
    attack: 3,
    defense: 6,
    load: 8,
    speed: 8,
    description: "Fuertes en defensa y buenos para proteger recolecciones."
  },
  {
    id: "musketeers",
    name: "Arcabuceros",
    role: "Ataque",
    unlockTier: 1,
    trainCost: { grain: 8, iron: 9, silver: 2 },
    attack: 7,
    defense: 3,
    load: 6,
    speed: 7,
    description: "DaÃ±o alto para caza y asaltos ligeros."
  },
  {
    id: "cavalry",
    name: "Caballeria",
    role: "Rapida",
    unlockTier: 2,
    trainCost: { grain: 14, iron: 8, silver: 3 },
    attack: 6,
    defense: 4,
    load: 7,
    speed: 11,
    description: "Marcha veloz para espionaje, caza y refuerzos."
  },
  {
    id: "artillery",
    name: "Artilleria",
    role: "Asedio",
    unlockTier: 3,
    trainCost: { wood: 10, iron: 18, silver: 5 },
    attack: 14,
    defense: 2,
    load: 12,
    speed: 4,
    description: "Lenta, potente y pesada contra fortificaciones."
  },
  {
    id: "galleons",
    name: "Galeones",
    role: "Naval",
    unlockTier: 4,
    trainCost: { wood: 520, iron: 180, silver: 80 },
    attack: 18,
    defense: 10,
    load: 120,
    speed: 6,
    description: "Marchas navales, comercio y expediciones de larga distancia."
  }
];

const troopCounterClasses = {
  pikemen: "infantry",
  musketeers: "ranged",
  cavalry: "cavalry"
};

const troopCounterWins = {
  cavalry: "ranged",
  ranged: "infantry",
  infantry: "cavalry"
};

const troopCounterLabels = {
  cavalry: "Caballeria",
  ranged: "Arcabuceros",
  infantry: "Piqueros"
};

const TROOP_COUNTER_MAX_BONUS = 35;
const RESOURCE_TILE_REFILL_MS = 30 * 60 * 1000;
const MONSTER_RESPAWN_BASE_MS = 12 * 60 * 1000;

const packs = [
  {
    id: "small-resources",
    name: "Saco de Recursos",
    icon: "i-crown",
    tier: "Basico",
    valueLabel: "Valor 5 EUR",
    difficulty: "easy",
    difficultyLabel: "Pregunta sencilla",
    text: "Recursos rapidos para seguir construyendo.",
    reward: { grain: 1800, wood: 1700, stone: 1500, iron: 900, silver: 260, gold: 12 },
    items: {
      "card-grain-1800": 1,
      "card-wood-1700": 1,
      "card-stone-1500": 1,
      "card-iron-900": 1,
      "card-silver-260": 1,
      "card-gold-12": 1
    }
  },
  {
    id: "small-builder",
    name: "Ayuda de Obra",
    icon: "i-hammer",
    tier: "Basico",
    valueLabel: "Valor 5 EUR",
    difficulty: "easy",
    difficultyLabel: "Pregunta sencilla",
    text: "Madera, piedra y un pequeno impulso de obra.",
    reward: { wood: 2200, stone: 2400, silver: 320, buildBoost: 1 },
    items: {
      "card-wood-2200": 1,
      "card-stone-2400": 1,
      "card-silver-320": 1,
      "speed-build-15": 1
    }
  },
  {
    id: "medium-academy",
    name: "Cartas de Ciencia",
    icon: "i-book",
    tier: "Avanzado",
    valueLabel: "Valor 15 EUR",
    difficulty: "medium",
    difficultyLabel: "Pregunta media",
    text: "Impulso serio de hierro, plata y aceleradores de investigacion.",
    reward: { iron: 10400, silver: 4800, researchBoost: 4, gold: 84 },
    items: {
      "card-iron-2600": 4,
      "card-silver-1200": 4,
      "card-gold-28": 3,
      "speed-research-30": 4,
      "frag-chart": 2
    }
  },
  {
    id: "medium-army",
    name: "Leva de Tercios",
    icon: "i-sword",
    tier: "Avanzado",
    valueLabel: "Valor 30 EUR",
    difficulty: "medium",
    difficultyLabel: "Pregunta media",
    text: "Leva potente con recursos militares y aceleradores de entrenamiento.",
    reward: { grain: 20800, iron: 12400, troopBoost: 6, gold: 126 },
    items: {
      "card-grain-5200": 4,
      "card-iron-3100": 4,
      "card-gold-42": 3,
      "speed-training-30": 6,
      "speed-training-60": 2,
      "frag-sword": 2
    }
  },
  {
    id: "grand-hero",
    name: "Gesta Imperial",
    icon: "i-user",
    tier: "Imperial",
    valueLabel: "Valor 115 EUR",
    difficulty: "hard",
    difficultyLabel: "Pregunta dificil",
    text: "Premio mayor: recursos masivos, oro, aceleradores largos y piezas de heroe.",
    reward: { grain: 400000, wood: 400000, stone: 400000, iron: 320000, silver: 250000, gold: 3000, heroEnergy: 9000, heroXp: 125000, buildBoost: 30 },
    items: {
      "card-grain-50000": 8,
      "card-wood-50000": 8,
      "card-stone-50000": 8,
      "card-iron-50000": 6,
      "card-silver-25000": 10,
      "card-gold-1000": 3,
      "hero-energy-1500": 6,
      "hero-xp-25000": 5,
      "speed-build-8h": 10,
      "speed-research-8h": 8,
      "speed-training-8h": 8,
      "speed-build-24h": 3,
      "frag-morrion-rare": 4,
      "frag-coraza-rare": 4,
      "frag-sword-rare": 4,
      "frag-morrion-epic": 2,
      "frag-coraza-epic": 2,
      "frag-sword-epic": 2
    }
  },
  {
    id: "grand-naval",
    name: "Armada del Atlantico",
    icon: "i-ship",
    tier: "Imperial",
    valueLabel: "Valor 115 EUR",
    difficulty: "hard",
    difficultyLabel: "Pregunta dificil",
    text: "Premio mayor de armada: recursos, oro, entrenamiento y piezas navales de calidad.",
    reward: { grain: 300000, wood: 520000, stone: 260000, iron: 420000, silver: 220000, gold: 2800, navalBoost: 26, troopBoost: 22 },
    items: {
      "card-grain-50000": 6,
      "card-wood-50000": 10,
      "card-stone-50000": 5,
      "card-iron-50000": 8,
      "card-silver-25000": 9,
      "card-gold-1000": 3,
      "speed-naval-8h": 10,
      "speed-training-8h": 10,
      "speed-build-8h": 6,
      "speed-research-8h": 6,
      "speed-any-24h": 3,
      "frag-compass-rare": 4,
      "frag-cannon-rare": 4,
      "frag-chart-rare": 4,
      "frag-compass-epic": 2,
      "frag-cannon-epic": 2,
      "frag-chart-epic": 2
    }
  }
];

const forgeQualities = [
  { id: "common", label: "Comun", short: "C", color: "#c8c0ad", multiplier: 1 },
  { id: "fine", label: "Verde", short: "V", color: "#62c66f", multiplier: 2 },
  { id: "rare", label: "Azul", short: "A", color: "#5aa8ff", multiplier: 4 },
  { id: "epic", label: "Morado", short: "M", color: "#b36cff", multiplier: 8 },
  { id: "legendary", label: "Dorado", short: "D", color: "#ffd45a", multiplier: 16 }
];

const forgeMaterialBases = {
  "frag-chart": { name: "Carta Nautica", icon: "i-map", description: "Pieza para equipo de exploracion del heroe." },
  "frag-sword": { name: "Espada Toledana", icon: "i-sword", description: "Pieza de arma para el heroe." },
  "frag-morrion": { name: "Morrion Dorado", icon: "i-user", description: "Pieza de casco para el heroe." },
  "frag-coraza": { name: "Coraza", icon: "i-shield", description: "Pieza de armadura para el heroe." },
  "frag-compass": { name: "Brujula", icon: "i-map", description: "Pieza de navegacion para el heroe." },
  "frag-cannon": { name: "Artilleria", icon: "i-target", description: "Pieza para equipo de asedio del heroe." }
};

function forgeMaterialInventoryEntries() {
  return Object.fromEntries(
    Object.entries(forgeMaterialBases).flatMap(([baseId, base]) =>
      forgeQualities.map((quality, qualityIndex) => {
        const id = forgeMaterialId(baseId, qualityIndex);
        return [
          id,
          equipmentItem(`Fragmento de ${base.name}`, quality.label, base.icon, `${base.description} Calidad ${quality.label}.`, {
            materialBase: baseId,
            qualityId: quality.id,
            qualityIndex,
            color: quality.color
          })
        ];
      })
    )
  );
}

const inventoryCatalog = {
  "card-grain-1800": cardItem("Tarjeta de Trigo", "Comun", "i-crown", "Usar: +1.800 trigo.", { grain: 1800 }),
  "card-wood-1700": cardItem("Tarjeta de Madera", "Comun", "i-hammer", "Usar: +1.700 madera.", { wood: 1700 }),
  "card-stone-1500": cardItem("Tarjeta de Piedra", "Comun", "i-shield", "Usar: +1.500 piedra.", { stone: 1500 }),
  "card-iron-900": cardItem("Tarjeta de Hierro", "Comun", "i-sword", "Usar: +900 hierro.", { iron: 900 }),
  "card-silver-260": cardItem("Tarjeta de Plata", "Comun", "i-scroll", "Usar: +260 plata.", { silver: 260 }),
  "card-gold-12": cardItem("Tarjeta de Oro", "Comun", "i-crown", "Usar: +12 oro.", { gold: 12 }),
  "card-wood-2200": cardItem("Tarjeta de Madera", "Comun", "i-hammer", "Usar: +2.200 madera.", { wood: 2200 }),
  "card-stone-2400": cardItem("Tarjeta de Piedra", "Comun", "i-shield", "Usar: +2.400 piedra.", { stone: 2400 }),
  "card-silver-320": cardItem("Tarjeta de Plata", "Comun", "i-scroll", "Usar: +320 plata.", { silver: 320 }),
  "card-iron-2600": cardItem("Tarjeta de Hierro", "Rara", "i-sword", "Usar: +2.600 hierro.", { iron: 2600 }),
  "card-silver-1200": cardItem("Tarjeta de Plata", "Rara", "i-scroll", "Usar: +1.200 plata.", { silver: 1200 }),
  "card-gold-28": cardItem("Tarjeta de Oro", "Rara", "i-crown", "Usar: +28 oro.", { gold: 28 }),
  "card-grain-5200": cardItem("Tarjeta de Trigo", "Rara", "i-crown", "Usar: +5.200 trigo.", { grain: 5200 }),
  "card-iron-3100": cardItem("Tarjeta de Hierro", "Rara", "i-sword", "Usar: +3.100 hierro.", { iron: 3100 }),
  "card-gold-42": cardItem("Tarjeta de Oro", "Rara", "i-crown", "Usar: +42 oro.", { gold: 42 }),
  "card-silver-2600": cardItem("Tarjeta de Plata", "Epica", "i-scroll", "Usar: +2.600 plata.", { silver: 2600 }),
  "card-gold-120": cardItem("Tarjeta de Oro", "Epica", "i-crown", "Usar: +120 oro.", { gold: 120 }),
  "card-wood-8200": cardItem("Tarjeta de Madera", "Epica", "i-hammer", "Usar: +8.200 madera.", { wood: 8200 }),
  "card-iron-5200": cardItem("Tarjeta de Hierro", "Epica", "i-sword", "Usar: +5.200 hierro.", { iron: 5200 }),
  "card-silver-2100": cardItem("Tarjeta de Plata", "Epica", "i-scroll", "Usar: +2.100 plata.", { silver: 2100 }),
  "card-gold-110": cardItem("Tarjeta de Oro", "Epica", "i-crown", "Usar: +110 oro.", { gold: 110 }),
  "card-grain-50000": cardItem("Tarjeta de Trigo", "Legendaria", "i-crown", "Usar: +50.000 trigo.", { grain: 50000 }),
  "card-wood-50000": cardItem("Tarjeta de Madera", "Legendaria", "i-hammer", "Usar: +50.000 madera.", { wood: 50000 }),
  "card-stone-50000": cardItem("Tarjeta de Piedra", "Legendaria", "i-shield", "Usar: +50.000 piedra.", { stone: 50000 }),
  "card-iron-50000": cardItem("Tarjeta de Hierro", "Legendaria", "i-sword", "Usar: +50.000 hierro.", { iron: 50000 }),
  "card-silver-25000": cardItem("Tarjeta de Plata", "Legendaria", "i-scroll", "Usar: +25.000 plata.", { silver: 25000 }),
  "card-gold-1000": cardItem("Tarjeta de Oro", "Legendaria", "i-crown", "Usar: +1.000 oro.", { gold: 1000 }),
  "speed-build-5": boostItem("Acelerador de Obra", "5 min", "i-hammer", "Reduce una cola corta de construccion.", { queue: "construction", seconds: 300 }),
  "speed-build-15": boostItem("Acelerador de Obra", "15 min", "i-hammer", "Reduce una cola de construccion activa.", { queue: "construction", seconds: 900 }),
  "speed-build-60": boostItem("Acelerador de Obra", "60 min", "i-hammer", "Acelerador largo para mejoras de edificios.", { queue: "construction", seconds: 3600 }),
  "speed-build-8h": boostItem("Acelerador de Obra", "8 h", "i-hammer", "Acelerador mayor para mejoras largas.", { queue: "construction", seconds: 28800 }),
  "speed-build-24h": boostItem("Acelerador de Obra", "24 h", "i-hammer", "Acelerador de dia completo para construccion.", { queue: "construction", seconds: 86400 }),
  "speed-research-5": boostItem("Acelerador de Ciencia", "5 min", "i-book", "Reduce una investigacion corta de Academia.", { queue: "research", seconds: 300 }),
  "speed-research-15": boostItem("Acelerador de Ciencia", "15 min", "i-book", "Reduce una investigacion de Academia.", { queue: "research", seconds: 900 }),
  "speed-research-30": boostItem("Acelerador de Ciencia", "30 min", "i-book", "Reduce una investigacion de Academia.", { queue: "research", seconds: 1800 }),
  "speed-research-8h": boostItem("Acelerador de Ciencia", "8 h", "i-book", "Acelerador mayor para investigaciones largas.", { queue: "research", seconds: 28800 }),
  "speed-training-5": boostItem("Acelerador de Leva", "5 min", "i-sword", "Reduce una cola corta de entrenamiento.", { queue: "training", seconds: 300 }),
  "speed-training-15": boostItem("Acelerador de Leva", "15 min", "i-sword", "Reduce una cola de entrenamiento.", { queue: "training", seconds: 900 }),
  "speed-training-30": boostItem("Acelerador de Leva", "30 min", "i-sword", "Reduce una cola de entrenamiento.", { queue: "training", seconds: 1800 }),
  "speed-training-60": boostItem("Acelerador de Leva", "60 min", "i-sword", "Acelerador largo para tropas.", { queue: "training", seconds: 3600 }),
  "speed-training-8h": boostItem("Acelerador de Leva", "8 h", "i-sword", "Acelerador mayor para grandes levas.", { queue: "training", seconds: 28800 }),
  "speed-naval-60": boostItem("Acelerador Naval", "60 min", "i-ship", "Reduce cualquier cola activa de expedicion o construccion naval.", { queue: "any", seconds: 3600 }),
  "speed-naval-8h": boostItem("Acelerador Naval", "8 h", "i-ship", "Acelerador mayor para armada y colas activas.", { queue: "any", seconds: 28800 }),
  "speed-any-24h": boostItem("Acelerador Imperial", "24 h", "i-crown", "Reduce cualquier cola activa un dia completo.", { queue: "any", seconds: 86400 }),
  "hero-energy-180": heroItem("Vino de Campana", "Heroe", "i-user", "Usar: +180 energia de heroe.", { heroEnergy: 180 }),
  "hero-energy-1500": heroItem("Vino de Capitan General", "Heroe", "i-user", "Usar: +1.500 energia de heroe.", { heroEnergy: 1500 }),
  "hero-xp-1600": heroItem("Cronica de Gesta", "Heroe", "i-scroll", "Usar: +1.600 experiencia de heroe.", { heroXp: 1600 }),
  "hero-xp-25000": heroItem("Cronica Imperial", "Heroe", "i-scroll", "Usar: +25.000 experiencia de heroe.", { heroXp: 25000 }),
  "frag-chart": equipmentItem("Fragmento de Carta Nautica", "Pieza", "i-map", "Pieza para equipo de exploracion del heroe."),
  "frag-sword": equipmentItem("Fragmento de Espada Toledana", "Pieza", "i-sword", "Pieza de arma para el heroe."),
  "frag-morrion": equipmentItem("Fragmento de Morrion Dorado", "Pieza", "i-user", "Pieza de casco para el heroe."),
  "frag-coraza": equipmentItem("Fragmento de Coraza", "Pieza", "i-shield", "Pieza de armadura para el heroe."),
  "frag-compass": equipmentItem("Fragmento de BrÃºjula", "Pieza", "i-map", "Pieza de navegacion para el heroe."),
  "frag-cannon": equipmentItem("Fragmento de Artilleria", "Pieza", "i-target", "Pieza para equipo de asedio del heroe."),
  ...forgeMaterialInventoryEntries()
};

const MAX_EQUIPMENT_LEVEL = 5;

const forgeRecipes = [
  {
    id: "espada-toledana",
    slot: "Arma",
    name: "Espada Toledana",
    icon: "i-sword",
    fragment: "frag-sword",
    cost: { iron: 1050, silver: 420 },
    bonus: { attack: 3, monster: 2 }
  },
  {
    id: "morrion-dorado",
    slot: "Casco",
    name: "Morrion Dorado",
    icon: "i-user",
    fragment: "frag-morrion",
    cost: { iron: 820, silver: 360 },
    bonus: { defense: 3, research: 2, monster: 2 }
  },
  {
    id: "coraza-indias",
    slot: "Armadura",
    name: "Coraza de Indias",
    icon: "i-shield",
    fragment: "frag-coraza",
    cost: { iron: 1280, silver: 560 },
    bonus: { defense: 5 }
  },
  {
    id: "carta-nautica",
    slot: "Mapa",
    name: "Carta Nautica",
    icon: "i-map",
    fragment: "frag-chart",
    cost: { wood: 920, silver: 360 },
    bonus: { marchSize: 20, gathering: 4 }
  },
  {
    id: "brujula-real",
    slot: "Reliquia",
    name: "Brujula Real",
    icon: "i-map",
    fragment: "frag-compass",
    cost: { wood: 720, iron: 360, silver: 460 },
    bonus: { marchSize: 10, research: 3, gathering: 3, monster: 3 }
  },
  {
    id: "canon-maestro",
    slot: "Asedio",
    name: "Canon Maestro",
    icon: "i-target",
    fragment: "frag-cannon",
    cost: { iron: 1540, wood: 760, silver: 680 },
    bonus: { attack: 4 }
  }
];

const equipmentLoadouts = [
  { id: "attack", name: "Ataque", icon: "i-sword", keys: ["attack", "monster", "marchSize"] },
  { id: "defense", name: "Defensa", icon: "i-shield", keys: ["defense"] },
  { id: "research", name: "Invest.", icon: "i-scroll", keys: ["research"] },
  { id: "gathering", name: "Recolect.", icon: "i-map", keys: ["gathering", "marchSize"] }
];

const equipmentSetBonuses = {
  attack: {
    name: "Conjunto de Guerra",
    partialAt: 3,
    partial: { attack: 12, monster: 10, marchSize: 60 },
    full: { attack: 35, monster: 30, marchSize: 180 }
  },
  defense: {
    name: "Conjunto de Defensa",
    partialAt: 1,
    partial: { defense: 8 },
    full: { defense: 35 }
  },
  research: {
    name: "Conjunto de Ciencia",
    partialAt: 1,
    partial: { research: 8 },
    full: { research: 35 }
  },
  gathering: {
    name: "Conjunto de Recoleccion",
    partialAt: 1,
    partial: { gathering: 10, marchSize: 50 },
    full: { gathering: 40, marchSize: 180 }
  }
};

const HERO_BASE_LEVEL = 0;
const HERO_BASE_ENERGY = 100;
const HERO_ENERGY_REGEN_MS = 15000;
const HERO_MONSTER_ENERGY_COST = 20;

const heroRoster = [
  {
    id: "alonso",
    name: "Don Alonso de Acuna",
    title: "Capitan General",
    initials: "AA",
    portrait: "./assets/hero-don-alonso.png"
  },
  {
    id: "diego",
    name: "Don Diego de Vargas",
    title: "Maestre de Campo",
    initials: "DV",
    portrait: "./assets/hero-don-diego.png"
  },
  {
    id: "hernan",
    name: "Don Hernan de Leiva",
    title: "Adelantado Real",
    initials: "HL",
    portrait: "./assets/hero-don-hernan.png"
  },
  {
    id: "rodrigo",
    name: "Don Rodrigo de Sarmiento",
    title: "Cartografo Mayor",
    initials: "RS",
    portrait: "./assets/hero-don-rodrigo.png"
  }
];

const allianceProjectCatalog = [
  {
    id: "relief",
    name: "Casa de Socorro",
    icon: "i-plus",
    max: 5,
    description: "Mejora ayudas de alianza sobre construccion, investigacion, entrenamiento y curacion.",
    effect: "+1 ayuda maxima y +2% reduccion por nivel",
    baseCost: { grain: 1600, wood: 1200, silver: 260 }
  },
  {
    id: "routes",
    name: "Rutas de Indias",
    icon: "i-ship",
    max: 5,
    description: "Aumenta la capacidad de convoy y el honor que generan los envios.",
    effect: "+8% capacidad y +6% honor por nivel",
    baseCost: { wood: 1800, iron: 760, silver: 320 }
  },
  {
    id: "banner",
    name: "Estandarte de Guerra",
    icon: "i-target",
    max: 5,
    description: "Ordena rallies y mejora el ataque conjunto de la alianza.",
    effect: "+3% ataque de rally por nivel",
    baseCost: { grain: 1200, iron: 1120, silver: 420 }
  }
];

const defaultState = {
  dataVersion: DATA_VERSION,
  selectedHeroId: "alonso",
  heroes: createDefaultHeroes(),
  resources: {
    grain: 12000,
    wood: 9400,
    stone: 8600,
    iron: 6100,
    silver: 3200,
    gold: 180
  },
  power: 142800,
  wisdom: {
    weekKey: getWeekKey(new Date()),
    claimed: 0
  },
  buildingLevels: {},
  alcazarRewardsClaimed: {},
  fortressAssignments: {},
  enemyResources: {},
  enemyTroops: {},
  enemyWounded: {},
  resourceTiles: {},
  monsterStates: {},
  inventory: {},
  heroEquipment: {},
  activeEquipmentLoadout: "attack",
  allianceTreasury: {
    grain: 6000,
    wood: 4200,
    stone: 3200,
    iron: 1800,
    silver: 760
  },
  allianceHonor: 0,
  allianceConvoys: [],
  alliancePurchases: [],
  allianceProjects: {
    relief: 0,
    routes: 0,
    banner: 0
  },
  allianceMembers: [
    { id: "isabel", name: "Isabel de Rojas", rank: "R5", role: "Maestre", power: 286400, helps: 42, donated: 18400, status: "online", markerId: "ally-od-3" },
    { id: "sancho", name: "Sancho de Medina", rank: "R4", role: "Guerra", power: 224900, helps: 37, donated: 13600, status: "online", markerId: "ally-od-4" },
    { id: "beatriz", name: "Beatriz del Puerto", rank: "R4", role: "Logistica", power: 198300, helps: 28, donated: 21200, status: "away", markerId: "ally-od-5" },
    { id: "alonso-npc", name: "Alonso de Vera", rank: "R3", role: "Cazador", power: 154700, helps: 19, donated: 8600, status: "offline", markerId: "ally-od-6" },
    { id: "ines", name: "Ines de Saavedra", rank: "R3", role: "Mercado", power: 132500, helps: 24, donated: 17100, status: "online", markerId: "ally-od-7" }
  ],
  queues: {
    construction: null,
    research: null,
    training: null,
    healing: null
  },
  lastProductionAt: Date.now(),
  productionRemainder: {},
  troops: {
    pikemen: 260,
    musketeers: 180,
    cavalry: 70,
    artillery: 16,
    galleons: 2
  },
  woundedByTroop: {
    pikemen: 70,
    musketeers: 40,
    cavalry: 16
  },
  marches: [],
  reports: [],
  worldBookmarks: [],
  marchSequence: 1,
  researchLevels: {
    "troop-attack": 1,
    "troop-defense": 1,
    "troop-tier": 1,
    "march-size": 1,
    "march-speed": 1,
    "monster-tier": 2
  },
  marchPresets: {
    resource: { percentages: { pikemen: 45, cavalry: 20, artillery: 25, galleons: 10 }, withHero: false },
    monster: { percentages: { musketeers: 60, cavalry: 25, artillery: 10, pikemen: 5 }, withHero: true },
    enemy: { percentages: { musketeers: 42, pikemen: 28, cavalry: 18, artillery: 12 }, withHero: false }
  },
  boosts: {
    buildBoost: 1,
    researchBoost: 1,
    troopBoost: 0,
    navalBoost: 0
  },
  woundedTroops: 126,
  trainedTroops: 480,
  researchCompleted: 14,
  rallies: [],
  rallySequence: 1,
  chatMessages: {
    alliance: [
      { author: "Isabel", text: "Rally disponible en la frontera norte.", at: Date.now() - 1000 * 60 * 7 },
      { author: "Sancho", text: "Tengo aceleradores para ayudar a la Academia.", at: Date.now() - 1000 * 60 * 3 }
    ],
    kingdom: [
      { author: "Reino", text: "El Virrey anuncia tregua en el centro del mapa.", at: Date.now() - 1000 * 60 * 12 },
      { author: "Mercader", text: "Campos de trigo nivel 6 libres al este.", at: Date.now() - 1000 * 60 * 5 }
    ]
  },
  allianceFeed: [
    {
      title: "Isabel acelero tu Academia",
      body: "Ayuda recibida: -5 min de investigacion."
    },
    {
      title: "La Orden marco un objetivo",
      body: "Grifo del Estrecho Nv. 3 disponible."
    },
    {
      title: "Convoy preparado",
      body: "El Mercado puede enviar plata a aliados."
    }
  ],
  serverEvents: [],
  serverEventSequence: 1
};

let state = loadState();
let currentTab = "city";
let activeBuildingId = null;
let activePlotId = null;
let selectedPackId = null;
let currentChallenge = null;
let inventoryFilter = "all";
let academyBranchId = "combat";
let chatChannel = "alliance";
let activeSheetMode = null;
let activeMapMarkerId = null;
let activeWorldMarchId = null;
let activeReportId = null;
let activeRallyId = null;
let activeAllianceMemberId = null;
let worldFilter = "all";
let worldZoom = 1;
let worldHasCentered = false;
let worldPinch = null;
let heroPanelTab = "progress";

const WORLD_MIN_ZOOM = 0.28;
const WORLD_MAX_ZOOM = 1.8;
const WORLD_ZOOM_STEP = 0.18;
const resourceStrip = document.querySelector("#resourceStrip");
const queueStrip = document.querySelector("#queueStrip");
const powerValue = document.querySelector("#powerValue");
const buildingLayer = document.querySelector("#buildingLayer");
const worldViewport = document.querySelector("#worldViewport");
const worldCanvas = document.querySelector("#worldCanvas");
const worldCoordinates = document.querySelector("#worldCoordinates");
const worldJumpForm = document.querySelector("#worldJumpForm");
const worldJumpX = document.querySelector("#worldJumpX");
const worldJumpY = document.querySelector("#worldJumpY");
const worldFilterTabs = document.querySelector("#worldFilterTabs");
const worldMarchPanel = document.querySelector("#worldMarchPanel");
const mapLayer = document.querySelector("#mapLayer");
const sheet = document.querySelector("#detailSheet");
const sheetBody = document.querySelector("#sheetBody");
const packGrid = document.querySelector("#packGrid");
const challengePanel = document.querySelector("#challengePanel");
const weeklyCount = document.querySelector("#weeklyCount");
const weeklyMeterFill = document.querySelector("#weeklyMeterFill");
const inventorySummary = document.querySelector("#inventorySummary");
const inventoryTabs = document.querySelector("#inventoryTabs");
const inventoryGrid = document.querySelector("#inventoryGrid");
const militarySummary = document.querySelector("#militarySummary");
const combatLedger = document.querySelector("#combatLedger");
const troopGrid = document.querySelector("#troopGrid");
const marchList = document.querySelector("#marchList");
const reportList = document.querySelector("#reportList");
const heroAccessButton = document.querySelector("#heroAccessButton");
const heroAccessImage = document.querySelector("#heroAccessImage");
const heroAccessLevel = document.querySelector("#heroAccessLevel");
const heroAccessName = document.querySelector("#heroAccessName");
const heroPortraitImage = document.querySelector(".hero-portrait img");
const heroEyebrow = document.querySelector(".hero-copy span");
const heroName = document.querySelector(".hero-copy h1");
const heroSubtitle = document.querySelector(".hero-copy p");
const heroRosterEl = document.querySelector("#heroRoster");
const heroProgress = document.querySelector("#heroProgress");
const heroPanelTabs = document.querySelector("#heroPanelTabs");
const heroDetailPanel = document.querySelector("#heroDetailPanel");
const heroStatRow = document.querySelector(".hero-view .stat-row");
const heroEquipmentGrid = document.querySelector(".equipment-grid");
const rallyList = document.querySelector("#rallyList");
const allianceSummary = document.querySelector("#allianceSummary");
const allianceMembers = document.querySelector("#allianceMembers");
const allianceFeed = document.querySelector("#allianceFeed");
const chatTabs = document.querySelector("#chatTabs");
const chatLog = document.querySelector("#chatLog");
const chatCompose = document.querySelector("#chatCompose");
const chatInput = document.querySelector("#chatInput");

init();

function init() {
  /* ── Sprite CSS overrides (beats styles.css !important rules) ── */
  if (!document.getElementById("sprite-overrides")) {
    const st = document.createElement("style");
    st.id = "sprite-overrides";
    st.textContent = `
      .fortress-plot.has-sprite {
        overflow: visible !important;
        background: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
        opacity: 1 !important;
        border: none !important;
      }
      .fortress-plot.has-sprite b,
      .fortress-plot.has-sprite small {
        display: none !important;
      }
      .fortress-plot.has-sprite::before {
        display: none !important;
      }
      .fortress-plot.has-sprite .fortress-plot-sprite {
        position: absolute !important;
        inset: auto auto 50% 50% !important;
        left: 50% !important;
        bottom: 50% !important;
        transform: translate(-50%, 44%) !important;
        width: 72px !important;
        height: auto !important;
        object-fit: contain !important;
        max-width: none !important;
      }
      .scene-city .fortress-plot--resource .fortress-plot-sprite {
        inset: 50% auto auto 50% !important;
        top: 50% !important;
        bottom: auto !important;
        transform: translate(-50%, -50%) !important;
        width: 78px !important;
        height: 54px !important;
        object-fit: contain !important;
        filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.4)) !important;
      }
      .scene-city .fortress-plot--grain .fortress-plot-sprite,
      .scene-city .fortress-plot--wood .fortress-plot-sprite {
        width: 88px !important;
        height: 62px !important;
      }
      .scene-city .fortress-plot--stone .fortress-plot-sprite,
      .scene-city .fortress-plot--iron .fortress-plot-sprite,
      .scene-city .fortress-plot--silver .fortress-plot-sprite {
        width: 82px !important;
        height: 58px !important;
      }
      .scene-city .fortress-plot--military .fortress-plot-sprite {
        transform: translate(-50%, 50%) !important;
        width: 44px !important;
      }
      .scene-city .fortress-plot--base .fortress-plot-sprite {
        transform: translate(-50%, 40%) !important;
        width: 62px !important;
      }
      .building-hotspot.has-sprite {
        overflow: visible !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      .building-hotspot.has-sprite .building-hotspot-sprite {
        top: auto !important;
        right: auto !important;
        width: auto;
        height: auto !important;
        object-fit: contain !important;
        max-width: none !important;
      }
    `;
    document.head.appendChild(st);
  }
  applySavedBuildingLevels();
  restoreFortressAssignments();
  state.queues = normalizeQueues(defaultState.queues, state.queues);
  state.dataVersion = DATA_VERSION;
  normalizeWoundedState(true);
  applyOfflineProduction();
  processHeroEnergy();
  processQueueCompletions();
  processMarches();
  processRallies();
  resetWeeklyIfNeeded();
  renderResources();
  renderQueueStrip();
  renderBuildings();
  renderMap();
  renderPacks();
  renderChallengePanel();
  renderInventory();
  renderMilitary();
  renderHeroEquipment();
  renderRallies();
  renderAllianceSummary();
  renderAllianceMembers();
  renderAllianceChat();
  renderAllianceFeed();
  bindNavigation();
  bindWorldMap();
  bindSceneDismiss();
  bindQueueStrip();
  bindSheet();
  bindReports();
  bindWisdom();
  bindInventory();
  bindHeroEquipment();
  bindRallies();
  bindAlliance();
  if (["city", "world", "wisdom", "inventory", "military", "hero", "alliance"].includes(initialScreen)) {
    switchTab(initialScreen);
  }
  setInterval(tickGame, 1000);
  saveState();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return mergeState(structuredClone(defaultState), JSON.parse(raw));
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, saved) {
  const selectedHeroId = heroRoster.some((hero) => hero.id === saved.selectedHeroId) ? saved.selectedHeroId : base.selectedHeroId;
  const activeEquipmentLoadout = equipmentLoadoutById(saved.activeEquipmentLoadout)?.id || base.activeEquipmentLoadout;
  const boosts = { ...base.boosts, ...(saved.boosts || {}) };
  const serverEvents = normalizeServerEvents(saved.serverEvents || base.serverEvents);
  const maxServerEventSeq = serverEvents.reduce((max, event) => Math.max(max, event.seq || 0), 0);
  delete boosts.heroEnergy;
  delete boosts.heroXp;

  const merged = {
    ...base,
    ...saved,
    selectedHeroId,
    activeEquipmentLoadout,
    heroes: mergeHeroes(base.heroes, saved.heroes, saved.boosts),
    resources: { ...base.resources, ...(saved.resources || {}) },
    wisdom: { ...base.wisdom, ...(saved.wisdom || {}) },
    buildingLevels: { ...base.buildingLevels, ...(saved.buildingLevels || {}) },
    alcazarRewardsClaimed: { ...base.alcazarRewardsClaimed, ...(saved.alcazarRewardsClaimed || {}) },
    fortressAssignments: { ...(saved.fortressAssignments || {}) },
    enemyResources: { ...base.enemyResources, ...(saved.enemyResources || {}) },
    enemyTroops: { ...base.enemyTroops, ...(saved.enemyTroops || {}) },
    enemyWounded: { ...base.enemyWounded, ...(saved.enemyWounded || {}) },
    resourceTiles: normalizeResourceTiles(saved.resourceTiles || base.resourceTiles),
    monsterStates: normalizeMonsterStates(saved.monsterStates || base.monsterStates),
    inventory: { ...base.inventory, ...(saved.inventory || {}) },
    heroEquipment: { ...base.heroEquipment, ...(saved.heroEquipment || {}) },
    allianceTreasury: { ...base.allianceTreasury, ...(saved.allianceTreasury || {}) },
    allianceHonor: Math.max(0, Math.floor(saved.allianceHonor || base.allianceHonor || 0)),
    allianceConvoys: Array.isArray(saved.allianceConvoys) ? saved.allianceConvoys.slice(0, 20) : base.allianceConvoys,
    alliancePurchases: Array.isArray(saved.alliancePurchases) ? saved.alliancePurchases.slice(0, 40) : base.alliancePurchases,
    allianceProjects: mergeAllianceProjects(base.allianceProjects, saved.allianceProjects),
    allianceMembers: mergeAllianceMembers(base.allianceMembers, saved.allianceMembers),
    queues: normalizeQueues(base.queues, saved.queues),
    productionRemainder: { ...base.productionRemainder, ...(saved.productionRemainder || {}) },
    troops: { ...base.troops, ...(saved.troops || {}) },
    woundedByTroop: { ...base.woundedByTroop, ...(saved.woundedByTroop || {}) },
    marches: Array.isArray(saved.marches) ? saved.marches : base.marches,
    worldBookmarks: normalizeWorldBookmarks(saved.worldBookmarks || base.worldBookmarks),
    rallies: Array.isArray(saved.rallies) ? saved.rallies : base.rallies,
    reports: Array.isArray(saved.reports) ? saved.reports : base.reports,
    researchLevels: { ...base.researchLevels, ...(saved.researchLevels || {}) },
    marchPresets: mergeMarchPresets(base.marchPresets, saved.marchPresets),
    boosts,
    chatMessages: mergeChatMessages(base.chatMessages, saved.chatMessages),
    allianceFeed: Array.isArray(saved.allianceFeed) ? saved.allianceFeed : base.allianceFeed,
    serverEvents,
    serverEventSequence: Math.max(maxServerEventSeq + 1, Math.floor(Number(saved.serverEventSequence || base.serverEventSequence || 1)))
  };
  return merged;
}

function normalizeQueues(baseQueues, savedQueues = {}) {
  return Object.fromEntries(
    Object.keys(baseQueues).map((type) => [type, normalizeQueue(type, savedQueues?.[type])])
  );
}

function normalizeQueue(type, queue) {
  if (!queue || typeof queue !== "object" || queue.type !== type) return null;
  if (!Number.isFinite(queue.startedAt) || !Number.isFinite(queue.finishAt) || queue.finishAt <= queue.startedAt) return null;
  let building = buildings.find((item) => item.id === queue.buildingId);
  if (isRepeatablePlotBuilding(building) && !building.isPlotInstance) {
    building = assignedInstanceForTemplate(building.id) || building;
  }
  if (!building) return null;

  const safeQueue = {
    type,
    buildingId: building.id,
    label: String(building.name || queue.label),
    startedAt: Math.max(0, Math.floor(queue.startedAt)),
    finishAt: Math.max(0, Math.floor(queue.finishAt)),
    helpApplied: Math.max(0, Math.floor(queue.helpApplied || 0)),
    payload: normalizeQueuePayload(type, queue.payload || {}, building)
  };

  if (type === "research" && !safeQueue.payload.researchId) return null;
  if ((type === "training" || type === "healing") && troopBundleCount(safeQueue.payload.troops || {}) <= 0 && !safeQueue.payload.toHeal) return null;
  if (type === "construction") normalizeConstructionQueueDuration(safeQueue, building);
  return safeQueue;
}

function normalizeConstructionQueueDuration(queue, building) {
  const now = Date.now();
  const expected = constructionDurationForBuilding(building);
  const remaining = Math.max(0, queue.finishAt - now);
  if (remaining <= expected) return;
  queue.startedAt = now;
  queue.finishAt = now + expected;
}

function normalizeQueuePayload(type, payload, building) {
  if (type === "construction") {
    return { level: nextBuildingLevel(building) };
  }

  if (type === "research") {
    const node = researchNodeById(payload.researchId);
    return node ? { researchId: node.id } : {};
  }

  if (type === "training") {
    const troops = sanitizeTroopBundle(payload.troops || {});
    const batch = troopBundleCount(troops);
    return {
      batch,
      troops,
      tier: Math.max(1, Math.min(4, Math.floor(Number(payload.tier) || troopTierLimit()))),
      troopId: troopCatalog.some((troop) => troop.id === payload.troopId) ? payload.troopId : Object.keys(troops)[0] || ""
    };
  }

  if (type === "healing") {
    const troops = sanitizeTroopBundle(payload.troops || {});
    const toHeal = Math.max(0, Math.floor(Number(payload.toHeal) || troopBundleCount(troops)));
    return { toHeal, troops };
  }

  return {};
}

function sanitizeTroopBundle(bundle = {}) {
  return Object.fromEntries(
    troopCatalog
      .map((troop) => [troop.id, Math.max(0, Math.floor(Number(bundle[troop.id]) || 0))])
      .filter(([, amount]) => amount > 0)
  );
}

function normalizeWorldBookmarks(bookmarks = []) {
  if (!Array.isArray(bookmarks)) return [];
  const seen = new Set();
  return bookmarks
    .filter((bookmark) => {
      const id = typeof bookmark === "string" ? bookmark : bookmark?.markerId;
      if (!id || seen.has(id) || !mapMarkers.some((marker) => marker.id === id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 8)
    .map((bookmark) => {
      const markerId = typeof bookmark === "string" ? bookmark : bookmark.markerId;
      const marker = markerById(markerId);
      return {
        markerId,
        name: marker.name,
        kind: marker.kind,
        coord: markerWorldCoord(marker),
        at: Number(bookmark?.at) || Date.now()
      };
    });
}

function normalizeResourceTiles(tiles = {}) {
  if (!tiles || typeof tiles !== "object") return {};
  return Object.fromEntries(
    Object.entries(tiles)
      .filter(([markerId]) => mapMarkers.some((marker) => marker.id === markerId && marker.kind === "resource"))
      .map(([markerId, tile]) => {
        const marker = markerById(markerId);
        const max = resourceTileCapacity(marker);
        const remaining = tile?.remaining === undefined ? max : Math.min(max, Math.max(0, Math.floor(Number(tile.remaining) || 0)));
        const updatedAt = Math.max(0, Math.floor(Number(tile?.updatedAt) || Date.now()));
        return [markerId, { remaining, max, updatedAt }];
      })
  );
}

function normalizeMonsterStates(monsters = {}) {
  if (!monsters || typeof monsters !== "object") return {};
  return Object.fromEntries(
    Object.entries(monsters)
      .filter(([markerId]) => mapMarkers.some((marker) => marker.id === markerId && marker.kind === "monster"))
      .map(([markerId, saved]) => {
        const marker = markerById(markerId);
        const max = monsterMaxHealth(marker);
        const health = saved?.health === undefined ? max : Math.min(max, Math.max(0, Math.floor(Number(saved.health) || 0)));
        return [
          markerId,
          {
            health,
            max,
            defeatedUntil: Math.max(0, Math.floor(Number(saved?.defeatedUntil) || 0)),
            updatedAt: Math.max(0, Math.floor(Number(saved?.updatedAt) || Date.now()))
          }
        ];
      })
  );
}

function createDefaultHeroes() {
  const now = Date.now();
  return Object.fromEntries(
    heroRoster.map((hero) => [
      hero.id,
      {
        xp: 0,
        energy: HERO_BASE_ENERGY,
        lastEnergyAt: now
      }
    ])
  );
}

function mergeHeroes(base, savedHeroes = {}, legacyBoosts = {}) {
  const now = Date.now();
  const merged = Object.fromEntries(
    heroRoster.map((hero) => {
      const savedHero = savedHeroes?.[hero.id] || {};
      return [
        hero.id,
        {
          ...base[hero.id],
          ...savedHero,
          xp: Math.max(0, Number(savedHero.xp ?? base[hero.id]?.xp ?? 0)),
          energy: Math.max(0, Number(savedHero.energy ?? base[hero.id]?.energy ?? HERO_BASE_ENERGY)),
          lastEnergyAt: Number(savedHero.lastEnergyAt || now)
        }
      ];
    })
  );

  return merged;
}

function mergeMarchPresets(base, saved = {}) {
  return Object.fromEntries(
    Object.entries(base).map(([kind, preset]) => {
      const savedPreset = saved?.[kind];
      if (!savedPreset) return [kind, { ...preset, percentages: { ...preset.percentages } }];
      const percentages = sanitizeDoctrinePercentages(
        savedPreset.percentages || fixedTroopsToPercentages(savedPreset.troops || {}, 300)
      );
      return [
        kind,
        {
          ...preset,
          ...savedPreset,
          percentages,
          withHero: kind === "monster" || Boolean(savedPreset.withHero)
        }
      ];
    })
  );
}

function fixedTroopsToPercentages(troops = {}, capacity = 1) {
  const safeCapacity = Math.max(1, capacity || 1);
  return Object.fromEntries(
    Object.entries(troops || {}).map(([id, amount]) => [
      id,
      Math.min(100, Math.max(0, Math.round((Math.max(0, amount || 0) / safeCapacity) * 100)))
    ])
  );
}

function sanitizeDoctrinePercentages(percentages = {}) {
  return compactPercentages(
    Object.fromEntries(
      troopCatalog.map((troop) => [
        troop.id,
        Math.min(100, Math.max(0, Math.round(Number(percentages?.[troop.id] || 0))))
      ])
    )
  );
}

function compactPercentages(percentages = {}) {
  return Object.fromEntries(
    Object.entries(percentages)
      .map(([id, value]) => [id, Math.min(100, Math.max(0, Math.round(value || 0)))])
      .filter(([, value]) => value > 0)
  );
}

function mergeChatMessages(base, saved = {}) {
  return {
    alliance: Array.isArray(saved?.alliance) ? saved.alliance : base.alliance,
    kingdom: Array.isArray(saved?.kingdom) ? saved.kingdom : base.kingdom
  };
}

function normalizeServerEvents(events = []) {
  if (!Array.isArray(events)) return [];
  return events
    .map((event, index) => {
      if (!event || typeof event !== "object" || !event.type) return null;
      const at = Math.max(0, Math.floor(Number(event.at) || Date.now()));
      const seq = Math.max(1, Math.floor(Number(event.seq) || index + 1));
      const detail = event.detail && typeof event.detail === "object" ? event.detail : {};
      return {
        id: String(event.id || `evt-${seq}`),
        seq,
        type: String(event.type).slice(0, 48),
        at,
        actor: String(event.actor || "local-player"),
        realm: String(event.realm || "reino-1"),
        alliance: String(event.alliance || "OD"),
        status: String(event.status || "pending-backend"),
        summary: String(event.summary || serverEventSummary(event.type, detail)).slice(0, 140),
        detail
      };
    })
    .filter(Boolean)
    .slice(-SERVER_EVENT_LIMIT);
}

function mergeAllianceMembers(baseMembers = [], savedMembers = []) {
  if (!Array.isArray(savedMembers)) return baseMembers;
  const byId = new Map(baseMembers.map((member) => [member.id, member]));
  savedMembers.forEach((member) => {
    if (!member || typeof member !== "object" || !member.id || member.id === "player") return;
    byId.set(member.id, {
      id: String(member.id),
      name: String(member.name || member.id),
      rank: String(member.rank || "R1"),
      role: String(member.role || "Miembro"),
      power: Math.max(0, Math.floor(member.power || 0)),
      helps: Math.max(0, Math.floor(member.helps || 0)),
      donated: Math.max(0, Math.floor(member.donated || 0)),
      status: ["online", "away", "offline"].includes(member.status) ? member.status : "offline",
      markerId: member.markerId || null
    });
  });
  return [...byId.values()];
}

function mergeAllianceProjects(baseProjects = {}, savedProjects = {}) {
  return Object.fromEntries(
    allianceProjectCatalog.map((project) => [
      project.id,
      Math.min(project.max, Math.max(0, Math.floor(Number(savedProjects?.[project.id] ?? baseProjects[project.id] ?? 0))))
    ])
  );
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recordServerEvent(type, detail = {}) {
  if (!type || !state) return null;
  if (!state.serverEvents) state.serverEvents = [];
  const seq = Math.max(1, Math.floor(Number(state.serverEventSequence) || 1));
  const safeDetail = cloneForSnapshot(detail || {});
  const event = {
    id: `evt-${seq}`,
    seq,
    type,
    at: Date.now(),
    actor: "local-player",
    realm: "reino-1",
    alliance: "OD",
    status: "pending-backend",
    summary: serverEventSummary(type, safeDetail),
    detail: safeDetail
  };
  state.serverEvents = [...state.serverEvents, event].slice(-SERVER_EVENT_LIMIT);
  state.serverEventSequence = seq + 1;
  return event;
}

function serverEventSummary(type, detail = {}) {
  const labels = {
    "queue.start": "Cola iniciada",
    "queue.complete": "Cola completada",
    "alcazar.reward": "Premio del Alcazar",
    "march.start": "Marcha enviada",
    "march.cancel": "Marcha cancelada",
    "march.resolve": "Marcha resuelta",
    "chat.send": "Chat enviado",
    "wisdom.claim": "Paquete reclamado",
    "forge.item": "Equipo forjado",
    "forge.combine": "Piezas combinadas",
    "alliance.convoy": "Convoy enviado",
    "alliance.shop": "Compra de alianza",
    "alliance.project": "Proyecto de alianza",
    "scout.target": "Espionaje realizado"
  };
  const subject = detail.targetName || detail.packName || detail.itemName || detail.projectName || detail.label || detail.channel || detail.queueType || "";
  return `${labels[type] || type}${subject ? `: ${subject}` : ""}`;
}

function applySavedBuildingLevels() {
  buildings.forEach((building) => {
    const savedLevel = state.buildingLevels[building.id];
    if (Number.isFinite(savedLevel)) building.level = clampBuildingLevel(savedLevel);
    state.buildingLevels[building.id] = building.level;
  });
}

function restoreFortressAssignments() {
  for (let index = buildings.length - 1; index >= 0; index -= 1) {
    if (buildings[index].isPlotInstance) buildings.splice(index, 1);
  }

  fortressPlots.forEach((plot) => {
    if (initialFortressAssignments[plot.id]) {
      plot.buildingId = initialFortressAssignments[plot.id];
      return;
    }
    delete plot.buildingId;
  });

  Object.entries(state.fortressAssignments || {}).forEach(([plotId, assignment]) => {
    const plot = fortressPlots.find((item) => item.id === plotId);
    if (!plot) return;

    const assignmentId = typeof assignment === "string" ? assignment : assignment?.buildingId;
    const templateId = typeof assignment === "string" ? assignment : assignment?.templateId;
    if (["resource", "military"].includes(plot.zone)) {
      const existing = buildings.find((item) => item.id === assignmentId && item.isPlotInstance);
      if (existing) {
        plot.buildingId = existing.id;
        return;
      }
      const template = buildings.find((item) => item.id === templateId || item.id === assignmentId);
      if (!template) return;
      const savedLevel = state.buildingLevels?.[`${template.id}--${plot.id}`];
      const instance = createPlotBuildingInstance(template, plot);
      if (Number.isFinite(savedLevel)) {
        instance.level = clampBuildingLevel(savedLevel);
        state.buildingLevels[instance.id] = instance.level;
      }
      plot.buildingId = instance.id;
      state.fortressAssignments[plot.id] = {
        buildingId: instance.id,
        templateId: template.id
      };
      return;
    }
    const building = buildings.find((item) => item.id === assignmentId);
    if (building) {
      plot.buildingId = building.id;
      return;
    }

    const template = buildings.find((item) => item.id === templateId);
    if (!template) return;
    const instance = createPlotBuildingInstance(template, plot);
    const savedLevel = state.buildingLevels[instance.id];
    if (Number.isFinite(savedLevel)) instance.level = clampBuildingLevel(savedLevel);
    state.buildingLevels[instance.id] = instance.level;
    plot.buildingId = instance.id;
  });
}

function visibleCityBuildings() {
  const assignedIds = new Set(
    fortressPlots
      .map((plot) => plot.buildingId)
      .filter(Boolean)
  );
  return buildings.filter((building) => assignedIds.has(building.id));
}

function availableBuildingsForPlot(plot) {
  const assignedIds = new Set(
    fortressPlots
      .map((item) => item.buildingId)
      .filter(Boolean)
  );

  return buildings.filter((building) => {
    if (!["resource", "military"].includes(plot.zone) && assignedIds.has(building.id)) return false;

    if (plot.zone === "resource") {
      if (building.kind !== "resource") return false;
      return buildings.findIndex((item) => item.kind === "resource" && item.resource === building.resource) === buildings.indexOf(building);
    }
    if (plot.zone === "military") {
      if (building.kind !== "barracks" && building.kind !== "hospital") return false;
      return buildings.findIndex((item) => item.kind === building.kind) === buildings.indexOf(building);
    }
    if (plot.zone === "base") {
      return !["alcazar", "academia", "muralla"].includes(building.id) && building.kind !== "resource" && building.kind !== "barracks" && building.kind !== "hospital";
    }
    return false;
  });
}

function instanceNameForPlot(template, plot) {
  const baseName = template.resource ? template.name.replace(/\s+[IVX]+$/u, "").trim() : template.name;
  return baseName;
}

function createPlotBuildingInstance(template, plot) {
  const building = {
    ...template,
    id: `${template.id}--${plot.id}`,
    x: plot.x,
    y: plot.y,
    level: 1,
    name: instanceNameForPlot(template, plot),
    status: template.kind === "resource" ? `+${resourceProductionRate({ ...template, level: 1 })}/h` : template.status,
    bonus: template.kind === "resource"
      ? `+${resourceProductionRate({ ...template, level: 1 })} ${resourceName(template.resource).toLowerCase()}/h`
      : template.bonus,
    body: template.body,
    cost: { ...(template.cost || {}) },
    templateId: template.id,
    plotId: plot.id,
    isPlotInstance: true
  };
  buildings.push(building);
  state.buildingLevels[building.id] = building.level;
  return building;
}

function assignBuildingToPlot(plotId, buildingId) {
  const plot = fortressPlots.find((item) => item.id === plotId);
  const building = buildings.find((item) => item.id === buildingId);
  if (!plot || !building || plot.buildingId) return false;

  const targetBuilding = ["resource", "military"].includes(plot.zone)
    ? createPlotBuildingInstance(building, plot)
    : building;

  plot.buildingId = targetBuilding.id;
  state.fortressAssignments[plot.id] = {
    buildingId: targetBuilding.id,
    templateId: targetBuilding.templateId || targetBuilding.id
  };
  state.buildingLevels[targetBuilding.id] = targetBuilding.level;
  saveState();
  return true;
}

function activeResourceBuildings() {
  return visiblePlotBuildings("resource");
}

function visiblePlotBuildings(kind = null) {
  const assignedIds = new Set(
    fortressPlots
      .map((plot) => plot.buildingId)
      .filter(Boolean)
  );
  return buildings.filter((building) => assignedIds.has(building.id) && (!kind || building.kind === kind));
}

function clampBuildingLevel(level) {
  return Math.min(BUILDING_MAX_LEVEL, Math.max(1, Math.floor(Number(level) || 1)));
}

function buildingIsMaxLevel(building) {
  return building.level >= BUILDING_MAX_LEVEL;
}

function nextBuildingLevel(building) {
  return Math.min(BUILDING_MAX_LEVEL, building.level + 1);
}

function buildingBaseId(building) {
  return building?.templateId || building?.id || "";
}

function requirementLabel(requirement) {
  if (requirement.resource) return `${resourceName(requirement.resource)} Nv. ${requirement.level}`;
  const building = buildings.find((item) => item.id === requirement.id || item.templateId === requirement.id);
  const name = building?.name?.replace(/\s+[IVX]+$/u, "").trim() || requirement.id;
  return `${name} Nv. ${requirement.level}`;
}

function requirementCandidates(requirement) {
  const visible = visibleCityBuildings();
  if (requirement.resource) {
    return visible.filter((building) => building.kind === "resource" && building.resource === requirement.resource);
  }
  return visible.filter((building) => buildingBaseId(building) === requirement.id || building.id === requirement.id);
}

function requirementProgress(requirement) {
  const current = requirementCandidates(requirement).reduce((max, building) => Math.max(max, building.level || 0), 0);
  return {
    ...requirement,
    label: requirementLabel(requirement),
    current,
    met: current >= requirement.level
  };
}

function buildingUpgradeRequirements(building) {
  if (!building || buildingIsMaxLevel(building)) return [];
  const targetLevel = nextBuildingLevel(building);
  const requirements = [];
  const alcazar = buildings.find((item) => item.id === "alcazar");

  if (building.id === "alcazar") {
    requirements.push(...(ALCAZAR_UPGRADE_REQUIREMENTS[targetLevel] || []));
  } else if (alcazar) {
    requirements.push({
      id: "alcazar",
      level: targetLevel,
      labelOverride: `Alcazar Real Nv. ${targetLevel}`
    });
  }

  return requirements.map((requirement) => {
    if (!requirement.labelOverride) return requirementProgress(requirement);
    const current = requirementCandidates(requirement).reduce((max, item) => Math.max(max, item.level || 0), 0);
    return {
      ...requirement,
      label: requirement.labelOverride,
      current,
      met: current >= requirement.level
    };
  });
}

function buildingUpgradeCheck(building) {
  if (!building) return { ok: false, reason: "Edificio no encontrado.", requirements: [] };
  if (buildingIsMaxLevel(building)) {
    return { ok: false, reason: `${building.name} ya esta en el nivel maximo ${BUILDING_MAX_LEVEL}.`, requirements: [] };
  }
  const requirements = buildingUpgradeRequirements(building);
  const missing = requirements.filter((requirement) => !requirement.met);
  if (missing.length) {
    return {
      ok: false,
      reason: `Faltan requisitos: ${missing.map((requirement) => `${requirement.label} (${requirement.current}/${requirement.level})`).join(", ")}.`,
      requirements
    };
  }
  return { ok: true, reason: "", requirements };
}

function renderUpgradeRequirements(building) {
  const check = buildingUpgradeCheck(building);
  if (!check.requirements.length) return "";
  return `
    <div class="upgrade-requirements">
      <strong>Requisitos nivel ${nextBuildingLevel(building)}</strong>
      <div>
        ${check.requirements
          .map((requirement) => `
            <span class="${requirement.met ? "is-met" : "is-missing"}">
              ${requirement.met ? "OK" : "Falta"} ${requirement.label}
              <small>${requirement.current}/${requirement.level}</small>
            </span>
          `)
          .join("")}
      </div>
    </div>
  `;
}

function buildingLevelCost(building) {
  if (buildingIsMaxLevel(building)) return {};
  const baseCost = building.cost || {};
  const level = nextBuildingLevel(building);
  const tierPressure = 1 + Math.max(0, level - 2) ** 1.35 * 0.18;
  const rolePressure = building.kind === "resource" ? 0.86 : building.kind === "storage" ? 1.16 : 1;
  return Object.fromEntries(
    Object.entries(baseCost).map(([resource, value]) => [resource, roundBuildingCost(value * tierPressure * rolePressure)])
  );
}

function roundBuildingCost(value) {
  if (value >= 10000) return Math.ceil(value / 500) * 500;
  if (value >= 2500) return Math.ceil(value / 100) * 100;
  return Math.ceil(value / 25) * 25;
}

function applyOfflineProduction() {
  const now = Date.now();
  const last = Number(state.lastProductionAt) || now;
  const elapsedMs = Math.max(0, Math.min(now - last, 8 * 60 * 60 * 1000));
  const hours = elapsedMs / 3600000;
  if (hours <= 0) {
    state.lastProductionAt = now;
    return false;
  }

  let changed = false;
  const rates = {};
  activeResourceBuildings()
    .forEach((building) => {
      rates[building.resource] = (rates[building.resource] || 0) + resourceProductionRate(building);
    });

  Object.entries(rates).forEach(([resource, rate]) => {
    const raw = (state.productionRemainder[resource] || 0) + rate * hours;
    const amount = Math.floor(raw);
    state.productionRemainder[resource] = raw - amount;
    if (amount <= 0) return;

    const cap = resourceCapacity(resource);
    const before = state.resources[resource] || 0;
    const next = Math.min(cap, before + amount);
    state.resources[resource] = next;
    if (next !== before) changed = true;
    if (next >= cap) state.productionRemainder[resource] = 0;
  });
  state.lastProductionAt = now;
  return changed;
}

function getWeekKey(date) {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, "0")}-${String(copy.getDate()).padStart(2, "0")}`;
}

function resetWeeklyIfNeeded() {
  const key = getWeekKey(new Date());
  if (state.wisdom.weekKey !== key) {
    state.wisdom.weekKey = key;
    state.wisdom.claimed = 0;
  }
}

function formatNumber(value) {
  return Intl.NumberFormat("es-ES", {
    notation: value >= 100000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderResources() {
  resourceStrip.innerHTML = resources
    .map((resource) => {
      const value = state.resources[resource.id] ?? 0;
      const cap = resourceCapacity(resource.id);
      const fill = Math.min(100, Math.max(0, (value / cap) * 100));
      return `
        <div class="resource-chip" title="${resource.name}: ${formatNumber(value)} / ${formatNumber(cap)}">
          <i class="resource-dot" style="color:${resource.color}; background:${resource.color}"></i>
          <span>${formatNumber(value)}</span>
          <b>${formatNumber(cap)}</b>
          <em style="--fill:${fill}%"></em>
        </div>
      `;
    })
    .join("");
  powerValue.textContent = formatNumber(state.power);
  renderHeroAccess();
}

function renderHeroAccess() {
  const hero = heroById();
  const info = heroLevelInfo(hero.id);
  if (heroAccessImage) {
    heroAccessImage.src = hero.portrait;
    heroAccessImage.alt = hero.name;
  }
  if (heroAccessLevel) heroAccessLevel.textContent = String(info.level);
  if (heroAccessName) heroAccessName.textContent = hero.name;
}

function tickGame() {
  const produced = applyOfflineProduction();
  const heroesChanged = processHeroEnergy();
  const changed = processQueueCompletions();
  const marchesChanged = processMarches();
  const ralliesChanged = processRallies();
  const liveSheetRefresh = sheet.classList.contains("is-open") && ["worldMarch", "rally"].includes(activeSheetMode);
  renderQueueStrip();
  if (state.marches.length || state.rallies.length || currentTab === "world") renderMap();
  if ((state.marches.length || state.rallies.length) && currentTab === "military") renderMilitary();
  if (changed || produced || marchesChanged || ralliesChanged || heroesChanged) {
    renderResources();
    renderBuildings();
    renderInventory();
    renderMilitary();
    renderHeroEquipment();
    renderRallies();
    renderAllianceSummary();
    renderAllianceMembers();
    renderMap();
    renderAllianceFeed();
    if (changed || marchesChanged || ralliesChanged || liveSheetRefresh) refreshOpenSheet();
    saveState();
  } else if (liveSheetRefresh) {
    refreshOpenSheet();
  }
}

function renderQueueStrip() {
  const queues = Object.values(state.queues).filter(Boolean);
  if (currentTab !== "city" || !queues.length) {
    queueStrip.innerHTML = "";
    return;
  }

  const now = Date.now();
  queueStrip.innerHTML = queues
    .map((queue) => {
      const total = Math.max(1, queue.finishAt - queue.startedAt);
      const remaining = Math.max(0, queue.finishAt - now);
      const progress = Math.min(100, Math.max(0, ((total - remaining) / total) * 100));
      const speedItems = compatibleSpeedItems(queue.type);
      const helps = Math.max(0, Math.floor(queue.helpApplied || 0));
      const helpLimit = allianceHelpLimit();
      return `
        <div class="queue-bar">
          <i class="queue-bar-fill" style="--progress:${progress}%"></i>
          <span class="queue-bar-name">${queue.label}</span>
          <strong class="queue-bar-time">${formatDuration(remaining)}</strong>
          
          
          <div class="queue-bar-actions">
            ${
              speedItems.length
                ? speedItems
                    .slice(0, 2)
                    .map(
                      ({ id, item, quantity }) =>
                        `<button class="queue-speed" type="button" data-queue-speed="${id}" data-queue-type="${queue.type}">${speedLabel(item)} x${quantity}</button>`
                    )
                    .join("")
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
}

function bindQueueStrip() {
  queueStrip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-queue-speed]");
    if (!button) return;
    useQueueSpeedItem(button.dataset.queueSpeed, button.dataset.queueType);
  });
}

function renderMilitaryLegacy() {
  const total = totalTroops();
  const marching = marchingTroopCount();
  const available = total - marching;
  const slots = marchSlots();

  militarySummary.innerHTML = `
    <div><span>Disponibles</span><strong>${formatNumber(available)}</strong></div>
    <div><span>Marchas</span><strong>${state.marches.length}/${slots}</strong></div>
    <div><span>Carga</span><strong>${formatNumber(totalTroopLoad())}</strong></div>
  `;

  troopGrid.innerHTML = troopCatalog
    .map((troop) => {
      const owned = state.troops[troop.id] || 0;
      const reserved = reservedTroops()[troop.id] || 0;
      return `
        <div class="troop-card">
          <span>${troop.role}</span>
          <strong>${troop.name}: ${formatNumber(owned - reserved)} / ${formatNumber(owned)}</strong>
          <p>Ataque ${troopAttack(troop)} Â· Defensa ${troopDefense(troop)} Â· Carga ${troop.load}</p>
          <p>${troop.description}</p>
          <small class="troop-tier-note">${troopTierName(troopTierLimit())}</small>
        </div>
      `;
    })
    .join("");

  appendTroopTierNotes();
  renderReports();

  if (!state.marches.length) {
    marchList.innerHTML = `<div class="empty-inventory">No hay marchas activas. Abre Mundo y elige un objetivo para enviar tropas.</div>`;
    return;
  }

  const now = Date.now();
  marchList.innerHTML = state.marches
    .map((march) => {
      const totalMs = Math.max(1, march.arriveAt - march.startedAt);
      const remaining = Math.max(0, march.arriveAt - now);
      const progress = Math.min(100, Math.max(0, ((totalMs - remaining) / totalMs) * 100));
      return `
        <div class="march-card">
          <span>${march.phase === "outbound" ? "Ida" : "Regreso"} Â· ${marchKindName(march.kind)}</span>
          <strong>${march.targetName} Â· ${formatDuration(remaining)}</strong>
          <p>${formatTroopBundle(march.troops)}</p>
          <div class="march-progress"><i style="--progress:${progress}%"></i></div>
        </div>
      `;
    })
    .join("");
}

function renderMilitary() {
  const total = totalTroops();
  const marching = marchingTroopCount();
  const available = total - marching;
  const slots = marchSlots();
  const power = armyPowerTotals(state.troops);
  const bedsUsed = hospitalBedsUsed();
  const bedsTotal = totalHospitalCapacity();

  militarySummary.innerHTML = `
    <div><span>Disponibles</span><strong>${formatNumber(available)}</strong></div>
    <div><span>Marchas</span><strong>${state.marches.length}/${slots}</strong></div>
    <div><span>Carga</span><strong>${formatNumber(totalTroopLoad())}</strong></div>
    <div><span>Ataque</span><strong>${formatNumber(power.attack)}</strong></div>
    <div><span>Defensa</span><strong>${formatNumber(power.defense)}</strong></div>
    <div><span>Hospital</span><strong>${formatNumber(bedsUsed)} / ${formatNumber(bedsTotal)}</strong></div>
  `;

  renderCombatLedger();

  troopGrid.innerHTML = troopCatalog
    .map((troop) => {
      const owned = state.troops[troop.id] || 0;
      const reserved = reservedTroops()[troop.id] || 0;
      return `
        <div class="troop-card">
          <span>${troop.role}</span>
          <strong>${troop.name}: ${formatNumber(owned - reserved)} / ${formatNumber(owned)}</strong>
          <p>Ataque ${troopAttack(troop)} Â· Defensa ${troopDefense(troop)} Â· Carga ${troop.load}</p>
          <p>${troop.description}</p>
        </div>
      `;
    })
    .join("");

  appendTroopTierNotes();
  renderReports();

  if (!state.marches.length) {
    marchList.innerHTML = `<div class="empty-inventory">No hay marchas activas. El seguimiento de movimientos se hace en Mundo.</div>`;
    return;
  }

  const now = Date.now();
  marchList.innerHTML = state.marches
    .map((march) => {
      const totalMs = Math.max(1, march.arriveAt - march.startedAt);
      const remaining = Math.max(0, march.arriveAt - now);
      const progress = Math.min(100, Math.max(0, ((totalMs - remaining) / totalMs) * 100));
      return `
        <div class="march-card">
          <span>${marchPhaseName(march.phase)} Â· ${marchKindName(march.kind)}</span>
          <strong>${march.targetName} Â· vuelve en ${formatDuration(timeUntilHome(march))}</strong>
          <p>${marchCompositionText(march)}</p>
          <div class="march-progress"><i style="--progress:${progress}%"></i></div>
        </div>
      `;
    })
    .join("");
}

function renderCombatLedger() {
  if (!combatLedger) return;
  const city = armyCombatBreakdown(state.troops, { includeWall: true });
  const field = armyCombatBreakdown(availableTroops(), { includeWall: false });
  const bonuses = combatBonusBreakdown();
  const wounded = woundedTroopTotal();
  const currentTier = troopTierLimit();

  combatLedger.innerHTML = `
    <div class="combat-ledger-head">
      <div>
        <span>Estado militar</span>
        <strong>Poder de combate</strong>
      </div>
      <small>La muralla protege el castillo; no viaja en marchas.</small>
    </div>
    <div class="combat-ledger-grid">
      <div>
        <span>Ataque total</span>
        <strong>${formatNumber(city.attack)}</strong>
        <small>Tropas + cuarteles + equipo</small>
      </div>
      <div>
        <span>Ataque disponible</span>
        <strong>${formatNumber(field.attack)}</strong>
        <small>Sin tropas reservadas</small>
      </div>
      <div>
        <span>Defensa ciudad</span>
        <strong>${formatNumber(city.defense)}</strong>
        <small>Tropas + hospitales + muralla</small>
      </div>
      <div>
        <span>Heridos</span>
        <strong>${formatNumber(wounded)}</strong>
        <small>${formatNumber(hospitalBedsFree())} camas libres</small>
      </div>
      <div>
        <span>Nivel de tropa</span>
        <strong>${troopTierName(currentTier)}</strong>
        <small>${nextTroopTierText()}</small>
      </div>
      <div>
        <span>Veterania</span>
        <strong>Tropas Veteranas Nv. ${researchLevel("troop-tier")}</strong>
        <small>Academia mejora el ejercito completo</small>
      </div>
    </div>
    <div class="combat-source-list">
      ${renderCombatSource("Cuarteles", bonuses.attack.barracks, "ataque de tropas")}
      ${renderCombatSource("Piezas de ataque", bonuses.attack.gearPieces, "equipo individual")}
      ${renderCombatSource("Conjunto de ataque", bonuses.attack.gearSet, "bonus de set activo")}
      ${renderCombatSource("Investigacion de forja", bonuses.attack.gearResearch, "ataque por academia")}
      ${renderCombatSource("Hospitales", bonuses.defense.hospitals, "defensa de ciudad")}
      ${renderCombatSource("Muralla", bonuses.defense.wall, "defensa al recibir ataques")}
      ${renderCombatSource("Investigacion defensiva", bonuses.defense.research, "muralla y guarnicion")}
      ${renderCombatSource("Piezas defensivas", bonuses.defense.gearPieces, "equipo individual")}
      ${renderCombatSource("Conjunto defensivo", bonuses.defense.gearSet, "bonus de set activo")}
      ${renderCombatSource("Investigacion defensiva de forja", bonuses.defense.gearResearch, "defensa por academia")}
      ${renderCombatSource("Heroe al mando", heroCommandAttackBonus(), "solo en marchas con heroe")}
      ${renderCombatSource("Heroe contra monstruos", heroMonsterAttackBonus(), "solo si acompana al heroe")}
    </div>
    ${renderCombatRulesAudit()}
  `;
}

function renderCombatSource(label, value, detail) {
  return `
    <div>
      <span>${label}</span>
      <strong>+${formatNumber(value)}%</strong>
      <small>${detail}</small>
    </div>
  `;
}

function renderCombatRulesAudit() {
  const audit = buildCombatAuditScenarios();
  return `
    <div class="combat-audit-head">
      <span>Pruebas de combate</span>
      <strong>Calculo activo</strong>
      <small>Usa ${audit.sourceLabel}; las cifras salen del mismo motor que resuelve ataques, monstruos y rallies.</small>
    </div>
    <div class="combat-audit-list">
      ${renderCombatAuditCard(audit.noHero)}
      ${renderCombatAuditCard(audit.withHero)}
      ${renderCombatAuditCard(audit.monster)}
      ${renderCombatAuditCard(audit.rally)}
      ${renderCombatAuditCard(audit.counterGood)}
      ${renderCombatAuditCard(audit.counterBad)}
      ${renderCombatAuditCard(audit.cityDefense)}
    </div>
  `;
}

function renderCombatAuditCard(entry) {
  const bonusLabel = entry.metric === "defense" ? "Defensa" : "Ataque";
  return `
    <div class="combat-audit-card">
      <span>${entry.label}</span>
      <strong>${formatNumber(entry.value)}</strong>
      <small>${entry.detail}</small>
      <em>${bonusLabel} ${signedPercent(entry.bonus)}</em>
    </div>
  `;
}

function buildCombatAuditScenarios() {
  const actualMarchTroops = maxMarchTroops({ kind: "enemy" });
  const hasActualTroops = troopBundleCount(actualMarchTroops) > 0;
  const marchTroops = hasActualTroops ? actualMarchTroops : combatAuditSampleTroops();
  const defenderTroops = { pikemen: 140, musketeers: 120, cavalry: 130 };
  const noHero = armyCombatBreakdown(marchTroops, {
    includeWall: false,
    targetKind: "enemy",
    defenderTroops,
    withHero: false
  });
  const withHero = armyCombatBreakdown(marchTroops, {
    includeWall: false,
    targetKind: "enemy",
    defenderTroops,
    withHero: true
  });
  const monster = armyCombatBreakdown(marchTroops, {
    includeWall: false,
    targetKind: "monster",
    withHero: true
  });
  const rally = armyCombatBreakdown(marchTroops, {
    includeWall: false,
    targetKind: "enemy",
    defenderTroops,
    withHero: true,
    isRally: true
  });
  const counterGood = armyCombatBreakdown({ pikemen: 120 }, {
    includeWall: false,
    targetKind: "enemy",
    defenderTroops: { cavalry: 120 },
    withHero: false
  });
  const counterBad = armyCombatBreakdown({ cavalry: 120 }, {
    includeWall: false,
    targetKind: "enemy",
    defenderTroops: { pikemen: 120 },
    withHero: false
  });
  const cityDefense = armyCombatBreakdown(state.troops, { includeWall: true });

  return {
    sourceLabel: hasActualTroops ? "tu marcha maxima disponible" : "una muestra tecnica de tropas",
    marchTroops,
    noHero: combatAuditEntry("Marcha sin heroe", noHero, `Base ${formatNumber(noHero.troopAttack)} - ${noHero.counter.label}`),
    withHero: combatAuditEntry(
      "Marcha con heroe",
      withHero,
      `Heroe ${signedPercent(withHero.heroCommandBonus)} - diferencia ${formatNumber(Math.max(0, withHero.attack - noHero.attack))}`
    ),
    monster: combatAuditEntry("Caza monstruo", monster, `Bonus monstruos ${signedPercent(monster.monsterBonus)} con heroe`),
    rally: combatAuditEntry("Rally alianza", rally, `Rally ${signedPercent(rally.rallyBonus)} incluido`),
    counterGood: combatAuditEntry("Counter favorable", counterGood, counterGood.counter.label),
    counterBad: combatAuditEntry("Counter malo", counterBad, counterBad.counter.label),
    cityDefense: combatAuditEntry("Defensa ciudad", cityDefense, `Muralla incluida ${signedPercent(wallDefenseBonus())}`, "defense")
  };
}

function combatAuditEntry(label, breakdown, detail, metric = "attack") {
  return {
    label,
    metric,
    value: metric === "defense" ? breakdown.defense : breakdown.attack,
    bonus: metric === "defense" ? breakdown.defenseBonus : breakdown.attackBonus,
    detail,
    counterBonus: breakdown.counterBonus || 0,
    heroBonus: breakdown.heroCommandBonus || 0,
    monsterBonus: breakdown.monsterBonus || 0,
    rallyBonus: breakdown.rallyBonus || 0
  };
}

function combatAuditSampleTroops() {
  return { pikemen: 140, musketeers: 120, cavalry: 110 };
}

function appendTroopTierNotes() {
  troopGrid.querySelectorAll(".troop-card").forEach((card, index) => {
    const troop = troopCatalog[index];
    if (troop && !card.querySelector(".troop-stat-bars")) {
      card.append(createTroopStatBars(troop));
    }
    if (card.querySelector(".troop-tier-note")) return;
    const note = document.createElement("small");
    note.className = "troop-tier-note";
    note.textContent = troopTierName(troopTierLimit());
    card.append(note);
  });
}

function createTroopStatBars(troop) {
  const wrapper = document.createElement("div");
  wrapper.className = "troop-stat-bars";
  const stats = [
    { label: "Ataque", value: troopAttack(troop), max: troopMaxAttackReference() },
    { label: "Defensa", value: troopDefense(troop), max: troopMaxDefenseReference() },
    { label: "Carga", value: troop.load, max: troopMaxLoadReference() }
  ];
  wrapper.innerHTML = `
    ${stats
      .map(
        (stat) => `
          <div>
            <span>${stat.label}</span>
            <strong>${formatNumber(stat.value)}</strong>
            <i style="--bar:${Math.min(100, Math.round((stat.value / Math.max(1, stat.max)) * 100))}%"></i>
          </div>
        `
      )
      .join("")}
    <small>${troopUseHint(troop)}</small>
  `;
  return wrapper;
}

function createQueue(type, building, durationMs, payload, label) {
  state.queues[type] = {
    type,
    buildingId: building.id,
    label,
    startedAt: Date.now(),
    finishAt: Date.now() + durationMs,
    helpApplied: 0,
    payload
  };
  recordServerEvent("queue.start", {
    queueType: type,
    buildingId: building.id,
    buildingName: building.name,
    label,
    durationMs,
    payload
  });
  renderQueueStrip();
}

function renderReports() {
  if (!reportList) return;
  const reports = state.reports || [];
  if (!reports.length) {
    reportList.innerHTML = `<div class="empty-inventory">Todavia no hay informes. Envia marchas desde Mundo para generar resultados.</div>`;
    return;
  }

  reportList.innerHTML = `
    <div class="report-head">
      <span>Informes</span>
      <strong>${reports.length}</strong>
    </div>
    ${reports
      .slice(0, 8)
      .map(
        (report) => `
          <button class="report-card report-card--${report.kind}" type="button" data-report="${report.id}">
            <div>
              <span>${marchKindName(report.kind)} Â· ${formatReportTime(report.createdAt)}</span>
              <strong>${report.targetName}</strong>
              <p>${report.summary}</p>
            </div>
            <small>${reportBadge(report)}</small>
          </button>
        `
      )
      .join("")}
  `;
}

function openReport(id) {
  const report = (state.reports || []).find((item) => item.id === id);
  if (!report) return;
  activeSheetMode = "report";
  activeReportId = id;
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeRallyId = null;
  const isScout = report.kind === "scout";
  const targetMarker = reportTargetMarker(report);
  const coordLabel = reportTargetCoordLabel(report, targetMarker);

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${report.targetName}</h2>
        <p>${marchKindName(report.kind)} ${report.kind === "scout" ? "recibido" : "resuelta"} a las ${formatReportTime(report.createdAt)}.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Tipo</span><strong>${marchKindName(report.kind)}</strong></div>
      <div><span>Mando</span><strong>${reportCommander(report)}</strong></div>
      ${coordLabel ? `<div><span>Coords</span><strong>${coordLabel}</strong></div>` : ""}
      ${
        isScout
          ? `<div><span>Riesgo</span><strong>${report.scout?.risk || "--"}</strong></div>`
          : `<div><span>Heridos</span><strong>${formatNumber(report.wounded || 0)}</strong></div>`
      }
    </div>
    ${renderScoutReport(report)}
    ${renderCombatReport(report)}
    ${renderCombatAudit(report)}
    ${renderReportBreakdown(report)}
    <div class="building-guidance">
      <strong>Resultado</strong>
      <p>${report.summary}</p>
    </div>
    ${
      isScout
        ? ""
        : `<div class="building-guidance">
            <strong>Tropas enviadas</strong>
            <p>${formatTroopBundle(report.troops || {}) || "Sin tropas registradas"}${report.withHero ? ` - ${heroDisplayName(report.heroId)} al mando` : ""}</p>
          </div>`
    }
    ${
      report.isRally
        ? `<div class="building-guidance">
            <strong>Refuerzos aliados</strong>
            <p>${formatTroopBundle(report.alliedTroops || {}) || "Sin refuerzos registrados"}</p>
          </div>`
        : ""
    }
    <div class="action-row">
      ${
        targetMarker
          ? `<button class="primary-action" type="button" data-report-target="${report.id}">
              <svg><use href="#i-map" /></svg>Objetivo
            </button>`
          : ""
      }
      <button class="secondary-action" type="button" data-share-report="${report.id}" data-share-channel="alliance">
        <svg><use href="#i-scroll" /></svg>Alianza
      </button>
      <button class="secondary-action" type="button" data-share-report="${report.id}" data-share-channel="kingdom">
        <svg><use href="#i-map" /></svg>Reino
      </button>
    </div>
    <p class="challenge-feedback" id="sheetFeedback">Informe archivado en Militar.</p>
  `;
  openSheet();
}

function reportBadge(report) {
  if (report.kind === "scout") return "Exploradores";
  if (report.isRally) return "Rally";
  return report.withHero ? heroDisplayName(report.heroId) : "Sin heroe";
}

function reportCommander(report) {
  if (report.kind === "scout") return "Exploradores";
  if (report.isRally) return "Alianza";
  return report.withHero ? heroDisplayName(report.heroId) : "Capitan";
}

function renderScoutReport(report) {
  if (report.kind !== "scout" || !report.scout) return "";
  const intel = report.scout;
  return `
    <div class="combat-report scout-report">
      <div><span>Defensa estimada</span><strong>${formatNumber(intel.defense)}</strong></div>
      <div><span>Tu ataque disponible</span><strong>${formatNumber(intel.ownAttack)}</strong></div>
      <div><span>Muralla</span><strong>${formatNumber(intel.wall)}</strong></div>
      <div><span>Hospital</span><strong>${formatNumber(intel.hospitalUsed || 0)} / ${formatNumber(intel.hospital)} camas</strong></div>
      <div><span>Tropas detectadas</span><strong>${formatNumber(troopBundleCount(intel.troops || {}))}</strong></div>
      <div><span>Recursos totales</span><strong>${formatNumber(resourceBundleTotal(intel.stock || {}))}</strong></div>
      <div><span>Botin saqueable</span><strong>${formatNumber(resourceBundleTotal(intel.loot || {}))}</strong></div>
    </div>
    <div class="report-breakdown">
      <div><strong>Guarnicion detectada</strong><p>${formatTroopBundle(intel.troops)}</p></div>
      <div><strong>Hospital enemigo</strong><p>${formatTroopBundle(intel.wounded || {}) || "Sin heridos"} - ${formatNumber(intel.hospitalFree || 0)} camas libres</p></div>
      <div><strong>Recursos en ciudad</strong><p>${formatResourceBundle(intel.stock || {}) || "Sin recursos detectados"}</p></div>
      <div><strong>Botin saqueable</strong><p>${formatResourceBundle(intel.loot || {}) || "Sin botin expuesto"}</p></div>
      <div><strong>Protegido por almacen</strong><p>${formatResourceBundle(intel.protected || {}) || "Sin proteccion detectada"}</p></div>
      <div><strong>Recomendacion</strong><p>${intel.recommendation}</p></div>
    </div>
  `;
}

function renderCombatReport(report) {
  if (!report.combat) return "";
  const defenderLossTotal = troopBundleCount(report.defenderLosses || {});
  const defenderHospitalTotal = troopBundleCount(report.defenderHospitalized || {});
  const defenderDeathTotal = troopBundleCount(report.defenderDeaths || {});
  const ownDeathTotal = troopBundleCount(report.ownDeaths || {});
  return `
    <div class="combat-report">
      <div><span>Ataque propio</span><strong>${formatNumber(report.combat.attack)}</strong></div>
      <div><span>Defensa propia</span><strong>${formatNumber(report.combat.defense)}</strong></div>
      <div><span>Defensa objetivo</span><strong>${formatNumber(report.combat.targetDefense)}</strong></div>
      <div><span>Resultado</span><strong>${report.combat.result}</strong></div>
      ${ownDeathTotal ? `<div><span>Sin cama propia</span><strong>${formatNumber(ownDeathTotal)} perdidas</strong></div>` : ""}
      ${report.combat.counterBonus ? `<div><span>Counter</span><strong>${report.combat.counterBonus > 0 ? "+" : ""}${formatNumber(report.combat.counterBonus)}%</strong></div>` : ""}
      ${defenderLossTotal ? `<div><span>Bajas defensoras</span><strong>${formatNumber(defenderLossTotal)}</strong></div>` : ""}
      ${defenderHospitalTotal ? `<div><span>Hospital rival</span><strong>${formatNumber(defenderHospitalTotal)} heridos</strong></div>` : ""}
      ${defenderDeathTotal ? `<div><span>Sin cama</span><strong>${formatNumber(defenderDeathTotal)} perdidas</strong></div>` : ""}
      ${
        report.raid
          ? `<div><span>Carga usada</span><strong>${formatNumber(resourceBundleTotal(report.raid.resources || {}))} / ${formatNumber(report.raid.capacity || 0)}</strong></div>
             <div><span>Botin expuesto</span><strong>${formatNumber(resourceBundleTotal(report.raid.exposed || {}))}</strong></div>
             <div><span>Restante ciudad</span><strong>${formatNumber(resourceBundleTotal(report.raid.stockAfter || {}))}</strong></div>`
          : ""
      }
    </div>
  `;
}

function renderCombatAudit(report) {
  const combat = report.combat;
  if (!combat) return "";
  const ratio = combat.ratio ? `${Math.round(combat.ratio * 100)}%` : "--";
  const woundReduction = combat.woundReduction ? `-${formatNumber(combat.woundReduction)}%` : "0%";
  const woundRate = Number.isFinite(combat.woundRate) ? `${formatNumber(Math.round(combat.woundRate * 1000) / 10)}%` : "--";
  const modifierLines = [
    combat.attackBonus ? `Bonus ataque total ${signedPercent(combat.attackBonus)}` : "",
    combat.heroCommandBonus ? `Heroe ${signedPercent(combat.heroCommandBonus)}` : "",
    combat.monsterBonus ? `Caza ${signedPercent(combat.monsterBonus)}` : "",
    combat.rallyBonus ? `Rally ${signedPercent(combat.rallyBonus)}` : "",
    combat.counterBonus ? `Counter ${signedPercent(combat.counterBonus)}` : "",
    combat.defenseBonus ? `Bonus defensa propia ${signedPercent(combat.defenseBonus)}` : ""
  ].filter(Boolean);

  return `
    <div class="building-guidance combat-audit">
      <strong>Calculo de combate</strong>
      <div class="combat-audit-grid">
        <div><span>Ataque base</span><b>${formatNumber(combat.baseAttack || 0)}</b></div>
        <div><span>Con investig.</span><b>${formatNumber(combat.troopAttack || 0)}</b></div>
        <div><span>Final</span><b>${formatNumber(combat.attack || 0)}</b></div>
        <div><span>Ratio</span><b>${ratio}</b></div>
        <div><span>Red. heridos</span><b>${woundReduction}</b></div>
        <div><span>Tasa heridas</span><b>${woundRate}</b></div>
      </div>
      <p>${modifierLines.join(" / ") || "Sin modificadores especiales."}</p>
    </div>
  `;
}

function signedPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}%`;
}

function renderReportBreakdown(report) {
  if (report.kind === "scout" && report.scout?.stock) return "";
  const rewardText = formatReportReward(report);
  const woundedText = formatTroopBundle(report.woundedByTroop || {});
  const ownDeathText = formatTroopBundle(report.ownDeaths || {});
  const defenderText = formatTroopBundle(report.defenderLosses || {});
  const defenderHospitalText = formatTroopBundle(report.defenderHospitalized || {});
  const defenderDeathText = formatTroopBundle(report.defenderDeaths || {});
  const defenderAfterText = formatTroopBundle(report.defenderTroopsAfter || {});
  const defenderWoundedAfterText = formatTroopBundle(report.defenderWoundedAfter || {});
  const tileText = report.tile ? `${formatNumber(report.tile.remaining || 0)} / ${formatNumber(report.tile.max || 0)} restantes${report.tile.depleted ? " - agotada" : ""}` : "";
  const monsterText = report.monster ? `${formatNumber(report.monster.damage || 0)} dano, salud ${formatNumber(report.monster.healthAfter || 0)} / ${formatNumber(report.monster.max || 0)}${report.monster.killed ? ` - respawn ${formatDuration(report.monster.respawnMs || 0)}` : ""}` : "";
  if (!rewardText && !tileText && !monsterText && !woundedText && !ownDeathText && !defenderText && !defenderHospitalText && !defenderDeathText && !defenderAfterText && !defenderWoundedAfterText) return "";
  const rewardTitle = report.kind === "scout" ? "Botin estimado" : "Botin y entrega";

  return `
    <div class="report-breakdown">
      ${rewardText ? `<div><strong>${rewardTitle}</strong><p>${rewardText}</p></div>` : ""}
      ${tileText ? `<div><strong>Casilla de recursos</strong><p>${tileText}</p></div>` : ""}
      ${monsterText ? `<div><strong>Estado del monstruo</strong><p>${monsterText}</p></div>` : ""}
      ${report.combat?.counter?.label ? `<div><strong>Ventaja tactica</strong><p>${report.combat.counter.label}</p></div>` : ""}
      ${woundedText ? `<div><strong>Heridos en hospital propio</strong><p>${woundedText}</p></div>` : ""}
      ${ownDeathText ? `<div><strong>Perdidas propias sin cama</strong><p>${ownDeathText}</p></div>` : ""}
      ${defenderText ? `<div><strong>Bajas defensoras</strong><p>${defenderText}</p></div>` : ""}
      ${defenderHospitalText ? `<div><strong>En hospital rival</strong><p>${defenderHospitalText}</p></div>` : ""}
      ${defenderDeathText ? `<div><strong>Perdidas sin cama</strong><p>${defenderDeathText}</p></div>` : ""}
      ${defenderAfterText ? `<div><strong>Guarnicion restante</strong><p>${defenderAfterText}</p></div>` : ""}
      ${defenderWoundedAfterText ? `<div><strong>Heridos acumulados rival</strong><p>${defenderWoundedAfterText}</p></div>` : ""}
    </div>
  `;
}

function formatReportReward(report) {
  const parts = [];
  if (report.deliveryText) parts.push(report.deliveryText);
  const resourcesText = !report.deliveryText ? formatResourceBundle(report.loot || {}) : "";
  const inventoryText = formatInventoryBundle(report.inventory || {});
  const boostsText = formatBoostBundle(report.boosts || {});
  if (resourcesText) parts.push(`Recursos: ${resourcesText}`);
  if (inventoryText) parts.push(`Objetos: ${inventoryText}`);
  if (boostsText) parts.push(`Heroe: ${boostsText}`);
  return parts.join(" / ");
}

function formatResourceBundle(bundle = {}) {
  return Object.entries(bundle)
    .filter(([, amount]) => amount > 0)
    .map(([resource, amount]) => `${formatNumber(amount)} ${resourceName(resource).toLowerCase()}`)
    .join(", ");
}

function resourceBundleTotal(bundle = {}) {
  return Object.values(bundle || {}).reduce((sum, amount) => sum + Math.max(0, Math.round(amount || 0)), 0);
}

function formatInventoryBundle(bundle = {}) {
  return Object.entries(bundle)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const item = inventoryCatalog[id];
      return `${formatNumber(quantity)}x ${shortItemName(item?.name || id)}`;
    })
    .join(", ");
}

function formatBoostBundle(bundle = {}) {
  const names = {
    heroXp: "XP",
    heroEnergy: "energia"
  };
  return Object.entries(bundle)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => `+${formatNumber(amount)} ${names[key] || key}`)
    .join(", ");
}

function hasActiveQueue(type) {
  return Boolean(state.queues[type]);
}

function activeQueueForBuilding(buildingId) {
  const building = buildings.find((item) => item.id === buildingId);
  return Object.values(state.queues).find((queue) =>
    queue && (
      queue.buildingId === buildingId ||
      (building?.isPlotInstance && queue.buildingId === building.templateId)
    )
  ) || null;
}

function processQueueCompletions() {
  let changed = false;
  const now = Date.now();
  Object.entries(state.queues).forEach(([type, queue]) => {
    if (!queue || queue.finishAt > now) return;
    completeQueue(type, queue);
    state.queues[type] = null;
    changed = true;
  });
  return changed;
}

function completeQueue(type, queue) {
  const building = resolveVisibleBuilding(queue.buildingId) || buildings.find((item) => item.id === queue.buildingId);
  if (type === "construction" && building) {
    const previousLevel = clampBuildingLevel(building.level || 1);
    const completedLevel = clampBuildingLevel(queue.payload.level);
    building.level = completedLevel;
    state.buildingLevels[building.id] = completedLevel;
    state.power += 920 + completedLevel * 140;
    addAllianceFeed("Construccion completada", `${building.name} sube a nivel ${completedLevel}.`);
    if (building.id === "alcazar" && completedLevel > previousLevel) {
      grantAlcazarUpgradeReward(completedLevel);
    }
  }

  if (type === "training") {
    Object.entries(queue.payload.troops || {}).forEach(([troopId, amount]) => {
      state.troops[troopId] = (state.troops[troopId] || 0) + amount;
    });
    state.trainedTroops += queue.payload.batch;
    state.power += queue.payload.batch * 8;
    addAllianceFeed("Leva completada", `${queue.payload.batch} tropas se unen al ejercito.`);
  }

  if (type === "healing") {
    const healed = queue.payload?.troops ? healWoundedTroopBundle(queue.payload.troops) : healWoundedTroops(queue.payload.toHeal);
    state.trainedTroops += healed;
    state.power += healed * 8;
    addAllianceFeed("Hospital", `${healed} tropas curadas.`);
  }

  if (type === "research") {
    const node = researchNodeById(queue.payload?.researchId);
    if (node) {
      state.researchLevels[node.id] = Math.min(node.max, researchLevel(node.id) + 1);
      addAllianceFeed("Academia", `${node.name} sube a nivel ${researchLevel(node.id)}.`);
    } else {
      addAllianceFeed("Academia", "Investigacion completada.");
    }
    state.researchCompleted += 1;
    state.power += 620;
  }

  recordServerEvent("queue.complete", {
    queueType: type,
    buildingId: queue.buildingId,
    label: queue.label,
    payload: queue.payload || {}
  });
}

function queueDuration(type, building, amount = 0) {
  if (type === "construction") return constructionDurationForBuilding(building);
  if (type === "research") return Math.round((22 + building.level * 4) * 1000 * durationFactor("research"));
  if (type === "training") return Math.round((16 + Math.ceil(amount / 12)) * 1000 * durationFactor("training"));
  if (type === "healing") return Math.round((14 + Math.ceil(amount / 10)) * 1000 * durationFactor("healing"));
  return 20 * 1000;
}

function isRepeatablePlotBuilding(building) {
  return Boolean(building && (building.kind === "resource" || building.kind === "barracks" || building.kind === "hospital"));
}

function assignedInstanceForTemplate(templateId) {
  return buildings.find((building) =>
    building.isPlotInstance &&
    building.templateId === templateId &&
    fortressPlots.some((plot) => plot.buildingId === building.id)
  );
}

function resolveVisibleBuildingId(id) {
  const building = buildings.find((item) => item.id === id);
  if (!building) return id;
  if (building.isPlotInstance) return building.id;
  if (isRepeatablePlotBuilding(building)) {
    const instance = assignedInstanceForTemplate(building.id);
    if (instance) return instance.id;
  }
  return building.id;
}

function resolveVisibleBuilding(id) {
  return buildings.find((item) => item.id === resolveVisibleBuildingId(id)) || null;
}

function adoptTemplateConstructionQueue(building) {
  const queue = state.queues.construction;
  if (!building?.isPlotInstance || !queue || queue.buildingId !== building.templateId) return;
  queue.buildingId = building.id;
  queue.label = building.name;
  queue.payload = {
    ...(queue.payload || {}),
    level: nextBuildingLevel(building),
    plotId: building.plotId
  };
  normalizeConstructionQueueDuration(queue, building);
}

function constructionDurationForBuilding(building) {
  const level = clampBuildingLevel(building?.level || 1);
  return Math.round(constructionDurationForLevel(level) * durationFactor("construction"));
}

function constructionDurationForLevel(level) {
  const safeLevel = Math.min(BUILDING_MAX_LEVEL, Math.max(1, Math.floor(Number(level) || 1)));
  return CONSTRUCTION_BASE_LEVEL_MS * Math.pow(CONSTRUCTION_LEVEL_MULTIPLIER, safeLevel - 1);
}

function durationFactor(type) {
  const levels = {
    construction: researchLevel("construction-method"),
    research: researchLevel("research-method"),
    training: researchLevel("training-speed"),
    healing: researchLevel("healing-speed")
  };
  const gearBonus = type === "research" ? heroEquipmentBonus("research") * 0.01 : 0;
  return Math.max(0.45, 1 - (levels[type] || 0) * 0.05 - gearBonus);
}

function queueTypeName(type) {
  return {
    construction: "Construccion",
    research: "Investigacion",
    training: "Entrenamiento",
    healing: "Curacion"
  }[type] || "Cola";
}

function formatDuration(ms) {
  const seconds = Math.ceil(ms / 1000);
  const days = Math.floor(seconds / 86400);
  if (days > 0) {
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${String(hours).padStart(2, "0")}h`;
  }
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) {
    const minutesLeft = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${String(minutesLeft).padStart(2, "0")}m`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes <= 0) return `${rest}s`;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function worldCoordFromPercent(x, y) {
  return {
    x: Math.max(0, Math.min(WORLD_COORD_MAX_X, Math.round((x / 100) * WORLD_COORD_MAX_X))),
    y: Math.max(0, Math.min(WORLD_COORD_MAX_Y, Math.round((y / 100) * WORLD_COORD_MAX_Y)))
  };
}

function markerWorldCoord(marker) {
  if (marker?.coord && Number.isFinite(marker.coord.x) && Number.isFinite(marker.coord.y)) {
    return {
      x: Math.max(0, Math.min(WORLD_COORD_MAX_X, Math.round(marker.coord.x))),
      y: Math.max(0, Math.min(WORLD_COORD_MAX_Y, Math.round(marker.coord.y)))
    };
  }
  return worldCoordFromPercent(marker?.x || 0, marker?.y || 0);
}

function worldPercentFromCoord(x, y) {
  return {
    x: (Math.max(0, Math.min(WORLD_COORD_MAX_X, Math.round(Number(x) || 0))) / WORLD_COORD_MAX_X) * 100,
    y: (Math.max(0, Math.min(WORLD_COORD_MAX_Y, Math.round(Number(y) || 0))) / WORLD_COORD_MAX_Y) * 100
  };
}

function markerCoordLabel(marker) {
  const coord = markerWorldCoord(marker);
  return `X:${coord.x} Y:${coord.y}`;
}

function markerSectorLabel(marker) {
  const coord = markerWorldCoord(marker);
  const sectorX = Math.floor(coord.x / 64) + 1;
  const sectorY = Math.floor(coord.y / 128) + 1;
  return `S${sectorX}-${sectorY}`;
}

function renderBuildings() {
  buildingLayer.innerHTML =
    renderFortressZones() +
    renderFortressPlots() +
    visibleCityBuildings()
      .filter((building) => building.kind !== "resource" && !building.isPlotInstance)
      .map((building) => {
        const position = buildingPosition(building);
        const sprite = buildingMapSprite(building);
        const hotspotSpriteStyle = "position:absolute;top:auto;right:auto;left:50%;bottom:50%;transform:translate(-50%,42%);width:70px;max-width:none;height:auto;object-fit:contain;pointer-events:auto;filter:drop-shadow(0 4px 6px rgba(0,0,0,.45));z-index:5;";
        const hotspotExtra = sprite ? ";background:transparent;border:0;box-shadow:none;overflow:visible;" : "";
        return `
          <button
            class="building-hotspot ${sprite ? "has-sprite " : ""}${activeBuildingId === building.id ? "is-building-active" : ""}"
            style="left:${position.x}%; top:${position.y}%${hotspotExtra}"
            type="button"
            data-building="${building.id}"
            data-kind="${building.kind || building.role.toLowerCase()}"
            aria-label="${building.name}"
          >
            ${sprite
              ? `<img class="building-hotspot-sprite" src="${sprite}" alt="" style="${hotspotSpriteStyle}" />`
              : `<span class="building-ring"><svg><use href="#${building.icon}" /></svg></span>
            <span class="building-label"><small>${building.level}</small><strong>${building.name}</strong></span>`}
          </button>
        `;
      })
      .join("");

  buildingLayer.querySelectorAll("[data-plot]").forEach((button) => {
    button.addEventListener("click", () => {
      const plot = fortressPlots.find((item) => item.id === button.dataset.plot);
     if (plot?.buildingId) {
  openBuilding(plot.buildingId);
} else {
  openFortressPlot(button.dataset.plot);
} 
    });
  });

  buildingLayer.querySelectorAll("[data-building]").forEach((button) => {
    button.addEventListener("click", () => openBuilding(button.dataset.building));
  });
}

function renderFortressZones() {
  return fortressZones
    .map(
      (zone) => `
        <span
          class="fortress-zone fortress-zone--${zone.tone}"
          style="left:${zone.x}%; top:${zone.y}%; width:${zone.w}%; height:${zone.h}%"
          aria-hidden="true"
        >
          <em>${zone.label}</em>
        </span>
      `
    )
    .join("");
}

function buildingMapSprite(building) {
  if (!building) return null;
  if (building.resource === "grain") {
    return "./assets/recurso-trigo-parcela.png";
  }
  if (building.resource === "wood") {
    return "./assets/recurso-madera-parcela.png";
  }
  if (building.resource === "stone") {
    return "./assets/recurso-piedra-parcela.png";
  }
  if (building.resource === "iron") {
    return "./assets/recurso-hierro-parcela.png";
  }
  if (building.kind === "barracks") {
    const lv = building.level || 1;
    if (lv <= 10) return "./assets/cuartel-mapa-1-10.png";
    if (lv <= 20) return "./assets/cuartel-mapa-11-20.png";
    return "./assets/cuartel-mapa-21-25.png";
  }
  if (building.kind === "hospital") {
    const lv = building.level || 1;
    if (lv <= 10) return "./assets/hospital-mapa-1-10.png";
    if (lv <= 20) return "./assets/hospital-mapa-11-20.png";
    return "./assets/hospital-mapa-21-25.png";
  }
  if (building.id === "mercado") {
    const lv = building.level || 1;
    if (lv <= 10) return "./assets/mercado-mapa-1-10.png";
    if (lv <= 20) return "./assets/mercado-mapa-11-20.png";
    return "./assets/mercado-mapa-21-25.png";
  }
  if (building.id === "embajada") {
    const lv = building.level || 1;
    if (lv <= 10) return "./assets/embajada-mapa-1-10.png";
    if (lv <= 20) return "./assets/embajada-mapa-11-20.png";
    return "./assets/embajada-mapa-21-25.png";
  }
  if (building.id === "forja") {
    const lv = building.level || 1;
    if (lv <= 10) return "./assets/forja-mapa-1-10.png";
    if (lv <= 20) return "./assets/forja-mapa-11-20.png";
    return "./assets/forja-mapa-21-25.png";
  }
  if (building.id === "prision") {
    const lv = building.level || 1;
    if (lv <= 10) return "./assets/prision-mapa-1-10.png";
    if (lv <= 20) return "./assets/prision-mapa-11-20.png";
    return "./assets/prision-mapa-21-25.png";
  }
  if (building.id === "academia") {
    const lv = building.level || 1;
    if (lv <= 10) return "./assets/academia-mapa-1-10.png";
    if (lv <= 20) return "./assets/academia-mapa-11-20.png";
    return "./assets/academia-mapa-21-25.png";
  }
  return null;
}

function renderFortressPlots() {
  return fortressPlots
    .map((plot) => {
      const building = plot.buildingId ? buildings.find((item) => item.id === plot.buildingId) : null;
      const occupied = Boolean(building);
      const resourceClass = building?.resource ? ` fortress-plot--${building.resource}` : "";
      const buildingKind = building?.kind || "";
      const sprite = buildingMapSprite(building);
      const plotExtra = sprite ? ";overflow:visible;background:transparent;border-color:transparent;box-shadow:none;" : "";
      const spriteHide = sprite ? " style=\"display:none\"" : "";
      const tokenIcon = occupied
        ? building.icon
        : plot.zone === "resource"
          ? "i-bag"
          : plot.zone === "military"
            ? "i-sword"
            : "i-hammer";

      return `
        <button
          class="fortress-plot fortress-plot--${plot.zone}${resourceClass} ${occupied ? "is-occupied" : "is-empty"} ${activePlotId === plot.id ? "is-plot-active" : ""}${sprite ? " has-sprite" : ""}"
          style="left:${plot.x}%; top:${plot.y}%${plotExtra}"
          type="button"
          data-plot="${plot.id}"
          data-zone="${plot.zone}"
          data-building-kind="${buildingKind}"
          data-resource="${building?.resource || ""}"
          aria-label="${occupied ? building.name : plot.label}"
        >
          ${sprite ? `<img class="fortress-plot-sprite" src="${sprite}" alt="" />` : `<span class="fortress-plot-icon"><svg><use href="#${tokenIcon}" /></svg></span>`}
          <b${spriteHide}>${occupied ? building.level : "+"}</b>
          <small${spriteHide}>${occupied ? building.name : plot.label}</small>
        </button>
      `;
    })
    .join("");
}

function buildingPosition(building) {
  const plot = fortressPlots.find((item) => item.buildingId === building.id);
  return plot || building;
}

function fortressPlotShortLabel(zone) {
  return {
    base: "Base",
    military: "Mil.",
    resource: "Rec."
  }[zone] || "Parcela";
}

function fortressPlotZoneLabel(zone) {
  return {
    base: "Edificios base",
    military: "Barracones y hospitales",
    resource: "Campos de recursos"
  }[zone] || "Parcela";
}

function renderMap() {
  mapLayer.innerHTML =
    renderWorldSectorLabels() +
    renderWorldRegions() +
    renderWorldMarchRoutes() +
    visibleMapMarkers()
    .map((marker) => {
      const coord = markerWorldCoord(marker);
      return `
        <button
          class="map-marker"
          data-kind="${marker.kind}"
          data-resource="${marker.resource || ""}"
          data-depleted="${marker.kind === "resource" && resourceTileState(marker).depleted ? "true" : "false"}"
          data-defeated="${marker.kind === "monster" && monsterState(marker).defeated ? "true" : "false"}"
          data-home="${marker.id === HOME_MARKER_ID ? "true" : "false"}"
          data-marker="${marker.id}"
          data-world-x="${coord.x}"
          data-world-y="${coord.y}"
          style="left:${marker.x}%; top:${marker.y}%"
          type="button"
          aria-label="${marker.name} ${markerCoordLabel(marker)}"
          title="${marker.name} - ${markerCoordLabel(marker)}"
        >
          ${renderMapMarkerIcon(marker)}
          <span class="map-label">${renderMapMarkerLabel(marker)}</span>
        </button>
      `;
    })
    .join("") +
    renderWorldMarchOverlays();

  if (worldMarchPanel) {
    worldMarchPanel.classList.toggle("is-empty", !state.marches.length && !state.rallies?.length && !state.reports?.length && !state.worldBookmarks?.length);
    worldMarchPanel.innerHTML = renderWorldMarchPanel();
  }

  mapLayer.querySelectorAll("[data-marker]").forEach((button) => {
    button.addEventListener("click", () => openMapMarker(button.dataset.marker));
  });
  mapLayer.querySelectorAll("[data-world-march]").forEach((button) => {
    button.addEventListener("click", () => openWorldMarch(button.dataset.worldMarch));
  });
  mapLayer.querySelectorAll("[data-world-rally]").forEach((button) => {
    button.addEventListener("click", () => openRallyDetail(button.dataset.worldRally));
  });
  mapLayer.querySelectorAll("[data-world-report]").forEach((button) => {
    button.addEventListener("click", () => openReport(button.dataset.worldReport));
  });
  worldMarchPanel?.querySelectorAll("[data-world-march]").forEach((button) => {
    button.addEventListener("click", () => openWorldMarch(button.dataset.worldMarch));
  });
  worldMarchPanel?.querySelectorAll("[data-world-rally]").forEach((button) => {
    button.addEventListener("click", () => openRallyDetail(button.dataset.worldRally));
  });
  worldMarchPanel?.querySelectorAll("[data-world-report]").forEach((button) => {
    button.addEventListener("click", () => openReport(button.dataset.worldReport));
  });
  worldMarchPanel?.querySelectorAll("[data-world-bookmark]").forEach((button) => {
    button.addEventListener("click", () => centerWorldOnMarker(button.dataset.worldBookmark, { flash: true }));
  });
  updateWorldCoordinates();
}

function renderWorldSectorLabels() {
  return [
    { x: 25, y: 25 },
    { x: 50, y: 25 },
    { x: 75, y: 25 },
    { x: 25, y: 50 },
    { x: 50, y: 50 },
    { x: 75, y: 50 },
    { x: 25, y: 75 },
    { x: 50, y: 75 },
    { x: 75, y: 75 }
  ]
    .map((point) => {
      const coord = worldCoordFromPercent(point.x, point.y);
      return `<span class="world-sector-label" style="left:${point.x}%; top:${point.y}%">X${coord.x} Y${coord.y}</span>`;
    })
    .join("");
}

function visibleMapMarkers() {
  if (worldFilter === "all") return mapMarkers;
  return mapMarkers.filter((marker) => marker.id === HOME_MARKER_ID || marker.kind === worldFilter);
}

function renderWorldRegions() {
  return worldRegions
    .map(
      (region) => `
        <span
          class="world-region world-region--${region.tone}"
          style="left:${region.x}%; top:${region.y}%; width:${region.w}%; height:${region.h}%"
          aria-hidden="true"
        >
          <em>${region.label}</em>
        </span>
      `
    )
    .join("");
}

function renderWorldMarchRoutes() {
  if (!state.marches.length) return "";
  const home = mapMarkers.find((marker) => marker.id === HOME_MARKER_ID);
  if (!home) return "";

  const routes = state.marches
    .map((march) => {
      const target = mapMarkers.find((marker) => marker.id === march.markerId);
      if (!target) return "";
      const current = marchMapPosition(march);
      const activeStart = march.phase === "returning" ? target : home;
      const activeEnd = march.phase === "gathering" ? target : current;
      const targetLabel = `${marchPhaseName(march.phase)} ${march.targetName}`;

      return `
        <g class="world-route-group world-route-group--${march.phase} world-route-group--${march.kind}">
          <line
            class="world-route world-route-track"
            x1="${home.x}"
            y1="${home.y}"
            x2="${target.x}"
            y2="${target.y}"
          />
          <line
            class="world-route world-route-active"
            x1="${activeStart.x}"
            y1="${activeStart.y}"
            x2="${activeEnd.x}"
            y2="${activeEnd.y}"
          />
          <circle
            class="world-route-target"
            cx="${target.x}"
            cy="${target.y}"
            r="0.9"
          >
            <title>${targetLabel}</title>
          </circle>
        </g>
      `;
    })
    .join("");

  if (!routes.trim()) return "";
  return `
    <svg class="world-route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${routes}
    </svg>
  `;
}

function renderMapMarkerIcon(marker) {
  if (marker.id === HOME_MARKER_ID) {
    return `<span class="home-token"><svg><use href="#i-crown" /></svg><b>${marker.level}</b></span>`;
  }

  if (marker.kind === "monster") {
    return renderMonsterToken(marker);
  }

  if (marker.kind === "resource") {
    return `<span class="resource-token resource-token--${marker.resource || "grain"}"><svg><use href="#${marker.icon}" /></svg><b>${marker.level}</b></span>`;
  }

  return `<span class="castle-token castle-token--${marker.kind || "enemy"}"><span class="castle-roof"></span><span class="castle-body"></span><b>${marker.level || ""}</b></span>`;
}

function renderMonsterToken(marker) {
  if (marker.image) {
    return `<span class="monster-token monster-token--image"><img src="${marker.image}" alt="" loading="lazy"><b>${marker.level}</b></span>`;
  }
  return `<span class="monster-token monster-token--${marker.sprite || "boar"}"><b>${marker.level}</b></span>`;
}

function renderMapMarkerLabel(marker) {
  if (marker.id === HOME_MARKER_ID) {
    return `<small>Tu fortaleza - ${marker.alliance}</small><strong>${marker.name}</strong>`;
  }
  return `${renderMapMarkerBadge(marker)}<strong>${marker.name}</strong>`;
}

function renderMapMarkerBadge(marker) {
  if (marker.kind === "monster") return `<small>Nv. ${marker.level}</small>`;
  if (marker.kind === "resource") return `<small>${resourceName(marker.resource)} ${marker.level}</small>`;
  if (marker.alliance) return `<small>Alianza ${marker.alliance}</small>`;
  return "";
}

function bindWorldMap() {
  if (!worldViewport || !worldCanvas) return;

  worldViewport.addEventListener("scroll", updateWorldCoordinates, { passive: true });
  worldViewport.addEventListener("touchstart", startWorldPinch, { passive: false });
  worldViewport.addEventListener("touchmove", moveWorldPinch, { passive: false });
  worldViewport.addEventListener("touchend", endWorldPinch, { passive: true });
  worldViewport.addEventListener("touchcancel", endWorldPinch, { passive: true });
  worldViewport.addEventListener("wheel", zoomWorldWithWheel, { passive: false });
  worldFilterTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-world-filter]");
    if (!button) return;
    worldFilter = button.dataset.worldFilter;
    worldFilterTabs.querySelectorAll("[data-world-filter]").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.worldFilter === worldFilter);
    });
    renderMap();
  });

  document.querySelectorAll("[data-world-zoom]").forEach((button) => {
    button.addEventListener("click", () => setWorldZoom(button.dataset.worldZoom));
  });

  document.querySelectorAll("[data-world-center]").forEach((button) => {
    button.addEventListener("click", () => {
      closeSheet();
      centerWorldOnMarker(button.dataset.worldCenter || HOME_MARKER_ID, { flash: true });
    });
  });

  worldJumpForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    jumpWorldToCoordinates();
  });

  applyWorldZoom();
}

function bindSceneDismiss() {
  document.querySelectorAll(".scene-city, .scene-world").forEach((scene) => {
    scene.addEventListener("click", (event) => {
      if (!sheet.classList.contains("is-open")) return;
      if (event.target.closest("[data-building], [data-plot], [data-marker], [data-world-march], [data-world-rally], [data-world-report]")) return;
      if (event.target.closest(".world-hud, .world-march-panel")) return;
      closeSheet();
    });
  });
}

function setWorldZoom(direction) {
  const next = direction === "in" ? worldZoom + WORLD_ZOOM_STEP : worldZoom - WORLD_ZOOM_STEP;
  setWorldZoomValue(next);
}

function setWorldZoomValue(nextZoom, anchor = null) {
  if (!worldViewport || !worldCanvas) return;
  const oldWidth = Math.max(1, worldCanvas.scrollWidth);
  const oldHeight = Math.max(1, worldCanvas.scrollHeight);
  const anchorX = anchor?.x ?? worldViewport.clientWidth / 2;
  const anchorY = anchor?.y ?? worldViewport.clientHeight / 2;
  const contentRatioX = anchor?.contentRatioX ?? (worldViewport.scrollLeft + anchorX) / oldWidth;
  const contentRatioY = anchor?.contentRatioY ?? (worldViewport.scrollTop + anchorY) / oldHeight;

  worldZoom = Math.min(WORLD_MAX_ZOOM, Math.max(WORLD_MIN_ZOOM, Number(nextZoom.toFixed(2))));
  applyWorldZoom();
  worldCanvas.getBoundingClientRect();

  worldViewport.scrollLeft = contentRatioX * worldCanvas.scrollWidth - anchorX;
  worldViewport.scrollTop = contentRatioY * worldCanvas.scrollHeight - anchorY;
  updateWorldCoordinates();
}

function applyWorldZoom() {
  if (!worldCanvas) return;
  worldCanvas.style.setProperty("--world-zoom", worldZoom);
  worldCanvas.classList.toggle("is-overview", worldZoom <= 0.45);
  worldCanvas.classList.toggle("is-wide-view", worldZoom > 0.45 && worldZoom <= 0.72);
}

function startWorldPinch(event) {
  if (event.touches.length < 2) {
    worldPinch = null;
    return;
  }
  if (event.cancelable) event.preventDefault();
  const touch = readWorldTouchPair(event);
  const rect = worldViewport.getBoundingClientRect();
  const anchorX = touch.x - rect.left;
  const anchorY = touch.y - rect.top;
  worldPinch = {
    distance: Math.max(1, touch.distance),
    zoom: worldZoom,
    contentRatioX: (worldViewport.scrollLeft + anchorX) / Math.max(1, worldCanvas.scrollWidth),
    contentRatioY: (worldViewport.scrollTop + anchorY) / Math.max(1, worldCanvas.scrollHeight)
  };
}

function moveWorldPinch(event) {
  if (!worldPinch || event.touches.length < 2) return;
  if (event.cancelable) event.preventDefault();
  const touch = readWorldTouchPair(event);
  const rect = worldViewport.getBoundingClientRect();
  setWorldZoomValue(worldPinch.zoom * (touch.distance / worldPinch.distance), {
    x: touch.x - rect.left,
    y: touch.y - rect.top,
    contentRatioX: worldPinch.contentRatioX,
    contentRatioY: worldPinch.contentRatioY
  });
}

function endWorldPinch(event) {
  if (event.touches.length < 2) worldPinch = null;
}

function readWorldTouchPair(event) {
  const first = event.touches[0];
  const second = event.touches[1];
  const dx = second.clientX - first.clientX;
  const dy = second.clientY - first.clientY;
  return {
    distance: Math.hypot(dx, dy),
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2
  };
}

function zoomWorldWithWheel(event) {
  if (!event.ctrlKey && !event.metaKey) return;
  if (event.cancelable) event.preventDefault();
  const rect = worldViewport.getBoundingClientRect();
  const direction = event.deltaY < 0 ? 1 : -1;
  setWorldZoomValue(worldZoom + direction * 0.15, {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  });
}

function centerWorldOnMarker(markerId = HOME_MARKER_ID, options = {}) {
  const marker = markerById(markerId);
  if (!marker || !worldViewport || !worldCanvas) return;
  centerWorldOnPoint(marker.x, marker.y, marker);
  if (options.flash) flashWorldMarker(marker.id);
}

function flashWorldMarker(markerId) {
  const button = mapLayer?.querySelector(`[data-marker="${markerId}"]`);
  if (!button) return;
  button.classList.remove("is-located");
  button.getBoundingClientRect();
  button.classList.add("is-located");
  window.setTimeout(() => button.classList.remove("is-located"), 1800);
}

function jumpWorldToCoordinates() {
  if (!worldJumpX || !worldJumpY) return;
  const rawX = Number(worldJumpX.value);
  const rawY = Number(worldJumpY.value);
  if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;
  const point = worldPercentFromCoord(rawX, rawY);
  closeSheet();
  centerWorldOnPoint(point.x, point.y);
  const coord = worldCoordFromPercent(point.x, point.y);
  worldJumpX.value = String(coord.x);
  worldJumpY.value = String(coord.y);
  updateWorldCoordinates({ x: point.x, y: point.y });
}

function centerWorldOnMarch(id) {
  const march = state.marches.find((item) => item.id === id);
  if (!march) return;
  const position = marchMapPosition(march);
  centerWorldOnPoint(position.x, position.y);
  closeSheet();
}

function centerWorldOnPoint(x, y, marker = null) {
  if (!worldViewport || !worldCanvas) return;
  const targetX = (x / 100) * worldCanvas.scrollWidth - worldViewport.clientWidth / 2;
  const targetY = (y / 100) * worldCanvas.scrollHeight - worldViewport.clientHeight / 2;
  worldViewport.scrollLeft = Math.max(0, targetX);
  worldViewport.scrollTop = Math.max(0, targetY);
  worldHasCentered = true;
  updateWorldCoordinates(marker || { x, y });
}

function updateWorldCoordinates(marker = null) {
  if (!worldCoordinates || !worldViewport || !worldCanvas) return;
  const centerX = marker ? marker.x / 100 : (worldViewport.scrollLeft + worldViewport.clientWidth / 2) / Math.max(1, worldCanvas.scrollWidth);
  const centerY = marker ? marker.y / 100 : (worldViewport.scrollTop + worldViewport.clientHeight / 2) / Math.max(1, worldCanvas.scrollHeight);
  const coord = worldCoordFromPercent(centerX * 100, centerY * 100);
  worldCoordinates.textContent = `X:${coord.x} Y:${coord.y}`;
}

function renderWorldMarchOverlays() {
  if (!state.marches.length) return "";
  return state.marches
    .map((march, index) => {
      const position = marchMapPosition(march, index);
      const remaining = Math.max(0, march.arriveAt - Date.now());
      return `
        <button
          class="world-march world-march--${march.phase}"
          type="button"
          data-world-march="${march.id}"
          style="left:${position.x}%; top:${position.y}%"
          aria-label="${marchPhaseName(march.phase)} ${march.targetName}"
        >
          <span class="world-march-icon"><svg><use href="#${marchIcon(march)}" /></svg></span>
          <span class="world-march-label"><strong>${marchPhaseName(march.phase)}</strong><em>${formatDuration(remaining)}</em></span>
        </button>
      `;
    })
    .join("");
}

function renderWorldMarchPanel() {
  if (!state.marches.length) {
    return `
      <div class="world-march-panel-head">
        <span>Marchas</span>
        <strong>0/${marchSlots()}</strong>
      </div>
      ${renderWorldBookmarkRows()}
      ${renderWorldRallyRows()}
      ${renderWorldLatestReport()}
    `;
  }

  return `
    <div class="world-march-panel-head">
      <span>Marchas</span>
      <strong>${state.marches.length}/${marchSlots()}</strong>
    </div>
    ${state.marches
      .map(
        (march) => `
          <button class="world-march-row" type="button" data-world-march="${march.id}">
            <svg><use href="#${marchIcon(march)}" /></svg>
            <span><b>${marchPhaseName(march.phase)}</b><small>${march.targetName}</small><i style="--progress:${marchPhaseProgress(march)}%"></i></span>
            <strong>${formatDuration(timeUntilHome(march))}</strong>
          </button>
        `
      )
      .join("")}
    ${renderWorldBookmarkRows()}
    ${renderWorldRallyRows()}
    ${renderWorldLatestReport()}
  `;
}

function renderWorldBookmarkRows() {
  const bookmarks = normalizeWorldBookmarks(state.worldBookmarks || []);
  state.worldBookmarks = bookmarks;
  if (!bookmarks.length) return "";
  return bookmarks
    .slice(0, 6)
    .map((bookmark) => {
      const marker = markerById(bookmark.markerId);
      return `
        <button class="world-bookmark-row" type="button" data-world-bookmark="${bookmark.markerId}">
          <svg><use href="#${marker.icon || "i-map"}" /></svg>
          <span><b>Marcado</b><small>${bookmark.name}</small></span>
          <strong>X:${bookmark.coord.x} Y:${bookmark.coord.y}</strong>
        </button>
      `;
    })
    .join("");
}

function renderWorldRallyRows() {
  if (!state.rallies?.length) return "";
  return state.rallies
    .map(
      (rally) => `
        <button class="world-march-row world-rally-row" type="button" data-world-rally="${rally.id}">
          <svg><use href="#i-target" /></svg>
          <span><b>Rally</b><small>${rally.targetName}</small></span>
          <strong>${formatDuration(Math.max(0, rally.launchAt - Date.now()))}</strong>
        </button>
      `
    )
    .join("");
}

function renderWorldLatestReport() {
  const report = (state.reports || [])[0];
  if (!report) return "";
  return `
    <button class="world-report-row" type="button" data-world-report="${report.id}">
      <svg><use href="#i-scroll" /></svg>
      <span><b>Informe ${marchKindName(report.kind)}</b><small>${formatReportTime(report.createdAt)}</small></span>
      <strong>${report.targetName}</strong>
    </button>
  `;
}

function bindNavigation() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
  heroAccessButton?.addEventListener("click", () => switchTab("hero"));
}

function switchTab(tab) {
  currentTab = tab;
  closeSheet();
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === tab);
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  renderQueueStrip();
  if (tab === "world" && !worldHasCentered) {
    window.setTimeout(() => centerWorldOnMarker(HOME_MARKER_ID), 0);
  }
}

function openSheet() {
  sheet.classList.add("is-open");
  sheetBody.scrollTop = 0;
}

function bindSheet() {
  sheetBody.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-sheet]");
    const action = event.target.closest("[data-building-action]");
    const tab = event.target.closest("[data-open-tab]");
    const markerAction = event.target.closest("[data-marker-action]");
    const openPlanner = event.target.closest("[data-open-planner]");
    const scoutMarker = event.target.closest("[data-scout-marker]");
    const rallyMarker = event.target.closest("[data-rally-marker]");
    const rallyLaunch = event.target.closest("[data-rally-launch]");
    const rallyCancel = event.target.closest("[data-rally-cancel]");
    const marchFill = event.target.closest("[data-march-fill]");
    const marchMax = event.target.closest("[data-march-max]");
    const marchPreset = event.target.closest("[data-march-preset]");
    const marchSize = event.target.closest("[data-open-march-size]");
    const cancelMarch = event.target.closest("[data-cancel-march]");
    const centerMarch = event.target.closest("[data-center-march]");
    const centerMarker = event.target.closest("[data-center-marker]");
    const marchClear = event.target.closest("[data-march-clear]");
    const doctrineSave = event.target.closest("[data-doctrine-save]");
    const doctrineReset = event.target.closest("[data-doctrine-reset]");
    const doctrineNormalize = event.target.closest("[data-doctrine-normalize]");
    const doctrineClear = event.target.closest("[data-doctrine-clear]");
    const researchBranch = event.target.closest("[data-research-branch]");
    const researchNode = event.target.closest("[data-start-research]");
    const trainSubmit = event.target.closest("[data-train-submit]");
    const healFill = event.target.closest("[data-heal-fill]");
    const healClear = event.target.closest("[data-heal-clear]");
    const healSubmit = event.target.closest("[data-heal-submit]");
    const forgeItem = event.target.closest("[data-forge-item]");
    const forgeCombine = event.target.closest("[data-forge-combine]");
    const forgeCombineAll = event.target.closest("[data-forge-combine-all]");
    const loadoutSelect = event.target.closest("[data-select-loadout]");
    const reportShare = event.target.closest("[data-share-report]");
    const reportTarget = event.target.closest("[data-report-target]");
    const betaCopy = event.target.closest("[data-beta-copy]");
    const betaDownload = event.target.closest("[data-beta-download]");
    const convoySend = event.target.closest("[data-convoy-send]");
    const allianceBuy = event.target.closest("[data-alliance-buy]");
    const memberLocate = event.target.closest("[data-member-locate]");
    const allianceProject = event.target.closest("[data-alliance-project]");

    if (close) closeSheet();
    if (tab) switchTab(tab.dataset.openTab);
    if (action) runBuildingAction(action.dataset.buildingAction);
    if (scoutMarker) scoutTarget(scoutMarker.dataset.scoutMarker);
    if (rallyMarker) createRallyFromMarker(rallyMarker.dataset.rallyMarker);
    if (rallyLaunch) launchRallyById(rallyLaunch.dataset.rallyLaunch);
    if (rallyCancel) cancelRallyById(rallyCancel.dataset.rallyCancel);
    if (marchFill) fillMarchPlanner(marchFill.dataset.marchFill);
    if (marchMax) fillMaxMarchPlanner(marchMax.dataset.marchMax);
    if (marchPreset) applyDoctrineToPlanner(marchPreset.dataset.marchPreset);
    if (marchSize) renderResearchTree("command", "Orden de Marcha aumenta el maximo de tropas por marcha. Algunas piezas de forja tambien suman capacidad.");
    if (cancelMarch) cancelMarchById(cancelMarch.dataset.cancelMarch);
    if (centerMarch) centerWorldOnMarch(centerMarch.dataset.centerMarch);
    if (centerMarker) {
      centerWorldOnMarker(centerMarker.dataset.centerMarker);
      closeSheet();
    }
    if (openPlanner) openMarchPlanner(openPlanner.dataset.openPlanner);
    if (marchClear) clearMarchPlanner(marchClear.dataset.marchClear);
    if (doctrineSave) saveDoctrineEditor();
    if (doctrineReset) resetDoctrineEditor();
    if (doctrineNormalize) normalizeDoctrineCard(doctrineNormalize.closest("[data-doctrine-kind]"));
    if (doctrineClear) clearDoctrineCard(doctrineClear.closest("[data-doctrine-kind]"));
    if (researchBranch) renderResearchTree(researchBranch.dataset.researchBranch);
    if (researchNode) startResearchNode(researchNode.dataset.startResearch);
    if (trainSubmit) startSelectedTraining(trainSubmit.dataset.trainSubmit);
    if (healFill) fillHealingEditor(healFill.dataset.healFill);
    if (healClear) clearHealingEditor();
    if (healSubmit) startSelectedHealing(healSubmit.dataset.healSubmit);
    if (forgeItem) startForgeItem(forgeItem.dataset.forgeItem);
    if (forgeCombine) combineForgeMaterial(forgeCombine.dataset.forgeCombine);
    if (forgeCombineAll) combineAllForgeMaterials(forgeCombineAll.dataset.forgeCombineAll);
    if (loadoutSelect) selectEquipmentLoadout(loadoutSelect.dataset.selectLoadout);
    if (reportShare) shareReportToChat(reportShare.dataset.shareReport, reportShare.dataset.shareChannel);
    if (reportTarget) openReportTarget(reportTarget.dataset.reportTarget);
    if (betaCopy) copyBetaSnapshot();
    if (betaDownload) downloadBetaSnapshot();
    if (convoySend) sendAllianceConvoy(convoySend.dataset.convoySend);
    if (allianceBuy) buyAllianceShopItem(allianceBuy.dataset.allianceBuy);
    if (memberLocate) locateAllianceMember(memberLocate.dataset.memberLocate);
    if (allianceProject) upgradeAllianceProject(allianceProject.dataset.allianceProject);
    if (markerAction) runMarkerAction(markerAction.dataset.markerAction);
  });

  sheetBody.addEventListener("input", (event) => {
    const planner = event.target.closest("[data-march-target]");
    if (planner) updateMarchPlannerSummary(planner);
    if (event.target.matches("[data-doctrine-percent]")) updateDoctrineCardPreview(event.target.closest("[data-doctrine-kind]"));
    if (event.target.matches("[data-train-amount]")) updateTrainingCard(event.target);
    if (event.target.matches("[data-heal-amount]")) updateHealingSummary();
  });

  sheetBody.addEventListener("change", (event) => {
    const planner = event.target.closest("[data-march-target]");
    if (planner) {
      if (event.target.matches("[data-march-hero-id]")) {
        const heroToggle = planner.querySelector("[data-march-hero]");
        if (heroToggle && !heroToggle.disabled) heroToggle.checked = true;
      }
      updateMarchPlannerSummary(planner);
    }
    if (event.target.matches("[data-train-amount]")) updateTrainingCard(event.target);
    if (event.target.matches("[data-heal-amount]")) updateHealingSummary();
    if (event.target.matches("[data-doctrine-hero]")) updateDoctrineCardPreview(event.target.closest("[data-doctrine-kind]"));
  });
}

function bindReports() {
  if (!reportList) return;
  reportList.addEventListener("click", (event) => {
    const reportButton = event.target.closest("[data-report]");
    if (!reportButton) return;
    openReport(reportButton.dataset.report);
  });
}

function openBuilding(id) {
  const building = resolveVisibleBuilding(id);
  if (!building) return;
  adoptTemplateConstructionQueue(building);
  activeBuildingId = building.id;
  activePlotId = null;
  activeSheetMode = "building";
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  renderBuildings();

  if (building.kind === "resource") {
    renderResourceBuildingSheet(building);
    return;
  }

  if (building.id === "academia") {
    renderAcademyOverview();
    return;
  }

  const cost = buildingLevelCost(building);
  const costLabel = formatCost(cost);
  const stats = getBuildingStats(building);
  const levelCostLabel = buildingIsMaxLevel(building) ? "Nivel maximo" : costLabel || "Gratis";
  const requirementsMarkup = renderUpgradeRequirements(building);

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${building.name}</h2>
        <p>${building.body}</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="building-meta">
      <div><span>Nivel</span><strong>${building.level}</strong></div>
      <div><span>Funcion</span><strong>${building.role}</strong></div>
      <div><span>Estado</span><strong>${stats.status}</strong></div>
    </div>
    <div class="building-meta">
      <div><span>Bonus</span><strong>${building.bonus}</strong></div>
      <div><span>Coste nivel ${buildingIsMaxLevel(building) ? "" : nextBuildingLevel(building)}</span><strong>${levelCostLabel}</strong></div>
      <div><span>${stats.thirdLabel}</span><strong>${stats.thirdValue}</strong></div>
    </div>
    <div class="building-guidance">
      <strong>${stats.guideTitle}</strong>
      <p>${stats.guideBody}</p>
    </div>
    ${requirementsMarkup}
    <div class="action-row">
      ${getBuildingActionButtons(building)}
    </div>
    <p class="challenge-feedback" id="sheetFeedback"></p>
  `;
  openSheet();
}

function renderResourceBuildingSheet(building, message = "") {
  const rate = resourceProductionRate(building);
  const activeResources = activeResourceBuildings();
  const totalRate = activeResources
    .filter((item) => item.resource === building.resource)
    .reduce((sum, item) => sum + resourceProductionRate(item), 0);
  const reserve = state.resources[building.resource] || 0;
  const capacity = resourceCapacity(building.resource);
  const fillRate = Math.max(0, Math.min(100, (reserve / Math.max(1, capacity)) * 100));
  const queue = activeQueueForBuilding(building.id);
  const cost = buildingLevelCost(building);
  const requirementsMarkup = renderUpgradeRequirements(building);

  sheetBody.innerHTML = `
    <div class="sheet-title resource-sheet-title">
      <div>
        <h2>${building.name}</h2>
        <p>${queue ? `Mejora en curso: ${formatDuration(queue.finishAt - Date.now())}` : `Produciendo ${resourceName(building.resource).toLowerCase()} automaticamente.`}</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>

    <section class="resource-sheet-compact">
      <div class="resource-sheet-art resource-sheet-art--${building.resource}" aria-hidden="true">
        <strong>${resourceName(building.resource)}</strong>
        <small>Nv. ${building.level}</small>
      </div>
      <div class="resource-sheet-compact-stats">
        <div>
          <span>Reserva</span>
          <strong>${formatNumber(reserve)} / ${formatNumber(capacity)}</strong>
        </div>
        <div>
          <span>Este edificio</span>
          <strong>${formatNumber(rate)}/h</strong>
        </div>
        <div>
          <span>Total ${resourceName(building.resource).toLowerCase()}</span>
          <strong>${formatNumber(totalRate)}/h</strong>
        </div>
      </div>
    </section>

    <div class="resource-sheet-meter">
      <div class="resource-sheet-bar"><i style="--progress:${fillRate}%"></i></div>
      <small>${queue ? "Mejorando edificio" : "Produccion pasiva hasta el limite del almacen"}</small>
    </div>

    ${requirementsMarkup}

    <div class="action-row resource-sheet-bottom">
      ${renderBuildingLevelButton(building)}
      <button class="primary-action" type="button" data-open-tab="inventory">
        <svg><use href="#i-bag" /></svg>Obtener ${resourceName(building.resource)}
      </button>
    </div>

    <p class="challenge-feedback" id="sheetFeedback">${message}</p>
  `;
  openSheet();
}

function renderAcademyOverview(message = "") {
  const academy = buildings.find((item) => item.id === "academia");
  const queue = state.queues.research;
  const queueText = queue ? `${queue.label} · ${formatDuration(queue.finishAt - Date.now())}` : "Cola de investigacion vacia...";

  sheetBody.innerHTML = `
    <div class="sheet-title academy-sheet-title">
      <div>
        <h2>Academia</h2>
        <p>Elige una rama y despues entra en su arbol de investigaciones.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>

    <section class="academy-overview-card">
      <div class="academy-overview-top">
        <div class="academy-overview-building">
          <span class="academy-overview-icon"><svg><use href="#${academy.icon}" /></svg></span>
          <div>
            <strong>${academy.name}</strong>
            <small>Nivel ${academy.level} / ${BUILDING_MAX_LEVEL}</small>
          </div>
        </div>
        <div class="academy-overview-actions">
          ${renderBuildingLevelButton(academy)}
        </div>
      </div>

      <div class="academy-queue-strip">
        <span>Cola de investigacion</span>
        <strong>${queueText}</strong>
      </div>
    </section>

    <div class="academy-branch-list">
      ${researchBranches
        .map((branch) => {
          const progress = researchBranchProgress(branch);
          const percent = Math.round((progress.levels / Math.max(1, progress.maxLevels)) * 1000) / 10;
          return `
            <button class="academy-branch-row" type="button" data-research-branch="${branch.id}">
              <span class="academy-branch-icon"><svg><use href="#${branch.icon}" /></svg></span>
              <span class="academy-branch-copy">
                <strong>${branch.name}</strong>
                <small>${branch.body}</small>
              </span>
              <span class="academy-branch-progress">
                <strong>${percent}%</strong>
                <small>${progress.completed}/${progress.total}</small>
              </span>
              <span class="academy-branch-arrow">›</span>
            </button>
          `;
        })
        .join("")}
    </div>

    <p class="challenge-feedback" id="sheetFeedback">${message}</p>
  `;
  openSheet();
}

function openFortressPlot(id) {
  const plot = fortressPlots.find((item) => item.id === id);
  if (!plot) return;

  if (plot.buildingId) {
    openBuilding(plot.buildingId);
    return;
  }

  activePlotId = id;
  activeBuildingId = null;
  activeSheetMode = "plot";
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  renderBuildings();

  const zone = fortressPlotZoneLabel(plot.zone);
  const options = availableBuildingsForPlot(plot);
  const title = plot.zone === "resource" ? "Parcela de recursos" : plot.zone === "military" ? "Solar militar" : "Solar urbano";
  const subtitle = plot.zone === "resource"
    ? "Elige qué edificio de producción quieres colocar en esta plataforma."
    : plot.zone === "military"
      ? "Aquí van cuarteles y hospitales, no un bloque de edificios apretados."
      : "Este solar queda libre hasta que decidas qué edificio urbano construir.";

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>

    <div class="building-meta">
      <div><span>Zona</span><strong>${zone}</strong></div>
      <div><span>Estado</span><strong>Vacía</strong></div>
      <div><span>Modelo</span><strong>Parcela abierta</strong></div>
    </div>

    <div class="building-guidance">
      <strong>Vista de fortaleza</strong>
      <p>La idea aquí es acercarnos a Game of War: menos iconos flotando y más solares visibles donde eliges qué construir.</p>
    </div>

    <div class="build-list">
      ${
        options.length
          ? options
              .map(
                (building) => `
                  <button class="build-list-item" type="button" data-build-option="${building.id}">
                    <span class="build-list-icon"><svg><use href="#${building.icon}" /></svg></span>
                    <span class="build-list-copy">
                      <strong>${building.name}</strong>
                      <small>${building.role} · ${building.bonus}</small>
                      <em>${building.body}</em>
                    </span>
                  </button>
                `
              )
              .join("")
          : `<div class="empty-inventory">Ya no quedan edificios disponibles para esta zona.</div>`
      }
    </div>

    <p class="challenge-feedback" id="sheetFeedback"></p>
  `;

  sheetBody.querySelectorAll("[data-build-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const ok = assignBuildingToPlot(plot.id, button.dataset.buildOption);
      if (!ok) return;
      renderBuildings();
      renderResources();
      openBuilding(button.dataset.buildOption);
      const feedback = document.querySelector("#sheetFeedback");
      if (feedback) feedback.textContent = "Edificio colocado en la parcela.";
    });
  });

  openSheet();
}

function openMapMarker(id) {
  const marker = mapMarkers.find((item) => item.id === id);
  if (!marker) return;
  activeSheetMode = "map";
  activeMapMarkerId = id;
  activeBuildingId = null;
  activePlotId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  const canMarch = marker.kind !== "ally";
  const quick = canMarch ? buildQuickMarch(marker) : null;
  const compactActions = renderCompactMapActions(marker, quick);

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${marker.name}</h2>
        <p>${marker.body}</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    
      <div class="world-meta world-meta--compact">
  <div><span>Nivel</span><strong>${marker.level}</strong></div>
  <div><span>Coords</span><strong>${markerCoordLabel(marker)}</strong></div>
  ${
    marker.kind === "enemy"
      ? `<div><span>Alianza</span><strong>${marker.alliance || "Sin alianza"}</strong></div>`
      : ""
  }
  ${
    marker.kind === "monster"
      ? `<div><span>Objetivo</span><strong>Monstruo</strong></div>`
      : ""
  }
  ${
    marker.kind === "resource"
      ? `<div><span>Acción</span><strong>Recolectar</strong></div>`
      : ""
  }
</div>

    ${compactActions}
    <div id="marchPlannerSlot"></div>

    <p class="challenge-feedback" id="sheetFeedback"></p>
      `;
        openSheet();
}

function renderCompactMapActions(marker, quick) {
  const mainLabel =
    marker.kind === "resource"
      ? "Recolectar"
      : marker.kind === "monster"
      ? "Cazar"
      : "Atacar";
  const canMarch = marker.kind !== "ally";

  return `
    <div class="compact-map-actions">
      ${
        marker.kind === "enemy"
          ? `<button class="secondary-action" type="button" data-scout-marker="${marker.id}">
              <svg><use href="#i-map" /></svg>Explorar
            </button>`
          : ""
      }
      ${
        marker.kind === "enemy"
          ? `<button class="secondary-action" type="button" data-rally-marker="${marker.id}">
              <svg><use href="#i-target" /></svg>Rally
            </button>`
          : ""
      }
      ${
        canMarch
          ? `<button class="primary-action" type="button" data-open-planner="${marker.id}">
              <svg><use href="#${marker.icon}" /></svg>${mainLabel}
            </button>`
          : `<button class="primary-action" type="button" data-open-tab="city">
              <svg><use href="#i-crown" /></svg>Volver
            </button>`
      }
      <button class="secondary-action" type="button" data-marker-action="bookmark">
        <svg><use href="#i-map" /></svg>Marcar
      </button>
      <button class="secondary-action" type="button" data-marker-action="share-alliance:${marker.id}">
        <svg><use href="#i-scroll" /></svg>Alianza
      </button>
      <button class="secondary-action" type="button" data-marker-action="share-kingdom:${marker.id}">
        <svg><use href="#i-map" /></svg>Reino
      </button>
    </div>
  `;
}

function openMarchPlanner(markerId) {
  const marker = mapMarkers.find((item) => item.id === markerId);
  if (!marker || marker.kind === "ally") return;
  const slot = sheetBody.querySelector("#marchPlannerSlot");
  if (!slot) return;
  const quick = buildQuickMarch(marker);
  slot.innerHTML = renderMarchPlanner(marker, quick);
  const planner = slot.querySelector(`[data-march-target="${marker.id}"]`);
  if (planner) updateMarchPlannerSummary(planner);
}

function renderMarchPlanner(marker, quick) {
  const available = availableTroops();
  const defaultHeroId = quick?.heroId || defaultHeroForMarch(marker);
  const defaultHero = Boolean((quick ? quick.withHero : marker.kind === "monster") && defaultHeroId);
  const defaultTroops = quick?.troops || {};

  const totalSelected = Object.values(defaultTroops).reduce((sum, value) => sum + value, 0);
  const duration = totalSelected ? marchDuration(marker, defaultTroops, defaultHero) : null;
  const load = troopBundleLoad(defaultTroops);
  const overLimit = totalSelected > maxMarchSize();

  return `
    <div class="march-planner" data-march-target="${marker.id}">
      <div class="planner-head">
        <div>
          <strong>Preparar marcha</strong>
          <span>${state.marches.length}/${marchSlots()} slots Â· max. ${formatNumber(maxMarchSize())} tropas</span>
        </div>
        ${renderMarchHeroToggle(marker, defaultHero)}
      </div>
      ${renderMarchPresetPicker(marker, quick?.presetKind || marker.kind)}
      ${renderMarchHeroPicker(marker, defaultHeroId)}
      <div class="troop-selector">
        ${troopCatalog
          .map((troop) => {
            const max = available[troop.id] || 0;
            const value = Math.min(max, defaultTroops[troop.id] || 0);
            return `
              <label class="troop-selector-row">
                <span>
                  <strong>${troop.name}</strong>
                  <small>Disp. ${formatNumber(max)} - A ${troopAttack(troop)} / D ${troopDefense(troop)} / C ${troop.load}</small>
                </span>
                <input
                  type="number"
                  min="0"
                  max="${max}"
                  step="1"
                  inputmode="numeric"
                  value="${value}"
                  data-march-troop="${troop.id}"
                  aria-label="${troop.name}"
                />
              </label>
            `;
          })
          .join("")}
      </div>
      <div class="planner-summary" data-planner-summary>
        <div class="${overLimit ? "is-over-limit" : ""}"><span>Tropas</span><strong>${formatNumber(totalSelected)} / ${formatNumber(maxMarchSize())}</strong></div>
        <div><span>Carga</span><strong>${formatNumber(load)}</strong></div>
        <div><span>Ida</span><strong>${duration ? formatDuration(duration) : "--"}</strong></div>
      </div>
      <div class="march-preview" data-march-preview>
        ${renderMarchPreview(marker, quick)}
      </div>
      <div class="planner-actions">
        <button class="primary-action" type="button" data-marker-action="${marker.id}"><svg><use href="#${marker.icon}" /></svg>${marker.kind === "monster" ? "Cazar" : marker.kind === "enemy" ? "Enviar ataque" : "Enviar marcha"}</button>
        <button class="secondary-action" type="button" data-march-max="${marker.id}"><svg><use href="#i-sword" /></svg>Maximo</button>
        <button class="secondary-action" type="button" data-open-march-size><svg><use href="#i-book" /></svg>Aumentar limite</button>
        <button class="secondary-action" type="button" data-march-fill="${marker.id}"><svg><use href="#i-target" /></svg>Sugerir</button>
        <button class="secondary-action" type="button" data-march-clear="${marker.id}"><svg><use href="#i-close" /></svg>Vaciar</button>
      </div>
    </div>
  `;
}

function renderMarchPresetPicker(marker, activeKind = marker.kind) {
  return `
    <div class="march-preset-picker">
      ${doctrineTypes
        .map((doctrine) => {
          const preset = normalizedMarchPreset(doctrine.id);
          const total = doctrinePercentTotal(preset.percentages);
          const active = doctrine.id === activeKind;
          return `
            <button class="${active ? "is-active" : ""}" type="button" data-march-preset="${marker.id}:${doctrine.id}">
              <svg><use href="#${doctrine.icon}" /></svg>
              <span>
                <strong>${doctrine.name}</strong>
                <small>${total}% marcha${preset.withHero ? " + heroe" : ""}</small>
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function fillMarchPlanner(markerId) {
  const marker = mapMarkers.find((item) => item.id === markerId);
  const planner = sheetBody.querySelector(`[data-march-target="${markerId}"]`);
  if (!marker || !planner) return;
  const quick = buildQuickMarch(marker);
  troopCatalog.forEach((troop) => {
    const input = planner.querySelector(`[data-march-troop="${troop.id}"]`);
    if (input) input.value = quick?.troops?.[troop.id] || 0;
  });
  const heroInput = planner.querySelector("[data-march-hero]");
  const heroId = defaultHeroForMarch(marker);
  if (heroInput && !heroInput.disabled) heroInput.checked = marker.kind === "monster" && Boolean(heroId);
  setMarchPlannerHero(planner, heroId);
  updateMarchPlannerSummary(planner);
}

function applyDoctrineToPlanner(command) {
  const [markerId, presetKind] = command.split(":");
  const marker = mapMarkers.find((item) => item.id === markerId);
  const planner = sheetBody.querySelector(`[data-march-target="${markerId}"]`);
  if (!marker || !planner) return;

  const plan = buildQuickMarch(marker, presetKind);
  troopCatalog.forEach((troop) => {
    const input = planner.querySelector(`[data-march-troop="${troop.id}"]`);
    if (input) input.value = plan?.troops?.[troop.id] || 0;
  });

  const heroInput = planner.querySelector("[data-march-hero]");
  if (heroInput && !heroInput.disabled) heroInput.checked = Boolean(plan?.withHero);
  setMarchPlannerHero(planner, plan?.heroId || defaultHeroForMarch(marker));
  planner.querySelectorAll("[data-march-preset]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.marchPreset === command);
  });
  updateMarchPlannerSummary(planner);

  const feedback = document.querySelector("#sheetFeedback");
  if (feedback) {
    const doctrine = doctrineTypes.find((item) => item.id === presetKind);
    feedback.textContent = `${doctrine?.name || "Doctrina"} aplicada segun porcentaje de capacidad.`;
  }
}

function fillMaxMarchPlanner(markerId) {
  const marker = mapMarkers.find((item) => item.id === markerId);
  const planner = sheetBody.querySelector(`[data-march-target="${markerId}"]`);
  if (!marker || !planner) return;

  const troops = maxMarchTroops(marker);
  troopCatalog.forEach((troop) => {
    const input = planner.querySelector(`[data-march-troop="${troop.id}"]`);
    if (input) input.value = troops[troop.id] || 0;
  });

  const heroInput = planner.querySelector("[data-march-hero]");
  const heroId = defaultHeroForMarch(marker);
  if (heroInput && !heroInput.disabled && marker.kind === "monster") heroInput.checked = Boolean(heroId);
  setMarchPlannerHero(planner, heroId);
  updateMarchPlannerSummary(planner);
}

function clearMarchPlanner(markerId) {
  const planner = sheetBody.querySelector(`[data-march-target="${markerId}"]`);
  if (!planner) return;
  planner.querySelectorAll("[data-march-troop]").forEach((input) => {
    input.value = 0;
  });
  const heroInput = planner.querySelector("[data-march-hero]");
  if (heroInput && !heroInput.disabled) heroInput.checked = false;
  updateMarchPlannerSummary(planner);
}

function renderMarchHeroToggle(marker, withHero) {
  const mandatory = marker.kind === "monster";
  const hasHero = Boolean(defaultHeroForMarch(marker));
  return `
    <label class="hero-toggle ${hasHero ? "" : "is-disabled"}">
      <input type="checkbox" data-march-hero ${withHero ? "checked" : ""} ${mandatory || !hasHero ? "disabled" : ""} />
      <span>${mandatory ? "Heroe obligatorio" : "Heroe"}</span>
    </label>
  `;
}

function renderMarchHeroPicker(marker, selectedId) {
  return `
    <div class="march-hero-picker">
      ${heroRoster
        .map((hero) => {
          const busy = heroIsMarching(hero.id);
          const energy = Math.floor(heroState(hero.id).energy || 0);
          const energyMax = heroEnergyMax(hero.id);
          const noEnergy = marker.kind === "monster" && energy < HERO_MONSTER_ENERGY_COST;
          const unavailable = busy || noEnergy;
          const checked = hero.id === selectedId && !unavailable;
          const status = busy ? "Ocupado" : noEnergy ? `Energia ${energy}/${HERO_MONSTER_ENERGY_COST}` : `${energy}/${energyMax} energia`;
          return `
            <label class="march-hero-option ${unavailable ? "is-disabled" : ""}">
              <input type="radio" name="march-hero-${marker.id}" value="${hero.id}" data-march-hero-id ${checked ? "checked" : ""} ${unavailable ? "disabled" : ""} />
              <img src="${hero.portrait}" alt="" loading="lazy" />
              <span>
                <strong>${hero.name.replace(/^Don /, "")}</strong>
                <small>${status}</small>
              </span>
            </label>
          `;
        })
        .join("")}
    </div>
  `;
}

function setMarchPlannerHero(planner, heroId) {
  const hero = heroId ? heroById(heroId) : null;
  planner.querySelectorAll("[data-march-hero-id]").forEach((input) => {
    input.checked = Boolean(hero && input.value === hero.id && !input.disabled);
  });
}

function updateMarchPlannerSummary(planner) {
  const marker = mapMarkers.find((item) => item.id === planner.dataset.marchTarget);
  const summary = planner.querySelector("[data-planner-summary]");
  const preview = planner.querySelector("[data-march-preview]");
  if (!marker || !summary) return;
  const plan = readMarchPlan(marker);
  const totalSelected = plan ? Object.values(plan.troops).reduce((sum, value) => sum + value, 0) : 0;
  const load = plan ? troopBundleLoad(plan.troops) : 0;
  const storageFree = marker.kind === "resource"
    ? Math.max(0, resourceCapacity(marker.resource || "iron") - (state.resources[marker.resource || "iron"] || 0))
    : load;
  const visibleLoad = marker.kind === "resource" ? Math.min(load, resourceTileState(marker).remaining, storageFree) : load;
  const overLimit = totalSelected > maxMarchSize();
  summary.innerHTML = `
    <div class="${overLimit ? "is-over-limit" : ""}"><span>Tropas</span><strong>${formatNumber(totalSelected)} / ${formatNumber(maxMarchSize())}</strong></div>
    <div><span>${marker.kind === "resource" ? "Recolecta" : "Carga"}</span><strong>${formatNumber(visibleLoad)}</strong></div>
    <div><span>Ida</span><strong>${plan ? formatDuration(plan.durationMs) : "--"}</strong></div>
  `;
  if (preview) preview.innerHTML = renderMarchPreview(marker, plan);
}

function renderMarchPreview(marker, plan) {
  if (!plan) {
    return `
      <div class="march-preview-empty">
        <strong>Sin tropas seleccionadas</strong>
        <span>Elige una composicion para estimar ataque, defensa y riesgo.</span>
      </div>
    `;
  }

  if (marker.kind === "resource") {
    const load = troopBundleLoad(plan.troops);
    const tile = resourceTileState(marker);
    const resource = marker.resource || "iron";
    const storageFree = Math.max(0, resourceCapacity(resource) - (state.resources[resource] || 0));
    const collectable = Math.min(load, tile.remaining, storageFree);
    return `
      <div class="march-preview-head">
        <span>Recoleccion prevista${plan.withHero ? ` con ${heroDisplayName(plan.heroId)}` : ""}</span>
        <strong>${formatNumber(collectable)} / ${formatNumber(tile.remaining)}</strong>
      </div>
      <div class="planner-summary">
        <div><span>Ocupacion</span><strong>${formatDuration(plan.gatherDurationMs)}</strong></div>
        <div><span>Regreso</span><strong>${formatDuration(plan.returnDurationMs)}</strong></div>
        <div><span>Carga total</span><strong>${formatNumber(load)}</strong></div>
      </div>
      <p>${tile.depleted ? `Casilla agotada. Rellena en ${formatDuration(tile.refillMs)}.` : `Almacen libre: ${formatNumber(storageFree)}. Quedarian ${formatNumber(Math.max(0, tile.remaining - collectable))} tras esta marcha.`}</p>
    `;
  }

  const projection = marchCombatProjection(marker, plan);
  const raidPreview = marker.kind === "enemy" ? renderRaidPreview(marker, plan) : "";
  return `
    <div class="march-preview-head march-preview-head--${projection.tone}">
      <span>${projection.title}</span>
      <strong>${projection.label}</strong>
    </div>
    <div class="planner-summary">
      <div><span>Ataque</span><strong>${formatNumber(projection.attack)}</strong></div>
      <div><span>Def. objetivo</span><strong>${formatNumber(projection.targetDefense)}</strong></div>
      <div><span>Heridos est.</span><strong>${formatNumber(projection.wounded)}</strong></div>
    </div>
    ${projection.counterLabel ? `<p class="counter-preview ${projection.counterBonus >= 0 ? "is-good" : "is-bad"}">${projection.counterLabel}</p>` : ""}
    <p>${projection.note}</p>
    ${raidPreview}
  `;
}

function renderRaidPreview(marker, plan) {
  const exposed = enemyLootableResources(marker, enemyResourceStock(marker));
  const capacity = troopBundleLoad(plan.troops);
  const loadable = capResourceBundleByLoad(exposed, capacity);
  return `
    <p>Botin expuesto: ${formatResourceBundle(exposed) || "sin recursos"}. Tu carga puede traer: ${formatResourceBundle(loadable) || "0"}.</p>
  `;
}

function marchCombatProjection(marker, plan) {
  const defenderTroops = marker.kind === "enemy" ? enemyGarrison(marker) : null;
  const army = armyCombatBreakdown(plan.troops, {
    includeWall: false,
    targetKind: marker.kind,
    defenderTroops,
    withHero: plan.withHero,
    heroId: plan.heroId
  });
  const targetDefense = targetDefenseValue(marker);
  const outcome = combatOutcome(army.attack, targetDefense, troopBundleCount(plan.troops), marker.kind);
  const ratio = targetDefense > 0 ? army.attack / targetDefense : 1;
  const title = marker.kind === "monster" ? "Prevision de caza" : "Prevision de ataque";
  const label = ratio >= 1.25 ? "Ventaja" : ratio >= 0.95 ? "Ajustado" : "Riesgo";
  const tone = ratio >= 1.25 ? "good" : ratio >= 0.95 ? "warn" : "danger";
  const heroText = plan.withHero
    ? marker.kind === "monster"
      ? ` ${heroDisplayName(plan.heroId)} suma +${formatNumber(army.monsterBonus)}% contra monstruos.`
      : ` ${heroDisplayName(plan.heroId)} va al mando.`
    : "";
  const note =
    ratio >= 1.25
      ? `La marcha supera claramente la defensa objetivo.${heroText}`
      : ratio >= 0.95
        ? `La marcha puede ganar, pero las bajas seran mas visibles.${heroText}`
        : `Conviene subir ataque, llevar heroe, usar Maximo o convocar rally.${heroText}`;

  return {
    title,
    label,
    tone,
    attack: army.attack,
    targetDefense,
    wounded: outcome.wounded,
    counterBonus: army.counterBonus || 0,
    counterLabel: army.counter?.label || "",
    note
  };
}

function openWorldMarch(id) {
  const march = state.marches.find((item) => item.id === id);
  if (!march) return;
  activeSheetMode = "worldMarch";
  activeWorldMarchId = id;
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeReportId = null;
  activeRallyId = null;
  const marker = mapMarkers.find((item) => item.id === march.markerId);
  const remaining = Math.max(0, march.arriveAt - Date.now());

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${march.targetName}</h2>
        <p>${marchStatusText(march)} en ${marker?.name || "casilla del mundo"}.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Estado</span><strong>${marchPhaseName(march.phase)}</strong></div>
      <div><span>Tiempo</span><strong>${formatDuration(remaining)}</strong></div>
      <div><span>Castillo</span><strong>${formatDuration(timeUntilHome(march))}</strong></div>
    </div>
    <div class="march-detail-progress">
      <span>${marchProgressLabel(march)}</span>
      <strong>${Math.round(marchPhaseProgress(march))}%</strong>
      <i style="--progress:${marchPhaseProgress(march)}%"></i>
    </div>
    <div class="building-guidance">
      <strong>Composicion</strong>
      <p>${marchCompositionText(march, true)}</p>
    </div>
    <div class="world-meta">
      <div><span>Tipo</span><strong>${marchKindName(march.kind)}</strong></div>
      <div><span>Heroe</span><strong>${march.withHero ? heroDisplayName(march.heroId).replace(/^Don /, "") : "No"}</strong></div>
      <div><span>Carga</span><strong>${formatNumber(troopBundleLoad(combineTroopBundles(march.troops, march.alliedTroops)))}</strong></div>
    </div>
    <div class="action-row">
      <button class="primary-action" type="button" data-center-march="${march.id}">
        <svg><use href="#i-map" /></svg>Localizar
      </button>
      <button class="secondary-action" type="button" data-center-marker="${march.markerId}">
        <svg><use href="#i-target" /></svg>Objetivo
      </button>
      <button class="secondary-action" type="button" data-center-marker="${HOME_MARKER_ID}">
        <svg><use href="#i-crown" /></svg>Fortaleza
      </button>
      <button class="secondary-action is-danger" type="button" data-cancel-march="${march.id}">
        <svg><use href="#i-close" /></svg>Cancelar marcha
      </button>
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${march.phase === "gathering" ? "La marcha esta ocupando esta casilla de recursos." : "Puedes seguirla directamente en el mapa."}</p>
  `;
  openSheet();
}

function closeSheet() {
  activeBuildingId = null;
  activePlotId = null;
  activeSheetMode = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  sheet.classList.remove("is-open");
  renderBuildings();
}

function getBuildingStats(building) {
  const activeQueue = activeQueueForBuilding(building.id);
  const queueStatus = activeQueue ? `${queueTypeName(activeQueue.type)} ${formatDuration(activeQueue.finishAt - Date.now())}` : null;

  if (building.kind === "hospital") {
    return {
      status: queueStatus || `${state.woundedTroops} heridos`,
      thirdLabel: "Capacidad",
      thirdValue: `${hospitalCapacity(building)} camas`,
      guideTitle: "Curar tropas",
      guideBody: `Este hospital cura tropas heridas y suma defensa. Capacidad total de hospitales: ${totalHospitalCapacity()} camas. Defensa medica: +${totalDefenseBonus()}%.`
    };
  }

  if (building.kind === "barracks") {
    return {
      status: queueStatus || `${state.trainedTroops} soldados`,
      thirdLabel: "Leva",
      thirdValue: `Nv. ${troopTierLimit()} Â· ${trainingCapacityForBuilding(building)} cola`,
      guideTitle: "Entrenar tropas",
      guideBody: `Elige tipo y cantidad de tropa. La Academia define el nivel entrenable, la velocidad y el tamano de la cola. Cola total de cuarteles: ${totalTrainingQueue()} tropas.`
    };
  }

  if (building.kind === "resource") {
    return {
      status: queueStatus || `+${resourceProductionRate(building)}/h`,
      thirdLabel: "Almacen",
      thirdValue: `${formatNumber(state.resources[building.resource] || 0)} / ${formatNumber(resourceCapacity(building.resource))}`,
      guideTitle: "Produccion de recurso",
      guideBody: `Produce automaticamente ${resourceProductionRate(building)} de ${resourceName(building.resource).toLowerCase()} por hora. No se recolecta pulsando: se acumula con el tiempo hasta el limite del Almacen Real.`
    };
  }

  if (building.kind === "storage") {
    return {
      status: "Capacidad ciudad",
      thirdLabel: "Tope",
      thirdValue: formatNumber(resourceCapacity("grain")),
      guideTitle: "Almacenamiento",
      guideBody: "Marca el limite de recursos que pueden producir tus edificios economicos. Si una reserva llega al tope, la produccion de ese recurso se detiene hasta que gastes o amplies el almacen."
    };
  }

  if (building.id === "academia") {
    return {
      status: queueStatus || `${state.researchCompleted} estudios`,
      thirdLabel: "Ramas",
      thirdValue: `${researchBranches.length}`,
      guideTitle: "Investigar mejoras",
      guideBody: "La Academia desbloquea economia, polvora, marchas y doctrinas para definir que tropas se sugieren en recoleccion, caza y ataque."
    };
  }

  if (building.id === "sabios") {
    return {
      status: `${state.wisdom.claimed}/2 cofres`,
      thirdLabel: "Reset",
      thirdValue: "Lunes",
      guideTitle: "Ganar paquetes",
      guideBody: "Elige un paquete, resuelve el reto y el premio ira al Inventario como tarjetas, aceleradores o piezas."
    };
  }

  if (building.id === "casa-alianza") {
    return {
      status: "Chat y ayudas",
      thirdLabel: "Canales",
      thirdValue: "2",
      guideTitle: "Alianza",
      guideBody: "Casa social de la Orden. Desde aqui se accede al chat de alianza, chat de reino, ayudas y rallies."
    };
  }

  return {
    status: queueStatus || building.status,
    thirdLabel: buildingIsMaxLevel(building) ? "Limite" : "Cola",
    thirdValue: buildingIsMaxLevel(building) ? `Nv. ${BUILDING_MAX_LEVEL}` : "Libre",
    guideTitle: buildingIsMaxLevel(building) ? "Nivel maximo" : "Gestionar edificio",
    guideBody: buildingIsMaxLevel(building)
      ? `Este edificio ya esta en el nivel maximo ${BUILDING_MAX_LEVEL}.`
      : `Subir al nivel siguiente mejora su bonus y aumenta el coste de futuras mejoras. El limite beta de edificios es nivel ${BUILDING_MAX_LEVEL}.`
  };
}

function getBuildingActionButtons(building) {
  if (building.id === "sabios") {
    return `
      <button class="primary-action" type="button" data-open-tab="wisdom"><svg><use href="#i-scroll" /></svg>Resolver</button>
      <button class="secondary-action" type="button" data-open-tab="inventory"><svg><use href="#i-bag" /></svg>Inventario</button>
    `;
  }

  if (building.kind === "resource") {
    return `
      ${renderBuildingLevelButton(building)}
      <button class="secondary-action" type="button" data-building-action="production:${building.id}"><svg><use href="#i-target" /></svg>Produccion</button>
    `;
  }

  if (building.kind === "hospital") {
    return `
      ${renderBuildingLevelButton(building)}
      <button class="secondary-action" type="button" data-building-action="cure:${building.id}"><svg><use href="#i-plus" /></svg>Curar heridos</button>
    `;
  }

  if (building.kind === "barracks") {
    return `
      ${renderBuildingLevelButton(building)}
      <button class="secondary-action" type="button" data-building-action="train:${building.id}"><svg><use href="#i-sword" /></svg>Entrenar</button>
    `;
  }

  const specialActions = {
    academia: `
      <button class="secondary-action" type="button" data-building-action="research:academia"><svg><use href="#i-book" /></svg>Investigar</button>
      <button class="secondary-action" type="button" data-building-action="doctrines:academia"><svg><use href="#i-map" /></svg>Doctrinas</button>
    `,
    astillero: `<button class="secondary-action" type="button" data-building-action="expedition:astillero"><svg><use href="#i-ship" /></svg>Expedicion</button>`,
    forja: `<button class="secondary-action" type="button" data-building-action="forge:forja"><svg><use href="#i-hammer" /></svg>Forjar</button>`,
    mercado: `<button class="secondary-action" type="button" data-building-action="trade:mercado"><svg><use href="#i-scroll" /></svg>Comerciar</button>`,
    muralla: `<button class="secondary-action" type="button" data-building-action="reinforce:muralla"><svg><use href="#i-shield" /></svg>Reforzar</button>`,
    "casa-alianza": `<button class="secondary-action" type="button" data-open-tab="alliance"><svg><use href="#i-shield" /></svg>Alianza</button>`
  };

  return `
    ${renderBuildingLevelButton(building)}
    ${specialActions[building.id] || `<button class="secondary-action" type="button" data-building-action="inspect:${building.id}"><svg><use href="#i-target" /></svg>Detalles</button>`}
  `;
}

function renderBuildingLevelButton(building) {
  const isMax = buildingIsMaxLevel(building);
  const upgradeCheck = buildingUpgradeCheck(building);
  const disabled = isMax || !upgradeCheck.ok;
  return `
    <button class="primary-action" type="button" data-building-action="level:${building.id}" ${disabled ? "disabled" : ""} title="${upgradeCheck.reason || ""}">
      <svg><use href="#${building.icon}" /></svg>${isMax ? `Nivel ${BUILDING_MAX_LEVEL}` : upgradeCheck.ok ? "Subir nivel" : "Bloqueado"}
    </button>
  `;
}

function runBuildingAction(command) {
  const feedback = document.querySelector("#sheetFeedback");
  const [action, id] = command.includes(":") ? command.split(":") : ["level", command];
  const building = resolveVisibleBuilding(id);
  if (!building) {
    feedback.textContent = "Informe listo. Este edificio tendra arbol propio en la siguiente version.";
    return;
  }

  if (action === "level") {
    const cost = buildingLevelCost(building);
    const upgradeCheck = buildingUpgradeCheck(building);

    if (buildingIsMaxLevel(building)) {
      feedback.textContent = `${building.name} ya esta en el nivel maximo ${BUILDING_MAX_LEVEL}.`;
      return;
    }

    if (!upgradeCheck.ok) {
      feedback.textContent = upgradeCheck.reason;
      return;
    }

    if (hasActiveQueue("construction")) {
      feedback.textContent = "Ya hay una construccion en marcha.";
      return;
    }

    if (!canPay(cost)) {
      feedback.textContent = `Faltan recursos para subir el nivel: ${formatCost(cost)}.`;
      return;
    }

    payCost(cost);
    createQueue("construction", building, queueDuration("construction", building), { level: nextBuildingLevel(building) }, building.name);
    refreshBuildingSheet(building.id, `${building.name}: mejora a nivel ${nextBuildingLevel(building)} iniciada.`);
    renderResources();
    saveState();
    return;
  }

  if (action === "cure") {
    renderHealingEditor(building.id);
    return;
  }

  if (action === "train") {
    renderTrainingEditor(building.id);
    return;
  }

  if (action === "production") {
    renderResourceBuildingSheet(
      building,
      `${building.name} produce automaticamente. Reserva: ${formatNumber(state.resources[building.resource] || 0)} / ${formatNumber(resourceCapacity(building.resource))}.`
    );
    return;
  }

  if (action === "research") {
    renderAcademyOverview();
    return;
  }

  if (action === "doctrines") {
    renderDoctrineEditor();
    return;
  }

  if (action === "forge") {
    renderForge();
    return;
  }

  if (action === "expedition" || action === "trade" || action === "reinforce") {
    feedback.textContent = "Accion preparada. La convertiremos en timer cuando montemos las colas.";
    return;
  }

  feedback.textContent = "Este edificio tendra mas detalles en la siguiente version.";
}

function refreshBuildingSheet(id, message) {
  openBuilding(id);
  const feedback = document.querySelector("#sheetFeedback");
  if (feedback && message) feedback.textContent = message;
}

function refreshOpenSheet(message = "") {
  if (!sheet.classList.contains("is-open")) return;

  if (activeSheetMode === "building" && activeBuildingId) {
    refreshBuildingSheet(activeBuildingId, message);
    return;
  }

  if (activeSheetMode === "plot" && activePlotId) {
    openFortressPlot(activePlotId);
    const feedback = document.querySelector("#sheetFeedback");
    if (feedback && message) feedback.textContent = message;
    return;
  }

  if (activeSheetMode === "training" && activeBuildingId) {
    renderTrainingEditor(activeBuildingId, message);
    return;
  }

  if (activeSheetMode === "healing" && activeBuildingId) {
    renderHealingEditor(activeBuildingId, message);
    return;
  }

  if (activeSheetMode === "research") {
    renderResearchTree(academyBranchId, message);
    return;
  }

  if (activeSheetMode === "doctrines") {
    renderDoctrineEditor(message);
    return;
  }

  if (activeSheetMode === "map" && activeMapMarkerId) {
    openMapMarker(activeMapMarkerId);
    const feedback = document.querySelector("#sheetFeedback");
    if (feedback && message) feedback.textContent = message;
    return;
  }

  if (activeSheetMode === "worldMarch" && activeWorldMarchId) {
    if (state.marches.some((march) => march.id === activeWorldMarchId)) {
      openWorldMarch(activeWorldMarchId);
    } else if ((state.reports || [])[0]) {
      openReport(state.reports[0].id);
    } else {
      closeSheet();
    }
    return;
  }

  if (activeSheetMode === "report" && activeReportId) {
    if ((state.reports || []).some((report) => report.id === activeReportId)) openReport(activeReportId);
    return;
  }

  if (activeSheetMode === "rally" && activeRallyId) {
    if ((state.rallies || []).some((rally) => rally.id === activeRallyId)) {
      openRallyDetail(activeRallyId);
    } else {
      closeSheet();
    }
    return;
  }

  if (activeSheetMode === "allianceMember" && activeAllianceMemberId) {
    openAllianceMemberSheet(activeAllianceMemberId);
    return;
  }

  if (activeSheetMode === "forge") {
    renderForge(message);
    return;
  }

  if (activeSheetMode === "convoy") {
    openAllianceConvoySheet(message);
    return;
  }

  if (activeSheetMode === "allianceShop") {
    openAllianceShopSheet(message);
    return;
  }

  if (activeSheetMode === "allianceProjects") {
    openAllianceProjectsSheet(message);
  }
}

function cureTroops(building) {
  const feedback = document.querySelector("#sheetFeedback");
  if (hasActiveQueue("healing")) {
    feedback.textContent = "Ya hay una curacion en marcha.";
    return;
  }

  const wounded = state.woundedTroops;
  if (wounded <= 0) {
    feedback.textContent = "No hay tropas heridas que curar.";
    return;
  }

  const capacity = hospitalCapacity(building);
  const toHeal = Math.min(wounded, capacity);
  const cost = { grain: toHeal * 4, silver: Math.ceil(toHeal * 1.5) };
  if (!canPay(cost)) {
    feedback.textContent = `Faltan recursos: ${formatCost(cost)}.`;
    return;
  }

  payCost(cost);
  createQueue("healing", building, queueDuration("healing", building, toHeal), { toHeal }, `${building.name} ${toHeal}`);
  refreshBuildingSheet(building.id, `${building.name}: curacion de ${toHeal} tropas iniciada.`);
  renderResources();
  saveState();
}

function renderHealingEditor(buildingId, message = "") {
  const building = buildings.find((item) => item.id === buildingId);
  if (!building) return;
  activeBuildingId = buildingId;
  activeSheetMode = "healing";

  const activeQueue = state.queues.healing;
  const capacity = hospitalCapacity(building);
  const wounded = woundedTroopTotal();
  const selection = defaultHealingSelection(capacity);
  const totalBeds = totalHospitalCapacity();
  const freeBeds = hospitalBedsFree();

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${building.name}</h2>
        <p>Elige que tropas heridas quieres curar y cuantas camas usar.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Heridos</span><strong>${formatNumber(wounded)}</strong></div>
      <div><span>Camas ciudad</span><strong>${formatNumber(wounded)} / ${formatNumber(totalBeds)}</strong></div>
      <div><span>Libres</span><strong>${formatNumber(freeBeds)}</strong></div>
      <div><span>Velocidad</span><strong>+${researchLevel("healing-speed") * 5}%</strong></div>
    </div>
    ${activeQueue ? `<div class="research-active">Curando ${activeQueue.label} Â· ${formatDuration(activeQueue.finishAt - Date.now())}</div>` : ""}
    <div class="planner-summary healing-summary" data-healing-summary>
      ${renderHealingSummaryMarkup(selection, capacity, building)}
    </div>
    ${
      wounded
        ? `<div class="training-list" data-healing-editor="${building.id}">
            ${troopCatalog
              .filter((troop) => (state.woundedByTroop?.[troop.id] || 0) > 0)
              .map((troop) => renderHealingCard(troop, selection[troop.id] || 0, activeQueue))
              .join("")}
          </div>
          <div class="planner-actions">
            <button class="primary-action" type="button" data-heal-submit="${building.id}" ${activeQueue ? "disabled" : ""}><svg><use href="#i-plus" /></svg>Curar seleccion</button>
            <button class="secondary-action" type="button" data-heal-fill="${building.id}" ${activeQueue ? "disabled" : ""}><svg><use href="#i-target" /></svg>Maximo</button>
            <button class="secondary-action" type="button" data-heal-clear ${activeQueue ? "disabled" : ""}><svg><use href="#i-close" /></svg>Vaciar</button>
          </div>`
        : `<div class="empty-inventory">No hay tropas heridas. Cuando vuelvan de combate apareceran aqui por tipo.</div>`
    }
    <p class="challenge-feedback" id="sheetFeedback">${message}</p>
  `;
  openSheet();
}

function renderMarkerIntel(marker) {
  if (marker.kind === "monster") {
    const quality = monsterDropQuality(marker);
    const base = forgeMaterialBases[marker.material || "frag-sword"];
    const materialAmount = monsterMaterialAmount(marker);
    const silver = monsterSilverReward(marker);
    const xp = monsterXpReward(marker);
    const hunt = monsterState(marker);
    const healthPct = hunt.max ? Math.round((hunt.health / hunt.max) * 100) : 0;
    const unlocked = marker.level <= monsterTierLimit();
    const heroId = defaultHeroForMarch(marker);
    const heroText = heroId
      ? `${heroDisplayName(heroId).replace(/^Don /, "")} listo`
      : "Sin heroe con energia";
    return `
      <div class="building-guidance marker-intel marker-intel--monster" style="--monster-quality:${quality.color}">
        <div class="monster-intel-head">
          ${renderMonsterToken(marker)}
          <div>
            <strong>${monsterThreatLabel(marker)}</strong>
            <p>${marker.body}</p>
          </div>
        </div>
        <div class="monster-intel-grid">
          <div><span>Salud</span><strong>${formatNumber(hunt.health)} / ${formatNumber(hunt.max)}</strong></div>
          <div><span>Energia</span><strong>${HERO_MONSTER_ENERGY_COST}</strong></div>
          <div><span>Plata</span><strong>${formatNumber(silver)}</strong></div>
          <div><span>XP heroe</span><strong>${formatNumber(xp)}</strong></div>
          <div><span>Piezas</span><strong>${materialAmount} ${quality.label}</strong></div>
          <div><span>Estado</span><strong>${hunt.defeated ? `Respawn ${formatDuration(hunt.respawnMs)}` : unlocked ? heroText : `Rastreo Nv. ${marker.level}`}</strong></div>
        </div>
        <div class="monster-health-meter">
          <span style="--monster-health:${healthPct}%"></span>
        </div>
        <p class="monster-drop-line">${base?.name || "Pieza de equipo"}: color ${quality.label}. ${hunt.defeated ? "Monstruo derrotado; espera a que reaparezca." : "La recompensa completa llega al derrotarlo; el dano parcial queda guardado."}</p>
      </div>
    `;
  }

  if (marker.kind === "resource") {
    const reserved = resourceTileReserved(marker.id);
    const tile = resourceTileState(marker);
    return `
      <div class="building-guidance marker-intel marker-intel--resource">
        <strong>${reserved ? "Casilla ocupada" : tile.depleted ? "Casilla agotada" : `Tile de ${resourceName(marker.resource)}`}</strong>
        <p>${reserved ? "Ya tienes una marcha trabajando o viajando a esta casilla. Espera a que vuelva al castillo para enviar otra." : tile.depleted ? `No queda stock ahora mismo. Regeneracion completa en ${formatDuration(tile.refillMs)}.` : `Stock actual ${formatNumber(tile.remaining)} / ${formatNumber(tile.max)}. La marcha ocupa la casilla y vuelve con lo recolectado al almacen.`}</p>
        <div class="resource-tile-meter">
          <span style="--resource-left:${tile.max ? Math.round((tile.remaining / tile.max) * 100) : 0}%"></span>
        </div>
        <div class="resource-tile-grid">
          <div><span>Stock</span><strong>${formatNumber(tile.remaining)}</strong></div>
          <div><span>Maximo</span><strong>${formatNumber(tile.max)}</strong></div>
          <div><span>Relleno</span><strong>${tile.refillMs ? formatDuration(tile.refillMs) : "Lleno"}</strong></div>
        </div>
      </div>
    `;
  }

  if (marker.kind === "enemy") {
    return renderEnemyStateIntel(marker);
  }

  return "";
}

function renderEnemyStateIntel(marker) {
  const intel = enemyIntel(marker);
  const troopTotal = troopBundleCount(intel.troops);
  const woundedTotal = troopBundleCount(intel.wounded);
  const stockTotal = resourceBundleTotal(intel.stock);
  const lootTotal = resourceBundleTotal(intel.loot);
  const hospitalLabel = `${formatNumber(intel.hospitalUsed)} / ${formatNumber(intel.hospital)}`;
  return `
    <div class="building-guidance marker-intel marker-intel--enemy">
      <strong>${marker.alliance ? `Alianza ${marker.alliance}` : "Castillo rival"} - ${enemyStateLabel(intel)}</strong>
      <p>Defensa actual ${formatNumber(intel.defense)}. Los ataques reducen guarnicion y recursos de este castillo; los heridos rivales quedan acumulados hasta que el servidor implemente curacion rival.</p>
      <div class="enemy-state-grid">
        <div><span>Guarnicion</span><strong>${formatNumber(troopTotal)}</strong></div>
        <div><span>Heridos</span><strong>${hospitalLabel}</strong></div>
        <div><span>Camas libres</span><strong>${formatNumber(intel.hospitalFree)}</strong></div>
        <div><span>Recursos</span><strong>${formatNumber(stockTotal)}</strong></div>
        <div><span>Botin expuesto</span><strong>${formatNumber(lootTotal)}</strong></div>
        <div><span>Riesgo</span><strong>${intel.risk}</strong></div>
      </div>
      <div class="enemy-state-detail">
        <div><strong>Tropas restantes</strong><p>${formatTroopBundle(intel.troops) || "Sin guarnicion"}</p></div>
        <div><strong>Hospital rival</strong><p>${formatTroopBundle(intel.wounded) || "Sin heridos"}</p></div>
        <div><strong>Recursos detectados</strong><p>${formatResourceBundle(intel.stock) || "Sin recursos"}</p></div>
      </div>
    </div>
  `;
}

function enemyStateLabel(intel) {
  const troopTotal = troopBundleCount(intel.troops);
  if (troopTotal <= 0) return "sin guarnicion";
  if (intel.hospitalUsed >= intel.hospital) return "hospital lleno";
  if (intel.hospitalUsed > 0) return "heridos acumulados";
  return "defensa activa";
}

function markerRewardLabel(marker) {
  if (marker.kind === "resource") {
    const tile = resourceTileState(marker);
    return `${resourceName(marker.resource)} ${formatNumber(tile.remaining)}`;
  }
  if (marker.kind === "monster") return `${monsterDropQuality(marker).label} + ${formatNumber(monsterSilverReward(marker))} plata`;
  return marker.reward || "--";
}

function monsterThreatLabel(marker) {
  if (marker.level >= 9) return "Caza imperial";
  if (marker.level >= 5) return "Caza avanzada";
  return "Caza comun";
}

function monsterRewardPreview(marker) {
  const quality = monsterDropQuality(marker);
  const base = forgeMaterialBases[marker.material || "frag-sword"];
  const silver = monsterSilverReward(marker);
  return `${quality.label} ${base?.name || "pieza"} + ${formatNumber(silver)} plata + XP`;
}

function monsterMaxHealth(marker) {
  return 520 + (marker?.level || 1) * 185;
}

function monsterRespawnMs(marker) {
  return MONSTER_RESPAWN_BASE_MS + (marker?.level || 1) * 60000;
}

function monsterState(marker, now = Date.now()) {
  if (!marker?.id) return { health: 0, max: 0, defeated: true, defeatedUntil: now, respawnMs: 0 };
  if (!state.monsterStates) state.monsterStates = {};
  const max = monsterMaxHealth(marker);
  const saved = state.monsterStates[marker.id] || {};
  let health = saved.health === undefined ? max : Math.min(max, Math.max(0, Math.floor(Number(saved.health) || 0)));
  let defeatedUntil = Math.max(0, Math.floor(Number(saved.defeatedUntil) || 0));
  let updatedAt = Math.max(0, Math.floor(Number(saved.updatedAt) || now));

  if (defeatedUntil && now >= defeatedUntil) {
    health = max;
    defeatedUntil = 0;
    updatedAt = now;
  }

  if (health <= 0 && !defeatedUntil) {
    defeatedUntil = now + monsterRespawnMs(marker);
    updatedAt = now;
  }

  const defeated = defeatedUntil > now || health <= 0;
  const respawnMs = defeated ? Math.max(0, defeatedUntil - now) : 0;
  state.monsterStates[marker.id] = { health, max, defeatedUntil, updatedAt };
  return { health, max, defeated, defeatedUntil, respawnMs, updatedAt };
}

function applyMonsterDamage(marker, combat) {
  const before = monsterState(marker);
  const damage = Math.min(before.health, Math.max(1, Math.round((combat.attack || 0) * (combat.victory ? 1.05 : 0.5))));
  const healthAfter = Math.max(0, before.health - damage);
  const killed = healthAfter <= 0;
  const defeatedUntil = killed ? Date.now() + monsterRespawnMs(marker) : 0;
  state.monsterStates[marker.id] = {
    health: healthAfter,
    max: before.max,
    defeatedUntil,
    updatedAt: Date.now()
  };
  return {
    damage,
    healthBefore: before.health,
    healthAfter,
    max: before.max,
    killed,
    defeatedUntil,
    respawnMs: killed ? monsterRespawnMs(marker) : 0
  };
}

function monsterSilverReward(marker) {
  return Math.round((260 + marker.level * 95) * (1 + monsterRewardBonus() / 100));
}

function monsterXpReward(marker) {
  return Math.round((180 + marker.level * 70) * (1 + researchLevel("hero-xp-boost") * 0.06));
}

function monsterMaterialAmount(marker) {
  return marker.level >= 9 ? 3 : marker.level >= 5 ? 2 : 1;
}

function monsterSpeedReward(marker, hunt) {
  const reward = {};
  if (!hunt?.killed) {
    if ((hunt?.damage || 0) > 0 && marker.level <= 4) reward["speed-build-5"] = 1;
    return reward;
  }
  reward["speed-build-5"] = 1 + Math.floor(marker.level / 4);
  if (marker.level >= 3) reward["speed-training-5"] = 1;
  if (marker.level >= 5) reward["speed-build-15"] = 1;
  if (marker.level >= 7) reward["speed-research-15"] = 1;
  return reward;
}

function monsterDropQuality(marker) {
  return forgeQualities[monsterDropQualityIndex(marker)];
}

function monsterDropQualityIndex(marker) {
  return Math.min(forgeQualities.length - 1, Math.max(0, Math.floor((marker.level - 1) / 2)));
}

function resourceTileCapacity(marker) {
  const base = marker.resource === "silver" ? 900 : 1800;
  return Math.round(base + marker.level * (marker.resource === "silver" ? 520 : 1150));
}

function resourceTileState(marker, now = Date.now()) {
  if (!marker?.id) return { remaining: 0, max: 0, updatedAt: now, refillMs: 0, depleted: true };
  if (!state.resourceTiles) state.resourceTiles = {};
  const max = resourceTileCapacity(marker);
  const saved = state.resourceTiles[marker.id] || {};
  const savedRemaining = saved.remaining === undefined ? max : Number(saved.remaining);
  let remaining = Math.min(max, Math.max(0, Math.floor(Number.isFinite(savedRemaining) ? savedRemaining : max)));
  let updatedAt = Math.max(0, Math.floor(Number(saved.updatedAt) || now));

  if (remaining < max && now > updatedAt) {
    const refill = Math.floor(((now - updatedAt) / RESOURCE_TILE_REFILL_MS) * max);
    if (refill > 0) {
      remaining = Math.min(max, remaining + refill);
      updatedAt = now;
    }
  }

  const refillMs = remaining >= max ? 0 : Math.ceil(((max - remaining) / max) * RESOURCE_TILE_REFILL_MS);
  state.resourceTiles[marker.id] = { remaining, max, updatedAt };
  return {
    remaining,
    max,
    updatedAt,
    refillMs,
    depleted: remaining <= 0
  };
}

function harvestResourceTile(marker, requestedLoad = 0) {
  const tile = resourceTileState(marker);
  const amount = Math.max(0, Math.min(tile.remaining, Math.floor(Number(requestedLoad) || 0)));
  const remaining = Math.max(0, tile.remaining - amount);
  const updatedAt = Date.now();
  state.resourceTiles[marker.id] = { remaining, max: tile.max, updatedAt };
  return {
    amount,
    remaining,
    max: tile.max,
    depleted: remaining <= 0,
    refillMs: remaining <= 0 ? RESOURCE_TILE_REFILL_MS : Math.ceil(((tile.max - remaining) / tile.max) * RESOURCE_TILE_REFILL_MS)
  };
}

function buildResourceTileSnapshot() {
  return mapMarkers
    .filter((marker) => marker.kind === "resource")
    .map((marker) => {
      const tile = resourceTileState(marker);
      return {
        markerId: marker.id,
        name: marker.name,
        resource: marker.resource,
        level: marker.level || 1,
        coord: markerWorldCoord(marker),
        sector: markerSectorLabel(marker),
        remaining: tile.remaining,
        max: tile.max,
        refillMs: tile.refillMs,
        depleted: tile.depleted,
        reserved: resourceTileReserved(marker.id)
      };
    });
}

function buildMonsterTargetSnapshot() {
  return mapMarkers
    .filter((marker) => marker.kind === "monster")
    .map((marker) => {
      const hunt = monsterState(marker);
      return {
        markerId: marker.id,
        name: marker.name,
        level: marker.level || 1,
        coord: markerWorldCoord(marker),
        sector: markerSectorLabel(marker),
        material: marker.material || "frag-sword",
        quality: monsterDropQuality(marker).id,
        health: hunt.health,
        maxHealth: hunt.max,
        defeated: hunt.defeated,
        defeatedUntil: hunt.defeatedUntil,
        respawnMs: hunt.respawnMs,
        silverReward: monsterSilverReward(marker),
        xpReward: monsterXpReward(marker),
        materialReward: monsterMaterialAmount(marker)
      };
    });
}

function renderHealingCard(troop, defaultAmount, activeQueue) {
  const wounded = state.woundedByTroop?.[troop.id] || 0;
  return `
    <article class="training-card healing-card" data-heal-card="${troop.id}">
      <div>
        <span>${troop.role}</span>
        <strong>${troop.name}</strong>
        <p>Heridos disponibles: ${formatNumber(wounded)}. Curarlos devuelve estas tropas al ejercito activo.</p>
      </div>
      <div class="research-outcome">
        <span>Valores recuperados</span>
        <strong>Ataque ${troopAttack(troop)} Â· Defensa ${troopDefense(troop)}</strong>
      </div>
      <label class="train-amount">
        <span>Cantidad</span>
        <input type="number" min="0" max="${wounded}" step="1" inputmode="numeric" value="${defaultAmount}" data-heal-amount="${troop.id}" ${activeQueue ? "disabled" : ""} />
      </label>
    </article>
  `;
}

function renderHealingSummaryMarkup(selection, capacity, building) {
  const total = troopBundleCount(selection);
  const overLimit = total > capacity;
  const cost = healingCost(total);
  return `
    <div class="${overLimit ? "is-over-limit" : ""}"><span>Seleccion</span><strong>${formatNumber(total)} / ${formatNumber(capacity)}</strong></div>
    <div><span>Coste</span><strong>${total ? formatCost(cost) : "--"}</strong></div>
    <div><span>Tiempo</span><strong>${total ? formatDuration(queueDuration("healing", building, total)) : "--"}</strong></div>
  `;
}

function defaultHealingSelection(capacity) {
  const selection = {};
  let remaining = capacity;
  troopCatalog.forEach((troop) => {
    if (remaining <= 0) return;
    const wounded = state.woundedByTroop?.[troop.id] || 0;
    const amount = Math.min(wounded, remaining);
    if (amount > 0) selection[troop.id] = amount;
    remaining -= amount;
  });
  return selection;
}

function fillHealingEditor(buildingId) {
  const building = buildings.find((item) => item.id === buildingId);
  if (!building) return;
  const selection = defaultHealingSelection(hospitalCapacity(building));
  sheetBody.querySelectorAll("[data-heal-amount]").forEach((input) => {
    input.value = selection[input.dataset.healAmount] || 0;
  });
  updateHealingSummary();
}

function clearHealingEditor() {
  sheetBody.querySelectorAll("[data-heal-amount]").forEach((input) => {
    input.value = 0;
  });
  updateHealingSummary();
}

function updateHealingSummary() {
  const editor = sheetBody.querySelector("[data-healing-editor]");
  const summary = sheetBody.querySelector("[data-healing-summary]");
  if (!editor || !summary) return;
  const building = buildings.find((item) => item.id === editor.dataset.healingEditor);
  if (!building) return;
  const selection = readHealingSelection();
  summary.innerHTML = renderHealingSummaryMarkup(selection, hospitalCapacity(building), building);
}

function readHealingSelection() {
  const selection = {};
  sheetBody.querySelectorAll("[data-heal-amount]").forEach((input) => {
    const troopId = input.dataset.healAmount;
    const wounded = state.woundedByTroop?.[troopId] || 0;
    const raw = Number(input.value || 0);
    const value = Math.min(wounded, Math.max(0, Math.floor(Number.isFinite(raw) ? raw : 0)));
    input.value = value;
    if (value > 0) selection[troopId] = value;
  });
  return selection;
}

function startSelectedHealing(buildingId) {
  const building = buildings.find((item) => item.id === buildingId);
  if (!building) return;

  if (hasActiveQueue("healing")) {
    renderHealingEditor(building.id, "Ya hay una curacion en marcha.");
    return;
  }

  const selection = readHealingSelection();
  const total = troopBundleCount(selection);
  if (total <= 0) {
    renderHealingEditor(building.id, "Selecciona tropas heridas para curar.");
    return;
  }

  const capacity = hospitalCapacity(building);
  if (total > capacity) {
    renderHealingEditor(building.id, `Este hospital puede curar ${formatNumber(capacity)} tropas por cola.`);
    return;
  }

  const cost = healingCost(total);
  if (!canPay(cost)) {
    renderHealingEditor(building.id, `Faltan recursos: ${formatCost(cost)}.`);
    return;
  }

  payCost(cost);
  createQueue("healing", building, queueDuration("healing", building, total), { toHeal: total, troops: selection }, `${formatNumber(total)} heridos`);
  renderResources();
  renderQueueStrip();
  renderHealingEditor(building.id, `Curacion de ${formatNumber(total)} tropas iniciada.`);
  saveState();
}

function healingCost(amount) {
  return {
    grain: amount * 4,
    silver: Math.ceil(amount * 1.5)
  };
}

function woundedTroopTotal() {
  return Object.values(state.woundedByTroop || {}).reduce((sum, amount) => sum + Math.max(0, Math.floor(amount || 0)), 0);
}

function normalizeWoundedState(enforceCapacity = false) {
  if (!state.woundedByTroop) state.woundedByTroop = {};
  let remainingBeds = enforceCapacity ? totalHospitalCapacity() : Infinity;
  const clean = {};

  troopCatalog.forEach((troop) => {
    if (remainingBeds <= 0) return;
    const amount = Math.max(0, Math.floor(Number(state.woundedByTroop[troop.id]) || 0));
    const kept = Math.min(amount, remainingBeds);
    if (kept > 0) clean[troop.id] = kept;
    remainingBeds -= kept;
  });

  state.woundedByTroop = clean;
  state.woundedTroops = woundedTroopTotal();
}

function hospitalBedsUsed() {
  return woundedTroopTotal();
}

function hospitalBedsFree() {
  return Math.max(0, totalHospitalCapacity() - hospitalBedsUsed());
}

function runPaidBuildingAction(building, cost, apply) {
  const feedback = document.querySelector("#sheetFeedback");
  if (!canPay(cost)) {
    feedback.textContent = `Faltan recursos: ${formatCost(cost)}.`;
    return;
  }

  payCost(cost);
  const message = apply();
  refreshBuildingSheet(building.id, message);
  renderResources();
  saveState();
}

function renderForge(message = "", focusId = "") {
  activeBuildingId = "forja";
  activeSheetMode = "forge";
  const totalPieces = countInventoryByCategory("equipment");
  const forgedCount = Object.values(state.heroEquipment || {}).filter((item) => item?.level > 0).length;
  const activeCount = activeLoadoutEquipmentCount();
  const activeLoadout = equipmentLoadoutById();
  const activeTotal = loadoutRecipeCount(activeLoadout.id);

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>Forja de Artilleria</h2>
        <p>Forja elementos del equipo del heroe y subelos de nivel con fragmentos.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Piezas</span><strong>${formatNumber(totalPieces)}</strong></div>
      <div><span>Forjadas</span><strong>${forgedCount}/${forgeRecipes.length}</strong></div>
      <div><span>Perfil</span><strong>${activeLoadout.name}</strong></div>
    </div>
    <div class="building-guidance">
      <strong>Perfil ${activeLoadout.name}</strong>
      <p>${activeCount}/${activeTotal} piezas activas. ${equipmentSetBonusText(activeLoadout.id)}.</p>
    </div>
    ${renderLoadoutBonusBreakdown(activeLoadout.id)}
    ${renderForgeQualityScale()}
    ${renderEquipmentLoadoutButtons()}
    <div class="forge-list">
      ${forgeRecipes.map((recipe) => renderForgeRecipe(recipe, focusId === recipe.id)).join("")}
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${message}</p>
  `;
  openSheet();
}

function renderForgeQualityScale() {
  return `
    <div class="forge-quality-scale">
      ${forgeQualities
        .map(
          (quality, index) => `
            <span style="--quality:${quality.color}">
              <i></i>${quality.label} x${equipmentQualityMultiplier(index).toFixed(2)}
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

function renderForgeRecipe(recipe, focused = false) {
  const level = equipmentLevel(recipe.id);
  const maxed = level >= MAX_EQUIPMENT_LEVEL;
  const nextLevel = Math.min(MAX_EQUIPMENT_LEVEL, level + 1);
  const fragmentNeed = forgeFragmentNeed(level);
  const minQualityIndex = forgeRequiredQualityIndex(recipe.id, nextLevel);
  const selectedQualityIndex = selectForgeQualityIndex(recipe.fragment, minQualityIndex, fragmentNeed);
  const previewQualityIndex = selectedQualityIndex ?? minQualityIndex;
  const quality = forgeQualities[previewQualityIndex];
  const fragmentHave = selectedQualityIndex === null ? bestForgeMaterialCount(recipe.fragment, minQualityIndex) : forgeMaterialCount(recipe.fragment, selectedQualityIndex);
  const cost = nextForgeCost(recipe, level);
  const fragmentItem = forgeMaterialBases[recipe.fragment];
  const canForge = !maxed && selectedQualityIndex !== null && canPay(cost);
  const activeInProfile = equipmentActiveInLoadout(recipe);
  const activeProfile = equipmentLoadoutById();

  return `
    <article class="forge-card ${focused ? "is-focused" : ""} ${activeInProfile ? "is-equipped" : ""}">
      <div class="forge-icon"><svg><use href="#${recipe.icon}" /></svg></div>
      <div class="forge-main">
        <span>${recipe.slot} - Nv. ${level}/${MAX_EQUIPMENT_LEVEL}</span>
        <strong>${recipe.name}</strong>
        <p>${level ? `Activo: ${formatEquipmentBonus(recipe, level, equipmentQualityIndex(recipe.id))}` : `Siguiente: ${formatEquipmentBonus(recipe, nextLevel, previewQualityIndex)}`}</p>
        ${!maxed ? `<p class="forge-quality-preview" style="--quality:${quality.color}">${selectedQualityIndex === null ? `Minimo ${quality.label} - ${formatNumber(fragmentHave)} / ${formatNumber(fragmentNeed)} piezas iguales` : `Usara ${formatNumber(fragmentNeed)} piezas ${quality.label}. Resultado ${quality.label} x${equipmentQualityMultiplier(previewQualityIndex).toFixed(2)}`}</p>` : ""}
        <div class="forge-meta">
          <div><span>Color</span><strong>${maxed ? forgeQualities[equipmentQualityIndex(recipe.id)].label : quality.label}</strong></div>
          <div><span>Coste</span><strong>${maxed ? "Completo" : formatCost(cost)}</strong></div>
        </div>
        ${renderForgeQualityComparison(recipe, maxed ? level : nextLevel, minQualityIndex, previewQualityIndex)}
        <p class="forge-requirement">${activeInProfile ? `Activa en perfil ${activeProfile.name}` : `${fragmentItem?.name || recipe.fragment} - minimo ${forgeQualities[minQualityIndex].label}`}</p>
        ${renderForgeMaterialRows(recipe.fragment)}
      </div>
      <button class="inventory-use" type="button" data-forge-item="${recipe.id}" ${maxed ? "disabled" : ""}>
        ${maxed ? "Max." : level ? "Mejorar" : "Forjar"}
      </button>
    </article>
    ${!canForge && !maxed ? `<p class="forge-hint">${forgeMissingText(recipe, fragmentHave, fragmentNeed, cost, quality)}</p>` : ""}
  `;
}

function renderForgeQualityComparison(recipe, level, minQualityIndex = 0, selectedQualityIndex = 0) {
  return `
    <div class="forge-quality-comparison">
      ${forgeQualities
        .map((quality, index) => {
          const belowMinimum = index < minQualityIndex;
          const selected = index === selectedQualityIndex;
          return `
            <div class="${belowMinimum ? "is-locked" : ""} ${selected ? "is-selected" : ""}" style="--quality:${quality.color}">
              <span>${quality.label}</span>
              <strong>x${equipmentQualityMultiplier(index)}</strong>
              <small>${formatCompactEquipmentBonus(recipe, level, index)}</small>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function startForgeItem(id) {
  const recipe = forgeRecipeById(id);
  if (!recipe) return;
  if (!state.heroEquipment) state.heroEquipment = {};
  const level = equipmentLevel(recipe.id);
  if (level >= MAX_EQUIPMENT_LEVEL) {
    renderForge(`${recipe.name} ya esta al maximo.`, recipe.id);
    return;
  }

  const fragmentNeed = forgeFragmentNeed(level);
  const minQualityIndex = forgeRequiredQualityIndex(recipe.id, level + 1);
  const qualityIndex = selectForgeQualityIndex(recipe.fragment, minQualityIndex, fragmentNeed);
  const cost = nextForgeCost(recipe, level);

  if (qualityIndex === null) {
    const bestCount = bestForgeMaterialCount(recipe.fragment, minQualityIndex);
    renderForge(`Faltan piezas iguales ${forgeQualities[minQualityIndex].label} o superior: ${formatNumber(bestCount)} / ${formatNumber(fragmentNeed)}.`, recipe.id);
    return;
  }

  if (!canPay(cost)) {
    renderForge(`Faltan recursos: ${formatCost(cost)}.`, recipe.id);
    return;
  }

  payCost(cost);
  consumeForgeMaterials(recipe.fragment, qualityIndex, fragmentNeed);
  state.heroEquipment[recipe.id] = { id: recipe.id, level: level + 1, qualityIndex: Math.max(equipmentQualityIndex(recipe.id), qualityIndex) };
  state.power += 760 + (level + 1) * 220;

  const action = level ? "mejorado" : "forjado";
  recordServerEvent("forge.item", {
    itemId: recipe.id,
    itemName: recipe.name,
    action,
    level: level + 1,
    quality: forgeQualities[qualityIndex].id,
    fragment: recipe.fragment,
    fragmentNeed,
    cost
  });
  addAllianceFeed("Forja del heroe", `${recipe.name} ${action} a nivel ${level + 1} (${forgeQualities[qualityIndex].label}).`);
  renderResources();
  renderInventory();
  renderMilitary();
  renderHeroEquipment();
  renderAllianceFeed();
  renderForge(`${recipe.name} ${action} a nivel ${level + 1} (${forgeQualities[qualityIndex].label}).`, recipe.id);
  saveState();
}

function forgeRecipeById(id) {
  return forgeRecipes.find((recipe) => recipe.id === id);
}

function equipmentLevel(id) {
  return Math.max(0, Number(state.heroEquipment?.[id]?.level || 0));
}

function equipmentQualityIndex(id) {
  const saved = state.heroEquipment?.[id]?.qualityIndex;
  if (Number.isFinite(saved)) return Math.min(forgeQualities.length - 1, Math.max(0, saved));
  return Math.min(forgeQualities.length - 1, Math.max(0, equipmentLevel(id) - 1));
}

function forgeFragmentNeed(level) {
  return Math.max(1, 2 + level - Math.floor(researchLevel("material-recovery") / 4));
}

function forgeQualityForLevel(level) {
  return Math.min(forgeQualities.length - 1, Math.max(0, level - 1));
}

function forgeRequiredQualityIndex(equipmentId, nextLevel) {
  const current = equipmentLevel(equipmentId) ? equipmentQualityIndex(equipmentId) : 0;
  return Math.max(current, forgeQualityForLevel(nextLevel));
}

function selectForgeQualityIndex(baseId, minQualityIndex, amount) {
  for (let index = forgeQualities.length - 1; index >= minQualityIndex; index -= 1) {
    if (forgeMaterialCount(baseId, index) >= amount) return index;
  }
  return null;
}

function bestForgeMaterialCount(baseId, minQualityIndex) {
  return Math.max(0, ...forgeQualities.map((_quality, index) => (index >= minQualityIndex ? forgeMaterialCount(baseId, index) : 0)));
}

function forgeMaterialId(baseId, qualityIndex = 0) {
  const quality = forgeQualities[qualityIndex] || forgeQualities[0];
  return qualityIndex <= 0 || quality.id === "common" ? baseId : `${baseId}-${quality.id}`;
}

function forgeMaterialCount(baseId, qualityIndex = 0) {
  return state.inventory[forgeMaterialId(baseId, qualityIndex)] || 0;
}

function availableForgeMaterialCount(baseId, minQualityIndex = 0) {
  return forgeQualities.reduce((sum, _quality, index) => {
    if (index < minQualityIndex) return sum;
    return sum + forgeMaterialCount(baseId, index);
  }, 0);
}

function consumeForgeMaterials(baseId, minQualityIndex, amount) {
  const id = forgeMaterialId(baseId, minQualityIndex);
  const used = Math.min(state.inventory[id] || 0, amount);
  if (!used) return 0;
  state.inventory[id] -= used;
  if (state.inventory[id] <= 0) delete state.inventory[id];
  return used;
}

function renderForgeMaterialRows(baseId) {
  const hasCombinable = forgeQualities.some((_quality, index) => index < forgeQualities.length - 1 && forgeMaterialCount(baseId, index) >= 4);
  return `
    <div class="forge-quality-list">
      ${forgeQualities
        .map((quality, index) => {
          const count = forgeMaterialCount(baseId, index);
          const canCombine = count >= 4 && index < forgeQualities.length - 1;
          const nextQuality = forgeQualities[index + 1];
          return `
            <div class="forge-quality-row ${canCombine ? "can-combine" : ""}" style="--quality:${quality.color}">
              <span><i></i>${quality.label}</span>
              <strong>${formatNumber(count)}</strong>
              <button type="button" data-forge-combine="${baseId}:${index}" title="${canCombine ? `Combinar 4 ${quality.label} en 1 ${nextQuality.label}` : "Necesitas 4 piezas"}" ${canCombine ? "" : "disabled"}>
                ${canCombine ? `A ${nextQuality.label}` : "4:1"}
              </button>
            </div>
          `;
        })
        .join("")}
    </div>
    ${
      hasCombinable
        ? `<button class="forge-combine-all" type="button" data-forge-combine-all="${baseId}">Combinar maximo</button>`
        : ""
    }
  `;
}

function combineForgeMaterial(command) {
  const [baseId, rawIndex] = command.split(":");
  const qualityIndex = Number(rawIndex);
  if (!forgeMaterialBases[baseId] || !Number.isFinite(qualityIndex) || qualityIndex >= forgeQualities.length - 1) return;
  const fromId = forgeMaterialId(baseId, qualityIndex);
  const toId = forgeMaterialId(baseId, qualityIndex + 1);
  if ((state.inventory[fromId] || 0) < 4) {
    renderForge(`Necesitas 4 piezas ${forgeQualities[qualityIndex].label}.`, baseId);
    return;
  }

  state.inventory[fromId] -= 4;
  if (state.inventory[fromId] <= 0) delete state.inventory[fromId];
  state.inventory[toId] = (state.inventory[toId] || 0) + 1;
  recordServerEvent("forge.combine", {
    baseId,
    fromQuality: forgeQualities[qualityIndex].id,
    toQuality: forgeQualities[qualityIndex + 1].id,
    consumed: 4,
    created: 1
  });
  renderInventory();
  const recipe = forgeRecipes.find((item) => item.fragment === baseId);
  const remaining = state.inventory[fromId] || 0;
  const gained = state.inventory[toId] || 0;
  renderForge(
    `Combinadas 4 ${forgeQualities[qualityIndex].label} en 1 ${forgeQualities[qualityIndex + 1].label}. Quedan ${formatNumber(remaining)} ${forgeQualities[qualityIndex].label} y tienes ${formatNumber(gained)} ${forgeQualities[qualityIndex + 1].label}.`,
    recipe?.id || ""
  );
  saveState();
}

function combineAllForgeMaterials(baseId) {
  if (!forgeMaterialBases[baseId]) return;
  const conversions = {};

  forgeQualities.forEach((_quality, index) => {
    if (index >= forgeQualities.length - 1) return;
    const fromId = forgeMaterialId(baseId, index);
    const toId = forgeMaterialId(baseId, index + 1);
    const groups = Math.floor((state.inventory[fromId] || 0) / 4);
    if (groups <= 0) return;
    state.inventory[fromId] -= groups * 4;
    if (state.inventory[fromId] <= 0) delete state.inventory[fromId];
    state.inventory[toId] = (state.inventory[toId] || 0) + groups;
    conversions[index + 1] = (conversions[index + 1] || 0) + groups;
  });

  const totalConverted = Object.values(conversions).reduce((sum, amount) => sum + amount, 0);
  const recipe = forgeRecipes.find((item) => item.fragment === baseId);
  if (!totalConverted) {
    renderForge("Necesitas al menos 4 piezas del mismo color para combinar.", recipe?.id || "");
    return;
  }

  renderInventory();
  const summary = forgeQualities
    .map((quality, index) => `${quality.label} ${formatNumber(forgeMaterialCount(baseId, index))}`)
    .join(" / ");
  recordServerEvent("forge.combine", {
    baseId,
    mode: "max",
    conversions,
    totalConverted
  });
  renderForge(`Combinacion maxima aplicada. ${summary}.`, recipe?.id || "");
  saveState();
}

function nextForgeCost(recipe, level) {
  const factor = 1 + level * 0.78;
  const discount = Math.max(0.65, 1 - researchLevel("forge-efficiency") * 0.03);
  return Object.fromEntries(Object.entries(recipe.cost).map(([resource, value]) => [resource, Math.ceil(value * factor * discount)]));
}

function forgeMissingText(recipe, fragmentHave, fragmentNeed, cost, quality = forgeQualities[0]) {
  const missing = [];
  if (fragmentHave < fragmentNeed) missing.push(`faltan ${formatNumber(fragmentNeed - fragmentHave)} piezas ${quality.label}`);
  const missingResources = Object.fromEntries(Object.entries(cost).filter(([resource, value]) => (state.resources[resource] || 0) < value));
  if (Object.keys(missingResources).length) missing.push(`faltan ${formatCost(missingResources)}`);
  return missing.length ? missing.join(" y ") : "Listo para forjar.";
}

function renderTrainingEditor(buildingId, message = "") {
  const building = resolveVisibleBuilding(buildingId);
  if (!building) return;
  activeBuildingId = building.id;
  activeSheetMode = "training";
  const activeQueue = state.queues.training;
  const capacity = trainingCapacityForBuilding(building);
  const unlockedTier = troopTierLimit();

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${building.name}</h2>
        <p>Elige que tropa entrenar. El nivel disponible depende de Academia.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Nivel tropa</span><strong>${troopTierName(unlockedTier)}</strong></div>
      <div><span>Cola max.</span><strong>${formatNumber(capacity)}</strong></div>
      <div><span>Velocidad</span><strong>+${researchLevel("training-speed") * 5}%</strong></div>
    </div>
    ${activeQueue ? `<div class="research-active">Entrenando ${activeQueue.label} Â· ${formatDuration(activeQueue.finishAt - Date.now())}</div>` : ""}
    ${renderTroopTierTrack()}
    <div class="training-list">
      ${trainableTroopsForBuilding(building)
        .map((troop) => renderTrainingCard(building, troop, capacity, unlockedTier, activeQueue))
        .join("")}
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${message}</p>
  `;
  openSheet();
}

function renderTroopTierTrack() {
  const current = troopTierLimit();
  return `
    <div class="troop-tier-track">
      ${[1, 2, 3, 4, 5]
        .map((tier) => {
          const requirement = troopTierRequirement(tier);
          const unlocked = tier <= current;
          const next = tier === current + 1;
          return `
            <div class="${unlocked ? "is-unlocked" : next ? "is-next" : "is-locked"}">
              <span>${troopTierName(tier)}</span>
              <strong>${unlocked ? "Activo" : `Tropas Veteranas Nv. ${requirement}`}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderTrainingCard(building, troop, capacity, unlockedTier, activeQueue) {
  const locked = unlockedTier < troop.unlockTier;
  const defaultAmount = Math.min(capacity, troop.id === "artillery" ? 12 : troop.id === "cavalry" ? 40 : 80);
  const cost = troopTrainingCost(troop, defaultAmount, unlockedTier);
  const duration = queueDuration("training", building, defaultAmount);
  const nextTier = Math.min(5, unlockedTier + 1);
  return `
    <article class="training-card ${locked ? "is-locked" : ""}" data-train-card="${building.id}:${troop.id}">
      <div>
        <span>${locked ? `Requiere tropa Nv. ${troop.unlockTier}` : `${troop.role} Â· Nv. ${unlockedTier}`}</span>
        <strong>${troop.name}</strong>
        <p>${troop.description}</p>
      </div>
      <div class="research-outcome">
        <span>Valores por unidad</span>
        <strong>Ataque ${troopAttack(troop)} Â· Defensa ${troopDefense(troop)} Â· Carga ${troop.load}</strong>
      </div>
      <div class="tier-forecast">${unlockedTier < 5 ? `${troopTierName(nextTier)} desbloquea: Ataque ${troopAttack(troop, nextTier)} / Defensa ${troopDefense(troop, nextTier)}` : "Veterania maxima desbloqueada por Academia."}</div>
      <label class="train-amount">
        <span>Cantidad</span>
        <input type="number" min="1" max="${capacity}" step="1" inputmode="numeric" value="${defaultAmount}" data-train-amount="${troop.id}" ${locked || activeQueue ? "disabled" : ""} />
      </label>
      <div class="training-meta" data-training-meta>
        <div><span>Coste base</span><strong>${formatCost(cost)}</strong></div>
        <div><span>Tiempo</span><strong>${formatDuration(duration)}</strong></div>
      </div>
      <button class="primary-action" type="button" data-train-submit="${building.id}:${troop.id}" ${locked || activeQueue ? "disabled" : ""}>
        <svg><use href="#i-sword" /></svg>${locked ? "Bloqueada" : "Entrenar"}
      </button>
    </article>
  `;
}

function updateTrainingCard(input) {
  const card = input.closest("[data-train-card]");
  const meta = card?.querySelector("[data-training-meta]");
  if (!card || !meta) return;
  const [buildingId, troopId] = card.dataset.trainCard.split(":");
  const building = resolveVisibleBuilding(buildingId);
  const troop = troopCatalog.find((item) => item.id === troopId);
  if (!building || !troop) return;
  const capacity = trainingCapacityForBuilding(building);
  const requested = Math.floor(Number(input.value || 0));
  const amount = Math.min(capacity, Math.max(1, Number.isFinite(requested) ? requested : 1));
  input.value = amount;
  const cost = troopTrainingCost(troop, amount, troopTierLimit());
  const duration = queueDuration("training", building, amount);
  meta.innerHTML = `
    <div><span>Coste</span><strong>${formatCost(cost)}</strong></div>
    <div><span>Tiempo</span><strong>${formatDuration(duration)}</strong></div>
  `;
}

function startSelectedTraining(command) {
  const [buildingId, troopId] = command.split(":");
  const building = resolveVisibleBuilding(buildingId);
  const troop = troopCatalog.find((item) => item.id === troopId);
  if (!building || !troop) return;

  if (hasActiveQueue("training")) {
    renderTrainingEditor(building.id, "Ya hay tropas entrenandose.");
    return;
  }

  if (troopTierLimit() < troop.unlockTier) {
    renderTrainingEditor(building.id, `Investiga Tropas Veteranas para desbloquear ${troop.name}.`);
    return;
  }

  const input = sheetBody.querySelector(`[data-train-amount="${troop.id}"]`);
  const requested = Math.floor(Number(input?.value || 0));
  const amount = Math.min(trainingCapacityForBuilding(building), Math.max(1, Number.isFinite(requested) ? requested : 1));
  const tier = troopTierLimit();
  const cost = troopTrainingCost(troop, amount, tier);

  if (!canPay(cost)) {
    renderTrainingEditor(building.id, `Faltan recursos: ${formatCost(cost)}.`);
    return;
  }

  payCost(cost);
  createQueue("training", building, queueDuration("training", building, amount), { batch: amount, troops: { [troop.id]: amount }, tier, troopId: troop.id }, `${troop.name} Nv. ${tier} x${amount}`);
  renderResources();
  renderQueueStrip();
  renderTrainingEditor(building.id, `${troop.name}: entrenamiento iniciado.`);
  saveState();
}

function renderResearchTree(branchId = academyBranchId, message = "") {
  const branch = researchBranches.find((item) => item.id === branchId) || researchBranches[0];
  academyBranchId = branch.id;
  activeBuildingId = "academia";
  activeSheetMode = "research";
  const activeQueue = state.queues.research;
  const branchProgress = researchBranchProgress(branch);
  const nextUnlock = nextBranchUnlock(branch);
  const tiers = Array.from(new Set(branch.nodes.map((node) => node.tier || 1))).sort((a, b) => a - b);

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${branch.name}</h2>
        <p>Arbol de investigaciones de la Academia. Pulsa una mejora para ver su siguiente nivel.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="academy-tree-head">
      <button class="secondary-action" type="button" data-building-action="research:academia">
        <svg><use href="#i-close" /></svg>Volver a ramas
      </button>
      <div class="research-overview">
      <div><span>Rama</span><strong>${branch.name}</strong></div>
      <div><span>Progreso</span><strong>${branchProgress.completed}/${branchProgress.total}</strong></div>
      <div><span>Niveles</span><strong>${branchProgress.levels}/${branchProgress.maxLevels}</strong></div>
      </div>
    </div>
    <div class="building-guidance">
      <strong>${branch.name}</strong>
      <p>${branch.body}${nextUnlock ? ` Siguiente bloqueo: ${nextUnlock}.` : " Rama sin bloqueos pendientes."}</p>
    </div>
    ${activeQueue ? `<div class="research-active">Investigando ${activeQueue.label} Â· ${formatDuration(activeQueue.finishAt - Date.now())}</div>` : ""}
    <div class="research-tree-grid">
      ${tiers
        .map(
          (tier) => `
            <section class="research-tier">
              <header><span>Nivel de rama</span><strong>Fase ${tier}</strong></header>
              <div class="research-tier-nodes">
                ${branch.nodes.filter((node) => (node.tier || 1) === tier).map((node) => renderResearchNode(node, activeQueue)).join("")}
              </div>
            </section>
          `
        )
        .join("")}
    </div>
    <div class="planner-actions">
      <button class="secondary-action" type="button" data-building-action="doctrines:academia"><svg><use href="#i-map" /></svg>Editar doctrinas</button>
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${message}</p>
  `;
  openSheet();
}

function renderResearchNode(node, activeQueue) {
  const level = researchLevel(node.id);
  const maxed = level >= node.max;
  const locked = !researchRequirementsMet(node);
  const cost = nextResearchCost(node);
  const duration = researchDuration(node);
  const active = activeQueue?.payload?.researchId === node.id;
  const nextLevel = Math.min(node.max, level + 1);
  return `
    <article class="research-node ${active ? "is-active" : ""} ${locked ? "is-locked" : ""}">
      <div class="research-node-top">
        <span>${maxed ? "Completado" : active ? "En curso" : locked ? "Bloqueado" : "Disponible"}</span>
        <strong>${node.name}</strong>
        <p>${node.effect}</p>
      </div>
      <div class="research-outcome">
        <span>${maxed ? "Resultado actual" : "Siguiente investigacion"}</span>
        <strong>${researchOutcomeText(node.id, maxed ? level : nextLevel)}</strong>
      </div>
      <div class="research-node-meta">
        <div><span>Nivel</span><strong>${level}/${node.max}</strong></div>
        <div><span>Tiempo</span><strong>${maxed || locked ? "--" : formatDuration(duration)}</strong></div>
      </div>
      <div class="research-progress"><i style="--progress:${Math.min(100, (level / node.max) * 100)}%"></i></div>
      <p class="research-cost">${maxed ? "Investigacion al maximo." : locked ? researchRequirementText(node) : formatCost(cost)}</p>
      <button class="primary-action" type="button" data-start-research="${node.id}" ${maxed || activeQueue || locked ? "disabled" : ""}>
        <svg><use href="#i-book" /></svg>${maxed ? "Completa" : locked ? "Bloqueada" : "Investigar"}
      </button>
    </article>
  `;
}

function startResearchNode(nodeId) {
  const node = researchNodeById(nodeId);
  if (!node) return;

  if (hasActiveQueue("research")) {
    renderResearchTree(academyBranchId, "Ya hay una investigacion activa.");
    return;
  }

  if (researchLevel(node.id) >= node.max) {
    renderResearchTree(academyBranchId, "Esa investigacion ya esta al maximo.");
    return;
  }

  if (!researchRequirementsMet(node)) {
    renderResearchTree(academyBranchId, researchRequirementText(node));
    return;
  }

  const cost = nextResearchCost(node);
  if (!canPay(cost)) {
    renderResearchTree(academyBranchId, `Faltan recursos: ${formatCost(cost)}.`);
    return;
  }

  const academia = buildings.find((item) => item.id === "academia");
  payCost(cost);
  createQueue("research", academia, researchDuration(node), { researchId: node.id }, node.name);
  renderResources();
  renderQueueStrip();
  renderResearchTree(academyBranchId, `${node.name}: investigacion iniciada.`);
  saveState();
}

function researchNodeById(id) {
  return researchBranches.flatMap((branch) => branch.nodes).find((node) => node.id === id);
}

function researchLevel(id) {
  return Math.max(0, Number(state.researchLevels?.[id] || 0));
}

function researchRequirementsMet(node) {
  return (node.requires || []).every((requirement) => researchLevel(requirement.id) >= requirement.level);
}

function researchRequirementText(node) {
  const missing = (node.requires || [])
    .filter((requirement) => researchLevel(requirement.id) < requirement.level)
    .map((requirement) => {
      const requiredNode = researchNodeById(requirement.id);
      return `${requiredNode?.name || requirement.id} Nv. ${requirement.level}`;
    });
  return missing.length ? `Requiere ${missing.join(" / ")}.` : "Disponible.";
}

function researchBranchProgress(branch) {
  const levels = branch.nodes.reduce((sum, node) => sum + researchLevel(node.id), 0);
  const maxLevels = branch.nodes.reduce((sum, node) => sum + node.max, 0);
  const completed = branch.nodes.filter((node) => researchLevel(node.id) >= node.max).length;
  return { levels, maxLevels, completed, total: branch.nodes.length };
}

function nextBranchUnlock(branch) {
  const locked = branch.nodes.find((node) => !researchRequirementsMet(node));
  if (!locked) return "";
  const requirement = researchRequirementText(locked).replace("Requiere ", "").replace(/\.$/, "");
  return `${locked.name} requiere ${requirement}`;
}

function nextResearchCost(node) {
  const level = researchLevel(node.id);
  const factor = (1 + level * 0.68) * (1 + ((node.tier || 1) - 1) * 0.28);
  return Object.fromEntries(Object.entries(node.cost || {}).map(([key, value]) => [key, Math.ceil(value * factor)]));
}

function researchDuration(node) {
  const level = researchLevel(node.id);
  const speed = Math.max(0.45, 1 - researchLevel("research-method") * 0.05 - heroEquipmentBonus("research") * 0.01);
  return Math.round(node.timeMs * (1 + level * 0.45) * (1 + ((node.tier || 1) - 1) * 0.2) * speed);
}

function researchOutcomeText(id, level) {
  const value = Math.max(0, level);
  const outcomes = {
    "troop-attack": `Ataque de tropas +${value * 3}%`,
    "troop-defense": `Defensa de tropas +${value * 3}%`,
    "infantry-attack": `Piqueros ataque +${value * 4}%`,
    "ranged-attack": `Arcabuceros ataque +${value * 4}%`,
    "cavalry-attack": `Caballeria ataque +${value * 4}%`,
    "siege-attack": `Artilleria ataque +${value * 5}%`,
    "troop-health": `Heridos en combate -${value * 2}%`,
    "troop-tier": `Nivel de tropa entrenable ${Math.min(5, 1 + Math.floor(value / 2))}`,
    "march-size": `Maximo por marcha ${formatNumber(220 + value * 80)} tropas`,
    "march-speed": `Velocidad de marcha +${value * 4}%`,
    "scout-precision": `Espionaje -${value * 4}% coste`,
    "bonus-march-slot": `Slots de marcha hasta ${Math.min(6, 1 + Math.floor((buildings.find((building) => building.id === "alcazar")?.level || 1) / 4) + value)}`,
    "rally-tactics": `Refuerzo aliado en rally +${value * 5}%`,
    "rally-size": `Ataque de rally +${value * 4}%`,
    "reinforcement-capacity": `Refuerzos preparados nivel ${value}`,
    "training-capacity": `Leva +${value * 10} tropas por cola`,
    "training-speed": `Entrenamiento +${value * 5}%`,
    "wall-defense": `Defensa de muralla +${value * 4}%`,
    "garrison-defense": `Defensa de guarnicion +${value * 3}%`,
    "trap-engineering": `Trampas futuras +${value * 4}%`,
    "city-health": `Resistencia de ciudad +${value * 3}%`,
    "hospital-capacity": `Hospitales +${value * 12} camas`,
    "healing-speed": `Curacion +${value * 5}%`,
    "counter-raid": `Heridos de combate -${value * 2}%`,
    "anti-scout": `Contraespionaje nivel ${value}`,
    "monster-tier": `Cazar monstruos hasta nivel ${1 + value}`,
    "hero-monster-attack": `Heroe contra monstruos +${value * 8}%`,
    "monster-loot": `Botin de monstruos +${value * 6}%`,
    "monster-stamina": `Heridos contra monstruos -${value * 2}%`,
    "hero-energy": `Energia maxima del heroe +${value * 20}`,
    "hero-xp-boost": `Experiencia del heroe +${value * 6}%`,
    "hero-command": `Marchas con heroe +${value * 3}% ataque`,
    "resource-production": `Produccion automatica +${value * 5}%`,
    "grain-yield": `Trigo +${value * 3}%`,
    "wood-yield": `Madera +${value * 3}%`,
    "stone-yield": `Piedra +${value * 3}%`,
    "iron-yield": `Hierro +${value * 3}%`,
    "gathering-speed": `Recoleccion +${value * 6}%`,
    "troop-load": `Carga de tropas +${value * 5}%`,
    "storage-engineering": `Almacen +${formatNumber(value * 6000)} capacidad`,
    "construction-method": `Construccion +${value * 5}% velocidad`,
    "research-method": `Investigacion +${value * 5}% velocidad`,
    "forge-efficiency": `Coste de forja -${value * 3}%`,
    "material-recovery": `Piezas necesarias reducidas en mejoras altas`,
    "gear-attack": `Ataque por forja +${value * 2}%`,
    "gear-defense": `Defensa por forja +${value * 2}%`,
    "artillery-foundry": `Artilleria ataque +${value * 4}%`,
    "naval-engineering": `Galeones ataque/velocidad +${value * 3}%`
  };
  return outcomes[id] || `Nivel ${value}`;
}

function renderDoctrineEditor(message = "") {
  activeBuildingId = "academia";
  activeSheetMode = "doctrines";
  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>Doctrinas de Marcha</h2>
        <p>Define las tropas sugeridas para cada tipo de objetivo del mundo.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="doctrine-list">
      ${doctrineTypes
        .map((doctrine) => {
          const preset = normalizedMarchPreset(doctrine.id);
          const totalPercent = doctrinePercentTotal(preset.percentages);
          const previewTroops = doctrineTroopsFromPercentages(doctrine.id, preset.percentages, state.troops);
          return `
            <section class="doctrine-card" data-doctrine-kind="${doctrine.id}">
              <div class="planner-head">
                <div>
                  <strong>${doctrine.name}</strong>
                  <span>${doctrine.body} Total ${totalPercent}% de capacidad.</span>
                </div>
                <label class="hero-toggle ${doctrine.id === "monster" ? "is-disabled" : ""}">
                  <input type="checkbox" data-doctrine-hero ${preset.withHero ? "checked" : ""} ${doctrine.id === "monster" ? "checked disabled" : ""} />
                  <span>Heroe</span>
                </label>
              </div>
              <div class="troop-selector">
                ${troopCatalog
                  .map(
                    (troop) => `
                      <label class="troop-selector-row">
                        <span>
                          <strong>${troop.name}</strong>
                          <small>${troop.role}</small>
                        </span>
                        <input type="number" min="0" max="100" step="1" inputmode="numeric" value="${preset.percentages?.[troop.id] || 0}" data-doctrine-percent="${troop.id}" aria-label="${doctrine.name} ${troop.name} porcentaje" />
                      </label>
                    `
                  )
                  .join("")}
              </div>
              <div class="doctrine-preview ${totalPercent > 100 ? "is-over-limit" : ""}" data-doctrine-preview>
                <span>Total ${totalPercent}% - ${formatNumber(troopBundleCount(previewTroops))}/${formatNumber(maxMarchSize())} tropas</span>
                <strong>${formatTroopBundle(previewTroops) || "Sin tropas asignadas"}</strong>
              </div>
              <div class="doctrine-tools">
                <button type="button" data-doctrine-normalize>Normalizar 100%</button>
                <button type="button" data-doctrine-clear>Vaciar</button>
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
    <div class="planner-actions">
      <button class="primary-action" type="button" data-doctrine-save><svg><use href="#i-book" /></svg>Guardar</button>
      <button class="secondary-action" type="button" data-doctrine-reset><svg><use href="#i-close" /></svg>Restablecer</button>
      <button class="secondary-action" type="button" data-building-action="research:academia"><svg><use href="#i-map" /></svg>Arbol</button>
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${message}</p>
  `;
  openSheet();
}

function doctrinePercentagesFromCard(card) {
  const percentages = {};
  card?.querySelectorAll("[data-doctrine-percent]").forEach((input) => {
    const raw = Number(input.value || 0);
    const value = Math.min(100, Math.max(0, Math.round(Number.isFinite(raw) ? raw : 0)));
    if (value > 0) percentages[input.dataset.doctrinePercent] = value;
  });
  return percentages;
}

function setDoctrineCardPercentages(card, percentages = {}) {
  card?.querySelectorAll("[data-doctrine-percent]").forEach((input) => {
    input.value = percentages[input.dataset.doctrinePercent] || 0;
  });
  updateDoctrineCardPreview(card);
}

function normalizeDoctrineCard(card) {
  if (!card) return;
  const kind = card.dataset.doctrineKind;
  const current = doctrinePercentagesFromCard(card);
  const source = doctrinePercentTotal(current) ? current : normalizedMarchPreset(kind).percentages;
  setDoctrineCardPercentages(card, normalizePercentagesTo100(source));
}

function clearDoctrineCard(card) {
  if (!card) return;
  setDoctrineCardPercentages(card, {});
}

function normalizePercentagesTo100(percentages = {}) {
  const entries = troopCatalog
    .map((troop) => [troop.id, Math.max(0, Number(percentages[troop.id] || 0))])
    .filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (!total) return {};

  const raw = entries.map(([id, value]) => {
    const exact = (value / total) * 100;
    return { id, value: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let missing = 100 - raw.reduce((sum, item) => sum + item.value, 0);
  raw
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((item) => {
      if (missing <= 0) return;
      item.value += 1;
      missing -= 1;
    });

  return compactPercentages(Object.fromEntries(raw.map((item) => [item.id, item.value])));
}

function updateDoctrineCardPreview(card) {
  if (!card) return;
  const preview = card.querySelector("[data-doctrine-preview]");
  if (!preview) return;
  const kind = card.dataset.doctrineKind;
  const percentages = doctrinePercentagesFromCard(card);
  const total = doctrinePercentTotal(percentages);
  const troops = doctrineTroopsFromPercentages(kind, percentages, state.troops);
  preview.classList.toggle("is-over-limit", total > 100);
  preview.innerHTML = `
    <span>Total ${total}% - ${formatNumber(troopBundleCount(troops))}/${formatNumber(maxMarchSize())} tropas</span>
    <strong>${formatTroopBundle(troops) || "Sin tropas asignadas"}</strong>
  `;
}

function saveDoctrineEditor() {
  const next = {};
  let invalid = false;
  let invalidName = "";
  sheetBody.querySelectorAll("[data-doctrine-kind]").forEach((card) => {
    const kind = card.dataset.doctrineKind;
    const percentages = doctrinePercentagesFromCard(card);
    const total = doctrinePercentTotal(percentages);
    if (total > 100) {
      invalid = true;
      invalidName = doctrineTypes.find((item) => item.id === kind)?.name || kind;
    }
    next[kind] = {
      percentages,
      withHero: kind === "monster" || Boolean(card.querySelector("[data-doctrine-hero]")?.checked)
    };
  });
  if (invalid) {
    renderDoctrineEditor(`${invalidName}: los porcentajes no pueden superar el 100%.`);
    return;
  }
  state.marchPresets = next;
  renderDoctrineEditor("Doctrinas guardadas. Mundo calculara tropas por porcentaje de capacidad.");
  saveState();
}

function resetDoctrineEditor() {
  state.marchPresets = structuredClone(defaultState.marchPresets);
  renderDoctrineEditor("Doctrinas restablecidas.");
  saveState();
}

function runMarkerAction(markerId) {
  const feedback = document.querySelector("#sheetFeedback");
  const [command, commandTarget] = String(markerId || "").split(":");

  if (command === "share-alliance" || command === "share-kingdom") {
    const channel = command === "share-kingdom" ? "kingdom" : "alliance";
    const marker = markerById(commandTarget || activeMapMarkerId);
    shareMarkerToChat(marker.id, channel);
    if (feedback) feedback.textContent = `${marker.name} compartido en ${channel === "kingdom" ? "Reino" : "Alianza"}.`;
    return;
  }

  if (markerId === "bookmark") {
    toggleWorldBookmark(activeMapMarkerId);
    const marker = markerById(activeMapMarkerId);
    const marked = (state.worldBookmarks || []).some((bookmark) => bookmark.markerId === activeMapMarkerId);
    if (feedback) feedback.textContent = marked ? `${marker.name} marcado en ${markerCoordLabel(marker)}.` : `${marker.name} quitado de marcadores.`;
    renderMap();
    saveState();
    return;
  }

  const marker = mapMarkers.find((item) => item.id === markerId);
  if (!marker) return;

  const result = startMarch(marker, readMarchPlan(marker));
  if (!result.ok) {
    if (feedback) feedback.textContent = result.message;
    return;
  }

  closeSheet();
  renderMap();
  renderMilitary();
  renderAllianceFeed();
  saveState();
}

function shareMarkerToChat(markerId, channel = "alliance") {
  const marker = markerById(markerId);
  if (!marker) return;
  const targetChannel = channel === "kingdom" ? "kingdom" : "alliance";
  const message = `Objetivo ${marker.name} ${markerCoordLabel(marker)} ${markerSectorLabel(marker)} - ${marchKindName(marker.kind)} Nv.${marker.level || 0}`;
  addChatMessage(targetChannel, message, "Tu imperio", { markerId: marker.id, coord: markerWorldCoord(marker) });
  addAllianceFeed("Coordenadas compartidas", `${marker.name} enviado al chat de ${targetChannel === "kingdom" ? "reino" : "alianza"}.`);
  renderAllianceFeed();
  saveState();
}

function toggleWorldBookmark(markerId) {
  const marker = markerById(markerId);
  if (!marker) return;
  const bookmarks = normalizeWorldBookmarks(state.worldBookmarks || []);
  const exists = bookmarks.some((bookmark) => bookmark.markerId === marker.id);
  state.worldBookmarks = exists
    ? bookmarks.filter((bookmark) => bookmark.markerId !== marker.id)
    : [
        {
          markerId: marker.id,
          name: marker.name,
          kind: marker.kind,
          coord: markerWorldCoord(marker),
          at: Date.now()
        },
        ...bookmarks
      ].slice(0, 8);
}

function scoutTarget(markerId) {
  const feedback = document.querySelector("#sheetFeedback");
  const marker = mapMarkers.find((item) => item.id === markerId);
  if (!marker || marker.kind !== "enemy") return;

  const cost = scoutCost(marker);
  if (!canPay(cost)) {
    feedback.textContent = `Faltan recursos para espiar: ${formatCost(cost)}.`;
    return;
  }

  payCost(cost);
  const report = addScoutReport(marker);
  recordServerEvent("scout.target", {
    markerId: marker.id,
    targetName: marker.name,
    coord: markerWorldCoord(marker),
    cost,
    reportId: report.id
  });
  addAllianceFeed("Exploradores", `${marker.name}: informe de espionaje recibido.`);
  renderResources();
  renderMap();
  renderMilitary();
  renderHeroEquipment();
  renderAllianceFeed();
  openReport(report.id);
  saveState();
}

function scoutCost(marker) {
  const reduction = Math.min(0.5, researchLevel("scout-precision") * 0.04);
  return { silver: Math.max(20, Math.round((70 + marker.level * 15) * (1 - reduction))) };
}

function addScoutReport(marker) {
  const intel = enemyIntel(marker);
  const totalResources = resourceBundleTotal(intel.stock);
  const report = {
    id: `r${Date.now()}`,
    kind: "scout",
    markerId: marker.id,
    coord: markerWorldCoord(marker),
    targetName: marker.name,
    summary: `Recursos detectados ${formatNumber(totalResources)}. Defensa ${formatNumber(intel.defense)}. ${intel.risk}: ${intel.recommendation}`,
    deliveryText: "",
    loot: intel.loot,
    stock: intel.stock,
    inventory: null,
    boosts: null,
    troops: {},
    withHero: false,
    wounded: 0,
    woundedByTroop: {},
    scout: intel,
    createdAt: Date.now()
  };
  state.reports.unshift(report);
  state.reports = state.reports.slice(0, 20);
  return report;
}

function enemyIntel(marker) {
  const level = marker.level || 1;
  const troops = enemyGarrison(marker);
  const wall = enemyWallValue(marker);
  const hospital = enemyHospitalCapacity(marker);
  const wounded = enemyWounded(marker);
  const hospitalUsed = troopBundleCount(wounded);
  const hospitalFree = Math.max(0, hospital - hospitalUsed);
  const defense = targetDefenseValue(marker);
  const stock = enemyResourceStock(marker);
  const loot = enemyLootableResources(marker, stock);
  const protectedResources = subtractResourceBundles(stock, loot);
  const ownAttack = armyPowerTotals(availableTroops(), { includeWall: false, targetKind: "enemy" }).attack;
  const ratio = defense > 0 ? ownAttack / defense : 1;
  const risk = ratio >= 1.25 ? "Ventaja clara" : ratio >= 0.92 ? "Combate ajustado" : "Riesgo alto";
  const recommendation =
    ratio >= 1.25
      ? "Puedes atacar con una marcha maxima y priorizar artilleria y arcabuceros."
      : ratio >= 0.92
        ? "Conviene llevar heroe o mejorar ataque antes de enviar toda la marcha."
        : "Mejor investigar ataque, forjar equipo o pedir ayuda de alianza antes de atacar.";

  return {
    level,
    defense,
    wall,
    hospital,
    hospitalUsed,
    hospitalFree,
    troops,
    wounded,
    stock,
    loot,
    protected: protectedResources,
    ownAttack,
    risk,
    recommendation
  };
}

function enemyGarrison(marker) {
  if (!state.enemyTroops) state.enemyTroops = {};
  const saved = state.enemyTroops[marker.id];
  if (saved) return compactTroops(saved);
  const initial = initialEnemyGarrison(marker);
  state.enemyTroops[marker.id] = initial;
  return { ...initial };
}

function initialEnemyGarrison(marker) {
  const level = marker.level || 1;
  return {
    pikemen: 180 + level * 26,
    musketeers: 120 + level * 22,
    cavalry: 55 + level * 11,
    artillery: 8 + Math.floor(level * 1.8)
  };
}

function enemyWounded(marker) {
  if (!state.enemyWounded) state.enemyWounded = {};
  return compactTroops(state.enemyWounded[marker.id] || {});
}

function enemyWallValue(marker) {
  return 520 + (marker.level || 1) * 95;
}

function enemyHospitalCapacity(marker) {
  return 180 + (marker.level || 1) * 42;
}

function enemyGarrisonDefense(marker, troops = enemyGarrison(marker)) {
  const level = marker.level || 1;
  const baseDefense = Object.entries(troops || {}).reduce((sum, [id, amount]) => {
    const troop = troopCatalog.find((item) => item.id === id);
    return sum + (troop?.defense || 0) * amount;
  }, 0);
  const troopFactor = Math.min(0.44, 0.22 + level * 0.01);
  return Math.max(1, Math.round(enemyWallValue(marker) + baseDefense * troopFactor));
}

function applyEnemyDefenderLosses(marker, combat, march) {
  if (!marker?.id) return { losses: {}, troopsAfter: {} };
  if (!state.enemyTroops) state.enemyTroops = {};
  if (!state.enemyWounded) state.enemyWounded = {};
  const current = enemyGarrison(marker);
  const currentWounded = enemyWounded(marker);
  const losses = estimateEnemyDefenderLosses(current, combat, march);
  const freeBeds = Math.max(0, enemyHospitalCapacity(marker) - troopBundleCount(currentWounded));
  const hospitalized = estimateWoundedTroops(losses, Math.min(freeBeds, troopBundleCount(losses)));
  const deaths = subtractTroopBundles(losses, hospitalized);
  const troopsAfter = subtractTroopBundles(current, losses);
  const woundedAfter = combineTroopBundles(currentWounded, hospitalized);
  state.enemyTroops[marker.id] = troopsAfter;
  state.enemyWounded[marker.id] = woundedAfter;
  return { losses, hospitalized, deaths, troopsAfter, woundedAfter };
}

function estimateEnemyDefenderLosses(troops, combat, march) {
  const defenderCount = troopBundleCount(troops);
  const attackerCount = troopBundleCount(combineTroopBundles(march.troops, march.alliedTroops));
  if (!defenderCount || !attackerCount) return {};

  const ratio = combat.targetDefense > 0 ? combat.attack / combat.targetDefense : 1;
  const rallyMultiplier = march.isRally ? 1.2 : 1;
  const pressure = combat.victory
    ? 0.09 + Math.min(0.22, ratio * 0.08)
    : 0.03 + Math.min(0.11, ratio * 0.05);
  const lossRate = Math.min(combat.victory ? 0.36 : 0.18, pressure * rallyMultiplier);
  const byGarrison = Math.round(defenderCount * lossRate);
  const byAttackers = Math.round(attackerCount * Math.min(0.85, 0.2 + ratio * 0.22) * rallyMultiplier);
  const requested = Math.min(defenderCount, Math.max(combat.victory ? 3 : 1, Math.min(byGarrison, byAttackers)));

  return estimateWoundedTroops(troops, requested);
}

function subtractTroopBundles(total = {}, part = {}) {
  const ids = new Set([...Object.keys(total || {}), ...Object.keys(part || {})]);
  const next = {};
  ids.forEach((id) => {
    const amount = Math.max(0, Math.round((total[id] || 0) - (part[id] || 0)));
    if (amount > 0) next[id] = amount;
  });
  return next;
}

function enemyResourceStock(marker) {
  if (!state.enemyResources) state.enemyResources = {};
  const saved = state.enemyResources[marker.id];
  if (saved) return compactResourceBundle(saved);
  const initial = initialEnemyResourceStock(marker);
  state.enemyResources[marker.id] = initial;
  return { ...initial };
}

function initialEnemyResourceStock(marker) {
  const level = marker.level || 1;
  const wealth = {
    SN: 0.92,
    LE: 1.18,
    MR: 1.05,
    OD: 1.08
  }[marker.alliance] || 1;
  const coastal = marker.icon === "i-ship" ? 1.18 : 1;
  const base = Math.round((level * level * 145 + level * 760) * wealth * coastal);
  return {
    grain: Math.round(base * 1.25),
    wood: Math.round(base * 0.86),
    stone: Math.round(base * 0.7),
    iron: Math.round(base * 0.46),
    silver: Math.round(base * 0.28)
  };
}

function applyEnemyRaid(marker, resources = {}) {
  if (!marker?.id) return {};
  if (!state.enemyResources) state.enemyResources = {};
  const current = enemyResourceStock(marker);
  const next = subtractResourceBundles(current, resources);
  state.enemyResources[marker.id] = next;
  return next;
}

function enemyLootableResources(marker, stock) {
  const level = marker.level || 1;
  const protection = Math.min(0.72, 0.36 + level * 0.025);
  const exposed = Math.max(0.12, 1 - protection);
  const caps = {
    grain: 520 + level * 80,
    wood: 260 + level * 46,
    stone: 220 + level * 40,
    iron: 160 + level * 34,
    silver: 180 + level * 35
  };

  return Object.fromEntries(
    Object.entries(stock).map(([resource, amount]) => [
      resource,
      Math.max(0, Math.min(Math.round(amount * exposed), caps[resource] || amount))
    ])
  );
}

function resolveEnemyRaidReward(marker, march, combat) {
  const stock = enemyResourceStock(marker);
  const exposed = enemyLootableResources(marker, stock);
  const successFactor = Math.min(1, (combat.victory ? 1 : 0.35) * (march.isRally ? 1.15 : 1));
  const eligible = scaleResourceBundle(exposed, successFactor);
  const capacity = troopBundleLoad(combineTroopBundles(march.troops, march.alliedTroops));
  const resources = capResourceBundleByLoad(eligible, capacity);
  const stockAfter = applyEnemyRaid(marker, resources);

  return {
    stock,
    exposed,
    eligible,
    resources,
    stockAfter,
    capacity,
    successFactor
  };
}

function scaleResourceBundle(bundle = {}, factor = 1) {
  return compactResourceBundle(
    Object.fromEntries(
      Object.entries(bundle).map(([resource, amount]) => [
        resource,
        Math.max(0, Math.floor((amount || 0) * factor))
      ])
    )
  );
}

function capResourceBundleByLoad(bundle = {}, maxLoad = 0) {
  const total = resourceBundleTotal(bundle);
  if (!total || maxLoad <= 0) return {};
  if (total <= maxLoad) return compactResourceBundle(bundle);
  return scaleResourceBundle(bundle, maxLoad / total);
}

function compactResourceBundle(bundle = {}) {
  return Object.fromEntries(
    Object.entries(bundle)
      .map(([resource, amount]) => [resource, Math.max(0, Math.floor(amount || 0))])
      .filter(([, amount]) => amount > 0)
  );
}

function subtractResourceBundles(total = {}, part = {}) {
  return Object.fromEntries(
    Object.entries(total).map(([resource, amount]) => [
      resource,
      Math.max(0, Math.round(amount - (part[resource] || 0)))
    ])
  );
}

function createRallyFromMarker(markerId) {
  const feedback = document.querySelector("#sheetFeedback");
  const marker = mapMarkers.find((item) => item.id === markerId);
  if (!marker || marker.kind !== "enemy") return;

  if ((state.rallies || []).length >= rallySlots()) {
    feedback.textContent = `Ya tienes ${rallySlots()} rally activo. Lanza o cancela uno antes de convocar otro.`;
    return;
  }

  const plan = readMarchPlan(marker);
  if (!plan) {
    feedback.textContent = "Selecciona tus tropas para abrir el rally.";
    return;
  }

  if (!hasTroopsAvailable(plan.troops)) {
    feedback.textContent = "No hay tropas disponibles para reservar en el rally.";
    return;
  }

  const troopCount = troopBundleCount(plan.troops);
  if (troopCount > maxMarchSize()) {
    feedback.textContent = `Tu investigacion permite ${formatNumber(maxMarchSize())} tropas propias por marcha.`;
    return;
  }

  if (plan.withHero && heroIsMarching(plan.heroId)) {
    feedback.textContent = `${heroDisplayName(plan.heroId)} ya esta ocupado.`;
    return;
  }

  const cost = rallyCost(marker);
  if (!canPay(cost)) {
    feedback.textContent = `Faltan recursos para convocar: ${formatCost(cost)}.`;
    return;
  }

  payCost(cost);
  const now = Date.now();
  const rally = {
    id: `a${state.rallySequence++}`,
    markerId: marker.id,
    targetName: marker.name,
    createdAt: now,
    launchAt: now + rallyDuration(marker),
    troops: plan.troops,
    alliedTroops: rallyAlliedTroops(marker, plan.troops),
    withHero: plan.withHero,
    heroId: plan.heroId
  };

  state.rallies.push(rally);
  addAllianceFeed("Rally convocado", `${marker.name}: esperando tropas aliadas.`);
  renderResources();
  renderMap();
  renderMilitary();
  renderRallies();
  renderAllianceFeed();
  openRallyDetail(rally.id);
  saveState();
}

function rallySlots() {
  const alcazar = buildings.find((building) => building.id === "alcazar");
  return Math.max(1, Math.min(3, Math.floor((alcazar?.level || 1) / 7) + 1));
}

function rallyCost(marker) {
  return { silver: 140 + marker.level * 22 };
}

function rallyDuration(marker) {
  return Math.max(12000, 28000 + marker.level * 1500 - researchLevel("march-speed") * 1200);
}

function rallyAlliedTroops(marker, ownTroops = {}) {
  const ownCount = troopBundleCount(ownTroops);
  const level = marker.level || 1;
  const base = Math.max(80, Math.round((ownCount * 0.72 + level * 18) * (1 + researchLevel("rally-tactics") * 0.05)));
  return compactTroops({
    pikemen: Math.round(base * 0.34),
    musketeers: Math.round(base * 0.4),
    cavalry: Math.round(base * 0.18),
    artillery: Math.max(4, Math.round(base * 0.08))
  });
}

function rallyPowerTotals(rally) {
  return armyPowerTotals(combineTroopBundles(rally.troops, rally.alliedTroops), { includeWall: false, targetKind: "enemy", withHero: rally.withHero, heroId: rally.heroId, isRally: true });
}

function openRallyDetail(id) {
  const rally = (state.rallies || []).find((item) => item.id === id);
  if (!rally) return;
  activeSheetMode = "rally";
  activeRallyId = id;
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  const remaining = Math.max(0, rally.launchAt - Date.now());
  const power = rallyPowerTotals(rally);

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>Rally contra ${rally.targetName}</h2>
        <p>La alianza reunira tropas y lanzara el ataque cuando termine la espera.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Salida</span><strong>${formatDuration(remaining)}</strong></div>
      <div><span>Ataque</span><strong>${formatNumber(power.attack)}</strong></div>
      <div><span>Defensa</span><strong>${formatNumber(power.defense)}</strong></div>
    </div>
      <div class="building-guidance">
        <strong>Tus tropas</strong>
        <p>${formatTroopBundle(rally.troops)}${rally.withHero ? ` - ${heroDisplayName(rally.heroId)} al mando` : ""}</p>
      </div>
    <div class="building-guidance">
      <strong>Refuerzos aliados</strong>
      <p>${formatTroopBundle(rally.alliedTroops)}</p>
    </div>
    <div class="action-row">
      <button class="primary-action" type="button" data-rally-launch="${rally.id}"><svg><use href="#i-target" /></svg>Lanzar ahora</button>
      <button class="secondary-action is-danger" type="button" data-rally-cancel="${rally.id}"><svg><use href="#i-close" /></svg>Cancelar</button>
    </div>
    <p class="challenge-feedback" id="sheetFeedback">El rally reserva tus tropas hasta lanzarse o cancelarse.</p>
  `;
  openSheet();
}

function launchRallyById(id) {
  const rally = (state.rallies || []).find((item) => item.id === id);
  if (!rally) return;
  state.rallies = state.rallies.filter((item) => item.id !== id);
  const launched = createMarchFromRally(rally);
  if (!launched) {
    rally.launchAt = Date.now() + 10000;
    state.rallies.push(rally);
    openRallyDetail(rally.id);
    const feedback = document.querySelector("#sheetFeedback");
    if (feedback) feedback.textContent = "No hay slot libre para lanzar el rally. Se retrasa 10s.";
    saveState();
    return;
  }

  addAllianceFeed("Rally lanzado", `${rally.targetName}: la alianza marcha al objetivo.`);
  closeSheet();
  renderMap();
  renderMilitary();
  renderRallies();
  renderAllianceFeed();
  saveState();
}

function cancelRallyById(id) {
  const rally = (state.rallies || []).find((item) => item.id === id);
  if (!rally) return;
  state.rallies = state.rallies.filter((item) => item.id !== id);
  addAllianceFeed("Rally cancelado", `${rally.targetName}: tropas liberadas.`);
  closeSheet();
  renderMap();
  renderMilitary();
  renderRallies();
  renderAllianceFeed();
  saveState();
}

function resourceTileReserved(markerId) {
  return state.marches.some((march) => march.kind === "resource" && march.markerId === markerId);
}

function createMarchFromRally(rally) {
  if (state.marches.length >= marchSlots()) return false;
  const marker = markerById(rally.markerId);
  const combined = combineTroopBundles(rally.troops, rally.alliedTroops);
  const durationMs = Math.round(marchDuration(marker, combined, rally.withHero) * 1.12);
  const march = {
    id: `m${state.marchSequence++}`,
    markerId: rally.markerId,
    targetName: rally.targetName,
    kind: "enemy",
    phase: "outbound",
    startedAt: Date.now(),
    arriveAt: Date.now() + durationMs,
    durationMs,
    returnDurationMs: Math.max(7000, Math.round(durationMs * 0.72)),
    gatherDurationMs: 0,
    troops: rally.troops,
    alliedTroops: rally.alliedTroops,
    withHero: rally.withHero,
    heroId: rally.heroId,
    isRally: true,
    reward: null,
    reportCreated: false
  };
  state.marches.push(march);
  return true;
}

function processRallies() {
  const due = (state.rallies || []).filter((rally) => rally.launchAt <= Date.now());
  if (!due.length) return false;
  const dueIds = new Set(due.map((rally) => rally.id));
  state.rallies = state.rallies.filter((rally) => !dueIds.has(rally.id));
  due.forEach((rally) => {
    if (createMarchFromRally(rally)) {
      addAllianceFeed("Rally lanzado", `${rally.targetName}: salida automatica.`);
    } else {
      rally.launchAt = Date.now() + 10000;
      state.rallies.push(rally);
      addAllianceFeed("Rally retrasado", `${rally.targetName}: falta un slot de marcha.`);
    }
  });
  return true;
}

function startMarch(marker, plan = null) {
  if (state.marches.length >= marchSlots()) {
    return { ok: false, message: "Todos los slots de marcha estan ocupados." };
  }

  if (!plan) {
    return { ok: false, message: "Selecciona tropas para enviar." };
  }

  if (marker.kind === "resource" && resourceTileReserved(marker.id)) {
    return { ok: false, message: "Ya tienes una marcha reservando o recolectando en esta casilla." };
  }

  if (marker.kind === "resource" && resourceTileState(marker).depleted) {
    return { ok: false, message: "Esta casilla esta agotada. Espera a que vuelva a regenerarse." };
  }

  if (marker.kind === "monster" && !plan.withHero) {
    return { ok: false, message: "Para cazar monstruos debe ir el heroe." };
  }

  if (marker.kind === "monster" && monsterState(marker).defeated) {
    return { ok: false, message: "Este monstruo esta derrotado. Espera a que reaparezca." };
  }

  if (marker.kind === "monster" && marker.level > monsterTierLimit()) {
    return { ok: false, message: `Investiga Rastreo de Monstruos Nv. ${marker.level} para cazar este objetivo.` };
  }

  if (plan.withHero && heroIsMarching(plan.heroId)) {
    return { ok: false, message: `${heroDisplayName(plan.heroId)} ya esta en otra marcha.` };
  }

  if (marker.kind === "monster" && plan.withHero && (heroState(plan.heroId).energy || 0) < HERO_MONSTER_ENERGY_COST) {
    return { ok: false, message: `${heroDisplayName(plan.heroId)} necesita ${HERO_MONSTER_ENERGY_COST} de energia para cazar.` };
  }

  if (!plan || !hasTroopsAvailable(plan.troops)) {
    return { ok: false, message: "No hay tropas disponibles para esta marcha." };
  }

  const troopCount = troopBundleCount(plan.troops);
  if (troopCount > maxMarchSize()) {
    return { ok: false, message: `Tu investigacion permite ${formatNumber(maxMarchSize())} tropas por marcha.` };
  }

  if (marker.kind === "monster" && plan.withHero) {
    const hero = heroState(plan.heroId);
    hero.energy = Math.max(0, (hero.energy || 0) - HERO_MONSTER_ENERGY_COST);
    hero.lastEnergyAt = Date.now();
  }

  const now = Date.now();
  const march = {
    id: `m${state.marchSequence++}`,
    markerId: marker.id,
    targetName: marker.name,
    kind: marker.kind,
    phase: "outbound",
    startedAt: now,
    arriveAt: now + plan.durationMs,
    durationMs: plan.durationMs,
    returnDurationMs: plan.returnDurationMs,
    gatherDurationMs: plan.gatherDurationMs,
    troops: plan.troops,
    withHero: plan.withHero,
    heroId: plan.heroId,
    reward: null,
    reportCreated: false
  };
  state.marches.push(march);
  recordServerEvent("march.start", {
    marchId: march.id,
    markerId: marker.id,
    targetName: marker.name,
    kind: marker.kind,
    coord: markerWorldCoord(marker),
    troops: plan.troops,
    withHero: plan.withHero,
    heroId: plan.heroId,
    durationMs: plan.durationMs,
    returnDurationMs: plan.returnDurationMs,
    gatherDurationMs: plan.gatherDurationMs
  });
  addAllianceFeed("Marcha enviada", `${marker.name}: ${formatTroopBundle(plan.troops)}${plan.withHero ? ` con ${heroDisplayName(plan.heroId)}` : ""}.`);
  renderMilitary();
  renderHeroEquipment();
  return { ok: true, message: `Marcha enviada a ${marker.name}. Puedes seguirla en el mapa.` };
}

function cancelMarchById(id) {
  const march = state.marches.find((item) => item.id === id);
  if (!march) return;

  state.marches = state.marches.filter((item) => item.id !== id);
  if (march.kind === "monster" && march.withHero && march.phase === "outbound") {
    const hero = heroState(march.heroId);
    hero.energy = (hero.energy || 0) + HERO_MONSTER_ENERGY_COST;
    hero.lastEnergyAt = Date.now();
  }

  const lostReward = march.reward ? " El botin pendiente se pierde." : "";
  recordServerEvent("march.cancel", {
    marchId: march.id,
    markerId: march.markerId,
    targetName: march.targetName,
    kind: march.kind,
    phase: march.phase,
    lostReward: Boolean(march.reward)
  });
  addAllianceFeed("Marcha cancelada", `${march.targetName}: tropas llamadas de vuelta.${lostReward}`);
  closeSheet();
  renderMap();
  renderMilitary();
  renderHeroEquipment();
  renderAllianceFeed();
  saveState();
}

function buildQuickMarch(marker, presetKind = marker.kind) {
  const preset = normalizedMarchPreset(presetKind);
  const troops = doctrineTroopsFromPercentages(presetKind, preset.percentages);

  const troopCount = Object.values(troops).reduce((sum, value) => sum + value, 0);
  if (!troopCount) return null;

  const heroId = defaultHeroForMarch(marker);
  const withHero = Boolean((preset?.withHero || marker.kind === "monster") && heroId);
  return {
    ...createMarchPlan(marker, troops, withHero, heroId),
    presetKind
  };
}

function normalizedMarchPreset(kind) {
  const fallback = defaultState.marchPresets[kind] || defaultState.marchPresets.enemy;
  const saved = state.marchPresets?.[kind] || fallback;
  const percentages = sanitizeDoctrinePercentages(saved.percentages || fixedTroopsToPercentages(saved.troops || {}, maxMarchSize()));
  return {
    percentages,
    withHero: kind === "monster" || Boolean(saved.withHero)
  };
}

function doctrineTroopsFromPercentages(kind, percentages = {}, availableOverride = null) {
  const available = availableOverride || availableTroops();
  const capacity = maxMarchSize();
  const targetCapacity = Math.max(0, Math.min(capacity, Math.round((capacity * Math.min(100, doctrinePercentTotal(percentages))) / 100)));
  const troops = {};
  let remaining = targetCapacity;
  const entries = maxMarchPriority({ kind })
    .map((id) => [id, Math.min(100, Math.max(0, Math.round(percentages[id] || 0)))])
    .filter(([, percent]) => percent > 0);

  entries.forEach(([id, percent]) => {
    if (remaining <= 0) return;
    const target = Math.max(1, Math.round((capacity * percent) / 100));
    const amount = Math.min(available[id] || 0, target, remaining);
    if (amount <= 0) return;
    troops[id] = (troops[id] || 0) + amount;
    remaining -= amount;
  });

  while (remaining > 0) {
    const candidate = entries.find(([id]) => (available[id] || 0) > (troops[id] || 0));
    if (!candidate) break;
    const [id] = candidate;
    troops[id] = (troops[id] || 0) + 1;
    remaining -= 1;
  }

  return compactTroops(troops);
}

function doctrinePercentTotal(percentages = {}) {
  return Object.values(percentages || {}).reduce((sum, value) => sum + Math.max(0, Math.round(value || 0)), 0);
}

function maxMarchTroops(marker) {
  const available = availableTroops();
  const troops = {};
  let remaining = maxMarchSize();

  maxMarchPriority(marker).forEach((id) => {
    if (remaining <= 0) return;
    const amount = Math.min(available[id] || 0, remaining);
    if (amount <= 0) return;
    troops[id] = amount;
    remaining -= amount;
  });

  return compactTroops(troops);
}

function maxMarchPriority(marker) {
  const priorities = {
    resource: ["galleons", "artillery", "pikemen", "cavalry", "musketeers"],
    monster: ["musketeers", "cavalry", "artillery", "pikemen", "galleons"],
    enemy: ["artillery", "musketeers", "cavalry", "pikemen", "galleons"]
  };
  return [...new Set([...(priorities[marker.kind] || []), ...troopCatalog.map((troop) => troop.id)])];
}

function readMarchPlan(marker) {
  const planner = sheetBody.querySelector(`[data-march-target="${marker.id}"]`);
  if (!planner) return buildQuickMarch(marker);
  const available = availableTroops();
  const troops = {};

  troopCatalog.forEach((troop) => {
    const input = planner.querySelector(`[data-march-troop="${troop.id}"]`);
    const raw = Number(input?.value || 0);
    const max = available[troop.id] || 0;
    troops[troop.id] = Math.min(max, Math.max(0, Math.floor(Number.isFinite(raw) ? raw : 0)));
  });

  const selected = compactTroops(troops);
  const troopCount = Object.values(selected).reduce((sum, value) => sum + value, 0);
  if (!troopCount) return null;

  const selectedHeroInput = planner.querySelector("[data-march-hero-id]:checked");
  const heroId = selectedHeroInput?.value || defaultHeroForMarch(marker);
  const withHero = Boolean(planner.querySelector("[data-march-hero]")?.checked && heroId);
  return createMarchPlan(marker, selected, withHero, heroId);
}

function createMarchPlan(marker, troops, withHero = false, heroId = null) {
  const fallbackHeroId = heroId || defaultHeroForMarch(marker);
  const resolvedHeroId = withHero && fallbackHeroId ? heroById(fallbackHeroId).id : null;
  const useHero = Boolean(withHero && resolvedHeroId);
  return {
    troops,
    withHero: useHero,
    heroId: resolvedHeroId,
    durationMs: marchDuration(marker, troops, useHero),
    returnDurationMs: marchReturnDuration(marker, troops, useHero),
    gatherDurationMs: marker.kind === "resource" ? gatheringDuration(troops) : 0
  };
}

function marchDuration(marker, troops, withHero = false) {
  const avgSpeed = troopAverageSpeed(troops) + (withHero ? 1.2 : 0);
  const distance = kingdomDistance(marker);
  const navalBonus = troops.galleons ? researchLevel("naval-engineering") * 0.03 : 0;
  const heroBonus = withHero ? researchLevel("hero-command") * 0.02 : 0;
  const speedBonus = researchLevel("march-speed") * 0.04 + navalBonus + heroBonus;
  const speedFactor = Math.max(0.45, 1 - speedBonus);
  return Math.max(7000, Math.round((8 + distance * 0.55 + marker.level * 1.4 - avgSpeed * 0.7) * 1000 * speedFactor));
}

function kingdomDistance(marker) {
  const home = markerById(HOME_MARKER_ID);
  if (!home || !marker) return 0;
  const homeCoord = markerWorldCoord(home);
  const markerCoord = markerWorldCoord(marker);
  const dx = ((markerCoord.x - homeCoord.x) / WORLD_COORD_MAX_X) * 100;
  const dy = ((markerCoord.y - homeCoord.y) / WORLD_COORD_MAX_Y) * 100;
  return Math.hypot(dx, dy);
}

function marchReturnDuration(marker, troops, withHero = false) {
  return Math.max(7000, Math.round(marchDuration(marker, troops, withHero) * 0.75));
}

function gatheringDuration(troops) {
  const speedFactor = Math.max(0.35, 1 - researchLevel("gathering-speed") * 0.06 - heroEquipmentBonus("gathering") * 0.01);
  return Math.max(9000, Math.min(45000, Math.round((8000 + troopBundleLoad(troops) * 6) * speedFactor)));
}

function markerById(id) {
  return mapMarkers.find((marker) => marker.id === id) || mapMarkers.find((marker) => marker.id === HOME_MARKER_ID);
}

function marchMapPosition(march, index = 0) {
  const home = markerById(HOME_MARKER_ID);
  const target = markerById(march.markerId);
  const total = Math.max(1, march.arriveAt - march.startedAt);
  const elapsed = Math.min(total, Math.max(0, Date.now() - march.startedAt));
  const progress = Math.min(1, Math.max(0, elapsed / total));

  if (march.phase === "gathering") {
    return { x: clampPercent(target.x), y: clampPercent(target.y) };
  }

  const from = march.phase === "returning" ? target : home;
  const to = march.phase === "returning" ? home : target;
  return {
    x: clampPercent(from.x + (to.x - from.x) * progress),
    y: clampPercent(from.y + (to.y - from.y) * progress)
  };
}

function clampPercent(value) {
  return Math.min(94, Math.max(6, value));
}

function timeUntilHome(march) {
  const remaining = Math.max(0, march.arriveAt - Date.now());
  if (march.phase === "returning") return remaining;
  if (march.phase === "gathering") return remaining + (march.returnDurationMs || 0);
  return remaining + (march.kind === "resource" ? march.gatherDurationMs || 0 : 0) + (march.returnDurationMs || 0);
}

function marchPhaseProgress(march) {
  const total = Math.max(1, (march.arriveAt || Date.now()) - (march.startedAt || Date.now()));
  const elapsed = Math.min(total, Math.max(0, Date.now() - (march.startedAt || Date.now())));
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function marchProgressLabel(march) {
  if (march.phase === "gathering") return "Recolectando en la casilla";
  if (march.phase === "returning") return "Regreso al castillo";
  return `Camino a ${march.targetName}`;
}

function heroIsMarching(heroId = state.selectedHeroId) {
  const id = heroById(heroId).id;
  return state.marches.some((march) => march.withHero && (march.heroId || id) === id) || (state.rallies || []).some((rally) => rally.withHero && (rally.heroId || id) === id);
}

function heroAvailableForMarch(heroId, marker) {
  const hero = heroById(heroId);
  if (heroIsMarching(hero.id)) return false;
  if (marker?.kind === "monster" && (heroState(hero.id).energy || 0) < HERO_MONSTER_ENERGY_COST) return false;
  return true;
}

function defaultHeroForMarch(marker, preferredId = selectedHeroId()) {
  const preferred = heroById(preferredId).id;
  if (heroAvailableForMarch(preferred, marker)) return preferred;
  return heroRoster.find((hero) => heroAvailableForMarch(hero.id, marker))?.id || null;
}

function marchPhaseName(phase) {
  return {
    outbound: "Ida",
    gathering: "Recolectando",
    returning: "Regreso"
  }[phase] || "Marcha";
}

function marchStatusText(march) {
  return {
    outbound: "Marchando hacia el objetivo",
    gathering: "Recolectando en la casilla",
    returning: "Volviendo al castillo"
  }[march.phase] || "Marcha activa";
}

function marchIcon(march) {
  if (march.withHero) return "i-user";
  return {
    resource: "i-hammer",
    monster: "i-target",
    enemy: "i-shield",
    ally: "i-crown"
  }[march.kind] || "i-map";
}

function processMarches() {
  let changed = false;
  const now = Date.now();
  state.marches = state.marches.filter((march) => {
    if (march.arriveAt > now) return true;

    if (march.phase === "outbound") {
      if (march.kind === "resource") {
        march.phase = "gathering";
        march.startedAt = now;
        march.arriveAt = now + (march.gatherDurationMs || gatheringDuration(march.troops || {}));
        addAllianceFeed("Recoleccion iniciada", `${march.targetName}: tropas ocupando la casilla.`);
        changed = true;
        return true;
      }

      march.reward = resolveMarchReward(march);
      march.reportId = addMarchReport(march, march.reward).id;
      march.reportCreated = true;
      march.phase = "returning";
      march.startedAt = now;
      march.arriveAt = now + (march.returnDurationMs || Math.max(7000, Math.round(march.durationMs * 0.75)));
      addAllianceFeed("Objetivo alcanzado", `${march.targetName}: regreso iniciado.`);
      changed = true;
      return true;
    }

    if (march.phase === "gathering") {
      march.reward = resolveMarchReward(march);
      march.phase = "returning";
      march.startedAt = now;
      march.arriveAt = now + (march.returnDurationMs || Math.max(7000, Math.round((march.durationMs || 10000) * 0.75)));
      addAllianceFeed("Recoleccion completada", `${march.targetName}: regreso al bastion.`);
      changed = true;
      return true;
    }

    applyMarchReward(march);
    changed = true;
    return false;
  });
  return changed;
}

function resolveMarchReward(march) {
  if (march.kind === "resource") {
    const marker = markerById(march.markerId);
    const resource = marker.resource || "iron";
    const load = troopBundleLoad(march.troops);
    const storageFree = Math.max(0, resourceCapacity(resource) - (state.resources[resource] || 0));
    const harvest = harvestResourceTile(marker, Math.min(load, storageFree));
    return {
      resources: { [resource]: harvest.amount },
      tile: harvest,
      text: harvest.amount
        ? `+${formatNumber(harvest.amount)} ${resourceName(resource).toLowerCase()}${harvest.depleted ? ". Casilla agotada" : ""}`
        : storageFree <= 0
          ? `Sin espacio para ${resourceName(resource).toLowerCase()}. Mejora el Almacen Real`
          : `Sin ${resourceName(resource).toLowerCase()} disponible. Casilla agotada`
    };
  }

  if (march.kind === "monster") {
    const marker = markerById(march.markerId);
    const combat = resolveCombat(march, marker);
    const hunt = applyMonsterDamage(marker, combat);
    const rewardFactor = hunt.killed ? 1 : Math.min(0.35, Math.max(0.08, hunt.damage / Math.max(1, hunt.max) * 0.45));
    const silver = Math.round(monsterSilverReward(marker) * rewardFactor);
    const xp = Math.round(monsterXpReward(marker) * rewardFactor);
    const materialId = forgeMaterialId(marker.material || "frag-sword", monsterDropQualityIndex(marker));
    const materialAmount = hunt.killed ? monsterMaterialAmount(marker) : 0;
    const speedRewards = monsterSpeedReward(marker, hunt);
    const inventory = {
      ...(materialAmount ? { [materialId]: materialAmount } : {}),
      ...speedRewards
    };
    const inventoryText = formatInventoryBundle(inventory);
    return {
      resources: { silver },
      inventory,
      boosts: { heroXp: xp },
      wounded: combat.wounded,
      combat,
      monster: hunt,
      text: `${hunt.killed ? "Monstruo derrotado" : "Monstruo herido"}: ${formatNumber(hunt.damage)} dano, salud ${formatNumber(hunt.healthAfter)} / ${formatNumber(hunt.max)}. +${formatNumber(silver)} plata${inventoryText ? `, ${inventoryText}` : ""}, +${formatNumber(xp)} XP`
    };
  }

  if (march.kind === "enemy") {
    const marker = markerById(march.markerId);
    const combat = resolveCombat(march, marker);
    const raid = resolveEnemyRaidReward(marker, march, combat);
    const defender = applyEnemyDefenderLosses(marker, combat, march);
    const label = march.isRally ? (combat.victory ? "Rally victorioso" : "Rally parcial") : combat.result;
    const lootText = formatResourceBundle(raid.resources);
    const defenderText = formatTroopBundle(defender.losses);
    const counterText = combat.counterBonus ? `. ${combat.counter.label}` : "";
    return {
      resources: raid.resources,
      wounded: combat.wounded,
      combat,
      raid,
      defenderLosses: defender.losses,
      defenderHospitalized: defender.hospitalized,
      defenderDeaths: defender.deaths,
      defenderTroopsAfter: defender.troopsAfter,
      defenderWoundedAfter: defender.woundedAfter,
      text: `${label}: ${formatNumber(combat.attack)} ataque contra ${formatNumber(combat.targetDefense)} defensa${counterText}. ${lootText ? `Botin ${lootText}` : "Sin botin recuperado"}, ${combat.wounded} heridos${defenderText ? `. Bajas defensoras: ${defenderText}` : ""}`
    };
  }

  return { text: "Informe recibido" };
}

function applyMarchReward(march) {
  const reward = march.reward || {};
  const delivered = {};
  const overflow = {};
  const rewardHeroId = march.heroId || state.selectedHeroId;
  const heroBefore = heroLevelInfo(rewardHeroId);

  if (reward.resources) {
    Object.entries(reward.resources).forEach(([resource, amount]) => {
      const added = addResourceWithCap(resource, amount);
      delivered[resource] = added;
      if (added < amount) overflow[resource] = amount - added;
    });
  }
  if (reward.inventory) {
    Object.entries(reward.inventory).forEach(([id, quantity]) => {
      state.inventory[id] = (state.inventory[id] || 0) + quantity;
    });
  }
  if (reward.boosts) {
    Object.entries(reward.boosts).forEach(([key, value]) => {
      if (key === "heroEnergy" || key === "heroXp") {
        applyHeroBoosts({ [key]: value }, rewardHeroId);
      } else {
        state.boosts[key] = (state.boosts[key] || 0) + value;
      }
    });
  }
  const heroAfter = heroLevelInfo(rewardHeroId);
  if (heroAfter.level > heroBefore.level) {
    addAllianceFeed("Heroe ascendido", `${heroDisplayName(rewardHeroId)} alcanza nivel ${heroAfter.level}.`);
  }
  if (reward.wounded) {
    const wounds = applyTroopWounds(march, reward.wounded);
    reward.wounded = wounds.total;
    reward.woundedByTroop = wounds.byTroop;
    reward.ownDeaths = wounds.deaths;
    reward.ownDeathTotal = wounds.deathTotal;
    if (wounds.deathTotal) {
      reward.text = `${reward.text || "Combate resuelto"}. ${formatNumber(wounds.deathTotal)} tropas sin cama se pierden.`;
    }
  }
  if (Object.keys(delivered).length) reward.deliveryText = formatDeliveredRewardText(march, reward, delivered, overflow);
  if (march.reportCreated) {
    updateMarchReport(march, reward);
  } else {
    march.reportId = addMarchReport(march, reward).id;
    march.reportCreated = true;
  }
  recordServerEvent("march.resolve", {
    marchId: march.id,
    markerId: march.markerId,
    targetName: march.targetName,
    kind: march.kind,
    reportId: march.reportId || null,
    resources: reward.resources || {},
    inventory: reward.inventory || {},
    boosts: reward.boosts || {},
    wounded: reward.wounded || 0,
    combat: reward.combat || null,
    tile: reward.tile || null,
    monster: reward.monster || null,
    raid: reward.raid || null
  });
  addAllianceFeed("Marcha de vuelta", `${march.targetName}: ${reward.text || "sin recompensa"}.`);
}

function formatDeliveredRewardText(march, reward, delivered, overflow) {
  const deliveredText = Object.entries(delivered)
    .map(([resource, amount]) => `${formatNumber(amount)} ${resourceName(resource).toLowerCase()}`)
    .join(", ");
  const overflowText = Object.entries(overflow)
    .filter(([, amount]) => amount > 0)
    .map(([resource, amount]) => `${formatNumber(amount)} ${resourceName(resource).toLowerCase()}`)
    .join(", ");

  const prefix = march.kind === "resource" ? "Entregado al almacen" : "Recompensa recibida";
  if (!overflowText) return `${prefix}: ${deliveredText}`;
  return `${prefix}: ${deliveredText}. Almacen lleno: ${overflowText} no entran.`;
}

function resolveCombat(march, marker) {
  const defenderTroops = marker.kind === "enemy" ? enemyGarrison(marker) : null;
  const army = armyCombatBreakdown(combineTroopBundles(march.troops, march.alliedTroops), {
    includeWall: false,
    targetKind: marker.kind,
    defenderTroops,
    withHero: march.withHero,
    heroId: march.heroId,
    isRally: march.isRally
  });
  const targetDefense = targetDefenseValue(marker);
  const troopCount = troopBundleCount(march.troops);
  const outcome = combatOutcome(army.attack, targetDefense, troopCount, marker.kind);

  return {
    baseAttack: army.baseAttack,
    baseDefense: army.baseDefense,
    troopAttack: army.troopAttack,
    troopDefense: army.troopDefense,
    attack: army.attack,
    defense: army.defense,
    targetDefense,
    attackBonus: army.attackBonus,
    defenseBonus: army.defenseBonus,
    monsterBonus: army.monsterBonus || 0,
    heroCommandBonus: army.heroCommandBonus || 0,
    rallyBonus: army.rallyBonus || 0,
    counterBonus: army.counterBonus || 0,
    counter: army.counter || troopCounterBreakdown(),
    ratio: outcome.ratio,
    woundReduction: outcome.woundReduction,
    woundRate: outcome.woundRate,
    wounded: outcome.wounded,
    victory: outcome.victory,
    result: outcome.victory ? (marker.kind === "monster" ? "Caza victoriosa" : "Victoria") : "Asalto parcial"
  };
}

function combatOutcome(attack, targetDefense, troopCount, kind) {
  const ratio = targetDefense > 0 ? attack / targetDefense : 1;
  const victory = ratio >= 0.95;
  const baseWoundRate = kind === "monster" ? 0.035 : 0.07;
  const pressure = Math.max(0, 1 - Math.min(1.4, ratio) / 1.4);
  const reduction = combatWoundReduction(kind);
  const woundRate = Math.min(0.42, baseWoundRate + pressure * (kind === "monster" ? 0.12 : 0.26)) * Math.max(0.55, 1 - reduction / 100);
  const wounded = troopCount > 0 ? Math.min(troopCount, Math.max(victory ? 1 : 3, Math.round(troopCount * woundRate))) : 0;
  return { ratio, victory, wounded, woundReduction: reduction, woundRate };
}

function combatWoundReduction(kind) {
  const base = researchLevel("troop-health") * 2 + researchLevel("counter-raid") * 2;
  const monster = kind === "monster" ? researchLevel("monster-stamina") * 2 : 0;
  return Math.min(45, base + monster);
}

function targetDefenseValue(marker) {
  if (marker.kind === "monster") return Math.max(1, monsterState(marker).health || monsterMaxHealth(marker));
  if (marker.kind === "enemy") return enemyGarrisonDefense(marker);
  return 0;
}

function addMarchReport(march, reward = {}) {
  const marker = mapMarkers.find((item) => item.id === march.markerId);
  const report = {
    id: `r${Date.now()}`,
    kind: march.kind,
    markerId: marker?.id || march.markerId || null,
    coord: marker ? markerWorldCoord(marker) : null,
    targetName: march.targetName,
    summary: reward.deliveryText || reward.text || "Marcha completada sin recompensa especial.",
    deliveryText: reward.deliveryText || "",
    loot: reward.resources || null,
    inventory: reward.inventory || null,
    boosts: reward.boosts || null,
    troops: march.troops || {},
    alliedTroops: march.alliedTroops || {},
    withHero: Boolean(march.withHero),
    heroId: march.heroId || null,
    isRally: Boolean(march.isRally),
    wounded: reward.wounded || 0,
    woundedByTroop: reward.woundedByTroop || estimateWoundedTroops(march.troops || {}, reward.wounded || 0),
    ownDeaths: reward.ownDeaths || null,
    ownDeathTotal: reward.ownDeathTotal || 0,
    combat: reward.combat || null,
    tile: reward.tile || null,
    monster: reward.monster || null,
    raid: reward.raid || null,
    defenderLosses: reward.defenderLosses || null,
    defenderHospitalized: reward.defenderHospitalized || null,
    defenderDeaths: reward.defenderDeaths || null,
    defenderTroopsAfter: reward.defenderTroopsAfter || null,
    defenderWoundedAfter: reward.defenderWoundedAfter || null,
    createdAt: Date.now()
  };
  state.reports.unshift(report);
  state.reports = state.reports.slice(0, 20);
  return report;
}

function updateMarchReport(march, reward = {}) {
  const report = (state.reports || []).find((item) => item.id === march.reportId);
  if (!report) return addMarchReport(march, reward);
  const marker = mapMarkers.find((item) => item.id === march.markerId);
  report.markerId = marker?.id || march.markerId || report.markerId || null;
  report.coord = marker ? markerWorldCoord(marker) : report.coord || null;
  report.summary = reward.text || report.summary;
  report.deliveryText = reward.deliveryText || report.deliveryText || "";
  report.loot = reward.resources || report.loot || null;
  report.inventory = reward.inventory || report.inventory || null;
  report.boosts = reward.boosts || report.boosts || null;
  report.wounded = reward.wounded || report.wounded || 0;
  report.woundedByTroop = reward.woundedByTroop || report.woundedByTroop || {};
  report.ownDeaths = reward.ownDeaths || report.ownDeaths || null;
  report.ownDeathTotal = reward.ownDeathTotal || report.ownDeathTotal || 0;
  report.combat = reward.combat || report.combat || null;
  report.tile = reward.tile || report.tile || null;
  report.monster = reward.monster || report.monster || null;
  report.raid = reward.raid || report.raid || null;
  report.defenderLosses = reward.defenderLosses || report.defenderLosses || null;
  report.defenderHospitalized = reward.defenderHospitalized || report.defenderHospitalized || null;
  report.defenderDeaths = reward.defenderDeaths || report.defenderDeaths || null;
  report.defenderTroopsAfter = reward.defenderTroopsAfter || report.defenderTroopsAfter || null;
  report.defenderWoundedAfter = reward.defenderWoundedAfter || report.defenderWoundedAfter || null;
  report.isRally = Boolean(march.isRally || report.isRally);
  report.alliedTroops = march.alliedTroops || report.alliedTroops || {};
  report.heroId = march.heroId || report.heroId || null;
  return report;
}

function formatReportTime(timestamp) {
  const date = new Date(timestamp || Date.now());
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function addResourceWithCap(resource, amount) {
  const cap = resourceCapacity(resource);
  const before = state.resources[resource] || 0;
  const next = Math.min(cap, before + amount);
  state.resources[resource] = next;
  return next - before;
}

function canPay(cost = {}) {
  return Object.entries(cost).every(([key, value]) => (state.resources[key] ?? 0) >= value);
}

function payCost(cost = {}) {
  Object.entries(cost).forEach(([key, value]) => {
    state.resources[key] -= value;
  });
}

function resourceName(key) {
  const resource = resources.find((item) => item.id === key);
  return resource ? resource.name : key;
}

function formatCost(cost = {}) {
  return Object.entries(cost)
    .map(([key, value]) => `${resourceName(key)} ${formatNumber(value)}`)
    .join(" / ");
}

function estimateWoundedTroops(troops = {}, requestedWounded = 0) {
  const troopEntries = Object.entries(troops).filter(([, amount]) => amount > 0);
  const totalSent = troopBundleCount(troops);
  if (!troopEntries.length || totalSent <= 0 || requestedWounded <= 0) return {};

  let remaining = Math.min(requestedWounded, totalSent);
  const wounded = {};

  troopEntries.forEach(([id, amount], index) => {
    if (remaining <= 0) return;
    const proportional = index === troopEntries.length - 1 ? remaining : Math.round((requestedWounded * amount) / totalSent);
    const value = Math.min(remaining, amount, Math.max(0, proportional));
    if (value <= 0) return;
    wounded[id] = value;
    remaining -= value;
  });

  while (remaining > 0) {
    const entry = troopEntries.find(([id, amount]) => (wounded[id] || 0) < amount);
    if (!entry) break;
    wounded[entry[0]] = (wounded[entry[0]] || 0) + 1;
    remaining -= 1;
  }

  return wounded;
}

function applyTroopWounds(march, requestedWounded) {
  if (!state.woundedByTroop) state.woundedByTroop = {};
  const estimated = estimateWoundedTroops(march.troops || {}, requestedWounded);
  let freeBeds = Math.max(0, totalHospitalCapacity() - woundedTroopTotal());
  const wounded = {};
  const deaths = {};

  Object.entries(estimated).forEach(([id, amount]) => {
    const casualty = Math.min(amount, state.troops[id] || 0);
    if (casualty <= 0) return;
    const hospitalized = Math.min(casualty, freeBeds);
    const dead = casualty - hospitalized;
    if (hospitalized > 0) {
      wounded[id] = hospitalized;
      freeBeds -= hospitalized;
    }
    if (dead > 0) deaths[id] = dead;
  });

  const casualtyBundle = combineTroopBundles(wounded, deaths);
  const hospitalizedTotal = Object.entries(wounded).reduce((sum, [id, amount]) => {
    state.woundedByTroop[id] = (state.woundedByTroop[id] || 0) + amount;
    return sum + amount;
  }, 0);
  const deathTotal = Object.values(deaths).reduce((sum, amount) => sum + amount, 0);
  const casualtyTotal = Object.entries(casualtyBundle).reduce((sum, [id, amount]) => {
    state.troops[id] = Math.max(0, (state.troops[id] || 0) - amount);
    return sum + amount;
  }, 0);

  state.woundedTroops += hospitalizedTotal;
  state.trainedTroops = Math.max(0, state.trainedTroops - casualtyTotal);
  return { total: hospitalizedTotal, byTroop: wounded, deaths, deathTotal, casualtyTotal };
}

function healWoundedTroops(requested) {
  if (!state.woundedByTroop) state.woundedByTroop = {};
  let remaining = Math.min(requested, woundedTroopTotal());
  let healed = 0;

  Object.entries(state.woundedByTroop || {}).forEach(([id, amount]) => {
    if (remaining <= 0 || amount <= 0) return;
    const value = Math.min(amount, remaining);
    state.woundedByTroop[id] -= value;
    state.troops[id] = (state.troops[id] || 0) + value;
    healed += value;
    remaining -= value;
  });

  Object.keys(state.woundedByTroop).forEach((id) => {
    if (state.woundedByTroop[id] <= 0) delete state.woundedByTroop[id];
  });
  state.woundedTroops = woundedTroopTotal();
  return healed;
}

function healWoundedTroopBundle(troops = {}) {
  if (!state.woundedByTroop) state.woundedByTroop = {};
  let healed = 0;

  Object.entries(troops).forEach(([id, requested]) => {
    const available = state.woundedByTroop[id] || 0;
    const value = Math.min(available, Math.max(0, requested));
    if (value <= 0) return;
    state.woundedByTroop[id] = available - value;
    state.troops[id] = (state.troops[id] || 0) + value;
    healed += value;
  });

  Object.keys(state.woundedByTroop).forEach((id) => {
    if (state.woundedByTroop[id] <= 0) delete state.woundedByTroop[id];
  });
  state.woundedTroops = woundedTroopTotal();
  return healed;
}

function hospitalCapacity(building) {
  return building.level * 45 + researchLevel("hospital-capacity") * 12;
}

function totalHospitalCapacity() {
  return visiblePlotBuildings("hospital").reduce((sum, building) => sum + hospitalCapacity(building), 0);
}

function trainingBatch(building) {
  return 36 + building.level * 12 + researchLevel("training-capacity") * 10;
}

function trainingCapacityForBuilding(building) {
  if (building?.id === "astillero") return trainingBatch(building);
  return Math.max(trainingBatch(building), totalTrainingQueue());
}

function totalTrainingQueue() {
  return visiblePlotBuildings("barracks").reduce((sum, building) => sum + trainingBatch(building), 0);
}

function barracksAttackBonus() {
  return visiblePlotBuildings("barracks").reduce((sum, building) => sum + building.level * 2, 0);
}

function hospitalDefenseBonus() {
  return visiblePlotBuildings("hospital").reduce((sum, building) => sum + building.level * 2, 0);
}

function wallBuildingDefenseBonus() {
  const wall = buildings.find((building) => building.id === "muralla");
  return (wall?.level || 1) * 3;
}

function wallResearchDefenseBonus() {
  return researchLevel("wall-defense") * 4 + researchLevel("garrison-defense") * 3;
}

function totalAttackBonus() {
  return barracksAttackBonus() + heroEquipmentBonus("attack") + researchLevel("gear-attack") * 2;
}

function totalDefenseBonus() {
  return hospitalDefenseBonus() + heroEquipmentBonus("defense") + researchLevel("gear-defense") * 2 + researchLevel("city-health") * 3;
}

function wallDefenseBonus() {
  return wallBuildingDefenseBonus() + wallResearchDefenseBonus();
}

function combatBonusBreakdown() {
  return {
    attack: {
      barracks: barracksAttackBonus(),
      gearPieces: equipmentPieceBonusForLoadout("attack"),
      gearSet: equipmentSetBonusValue("attack"),
      gearResearch: researchLevel("gear-attack") * 2,
      total: totalAttackBonus()
    },
    defense: {
      hospitals: hospitalDefenseBonus(),
      wall: wallBuildingDefenseBonus(),
      research: wallResearchDefenseBonus(),
      gearPieces: equipmentPieceBonusForLoadout("defense"),
      gearSet: equipmentSetBonusValue("defense"),
      gearResearch: researchLevel("gear-defense") * 2,
      totalCity: totalDefenseBonus() + wallDefenseBonus(),
      totalField: totalDefenseBonus()
    }
  };
}

function armyBasePowerTotals(troops = state.troops) {
  return Object.entries(troops || {}).reduce(
    (totals, [id, amount]) => {
      const troop = troopCatalog.find((item) => item.id === id);
      if (!troop || amount <= 0) return totals;
      totals.attack += troop.attack * amount;
      totals.defense += troop.defense * amount;
      return totals;
    },
    { attack: 0, defense: 0 }
  );
}

function armyResearchPowerTotals(troops = state.troops) {
  return Object.entries(troops || {}).reduce(
    (totals, [id, amount]) => {
      const troop = troopCatalog.find((item) => item.id === id);
      if (!troop || amount <= 0) return totals;
      totals.attack += troopAttack(troop) * amount;
      totals.defense += troopDefense(troop) * amount;
      return totals;
    },
    { attack: 0, defense: 0 }
  );
}

function armyCombatBreakdown(troops = state.troops, options = {}) {
  const includeWall = options.includeWall !== false;
  const base = armyBasePowerTotals(troops);
  const researched = armyResearchPowerTotals(troops);
  const heroId = options.heroId || state.selectedHeroId;
  const monsterBonus = options.targetKind === "monster" && options.withHero ? heroMonsterAttackBonus(heroId) : 0;
  const heroCommandBonus = options.withHero ? heroCommandAttackBonus(heroId) : 0;
  const rallyBonus = options.isRally ? researchLevel("rally-size") * 4 + allianceRallyAttackBonus() : 0;
  const counter = options.targetKind === "enemy" ? troopCounterBreakdown(troops, options.defenderTroops) : troopCounterBreakdown();
  const counterBonus = counter.bonus || 0;
  const attackBonus = totalAttackBonus() + monsterBonus + heroCommandBonus + rallyBonus + counterBonus;
  const defenseBonus = totalDefenseBonus() + (includeWall ? wallDefenseBonus() : 0);

  return {
    baseAttack: base.attack,
    baseDefense: base.defense,
    troopAttack: researched.attack,
    troopDefense: researched.defense,
    attackBonus,
    defenseBonus,
    monsterBonus,
    heroCommandBonus,
    rallyBonus,
    counterBonus,
    counter,
    attack: Math.round(researched.attack * (1 + attackBonus / 100)),
    defense: Math.round(researched.defense * (1 + defenseBonus / 100))
  };
}

function armyPowerTotals(troops = state.troops, options = {}) {
  const breakdown = armyCombatBreakdown(troops, options);
  return { attack: breakdown.attack, defense: breakdown.defense };
}

function troopCounterBreakdown(attackers = {}, defenders = {}) {
  const attackerWeights = troopCounterWeights(attackers, "attack");
  const defenderWeights = troopCounterWeights(defenders, "defense");
  const attackerTotal = Object.values(attackerWeights).reduce((sum, value) => sum + value, 0);
  const defenderTotal = Object.values(defenderWeights).reduce((sum, value) => sum + value, 0);
  if (!attackerTotal || !defenderTotal) {
    return { bonus: 0, score: 0, label: "", advantage: "", disadvantage: "" };
  }

  let score = 0;
  let strongest = { value: 0, attacker: "", defender: "", direction: 0 };
  Object.entries(attackerWeights).forEach(([attackerClass, attackerPower]) => {
    Object.entries(defenderWeights).forEach(([defenderClass, defenderPower]) => {
      const weight = (attackerPower / attackerTotal) * (defenderPower / defenderTotal);
      let direction = 0;
      if (troopCounterWins[attackerClass] === defenderClass) direction = 1;
      if (troopCounterWins[defenderClass] === attackerClass) direction = -1;
      if (!direction) return;
      score += weight * direction;
      if (weight > strongest.value) strongest = { value: weight, attacker: attackerClass, defender: defenderClass, direction };
    });
  });

  const bonus = Math.round(Math.max(-1, Math.min(1, score)) * TROOP_COUNTER_MAX_BONUS);
  return {
    bonus,
    score,
    label: troopCounterLabel(bonus, strongest),
    advantage: strongest.direction > 0 ? `${troopCounterLabels[strongest.attacker]} > ${troopCounterLabels[strongest.defender]}` : "",
    disadvantage: strongest.direction < 0 ? `${troopCounterLabels[strongest.defender]} > ${troopCounterLabels[strongest.attacker]}` : ""
  };
}

function troopCounterWeights(troops = {}, stat = "attack") {
  return Object.entries(troops || {}).reduce((weights, [id, amount]) => {
    const troopClass = troopCounterClasses[id];
    const troop = troopCatalog.find((item) => item.id === id);
    if (!troopClass || !troop || amount <= 0) return weights;
    const value = (stat === "defense" ? troopDefense(troop) : troopAttack(troop)) * amount;
    weights[troopClass] = (weights[troopClass] || 0) + value;
    return weights;
  }, {});
}

function troopCounterLabel(bonus, strongest) {
  if (!bonus || !strongest?.direction) return "Counters: sin ventaja clara.";
  const relation = strongest.direction > 0
    ? `${troopCounterLabels[strongest.attacker]} superan a ${troopCounterLabels[strongest.defender]}`
    : `${troopCounterLabels[strongest.defender]} contrarrestan a ${troopCounterLabels[strongest.attacker]}`;
  return `Counters ${bonus > 0 ? "+" : ""}${bonus}%: ${relation}.`;
}

function totalResourceProductionRate() {
  return activeResourceBuildings()
    .reduce((sum, building) => sum + resourceProductionRate(building), 0);
}

function trainableTroopsForBuilding(building) {
  if (building.id === "astillero") return troopCatalog.filter((troop) => troop.id === "galleons");
  return troopCatalog.filter((troop) => troop.id !== "galleons");
}

function troopTrainingCost(troop, amount, tier = troopTierLimit()) {
  const tierFactor = 1 + (tier - 1) * 0.42;
  return Object.fromEntries(
    Object.entries(troop.trainCost || {}).map(([resource, value]) => [resource, Math.ceil(value * amount * tierFactor)])
  );
}

function troopAttack(troop, tier = troopTierLimit()) {
  const researchBonus = researchLevel("troop-attack") * 0.03 + troopAttackResearchBonus(troop) / 100;
  return Math.round(troop.attack * (1 + researchBonus) * (1 + (tier - 1) * 0.16));
}

function troopDefense(troop, tier = troopTierLimit()) {
  return Math.round(troop.defense * (1 + researchLevel("troop-defense") * 0.03) * (1 + (tier - 1) * 0.16));
}

function troopAttackResearchBonus(troop) {
  const bonuses = {
    pikemen: researchLevel("infantry-attack") * 4,
    musketeers: researchLevel("ranged-attack") * 4,
    cavalry: researchLevel("cavalry-attack") * 4,
    artillery: researchLevel("siege-attack") * 5 + researchLevel("artillery-foundry") * 4,
    galleons: researchLevel("naval-engineering") * 3
  };
  return bonuses[troop.id] || 0;
}

function troopMaxAttackReference() {
  return Math.max(...troopCatalog.map((troop) => troopAttack(troop)), 1);
}

function troopMaxDefenseReference() {
  return Math.max(...troopCatalog.map((troop) => troopDefense(troop)), 1);
}

function troopMaxLoadReference() {
  return Math.max(...troopCatalog.map((troop) => troop.load), 1);
}

function troopUseHint(troop) {
  return {
    pikemen: "Infanteria: fuerte contra caballeria, buena guarnicion.",
    musketeers: "Distancia: fuerte contra infanteria, dano principal.",
    cavalry: "Caballeria: fuerte contra arcabuceros, marchas rapidas.",
    artillery: "Asedio contra castillos y rallies.",
    galleons: "Carga alta, rutas navales y apoyo de alianza."
  }[troop.id] || "Tropa polivalente.";
}

function resourceProductionRate(building) {
  const base = { grain: 60, wood: 55, stone: 52, iron: 44 }[building.resource] || 40;
  return Math.round(base * building.level * (1 + resourceProductionBonus(building.resource) / 100));
}

function resourceProductionBonus(resource) {
  const specific = {
    grain: researchLevel("grain-yield") * 3,
    wood: researchLevel("wood-yield") * 3,
    stone: researchLevel("stone-yield") * 3,
    iron: researchLevel("iron-yield") * 3
  };
  return researchLevel("resource-production") * 5 + (specific[resource] || 0);
}

function resourceCapacity(resource) {
  if (resource === "gold") return 10000;
  const storage = buildings.find((building) => building.id === "almacen");
  const alcazar = buildings.find((building) => building.id === "alcazar");
  return 20000 + (storage?.level || 1) * 7000 + (alcazar?.level || 1) * 2000 + researchLevel("storage-engineering") * 6000;
}

function trainingMix(batch) {
  return {
    pikemen: Math.ceil(batch * 0.55),
    musketeers: Math.floor(batch * 0.35),
    cavalry: Math.max(1, Math.floor(batch * 0.1))
  };
}

function totalTroops() {
  return Object.values(state.troops).reduce((sum, value) => sum + value, 0);
}

function reservedTroops() {
  const reserved = {};
  state.marches.forEach((march) => {
    Object.entries(march.troops || {}).forEach(([id, amount]) => {
      reserved[id] = (reserved[id] || 0) + amount;
    });
  });
  (state.rallies || []).forEach((rally) => {
    Object.entries(rally.troops || {}).forEach(([id, amount]) => {
      reserved[id] = (reserved[id] || 0) + amount;
    });
  });
  return reserved;
}

function availableTroops() {
  const reserved = reservedTroops();
  return Object.fromEntries(
    troopCatalog.map((troop) => [troop.id, Math.max(0, (state.troops[troop.id] || 0) - (reserved[troop.id] || 0))])
  );
}

function marchingTroopCount() {
  return Object.values(reservedTroops()).reduce((sum, value) => sum + value, 0);
}

function hasTroopsAvailable(troops) {
  const available = availableTroops();
  return Object.entries(troops).every(([id, amount]) => (available[id] || 0) >= amount);
}

function compactTroops(troops) {
  return Object.fromEntries(Object.entries(troops).filter(([, amount]) => amount > 0));
}

function combineTroopBundles(...bundles) {
  const combined = {};
  bundles.forEach((bundle) => {
    Object.entries(bundle || {}).forEach(([id, amount]) => {
      combined[id] = (combined[id] || 0) + amount;
    });
  });
  return compactTroops(combined);
}

function troopBundleLoad(troops) {
  const base = Object.entries(troops).reduce((sum, [id, amount]) => {
    const troop = troopCatalog.find((item) => item.id === id);
    return sum + (troop?.load || 0) * amount;
  }, 0);
  return Math.round(base * (1 + researchLevel("troop-load") * 0.05));
}

function troopBundleCount(troops) {
  return Object.values(troops || {}).reduce((sum, amount) => sum + amount, 0);
}

function totalTroopLoad() {
  return troopBundleLoad(state.troops);
}

function troopAverageSpeed(troops) {
  let weighted = 0;
  let count = 0;
  Object.entries(troops).forEach(([id, amount]) => {
    const troop = troopCatalog.find((item) => item.id === id);
    weighted += (troop?.speed || 5) * amount;
    count += amount;
  });
  return count ? weighted / count : 5;
}

function marchSlots() {
  const alcazar = buildings.find((building) => building.id === "alcazar");
  return Math.min(6, 1 + Math.floor((alcazar?.level || 1) / 4) + researchLevel("bonus-march-slot"));
}

function maxMarchSize() {
  return 220 + researchLevel("march-size") * 80 + heroEquipmentBonus("marchSize");
}

function monsterTierLimit() {
  return 1 + researchLevel("monster-tier");
}

function troopTierLimit() {
  return Math.min(5, 1 + Math.floor(researchLevel("troop-tier") / 2));
}

function troopTierRequirement(tier) {
  return Math.max(0, (tier - 1) * 2);
}

function troopTierName(tier) {
  return {
    1: "Nv. 1 Reclutas",
    2: "Nv. 2 Curtidos",
    3: "Nv. 3 Veteranos",
    4: "Nv. 4 Maestres",
    5: "Nv. 5 Imperiales"
  }[tier] || `Nv. ${tier}`;
}

function nextTroopTierText() {
  const current = troopTierLimit();
  if (current >= 5) return "Maximo desbloqueado";
  return `Siguiente: ${troopTierName(current + 1)} con Tropas Veteranas Nv. ${troopTierRequirement(current + 1)}`;
}

function heroMonsterAttackBonus(heroId = state.selectedHeroId) {
  return researchLevel("hero-monster-attack") * 8 + heroEquipmentBonus("monster") + heroLevelMonsterBonus(heroId);
}

function monsterRewardBonus() {
  return researchLevel("monster-loot") * 6;
}

function heroEquipmentBonus(key) {
  return equipmentBonusForLoadout(key, state.activeEquipmentLoadout);
}

function equipmentPieceBonusForLoadout(key, loadoutId = state.activeEquipmentLoadout) {
  return forgeRecipes.reduce((sum, recipe) => {
    if (!equipmentActiveForKey(recipe, key, loadoutId)) return sum;
    const base = (recipe.bonus?.[key] || 0) * equipmentLevel(recipe.id);
    return sum + Math.round(base * equipmentQualityMultiplier(equipmentQualityIndex(recipe.id)));
  }, 0);
}

function equipmentBonusForLoadout(key, loadoutId = state.activeEquipmentLoadout) {
  return equipmentPieceBonusForLoadout(key, loadoutId) + equipmentSetBonusValue(key, loadoutId);
}

function equipmentLoadoutById(id = state.activeEquipmentLoadout) {
  return equipmentLoadouts.find((loadout) => loadout.id === id) || equipmentLoadouts[0];
}

function equipmentActiveForKey(recipe, key, loadoutId = state.activeEquipmentLoadout) {
  const loadout = equipmentLoadoutById(loadoutId);
  return Boolean(recipe.bonus?.[key] && loadout.keys.includes(key));
}

function equipmentActiveInLoadout(recipe, loadoutId = state.activeEquipmentLoadout) {
  const loadout = equipmentLoadoutById(loadoutId);
  return Boolean(equipmentLevel(recipe.id) && loadout.keys.some((key) => recipe.bonus?.[key]));
}

function activeLoadoutEquipmentCount(loadoutId = state.activeEquipmentLoadout) {
  return forgeRecipes.filter((recipe) => equipmentActiveInLoadout(recipe, loadoutId)).length;
}

function loadoutRecipeCount(loadoutId = state.activeEquipmentLoadout) {
  return equipmentRecipesForLoadout(loadoutId).length;
}

function equipmentRecipesForLoadout(loadoutId = state.activeEquipmentLoadout) {
  const loadout = equipmentLoadoutById(loadoutId);
  return forgeRecipes.filter((recipe) => loadout.keys.some((key) => recipe.bonus?.[key]));
}

function equipmentSetStatus(loadoutId = state.activeEquipmentLoadout) {
  const loadout = equipmentLoadoutById(loadoutId);
  const recipes = equipmentRecipesForLoadout(loadout.id);
  const active = recipes.filter((recipe) => equipmentLevel(recipe.id) > 0);
  const rule = equipmentSetBonuses[loadout.id];
  const total = recipes.length;
  const count = active.length;
  const full = total > 0 && count >= total;
  const partialAt = Math.min(total, rule?.partialAt || total);
  const partial = !full && count >= partialAt;
  const qualityIndex = count
    ? active.reduce((lowest, recipe) => Math.min(lowest, equipmentQualityIndex(recipe.id)), forgeQualities.length - 1)
    : 0;

  return {
    loadout,
    rule,
    total,
    count,
    full,
    partial,
    qualityIndex,
    multiplier: full || partial ? equipmentQualityMultiplier(qualityIndex) : 0,
    stage: full ? "full" : partial ? "partial" : "none"
  };
}

function equipmentSetBonusValue(key, loadoutId = state.activeEquipmentLoadout) {
  const status = equipmentSetStatus(loadoutId);
  if (!status.rule || status.stage === "none") return 0;
  const bonuses = status.stage === "full" ? status.rule.full : status.rule.partial;
  return Math.round((bonuses?.[key] || 0) * status.multiplier);
}

function equipmentSetBonusText(loadoutId = state.activeEquipmentLoadout) {
  const status = equipmentSetStatus(loadoutId);
  if (!status.rule) return "";
  const quality = forgeQualities[status.qualityIndex] || forgeQualities[0];
  if (status.stage === "none") return `${status.count}/${status.total} piezas - sin conjunto`;
  const bonuses = status.stage === "full" ? status.rule.full : status.rule.partial;
  const stageText = status.stage === "full" ? "completo" : "parcial";
  const values = Object.entries(bonuses)
    .map(([key, value]) => {
      const total = Math.round(value * status.multiplier);
      const label = {
        attack: "ataque",
        defense: "defensa",
        research: "invest.",
        gathering: "recol.",
        monster: "monstruos",
        marchSize: "marcha"
      }[key] || key;
      return key === "marchSize" ? `+${formatNumber(total)} ${label}` : `+${formatNumber(total)}% ${label}`;
    })
    .join(" / ");
  return `${stageText} ${quality.label}: ${values}`;
}

function renderLoadoutBonusBreakdown(loadoutId = state.activeEquipmentLoadout) {
  const loadout = equipmentLoadoutById(loadoutId);
  return `
    <div class="equipment-breakdown">
      ${loadout.keys
        .map((key) => {
          const pieces = equipmentPieceBonusForLoadout(key, loadout.id);
          const set = equipmentSetBonusValue(key, loadout.id);
          const total = pieces + set;
          return `
            <div>
              <span>${equipmentBonusKeyLabel(key)}</span>
              <strong>${formatLoadoutBonusValue(key, total)}</strong>
              <small>Piezas ${formatLoadoutBonusValue(key, pieces)} / Set ${formatLoadoutBonusValue(key, set)}</small>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function equipmentBonusKeyLabel(key) {
  return {
    attack: "Ataque",
    defense: "Defensa",
    research: "Investigacion",
    gathering: "Recoleccion",
    monster: "Monstruos",
    marchSize: "Marcha"
  }[key] || key;
}

function formatLoadoutBonusValue(key, value) {
  return key === "marchSize" ? `+${formatNumber(value)}` : `+${formatNumber(value)}%`;
}

function renderEquipmentLoadoutButtons() {
  return `
    <div class="equipment-loadouts">
      ${equipmentLoadouts
        .map((loadout) => {
          const active = loadout.id === state.activeEquipmentLoadout;
          const pieces = activeLoadoutEquipmentCount(loadout.id);
          const totalPieces = loadoutRecipeCount(loadout.id);
          const preview = loadoutPreviewText(loadout);
          return `
            <button class="${active ? "is-active" : ""}" type="button" data-select-loadout="${loadout.id}">
              <svg><use href="#${loadout.icon}" /></svg>
              <span>
                <strong>${loadout.name}</strong>
                <small>${pieces}/${totalPieces} piezas - ${preview}</small>
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function loadoutPreviewText(loadout) {
  const values = loadout.keys
    .map((key) => [key, equipmentBonusForLoadout(key, loadout.id)])
    .filter(([, value]) => value > 0);
  if (!values.length) return "sin bonus";
  const [key, value] = values[0];
  const label = {
    attack: "ataque",
    defense: "defensa",
    research: "invest.",
    gathering: "recol.",
    monster: "monstruos",
    marchSize: "marcha"
  }[key] || key;
  return key === "marchSize" ? `+${formatNumber(value)} ${label}` : `+${formatNumber(value)}% ${label}`;
}

function selectEquipmentLoadout(id) {
  const loadout = equipmentLoadoutById(id);
  state.activeEquipmentLoadout = loadout.id;
  renderHeroEquipment();
  renderMilitary();
  refreshOpenSheet(`Perfil ${loadout.name} activo.`);
  saveState();
}

function equipmentQualityMultiplier(qualityIndex = 0) {
  return forgeQualities[qualityIndex]?.multiplier || 1;
}

function formatEquipmentBonus(recipe, level, qualityIndex = 0) {
  const labels = {
    attack: "Ataque tropas",
    defense: "Defensa ciudad",
    monster: "Heroe vs monstruos",
    marchSize: "Tamano marcha",
    research: "Investigacion",
    gathering: "Recoleccion"
  };

  return Object.entries(recipe.bonus || {})
    .map(([key, value]) => {
      const total = Math.round(value * level * equipmentQualityMultiplier(qualityIndex));
      return key === "marchSize" ? `${labels[key]} +${formatNumber(total)}` : `${labels[key]} +${formatNumber(total)}%`;
    })
    .join(" / ");
}

function formatCompactEquipmentBonus(recipe, level, qualityIndex = 0) {
  const labels = {
    attack: "Atq",
    defense: "Def",
    monster: "Mon",
    marchSize: "Marcha",
    research: "Inv",
    gathering: "Rec"
  };

  return Object.entries(recipe.bonus || {})
    .map(([key, value]) => {
      const total = Math.round(value * level * equipmentQualityMultiplier(qualityIndex));
      return key === "marchSize" ? `${labels[key]} +${formatNumber(total)}` : `${labels[key]} +${formatNumber(total)}%`;
    })
    .join(" / ");
}

function formatEquipmentPrimaryBonus(recipe, level, qualityIndex = 0) {
  const [key, value] = Object.entries(recipe.bonus || {})[0] || [];
  if (!key || !level) return "";
  const total = Math.round(value * level * equipmentQualityMultiplier(qualityIndex));
  const label = {
    attack: "ataque",
    defense: "defensa",
    monster: "monstruos",
    marchSize: "marcha",
    research: "invest.",
    gathering: "recol."
  }[key] || key;
  return key === "marchSize" ? `+${formatNumber(total)} ${label}` : `+${formatNumber(total)}% ${label}`;
}

function formatTroopBundle(troops) {
  return Object.entries(troops)
    .map(([id, amount]) => {
      const troop = troopCatalog.find((item) => item.id === id);
      return `${troop?.name || id} ${formatNumber(amount)}`;
    })
    .join(" / ");
}

function marchCompositionText(march, longHero = false) {
  const parts = [formatTroopBundle(march.troops)];
  if (march.alliedTroops && Object.keys(march.alliedTroops).length) {
    parts.push(`aliados ${formatTroopBundle(march.alliedTroops)}`);
  }
  if (march.withHero) parts.push(longHero ? `${heroDisplayName(march.heroId)} al mando` : heroDisplayName(march.heroId));
  return `${march.isRally ? "Rally: " : ""}${parts.filter(Boolean).join(" Â· ")}`;
}

function marchKindName(kind) {
  return {
    resource: "Recoleccion",
    monster: "Caza",
    enemy: "Ataque",
    ally: "Refuerzo",
    scout: "Espionaje"
  }[kind] || "Marcha";
}

function renderPacks() {
  resetWeeklyIfNeeded();
  const capped = state.wisdom.claimed >= 2;
  weeklyCount.textContent = `${state.wisdom.claimed}/2`;
  weeklyMeterFill.style.width = `${Math.min(100, state.wisdom.claimed * 50)}%`;

  packGrid.innerHTML = packs
    .map(
      (pack) => `
        <button
          class="pack-card ${selectedPackId === pack.id ? "is-selected" : ""}"
          type="button"
          data-pack="${pack.id}"
          ${capped ? "disabled" : ""}
        >
          <span class="pack-icon"><svg><use href="#${pack.icon}" /></svg></span>
          <span class="pack-tier">${pack.tier} &middot; ${pack.valueLabel}</span>
          <span class="pack-yield">${packItemCount(pack)} objetos</span>
          <strong>${pack.name}</strong>
          <p>${pack.text}</p>
          <small class="pack-preview">${packPreview(pack, 4)}</small>
          <em>${pack.difficultyLabel}</em>
        </button>
      `
    )
    .join("");
}

function bindWisdom() {
  packGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pack]");
    if (!button || state.wisdom.claimed >= 2) return;
    selectedPackId = button.dataset.pack;
    const pack = packs.find((item) => item.id === selectedPackId);
    currentChallenge = generateChallenge(pack.difficulty);
    renderPacks();
    renderChallengePanel();
  });

  challengePanel.addEventListener("click", (event) => {
    const submit = event.target.closest("[data-submit-answer]");
    const reroll = event.target.closest("[data-reroll-question]");
    const tab = event.target.closest("[data-open-tab]");
    if (submit) submitAnswer();
    if (tab) switchTab(tab.dataset.openTab);
    if (reroll && selectedPackId) {
      const pack = packs.find((item) => item.id === selectedPackId);
      currentChallenge = generateChallenge(pack.difficulty);
      renderChallengePanel();
    }
  });

  challengePanel.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches("#answerInput")) {
      submitAnswer();
    }
  });
}

function renderChallengePanel(message = "") {
  const capped = state.wisdom.claimed >= 2;
  const pack = packs.find((item) => item.id === selectedPackId);

  if (capped) {
    challengePanel.innerHTML = `
      <h2>Limite semanal alcanzado</h2>
      <p>Ya reclamaste los dos paquetes de esta semana.</p>
      <div class="choice-row">
        <button class="secondary-action" type="button" data-open-tab="inventory">
          <svg><use href="#i-bag" /></svg>Ver inventario
        </button>
      </div>
      <p class="challenge-feedback">Nuevo ciclo: lunes proximo.</p>
    `;
    return;
  }

  if (!pack || !currentChallenge) {
    challengePanel.innerHTML = `
      <h2>Elige un paquete</h2>
      <p>Selecciona la recompensa que necesita tu imperio y resuelve el reto matematico.</p>
      ${
        message
          ? `<div class="choice-row"><button class="secondary-action" type="button" data-open-tab="inventory"><svg><use href="#i-bag" /></svg>Ver inventario</button></div>`
          : ""
      }
      <p class="challenge-feedback">${message}</p>
    `;
    return;
  }

  challengePanel.innerHTML = `
    <h2>${pack.name}</h2>
    <p>${pack.valueLabel} &middot; ${pack.difficultyLabel}</p>
    <div class="challenge-prize">
      <span>Premio</span>
      <strong>${packItemCount(pack)} objetos en inventario</strong>
      <p>${packPreview(pack, 7)}</p>
    </div>
    <p>${currentChallenge.text}</p>
    <input id="answerInput" inputmode="numeric" autocomplete="off" placeholder="Respuesta" />
    <div class="choice-row">
      <button class="primary-action" type="button" data-submit-answer>
        <svg><use href="#i-scroll" /></svg>Reclamar
      </button>
      <button class="secondary-action" type="button" data-reroll-question>
        <svg><use href="#i-target" /></svg>Otro reto
      </button>
    </div>
    <p class="challenge-feedback">${message}</p>
  `;
  const input = challengePanel.querySelector("#answerInput");
  input.focus({ preventScroll: true });
}

function packItemCount(pack) {
  return Object.values(pack.items || rewardToItems(pack.reward || {})).reduce((sum, quantity) => sum + quantity, 0);
}

function packPreview(pack, limit = 4) {
  const entries = Object.entries(pack.items || rewardToItems(pack.reward || {}));
  const preview = entries.slice(0, limit).map(([id, quantity]) => {
    const item = inventoryCatalog[id];
    return `${quantity}x ${shortItemName(item?.name || id)}`;
  });
  const extra = entries.length - preview.length;
  return `${preview.join(" / ")}${extra > 0 ? ` / +${extra} mas` : ""}`;
}

function shortItemName(name) {
  return name
    .replace("Tarjeta de ", "")
    .replace("Acelerador ", "Acel. ")
    .replace("Fragmento de ", "Frag. ");
}

function generateChallenge(difficulty = "easy") {
  if (difficulty === "hard") return generateHardChallenge();
  if (difficulty === "medium") return generateMediumChallenge();
  return generateEasyChallenge();
}

function generateEasyChallenge() {
  const pick = randomInt(1, 3);
  if (pick === 1) {
    const production = randomInt(8, 22);
    const minutes = randomInt(3, 8);
    const start = randomInt(80, 240);
    return {
      text: `Un molino guarda ${start} fanegas y produce ${production} por minuto durante ${minutes} minutos. Cuantas fanegas tendra?`,
      answer: start + production * minutes
    };
  }

  if (pick === 2) {
    const units = randomInt(4, 9);
    const cost = randomInt(20, 55);
    return {
      text: `${units} carretas llevan ${cost} de madera cada una. Cuanta madera llevan en total?`,
      answer: units * cost
    };
  }

  const first = randomInt(90, 240);
  const second = randomInt(45, 130);
  return {
    text: `El almacen tiene ${first} de piedra y llega una carreta con ${second}. Cuanta piedra hay ahora?`,
    answer: first + second
  };
}

function generateMediumChallenge() {
  const pick = randomInt(1, 3);
  if (pick === 3) {
    const ships = randomInt(3, 8);
    const sailors = randomInt(42, 86);
    const officers = randomInt(12, 38);
    return {
      text: `${ships} galeones llevan ${sailors} marineros cada uno y se suman ${officers} oficiales. Cuantas personas viajan?`,
      answer: ships * sailors + officers
    };
  }

  if (pick === 2) {
    const units = randomInt(8, 18);
    const cost = randomInt(45, 95);
    const discount = [10, 20, 25][randomInt(0, 2)];
    return {
      text: `${units} piezas de artilleria cuestan ${cost} de hierro cada una. La Academia reduce el coste un ${discount}%. Cuanto hierro pagas?`,
      answer: Math.round(units * cost * (1 - discount / 100))
    };
  }

  const first = randomInt(18, 60);
  const second = randomInt(8, 24);
  const multiplier = randomInt(3, 7);
  return {
    text: `Una leva tiene ${first} piqueros. Llegan ${second} escuadras con ${multiplier} soldados cada una. Cuantos soldados hay en total?`,
    answer: first + second * multiplier
  };
}

function generateHardChallenge() {
  const pick = randomInt(1, 3);
  if (pick === 1) {
    const mines = randomInt(3, 5);
    const production = randomInt(110, 180);
    const hours = randomInt(4, 7);
    const upkeep = randomInt(35, 70);
    const start = randomInt(700, 1300);
    return {
      text: `${mines} minas producen ${production} de hierro por hora durante ${hours} horas. La guarnicion consume ${upkeep} por hora y empezabas con ${start}. Cuanto hierro queda?`,
      answer: start + mines * production * hours - upkeep * hours
    };
  }

  if (pick === 2) {
    const pikes = randomInt(80, 160);
    const muskets = randomInt(60, 140);
    const pikeCost = 18;
    const musketCost = 32;
    const discount = 25;
    return {
      text: `Entrenas ${pikes} piqueros a ${pikeCost} de trigo y ${muskets} arcabuceros a ${musketCost}. Una orden reduce el total un ${discount}%. Cuanto trigo pagas?`,
      answer: Math.round((pikes * pikeCost + muskets * musketCost) * 0.75)
    };
  }

  const ships = randomInt(4, 7);
  const crates = randomInt(36, 72);
  const silverPerCrate = randomInt(14, 28);
  const tax = [120, 180, 240][randomInt(0, 2)];
  return {
    text: `${ships} galeones traen ${crates} cofres cada uno. Cada cofre vale ${silverPerCrate} de plata, pero pagas ${tax} de tasa portuaria. Cuanta plata ganas?`,
    answer: ships * crates * silverPerCrate - tax
  };
}

function submitAnswer() {
  if (!currentChallenge || !selectedPackId) return;
  const input = challengePanel.querySelector("#answerInput");
  const value = Number(String(input.value).replace(",", ".").trim());

  if (!Number.isFinite(value)) {
    renderChallengePanel("Escribe un numero para responder.");
    return;
  }

  if (Math.round(value) !== currentChallenge.answer) {
    const pack = packs.find((item) => item.id === selectedPackId);
    currentChallenge = generateChallenge(pack.difficulty);
    renderChallengePanel("No era exacto. Te he puesto otro reto.");
    return;
  }

  const pack = packs.find((item) => item.id === selectedPackId);
  const awardedItems = pack.items || rewardToItems(pack.reward || {});
  addPackItems(pack);
  state.wisdom.claimed += 1;
  state.power += 520;
  recordServerEvent("wisdom.claim", {
    packId: pack.id,
    packName: pack.name,
    difficulty: pack.difficulty,
    claimedThisWeek: state.wisdom.claimed,
    weeklyLimit: 2,
    items: awardedItems,
    reward: pack.reward || {}
  });
  addAllianceFeed("Cofre de Sabiduria", `Has reclamado ${pack.name}.`);
  selectedPackId = null;
  currentChallenge = null;
  renderResources();
  renderPacks();
  renderInventory();
  renderChallengePanel(`${pack.name} anadido al inventario.`);
  renderAllianceFeed();
  saveState();
}

function cardItem(name, rarity, icon, description, resourcesEffect) {
  return {
    category: "resources",
    name,
    rarity,
    icon,
    description,
    effect: { resources: resourcesEffect },
    actionLabel: "Usar"
  };
}

function boostItem(name, rarity, icon, description, speedEffect) {
  return {
    category: "boosts",
    name,
    rarity,
    icon,
    description,
    effect: { speed: speedEffect },
    actionLabel: "Usar"
  };
}

function heroItem(name, rarity, icon, description, boostsEffect) {
  return {
    category: "hero",
    name,
    rarity,
    icon,
    description,
    effect: { boosts: boostsEffect },
    actionLabel: "Usar"
  };
}

function equipmentItem(name, rarity, icon, description, meta = {}) {
  return {
    category: "equipment",
    name,
    rarity,
    icon,
    description,
    ...meta,
    actionLabel: "Pieza"
  };
}

function addPackItems(pack) {
  const items = pack.items || rewardToItems(pack.reward || {});
  addInventoryItems(items);
}

function addInventoryItems(items = {}) {
  Object.entries(items).forEach(([id, quantity]) => {
    if (!inventoryCatalog[id]) return;
    state.inventory[id] = (state.inventory[id] || 0) + quantity;
  });
}

function alcazarRewardItems(level) {
  const safeLevel = clampBuildingLevel(level);
  const tier = safeLevel >= 20 ? 3 : safeLevel >= 12 ? 2 : 1;
  const resourceCards = Math.max(1, Math.ceil(safeLevel / 2));
  const premiumCards = Math.max(1, Math.ceil(safeLevel / 4));
  const speedCount = Math.max(1, Math.ceil(safeLevel / 5));
  const heroCount = Math.max(1, Math.ceil(safeLevel / 8));

  if (tier === 3) {
    return {
      "card-grain-50000": resourceCards,
      "card-wood-50000": resourceCards,
      "card-stone-50000": resourceCards,
      "card-iron-50000": resourceCards,
      "card-silver-25000": premiumCards,
      "card-gold-1000": Math.max(1, Math.ceil(safeLevel / 10)),
      "speed-build-24h": speedCount,
      "speed-research-8h": speedCount,
      "speed-training-8h": speedCount,
      "hero-energy-1500": heroCount,
      "hero-xp-25000": heroCount,
      "frag-sword-epic": 1,
      "frag-coraza-epic": 1,
      "frag-morrion-epic": 1
    };
  }

  if (tier === 2) {
    return {
      "card-grain-50000": resourceCards,
      "card-wood-50000": resourceCards,
      "card-stone-50000": resourceCards,
      "card-iron-50000": Math.max(1, resourceCards - 1),
      "card-silver-25000": premiumCards,
      "card-gold-1000": 1,
      "speed-build-8h": speedCount,
      "speed-research-8h": Math.max(1, speedCount - 1),
      "speed-training-8h": Math.max(1, speedCount - 1),
      "hero-energy-1500": heroCount,
      "hero-xp-25000": heroCount,
      "frag-sword-rare": 1,
      "frag-coraza-rare": 1,
      "frag-morrion-rare": 1
    };
  }

  return {
    "card-grain-5200": resourceCards * 2,
    "card-wood-8200": resourceCards,
    "card-iron-5200": resourceCards,
    "card-silver-2600": premiumCards,
    "card-gold-120": Math.max(1, Math.ceil(safeLevel / 5)),
    "speed-build-60": speedCount,
    "speed-research-30": speedCount,
    "speed-training-60": speedCount,
    "hero-energy-180": heroCount * 2,
    "hero-xp-1600": heroCount * 3,
    "frag-sword-fine": 1,
    "frag-coraza-fine": 1,
    "frag-morrion-fine": 1
  };
}

function grantAlcazarUpgradeReward(level) {
  const safeLevel = clampBuildingLevel(level);
  state.alcazarRewardsClaimed ||= {};
  const key = String(safeLevel);
  if (state.alcazarRewardsClaimed[key]) return;

  const items = alcazarRewardItems(safeLevel);
  addInventoryItems(items);
  state.alcazarRewardsClaimed[key] = Date.now();
  addAllianceFeed("Premio del Alcazar", `Nivel ${safeLevel}: paquete imperial anadido al inventario.`);
  recordServerEvent("alcazar.reward", {
    level: safeLevel,
    itemCount: Object.values(items).reduce((sum, quantity) => sum + quantity, 0),
    label: `Alcazar Real Nv. ${safeLevel}`
  });
}

function rewardToItems(reward) {
  const generated = {};
  Object.entries(reward).forEach(([key, value]) => {
    const id = `card-${key}-${value}`;
    if (inventoryCatalog[id]) generated[id] = (generated[id] || 0) + 1;
  });
  return generated;
}

function applyReward(reward = {}) {
  Object.entries(reward).forEach(([key, value]) => {
    if (key in state.resources) {
      state.resources[key] += value;
    } else if (key === "heroEnergy" || key === "heroXp") {
      applyHeroBoosts({ [key]: value });
    } else {
      state.boosts[key] = (state.boosts[key] ?? 0) + value;
    }
  });
}

function applyInventoryEffect(item) {
  if (!item.effect) return "";
  const heroId = selectedHeroId();
  const beforeHero = heroLevelInfo(heroId);
  const heroEffect = item.effect.boosts && ("heroEnergy" in item.effect.boosts || "heroXp" in item.effect.boosts);
  if (item.effect.resources) applyReward(item.effect.resources);
  if (item.effect.boosts) {
    Object.entries(item.effect.boosts).forEach(([key, value]) => {
      if (key === "heroEnergy" || key === "heroXp") {
        applyHeroBoosts({ [key]: value }, heroId);
      } else {
        state.boosts[key] = (state.boosts[key] || 0) + value;
      }
    });
  }
  if (item.effect.speed) {
    return applySpeedEffect(item.effect.speed);
  }
  if (heroEffect) return heroEffectMessage(item, beforeHero, heroId);
  return `${item.name} aplicado.`;
}

function applySpeedEffect(speed) {
  const queueKey = speed.queue === "any" ? firstActiveQueueKey() : speed.queue;
  if (!queueKey || !state.queues[queueKey]) return "No hay una cola compatible activa.";

  state.queues[queueKey].finishAt = Math.max(Date.now(), state.queues[queueKey].finishAt - speed.seconds * 1000);
  const changed = processQueueCompletions();
  renderQueueStrip();
  if (changed) {
    renderResources();
    renderBuildings();
    renderAllianceFeed();
  }
  return `${queueTypeName(queueKey)} acelerada.`;
}

function compatibleSpeedItems(queueType) {
  return getInventoryEntries().filter(({ item }) => {
    const speed = item.effect?.speed;
    return speed && (speed.queue === queueType || speed.queue === "any");
  });
}

function speedLabel(item) {
  const seconds = item.effect?.speed?.seconds || 0;
  if (seconds >= 3600) {
    const hours = Math.max(1, Math.round(seconds / 3600));
    return `${hours}h`;
  }
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}m`;
}

function useQueueSpeedItem(id, queueType) {
  const item = inventoryCatalog[id];
  const speed = item?.effect?.speed;
  if (!item || !speed || !state.inventory[id]) return;
  if (speed.queue !== "any" && speed.queue !== queueType) return;
  if (!state.queues[queueType]) return;

  state.queues[queueType].finishAt = Math.max(Date.now(), state.queues[queueType].finishAt - speed.seconds * 1000);
  state.inventory[id] -= 1;
  if (state.inventory[id] <= 0) delete state.inventory[id];

  const completed = processQueueCompletions();
  renderQueueStrip();
  renderInventory(`${item.name} aplicado a ${queueTypeName(queueType).toLowerCase()}.`);
  renderResources();
  renderBuildings();
  refreshOpenSheet();
  if (completed) renderAllianceFeed();
  saveState();
}

function firstActiveQueueKey() {
  return Object.keys(state.queues).find((key) => state.queues[key]);
}

function bindInventory() {
  inventoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-inventory-filter]");
    if (!button) return;
    inventoryFilter = button.dataset.inventoryFilter;
    renderInventory();
  });

  inventoryGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-use-item]");
    if (!button) return;
    useInventoryItem(button.dataset.useItem);
  });
}

function bindHeroEquipment() {
  if (heroRosterEl) {
    heroRosterEl.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-hero]");
      if (!button) return;
      selectHero(button.dataset.selectHero);
    });
  }

  if (heroProgress) {
    heroProgress.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-loadout]");
      if (!button) return;
      selectEquipmentLoadout(button.dataset.selectLoadout);
    });
  }

  heroPanelTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-hero-panel]");
    if (!button) return;
    heroPanelTab = button.dataset.heroPanel;
    renderHeroEquipment();
  });

  if (!heroEquipmentGrid) return;
  heroEquipmentGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-forge]");
    if (!button) return;
    renderForge("", button.dataset.openForge);
  });
}

function heroById(id = state.selectedHeroId) {
  return heroRoster.find((hero) => hero.id === id) || heroRoster[0];
}

function heroState(id = state.selectedHeroId) {
  const hero = heroById(id);
  if (!state.heroes) state.heroes = createDefaultHeroes();
  if (!state.heroes[hero.id]) {
    state.heroes[hero.id] = { xp: 0, energy: HERO_BASE_ENERGY, lastEnergyAt: Date.now() };
  }
  return state.heroes[hero.id];
}

function selectedHeroId() {
  return heroById(state.selectedHeroId).id;
}

function heroDisplayName(id = state.selectedHeroId) {
  return heroById(id).name;
}

function selectHero(id) {
  const hero = heroById(id);
  state.selectedHeroId = hero.id;
  processHeroEnergy();
  renderHeroEquipment();
  renderMilitary();
  refreshOpenSheet();
  saveState();
}

function processHeroEnergy(now = Date.now()) {
  let changed = false;
  heroRoster.forEach((hero) => {
    const data = heroState(hero.id);
    const max = heroEnergyMax(hero.id);
    const last = Number(data.lastEnergyAt || now);
    const gained = Math.floor(Math.max(0, now - last) / HERO_ENERGY_REGEN_MS);
    if (gained > 0) {
      const before = data.energy || 0;
      data.energy = Math.min(max, before + gained);
      data.lastEnergyAt = last + gained * HERO_ENERGY_REGEN_MS;
      changed = changed || data.energy !== before;
    }
    if ((data.energy || 0) >= max && data.lastEnergyAt !== now) data.lastEnergyAt = now;
  });
  return changed;
}

function applyHeroBoosts(boosts = {}, heroId = state.selectedHeroId) {
  const data = heroState(heroId);
  if (boosts.heroXp) data.xp = Math.max(0, (data.xp || 0) + boosts.heroXp);
  if (boosts.heroEnergy) data.energy = Math.max(0, (data.energy || 0) + boosts.heroEnergy);
  data.lastEnergyAt = Date.now();
}

function heroXpForLevel(level) {
  const step = Math.max(1, level + 1);
  return Math.round(900 + step * 360 + Math.pow(step, 1.35) * 140);
}

function heroLevelInfo(heroId = state.selectedHeroId) {
  let level = HERO_BASE_LEVEL;
  let currentXp = Math.max(0, Math.floor(heroState(heroId).xp || 0));
  let nextXp = heroXpForLevel(level);

  while (currentXp >= nextXp) {
    currentXp -= nextXp;
    level += 1;
    nextXp = heroXpForLevel(level);
  }

  return {
    level,
    currentXp,
    nextXp,
    totalXp: Math.max(0, Math.floor(heroState(heroId).xp || 0)),
    progress: Math.min(100, Math.round((currentXp / Math.max(1, nextXp)) * 100))
  };
}

function heroEnergyMax(heroId = state.selectedHeroId) {
  const levelBonus = Math.floor(heroLevelInfo(heroId).level / 2) * 10;
  return HERO_BASE_ENERGY + researchLevel("hero-energy") * 20 + levelBonus;
}

function heroRankName(level) {
  if (level >= 30) return "Gran Capitan";
  if (level >= 20) return "Maestre de Campo";
  if (level >= 10) return "Gobernador de Plaza";
  if (level >= 1) return "Veterano";
  return "Recluta";
}

function heroLevelAttackBonus(heroId = state.selectedHeroId) {
  return Math.max(0, heroLevelInfo(heroId).level);
}

function heroCommandAttackBonus(heroId = state.selectedHeroId) {
  return 5 + researchLevel("hero-command") * 3 + heroLevelAttackBonus(heroId);
}

function heroLevelMonsterBonus(heroId = state.selectedHeroId) {
  return Math.max(0, heroLevelInfo(heroId).level) * 2;
}

function heroEffectMessage(item, before, heroId = state.selectedHeroId) {
  const effect = item.effect?.boosts || {};
  const after = heroLevelInfo(heroId);
  const parts = [];

  if (effect.heroEnergy) parts.push(`+${formatNumber(effect.heroEnergy)} energia`);
  if (effect.heroXp) parts.push(`+${formatNumber(effect.heroXp)} XP`);
  if (after.level > before.level) parts.push(`${heroDisplayName(heroId)} sube a nivel ${after.level}`);

  return parts.length ? `${item.name}: ${parts.join(" - ")}.` : `${item.name} aplicado.`;
}

function renderHeroEquipment() {
  processHeroEnergy();
  const hero = heroById();
  const data = heroState(hero.id);
  const info = heroLevelInfo(hero.id);
  const energy = Math.max(0, Math.floor(data.energy || 0));
  const energyMax = heroEnergyMax(hero.id);
  const energyProgress = Math.min(100, Math.round((energy / Math.max(1, energyMax)) * 100));

  if (heroPortraitImage) {
    heroPortraitImage.src = hero.portrait;
    heroPortraitImage.alt = `${hero.name}, ${hero.title}`;
  }
  if (heroEyebrow) heroEyebrow.textContent = hero.title;
  if (heroName) heroName.textContent = hero.name;
  if (heroSubtitle) {
    heroSubtitle.textContent = `Nivel ${info.level} - ${heroRankName(info.level)} - Energia de caza`;
  }

  if (heroRosterEl) {
    heroRosterEl.innerHTML = heroRoster
      .map((item) => {
        const itemInfo = heroLevelInfo(item.id);
        const itemState = heroState(item.id);
        const busy = heroIsMarching(item.id);
        return `
          <button class="hero-card ${item.id === hero.id ? "is-active" : ""} ${busy ? "is-busy" : ""}" type="button" data-select-hero="${item.id}">
            <span class="hero-card-mark">
              <img src="${item.portrait}" alt="" loading="lazy" />
              <em>${item.initials}</em>
            </span>
            <span>
              <strong>${item.name}</strong>
              <span>Nv. ${itemInfo.level} - ${formatNumber(Math.floor(itemState.energy || 0))}/${formatNumber(heroEnergyMax(item.id))}${busy ? " - ocupado" : ""}</span>
            </span>
          </button>
        `;
      })
      .join("");
  }

  if (heroProgress) {
    heroProgress.innerHTML = `
      <div class="hero-progress-row">
        <div><span>Energia heroica</span><strong>${formatNumber(energy)} / ${formatNumber(energyMax)}</strong></div>
        <b class="hero-progress-bar"><i style="--bar:${energyProgress}%"></i></b>
      </div>
      <div class="hero-progress-row">
        <div><span>Proximo nivel</span><strong>${formatNumber(info.currentXp)} / ${formatNumber(info.nextXp)} XP</strong></div>
        <b class="hero-progress-bar"><i style="--bar:${info.progress}%"></i></b>
      </div>
      <div class="hero-role-grid">
        <div><span>Ataque</span><strong>+${formatNumber(heroEquipmentBonus("attack"))}%</strong></div>
        <div><span>Defensa</span><strong>+${formatNumber(heroEquipmentBonus("defense"))}%</strong></div>
        <div><span>Invest.</span><strong>+${formatNumber(heroEquipmentBonus("research"))}%</strong></div>
        <div><span>Recolect.</span><strong>+${formatNumber(heroEquipmentBonus("gathering"))}%</strong></div>
      </div>
      <p class="hero-progress-note">El heroe sube con caza y cronicas. El equipo define si destaca en ataque, defensa, investigacion o recoleccion.</p>
    `;
  }

  if (heroPanelTabs) {
    heroPanelTabs.querySelectorAll("[data-hero-panel]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.heroPanel === heroPanelTab);
    });
  }

  if (heroProgress) heroProgress.hidden = heroPanelTab !== "progress";
  if (heroRosterEl) heroRosterEl.hidden = heroPanelTab !== "heroes";

  if (heroDetailPanel) {
    heroDetailPanel.hidden = heroPanelTab !== "sets";
    heroDetailPanel.innerHTML = `
      ${renderEquipmentLoadoutButtons()}
      <div class="equipment-set-note">
        <strong>${equipmentSetStatus().rule?.name || "Conjunto"}</strong>
        <span>${equipmentSetBonusText()}</span>
      </div>
      ${renderLoadoutBonusBreakdown()}
    `;
  }

  if (heroStatRow) {
    const commandBonus = heroCommandAttackBonus(hero.id);
    heroStatRow.innerHTML = `
      <div><span>Ataque heroe</span><strong>+${formatNumber(commandBonus)}%</strong></div>
      <div><span>Marcha</span><strong>${formatNumber(maxMarchSize())}</strong></div>
      <div><span>Monstruos</span><strong>+${formatNumber(heroMonsterAttackBonus(hero.id))}%</strong></div>
    `;
  }

  if (!heroEquipmentGrid) return;
  heroEquipmentGrid.innerHTML = forgeRecipes
    .map((recipe) => {
      const level = equipmentLevel(recipe.id);
      const qualityIndex = equipmentQualityIndex(recipe.id);
      const quality = forgeQualities[qualityIndex];
      const activeInProfile = equipmentActiveInLoadout(recipe);
      const primaryBonus = formatEquipmentPrimaryBonus(recipe, level, qualityIndex);
      return `
        <button class="${activeInProfile ? "is-active-loadout" : ""}" type="button" data-open-forge="${recipe.id}" style="${level ? `--item-color:${quality.color}` : ""}" aria-label="${recipe.slot}">
          <svg><use href="#${recipe.icon}" /></svg>
          <span>
            <strong>${recipe.slot}</strong>
            <small>${level ? `Nv. ${level} ${quality.label}${primaryBonus ? ` - ${primaryBonus}` : ""}${activeInProfile ? " - activo" : ""}` : "Sin forjar"}</small>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderInventory(message = "") {
  const entries = getInventoryEntries();
  const visibleEntries = inventoryFilter === "all" ? entries : entries.filter((entry) => entry.item.category === inventoryFilter);
  const totals = {
    resources: countInventoryByCategory("resources"),
    boosts: countInventoryByCategory("boosts"),
    hero: countInventoryByCategory("hero"),
    equipment: countInventoryByCategory("equipment")
  };

  inventorySummary.innerHTML = `
    <div><span>Tarjetas</span><strong>${totals.resources}</strong></div>
    <div><span>Aceler.</span><strong>${totals.boosts}</strong></div>
    <div><span>Heroe</span><strong>${totals.hero}</strong></div>
    <div><span>Piezas</span><strong>${totals.equipment}</strong></div>
  `;

  inventoryTabs.querySelectorAll("[data-inventory-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.inventoryFilter === inventoryFilter);
  });

  if (!visibleEntries.length) {
    inventoryGrid.innerHTML = `<div class="empty-inventory">${message || "Aun no hay objetos en esta categoria. Gana cofres en la Casa de Sabios."}</div>`;
    return;
  }

  inventoryGrid.innerHTML = `
    ${message ? `<div class="empty-inventory">${message}</div>` : ""}
    ${visibleEntries
      .map(({ id, quantity, item }) => {
        const usable = Boolean(item.effect);
        return `
          <div class="inventory-item" style="${item.color ? `--item-color:${item.color}` : ""}">
            <div class="inventory-item-icon">
              <svg><use href="#${item.icon}" /></svg>
              <span class="inventory-qty">x${quantity}</span>
            </div>
            <div>
              <strong>${item.name}</strong>
              <span>${categoryName(item.category)} Â· ${item.rarity}</span>
              <p>${item.description}</p>
            </div>
            <button class="inventory-use" type="button" data-use-item="${id}" ${usable ? "" : "disabled"}>${item.actionLabel}</button>
          </div>
        `;
      })
      .join("")}
  `;
}

function getInventoryEntries() {
  return Object.entries(state.inventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => ({ id, quantity, item: inventoryCatalog[id] }))
    .filter((entry) => entry.item)
    .sort((a, b) => categorySort(a.item.category) - categorySort(b.item.category) || a.item.name.localeCompare(b.item.name));
}

function countInventoryByCategory(category) {
  return getInventoryEntries()
    .filter((entry) => entry.item.category === category)
    .reduce((sum, entry) => sum + entry.quantity, 0);
}

function useInventoryItem(id) {
  const item = inventoryCatalog[id];
  if (!item || !state.inventory[id]) return;
  const message = applyInventoryEffect(item);
  if (!message || message.startsWith("No hay")) {
    renderInventory(message || "Este objeto se usara cuando activemos timers, forja o equipo.");
    return;
  }

  state.inventory[id] -= 1;
  if (state.inventory[id] <= 0) delete state.inventory[id];
  renderResources();
  renderQueueStrip();
  renderInventory(message);
  renderMilitary();
  renderHeroEquipment();
  saveState();
}

function categorySort(category) {
  return { resources: 1, boosts: 2, hero: 3, equipment: 4 }[category] || 9;
}

function categoryName(category) {
  return {
    resources: "Recurso",
    boosts: "Acelerador",
    hero: "Heroe",
    equipment: "Equipo"
  }[category] || "Objeto";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function bindRallies() {
  if (!rallyList) return;
  rallyList.addEventListener("click", (event) => {
    const open = event.target.closest("[data-rally-open]");
    const launch = event.target.closest("[data-rally-launch]");
    const cancel = event.target.closest("[data-rally-cancel]");
    if (open) openRallyDetail(open.dataset.rallyOpen);
    if (launch) launchRallyById(launch.dataset.rallyLaunch);
    if (cancel) cancelRallyById(cancel.dataset.rallyCancel);
  });
}

function renderRallies() {
  if (!rallyList) return;
  if (!state.rallies?.length) {
    rallyList.innerHTML = `<div class="empty-inventory">No hay rallies activos. Abre un castillo rival en Mundo y convoca a la alianza.</div>`;
    return;
  }

  rallyList.innerHTML = state.rallies
    .map((rally) => {
      const remaining = Math.max(0, rally.launchAt - Date.now());
      const power = rallyPowerTotals(rally);
      return `
        <article class="rally-card">
          <button type="button" class="rally-card-main" data-rally-open="${rally.id}">
            <span>Rally Â· ${formatDuration(remaining)}</span>
            <strong>${rally.targetName}</strong>
            <p>${formatTroopBundle(rally.troops)} + aliados ${formatTroopBundle(rally.alliedTroops)}</p>
            <small>Ataque estimado ${formatNumber(power.attack)}</small>
          </button>
          <div class="rally-card-actions">
            <button class="primary-action" type="button" data-rally-launch="${rally.id}">Lanzar</button>
            <button class="secondary-action is-danger" type="button" data-rally-cancel="${rally.id}">Cancelar</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAllianceSummary() {
  if (!allianceSummary) return;
  const treasury = state.allianceTreasury || {};
  const treasuryTotal = resourceBundleTotal(treasury);
  const honor = Math.max(0, Math.floor(state.allianceHonor || 0));
  const helpTarget = allianceHelpTargetQueue();
  const helpLimit = allianceHelpLimit();
  const helpUsed = helpTarget ? Math.max(0, Math.floor(helpTarget.helpApplied || 0)) : 0;
  const lastConvoy = (state.allianceConvoys || [])[0];
  const convoyLabel = lastConvoy ? `${lastConvoy.name} - ${formatReportTime(lastConvoy.at)}` : "Sin envios";
  const treasuryLabel = formatResourceBundle(treasury) || "Tesoreria vacia";

  allianceSummary.innerHTML = `
    <button type="button" data-alliance-shop>
      <span>Honor</span>
      <strong>${formatNumber(honor)}</strong>
      <small>Tienda de honor</small>
    </button>
    <button type="button" data-alliance-projects>
      <span>Tesoreria</span>
      <strong>${formatNumber(treasuryTotal)}</strong>
      <small>Proyectos - ${treasuryLabel}</small>
    </button>
    <div>
      <span>Ayudas</span>
      <strong>${helpTarget ? `${helpUsed}/${helpLimit}` : "0"}</strong>
      <small>${helpTarget ? `${queueTypeName(helpTarget.type)} - ${helpTarget.label}` : "Sin cola activa"}</small>
    </div>
    <div>
      <span>Rallies</span>
      <strong>${(state.rallies || []).length}</strong>
      <small>${lastConvoy ? `Ultimo convoy ${convoyLabel}` : `Capacidad ${formatNumber(allianceConvoyCapacity())}`}</small>
    </div>
  `;
}

function renderAllianceMembers() {
  if (!allianceMembers) return;
  const members = allianceMemberList();
  const totalPower = members.reduce((sum, member) => sum + Math.max(0, member.power || 0), 0);
  allianceMembers.innerHTML = `
    <div class="alliance-members-head">
      <span>Miembros</span>
      <strong>${members.length} - ${formatNumber(totalPower)}</strong>
    </div>
    <div class="alliance-member-list">
      ${members
        .map((member) => {
          const marker = member.markerId ? mapMarkers.find((item) => item.id === member.markerId) : null;
          return `
            <button class="alliance-member-row" type="button" data-alliance-member="${member.id}">
              <span class="member-rank">${member.rank}</span>
              <span class="member-main">
                <strong>${escapeHtml(member.name)}</strong>
                <small>${member.role} - ${memberStatusLabel(member.status)}${marker ? ` - ${markerCoordLabel(marker)}` : ""}</small>
              </span>
              <span class="member-power">${formatNumber(member.power)}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function allianceMemberList() {
  const convoyTotal = (state.allianceConvoys || []).reduce((sum, convoy) => sum + resourceBundleTotal(convoy.resources || {}), 0);
  const ownHelps = Object.values(state.queues || {}).reduce((sum, queue) => sum + Math.max(0, Math.floor(queue?.helpApplied || 0)), 0);
  const player = {
    id: "player",
    name: "Tu imperio",
    rank: "R4",
    role: "Capitan General",
    power: state.power,
    helps: ownHelps,
    donated: convoyTotal,
    status: "online",
    markerId: HOME_MARKER_ID
  };
  return [player, ...(state.allianceMembers || [])].sort((a, b) => memberRankValue(b.rank) - memberRankValue(a.rank) || b.power - a.power);
}

function memberRankValue(rank = "R1") {
  return Number(String(rank).replace(/\D/g, "")) || 1;
}

function memberStatusLabel(status) {
  return {
    online: "En linea",
    away: "Ausente",
    offline: "Desconectado"
  }[status] || "Desconectado";
}

function openAllianceMemberSheet(memberId) {
  const member = allianceMemberList().find((item) => item.id === memberId);
  if (!member) return;
  activeSheetMode = "allianceMember";
  activeAllianceMemberId = member.id;
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  const marker = member.markerId ? mapMarkers.find((item) => item.id === member.markerId) : null;

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>${escapeHtml(member.name)}</h2>
        <p>${member.rank} - ${member.role} - ${memberStatusLabel(member.status)}</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Poder</span><strong>${formatNumber(member.power)}</strong></div>
      <div><span>Ayudas</span><strong>${formatNumber(member.helps)}</strong></div>
      <div><span>Aportes</span><strong>${formatNumber(member.donated)}</strong></div>
      <div><span>Ciudad</span><strong>${marker ? markerCoordLabel(marker) : "Sin marcar"}</strong></div>
    </div>
    <div class="building-guidance">
      <strong>Contribucion</strong>
      <p>${member.name === "Tu imperio" ? "Tu actividad local suma convoyes, compras y ayudas para preparar la persistencia real." : `${member.name} participa en ayudas, convoyes y rallies de la Orden.`}</p>
    </div>
    <div class="action-row">
      ${
        marker
          ? `<button class="primary-action" type="button" data-member-locate="${member.id}">
              <svg><use href="#i-map" /></svg>Localizar
            </button>`
          : ""
      }
      <button class="secondary-action" type="button" data-close-sheet>
        <svg><use href="#i-close" /></svg>Cerrar
      </button>
    </div>
    <p class="challenge-feedback" id="sheetFeedback">Ficha de miembro preparada para servidor.</p>
  `;
  openSheet();
}

function locateAllianceMember(memberId) {
  const member = allianceMemberList().find((item) => item.id === memberId);
  const marker = member?.markerId ? mapMarkers.find((item) => item.id === member.markerId) : null;
  if (!marker) return;
  switchTab("world");
  window.setTimeout(() => {
    centerWorldOnMarker(marker.id, { flash: true });
    openMapMarker(marker.id);
  }, 0);
}

function bindAlliance() {
  if (chatTabs) {
    chatTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-chat-channel]");
      if (!button) return;
      chatChannel = button.dataset.chatChannel === "kingdom" ? "kingdom" : "alliance";
      renderAllianceChat();
    });
  }

  if (chatCompose) {
    chatCompose.addEventListener("submit", (event) => {
      event.preventDefault();
      sendChatMessage();
    });
  }

  if (chatLog) {
    chatLog.addEventListener("click", (event) => {
      const reportButton = event.target.closest("[data-chat-report]");
      if (reportButton) {
        const reportId = reportButton.dataset.chatReport;
        if (!(state.reports || []).some((report) => report.id === reportId)) return;
        switchTab("military");
        window.setTimeout(() => openReport(reportId), 0);
        return;
      }

      const button = event.target.closest("[data-chat-marker]");
      if (!button) return;
      const markerId = button.dataset.chatMarker;
      if (!mapMarkers.some((marker) => marker.id === markerId)) return;
      switchTab("world");
      window.setTimeout(() => {
        centerWorldOnMarker(markerId, { flash: true });
        openMapMarker(markerId);
      }, 0);
    });
  }

  if (allianceSummary) {
    allianceSummary.addEventListener("click", (event) => {
      const shop = event.target.closest("[data-alliance-shop]");
      if (shop) openAllianceShopSheet();
      const projects = event.target.closest("[data-alliance-projects]");
      if (projects) openAllianceProjectsSheet();
    });
  }

  if (allianceMembers) {
    allianceMembers.addEventListener("click", (event) => {
      const button = event.target.closest("[data-alliance-member]");
      if (button) openAllianceMemberSheet(button.dataset.allianceMember);
    });
  }

  document.querySelectorAll("[data-alliance-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.allianceAction;
      if (action === "help") applyAllianceHelp();
      if (action === "rally") {
        switchTab("world");
        openMapMarker("enemy-1");
        const feedback = document.querySelector("#sheetFeedback");
        if (feedback) feedback.textContent = "Elige tus tropas y pulsa Rally para convocar a la alianza.";
      }
      if (action === "ship") openAllianceConvoySheet();
      if (action === "beta") openBetaStatusSheet();
      renderAllianceFeed();
      saveState();
    });
  });
}

function applyAllianceHelp() {
  const queue = allianceHelpTargetQueue();
  if (!queue) {
    addAllianceFeed("Ayuda de alianza", "No hay colas activas que acelerar.");
    return;
  }

  const limit = allianceHelpLimit();
  const used = Math.max(0, Math.floor(queue.helpApplied || 0));
  if (used >= limit) {
    addAllianceFeed("Ayuda agotada", `${queueTypeName(queue.type)}: ${queue.label} ya recibio ${limit} ayudas.`);
    return;
  }

  const now = Date.now();
  const before = Math.max(0, queue.finishAt - now);
  let applied = 0;
  let reduced = 0;
  const batch = Math.min(3, limit - used);

  for (let index = 0; index < batch; index += 1) {
    const remaining = Math.max(0, queue.finishAt - Date.now());
    if (remaining <= 0) break;
    const reduction = allianceHelpReductionMs(remaining);
    queue.finishAt = Math.max(Date.now(), queue.finishAt - reduction);
    queue.helpApplied = Math.max(0, Math.floor(queue.helpApplied || 0)) + 1;
    reduced += Math.min(reduction, remaining);
    applied += 1;
  }

  if (!applied) {
    addAllianceFeed("Ayuda de alianza", `${queue.label}: cola casi completada.`);
    return;
  }

  addAllianceFeed("Ayuda recibida", `${queue.label}: ${applied} ayudas reducen ${formatDuration(reduced)}.`);
  const completed = processQueueCompletions();
  renderQueueStrip();
  renderResources();
  renderBuildings();
  renderInventory();
  renderMilitary();
  renderHeroEquipment();
  renderRallies();
  renderAllianceSummary();
  renderAllianceMembers();
  renderMap();
  if (completed || before !== Math.max(0, queue.finishAt - Date.now())) refreshOpenSheet();
}

function allianceHelpTargetQueue() {
  return Object.values(state.queues || {})
    .filter(Boolean)
    .sort((a, b) => Math.max(0, b.finishAt - Date.now()) - Math.max(0, a.finishAt - Date.now()))[0] || null;
}

function allianceHelpLimit() {
  const allianceHouse = buildings.find((building) => building.id === "casa-alianza");
  return Math.max(3, 3 + Math.floor(allianceHouse?.level || 1) + allianceProjectLevel("relief"));
}

function allianceHelpReductionMs(remaining) {
  const factor = 0.12 + allianceProjectLevel("relief") * 0.02;
  return Math.min(remaining, Math.max(3000, Math.min(120000, Math.round(remaining * factor))));
}

function openAllianceConvoySheet(message = "") {
  activeSheetMode = "convoy";
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  const capacity = allianceConvoyCapacity();
  const presets = allianceConvoyPresets();

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>Convoy de Alianza</h2>
        <p>Envia recursos a la tesoreria de la Orden y gana honor.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Capacidad</span><strong>${formatNumber(capacity)}</strong></div>
      <div><span>Honor</span><strong>${formatNumber(state.allianceHonor || 0)}</strong></div>
      <div><span>Tesoreria</span><strong>${formatNumber(resourceBundleTotal(state.allianceTreasury || {}))}</strong></div>
      <div><span>Mercado</span><strong>Nv. ${buildingLevelById("mercado")}</strong></div>
    </div>
    <div class="building-guidance">
      <strong>Tesoreria actual</strong>
      <p>${formatResourceBundle(state.allianceTreasury || {}) || "Sin recursos enviados."}</p>
    </div>
    <div class="convoy-option-grid">
      ${presets
        .map(
          (preset) => `
            <button class="convoy-option" type="button" data-convoy-send="${preset.id}" ${preset.total > 0 ? "" : "disabled"}>
              <span>
                <strong>${preset.name}</strong>
                <small>${preset.description}</small>
              </span>
              <p>${formatResourceBundle(preset.cost) || "Sin recursos suficientes"}</p>
              <em>Honor +${formatNumber(preset.honor)}</em>
            </button>
          `
        )
        .join("")}
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${message || "Elige un convoy."}</p>
  `;
  openSheet();
}

function allianceConvoyPresets() {
  const max = buildMaxAllianceConvoy();
  return [
    {
      id: "basic",
      name: "Basico",
      description: "Aporte pequeno para ayudas y comercio.",
      cost: { grain: 500, wood: 420, stone: 320, iron: 180, silver: 70 }
    },
    {
      id: "works",
      name: "Obras",
      description: "Recursos para fortificaciones y edificios.",
      cost: { grain: 1200, wood: 1400, stone: 1100, iron: 520, silver: 180 }
    },
    {
      id: "max",
      name: "Maximo",
      description: "Carga segun capacidad y recursos actuales.",
      cost: max
    }
  ].map((preset) => {
    const total = resourceBundleTotal(preset.cost);
    return {
      ...preset,
      total,
      honor: allianceConvoyHonor(preset.cost)
    };
  });
}

function buildMaxAllianceConvoy() {
  const capacity = allianceConvoyCapacity();
  const weights = { grain: 0.3, wood: 0.25, stone: 0.2, iron: 0.15, silver: 0.1 };
  const cost = {};
  Object.entries(weights).forEach(([resource, weight]) => {
    const wanted = Math.max(0, Math.round(capacity * weight));
    const available = Math.max(0, Math.floor(state.resources[resource] || 0));
    const amount = Math.min(wanted, available);
    if (amount > 0) cost[resource] = amount;
  });
  return cost;
}

function allianceConvoyCapacity() {
  const market = buildingLevelById("mercado");
  const allianceHouse = buildingLevelById("casa-alianza");
  const base = 2400 + market * 650 + allianceHouse * 450;
  return Math.round(base * (1 + allianceProjectLevel("routes") * 0.08));
}

function allianceConvoyHonor(cost = {}) {
  const weighted = Object.entries(cost).reduce((sum, [resource, amount]) => {
    const multiplier = resource === "silver" ? 3 : resource === "iron" ? 1.6 : 1;
    return sum + amount * multiplier;
  }, 0);
  return Math.max(0, Math.round((weighted / 120) * (1 + allianceProjectLevel("routes") * 0.06)));
}

function sendAllianceConvoy(kind) {
  const preset = allianceConvoyPresets().find((item) => item.id === kind);
  if (!preset || preset.total <= 0) {
    openAllianceConvoySheet("No hay recursos suficientes para preparar ese convoy.");
    return;
  }
  if (!canPay(preset.cost)) {
    openAllianceConvoySheet(`Faltan recursos: ${formatCost(preset.cost)}.`);
    return;
  }

  payCost(preset.cost);
  if (!state.allianceTreasury) state.allianceTreasury = {};
  Object.entries(preset.cost).forEach(([resource, amount]) => {
    state.allianceTreasury[resource] = (state.allianceTreasury[resource] || 0) + amount;
  });
  state.allianceHonor = Math.max(0, Math.floor(state.allianceHonor || 0)) + preset.honor;
  state.allianceConvoys = [
    {
      id: `c${Date.now()}`,
      name: preset.name,
      resources: preset.cost,
      honor: preset.honor,
      at: Date.now()
    },
    ...(state.allianceConvoys || [])
  ].slice(0, 20);

  recordServerEvent("alliance.convoy", {
    convoyId: state.allianceConvoys[0]?.id || null,
    label: preset.name,
    resources: preset.cost,
    honor: preset.honor,
    treasuryTotal: resourceBundleTotal(state.allianceTreasury || {})
  });
  addAllianceFeed("Convoy enviado", `${preset.name}: ${formatResourceBundle(preset.cost)}. Honor +${formatNumber(preset.honor)}.`);
  addChatMessage("alliance", `Convoy ${preset.name} enviado: ${formatResourceBundle(preset.cost)}. Honor +${formatNumber(preset.honor)}.`);
  renderResources();
  renderAllianceSummary();
  renderAllianceMembers();
  renderAllianceFeed();
  openAllianceConvoySheet(`Convoy ${preset.name} enviado.`);
  saveState();
}

function buildingLevelById(id) {
  const building = buildings.find((item) => item.id === id);
  return building?.level || 1;
}

function openAllianceShopSheet(message = "") {
  activeSheetMode = "allianceShop";
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  const honor = Math.max(0, Math.floor(state.allianceHonor || 0));
  const items = allianceShopCatalog();

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>Tienda de Alianza</h2>
        <p>Gasta honor ganado con convoyes y actividad de la Orden.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Honor</span><strong>${formatNumber(honor)}</strong></div>
      <div><span>Compras</span><strong>${(state.alliancePurchases || []).length}</strong></div>
      <div><span>Convoyes</span><strong>${(state.allianceConvoys || []).length}</strong></div>
      <div><span>Tesoreria</span><strong>${formatNumber(resourceBundleTotal(state.allianceTreasury || {}))}</strong></div>
    </div>
    <div class="alliance-shop-grid">
      ${items
        .map((entry) => {
          const item = inventoryCatalog[entry.itemId];
          const canBuy = honor >= entry.cost;
          return `
            <button class="alliance-shop-item" type="button" data-alliance-buy="${entry.id}" ${canBuy ? "" : "disabled"}>
              <span class="shop-icon"><svg><use href="#${item.icon}" /></svg></span>
              <span>
                <strong>${item.name}</strong>
                <small>${entry.quantity}x - ${item.rarity}</small>
                <p>${item.description}</p>
              </span>
              <em>${formatNumber(entry.cost)} honor</em>
            </button>
          `;
        })
        .join("")}
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${message || "Los objetos comprados van al inventario."}</p>
  `;
  openSheet();
}

function allianceShopCatalog() {
  return [
    { id: "build-15", itemId: "speed-build-15", quantity: 1, cost: 16 },
    { id: "research-30", itemId: "speed-research-30", quantity: 1, cost: 28 },
    { id: "training-30", itemId: "speed-training-30", quantity: 1, cost: 26 },
    { id: "hero-energy", itemId: "hero-energy-180", quantity: 1, cost: 22 },
    { id: "hero-xp", itemId: "hero-xp-1600", quantity: 1, cost: 34 },
    { id: "silver-card", itemId: "card-silver-1200", quantity: 1, cost: 30 }
  ].filter((entry) => inventoryCatalog[entry.itemId]);
}

function buyAllianceShopItem(shopId) {
  const entry = allianceShopCatalog().find((item) => item.id === shopId);
  if (!entry) return;
  const honor = Math.max(0, Math.floor(state.allianceHonor || 0));
  const item = inventoryCatalog[entry.itemId];
  if (honor < entry.cost) {
    openAllianceShopSheet(`Falta honor: necesitas ${formatNumber(entry.cost)}.`);
    return;
  }

  state.allianceHonor = honor - entry.cost;
  state.inventory[entry.itemId] = (state.inventory[entry.itemId] || 0) + entry.quantity;
  state.alliancePurchases = [
    {
      id: `p${Date.now()}`,
      itemId: entry.itemId,
      quantity: entry.quantity,
      cost: entry.cost,
      at: Date.now()
    },
    ...(state.alliancePurchases || [])
  ].slice(0, 40);

  recordServerEvent("alliance.shop", {
    purchaseId: state.alliancePurchases[0]?.id || null,
    itemId: entry.itemId,
    itemName: item.name,
    quantity: entry.quantity,
    cost: entry.cost,
    honorAfter: state.allianceHonor
  });
  addAllianceFeed("Tienda de Alianza", `${entry.quantity}x ${item.name} comprado por ${formatNumber(entry.cost)} honor.`);
  renderInventory(`${item.name} anadido al inventario.`);
  renderAllianceSummary();
  renderAllianceFeed();
  openAllianceShopSheet(`${entry.quantity}x ${item.name} comprado.`);
  saveState();
}

function openAllianceProjectsSheet(message = "") {
  activeSheetMode = "allianceProjects";
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  const treasury = state.allianceTreasury || {};

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>Proyectos de Alianza</h2>
        <p>Usa tesoreria para mejorar beneficios permanentes de la Orden.</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Tesoreria</span><strong>${formatNumber(resourceBundleTotal(treasury))}</strong></div>
      <div><span>Honor</span><strong>${formatNumber(state.allianceHonor || 0)}</strong></div>
      <div><span>Ayuda</span><strong>${allianceHelpLimit()} max</strong></div>
      <div><span>Rally</span><strong>+${formatNumber(allianceRallyAttackBonus())}%</strong></div>
    </div>
    <div class="building-guidance">
      <strong>Recursos disponibles</strong>
      <p>${formatResourceBundle(treasury) || "Tesoreria vacia. Envia convoyes para financiar proyectos."}</p>
    </div>
    <div class="alliance-project-grid">
      ${allianceProjectCatalog
        .map((project) => {
          const level = allianceProjectLevel(project.id);
          const maxed = level >= project.max;
          const cost = allianceProjectCost(project);
          const canPay = maxed || canPayAllianceTreasury(cost);
          return `
            <article class="alliance-project-card">
              <span class="project-icon"><svg><use href="#${project.icon}" /></svg></span>
              <div>
                <strong>${project.name}</strong>
                <small>Nv. ${level}/${project.max} - ${project.effect}</small>
                <p>${project.description}</p>
                <em>${maxed ? "Completado" : formatResourceBundle(cost)}</em>
              </div>
              <button type="button" data-alliance-project="${project.id}" ${!maxed && canPay ? "" : "disabled"}>
                ${maxed ? "Max" : "Subir"}
              </button>
            </article>
          `;
        })
        .join("")}
    </div>
    <p class="challenge-feedback" id="sheetFeedback">${message || "La tesoreria se llena con convoyes."}</p>
  `;
  openSheet();
}

function upgradeAllianceProject(projectId) {
  const project = allianceProjectCatalog.find((item) => item.id === projectId);
  if (!project) return;
  const level = allianceProjectLevel(project.id);
  if (level >= project.max) {
    openAllianceProjectsSheet(`${project.name} ya esta al maximo.`);
    return;
  }

  const cost = allianceProjectCost(project);
  if (!canPayAllianceTreasury(cost)) {
    openAllianceProjectsSheet(`Faltan recursos en tesoreria: ${formatResourceBundle(cost)}.`);
    return;
  }

  payAllianceTreasury(cost);
  state.allianceProjects[project.id] = level + 1;
  recordServerEvent("alliance.project", {
    projectId: project.id,
    projectName: project.name,
    level: level + 1,
    cost,
    treasuryTotal: resourceBundleTotal(state.allianceTreasury || {})
  });
  addAllianceFeed("Proyecto de alianza", `${project.name} sube a nivel ${level + 1}.`);
  renderQueueStrip();
  renderAllianceSummary();
  renderAllianceMembers();
  renderRallies();
  openAllianceProjectsSheet(`${project.name} sube a nivel ${level + 1}.`);
  saveState();
}

function allianceProjectLevel(projectId) {
  const project = allianceProjectCatalog.find((item) => item.id === projectId);
  const max = project?.max || 5;
  return Math.min(max, Math.max(0, Math.floor(Number(state.allianceProjects?.[projectId] || 0))));
}

function allianceProjectCost(project) {
  const nextLevel = allianceProjectLevel(project.id) + 1;
  const factor = 1 + Math.max(0, nextLevel - 1) * 0.72;
  return compactResourceBundle(
    Object.fromEntries(
      Object.entries(project.baseCost).map(([resource, amount]) => [resource, Math.ceil((amount * factor) / 20) * 20])
    )
  );
}

function canPayAllianceTreasury(cost = {}) {
  return Object.entries(cost).every(([resource, amount]) => (state.allianceTreasury?.[resource] || 0) >= amount);
}

function payAllianceTreasury(cost = {}) {
  if (!state.allianceTreasury) state.allianceTreasury = {};
  Object.entries(cost).forEach(([resource, amount]) => {
    state.allianceTreasury[resource] = Math.max(0, (state.allianceTreasury[resource] || 0) - amount);
    if (state.allianceTreasury[resource] <= 0) delete state.allianceTreasury[resource];
  });
}

function allianceRallyAttackBonus() {
  return allianceProjectLevel("banner") * 3;
}

function sendChatMessage() {
  if (!chatInput) return;
  const text = chatInput.value.trim().replace(/\s+/g, " ");
  if (!text) return;
  const channel = chatChannel === "kingdom" ? "kingdom" : "alliance";
  addChatMessage(channel, text);
  chatInput.value = "";
}

function addChatMessage(channel, text, author = "Tu imperio", meta = {}) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  if (!clean) return false;
  if (!state.chatMessages) state.chatMessages = structuredClone(defaultState.chatMessages);
  const targetChannel = channel === "kingdom" ? "kingdom" : "alliance";
  const marker = meta.markerId ? mapMarkers.find((item) => item.id === meta.markerId) : null;
  const report = meta.reportId ? (state.reports || []).find((item) => item.id === meta.reportId) : null;
  const coord = meta.coord && Number.isFinite(meta.coord.x) && Number.isFinite(meta.coord.y)
    ? { x: Math.round(meta.coord.x), y: Math.round(meta.coord.y) }
    : marker
      ? markerWorldCoord(marker)
      : null;
  state.chatMessages[targetChannel] = [
    ...(state.chatMessages[targetChannel] || []),
    {
      author,
      text: clean.slice(0, 140),
      at: Date.now(),
      markerId: marker?.id || null,
      reportId: report?.id || null,
      coord
    }
  ].slice(-40);
  recordServerEvent("chat.send", {
    channel: targetChannel,
    author,
    text: clean.slice(0, 140),
    markerId: marker?.id || null,
    reportId: report?.id || null,
    coord
  });
  renderAllianceChat();
  saveState();
  return true;
}

function renderAllianceChat() {
  if (!chatTabs || !chatLog) return;
  const channel = chatChannel === "kingdom" ? "kingdom" : "alliance";
  chatTabs.querySelectorAll("[data-chat-channel]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.chatChannel === channel);
  });
  const messages = state.chatMessages?.[channel] || [];
  chatLog.innerHTML = messages.length
    ? messages
        .slice(-24)
        .map((message) => {
          const own = message.author === "Tu imperio";
          return `
            <div class="chat-message ${own ? "is-own" : ""}">
              <span>
                <strong>${escapeHtml(message.author)}</strong>
                <small>${formatReportTime(message.at)}</small>
              </span>
              <p>${escapeHtml(message.text)}</p>
              ${renderChatMessageAction(message)}
            </div>
          `;
        })
        .join("")
    : `<div class="empty-inventory">Sin mensajes todavia.</div>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderChatMessageAction(message) {
  const report = chatMessageReport(message);
  const marker = chatMessageMarker(message);
  if (!marker && !report) return "";
  return `
    ${
      report
        ? `<button class="chat-marker-link chat-report-link" type="button" data-chat-report="${report.id}">
            <svg><use href="#i-scroll" /></svg>
            <span>Ver informe</span>
          </button>`
        : ""
    }
    ${
      marker
        ? `<button class="chat-marker-link" type="button" data-chat-marker="${marker.id}">
            <svg><use href="#i-map" /></svg>
            <span>Ver ${markerCoordLabel(marker)}</span>
          </button>`
        : ""
    }
  `;
}

function chatMessageReport(message) {
  if (!message?.reportId) return null;
  return (state.reports || []).find((report) => report.id === message.reportId) || null;
}

function chatMessageMarker(message) {
  if (!message) return null;
  if (message.markerId) {
    const marker = mapMarkers.find((item) => item.id === message.markerId);
    if (marker) return marker;
  }
  const coord = message.coord && Number.isFinite(message.coord.x) && Number.isFinite(message.coord.y)
    ? { x: Math.round(message.coord.x), y: Math.round(message.coord.y) }
    : readCoordFromChatText(message.text);
  if (!coord) return null;
  return mapMarkers.find((marker) => {
    const markerCoord = markerWorldCoord(marker);
    return markerCoord.x === coord.x && markerCoord.y === coord.y;
  }) || null;
}

function readCoordFromChatText(text) {
  const match = /X:(\d+)\s+Y:(\d+)/i.exec(String(text || ""));
  if (!match) return null;
  return {
    x: Number(match[1]),
    y: Number(match[2])
  };
}

function reportTargetMarker(report) {
  if (!report) return null;
  if (report.markerId) {
    const marker = mapMarkers.find((item) => item.id === report.markerId);
    if (marker) return marker;
  }
  if (report.coord && Number.isFinite(report.coord.x) && Number.isFinite(report.coord.y)) {
    const coord = { x: Math.round(report.coord.x), y: Math.round(report.coord.y) };
    const marker = mapMarkers.find((item) => {
      const markerCoord = markerWorldCoord(item);
      return markerCoord.x === coord.x && markerCoord.y === coord.y;
    });
    if (marker) return marker;
  }
  return mapMarkers.find((marker) => marker.name === report.targetName) || null;
}

function reportTargetCoordLabel(report, marker = reportTargetMarker(report)) {
  if (marker) return markerCoordLabel(marker);
  if (report?.coord && Number.isFinite(report.coord.x) && Number.isFinite(report.coord.y)) {
    return `X:${Math.round(report.coord.x)} Y:${Math.round(report.coord.y)}`;
  }
  return "";
}

function openReportTarget(reportId) {
  const report = (state.reports || []).find((item) => item.id === reportId);
  const marker = reportTargetMarker(report);
  if (!marker) return;
  switchTab("world");
  window.setTimeout(() => {
    centerWorldOnMarker(marker.id, { flash: true });
    openMapMarker(marker.id);
  }, 0);
}

function shareReportToChat(reportId, channel = "alliance") {
  const report = (state.reports || []).find((item) => item.id === reportId);
  if (!report) return;
  const targetChannel = channel === "kingdom" ? "kingdom" : "alliance";
  const marker = reportTargetMarker(report);
  const reportType = report.kind === "scout" ? "Espionaje" : report.isRally ? "Rally" : "Informe";
  const message = `${reportType} ${marchKindName(report.kind)} ${report.targetName}: ${report.summary}`;
  addChatMessage(targetChannel, message, "Tu imperio", {
    reportId: report.id,
    markerId: marker?.id || null,
    coord: marker ? markerWorldCoord(marker) : report.coord || null
  });
  addAllianceFeed("Informe compartido", `${report.targetName} enviado al chat de ${targetChannel === "kingdom" ? "reino" : "alianza"}.`);
  renderAllianceFeed();
  const feedback = document.querySelector("#sheetFeedback");
  if (feedback) feedback.textContent = `Informe compartido en ${targetChannel === "kingdom" ? "Reino" : "Alianza"}.`;
  saveState();
}

function openBetaStatusSheet() {
  activeSheetMode = "beta";
  activeBuildingId = null;
  activePlotId = null;
  activeMapMarkerId = null;
  activeWorldMarchId = null;
  activeReportId = null;
  activeRallyId = null;
  const snapshot = buildBetaSnapshot();
  const checks = buildBetaChecks(snapshot);
  const serverReadiness = snapshot.server?.readiness || [];
  const serverEvents = snapshot.server?.commandLog || [];

  sheetBody.innerHTML = `
    <div class="sheet-title">
      <div>
        <h2>Estado beta</h2>
        <p>${snapshot.id} - ${snapshot.exportedAtLocal}</p>
      </div>
      <button class="close-sheet" type="button" data-close-sheet aria-label="Cerrar">
        <svg><use href="#i-close" /></svg>
      </button>
    </div>
    <div class="world-meta">
      <div><span>Poder</span><strong>${formatNumber(snapshot.player.power)}</strong></div>
      <div><span>Recursos</span><strong>${formatNumber(snapshot.economy.totalStock)} / ${formatNumber(snapshot.economy.totalCapacity)}</strong></div>
      <div><span>Tropas</span><strong>${formatNumber(snapshot.military.totalTroops)}</strong></div>
      <div><span>Heridos</span><strong>${formatNumber(snapshot.military.woundedTotal)} / ${formatNumber(snapshot.military.hospitalCapacity)}</strong></div>
      <div><span>Marchas</span><strong>${snapshot.world.marches.length} / ${snapshot.limits.marchSlots}</strong></div>
      <div><span>Informes</span><strong>${snapshot.world.reports.length}</strong></div>
      <div><span>Honor</span><strong>${formatNumber(snapshot.alliance.honor)}</strong></div>
      <div><span>Tesoreria</span><strong>${formatNumber(snapshot.alliance.treasuryTotal)}</strong></div>
    </div>
    <div class="building-guidance beta-status">
      <strong>Chequeo local</strong>
      <div class="beta-check-list">
        ${checks
          .map(
            (check) => `
              <div class="beta-check ${check.ok ? "is-ok" : "is-warn"}">
                <span>${check.ok ? "OK" : "REV"}</span>
                <p>${check.label}</p>
                <strong>${check.value}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
    <div class="building-guidance beta-status">
      <strong>Backend</strong>
      <p>Cuenta, reino, alianza, edificios, tropas, heroe, equipo, inventario, colas, marchas, informes y chat quedan en el snapshot.</p>
      <div class="server-readiness-list">
        ${serverReadiness.map(renderServerReadinessItem).join("")}
      </div>
    </div>
    <div class="building-guidance beta-status">
      <strong>Comandos de servidor</strong>
      <p>Ultimas acciones locales que el backend debera validar y persistir.</p>
      <div class="server-event-list">
        ${
          serverEvents.length
            ? serverEvents.slice(-8).reverse().map(renderServerEventItem).join("")
            : `<div class="server-event-empty">Todavia no hay comandos. Envia una marcha, inicia una cola o escribe en el chat.</div>`
        }
      </div>
    </div>
    <div class="action-row">
      <button class="primary-action" type="button" data-beta-copy>
        <svg><use href="#i-scroll" /></svg>Copiar JSON
      </button>
      <button class="secondary-action" type="button" data-beta-download>
        <svg><use href="#i-bag" /></svg>Descargar
      </button>
    </div>
    <p class="challenge-feedback" id="sheetFeedback">Snapshot listo.</p>
  `;
  openSheet();
}

function buildBetaSnapshot() {
  const stock = cloneForSnapshot(state.resources || {});
  const capacity = Object.fromEntries(resources.map((resource) => [resource.id, resourceCapacity(resource.id)]));
  const reports = cloneForSnapshot(state.reports || []);
  const chatMessages = cloneForSnapshot(state.chatMessages || {});
  const serverEvents = normalizeServerEvents(state.serverEvents || []);
  const combatAudit = buildCombatAuditScenarios();
  const queues = Object.entries(state.queues || {})
    .filter(([, queue]) => Boolean(queue))
    .map(([type, queue]) => ({
      type,
      label: queue.label || queueTypeName(type),
      startedAt: queue.startedAt,
      finishAt: queue.finishAt,
      remainingMs: Math.max(0, (queue.finishAt || Date.now()) - Date.now()),
      helpApplied: Math.max(0, Math.floor(queue.helpApplied || 0)),
      helpLimit: allianceHelpLimit(),
      payload: cloneForSnapshot(queue.payload || {})
    }));
  const home = markerById(HOME_MARKER_ID);
  const heroes = heroRoster.map((hero) => {
    const info = heroLevelInfo(hero.id);
    const data = heroState(hero.id);
    return {
      id: hero.id,
      name: hero.name,
      level: info.level,
      xp: Math.floor(data.xp || 0),
      energy: Math.floor(data.energy || 0),
      energyMax: heroEnergyMax(hero.id)
    };
  });
  const payload = {
    schema: "imperio-dorado-beta-local-v1",
    exportedAt: new Date().toISOString(),
    exportedAtLocal: new Date().toLocaleString("es-ES"),
    player: {
      id: "local-player",
      realm: "reino-1",
      city: "Imperio Dorado",
      alliance: "OD",
      power: state.power,
      selectedHeroId: state.selectedHeroId
    },
    limits: {
      buildingMaxLevel: BUILDING_MAX_LEVEL,
      worldMax: { x: WORLD_COORD_MAX_X, y: WORLD_COORD_MAX_Y },
      marchSlots: marchSlots(),
      marchSize: maxMarchSize(),
      troopTier: troopTierLimit(),
      monsterTier: monsterTierLimit()
    },
    economy: {
      stock,
      capacity,
      totalStock: resourceBundleTotal(stock),
      totalCapacity: Object.values(capacity).reduce((sum, value) => sum + value, 0),
      inventory: cloneForSnapshot(state.inventory || {})
    },
    city: {
      buildings: buildings.map((building) => ({
        id: building.id,
        name: building.name,
        kind: building.kind || building.role,
        resource: building.resource || null,
        level: building.level,
        maxLevel: BUILDING_MAX_LEVEL
      })),
      plots: cloneForSnapshot(fortressPlots),
      queues
    },
    research: cloneForSnapshot(state.researchLevels || {}),
    military: {
      troops: cloneForSnapshot(state.troops || {}),
      available: availableTroops(),
      reserved: reservedTroops(),
      totalTroops: totalTroops(),
      marchingTroops: marchingTroopCount(),
      woundedByTroop: cloneForSnapshot(state.woundedByTroop || {}),
      woundedTotal: woundedTroopTotal(),
      hospitalCapacity: totalHospitalCapacity(),
      hospitalFree: hospitalBedsFree(),
      totalTrainingQueue: totalTrainingQueue(),
      attackBonus: totalAttackBonus(),
      defenseBonus: totalDefenseBonus(),
      combat: combatBonusBreakdown(),
      audit: cloneForSnapshot(combatAudit)
    },
    heroes,
    equipment: {
      loadout: state.activeEquipmentLoadout,
      forged: cloneForSnapshot(state.heroEquipment || {}),
      fragments: buildForgeFragmentSnapshot()
    },
    world: {
      home: { markerId: HOME_MARKER_ID, coord: markerWorldCoord(home) },
      marches: cloneForSnapshot(state.marches || []),
      rallies: cloneForSnapshot(state.rallies || []),
      bookmarks: cloneForSnapshot(state.worldBookmarks || []),
      enemyTargets: buildEnemyTargetSnapshot(),
      resourceTiles: buildResourceTileSnapshot(),
      monsterTargets: buildMonsterTargetSnapshot(),
      reports
    },
    alliance: {
      tag: "OD",
      name: "Orden del Dorado",
      honor: Math.max(0, Math.floor(state.allianceHonor || 0)),
      treasury: cloneForSnapshot(state.allianceTreasury || {}),
      treasuryTotal: resourceBundleTotal(state.allianceTreasury || {}),
      convoyCapacity: allianceConvoyCapacity(),
      convoys: cloneForSnapshot(state.allianceConvoys || []),
      purchases: cloneForSnapshot(state.alliancePurchases || []),
      projects: cloneForSnapshot(state.allianceProjects || {}),
      bonuses: {
        helpLimit: allianceHelpLimit(),
        rallyAttack: allianceRallyAttackBonus(),
        convoyCapacity: allianceConvoyCapacity()
      },
      members: cloneForSnapshot(allianceMemberList())
    },
    social: {
      chatMessages,
      allianceFeed: cloneForSnapshot(state.allianceFeed || [])
    },
    wisdom: cloneForSnapshot(state.wisdom || {}),
    rawState: cloneForSnapshot(state)
  };
  payload.server = {
    target: "backend-autoritativo",
    persistence: "D1 para estado estructurado; R2 solo para assets/subidas futuras",
    realtime: "WebSocket/Durable Object para chat, marchas, rallies y presencia",
    commandLog: serverEvents,
    commandCount: serverEvents.length,
    commandTypes: [...new Set(serverEvents.map((event) => event.type))],
    readiness: buildServerReadiness(payload)
  };
  const checksum = hashString(JSON.stringify(payload));
  return {
    id: `beta-${checksum}`,
    checksum,
    ...payload
  };
}

function buildBetaChecks(snapshot) {
  const maxBuilding = Math.max(...snapshot.city.buildings.map((building) => building.level));
  const resourcesWithinCap = resources.every((resource) => (snapshot.economy.stock[resource.id] || 0) <= (snapshot.economy.capacity[resource.id] || 0));
  const reportsWithTargets = snapshot.world.reports.filter((report) => reportTargetMarker(report) || reportTargetCoordLabel(report)).length;
  const chatTotal = Object.values(snapshot.social.chatMessages || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  const audit = snapshot.military.audit || {};
  const heroApplies = (audit.withHero?.value || 0) > (audit.noHero?.value || 0);
  const countersApply = (audit.counterGood?.counterBonus || 0) > 0 && (audit.counterBad?.counterBonus || 0) < 0;
  const rallyApplies = (audit.rally?.rallyBonus || 0) >= 0 && (audit.rally?.value || 0) >= (audit.withHero?.value || 0);
  const enemyTargetsReady = (snapshot.world.enemyTargets || []).every((target) => target.markerId && target.coord && target.troops && target.resources);
  const resourceTilesReady = (snapshot.world.resourceTiles || []).every((tile) => tile.markerId && tile.coord && Number.isFinite(tile.remaining) && Number.isFinite(tile.max));
  const monsterTargetsReady = (snapshot.world.monsterTargets || []).every((target) => target.markerId && target.coord && Number.isFinite(target.health) && Number.isFinite(target.maxHealth));
  const serverEventsReady = (snapshot.server?.commandLog || []).every((event) => event.id && event.type && Number.isFinite(event.at));
  return [
    { label: "Edificios", ok: maxBuilding <= BUILDING_MAX_LEVEL, value: `max ${maxBuilding}/${BUILDING_MAX_LEVEL}` },
    { label: "Recursos", ok: resourcesWithinCap, value: `${formatNumber(snapshot.economy.totalStock)}` },
    { label: "Marchas", ok: snapshot.world.marches.length <= snapshot.limits.marchSlots, value: `${snapshot.world.marches.length}/${snapshot.limits.marchSlots}` },
    { label: "Hospital", ok: snapshot.military.woundedTotal <= snapshot.military.hospitalCapacity, value: `${formatNumber(snapshot.military.woundedTotal)}/${formatNumber(snapshot.military.hospitalCapacity)}` },
    { label: "Combate", ok: heroApplies && countersApply && rallyApplies, value: `heroe +${formatNumber(Math.max(0, (audit.withHero?.value || 0) - (audit.noHero?.value || 0)))}` },
    { label: "Rivales", ok: enemyTargetsReady, value: `${(snapshot.world.enemyTargets || []).length} castillos` },
    { label: "Tiles", ok: resourceTilesReady, value: `${(snapshot.world.resourceTiles || []).length} recursos` },
    { label: "Monstruos", ok: monsterTargetsReady, value: `${(snapshot.world.monsterTargets || []).length} objetivos` },
    { label: "Informes", ok: reportsWithTargets === snapshot.world.reports.length, value: `${reportsWithTargets}/${snapshot.world.reports.length}` },
    { label: "Tesoreria", ok: snapshot.alliance.treasuryTotal > 0, value: `${formatNumber(snapshot.alliance.treasuryTotal)}` },
    { label: "Eventos", ok: serverEventsReady, value: `${(snapshot.server?.commandLog || []).length} cmds` },
    { label: "Chat", ok: chatTotal <= 80, value: `${chatTotal} mensajes` }
  ];
}

function buildServerReadiness(snapshot) {
  const chatTotal = Object.values(snapshot.social?.chatMessages || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  const activeQueues = snapshot.city?.queues?.length || 0;
  const activeMarches = (snapshot.world?.marches?.length || 0) + (snapshot.world?.rallies?.length || 0);
  const forgedPieces = Object.values(snapshot.equipment?.forged || {}).filter(Boolean).length;
  const commandCount = normalizeServerEvents(snapshot.rawState?.serverEvents || []).length;
  return [
    {
      id: "identity",
      name: "Cuenta y reino",
      layer: "D1",
      status: "Listo para persistir",
      count: "1 jugador",
      detail: `${snapshot.player.city} en ${snapshot.player.realm}, alianza ${snapshot.player.alliance}`
    },
    {
      id: "city",
      name: "Ciudad y economia",
      layer: "D1 + motor tick",
      status: "Listo para persistir",
      count: `${snapshot.city.buildings.length} edificios`,
      detail: `${formatNumber(snapshot.economy.totalStock)} recursos / ${activeQueues} colas`
    },
    {
      id: "military",
      name: "Tropas y combate",
      layer: "D1 + servidor autoritativo",
      status: "Reglas exportadas",
      count: `${formatNumber(snapshot.military.totalTroops)} tropas`,
      detail: `Ataque ${formatNumber(snapshot.military.attackBonus)}% / defensa ${formatNumber(snapshot.military.defenseBonus)}%`
    },
    {
      id: "world",
      name: "Mundo y marchas",
      layer: "D1 + scheduler",
      status: "Necesita reino compartido",
      count: `${activeMarches} movimientos`,
      detail: `${snapshot.world.bookmarks.length} marcadores y ${snapshot.world.reports.length} informes`
    },
    {
      id: "alliance",
      name: "Alianza y chat",
      layer: "D1 + tiempo real",
      status: "Modelo preparado",
      count: `${snapshot.alliance.members.length} miembros`,
      detail: `${chatTotal} mensajes, ${formatNumber(snapshot.alliance.treasuryTotal)} tesoreria`
    },
    {
      id: "rewards",
      name: "Sabios y paquetes",
      layer: "D1",
      status: "Control semanal",
      count: `${snapshot.wisdom?.claimedThisWeek || 0}/2 reclamados`,
      detail: "Paquetes gratuitos por preguntas de matematicas"
    },
    {
      id: "hero",
      name: "Heroe y forja",
      layer: "D1",
      status: "Inventario exportable",
      count: `${snapshot.heroes.length} heroes`,
      detail: `${forgedPieces} piezas forjadas y fragmentos por calidad`
    },
    {
      id: "commands",
      name: "Comandos de API",
      layer: "API + D1",
      status: "Trazabilidad local",
      count: `${commandCount} eventos`,
      detail: "Colas, marchas, chat, sabios, forja y alianza quedan auditados"
    }
  ];
}

function renderServerReadinessItem(item) {
  return `
    <div class="server-readiness-item">
      <span>${item.layer}</span>
      <strong>${item.name}</strong>
      <small>${item.status}</small>
      <em>${item.count}</em>
      <p>${item.detail}</p>
    </div>
  `;
}

function renderServerEventItem(event) {
  const time = formatReportTime(event.at);
  return `
    <div class="server-event-item">
      <span>${serverEventTypeLabel(event.type)}</span>
      <strong>${event.summary}</strong>
      <small>${time}</small>
      <em>${event.status}</em>
    </div>
  `;
}

function serverEventTypeLabel(type) {
  return String(type || "evento")
    .replace(/\./g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function betaSnapshotJson() {
  return JSON.stringify(buildBetaSnapshot(), null, 2);
}

function buildForgeFragmentSnapshot() {
  return Object.fromEntries(
    Object.keys(forgeMaterialBases).map((baseId) => [
      baseId,
      Object.fromEntries(forgeQualities.map((quality, index) => [quality.id, forgeMaterialCount(baseId, index)]))
    ])
  );
}

function buildEnemyTargetSnapshot() {
  return mapMarkers
    .filter((marker) => marker.kind === "enemy")
    .map((marker) => {
      const intel = enemyIntel(marker);
      return {
        markerId: marker.id,
        name: marker.name,
        alliance: marker.alliance || "",
        level: marker.level || 1,
        coord: markerWorldCoord(marker),
        sector: markerSectorLabel(marker),
        defense: intel.defense,
        wall: intel.wall,
        hospitalCapacity: intel.hospital,
        hospitalUsed: intel.hospitalUsed,
        hospitalFree: intel.hospitalFree,
        troops: cloneForSnapshot(intel.troops),
        wounded: cloneForSnapshot(intel.wounded),
        resources: cloneForSnapshot(intel.stock),
        lootable: cloneForSnapshot(intel.loot),
        protectedResources: cloneForSnapshot(intel.protected),
        state: enemyStateLabel(intel)
      };
    });
}

async function copyBetaSnapshot() {
  const text = betaSnapshotJson();
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else if (!fallbackCopyText(text)) throw new Error("copy");
    setSheetFeedback("Snapshot copiado.");
  } catch {
    setSheetFeedback("No se pudo copiar. Usa Descargar.");
  }
}

function downloadBetaSnapshot() {
  const snapshot = buildBetaSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `imperio-dorado-${snapshot.id}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  setSheetFeedback("Snapshot descargado.");
}

function fallbackCopyText(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.append(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

function setSheetFeedback(message) {
  const feedback = document.querySelector("#sheetFeedback");
  if (feedback) feedback.textContent = message;
}

function cloneForSnapshot(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function hashString(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function addAllianceFeed(title, body) {
  state.allianceFeed.unshift({ title, body });
  state.allianceFeed = state.allianceFeed.slice(0, 8);
}

function renderAllianceFeed() {
  allianceFeed.innerHTML = state.allianceFeed
    .map(
      (item) => `
        <div class="feed-item">
          <strong>${item.title}</strong>
          <span>${item.body}</span>
        </div>
      `
    )
    .join("");
}
