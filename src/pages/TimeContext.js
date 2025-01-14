import React, { createContext, useState, useContext } from 'react';

// Criação do Contexto para o intervalo de tempo
const TimeContext = createContext();

// Hook customizado para acessar o contexto de intervalo
export const useTime = () => {
  return useContext(TimeContext);
};

// Provider para fornecer o valor de intervalo e a função de atualização para os componentes filhos
export const TimeProvider = ({ children }) => {
  const [intervalTime, setIntervalTime] = useState(2000); // Valor padrão do intervalo em milissegundos

  // Função para atualizar o intervalo de tempo
  const updateIntervalTime = (newTime) => {
    setIntervalTime(newTime);
  };

  return (
    <TimeContext.Provider value={{ intervalTime, updateIntervalTime }}>
      {children}
    </TimeContext.Provider>
  );
};