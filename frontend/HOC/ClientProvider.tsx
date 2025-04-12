"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { Persistor } from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
import { store } from "@/store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [persistor, setPersistor] = useState<Persistor | null>(null);

  useEffect(() => {
    const clientPersistor = persistStore(store);
    setPersistor(clientPersistor);
  }, []);

  if (!persistor) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ClientProvider;
