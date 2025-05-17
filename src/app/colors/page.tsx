import React from 'react';

const colors = [
  { name: 'Primario - Terracota intenso', variable: '--color-primary' },
  { name: 'Secundario - Cromo claro', variable: '--color-secondary' },
  { name: 'Neutro base - Carbón', variable: '--color-neutral-base' },
  { name: 'Neutro claro - Gris niebla', variable: '--color-neutral-light' },
  { name: 'Acento orgánico - Verde clorofila', variable: '--color-accent-organic' },
  { name: 'Acento energético - Azul eléctrico', variable: '--color-accent-energetic' },
];

const ColorsPage = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-geist-sans)]">


        Colores del Tema
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {colors.map((color) => (
          <div key={color.variable} className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded shadow-md"
              style={{ backgroundColor: `var(${color.variable})` }}
            ></div>
            <p className="mt-2 text-center text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
              {color.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorsPage;