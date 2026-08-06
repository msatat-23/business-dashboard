'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeClass?: string;
  description?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  minWidth?: string;
  dropdownWidth?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  icon,
  className = '',
  buttonClassName = '',
  size = 'md',
  disabled = false,
  minWidth = 'min-w-[140px]',
  dropdownWidth,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = typeof window !== 'undefined';
  const containerRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    openUp: false,
  });

  const selectedOption = options.find((opt) => opt.value === value);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 220px below and enough space above, flip openUp
      const openUp = spaceBelow < 220 && rect.top > 220;
      setCoords({
        top: openUp ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    }
  };

  // Click outside and position update listener
  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        return;
      }
      // Check if clicking inside portal dropdown element
      const portalEl = document.getElementById('custom-select-portal-menu');
      if (portalEl && portalEl.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    const handleScrollOrResize = () => {
      updateCoords();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  const renderDropdown = () => {
    if (!isOpen || !mounted) return null;

    const dropdownStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${coords.left}px`,
      width: dropdownWidth || `${Math.max(coords.width, 160)}px`,
      zIndex: 99999,
    };

    if (coords.openUp) {
      dropdownStyle.bottom = `${window.innerHeight - coords.top + 4}px`;
    } else {
      dropdownStyle.top = `${coords.top + 4}px`;
    }

    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="custom-select-portal-menu"
            initial={{ opacity: 0, scale: 0.96, y: coords.openUp ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: coords.openUp ? 4 : -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={dropdownStyle}
            className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-sans transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 text-[#e11d48] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs truncate">{option.label}</span>
                        {option.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[0.62rem] font-extrabold uppercase shrink-0 ${
                              option.badgeClass || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {option.badge}
                          </span>
                        )}
                      </div>
                      {option.description && (
                        <span className="text-[0.68rem] text-slate-400 font-normal truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#f43f5e] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left w-full ${minWidth} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white text-slate-800 font-sans font-bold transition-all duration-200 outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-2xs ${
          isSmall ? 'px-2.5 py-1.5 text-[0.72rem]' : 'px-3.5 py-2.5 text-xs'
        } ${isOpen ? 'border-[#f43f5e] bg-white ring-2 ring-[#f43f5e]/20 shadow-md' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[0.65rem] font-extrabold uppercase shrink-0 ${
                    selectedOption.badgeClass || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={isSmall ? 13 : 15}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#f43f5e]' : ''
          }`}
        />
      </button>

      {renderDropdown()}
    </div>
  );
}
