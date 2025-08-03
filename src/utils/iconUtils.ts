export const exportIcons = () => {
  const icons = localStorage.getItem('customCategoryIcons');
  if (icons) {
    const blob = new Blob([icons], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'category-icons.json';
    a.click();
    URL.revokeObjectURL(url);
  }
};

export const importIcons = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const icons = JSON.parse(e.target?.result as string);
      localStorage.setItem('customCategoryIcons', JSON.stringify(icons));
      window.location.reload(); // Recargar para aplicar cambios
    } catch (error) {
      alert('Error al importar iconos');
    }
  };
  reader.readAsText(file);
};