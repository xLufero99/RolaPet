import React, { useState, useRef, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaLayerGroup, 
  FaPlus, 
  FaMinus,
  FaPrint,
  FaInfoCircle
} from 'react-icons/fa';
import { mapasBase } from '../config/mapasBase';
import './ControlesMapa.css';

function ControlesMapa({ 
  zoomIn, 
  zoomOut, 
  obtenerMiUbicacion, 
  cambiarMapa, 
  tipoMapa, 
  zoom,
  miUbicacion 
}) {
  const [mostrarCapas, setMostrarCapas] = useState(false);
  const capasRef = useRef();

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (capasRef.current && !capasRef.current.contains(event.target)) {
        setMostrarCapas(false);
      }
    };

    if (mostrarCapas) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarCapas]);

  return (
    <div className="panel-controles" ref={capasRef}>
      {/* CONTROLES DE ZOOM */}
      <div className="grupo-controles">
        <div className="zoom-controls">
          <button onClick={zoomIn} className="control-btn" title="Acercar">
            <FaPlus />
          </button>
          <div className="zoom-level">Zoom: {zoom}</div>
          <button onClick={zoomOut} className="control-btn" title="Alejar">
            <FaMinus />
          </button>
        </div>
      </div>
      
      {/* BOTÓN MI UBICACIÓN */}
      <div className="grupo-controles">
        <button 
          onClick={obtenerMiUbicacion} 
          className={`control-btn ubicacion-btn ${miUbicacion ? 'activo' : ''}`}
          title="Mi ubicación"
        >
          <FaMapMarkerAlt />
        </button>
      </div>
      
      {/* BOTÓN CAPAS */}
      <div className="grupo-controles">
        <button 
          className={`control-btn capas-btn ${mostrarCapas ? 'activo' : ''}`}
          onClick={() => setMostrarCapas(!mostrarCapas)}
          title="Seleccionar tipo de mapa"
        >
          <FaLayerGroup />
        </button>
        
        {/* PANEL DE CAPAS DESPLEGABLE */}
        {mostrarCapas && (
          <div className="panel-capas-dropdown">
            <h4>Seleccionar mapa base:</h4>
            <div className="lista-capas">
              {Object.entries(mapasBase).map(([id, mapa]) => (
                <button
                  key={id}
                  className={`capa-item ${tipoMapa === id ? 'seleccionada' : ''}`}
                  onClick={() => {
                    cambiarMapa(id);
                    setMostrarCapas(false);
                  }}
                >
                  {mapa.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* BOTÓN INFORMACIÓN */}
      <div className="grupo-controles">
        <button 
          className="control-btn" 
          title="Información"
          onClick={() => alert('Mapas Bogotá API v1.0.0\n\nURL: https://www.ideca.gov.co/\nEmail: ideca@catastrobogota.gov.co')}
        >
          <FaInfoCircle />
        </button>
      </div>
      
      {/* BOTÓN IMPRIMIR */}
      <div className="grupo-controles">
        <button className="control-btn" title="Imprimir" onClick={() => window.print()}>
          <FaPrint />
        </button>
      </div>
    </div>
  );
}

export default ControlesMapa;