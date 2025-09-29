import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Calculator } from 'lucide-react';
import { sanitizeNumericInput } from '@/utils/validation';

interface PropertyData {
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  tipoPropiedad: string;
  ubicacion: string;
  estadoGeneral: string;
  topografia?: string;
  tipoValoracion?: string;
}

interface PropertyFormProps {
  propertyData: PropertyData;
  onDataChange: (field: keyof PropertyData, value: any) => void;
}

export default function PropertyForm({ propertyData, onDataChange }: PropertyFormProps) {
  const handleInputChange = (field: keyof PropertyData, value: string) => {
    if (['areaSotano', 'areaPrimerNivel', 'areaSegundoNivel', 'areaTercerNivel', 'areaCuartoNivel', 'areaTerreno'].includes(field)) {
      const numericValue = sanitizeNumericInput(value);
      onDataChange(field, numericValue);
    } else {
      onDataChange(field, value);
    }
  };

  const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + 
                   propertyData.areaSegundoNivel + propertyData.areaTercerNivel + 
                   propertyData.areaCuartoNivel;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Tipo de Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Tipo de Propiedad</Label>
            <Select value={propertyData.tipoPropiedad} onValueChange={(value) => onDataChange('tipoPropiedad', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="departamento">Departamento</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Áreas (m²)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertyData.tipoPropiedad !== 'terreno' && (
              <>
                <div>
                  <Label>Área del Sótano (m²)</Label>
                  <Input
                    type="number"
                    value={propertyData.areaSotano || ''}
                    onChange={(e) => handleInputChange('areaSotano', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Área del Primer Nivel (m²)</Label>
                  <Input
                    type="number"
                    value={propertyData.areaPrimerNivel || ''}
                    onChange={(e) => handleInputChange('areaPrimerNivel', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Área del Segundo Nivel (m²)</Label>
                  <Input
                    type="number"
                    value={propertyData.areaSegundoNivel || ''}
                    onChange={(e) => handleInputChange('areaSegundoNivel', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Área del Tercer Nivel (m²)</Label>
                  <Input
                    type="number"
                    value={propertyData.areaTercerNivel || ''}
                    onChange={(e) => handleInputChange('areaTercerNivel', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Área del Cuarto Nivel (m²)</Label>
                  <Input
                    type="number"
                    value={propertyData.areaCuartoNivel || ''}
                    onChange={(e) => handleInputChange('areaCuartoNivel', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </>
            )}
            <div>
              <Label>Área del Terreno (m²)</Label>
              <Input
                type="number"
                value={propertyData.areaTerreno || ''}
                onChange={(e) => handleInputChange('areaTerreno', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          
          {propertyData.tipoPropiedad !== 'terreno' && areaTotal > 0 && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">
                📐 Área Total Construida: {areaTotal.toLocaleString()} m²
              </p>
            </div>
          )}
          
          {propertyData.areaTerreno > 0 && (
            <div className="mt-4 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <p className="text-sm font-medium text-secondary">
                🏞️ Área del Terreno: {propertyData.areaTerreno.toLocaleString()} m²
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Calidad de Ubicación</Label>
              <Select value={propertyData.ubicacion} onValueChange={(value) => onDataChange('ubicacion', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar calidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excelente">Excelente</SelectItem>
                  <SelectItem value="buena">Buena</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="mala">Mala</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Estado General</Label>
              <Select value={propertyData.estadoGeneral} onValueChange={(value) => onDataChange('estadoGeneral', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="bueno">Bueno</SelectItem>
                  <SelectItem value="medio">Medio</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="reparaciones-sencillas">Reparaciones Sencillas</SelectItem>
                  <SelectItem value="reparaciones-medias">Reparaciones Medias</SelectItem>
                  <SelectItem value="reparaciones-importantes">Reparaciones Importantes</SelectItem>
                  <SelectItem value="danos-graves">Daños Graves</SelectItem>
                  <SelectItem value="en-desecho">En Desecho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {propertyData.tipoPropiedad === 'terreno' && (
              <>
                <div>
                  <Label>Topografía</Label>
                  <Select value={propertyData.topografia || ''} onValueChange={(value) => onDataChange('topografia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar topografía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terreno-plano">Terreno Plano</SelectItem>
                      <SelectItem value="ondulado-suave">Ondulado Suave</SelectItem>
                      <SelectItem value="pendiente-leve">Pendiente Leve</SelectItem>
                      <SelectItem value="pendiente-moderada">Pendiente Moderada</SelectItem>
                      <SelectItem value="pendiente-fuerte">Pendiente Fuerte</SelectItem>
                      <SelectItem value="pendiente-escarpada">Pendiente Escarpada</SelectItem>
                      <SelectItem value="afloramiento-rocoso">Afloramiento Rocoso</SelectItem>
                      <SelectItem value="topografia-irregular">Topografía Irregular</SelectItem>
                      <SelectItem value="zona-humeda">Zona Húmeda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tipo de Valoración</Label>
                  <Select value={propertyData.tipoValoracion || ''} onValueChange={(value) => onDataChange('tipoValoracion', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residencial">Residencial</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="agricola">Agrícola</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}