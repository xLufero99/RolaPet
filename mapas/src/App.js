import './App.css';
import Mapa from './components/Mapa';

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>🗺️ Mapas Bogotá</h1>
        <p>Visualización de mapas base y búsqueda de direcciones</p>
      </header>
      <main>
        <Mapa />
      </main>
      <footer className="footer">
        <p>Datos proporcionados por IDECA - Alcaldía de Bogotá</p>
      </footer>
    </div>
  );
}

export default App;