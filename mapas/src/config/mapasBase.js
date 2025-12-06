// Configuración de mapas base disponibles

export const mapasBase = {
  vector_3857: {
    id: 'vector_3857',
    nombre: '🗺️ Mapa Vector',
    url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_3857/MapServer/tile/{z}/{y}/{x}',
    atribucion: 'IDECA Bogotá'
  },
  hibrido_3857: {
    id: 'hibrido_3857',
    nombre: '🌆 Mapa Híbrido',
    url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_hibrido/MapServer/tile/{z}/{y}/{x}',
    atribucion: 'IDECA Bogotá'
  },
  gris_3857: {
    id: 'gris_3857',
    nombre: '🏙️ Mapa Gris',
    url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_gris/MapServer/tile/{z}/{y}/{x}',
    atribucion: 'IDECA Bogotá'
  },
  toner_3857: {
    id: 'toner_3857',
    nombre: '⚫ Mapa Tóner',
    url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_toner/MapServer/tile/{z}/{y}/{x}',
    atribucion: 'IDECA Bogotá'
  },
  oscuro_3857: {
    id: 'oscuro_3857',
    nombre: '🌙 Mapa Oscuro',
    url: 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/Mapa_Referencia/mapa_base_oscuro_3857/MapServer/tile/{z}/{y}/{x}',
    atribucion: 'IDECA Bogotá'
  }
};

// También podemos exportar un helper para obtener un mapa por ID
export const obtenerMapaPorId = (id) => {
  return mapasBase[id] || mapasBase.vector_3857;
};

// Exportar lista de IDs para usar en selects
export const idsMapasBase = Object.keys(mapasBase);