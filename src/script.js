import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

let scene, renderer, camera, camOrbit, camTrack;
let usandoOrbit = true;
let mapa,
  mapsx,
  mapsy,
  scale = 8;
let objetos = [];
let texturacargada = false;

// Coordenadas de mapa (escala OSM)
let minlat = 28.1078,
  maxlat = 28.17516;
let minlon = -15.71577,
  maxlon = -15.60247;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 12);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  // 🎮 Controles Orbit y Trackball
  camOrbit = new OrbitControls(camera, renderer.domElement);
  camOrbit.enableDamping = true;
  camOrbit.dampingFactor = 0.05;
  camOrbit.minDistance = 0.5;
  camOrbit.maxDistance = 80;
  camOrbit.zoomSpeed = 1.2;

  camTrack = new TrackballControls(camera, renderer.domElement);
  camTrack.rotateSpeed = 3.0;
  camTrack.zoomSpeed = 1.2;
  camTrack.panSpeed = 0.8;
  camTrack.enabled = false; // se inicia desactivado

  const aspectRatio = (maxlon - minlon) / (maxlat - minlat);
  mapsy = scale;
  mapsx = mapsy * aspectRatio;

  console.log("🚀 Iniciando aplicación Gáldar 3D");
  console.log("📍 Coordenadas:", { minlat, maxlat, minlon, maxlon });
  console.log("📐 Dimensiones mapa:", { mapsx, mapsy });

  cargarRecursos();

  // 🎚️ Botón de cambio de cámara dentro de #info
  const infoDiv = document.getElementById("info");
  const btnCam = document.createElement("button");
  btnCam.id = "btnCamara";
  btnCam.innerText = "🎥 Cambiar a Trackball";
  btnCam.addEventListener("click", alternarCamara);
  infoDiv.appendChild(btnCam);

  actualizarVisibilidadControles();

  window.addEventListener("resize", onWindowResize);
}

function actualizarVisibilidadControles() {
  const orbitControls = document.getElementById("orbit-controls");
  const trackballControls = document.getElementById("trackball-controls");

  if (usandoOrbit) {
    orbitControls.style.display = "block";
    trackballControls.style.display = "none";
  } else {
    orbitControls.style.display = "none";
    trackballControls.style.display = "block";
  }
}

function alternarCamara() {
  usandoOrbit = !usandoOrbit;
  camOrbit.enabled = usandoOrbit;
  camTrack.enabled = !usandoOrbit;
  const btn = document.getElementById("btnCamara");
  btn.innerText = usandoOrbit ? "🎥 Cambiar a Trackball" : "🎯 Cambiar a Orbit";

  // Actualizar visibilidad de controles
  actualizarVisibilidadControles();
}

function cargarRecursos() {
  cargarTexturaMapa();
}

function cargarTexturaMapa() {
  const textureLoader = new THREE.TextureLoader();
  const posiblesRutas = ["map.png", "./map.png", "/map.png", "src/map.png"];
  let intento = 0;

  const intentarCarga = () => {
    if (intento >= posiblesRutas.length) {
      console.log("🗺️ No se pudo cargar el mapa, usando plano base");
      crearPlanoBase();
      iniciarAplicacion();
      return;
    }

    const ruta = posiblesRutas[intento];
    console.log(`🖼️ Intentando cargar mapa desde: ${ruta}`);

    textureLoader.load(
      ruta,
      (texture) => {
        console.log("✅ Mapa cargado correctamente");
        crearMapaConTextura(texture);
        iniciarAplicacion();
      },
      undefined,
      (error) => {
        console.log(`❌ Error cargando mapa desde ${ruta}:`, error);
        intento++;
        intentarCarga();
      }
    );
  };

  intentarCarga();
}

function crearMapaConTextura(texture) {
  const geometry = new THREE.PlaneGeometry(mapsx, mapsy);
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  mapa = new THREE.Mesh(geometry, material);
  mapa.position.set(0, 0, -0.01);
  mapa.receiveShadow = true;
  scene.add(mapa);
  console.log("✅ Mapa 3D creado con textura");
}

