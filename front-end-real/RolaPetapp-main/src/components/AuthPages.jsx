import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const API = "http://localhost:8081/api/v1/auth/register";

// 👉 función pura para saber si es menor de 14 (sin useEffect)
function isUserUnder14(birthdateStr) {
  if (!birthdateStr) return false;

  const birth = new Date(birthdateStr);
  if (isNaN(birth.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 14;
}

export function AuthPages({ view }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    cedula: '',
    acceptTerms: false,
    birthdate: '',
    nombreAcudiente: '',   // 👈 nuevo campo
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.birthdate) {
      newErrors.birthdate = 'La fecha de nacimiento es requerida';
    }

    if (view === 'register') {
      if (!formData.cedula) newErrors.cedula = 'El número de identificación es requerido';

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // ⚠️ Si es menor de 14, exigir nombre del acudiente
    const under14 = isUserUnder14(formData.birthdate);
    if (under14 && !formData.nombreAcudiente.trim()) {
      newErrors.nombreAcudiente = 'Si eres menor de 14 años, debes ingresar el nombre de tu acudiente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit  =  async  (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      email: formData.email,
      cedula: formData.cedula,
      password: formData.password,
      fechaNacimiento: formData.birthdate,
      // si quieres mandar el acudiente también al backend:
      nombreAcudiente: formData.nombreAcudiente || null,
    };
      
    try {
      const registerResponse = await axios.post(API, userData);
      const { token } = registerResponse.data;
      console.log(token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('cedula', userData.cedula);
      localStorage.setItem('birthdate', userData.fechaNacimiento);

      navigate('/profileData');
    } catch (e) {
      console.log(e);
    }
  };

  const isUnder14 = isUserUnder14(formData.birthdate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
        
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">RP</span>
            </div>
            <CardTitle className="text-2xl">Únete a Rola PET</CardTitle>
            <p className="text-gray-600">Crea tu cuenta y comienza a disfrutar de la movilidad eléctrica</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cedula">Número de identificación</Label>
                <Input
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) => handleInputChange('cedula', e.target.value)}
                  placeholder="123456789"
                />
                {errors.cedula && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.cedula}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Fecha de nacimiento</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => handleInputChange('birthdate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.birthdate && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.birthdate}
                  </p>
                )}
              </div>

              {/* 👇 Campo extra solo si es menor de 14 años */}
              {isUnder14 && (
                <div className="space-y-2">
                  <Label htmlFor="nombreAcudiente">Nombre del acudiente</Label>
                  <Input
                    id="nombreAcudiente"
                    type="text"
                    value={formData.nombreAcudiente}
                    onChange={(e) => handleInputChange('nombreAcudiente', e.target.value)}
                    placeholder="Nombre completo del acudiente"
                  />
                  {errors.nombreAcudiente && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.nombreAcudiente}
                    </p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  Acepto los{' '}
                  <a href="#" className="text-green-600 hover:underline">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="#" className="text-green-600 hover:underline">
                    política de privacidad
                  </a>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.acceptTerms}
                </p>
              )}
              
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/profileData')}
              >
                Crear Cuenta
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-green-600 hover:underline"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
