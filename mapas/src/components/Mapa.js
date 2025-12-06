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

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Icono personalizado para "Mi ubicación"
const miUbicacionIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function Mapa() {
  // Estados
  const [center, setCenter] = useState([4.60971, -74.08175]);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [tipoMapa, setTipoMapa] = useState('vector_3857');
  const [zoom, setZoom] = useState(13);
  
  // Referencias
  const mapRef = useRef();

  // OBTENER MI UBICACIÓN SOLO CUANDO SE PIDE
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

  // FUNCIÓN CORREGIDA: Buscar usando ArcGIS que SÍ funciona
  

// FUNCIÓN MEJORADA: Buscar en múltiples servicios ArcGIS
const buscarDireccion = async () => {
  if (!busqueda.trim()) return;
  
  console.log('🔍 Buscando:', busqueda);
  
  try {
    const todosResultados = [];
    
    // 1. BUSCAR EN MÚLTIPLES SERVICIOS ARCGIS EN PARALELO
    const servicios = [
      // IPS - Hospitales
      `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/IPS/FeatureServer/0/query?returnGeometry=true&outFields=Nombre,Dirección,LocNombre&f=json&outSR=4326&where=UPPER(Nombre)%20LIKE%20%27%25${busqueda.toUpperCase()}%25%27&resultRecordCount=5`,
      
      // Universidad - Universidades
      `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Universidad/FeatureServer/0/query?returnGeometry=true&outFields=SINNOMBRE,SINDIRECCI&f=json&outSR=4326&where=UPPER(SINNOMBRE)%20LIKE%20%27%25${busqueda.toUpperCase()}%25%27&resultRecordCount=5`,
      
      // Parques
      `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/parquesyescenarios/FeatureServer/1/query?returnGeometry=true&outFields=NOMBRE_PAR,LOCNOMBRE&f=json&outSR=4326&where=UPPER(NOMBRE_PAR)%20LIKE%20%27%25${busqueda.toUpperCase()}%25%27&resultRecordCount=5`,
      
      // Barrios
      `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/sectorcatastral/FeatureServer/0/query?returnGeometry=true&outFields=SCANOMBRE&f=json&outSR=4326&where=UPPER(SCANOMBRE)%20LIKE%20%27%25${busqueda.toUpperCase()}%25%27&resultRecordCount=5`,
      
      // Plazas de mercado
      `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Plaza_Mercado/FeatureServer/0/query?returnGeometry=true&outFields=NOMBRE,DIRECCION&f=json&outSR=4326&where=UPPER(NOMBRE)%20LIKE%20%27%25${busqueda.toUpperCase()}%25%27&resultRecordCount=5`,
      
      // Paraderos SITP
      `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/ParaderosSITP/FeatureServer/0/query?returnGeometry=true&outFields=nombre,direccion_,LocNombre&f=json&outSR=4326&where=UPPER(nombre)%20LIKE%20%27%25${busqueda.toUpperCase()}%25%27&resultRecordCount=5`
    ];
    
    // Ejecutar todas las búsquedas en paralelo
    const promesas = servicios.map(url => fetch(url).then(r => r.json()));
    const resultados = await Promise.all(promesas);
    
    // Procesar resultados de cada servicio
    resultados.forEach((datos, index) => {
      if (datos.features && datos.features.length > 0) {
        datos.features.forEach(feature => {
          let resultado = {};
          
          // Transformar según el servicio
          switch(index) {
            case 0: // IPS
              resultado = {
                nombre: feature.attributes.Nombre,
                tipo: 'Hospital/Clínica',
                localidad: feature.attributes.LocNombre,
                direccion: feature.attributes.Dirección,
                latitud: feature.geometry?.y || feature.geometry?.coordinates?.[1],
                longitud: feature.geometry?.x || feature.geometry?.coordinates?.[0]
              };
              break;
              
            case 1: // Universidad
              resultado = {
                nombre: feature.attributes.SINNOMBRE,
                tipo: 'Universidad',
                direccion: feature.attributes.SINDIRECCI,
                latitud: feature.geometry?.y || feature.geometry?.coordinates?.[1],
                longitud: feature.geometry?.x || feature.geometry?.coordinates?.[0]
              };
              break;
              
            case 2: // Parques
              resultado = {
                nombre: feature.attributes.NOMBRE_PAR,
                tipo: 'Parque',
                localidad: feature.attributes.LOCNOMBRE,
                latitud: feature.geometry?.rings?.[0]?.[0]?.[1] || center[0],
                longitud: feature.geometry?.rings?.[0]?.[0]?.[0] || center[1]
              };
              break;
              
            case 3: // Barrios
              resultado = {
                nombre: feature.attributes.SCANOMBRE,
                tipo: 'Barrio/UPZ',
                latitud: feature.geometry?.rings?.[0]?.[0]?.[1] || center[0],
                longitud: feature.geometry?.rings?.[0]?.[0]?.[0] || center[1]
              };
              break;
              
            case 4: // Plazas de mercado
              resultado = {
                nombre: feature.attributes.NOMBRE,
                tipo: 'Plaza de Mercado',
                direccion: feature.attributes.DIRECCION,
                latitud: feature.geometry?.y || feature.geometry?.coordinates?.[1],
                longitud: feature.geometry?.x || feature.geometry?.coordinates?.[0]
              };
              break;
              
            case 5: // Paraderos
              resultado = {
                nombre: feature.attributes.nombre,
                tipo: 'Paradero SITP',
                direccion: feature.attributes.direccion_,
                localidad: feature.attributes.LocNombre,
                latitud: feature.geometry?.y || feature.geometry?.coordinates?.[1],
                longitud: feature.geometry?.x || feature.geometry?.coordinates?.[0]
              };
              break;
          }
          
          if (resultado.nombre && resultado.latitud && resultado.longitud) {
            todosResultados.push(resultado);
          }
        });
      }
    });
    
    // 2. SI HAY RESULTADOS DE ARCGIS
    if (todosResultados.length > 0) {
      setResultados(todosResultados);
      
      // Centrar en el primer resultado
      if (mapRef.current) {
        const primerResultado = todosResultados[0];
        const nuevaUbicacion = [primerResultado.latitud, primerResultado.longitud];
        setCenter(nuevaUbicacion);
        setZoom(16);
        mapRef.current.setView(nuevaUbicacion, 16);
      }
      
    } else {
      // 3. SI NO HAY RESULTADOS, INTENTAR COMO DIRECCIÓN
      const esDireccion = /^(KR|CRA|CL|AK|DG|TV|AV)\s*\d/i.test(busqueda.toUpperCase());
      
      if (esDireccion) {
        const apiKey = 'e2d6f043-7b63-417e-8fbe-db515898576f';
        const geoUrl = `https://catalogopmb.catastrobogota.gov.co/PMBWeb/web/api?cmd=geocodificar&apikey=${apiKey}&query=${encodeURIComponent(busqueda)}`;
        
        const geoRespuesta = await fetch(geoUrl);
        const geoDatos = await geoRespuesta.json();
        
        if (geoDatos.response && geoDatos.response.success) {
          const resultadoGeo = [{
            nombre: geoDatos.response.data.dirtrad,
            tipo: 'Dirección',
            localidad: geoDatos.response.data.localidad,
            direccion: geoDatos.response.data.dirtrad,
            latitud: parseFloat(geoDatos.response.data.latitude),
            longitud: parseFloat(geoDatos.response.data.longitude)
          }];
          
          setResultados(resultadoGeo);
          
          if (mapRef.current) {
            const nuevaUbicacion = [resultadoGeo[0].latitud, resultadoGeo[0].longitud];
            setCenter(nuevaUbicacion);
            setZoom(18);
            mapRef.current.setView(nuevaUbicacion, 18);
          }
        } else {
          setResultados([]);
          alert('No se encontraron resultados para: ' + busqueda);
        }
      } else {
        setResultados([]);
        alert('No se encontraron lugares con: ' + busqueda);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    setResultados([]);
    alert('Error al conectar con el servidor de búsqueda');
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
      setZoom(16);
      mapRef.current.setView(newCenter, 16);
      
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

      <div className="contenedor-principal">
        <ControlesMapa
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          obtenerMiUbicacion={obtenerMiUbicacion}
          cambiarMapa={cambiarMapa}
          tipoMapa={tipoMapa}
          zoom={zoom}
          miUbicacion={miUbicacion}
        />

        <div className="mapa-area">
          <MapContainer
            center={center}
            zoom={zoom}
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              url={mapasBase[tipoMapa].url}
              attribution={mapasBase[tipoMapa].atribucion}
            />
            
            {!miUbicacion && (
              <Marker position={center}>
                <Popup>Centro de Bogotá</Popup>
              </Marker>
            )}
            
            {miUbicacion && (
              <Marker position={miUbicacion} icon={miUbicacionIcon}>
                <Popup>
                  <strong>¡Estás aquí!</strong><br/>
                  Lat: {miUbicacion[0].toFixed(6)}<br/>
                  Lng: {miUbicacion[1].toFixed(6)}
                </Popup>
              </Marker>
            )}
            
            {resultados.slice(0, 10).map((resultado, index) => (
              <Marker 
                key={index} 
                position={[resultado.latitud || resultado.y, resultado.longitud || resultado.x]}
              >
                <Popup>
                  <strong>{resultado.nombre || resultado.dir}</strong><br/>
                  {resultado.direccion && <small>{resultado.direccion}</small>}
                  <br/>
                  <small>Tipo: {resultado.tipo || 'Desconocido'}</small>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <PanelResultados 
          resultados={resultados}
          mapRef={mapRef}
        />
      </div>
    </div>
  );
}

export default Mapa;