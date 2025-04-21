import { createContext, useContext, useState } from 'react';

const InvoiceHistoryContext = createContext(undefined);

export const InvoiceHistoryProvider = ({ children }) => {
  const [invoiceHistory, setInvoiceHistory] = useState(null);
  
  return (
    <InvoiceHistoryContext.Provider value={{ invoiceHistory, setInvoiceHistory }}>
      {children}
    </InvoiceHistoryContext.Provider>
  );
};

export  const useInvoiceHistory = () => useContext(InvoiceHistoryContext);