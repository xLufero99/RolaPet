import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Mapa.css';

// Componentes separados
import Cabecera from './Cabecera';
import ControlesMapa from './ControlesMapa';
import PanelResultados from './PanelResultados';
import { mapasBase } from '../config/mapasBase';

// FIX CRÍTICO: Corregir rutas de iconos Leaflet - DEBE IR ANTES DE TODO
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Mapa() {
  // Estados
  const [center, setCenter] = useState([4.60971, -74.08175]);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [tipoMapa, setTipoMapa] = useState('vector_3857');
  const [zoom, setZoom] = useState(13);
  const [buscando, setBuscando] = useState(false);
  
  // Referencias
  const mapRef = useRef();

  // Detectar si el texto parece una dirección de Bogotá
  const esDireccionBogota = (texto) => {
    if (!texto) return false;
    
    // Patrones comunes en direcciones de Bogotá
    const patronesDireccion = [
      /^(KR|CRA|CL|AK|DG|TV|AV|CALLE|CARRERA|AVENIDA|DIAGONAL|TRANSVERSAL)\s*\d+/i,
      /\d+\s*(ESTE|SUR|NORTE|OESTE|#|NUMERO|NO?\.?)/i,
      /(MANZANA|MZ|BLOQUE|BL|INTERIOR|INT|APARTAMENTO|APTO|CASA|CS)\s*\d+/i
    ];
    
    // También considerar formato "Calle 123 # 45-67"
    const formatoConNumero = /\d+\s*#?\s*\d+\s*-?\s*\d*/;
    
    return patronesDireccion.some(patron => patron.test(texto)) || 
           formatoConNumero.test(texto);
  };

  // Geocodificación con API IDECA (dirección → coordenadas)
  const geocodificarDireccion = async (direccion) => {
    try {
      const apiKey = 'e2d6f043-7b63-417e-8fbe-db515898576f';
      const geoUrl = `https://catalogopmb.catastrobogota.gov.co/PMBWeb/web/api?cmd=geocodificar&apikey=${apiKey}&query=${encodeURIComponent(direccion)}`;
      
      console.log('📍 Geocodificando dirección:', geoUrl);
      
      const respuesta = await fetch(geoUrl);
      const datos = await respuesta.json();
      
      if (datos.response && datos.response.success) {
        return {
          nombre: datos.response.data.dirtrad,
          tipo: '📍 Dirección',
          localidad: datos.response.data.localidad,
          upz: datos.response.data.nomupz,
          barrio: datos.response.data.nomseccat,
          direccion: datos.response.data.dirtrad,
          direccionOriginal: datos.response.data.dirinput,
          latitud: parseFloat(datos.response.data.latitude),
          longitud: parseFloat(datos.response.data.longitude),
          tipoDireccion: datos.response.data.tipo_direccion,
          datosCompletos: datos.response.data,
          esDireccion: true
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error en geocodificación:', error);
      return null;
    }
  };

  // Transformar coordenadas ArcGIS
  // REEMPLAZA la función transformarCoordenadasArcGIS con esta versión mejorada:
const transformarCoordenadasArcGIS = (geometry, esPoligono = false) => {
  try {
    // Si ya tenemos coordenadas WGS84 (y, x) en la geometría
    if (geometry?.y && geometry?.x) {
      // Verificar si ya son coordenadas válidas (Bogotá está entre lat 4-5, lng -75 a -74)
      const lat = geometry.y;
      const lng = geometry.x;
      
      if (lat >= 3 && lat <= 6 && lng >= -76 && lng <= -73) {
        return { lat, lng };
      }
    }
    
    // Para polígonos (parques, barrios)
    if (esPoligono && geometry?.rings?.[0]?.[0]) {
      const lat = geometry.rings[0][0][1];
      const lng = geometry.rings[0][0][0];
      
      // Validar que sean coordenadas razonables para Bogotá
      if (lat >= 3 && lat <= 6 && lng >= -76 && lng <= -73) {
        return { lat, lng };
      }
    }
    
    // Si las coordenadas están en EPSG:3857 (x,y muy grandes)
    if (geometry?.x && geometry?.y) {
      const x = geometry.x;
      const y = geometry.y;
      
      // Si son coordenadas EPSG:3857 (valores grandes, millones)
      if (Math.abs(x) > 1000000 || Math.abs(y) > 1000000) {
        // Conversión aproximada EPSG:3857 → WGS84
        const lon = (x * 180) / 20037508.34;
        const lat = (Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI) - 90;
        
        // Ajustar para Bogotá (aproximación)
        const latAjustada = lat + 0.1; // Pequeño ajuste
        const lonAjustada = lon - 0.1;
        
        if (latAjustada >= 4 && latAjustada <= 5 && lonAjustada >= -74.5 && lonAjustada <= -73.5) {
          return { lat: latAjustada, lng: lonAjustada };
        }
      }
    }
    
    // Si llegamos aquí, usar coordenadas por defecto de Bogotá
    console.warn('⚠️ Coordenadas no válidas, usando centro de Bogotá');
    return { lat: 4.60971, lng: -74.08175 };
    
  } catch (error) {
    console.error('❌ Error transformando coordenadas:', error);
    return { lat: 4.60971, lng: -74.08175 };
  }
};

  // BUSCAR EN MÚLTIPLES SERVICIOS ARCGIS
  const buscarEnArcGIS = async (termino) => {
    const servicios = [
      {
        nombre: 'Hospitales',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/IPS/FeatureServer/0/query?returnGeometry=true&outFields=Nombre,Dirección,LocNombre&f=json&where=UPPER(Nombre)%20LIKE%20%27%25${termino.toUpperCase()}%25%27&resultRecordCount=10`,
        campoNombre: 'Nombre',
        campoTipo: '🏥 Hospital/Clínica',
        campoDireccion: 'Dirección',
        campoLocalidad: 'LocNombre',
        esPoligono: false
      },
      {
        nombre: 'Universidades',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Universidad/FeatureServer/0/query?returnGeometry=true&outFields=SINNOMBRE,SINDIRECCI&f=json&where=UPPER(SINNOMBRE)%20LIKE%20%27%25${termino.toUpperCase()}%25%27&resultRecordCount=10`,
        campoNombre: 'SINNOMBRE',
        campoTipo: '🎓 Universidad',
        campoDireccion: 'SINDIRECCI',
        esPoligono: false
      },
      {
        nombre: 'Parques',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/parquesyescenarios/FeatureServer/1/query?returnGeometry=true&outFields=NOMBRE_PAR,LOCNOMBRE&f=json&where=UPPER(NOMBRE_PAR)%20LIKE%20%27%25${termino.toUpperCase()}%25%27&resultRecordCount=10`,
        campoNombre: 'NOMBRE_PAR',
        campoTipo: '🌳 Parque',
        campoLocalidad: 'LOCNOMBRE',
        esPoligono: true
      },
      {
        nombre: 'Barrios',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/sectorcatastral/FeatureServer/0/query?returnGeometry=true&outFields=SCANOMBRE&f=json&where=UPPER(SCANOMBRE)%20LIKE%20%27%25${termino.toUpperCase()}%25%27&resultRecordCount=10`,
        campoNombre: 'SCANOMBRE',
        campoTipo: '🏘️ Barrio/UPZ',
        esPoligono: true
      },
      {
        nombre: 'Plazas de Mercado',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Plaza_Mercado/FeatureServer/0/query?returnGeometry=true&outFields=NOMBRE,DIRECCION&f=json&where=UPPER(NOMBRE)%20LIKE%20%27%25${termino.toUpperCase()}%25%27&resultRecordCount=10`,
        campoNombre: 'NOMBRE',
        campoTipo: '🛒 Plaza de Mercado',
        campoDireccion: 'DIRECCION',
        esPoligono: false
      },
      {
        nombre: 'Paraderos SITP',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/ParaderosSITP/FeatureServer/0/query?returnGeometry=true&outFields=nombre,direccion_,LocNombre&f=json&where=UPPER(nombre)%20LIKE%20%27%25${termino.toUpperCase()}%25%27&resultRecordCount=10`,
        campoNombre: 'nombre',
        campoTipo: '🚏 Paradero SITP',
        campoDireccion: 'direccion_',
        campoLocalidad: 'LocNombre',
        esPoligono: false
      }
    ];

    const todosResultados = [];
    const promesas = servicios.map(servicio => 
      fetch(servicio.url)
        .then(r => r.json())
        .then(datos => ({ datos, servicio }))
        .catch(() => ({ datos: { features: [] }, servicio }))
    );

    const resultados = await Promise.all(promesas);

    resultados.forEach(({ datos, servicio }) => {
      if (datos.features && datos.features.length > 0) {
        datos.features.forEach(feature => {
          const coords = transformarCoordenadasArcGIS(feature.geometry, servicio.esPoligono);
          
          if (coords) {
            const resultado = {
              nombre: feature.attributes[servicio.campoNombre] || 'Sin nombre',
              tipo: servicio.campoTipo,
              latitud: coords.lat,
              longitud: coords.lng,
              fuente: servicio.nombre,
              datosCompletos: feature.attributes,
              esDireccion: false
            };

            if (servicio.campoDireccion && feature.attributes[servicio.campoDireccion]) {
              resultado.direccion = feature.attributes[servicio.campoDireccion];
            }
            if (servicio.campoLocalidad && feature.attributes[servicio.campoLocalidad]) {
              resultado.localidad = feature.attributes[servicio.campoLocalidad];
            }

            todosResultados.push(resultado);
          }
        });
      }
    });

    return todosResultados;
  };

  // FUNCIÓN PRINCIPAL DE BÚSQUEDA
  const buscarDireccion = async () => {
    if (!busqueda.trim()) return;
    
    console.log('🔍 Iniciando búsqueda:', busqueda);
    setBuscando(true);
    
    try {
      // 1. PRIMERO: Verificar si es una dirección
      if (esDireccionBogota(busqueda)) {
        console.log('📍 Detectado como dirección, geocodificando...');
        const direccionResultado = await geocodificarDireccion(busqueda);
        
        if (direccionResultado) {
          console.log('✅ Dirección encontrada:', direccionResultado);
          setResultados([direccionResultado]);
          
          // Centrar en la dirección
          if (mapRef.current) {
            const nuevaUbicacion = [direccionResultado.latitud, direccionResultado.longitud];
            setCenter(nuevaUbicacion);
            setZoom(18);
            mapRef.current.setView(nuevaUbicacion, 18);
          }
          
          setBuscando(false);
          return;
        } else {
          console.log('⚠️ Dirección no encontrada, buscando como lugar...');
        }
      }
      
      // 2. SEGUNDO: Buscar en servicios ArcGIS
      console.log('🔎 Buscando en servicios ArcGIS...');
      const resultadosArcGIS = await buscarEnArcGIS(busqueda);
      
      if (resultadosArcGIS.length > 0) {
        console.log(`✅ ${resultadosArcGIS.length} resultados encontrados en ArcGIS`);
        setResultados(resultadosArcGIS);
        
        // Centrar en el primer resultado
        if (mapRef.current && resultadosArcGIS[0]) {
          const primerResultado = resultadosArcGIS[0];
          const nuevaUbicacion = [primerResultado.latitud, primerResultado.longitud];
          setCenter(nuevaUbicacion);
          setZoom(16);
          mapRef.current.setView(nuevaUbicacion, 16);
        }
      } else {
        console.log('❌ No se encontraron resultados');
        setResultados([]);
        alert(`No se encontraron resultados para: "${busqueda}"\n\nPrueba con:\n• Nombres de lugares (hospital, parque, universidad)\n• Direcciones completas (KR 30 25 90)\n• Barrios (Chapinero, Teusaquillo)`);
      }
      
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setResultados([]);
      alert('Error al conectar con los servicios de búsqueda');
    } finally {
      setBuscando(false);
    }
  };

  // OBTENER MI UBICACIÓN
  const obtenerMiUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          const nuevaUbicacion = [posicion.coords.latitude, posicion.coords.longitude];
          setMiUbicacion(nuevaUbicacion);
          setCenter(nuevaUbicacion);
          setZoom(16);
          
          if (mapRef.current) {
            mapRef.current.setView(nuevaUbicacion, 16);
          }
        },
        (error) => {
          alert('No se pudo obtener tu ubicación. Asegúrate de dar permisos.');
          console.error('Error geolocalización:', error);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  // Controladores de zoom
  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      setZoom(mapRef.current.getZoom());
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      setZoom(mapRef.current.getZoom());
    }
  };

  // Manejar selección de sugerencia
  const handleSeleccionarSugerencia = (sugerencia) => {
    if (sugerencia.latitud && sugerencia.longitud && mapRef.current) {
      const newCenter = [sugerencia.latitud, sugerencia.longitud];
      setCenter(newCenter);
      setZoom(sugerencia.esDireccion ? 18 : 16);
      mapRef.current.setView(newCenter, sugerencia.esDireccion ? 18 : 16);
      
      setBusqueda(sugerencia.nombre);
      setResultados([sugerencia]);
    }
  };

  // Cambiar tipo de mapa
  const cambiarMapa = (tipo) => {
    setTipoMapa(tipo);
  };

  return (
    <div className="mapa-container">
      <Cabecera 
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        buscarDireccion={buscarDireccion}
        center={center}
        onSeleccionarSugerencia={handleSeleccionarSugerencia}  
      />

{/* ==== OVERLAY SOBRE TODO ==== */}
    {buscando && (
      <div className="overlay-carga-global">
        <div className="spinner-grande"></div>
        <p>Buscando en servicios de Bogotá...</p>
        <small>Hospitales • Universidades • Parques • Barrios • Mercados • Paraderos</small>
      </div>
    )}


      <div className="contenedor-principal">
        <ControlesMapa
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          obtenerMiUbicacion={obtenerMiUbicacion}
          cambiarMapa={cambiarMapa}
          tipoMapa={tipoMapa}
          zoom={zoom}
          miUbicacion={miUbicacion}
          buscando={buscando}
        />
  
        <div className="mapa-area">
          <MapContainer
            center={center}
            zoom={zoom}
            ref={mapRef}
            zoomControl={false}
            className="leaflet-container"
          >
            <TileLayer
              url={mapasBase[tipoMapa].url}
              attribution={mapasBase[tipoMapa].atribucion}
            />
            
            {/* Marcador del centro */}
            {!miUbicacion && !resultados.length && (
              <Marker position={center}>
                <Popup>Centro de Bogotá</Popup>
              </Marker>
            )}
            
            {/* Marcador de MI ubicación */}
            {miUbicacion && (
              <Marker position={miUbicacion}>
                <Popup>
                  <strong>¡Estás aquí!</strong><br/>
                  Lat: {miUbicacion[0].toFixed(6)}<br/>
                  Lng: {miUbicacion[1].toFixed(6)}
                </Popup>
              </Marker>
            )}
            
            {/* Resultados de búsqueda */}
            {resultados.slice(0, 15).map((resultado, index) => (
              <Marker 
                key={index} 
                position={[resultado.latitud, resultado.longitud]}
              >
                <Popup>
                  <div className="popup-contenido">
                    <strong>{resultado.nombre}</strong><br/>
                    <small className="popup-tipo">{resultado.tipo}</small>
                    {resultado.direccion && (
                      <div className="popup-direccion">
                        <strong>Dirección:</strong> {resultado.direccion}
                      </div>
                    )}
                    {resultado.localidad && (
                      <div className="popup-localidad">
                        <strong>Localidad:</strong> {resultado.localidad}
                      </div>
                    )}
                    {resultado.barrio && (
                      <div className="popup-barrio">
                        <strong>Barrio:</strong> {resultado.barrio}
                      </div>
                    )}
                    {resultado.tipoDireccion && (
                      <div className="popup-tipo-direccion">
                        <small><em>{resultado.tipoDireccion}</em></small>
                      </div>
                    )}
                    <div className="popup-coordenadas">
                      <small>Lat: {resultado.latitud.toFixed(6)}</small><br/>
                      <small>Lng: {resultado.longitud.toFixed(6)}</small>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <PanelResultados 
          resultados={resultados}
          mapRef={mapRef}
          buscando={buscando}
        />
      </div>
    </div>
  );
}

export default Mapa;