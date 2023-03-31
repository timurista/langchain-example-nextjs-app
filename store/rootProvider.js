import React, { createContext, useContext } from 'react';
import { useLocalObservable } from 'mobx-react-lite';
import RootStore from './rootStore';

const StoreContext = createContext();

const RootProvider = ({ children }) => {
  const rootStore = useLocalObservable(() => new RootStore());

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a RootProvider');
  }
  return context;
};

export { RootProvider, useStore };
