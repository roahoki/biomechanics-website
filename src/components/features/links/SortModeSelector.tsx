'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, Bars3Icon, CalendarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { SortMode } from '@/types/product'

interface SortModeSelectorProps {
  value: SortMode
  onChange: (mode: SortMode) => void
  disabled?: boolean
}

const sortModeConfig = {
  manual: {
    label: 'Manual',
    icon: Bars3Icon,
    description: 'Ordena arrastrando los items'
  },
  activityDate: {
    label: 'Fecha de actividad',
    icon: CalendarIcon,
    description: 'Ordena por fecha del evento (futuro → pasado)'
  },
  publicationDate: {
    label: 'Fecha de publicación',
    icon: ClockIcon,
    description: 'Ordena por fecha de publicación (reciente → antiguo)'
  }
} as const

export default function SortModeSelector({ value, onChange, disabled = false }: SortModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentConfig = sortModeConfig[value]
  const CurrentIcon = currentConfig.icon

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar dropdown/modal con escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    const handleScroll = () => !isMobile && setIsOpen(false)

    document.addEventListener('keydown', handleEscape)
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, isMobile])

  const handleModeChange = (mode: SortMode) => {
    onChange(mode)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <CurrentIcon className="w-5 h-5 text-gray-500" />
          <div className="flex flex-col">
            <span className="text-base font-medium text-gray-900">
              {currentConfig.label}
            </span>
            <span className="text-xs text-gray-500">
              {currentConfig.description}
            </span>
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Modal de pantalla completa para móvil / Dropdown para desktop */}
      {isOpen && !disabled && (
        <>
          {isMobile ? (
            /* Modal móvil - Pantalla completa */
            <div className="fixed inset-0 z-[9999] bg-white">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">Ordenamiento</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Selecciona cómo ordenar los items en la vista pública
                  </p>
                  
                  <div className="space-y-3">
                    {(Object.keys(sortModeConfig) as SortMode[]).map((mode) => {
                      const config = sortModeConfig[mode]
                      const Icon = config.icon
                      const isSelected = value === mode

                      return (
                        <label
                          key={mode}
                          className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sortMode"
                            value={mode}
                            checked={isSelected}
                            onChange={() => handleModeChange(mode)}
                            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                              <span className={`text-base font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                {config.label}
                              </span>
                            </div>
                            <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                              {config.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Footer con botón de cerrar */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 text-base text-white bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    Listo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dropdown desktop */
            <>
              <div
                className="fixed inset-0 z-[9998] bg-black bg-opacity-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full mt-2 left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm text-gray-600">
                    Selecciona cómo ordenar los items en la vista pública
                  </p>
                </div>

                {/* Lista de opciones */}
                <div className="p-3 space-y-2">
                  {(Object.keys(sortModeConfig) as SortMode[]).map((mode) => {
                    const config = sortModeConfig[mode]
                    const Icon = config.icon
                    const isSelected = value === mode

                    return (
                      <label
                        key={mode}
                        className={`flex items-start p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="radio"
                          name="sortMode"
                          value={mode}
                          checked={isSelected}
                          onChange={() => handleModeChange(mode)}
                          className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                            <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                            {config.description}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {/* Footer con botón de cerrar */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
