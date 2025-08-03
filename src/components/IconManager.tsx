import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image, Trash2 } from 'lucide-react';
import { FinanceIcon, FINANCE_ICONS, FinanceIconType } from './FinanceIcons';

interface CustomIcon {
  id: string;
  name: string;
  url: string;
  file?: File;
}

interface IconManagerProps {
  onIconSelect: (iconName: string) => void;
  selectedIcon?: string;
}

const IconManager: React.FC<IconManagerProps> = ({ onIconSelect, selectedIcon }) => {
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar iconos guardados del localStorage al montar el componente
  React.useEffect(() => {
    const savedIcons = localStorage.getItem('customCategoryIcons');
    if (savedIcons) {
      setCustomIcons(JSON.parse(savedIcons));
    }
  }, []);

  // Guardar iconos en localStorage
  const saveIconsToStorage = (icons: CustomIcon[]) => {
    localStorage.setItem('customCategoryIcons', JSON.stringify(icons));
  };

  // Manejar la subida de archivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es un archivo de imagen válido`);
        continue;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} es demasiado grande. Máximo 2MB`);
        continue;
      }

      // Crear URL para preview
      const url = URL.createObjectURL(file);
      const iconName = file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      const newIcon: CustomIcon = {
        id: Date.now().toString() + i,
        name: iconName,
        url: url,
        file: file
      };

      setCustomIcons(prev => {
        const updated = [...prev, newIcon];
        saveIconsToStorage(updated);
        return updated;
      });
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar icono
  const removeIcon = (iconId: string) => {
    setCustomIcons(prev => {
      const updated = prev.filter(icon => icon.id !== iconId);
      saveIconsToStorage(updated);
      return updated;
    });
  };

  // Iconos predefinidos del sistema - usar las claves reales de FINANCE_ICONS
  const systemIcons = Object.keys(FINANCE_ICONS) as FinanceIconType[];

  return (
    <div className="space-y-4">
      {/* Sección de subida */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Arrastra y suelta iconos aquí, o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500">
            Formatos soportados: PNG, JPG, SVG (máx. 2MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isUploading ? 'Subiendo...' : 'Seleccionar Archivos'}
          </button>
        </div>
      </div>

      {/* Iconos del sistema */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Iconos del Sistema
        </h4>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {systemIcons.map((iconName) => (
            <button
              key={iconName}
              onClick={() => onIconSelect(iconName)}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedIcon === iconName
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              title={iconName}
            >
              <div className="w-6 h-6 mx-auto flex items-center justify-center">
                <FinanceIcon 
                  type={iconName} 
                  className="w-5 h-5 text-gray-600 dark:text-gray-300" 
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Iconos personalizados */}
      {customIcons.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Iconos Personalizados
          </h4>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {customIcons.map((icon) => (
              <div key={icon.id} className="relative group">
                <button
                  onClick={() => onIconSelect(icon.name)}
                  className={`w-full p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedIcon === icon.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                  title={icon.name}
                >
                  <img
                    src={icon.url}
                    alt={icon.name}
                    className="w-6 h-6 mx-auto object-contain"
                  />
                </button>
                <button
                  onClick={() => removeIcon(icon.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconManager;