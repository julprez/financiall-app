import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Icono base con fondo redondeado y gradiente
const IconWrapper: React.FC<{ children: React.ReactNode; className?: string; size?: number; gradient?: string }> = ({ 
  children, 
  className = '', 
  size = 24, 
  gradient = 'from-purple-500 to-pink-500' 
}) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-2 shadow-lg ${className}`} style={{ width: size, height: size }}>
    <div className="w-full h-full flex items-center justify-center text-white">
      {children}
    </div>
  </div>
);

export const BankIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-blue-500 to-blue-600">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v2h20V7l-10-5zM4 11v8h2v-8H4zm4 0v8h2v-8H8zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zM2 21h20v2H2v-2z"/>
    </svg>
  </IconWrapper>
);

export const CreditCardIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-green-500 to-green-600">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  </IconWrapper>
);

export const WalletIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-purple-500 to-purple-600">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6v2H5z"/>
      <circle cx="16" cy="12" r="1.5"/>
    </svg>
  </IconWrapper>
);

export const InvestmentIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-orange-500 to-red-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    </svg>
  </IconWrapper>
);

export const SalaryIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-emerald-500 to-teal-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
  </IconWrapper>
);

export const ShoppingIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-pink-500 to-rose-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  </IconWrapper>
);

export const FoodIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-yellow-500 to-orange-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
    </svg>
  </IconWrapper>
);

export const TransportIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-indigo-500 to-blue-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  </IconWrapper>
);

export const HomeIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-cyan-500 to-blue-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  </IconWrapper>
);

export const HealthIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-red-500 to-pink-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
    </svg>
  </IconWrapper>
);

export const EntertainmentIcon: React.FC<IconProps> = ({ className = '', size = 32 }) => (
  <IconWrapper className={className} size={size} gradient="from-violet-500 to-purple-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
    </svg>
  </IconWrapper>
);

// Mapa de iconos disponibles
export const FINANCE_ICONS = {
  bank: BankIcon,
  creditCard: CreditCardIcon,
  wallet: WalletIcon,
  investment: InvestmentIcon,
  salary: SalaryIcon,
  shopping: ShoppingIcon,
  food: FoodIcon,
  transport: TransportIcon,
  home: HomeIcon,
  health: HealthIcon,
  entertainment: EntertainmentIcon,
} as const;

export type FinanceIconType = keyof typeof FINANCE_ICONS;

interface FinanceIconProps {
  type: FinanceIconType;
  className?: string;
  size?: number;
}

// Función para obtener iconos personalizados
const getCustomIcons = (): Record<string, string> => {
  const savedIcons = localStorage.getItem('customCategoryIcons');
  if (savedIcons) {
    const icons = JSON.parse(savedIcons);
    return icons.reduce((acc: Record<string, string>, icon: any) => {
      acc[icon.name] = icon.url;
      return acc;
    }, {});
  }
  return {};
};

export const FinanceIcon: React.FC<FinanceIconProps> = ({ type, className = "w-8 h-8", size = 32 }) => {
  // Primero buscar en iconos del sistema
  const SystemIcon = FINANCE_ICONS[type as keyof typeof FINANCE_ICONS];
  
  if (SystemIcon) {
    // Para tamaños pequeños (≤24px), usar una versión simplificada sin gradientes
    if (size <= 24) {
      return (
        <div className={`${className} flex items-center justify-center text-gray-600`} style={{ width: size, height: size }}>
          <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="currentColor">
            {/* Renderizar el SVG interno del icono sin el wrapper con gradiente */}
            {type === 'salary' && <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>}
            {type === 'investment' && <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>}
            {type === 'food' && <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>}
            {type === 'transport' && <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>}
            {type === 'home' && <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>}
            {type === 'health' && <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>}
            {type === 'entertainment' && <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>}
            {type === 'bank' && <path d="M12 2L2 7v2h20V7l-10-5zM4 11v8h2v-8H4zm4 0v8h2v-8H8zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zM2 21h20v2H2v-2z"/>}
            {type === 'creditCard' && <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>}
            {type === 'wallet' && <path d="M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6v2H5z"/>}
            {type === 'shopping' && <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>}
          </svg>
        </div>
      );
    }
    
    // Para tamaños grandes, usar el componente original con gradientes
    return <SystemIcon className={className} size={size} />;
  }
  
  // Si no existe en el sistema, buscar en iconos personalizados
  const customIcons = getCustomIcons();
  const customIconUrl = customIcons[type];
  
  if (customIconUrl) {
    return (
      <div className={`${className} rounded-xl overflow-hidden shadow-lg`}>
        <img 
          src={customIconUrl} 
          alt={type} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  // Icono por defecto si no se encuentra
  if (size <= 24) {
    return (
      <div className={`${className} flex items-center justify-center text-gray-600`} style={{ width: size, height: size }}>
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6v2H5z"/>
          <circle cx="16" cy="12" r="1.5"/>
        </svg>
      </div>
    );
  }
  
  return <WalletIcon className={className} size={size} />;
};