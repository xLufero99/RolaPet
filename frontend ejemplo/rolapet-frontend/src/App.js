import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [email, setEmail] = useState('carlos@ejemplo.com');
  const [password, setPassword] = useState('123456');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8081/api/v1/auth/login', {
        email,
        password
      });
      alert(`¡Login exitoso! Token: ${response.data.token}`);
    } catch (error) {
      alert('Error en login: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>RolaPet 🛵</h1>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;