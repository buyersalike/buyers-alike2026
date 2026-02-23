import React, { createContext, useContext, useState } from "react";

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (opp) => {
    setCompareList(prev => {
      if (prev.find(o => o.id === opp.id)) return prev;
      if (prev.length >= 3) return prev; // max 3
      return [...prev, opp];
    });
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(o => o.id !== id));
  };

  const isInCompare = (id) => compareList.some(o => o.id === id);

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}