function crearPlanoBase() {
  const geometry = new THREE.PlaneGeometry(mapsx, mapsy);
  const material = new THREE.MeshLambertMaterial({
    color: 0x2d5a27,
    side: THREE.DoubleSide,
  });
  mapa = new THREE.Mesh(geometry, material);
  mapa.position.set(0, 0, -0.01);
  mapa.receiveShadow = true;
  scene.add(mapa);
  console.log("✅ Plano base creado");
}

function iniciarAplicacion() {
  texturacargada = true;
  cargarOSM();
  console.log("🎉 Aplicación inicializada");
}

function cargarOSM() {
  const posiblesRutasOSM = ["map.osm", "./map.osm", "/map.osm", "src/map.osm"];
  let intento = 0;

  const intentarCargaOSM = () => {
    if (intento >= posiblesRutasOSM.length) {
      console.log("📄 No se pudo cargar OSM desde ninguna ruta.");
      return;
    }

    const ruta = posiblesRutasOSM[intento];
    console.log(`📁 Intentando cargar OSM desde: ${ruta}`);

    fetch(ruta)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((xmlText) => {
        if (!xmlText.includes("<osm")) throw new Error("Archivo OSM no válido");
        procesarOSM(xmlText);
      })
      .catch((error) => {
        console.log(`❌ Error cargando OSM desde ${ruta}:`, error.message);
        intento++;
        intentarCargaOSM();
      });
  };

  intentarCargaOSM();
}

function procesarOSM(xmlText) {
  try {
    const osmTagStart = xmlText.indexOf("<osm");
    if (osmTagStart === -1) return console.error("❌ No se encontró <osm>");

    let cleanedXmlText = xmlText.substring(osmTagStart);
    if (!cleanedXmlText.includes("</osm>")) cleanedXmlText += "\n</osm>";

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(cleanedXmlText, "text/xml");
    if (xmlDoc.querySelector("parsererror")) {
      console.error("❌ Error en XML OSM");
      return;
    }

    procesarDatosOSMReales(xmlDoc);
  } catch (error) {
    console.error("💥 Error procesando OSM:", error);
  }
}

function procesarDatosOSMReales(xmlDoc) {
  const nodes = xmlDoc.getElementsByTagName("node");
  const nodesMap = new Map();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const id = node.getAttribute("id");
    const lat = parseFloat(node.getAttribute("lat"));
    const lon = parseFloat(node.getAttribute("lon"));
    if (!isNaN(lat) && !isNaN(lon)) nodesMap.set(id, { lat, lon });
  }

  console.log(`📊 Nodos válidos: ${nodesMap.size}`);

  procesarCallesOSM(xmlDoc, nodesMap);
  procesarEdificiosOSM(xmlDoc, nodesMap);

  crearLeyenda();
}

function procesarCallesOSM(xmlDoc, nodesMap) {
  const ways = xmlDoc.getElementsByTagName("way");
  let callesProcesadas = 0;

  for (let i = 0; i < ways.length; i++) {
    const way = ways[i];
    const tags = way.getElementsByTagName("tag");
    let esCalle = false;

    for (let j = 0; j < tags.length; j++) {
      const k = tags[j].getAttribute("k");
      if (k === "highway") {
        esCalle = true;
        break;
      }
    }

    if (esCalle) {
      procesarWayComoCalle(way, nodesMap);
      callesProcesadas++;
    }
  }

  console.log(`🛣️ Calles procesadas: ${callesProcesadas}`);
}

function procesarWayComoCalle(way, nodesMap) {
  const ndElements = way.getElementsByTagName("nd");
  const points = [];

  for (let i = 0; i < ndElements.length; i++) {
    const ref = ndElements[i].getAttribute("ref");
    const node = nodesMap.get(ref);
    if (node) {
      const x = Map2Range(node.lon, minlon, maxlon, -mapsx / 2, mapsx / 2);
      const y = Map2Range(node.lat, minlat, maxlat, -mapsy / 2, mapsy / 2);
      points.push(new THREE.Vector3(x, y, 0.001));
    }
  }

  if (points.length > 1) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 1,
    });
    const linea = new THREE.Line(geometry, material);
    scene.add(linea);
  }
}

