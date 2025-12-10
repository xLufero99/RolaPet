import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const API = "http://localhost:8081/api/v1/auth/login"

export const Login = ({ onLogin }) => {
  const navigate = useNavigate();
    const [email,setEmail]  = useState("")
const [password,setPassword]  = useState("")
//const [errors,setErrors]  = useState("")



const loginHandle= async (e)=>{
    e.preventDefault();
let item= {email,password}
   const loginResponse = await axios.post(API, item);

    const { token } = loginResponse.data;
    console.log(token)
    localStorage.setItem('authToken', token);
    onLogin(item);
  }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <p className="text-gray-600">Accede a tu cuenta de Rola PET</p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={loginHandle} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
              
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
             
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
             
                    onChange={(e) => setPassword( e.target.value)}
                    placeholder="••••••••"
                  />
               
                </div>
                
                <Button type="submit"  className="w-full bg-green-600 hover:bg-green-700">
                  
                  Iniciar Sesión
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-green-600 hover:underline"
                    >
                      Regístrate aquí
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

