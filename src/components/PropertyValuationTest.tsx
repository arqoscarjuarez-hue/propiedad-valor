import { useState } from 'react';

export default function PropertyValuation() {
  const [test, setTest] = useState('Aplicación funcionando correctamente');
  
  return (
    <div className="p-8 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Prueba de Componente</h2>
      <p className="text-lg">{test}</p>
      <button 
        onClick={() => setTest('¡React funciona!')}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Probar useState
      </button>
    </div>
  );
}