function procesarEdificiosOSM(xmlDoc, nodesMap) {
  const ways = xmlDoc.getElementsByTagName("way");
  let edificiosProcesados = 0;

  for (let i = 0; i < ways.length; i++) {
    const way = ways[i];
    const tags = way.getElementsByTagName("tag");
    let esEdificio = false;

    for (let j = 0; j < tags.length; j++) {
      const k = tags[j].getAttribute("k");
      if (k === "building") {
        esEdificio = true;
        break;
      }
    }

    if (esEdificio) {
      const añadido = procesarWayComoEdificio(way, nodesMap);
      if (añadido) edificiosProcesados++;
    }
  }

  console.log(`🏢 Edificios procesados: ${edificiosProcesados}`);
}

function procesarWayComoEdificio(way, nodesMap) {
  const ndElements = way.getElementsByTagName("nd");
  const tags = way.getElementsByTagName("tag");

  const points = [];
  let tipo = "otros";
  let nombre = "";
  let levels = 1;

  let buildingTag = "";
  let amenityTag = "";
  let leisureTag = "";
  let tourismTag = "";
  let historicTag = "";
  let officeTag = "";
  let shopTag = "";
  let industrialTag = "";
  let landuseTag = "";

  // Analizar etiquetas para determinar tipo y niveles
  for (let i = 0; i < tags.length; i++) {
    const k = tags[i].getAttribute("k");
    const vAttr = tags[i].getAttribute("v");
    const v = vAttr ? vAttr.toLowerCase() : "";

    console.log("Etiqueta del edificio:", k, "=", vAttr);

    if (k === "name") nombre = vAttr || "";
    else if (k === "building") buildingTag = v;
    else if (k === "amenity") amenityTag = v;
    else if (k === "leisure") leisureTag = v;
    else if (k === "tourism") tourismTag = v;
    else if (k === "historic") historicTag = v;
    else if (k === "office") officeTag = v;
    else if (k === "shop") shopTag = v;
    else if (k === "industrial") industrialTag = v;
    else if (k === "landuse") landuseTag = v;
    else if (k === "building:levels") levels = parseFloat(v) || 1;
  }

  // CLASIFICACIÓN MEJORADA - PRIORIZAR ETIQUETAS ESPECÍFICAS
  // 1. Primero las etiquetas más específicas (amenity, tourism, leisure)
  if (amenityTag) {
    if (amenityTag.includes("hospital") || amenityTag.includes("clinic"))
      tipo = "hospital";
    else if (amenityTag.includes("parking")) tipo = "parking";
    else if (amenityTag.includes("library")) tipo = "cultural";
    else if (amenityTag.includes("theatre") || amenityTag.includes("cinema"))
      tipo = "cultural";
    else if (
      amenityTag.includes("townhall") ||
      amenityTag.includes("public_building")
    )
      tipo = "government";
    else if (
      amenityTag.includes("school") ||
      amenityTag.includes("university") ||
      amenityTag.includes("college") ||
      amenityTag.includes("kindergarten") ||
      amenityTag.includes("institute") ||
      amenityTag.includes("research") ||
      amenityTag.includes("training") ||
      amenityTag.includes("education")
    ) {
      tipo = "education";
    } else if (amenityTag.includes("place_of_worship")) tipo = "religious";
    else if (amenityTag.includes("marketplace")) tipo = "commercial";
    else if (amenityTag.includes("community_centre")) tipo = "community";
    else if (amenityTag.includes("arts_centre")) tipo = "cultural";
  }

  if (tourismTag) {
    if (tourismTag.includes("museum") || tourismTag.includes("gallery"))
      tipo = "cultural";
    else if (
      tourismTag.includes("hotel") ||
      tourismTag.includes("hostel") ||
      tourismTag.includes("guest_house")
    )
      tipo = "hotel";
    else if (tourismTag.includes("chalet")) tipo = "residential";
    else if (tourismTag.includes("attraction")) tipo = "cultural";
  }

  if (leisureTag) {
    if (leisureTag.includes("park") || leisureTag.includes("garden"))
      tipo = "park";
    else if (
      leisureTag.includes("stadium") ||
      leisureTag.includes("sports_centre") ||
      leisureTag.includes("pitch") ||
      leisureTag.includes("sports_center")
    )
      tipo = "sports";
  }

  // 2. Etiquetas históricas y de oficina
  if (historicTag) {
    if (
      historicTag.includes("monument") ||
      historicTag === "yes" ||
      historicTag.includes("archaeological_site")
    )
      tipo = "historic";
  }

  if (officeTag) {
    tipo = "commercial";
  }

  if (shopTag) {
    tipo = "commercial";
  }

  if (industrialTag) {
    tipo = "industrial";
  }

  // 3. Clasificación por tipo de construcción (building tag) - MÁS ESPECÍFICA
  if (buildingTag && tipo === "otros") {
    if (buildingTag.includes("hospital") || buildingTag.includes("clinic"))
      tipo = "hospital";
    else if (
      buildingTag.includes("church") ||
      buildingTag.includes("cathedral") ||
      buildingTag.includes("mosque") ||
      buildingTag.includes("temple") ||
      buildingTag.includes("chapel") ||
      buildingTag.includes("religious")
    )
      tipo = "religious";
    else if (
      buildingTag.includes("museum") ||
      buildingTag.includes("theatre") ||
      buildingTag.includes("gallery")
    )
      tipo = "cultural";
    else if (
      buildingTag.includes("school") ||
      buildingTag.includes("university") ||
      buildingTag.includes("college") ||
      buildingTag.includes("kindergarten") ||
      buildingTag.includes("institute") ||
      buildingTag.includes("academy")
    )
      tipo = "education";
    else if (
      buildingTag.includes("retail") ||
      buildingTag.includes("commercial") ||
      buildingTag.includes("shop") ||
      buildingTag.includes("kiosk") ||
      buildingTag.includes("mall")
    )
      tipo = "commercial";
    else if (
      buildingTag.includes("industrial") ||
      buildingTag.includes("warehouse")
    )
      tipo = "industrial";
    else if (
      buildingTag.includes("civic") ||
      buildingTag.includes("public") ||
      buildingTag.includes("government")
    )
      tipo = "government";
    else if (
      buildingTag.includes("apartments") ||
      buildingTag.includes("residential") ||
      buildingTag.includes("house") ||
      buildingTag === "yes" ||
      buildingTag.includes("detached") ||
      buildingTag.includes("dormitory")
    ) {
      tipo = "residential";
    } else if (buildingTag.includes("hotel") || buildingTag.includes("hostel"))
      tipo = "hotel";
    else if (buildingTag.includes("office")) tipo = "commercial";
    else if (buildingTag.includes("service") || buildingTag.includes("garage"))
      tipo = "service";
    else if (
      buildingTag.includes("train_station") ||
      buildingTag.includes("transportation")
    )
      tipo = "transport";
    else if (
      buildingTag.includes("stadium") ||
      buildingTag.includes("sports_centre") ||
      buildingTag.includes("sports_center")
    )
      tipo = "sports";
    else if (buildingTag.includes("parking") || buildingTag.includes("garage"))
      tipo = "parking";
    else if (buildingTag.includes("roof")) tipo = "roof";
    else if (buildingTag.includes("shed") || buildingTag.includes("garage"))
      tipo = "shed";
  }

  // 4. Clasificación por uso de suelo
  if (landuseTag && tipo === "otros") {
    if (landuseTag.includes("residential")) tipo = "residential";
    else if (landuseTag.includes("commercial") || landuseTag.includes("retail"))
      tipo = "commercial";
    else if (landuseTag.includes("industrial")) tipo = "industrial";
  }

  // 5. Inferencia por nombre - SOLO si no se clasificó antes
  if (tipo === "otros" && nombre) {
    const nombreLower = nombre.toLowerCase();

    // Museos y sitios culturales
    if (
      nombreLower.includes("museo") ||
      nombreLower.includes("museu") ||
      nombreLower.includes("cueva pintada") ||
      nombreLower.includes("arqueológico") ||
      nombreLower.includes("arqueologica") ||
      nombreLower.includes("cultural") ||
      nombreLower.includes("galería") ||
      nombreLower.includes("galeria") ||
      nombreLower.includes("exposición") ||
      nombreLower.includes("exposicion")
    ) {
      tipo = "cultural";
    }
    // Educación - MÁS COMPLETO
    else if (
      nombreLower.includes("escuela") ||
      nombreLower.includes("colegio") ||
      nombreLower.includes("universidad") ||
      nombreLower.includes("instituto") ||
      nombreLower.includes("academia") ||
      nombreLower.includes("educación") ||
      nombreLower.includes("educacion") ||
      nombreLower.includes("escuela municipal") ||
      nombreLower.includes("ies ") ||
      nombreLower.includes(" i.e.s.") ||
      nombreLower.includes("centro de estudios") ||
      nombreLower.includes("formación") ||
      nombreLower.includes("formacion") ||
      nombreLower.includes("liceo") ||
      nombreLower.includes("facultad") ||
      nombreLower.includes("campus") ||
      nombreLower.includes("centro educativo") ||
      nombreLower.includes("enseñanza") ||
      nombreLower.includes("ensenanza") ||
      nombreLower.includes("educativa") ||
      nombreLower.includes("educativo") ||
      nombreLower.includes("centro de formación") ||
      nombreLower.includes("ceip") ||
      nombreLower.includes("cep") ||
      nombreLower.includes("centro de profesores") ||
      nombreLower.includes("centro del profesorado")
    ) {
      tipo = "education";
    }
    // Gobierno
    else if (
      nombreLower.includes("ayuntamiento") ||
      nombreLower.includes("municipal") ||
      nombreLower.includes("gobierno") ||
      nombreLower.includes("consistorio") ||
      nombreLower.includes("alcaldía") ||
      nombreLower.includes("alcaldia") ||
      nombreLower.includes("diputación") ||
      nombreLower.includes("diputacion") ||
      nombreLower.includes("cabildo") ||
      nombreLower.includes("delegación") ||
      nombreLower.includes("delegacion")
    ) {
      tipo = "government";
    }
    // Religioso
    else if (
      nombreLower.includes("iglesia") ||
      nombreLower.includes("capilla") ||
      nombreLower.includes("ermita") ||
      nombreLower.includes("catedral") ||
      nombreLower.includes("parroquia") ||
      nombreLower.includes("convento") ||
      nombreLower.includes("monasterio") ||
      nombreLower.includes("santuario") ||
      nombreLower.includes("basílica") ||
      nombreLower.includes("basilica")
    ) {
      tipo = "religious";
    }
    // Hoteles
    else if (
      nombreLower.includes("hotel") ||
      nombreLower.includes("hostal") ||
      nombreLower.includes("albergue") ||
      nombreLower.includes("residencia") ||
      nombreLower.includes("aparthotel") ||
      nombreLower.includes("pensión") ||
      nombreLower.includes("pension") ||
      nombreLower.includes("hospedería") ||
      nombreLower.includes("hospederia")
    ) {
      tipo = "hotel";
    }
    // Comercial
    else if (
      nombreLower.includes("mercado") ||
      nombreLower.includes("comercial") ||
      nombreLower.includes("centro comercial") ||
      nombreLower.includes("tienda") ||
      nombreLower.includes("supermercado") ||
      nombreLower.includes("hipermercado") ||
      nombreLower.includes("almacén") ||
      nombreLower.includes("almacen") ||
      nombreLower.includes("bazar") ||
      nombreLower.includes("comercio") ||
      nombreLower.includes("compras") ||
      nombreLower.includes("plaza de abastos")
    ) {
      tipo = "commercial";
    }
    // Deportes
    else if (
      nombreLower.includes("polideportivo") ||
      nombreLower.includes("deporte") ||
      nombreLower.includes("estadio") ||
      nombreLower.includes("pabellón") ||
      nombreLower.includes("pabellon") ||
      nombreLower.includes("gimnasio") ||
      nombreLower.includes("cancha") ||
      nombreLower.includes("campo de fútbol") ||
      nombreLower.includes("campo de futbol") ||
      nombreLower.includes("instalación deportiva") ||
      nombreLower.includes("instalacion deportiva")
    ) {
      tipo = "sports";
    }
    // Industrial
    else if (
      nombreLower.includes("fabrica") ||
      nombreLower.includes("taller") ||
      nombreLower.includes("industrial") ||
      nombreLower.includes("almacén") ||
      nombreLower.includes("almacen") ||
      nombreLower.includes("nave") ||
      nombreLower.includes("fábrica") ||
      nombreLower.includes("factoría") ||
      nombreLower.includes("factoria") ||
      nombreLower.includes("manufactura")
    ) {
      tipo = "industrial";
    }
    // Salud
    else if (
      nombreLower.includes("hospital") ||
      nombreLower.includes("clínica") ||
      nombreLower.includes("clinica") ||
      nombreLower.includes("centro de salud") ||
      nombreLower.includes("salud") ||
      nombreLower.includes("médico") ||
      nombreLower.includes("medico") ||
      nombreLower.includes("sanitario") ||
      nombreLower.includes("farmacia") ||
      nombreLower.includes("ambulatorio")
    ) {
      tipo = "hospital";
    }
    // Transporte
    else if (
      nombreLower.includes("estación") ||
      nombreLower.includes("estacion") ||
      nombreLower.includes("parada") ||
      nombreLower.includes("terminal") ||
      nombreLower.includes("aeropuerto") ||
      nombreLower.includes("puerto") ||
      nombreLower.includes("autobús") ||
      nombreLower.includes("autobus") ||
      nombreLower.includes("taxi") ||
      nombreLower.includes("transporte")
    ) {
      tipo = "transport";
    }
  }

  // Convertir nodos a coordenadas del mapa
  for (let i = 0; i < ndElements.length; i++) {
    const ref = ndElements[i].getAttribute("ref");
    const node = nodesMap.get(ref);
    if (node) {
      const x = Map2Range(node.lon, minlon, maxlon, -mapsx / 2, mapsx / 2);
      const y = Map2Range(node.lat, minlat, maxlat, -mapsy / 2, mapsy / 2);
      points.push(new THREE.Vector2(x, y));
    }
  }

  if (points.length < 3) return false; // no forma polígono

  // 🎨 Colores por tipo de edificio
  const colores = {
    hospital: 0xff4444,
    religious: 0xffff00,
    cultural: 0x0000ff, // AZUL para museos y cultural
    education: 0x00ff00, // VERDE para educación
    residential: 0xffcc66,
    commercial: 0xff66cc,
    industrial: 0x996633,
    government: 0x00ffff,
    sports: 0x0099ff,
    hotel: 0xff00ff,
    parking: 0x666666,
    park: 0x00ff88,
    historic: 0x8b4513,
    community: 0xff8c00,
    service: 0x8a2be2,
    transport: 0x2e8b57,
    roof: 0xa9a9a9,
    shed: 0x696969,
    otros: 0xd4b483,
  };

  const color = colores[tipo] || colores["otros"];

  // 🏗️ Alturas - mantener las originales si vienen, si no usar mínima
  let altura = 0.01; // altura base mínima para que se vea como capa delgada

  // Si viene building:levels, usar esa altura (escalada)
  if (levels > 0) {
    altura = 0.005 + levels * 0.01;
  }

  // Crear geometría extruida
  const shape = new THREE.Shape(points);
  const extrudeSettings = {
    depth: altura,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshLambertMaterial({
    color,
    transparent: true,
    opacity: 0.95,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0.001;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);
  objetos.push({ mesh, tipo, nombre });

  return true;
}

function crearLeyenda() {
  const leyendaExistente = document.getElementById("leyenda-galdar");
  if (leyendaExistente) leyendaExistente.remove();

  const leyenda = document.createElement("div");
  leyenda.id = "leyenda-galdar";
  leyenda.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(255,255,255,0.98);
    padding: 0;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    max-width: 300px;
    z-index: 1000;
    border: 1px solid #ccc;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    overflow: hidden;
  `;

  // Header desplegable
  const leyendaHeader = document.createElement("div");
  leyendaHeader.style.cssText = `
    padding: 12px 15px;
    background: #2c5530;
    color: white;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  `;
  leyendaHeader.innerHTML = `
    <span>🏙️ Tipos de Edificios</span>
    <span id="leyenda-toggle">▼</span>
  `;

  // Contenido de la leyenda
  const leyendaContent = document.createElement("div");
  leyendaContent.id = "leyenda-content";
  leyendaContent.style.cssText = `
    padding: 15px;
    max-height: 60vh;
    overflow-y: auto;
    display: none;
  `;

  // Categorías completas para la leyenda
  const categorias = {
    hospital: { color: 0xff4444, nombre: "🏥 Hospitales/Clínicas" },
    religious: { color: 0xffff00, nombre: "⛪ Iglesias" },
    cultural: { color: 0x0000ff, nombre: "🎭 Cultural" },
    education: { color: 0x00ff00, nombre: "🎓 Educación" },
    residential: { color: 0xffcc66, nombre: "🏠 Residencial" },
    commercial: { color: 0xff66cc, nombre: "🏪 Comercial" },
    industrial: { color: 0x996633, nombre: "🏭 Industrial" },
    government: { color: 0x00ffff, nombre: "🏛️ Gobierno" },
    sports: { color: 0x0099ff, nombre: "⚽ Deportes" },
    hotel: { color: 0xff00ff, nombre: "🏨 Hoteles" },
    parking: { color: 0x666666, nombre: "🅿️ Parkings" },
    park: { color: 0x00ff88, nombre: "🌳 Parques" },
    historic: { color: 0x8b4513, nombre: "🏺 Histórico" },
    community: { color: 0xff8c00, nombre: "👥 Comunitario" },
    service: { color: 0x8a2be2, nombre: "🔧 Servicio" },
    transport: { color: 0x2e8b57, nombre: "🚊 Estacion de Guaguas" },
    shed: { color: 0x696969, nombre: "🏛️ Museos" },
    otros: { color: 0xd4b483, nombre: "❓ Otros" },
  };

  // Contar tipos detectados
  const tiposDetectados = {};
  objetos.forEach((obj) => {
    if (!tiposDetectados[obj.tipo]) tiposDetectados[obj.tipo] = 0;
    tiposDetectados[obj.tipo]++;
  });

  let contenido = `<div style="margin-bottom: 12px; font-size: 11px; color: #666; text-align: center;">
    Total edificios: ${objetos.length}
  </div>`;

  // Mostrar todas las categorías definidas
  for (const [tipoKey, info] of Object.entries(categorias)) {
    const count = tiposDetectados[tipoKey] || 0;
    if (count > 0) {
      // Solo mostrar categorías que tienen edificios
      const colorHex = "#" + info.color.toString(16).padStart(6, "0");

      contenido += `
        <div style="display: flex; align-items: center; margin-bottom: 6px; padding: 3px 0;">
          <div style="width: 14px; height: 14px; background-color: ${colorHex}; margin-right: 10px; border-radius: 3px; border: 1px solid #666;"></div>
          <span style="flex: 1; font-size: 11px;">${info.nombre}</span>
          <span style="font-weight: bold; margin-left: 8px; color: #333; font-size: 11px;">${count}</span>
        </div>
      `;
    }
  }

  contenido += `
    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #666; line-height: 1.4;">
      <strong>Controles:</strong><br>
      🖱️ Arrastra: rotar vista<br>
      📍 Rueda: zoom in/out<br>
      🗺️ Click derecho: mover<br>
      📊 Datos: OpenStreetMap
    </div>
  `;

  leyendaContent.innerHTML = contenido;

  leyenda.appendChild(leyendaHeader);
  leyenda.appendChild(leyendaContent);
  document.body.appendChild(leyenda);

  // Funcionalidad desplegable
  let desplegada = false;
  leyendaHeader.addEventListener("click", () => {
    desplegada = !desplegada;
    const content = document.getElementById("leyenda-content");
    const toggle = document.getElementById("leyenda-toggle");

    if (desplegada) {
      content.style.display = "block";
      toggle.textContent = "▲";
    } else {
      content.style.display = "none";
      toggle.textContent = "▼";
    }
  });

  // Inicialmente desplegada
  setTimeout(() => {
    leyendaHeader.click();
  }, 500);
}

function Map2Range(val, vmin, vmax, dmin, dmax) {
  if (isNaN(val) || isNaN(vmin) || isNaN(vmax)) return dmin;
  const t = (val - vmin) / (vmax - vmin);
  const result = dmin + t * (dmax - dmin);
  return isNaN(result) ? dmin : result;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (texturacargada && objetos.length > 0) {
    objetos.forEach((obj, index) => {
      if (obj && obj.mesh) {
        obj.mesh.position.z =
          0.001 + Math.sin(Date.now() * 0.001 + index) * 0.002;
      }
    });
  }

  if (usandoOrbit) camOrbit.update();
  else camTrack.update();
  renderer.render(scene, camera);
}
