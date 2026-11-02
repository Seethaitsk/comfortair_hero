'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * CustomSelect - Accessible, mobile-safe custom dropdown component
 * Eliminates Chromium DevTools / mobile OS native select popup coordinate displacement bugs
 * while maintaining 100% aesthetic consistency with Comfort Aircon design system.
 */
export default function CustomSelect({
  id,
  name,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  className = '',
  error = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const triggerRef = useRef(null);
  const isKeyboardNavRef = useRef(false);

  // Normalize options array to objects: { value: string, label: string }
  const normalizedOptions = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: String(opt.value ?? opt.id ?? ''),
          label: String(opt.label ?? opt.name ?? opt.value ?? ''),
        };
      }
      return {
        value: String(opt),
        label: String(opt),
      };
    });
  }, [options]);

  // Selected item display label
  const selectedOption = normalizedOptions.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : '';

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (optVal) => {
      if (onChange) {
        onChange(optVal);
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < normalizedOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(normalizedOptions.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : normalizedOptions.length - 1
        );
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  // Scroll highlighted item into view on keyboard navigation only
  useEffect(() => {
    if (isKeyboardNavRef.current && isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('.custom-select-option');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({
          block: 'nearest',
        });
      }
      isKeyboardNavRef.current = false;
    }
  }, [isOpen, highlightedIndex]);

  return (
    <div
      ref={containerRef}
      className={`custom-select-wrapper position-relative w-100 ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button: Styled identical to native .form-select */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`form-select custom-select-trigger d-flex align-items-center justify-content-between text-start ${
          error ? 'is-invalid' : ''
        } ${isOpen ? 'custom-select-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id ? `${id}-listbox` : undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          className="custom-select-text text-truncate me-2"
          style={{
            color: displayLabel ? '#0F172A' : '#94A3B8',
            fontWeight: displayLabel ? 500 : 400,
          }}
        >
          {displayLabel || placeholder}
        </span>
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          tabIndex={-1}
          className="custom-select-dropdown shadow-lg"
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1060,
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #E2E8F0',
            maxHeight: '260px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 #F8FAFC',
            padding: '6px',
            listStyle: 'none',
            margin: 0,
          }}
        >
          {/* Optional placeholder / clear option */}
          {placeholder && (
            <li
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect('')}
              className={`custom-select-option ${!value ? 'selected' : ''}`}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.90rem',
                cursor: 'pointer',
                color: '#64748B',
                fontWeight: !value ? 600 : 400,
                backgroundColor: !value ? '#F1F5F9' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.15s ease',
              }}
            >
              <span className="text-truncate">{placeholder}</span>
              {!value && (
                <i className="fa-solid fa-check text-primary-blue fs-xs ms-2 flex-shrink-0"></i>
              )}
            </li>
          )}

          {normalizedOptions.map((opt, idx) => {
            const isSelected = value === opt.value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => {
                  isKeyboardNavRef.current = false;
                  setHighlightedIndex(idx);
                }}
                className={`custom-select-option ${isSelected ? 'selected' : ''} ${
                  isHighlighted ? 'highlighted' : ''
                }`}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '0.91rem',
                  lineHeight: '1.35',
                  cursor: 'pointer',
                  color: isSelected ? '#0078BF' : '#0F172A',
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected
                    ? '#EBF5FB'
                    : isHighlighted
                    ? '#F8FAFC'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.15s ease',
                  wordBreak: 'break-word',
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <i className="fa-solid fa-check text-primary-blue fs-xs ms-2 flex-shrink-0"></i>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Hidden native select for standard HTML5 validation / form submission */}
      <select
        tabIndex={-1}
        aria-hidden="true"
        required={required}
        value={value}
        onChange={() => {}}
        name={name || id}
        style={{
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
