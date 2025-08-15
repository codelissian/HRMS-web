import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined color palette with 25 colors (5x5 grid)
const colorOptions = [
  // Row 1 - Blues and Teals
  '#3B82F6', '#1D4ED8', '#0EA5E9', '#06B6D4', '#0891B2',
  // Row 2 - Greens and Emeralds
  '#10B981', '#059669', '#047857', '#065F46', '#064E3B',
  // Row 3 - Yellows and Oranges
  '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F',
  // Row 4 - Reds and Pinks
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D',
  // Row 5 - Purples and Grays
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const colorGridRef = useRef<HTMLDivElement>(null);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setOpen(false);
    setFocusedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent, color: string, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleColorSelect(color);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index % 5 < 4) setFocusedIndex(index + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index % 5 > 0) setFocusedIndex(index - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index < 20) setFocusedIndex(index + 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index >= 5) setFocusedIndex(index - 5);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const selectedColor = value || colorOptions[0];

  // Reset focus when popover opens
  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={`Selected color: ${selectedColor}`}
          className={cn(
            "w-full justify-between h-10",
            className
          )}
        >
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: selectedColor }}
              aria-hidden="true"
            />
            <span className="text-sm font-mono">{selectedColor}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Select Color
          </div>
          <div 
            ref={colorGridRef}
            className="grid grid-cols-5 gap-2"
            role="grid"
            aria-label="Color selection grid"
          >
            {colorOptions.map((color, index) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                onKeyDown={(e) => handleKeyDown(e, color, index)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  selectedColor === color
                    ? "border-gray-900 dark:border-white ring-2 ring-blue-500 ring-offset-2"
                    : "border-gray-300 hover:border-gray-400",
                  focusedIndex === index && "ring-2 ring-blue-500 ring-offset-2"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
                aria-selected={selectedColor === color}
                tabIndex={focusedIndex === index ? 0 : -1}
                role="gridcell"
              >
                {selectedColor === color && (
                  <Check className="w-4 h-4 text-white mx-auto drop-shadow-sm" />
                )}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Use arrow keys to navigate, Enter to select, or click on a color
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 