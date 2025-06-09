"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import General from "../../../../Utils/General";

export default function BancoDropdown({ contacts }) {
  const [openItems, setOpenItems] = useState({});
  
  const transferAccounts = contacts.find(x => x.correlative === 'transfer_accounts');
  const accounts = transferAccounts ? JSON.parse(transferAccounts.description) : [];

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (accounts.length === 0) {
    return (
      <div className="max-w-md w-full bg-gray-100 rounded-md p-4">
        <p className="text-gray-800">No hay cuentas bancarias registradas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {accounts.map((account, index) => (
        <div key={index} className="max-w-md w-full">
          <div className="bg-gray-100 rounded-t-md p-4">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleItem(index)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-8  rounded-none flex items-center justify-center overflow-hidden">
                  {account.image ? (
                    <img 
                      src={`/assets/resources/${account.image}`} 
                      alt={account.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-white font-bold text-xl">
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-800 text-base">
                  {account.name || `Cuenta Bancaria ${index + 1}`}
                </span>
              </div>
              {openItems[index] ? (
                <ChevronUp className="text-amber-800" />
              ) : (
                <ChevronDown className="text-amber-800" />
              )}
            </div>
          </div>

          {openItems[index] && (
            <div className="bg-gray-100 rounded-b-md p-4 pt-0 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 mt-4">
                {account.cc && (
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Número de Cuenta</p>
                    <p className="text-gray-800 font-medium text-sm">{account.cc}</p>
                  </div>
                )}
                {account.cci && (
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Código Interbancario</p>
                    <p className="text-gray-800 font-medium text-sm">{account.cci}</p>
                  </div>
                )}
                {account.description && (
                  <div className="col-span-2">
                    <p className="text-amber-800 font-medium text-sm">Descripción</p>
                    <p className="text-gray-800 font-medium text-sm">{account.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}