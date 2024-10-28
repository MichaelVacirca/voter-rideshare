// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /components/map/location-search.tsx
// Location search component - helping voters find their way!

'use client';

import { useState, useCallback } from 'react';
import { Check, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList, CommandInput, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { geoService } from '@/lib/services/geo-service';
import { Location } from '@/types/ride';

interface LocationSearchProps {
  /** Callback when a location is selected */
  onLocationSelect: (location: Location) => void;
  /** Initial location value */
  initialLocation?: Location;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Error message to display */
  error?: string;
}

interface LocationSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export function LocationSearch({
  onLocationSelect,
  initialLocation,
  placeholder = "Search for an address...",
  disabled = false,
  className,
  error,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(
    initialLocation ? `${initialLocation.street}, ${initialLocation.city}, ${initialLocation.state}` : ''
  );
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  const debouncedSearch = useDebounce(async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const results = await geoService.getLocationSuggestions(searchTerm);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to fetch location suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 350);

  const handleSearch = useCallback((searchTerm: string) => {
    setValue(searchTerm);
    debouncedSearch(searchTerm);
  }, [debouncedSearch]);

  const handleSelect = useCallback(async (suggestion: LocationSuggestion) => {
    try {
      setLoading(true);
      const geocoded = await geoService.geocodeAddress({
        street: suggestion.mainText,
        city: suggestion.secondaryText.split(',')[0],
        state: suggestion.secondaryText.split(',')[1]?.trim().split(' ')[0] || '',
        zipCode: suggestion.secondaryText.split(',')[1]?.trim().split(' ')[1] || '',
      });

      const location: Location = {
        street: suggestion.mainText,
        city: suggestion.secondaryText.split(',')[0],
        state: suggestion.secondaryText.split(',')[1]?.trim().split(' ')[0] || '',
        zipCode: suggestion.secondaryText.split(',')[1]?.trim().split(' ')[1] || '',
        lat: geocoded.lat,
        lng: geocoded.lng,
      };

      setValue(suggestion.description);
      onLocationSelect(location);
      setOpen(false);
    } catch (error) {
      console.error('Failed to geocode selected location:', error);
    } finally {
      setLoading(false);
    }
  }, [onLocationSelect]);

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a location"
            className={cn(
              'w-full justify-between',
              error ? 'border-red-500' : '',
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            )}
            disabled={disabled}
          >
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {value || placeholder}
              </span>
            </div>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Type an address..."
              value={value}
              onValueChange={handleSearch}
              disabled={disabled}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Searching addresses...</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No addresses found.
                  </span>
                )}
              </CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.placeId}
                    value={suggestion.description}
                    onSelect={() => handleSelect(suggestion)}
                  >
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium">{suggestion.mainText}</span>
                        <span className="text-sm text-muted-foreground">
                          {suggestion.secondaryText}
                        </span>
                      </div>
                    </div>
                    {value === suggestion.description && (
                      <Check className="ml-auto h-4 w-4 flex-shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <span className="text-xs text-red-500 mt-1">
          {error}
        </span>
      )}
    </div>
  );
}