import React, { useState, useEffect, useRef } from 'react';
import './Cabecera.css';

function Cabecera({ busqueda, setBusqueda, buscarDireccion, center, onSeleccionarSugerencia }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargando, setCargando] = useState(false);
  const buscadorRef = useRef();

  // Transformar coordenadas ArcGIS (x,y) a lat/lng si es necesario
  const transformarCoordenadas = (geometry, servicioIndex) => {
    // IPS, Universidad, Paraderos: punto con x,y en EPSG:3857
    if (servicioIndex <= 4 && geometry?.x && geometry?.y) {
      // Convertir EPSG:3857 a WGS84 (aproximación simple)
      const lon = (geometry.x * 180) / 20037508.34;
      const lat = (Math.atan(Math.exp(geometry.y / 6378137)) * 360) / Math.PI - 90;
      return { lat, lng: lon };
    }
    // Parques, Barrios: polígono con rings
    else if (geometry?.rings?.[0]?.[0]) {
      return { 
        lat: geometry.rings[0][0][1], 
        lng: geometry.rings[0][0][0] 
      };
    }
    return null;
  };

  // Buscar sugerencias en MÚLTIPLES servicios ArcGIS
  useEffect(() => {
    if (!busqueda.trim() || busqueda.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    setCargando(true);
    const timer = setTimeout(async () => {
      try {
        const termino = busqueda.toUpperCase();
        
        // Servicios ArcGIS que SÍ funcionan (con sus campos correctos)
        const servicios = [
          {
            nombre: 'Hospitales',
            url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/IPS/FeatureServer/0/query?returnGeometry=true&outFields=Nombre,Dirección,LocNombre&f=json&where=UPPER(Nombre)%20LIKE%20%27%25${termino}%25%27&resultRecordCount=3`,
            campoNombre: 'Nombre',
            campoTipo: 'Hospital/Clínica',
            campoDireccion: 'Dirección',
            campoLocalidad: 'LocNombre'
          },
          {
            nombre: 'Universidades',
            url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Universidad/FeatureServer/0/query?returnGeometry=true&outFields=SINNOMBRE,SINDIRECCI&f=json&where=UPPER(SINNOMBRE)%20LIKE%20%27%25${termino}%25%27&resultRecordCount=3`,
            campoNombre: 'SINNOMBRE',
            campoTipo: 'Universidad',
            campoDireccion: 'SINDIRECCI'
          },
          {
            nombre: 'Parques',
            url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/parquesyescenarios/FeatureServer/1/query?returnGeometry=true&outFields=NOMBRE_PAR,LOCNOMBRE&f=json&where=UPPER(NOMBRE_PAR)%20LIKE%20%27%25${termino}%25%27&resultRecordCount=3`,
            campoNombre: 'NOMBRE_PAR',
            campoTipo: 'Parque',
            campoLocalidad: 'LOCNOMBRE'
          },
          {
            nombre: 'Barrios',
            url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/sectorcatastral/FeatureServer/0/query?returnGeometry=true&outFields=SCANOMBRE&f=json&where=UPPER(SCANOMBRE)%20LIKE%20%27%25${termino}%25%27&resultRecordCount=3`,
            campoNombre: 'SCANOMBRE',
            campoTipo: 'Barrio/UPZ'
          },
          {
            nombre: 'Plazas de Mercado',
            url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Plaza_Mercado/FeatureServer/0/query?returnGeometry=true&outFields=NOMBRE,DIRECCION&f=json&where=UPPER(NOMBRE)%20LIKE%20%27%25${termino}%25%27&resultRecordCount=3`,
            campoNombre: 'NOMBRE',
            campoTipo: 'Plaza de Mercado',
            campoDireccion: 'DIRECCION'
          },
          {
            nombre: 'Paraderos SITP',
            url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/ParaderosSITP/FeatureServer/0/query?returnGeometry=true&outFields=nombre,direccion_,LocNombre&f=json&where=UPPER(nombre)%20LIKE%20%27%25${termino}%25%27&resultRecordCount=3`,
            campoNombre: 'nombre',
            campoTipo: 'Paradero SITP',
            campoDireccion: 'direccion_',
            campoLocalidad: 'LocNombre'
          }
        ];

        // Ejecutar todas las búsquedas en paralelo
        const promesas = servicios.map(servicio => 
          fetch(servicio.url)
            .then(r => r.json())
            .then(datos => ({ datos, servicio }))
            .catch(() => ({ datos: { features: [] }, servicio }))
        );

        const resultados = await Promise.all(promesas);
        const todasSugerencias = [];

        resultados.forEach(({ datos, servicio }, servicioIndex) => {
          if (datos.features && datos.features.length > 0) {
            datos.features.forEach(feature => {
              const coords = transformarCoordenadas(feature.geometry, servicioIndex);
              
              if (coords) {
                const sugerencia = {
                  nombre: feature.attributes[servicio.campoNombre] || 'Sin nombre',
                  tipo: servicio.campoTipo,
                  latitud: coords.lat,
                  longitud: coords.lng,
                  fuente: servicio.nombre,
                  datosCompletos: feature.attributes
                };

                // Agregar campos opcionales
                if (servicio.campoDireccion && feature.attributes[servicio.campoDireccion]) {
                  sugerencia.direccion = feature.attributes[servicio.campoDireccion];
                }
                if (servicio.campoLocalidad && feature.attributes[servicio.campoLocalidad]) {
                  sugerencia.localidad = feature.attributes[servicio.campoLocalidad];
                }

                todasSugerencias.push(sugerencia);
              }
            });
          }
        });

        console.log(`✅ ${todasSugerencias.length} sugerencias encontradas en ${resultados.filter(r => r.datos.features?.length > 0).length} servicios`);

        // Ordenar y limitar sugerencias
        const sugerenciasOrdenadas = todasSugerencias
          .sort((a, b) => {
            // Priorizar hospitales y universidades
            const prioridadA = a.tipo.includes('Hospital') || a.tipo.includes('Universidad') ? 1 : 0;
            const prioridadB = b.tipo.includes('Hospital') || b.tipo.includes('Universidad') ? 1 : 0;
            return prioridadB - prioridadA;
          })
          .slice(0, 8); // Máximo 8 sugerencias

        setSugerencias(sugerenciasOrdenadas);
        setMostrarSugerencias(sugerenciasOrdenadas.length > 0);

      } catch (error) {
        console.error('❌ Error buscando sugerencias:', error);
        setSugerencias([]);
        setMostrarSugerencias(false);
      } finally {
        setCargando(false);
      }
    }, 400); // Debounce de 400ms

    return () => clearTimeout(timer);
  }, [busqueda]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección de sugerencia
  const handleSeleccionarSugerencia = (sugerencia) => {
    console.log('🎯 Sugerencia seleccionada:', sugerencia);
    setBusqueda(sugerencia.nombre);
    setMostrarSugerencias(false);
    
    if (onSeleccionarSugerencia) {
      onSeleccionarSugerencia(sugerencia);
    }
  };

  // Manejar tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setMostrarSugerencias(false);
      buscarDireccion();
    }
  };

  // Obtener icono según tipo
  const getIcono = (tipo) => {
    if (tipo.includes('Hospital')) return '🏥';
    if (tipo.includes('Universidad')) return '🎓';
    if (tipo.includes('Parque')) return '🌳';
    if (tipo.includes('Barrio')) return '🏘️';
    if (tipo.includes('Mercado')) return '🛒';
    if (tipo.includes('Paradero')) return '🚏';
    return '📍';
  };

  return (
    <div className="controles-superiores">
      <div className="logo">
        <h2>🗺️ RolaPet</h2>
        <small>API v.1 By lufero</small>
        {cargando && <div className="cargando-indicador">Buscando en 6 servicios...</div>}
      </div>
      
      <div className="busqueda-container" ref={buscadorRef}>
        <div className="input-busqueda">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              if (e.target.value.length >= 2) {
                setMostrarSugerencias(true);
              } else {
                setMostrarSugerencias(false);
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="Ej: hospital, universidad, parque, barrio..."
          />
          <button 
            onClick={() => {
              setMostrarSugerencias(false);
              buscarDireccion();
            }} 
            className="btn-buscar" 
            disabled={cargando}
          >
            {cargando ? '⌛' : '🔍 Buscar'}
          </button>
        </div>
        
        {/* Panel de sugerencias */}
        {mostrarSugerencias && (
          <div className="panel-sugerencias">
            {sugerencias.length > 0 ? (
              <>
                <div className="sugerencia-header">
                  <small>{sugerencias.length} sugerencias encontradas</small>
                </div>
                {sugerencias.map((sugerencia, index) => (
                  <div
                    key={index}
                    className="sugerencia-item"
                    onClick={() => handleSeleccionarSugerencia(sugerencia)}
                  >
                    <div className="sugerencia-icono">
                      {getIcono(sugerencia.tipo)}
                    </div>
                    <div className="sugerencia-info">
                      <div className="sugerencia-nombre" title={sugerencia.nombre}>
                        {sugerencia.nombre.length > 40 
                          ? sugerencia.nombre.substring(0, 40) + '...' 
                          : sugerencia.nombre}
                      </div>
                      <div className="sugerencia-datos">
                        <span className="sugerencia-tipo">{sugerencia.tipo}</span>
                        {sugerencia.localidad && (
                          <span className="sugerencia-localidad">• {sugerencia.localidad}</span>
                        )}
                      </div>
                      {sugerencia.direccion && (
                        <div className="sugerencia-direccion" title={sugerencia.direccion}>
                          {sugerencia.direccion.length > 50
                            ? sugerencia.direccion.substring(0, 50) + '...'
                            : sugerencia.direccion}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="sugerencia-footer">
                  <small>Fuentes: IPS, Universidad, Parques, Barrios, Mercados, Paraderos</small>
                </div>
              </>
            ) : (
              <div className="sugerencia-vacia">
                {cargando ? 'Buscando en servicios de Bogotá...' : 'No se encontraron sugerencias'}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="info-api">
        <small>IDECA • Alcaldía de Bogotá</small>
      </div>
    </div>
  );
}

export default Cabecera;