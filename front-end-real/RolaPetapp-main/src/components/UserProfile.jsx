import React, { useState, useEffect } from 'react';
import { fetchUserProfile } from "../profile-api";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  User, 
  Settings, 
  Star, 
  MapPin, 
  Calendar,
  Edit,
  Camera,
  Save,
  X,
  Award,
  TrendingUp,
  Shield,
  Heart
} from 'lucide-react';

const VEHICLE_API = "http://localhost:8082/vehicles"; // POST para crear
const VEHICLES_API = "http://localhost:8082/users/profile/my-profile/vehicles"; // GET lista

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+',
    vehicleType: 'scooter',
    adress: '',
    location: 'Bogotá, Colombia',
    membershipNumber: '',
    bio: ''
  });

  const [loading, setLoading] = useState(true);

  // estado para el formulario de vehículo (añadir)
  const [vehicleData, setVehicleData] = useState({
    brand: '',
    color: '',
    type: 'SCOOTER',
  });

  const [vehicleStatus, setVehicleStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  // 🚗 lista de vehículos del usuario
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState('');

  const stats = [
    { label: 'Rutas Completadas', value: '127', icon: MapPin, color: 'text-green-600' },
    { label: 'Km Recorridos', value: '1,247', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Calificación', value: '4.9', icon: Star, color: 'text-yellow-600' },
    { label: 'Puntos Rola PET', value: '2,850', icon: Award, color: 'text-purple-600' }
  ];

  const achievements = [
    {
      id: 1,
      name: 'Explorador Urbano',
      description: 'Completó 100 rutas diferentes',
      icon: '🗺️',
      earned: true,
      date: '15 Ene 2024'
    },
    {
      id: 2,
      name: 'Eco Warrior',
      description: 'Recorrió 1000 km en vehículo eléctrico',
      icon: '🌱',
      earned: true,
      date: '22 Dic 2023'
    },
    {
      id: 3,
      name: 'Conductor Estrella',
      description: 'Mantuvo calificación 4.8+ por 6 meses',
      icon: '⭐',
      earned: true,
      date: '08 Nov 2023'
    },
    {
      id: 4,
      name: 'Embajador Rola PET',
      description: 'Invitó a 10 nuevos usuarios',
      icon: '👥',
      earned: false,
      progress: '7/10'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'route',
      description: 'Completó la ruta Centro → Zona Rosa',
      time: '2h ago',
      rating: 4.9
    },
    {
      id: 2,
      type: 'review',
      description: 'Calificó la ruta Chapinero → UniNacional',
      time: '1d ago',
      rating: 4.7
    },
    {
      id: 3,
      type: 'achievement',
      description: 'Desbloqueó logro "Conductor Estrella"',
      time: '3d ago'
    },
    {
      id: 4,
      type: 'social',
      description: 'Se unió al grupo "Scooteros Bogotá"',
      time: '1w ago'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios (PUT/PATCH al backend)
    setIsEditing(false);
  };

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'scooter': return '🛴';
      case 'bicycle': return '🚲';
      case 'motorcycle': return '🏍️';
      default: return '🚲';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'route': return <MapPin className="w-4 h-4 text-green-600" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-600" />;
      case 'achievement': return <Award className="w-4 h-4 text-purple-600" />;
      case 'social': return <Heart className="w-4 h-4 text-red-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // 👉 Traer el perfil del backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setFormData(prev => ({
          ...prev,
          name: profile.name || '',
          email: profile.authUserId || '', // ajusta si tu backend devuelve "email"
          phone: profile.phone || '+',
          adress: profile.address || '',
          location: 'Bogotá, Colombia',
        }));
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // 👉 Traer vehículos del usuario
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const resp = await fetch(VEHICLES_API, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(text || `Error HTTP ${resp.status}`);
        }

        const data = await resp.json(); // espero que sea un array
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando vehículos:', err);
        setVehiclesError(err.message || 'No se pudieron cargar los vehículos');
      } finally {
        setVehiclesLoading(false);
      }
    };

    loadVehicles();
  }, []);

  // 🛴 handlers para el formulario de vehículo (añadir)
  const handleVehicleChange = (field, value) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
    setVehicleStatus(prev => ({ ...prev, error: '', success: '' }));
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setVehicleStatus({ loading: true, error: '', success: '' });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const resp = await fetch(VEHICLE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand: vehicleData.brand,
          color: vehicleData.color,
          type: vehicleData.type, // "SCOOTER"
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(text || `Error HTTP ${resp.status}`);
      }

      const newVehicle = await resp.json().catch(() => null);

      setVehicleStatus({
        loading: false,
        error: '',
        success: 'Vehículo guardado correctamente ✅',
      });

      setVehicleData({ brand: '', color: '', type: 'SCOOTER' });

      // opcional: actualizar lista en pantalla sin volver a llamar al backend
      if (newVehicle) {
        setVehicles(prev => [...prev, newVehicle]);
      }
    } catch (err) {
      console.error(err);
      setVehicleStatus({
        loading: false,
        error: err.message || 'No se pudo guardar el vehículo',
        success: '',
      });
    }
  };

  // Iniciales para el avatar
  const initials = formData.name
    ? formData.name
        .split(' ')
        .filter(Boolean)
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'RP';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información y revisa tu actividad</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'activity'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Actividad
            </button>
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'vehicle'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              añadir vehículo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarFallback className="text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <h2 className="text-xl font-bold mb-1">
                  {formData.name || 'Usuario Rola PET'}
                </h2>
                <p className="text-gray-600 mb-2">{formData.email}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <span className="text-2xl">{getVehicleIcon(formData.vehicleType)}</span>
                </div>
                
                {formData.bio && (
                  <p className="text-sm text-gray-600 mb-4">{formData.bio}</p>
                )}
                
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{formData.location}</span>
                </div>
                
                {!isEditing ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-sm">{stat.label}</span>
                      </div>
                      <span className="font-bold">{stat.value}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* TAB PERFIL */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {isEditing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Editar Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="location">Ubicación</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adress">Dirección</Label>
                        <Input
                          id="adress"
                          value={formData.adress}
                          onChange={(e) => handleInputChange('adress', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehicleType">Vehículo Principal</Label>
                        <Select
                          value={formData.vehicleType}
                          onValueChange={(value) => handleInputChange('vehicleType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un vehículo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scooter">Scooter Eléctrico</SelectItem>
                            <SelectItem value="bicycle">Bicicleta Eléctrica</SelectItem>
                            <SelectItem value="motorcycle">Moto Eléctrica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Cuéntale algo a la comunidad sobre ti"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Logros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border-2 ${
                            achievement.earned
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className={`text-2xl ${achievement.earned ? '' : 'grayscale'}`}>
                              {achievement.icon}
                            </span>
                            <div className="flex-1">
                              <h3 className={`font-medium ${achievement.earned ? 'text-green-700' : 'text-gray-600'}`}>
                                {achievement.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {achievement.description}
                              </p>
                              {achievement.earned ? (
                                <Badge className="bg-green-100 text-green-700">
                                  Desbloqueado • {achievement.date}
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Progreso: {achievement.progress}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB ACTIVIDAD */}
            {activeTab === 'activity' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        {activity.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{activity.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB VEHÍCULOS: lista + formulario */}
            {activeTab === 'vehicle' && (
              <div className="space-y-6">
                {/* Lista de vehículos del usuario */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mis vehículos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vehiclesLoading && (
                      <p className="text-sm text-gray-500">Cargando vehículos...</p>
                    )}

                    {vehiclesError && (
                      <p className="text-sm text-red-600">{vehiclesError}</p>
                    )}

                    {!vehiclesLoading && !vehiclesError && vehicles.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Aún no tienes vehículos registrados.
                      </p>
                    )}

                    {!vehiclesLoading && !vehiclesError && vehicles.length > 0 && (
                      <div className="space-y-3">
                        {vehicles.map((v, idx) => (
                          <div
                            key={v.id || idx}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {getVehicleIcon((v.type || 'SCOOTER').toLowerCase())}
                              </span>
                              <div>
                                <p className="font-medium">
                                  {v.brand} • {v.type}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Color: {v.color}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Formulario para añadir vehículo */}
                <Card>
                  <CardHeader>
                    <CardTitle>Añadir vehículo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleVehicleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="brand">Marca</Label>
                          <Input
                            id="brand"
                            value={vehicleData.brand}
                            onChange={(e) => handleVehicleChange('brand', e.target.value)}
                            placeholder="Xiaomi"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="color">Color</Label>
                          <Input
                            id="color"
                            value={vehicleData.color}
                            onChange={(e) => handleVehicleChange('color', e.target.value)}
                            placeholder="Negro"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de vehículo</Label>
                        <Select
                          value={vehicleData.type}
                          onValueChange={(value) => handleVehicleChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SCOOTER">Scooter eléctrico</SelectItem>
                            <SelectItem value="BICYCLE">Bicicleta eléctrica</SelectItem>
                            <SelectItem value="MOTORCYCLE">Moto eléctrica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {vehicleStatus.error && (
                        <p className="text-sm text-red-600">
                          {vehicleStatus.error}
                        </p>
                      )}

                      {vehicleStatus.success && (
                        <p className="text-sm text-green-600">
                          {vehicleStatus.success}
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={vehicleStatus.loading}
                      >
                        {vehicleStatus.loading ? 'Guardando...' : 'Guardar vehículo'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
