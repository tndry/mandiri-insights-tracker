"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { MerchantData, MerchantStats } from "@/lib/types"
import { calculateStats } from "@/lib/csv-parser"
import { useMemo } from "react"

interface MerchantContextType {
  merchants: MerchantData[]
  stats: MerchantStats
  setMerchants: (merchants: MerchantData[]) => void
  clearMerchants: () => void
  filters: { cbg: string; segmen: string }
  setFilters: React.Dispatch<React.SetStateAction<{ cbg: string; segmen: string }>>
  filteredMerchants: MerchantData[]
  hoveredMerchantId: string | null
  setHoveredMerchantId: React.Dispatch<React.SetStateAction<string | null>>
  selectedMerchant: MerchantData | null
  setSelectedMerchant: React.Dispatch<React.SetStateAction<MerchantData | null>>
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined)

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [hoveredMerchantId, setHoveredMerchantId] = useState<string | null>(null);
  const [merchants, setMerchantsState] = useState<MerchantData[]>([])
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantData | null>(null);

  const [filters, setFilters] = useState({ cbg: 'all', segmen: 'all' }); 

  const filteredMerchants = useMemo(() => {
    return merchants.filter(merchant => {
      let cd_cbg = typeof merchant.cd_cbg === 'string' ? merchant.cd_cbg.trim() : '';
      if (cd_cbg === '' || cd_cbg === '0') return false;
      const cbgMatch = filters.cbg === 'all' || cd_cbg === filters.cbg;
      const segmenMatch = filters.segmen === 'all' || merchant.segmen === filters.segmen;
      return cbgMatch && segmenMatch;
    });
  }, [merchants, filters]);

  const stats: MerchantStats = calculateStats(filteredMerchants);

  const setMerchants = (newMerchants: MerchantData[]) => {
    setMerchantsState(newMerchants)
  }

  const clearMerchants = () => {
    setMerchantsState([])

  
  }

  return (
    <MerchantContext.Provider
      value={{
        merchants,
        stats,
        setMerchants,
        clearMerchants,
        filters,
        setFilters,
        filteredMerchants,
        hoveredMerchantId,
        setHoveredMerchantId,
        selectedMerchant,
        setSelectedMerchant,
      }}
    >
      {children}
    </MerchantContext.Provider>
  )
}

export function useMerchants() {
  const context = useContext(MerchantContext)
  if (context === undefined) {
    throw new Error("useMerchants must be used within a MerchantProvider")
  }
  return context
}
