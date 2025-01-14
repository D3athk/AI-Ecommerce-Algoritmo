// TimeContext.js

import React, { createContext, useContext, useState } from 'react';

const TimeContext = createContext();

export const useTime = () => {
  return useContext(TimeContext);
};

export const TimeProvider = ({ children }) => {
  // Defina o valor inicial como um número, por exemplo, 2000 ms (2 segundos)
  const [intervalTime, setIntervalTime] = useState(2000); 

  const updateIntervalTime = (newInterval) => {
    // Verifica se o novo intervalo é um número válido
    if (!isNaN(newInterval) && newInterval > 0) {
      setIntervalTime(newInterval); // Atualiza o estado com o novo valor
    }
  };

  return (
    <TimeContext.Provider value={{ intervalTime, updateIntervalTime }}>
      {children}
    </TimeContext.Provider>
  );
};
