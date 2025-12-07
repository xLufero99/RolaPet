import React, { useState, useEffect, useRef } from 'react';
import './PanelRuteo.css';

function PanelRuteo({ destino, miUbicacion, onClose, onCalcularRuta }) {
  const [transporte, setTransporte] = useState('car');
  const [origen, setOrigen] = useState('');
  const [destinoDireccion, setDestinoDireccion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);
  const inputRef = useRef();
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(null);





// Agrega esto JUSTO DESPUÉS de los useState y antes del primer useEffect:

// Función para transformar coordenadas ArcGIS
const transformarCoordenadasArcGIS = (geometry, esPoligono = false) => {
  try {
    // Si ya tenemos coordenadas WGS84 (y, x) en la geometría
    if (geometry?.y && geometry?.x) {
      const lat = geometry.y;
      const lng = geometry.x;
      
      // Verificar si ya son coordenadas válidas (Bogotá está entre lat 4-5, lng -75 a -74)
      if (lat >= 3 && lat <= 6 && lng >= -76 && lng <= -73) {
        return { lat, lng };
      }
    }
    
    // Para polígonos (parques, barrios)
    if (esPoligono && geometry?.rings?.[0]?.[0]) {
      const lat = geometry.rings[0][0][1];
      const lng = geometry.rings[0][0][0];
      
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
        const latAjustada = lat + 0.1;
        const lonAjustada = lon - 0.1;
        
        if (latAjustada >= 4 && latAjustada <= 5 && lonAjustada >= -74.5 && lonAjustada <= -73.5) {
          return { lat: latAjustada, lng: lonAjustada };
        }
      }
    }
    
    // Si llegamos aquí, coordenadas no válidas
    return null;
    
  } catch (error) {
    console.error('❌ Error transformando coordenadas:', error);
    return null;
  }
};





























  // Inicializar datos
  useEffect(() => {
    if (destino) {
      setDestinoDireccion(destino.direccion || destino.nombre || '');
    }
    
    // Si tenemos ubicación del usuario, usarla como origen por defecto
    if (miUbicacion) {
      setOrigen('📍 Mi ubicación actual');
    } else {
      setOrigen('🏙️ Centro de Bogotá');
    }
  }, [destino, miUbicacion]);

  // Buscar sugerencias cuando el usuario escribe
  useEffect(() => {
    const termino = origen.trim();
    
    // No buscar si es una opción predefinida o texto muy corto
    if (termino === '📍 Mi ubicación actual' || 
        termino === '🏙️ Centro de Bogotá' || 
        termino.length < 3) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const buscarSugerencias = async () => {
      setBuscandoSugerencias(true);
      try {
        // Llamar a una función global que ya tenemos en el buscador principal
        // O podemos replicar la lógica aquí
        const resultados = await buscarSugerenciasEnServicios(termino);
        setSugerencias(resultados);
        setMostrarSugerencias(resultados.length > 0);
      } catch (error) {
        console.error('Error buscando sugerencias:', error);
        setSugerencias([]);
      } finally {
        setBuscandoSugerencias(false);
      }
    };

    const timer = setTimeout(buscarSugerencias, 300);
    return () => clearTimeout(timer);
  }, [origen]);

  // Función para buscar sugerencias (similar a la del buscador principal)
  // REEMPLAZA la función buscarSugerenciasEnServicios en PanelRuteo.js con:

