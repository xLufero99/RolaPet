import React from 'react';
import './PanelResultados.css';

function PanelResultados({ resultados, mapRef }) {
  if (resultados.length === 0) return null;

  return (
    <div className="panel-resultados">
      <h3>📋 Resultados ({resultados.length})</h3>
      <div className="lista-resultados">
        {resultados.slice(0, 10).map((resultado, index) => (
          <div 
            key={index} 
            className="item-resultado"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(
                  [resultado.latitud || resultado.y, resultado.longitud || resultado.x],
                  16
                );
              }
            }}
          >
            <div className="resultado-icono">📍</div>
            <div className="resultado-info">
              <h4>{resultado.nombre || resultado.dir}</h4>
              <p>{resultado.direccion || 'Sin dirección especificada'}</p>
              {resultado.tipo && <span className="resultado-tipo">{resultado.tipo}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PanelResultados;