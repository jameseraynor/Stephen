import { useState } from "react";
import ComponentShowcase from "./ComponentShowcase";

function App() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="border-b border-secondary-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-secondary-900">
            Cost Control - Component Library
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Demostración de componentes reutilizables
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <ComponentShowcase />
      </main>
    </div>
  );
}

export default App;