const buscarSugerenciasEnServicios = async (termino) => {
  try {
    const terminoUpper = termino.toUpperCase();
    
    // Servicios ArcGIS IDÉNTICOS a Cabecera.js
    const servicios = [
      {
        nombre: 'Hospitales',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/IPS/FeatureServer/0/query?returnGeometry=true&outFields=Nombre,Dirección,LocNombre&f=json&where=UPPER(Nombre)%20LIKE%20%27%25${terminoUpper}%25%27&resultRecordCount=3`,
        campoNombre: 'Nombre',
        campoTipo: 'Hospital/Clínica',
        campoDireccion: 'Dirección',
        campoLocalidad: 'LocNombre'
      },
      {
        nombre: 'Universidades',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Universidad/FeatureServer/0/query?returnGeometry=true&outFields=SINNOMBRE,SINDIRECCI&f=json&where=UPPER(SINNOMBRE)%20LIKE%20%27%25${terminoUpper}%25%27&resultRecordCount=3`,
        campoNombre: 'SINNOMBRE',
        campoTipo: 'Universidad',
        campoDireccion: 'SINDIRECCI'
      },
      {
        nombre: 'Parques',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/parquesyescenarios/FeatureServer/1/query?returnGeometry=true&outFields=NOMBRE_PAR,LOCNOMBRE&f=json&where=UPPER(NOMBRE_PAR)%20LIKE%20%27%25${terminoUpper}%25%27&resultRecordCount=3`,
        campoNombre: 'NOMBRE_PAR',
        campoTipo: 'Parque',
        campoLocalidad: 'LOCNOMBRE'
      },
      {
        nombre: 'Barrios',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/sectorcatastral/FeatureServer/0/query?returnGeometry=true&outFields=SCANOMBRE&f=json&where=UPPER(SCANOMBRE)%20LIKE%20%27%25${terminoUpper}%25%27&resultRecordCount=3`,
        campoNombre: 'SCANOMBRE',
        campoTipo: 'Barrio/UPZ'
      },
      {
        nombre: 'Plazas de Mercado',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/Plaza_Mercado/FeatureServer/0/query?returnGeometry=true&outFields=NOMBRE,DIRECCION&f=json&where=UPPER(NOMBRE)%20LIKE%20%27%25${terminoUpper}%25%27&resultRecordCount=3`,
        campoNombre: 'NOMBRE',
        campoTipo: 'Plaza de Mercado',
        campoDireccion: 'DIRECCION'
      },
      {
        nombre: 'Paraderos SITP',
        url: `https://services1.arcgis.com/J5ltM0ovtzXUbp7B/ArcGIS/rest/services/ParaderosSITP/FeatureServer/0/query?returnGeometry=true&outFields=nombre,direccion_,LocNombre&f=json&where=UPPER(nombre)%20LIKE%20%27%25${terminoUpper}%25%27&resultRecordCount=3`,
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
          // Transformar coordenadas EXACTAMENTE como en Cabecera.js
          let coords = null;
          
          // IPS, Universidad, Paraderos: punto con x,y
          if (servicioIndex <= 4 && feature.geometry?.x && feature.geometry?.y) {
            // Convertir EPSG:3857 a WGS84 (igual que Cabecera.js)
            const lon = (feature.geometry.x * 180) / 20037508.34;
            const lat = (Math.atan(Math.exp(feature.geometry.y / 6378137)) * 360) / Math.PI - 90;
            coords = { lat, lng: lon };
          }
          // Parques, Barrios: polígono con rings
          else if (feature.geometry?.rings?.[0]?.[0]) {
            coords = { 
              lat: feature.geometry.rings[0][0][1], 
              lng: feature.geometry.rings[0][0][0] 
            };
          }
          
          if (coords) {
            const sugerencia = {
              nombre: feature.attributes[servicio.campoNombre] || 'Sin nombre',
              tipo: servicio.campoTipo,
              latitud: coords.lat,
              longitud: coords.lng,
              fuente: servicio.nombre
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

    // Ordenar y limitar sugerencias (igual que Cabecera.js)
    const sugerenciasOrdenadas = todasSugerencias
      .sort((a, b) => {
        const prioridadA = a.tipo.includes('Hospital') || a.tipo.includes('Universidad') ? 1 : 0;
        const prioridadB = b.tipo.includes('Hospital') || b.tipo.includes('Universidad') ? 1 : 0;
        return prioridadB - prioridadA;
      })
      .slice(0, 8);

    return sugerenciasOrdenadas;

  } catch (error) {
    console.error('❌ Error buscando sugerencias:', error);
    return [];
  }
};

















  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const opcionesTransporte = [
    { id: 'car', icono: '🚗', nombre: 'Auto', color: '#3498db' },
    { id: 'bike', icono: '🚲', nombre: 'Bicicleta', color: '#2ecc71' },
    { id: 'foot', icono: '🚶', nombre: 'Caminando', color: '#9b59b6' }
  ];

  const handleCalcularRuta = async () => {
  if (!destino) {
    alert('No hay destino seleccionado');
    return;
  }

  // Validar que hay un origen seleccionado
  if (!origen.trim()) {
    alert('Por favor selecciona o ingresa un origen');
    return;
  }

  setCargando(true);
  try {
    // Determinar si el origen es "Mi ubicación actual"
    const origenEsMiUbicacion = origen === '📍 Mi ubicación actual';
    
    // Si tenemos una sugerencia seleccionada, usarla
    const datosRuta = {
      destino: destino,
      transporte: transporte,
      origen: origen,
      origenEsMiUbicacion: origenEsMiUbicacion,
      sugerenciaSeleccionada: sugerenciaSeleccionada // ← AGREGAR ESTO
    };

    console.log('📤 Enviando datos de ruta:', datosRuta);
    
    // Llamar a la función que crearemos en Mapa.js
    if (onCalcularRuta) {
      const resultado = await onCalcularRuta(datosRuta);
      
      if (resultado?.success) {
        // Cerrar panel después de calcular
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }
  } catch (error) {
    console.error('Error calculando ruta:', error);
    alert('Error al calcular la ruta. Intenta nuevamente.');
  } finally {
    setCargando(false);
  }
};

  // Función para manejar selección de origen rápido
  const seleccionarOrigenRapido = (tipo) => {
    if (tipo === 'mi-ubicacion' && miUbicacion) {
      setOrigen('📍 Mi ubicación actual');
      setMostrarSugerencias(false);
    } else if (tipo === 'centro-bogota') {
      setOrigen('🏙️ Centro de Bogotá');
      setMostrarSugerencias(false);
    }
  };

  // Función para seleccionar una sugerencia
 const handleSeleccionarSugerencia = (sugerencia) => {
  // Mostrar nombre + tipo para identificarlo mejor
  const textoMostrar = `${sugerencia.nombre} (${sugerencia.tipo})`;
  setOrigen(textoMostrar);
  setMostrarSugerencias(false);
  
  // Guardar la sugerencia completa para usarla después
  setSugerenciaSeleccionada(sugerencia);
  console.log('✅ Sugerencia seleccionada en panel:', sugerencia);
};

  return (
    <div className="panel-ruteo-overlay" onClick={onClose}>
      <div className="panel-ruteo-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="panel-ruteo-header">
          <h3>
            <span>🚗</span>
            ¿Cómo llegar?
          </h3>
          <button className="btn-cerrar" onClick={onClose}>×</button>
        </div>
        
        <div className="panel-ruteo-body">
          {/* DESTINO (solo lectura) */}
          <div className="ruteo-grupo">
            <label>Destino:</label>
            <div className="ruteo-destino">
              <strong>{destino?.nombre || 'Sin nombre'}</strong>
              {destino?.direccion && (
                <small>{destino.direccion}</small>
              )}
              {destino?.tipo && (
                <small className="destino-tipo">{destino.tipo}</small>
              )}
            </div>
          </div>

          {/* ORIGEN (opciones) */}
          <div className="ruteo-grupo" ref={inputRef}>
            <label>Origen:</label>
            <div className="origen-opciones">
              <div className="origen-rapido">
                <button 
                  className={`origen-btn ${origen === '📍 Mi ubicación actual' ? 'activo' : ''}`}
                  onClick={() => seleccionarOrigenRapido('mi-ubicacion')}
                  disabled={!miUbicacion}
                  type="button"
                >
                  📍 Mi ubicación actual
                  {!miUbicacion && <small>(No disponible)</small>}
                </button>
                <button 
                  className={`origen-btn ${origen === '🏙️ Centro de Bogotá' ? 'activo' : ''}`}
                  onClick={() => seleccionarOrigenRapido('centro-bogota')}
                  type="button"
                >
                  🏙️ Centro de Bogotá
                </button>
              </div>
              
              <div className="origen-personalizado">
                <div className="separador">
                  <span>O busca una dirección o lugar:</span>
                </div>
                <div className="input-con-sugerencias">
                  <input
                    type="text"
                    placeholder="Ej: hospital, universidad, parque, barrio, dirección..."
                    value={origen === '📍 Mi ubicación actual' || origen === '🏙️ Centro de Bogotá' ? '' : origen}
                    onChange={(e) => {
                      setOrigen(e.target.value);
                      if (e.target.value.length >= 3) {
                        setMostrarSugerencias(true);
                      }
                    }}
                    onFocus={() => {
                      if (origen === '📍 Mi ubicación actual' || origen === '🏙️ Centro de Bogotá') {
                        setOrigen('');
                      }
                      if (origen.length >= 3) {
                        setMostrarSugerencias(true);
                      }
                    }}
                  />
                  
                  {/* SPINNER mientras busca */}
                  {buscandoSugerencias && (
                    <div className="spinner-mini-busqueda"></div>
                  )}
                  
                  {/* PANEL DE SUGERENCIAS */}
                  {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="sugerencias-ruteo">
                      {sugerencias.map((sugerencia, index) => (
                        <div
                          key={index}
                          className="sugerencia-item"
                          onClick={() => handleSeleccionarSugerencia(sugerencia)}
                        >
                          <div className="sugerencia-icono">{sugerencia.tipo.charAt(0)}</div>
                          <div className="sugerencia-info">
                            <div className="sugerencia-nombre">{sugerencia.nombre}</div>
                            {sugerencia.direccion && (
                              <div className="sugerencia-direccion">{sugerencia.direccion}</div>
                            )}
                            <div className="sugerencia-tipo">{sugerencia.tipo}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {mostrarSugerencias && sugerencias.length === 0 && !buscandoSugerencias && (
                    <div className="sin-sugerencias">
                      <small>No se encontraron sugerencias. Intenta con otro término.</small>
                    </div>
                  )}
                </div>
                
                <small className="ayuda-direccion">
                  Puedes buscar: hospitales, universidades, parques, barrios o direcciones específicas
                </small>
              </div>
            </div>
          </div>

          {/* TRANSPORTE */}
          <div className="ruteo-grupo">
            <label>Medio de transporte:</label>
            <div className="opciones-transporte">
              {opcionesTransporte.map((opcion) => (
                <button
                  key={opcion.id}
                  className={`btn-transporte ${transporte === opcion.id ? 'seleccionado' : ''}`}
                  onClick={() => setTransporte(opcion.id)}
                  type="button"
                >
                  <span>{opcion.icono}</span>
                  <span>{opcion.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BOTONES */}
          <div className="ruteo-acciones">
            <button
              className="btn-calcular"
              onClick={handleCalcularRuta}
              disabled={cargando || !origen.trim()}
              type="button"
            >
              {cargando ? (
                <>
                  <span className="spinner-mini"></span>
                  Calculando...
                </>
              ) : (
                '🔍 Calcular ruta'
              )}
            </button>
            <button className="btn-cancelar" onClick={onClose} type="button">
              Cancelar
            </button>
          </div>

          {/* AVISO API */}
          <div className="ruteo-aviso">
            <small>
              ⚡ Usando API oficial de la Alcaldía de Bogotá<br/>
              Datos en tiempo real del sistema de movilidad
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelRuteo;