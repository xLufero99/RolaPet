import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
//import { fetchUserProfile } from "../profile-api"; // 👈 aquí está tu función de perfil
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const API = "http://localhost:8082/users/profile";
const identificationLocal = localStorage.getItem("cedula");
const birthdateLocal = localStorage.getItem("birthdate");
export function ProfileData() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    documentType: ''
  });

  const [errors, setErrors] = useState({});
  //const [loadingProfile, setLoadingProfile] = useState(true);
  //const [apiError, setApiError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
    if (!formData.address) newErrors.address = 'La dirección es requerida';
    if (!formData.documentType) newErrors.documentType = 'El tipo de documento es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Traer perfil al montar el componente


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(birthdateLocal)
    
    if (!validateForm()) return;

    const userData = {
      name: formData.name,
    identification: identificationLocal,
    birthdate: birthdateLocal,
      phone: formData.phone,
      address: formData.address,
      documentType: formData.documentType
    };
      
    try {
      // Aquí asumo que este endpoint crea/actualiza el perfil
      const profileResponse = await axios.post(API, userData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // ajusta la clave del token si es otra
          'Content-Type': 'application/json',
        },
      });

      console.log(profileResponse.data);
      alert('Perfil guardado correctamente');
    } catch (e) {
      console.error(e);
      alert('Ocurrió un error al guardar el perfil');
    }
  };

  //if (loadingProfile) {
    //return (
     // <div className="min-h-screen flex items-center justify-center">
      //  <p>Cargando tu perfil...</p>
      //</div>
    //);
 // }

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
            <CardTitle className="text-2xl">Agrega más información sobre ti</CardTitle>
          </CardHeader>
          
          <CardContent>
          

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de teléfono</Label>
                <Input
                  id="phone"
                  type="number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="123456789"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                {errors.address && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de documento</Label>
                  <select
                    id="documentType"
                    value={formData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="CC">Cédula de ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de identidad (TI)</option>
                  </select>

                  {errors.documentType && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.documentType}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" onClick={() => navigate('/profile')} className="w-full bg-green-600 hover:bg-green-700">
                Guardar perfil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
