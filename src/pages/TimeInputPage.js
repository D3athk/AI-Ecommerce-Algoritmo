// TimeInputPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TimeInputPage = () => {
  const [inputTime, setInputTime] = useState('');
  const navigate = useNavigate();

  const handleSaveTime = () => {
    const timeInMs = Number(inputTime);
    if (!isNaN(timeInMs) && timeInMs > 0) {
      localStorage.setItem('carouselTime', timeInMs); // Salva no localStorage
      alert('Tempo do carrossel atualizado com sucesso!');
      navigate('/'); // Volta para a página principal
    } else {
      alert('Por favor, insira um valor válido em milissegundos.');
    }
  };

  return (
    <div className="mt-4">
      <h2>Defina o Tempo do Carrossel</h2>
      <input
        type="number"
        value={inputTime}
        onChange={(e) => setInputTime(e.target.value)}
        placeholder="Defina o tempo em ms"
        className="form-control"
        min="0"
      />
      <button onClick={handleSaveTime} className="btn btn-primary mt-2">
        Salvar Tempo
      </button>
    </div>
  );
};

export default TimeInputPage;