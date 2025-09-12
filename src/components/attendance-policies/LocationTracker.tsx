import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationTrackerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  disabled?: boolean;
}

export function LocationTracker({ 
  onLocationSelect, 
  initialLocation,
  disabled = false 
}: LocationTrackerProps) {
  const { toast } = useToast();
  
  // State management - optimized with fewer state updates
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : null
  );
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [locationMode, setLocationMode] = useState<'map' | 'manual'>('map');
  
  // Refs for Google Maps instances
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // Timeout refs for cleanup
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Performance optimization: Memoize default map center
  const defaultCenter = useMemo(() => ({ lat: 28.6139, lng: 77.2090 }), []);
  
  // Debounced address search function
  const debouncedAddressSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim().length > 2) {
      setIsLoadingSuggestions(true);
      searchTimeoutRef.current = setTimeout(() => {
        getSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Optimized marker drag handler with better throttling
  const handleMarkerDrag = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    dragTimeoutRef.current = setTimeout(() => {
      if (markerRef.current) {
        const position = markerRef.current.getPosition();
        if (position) {
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          setCoordinates(newLocation);
        }
      }
    }, 100); // Reduced frequency for better performance
  }, []);

  // Optimized reverse geocoding
  const reverseGeocode = useCallback((location: { lat: number; lng: number }) => {
    if (!window.google?.maps) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results: any, status: any) => {
      if (status === 'OK' && results?.[0]) {
        const newAddress = results[0].formatted_address;
        setAddress(newAddress);
        onLocationSelect({
          address: newAddress,
          latitude: location.lat,
          longitude: location.lng
        });
      }
    });
  }, [onLocationSelect]);

  // Load Google Maps script with better error handling
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if already loaded
      if (window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if script is loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = setTimeout(() => setIsLoaded(true), 100);
        });
        return;
      }

      // Create new script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = setTimeout(() => {
          if (window.google?.maps) {
            setIsLoaded(true);
          } else {
            setHasError(true);
            setErrorMessage("Google Maps loaded but not properly initialized.");
          }
        }, 100);
      };
      
      script.onerror = () => {
        setHasError(true);
        setErrorMessage("Failed to load Google Maps. Please check your API key and billing settings.");
        toast({
          title: "Error",
          description: "Failed to load Google Maps. Please check your API key and billing settings.",
          variant: "destructive",
        });
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [toast]);

  // Initialize map with optimized settings
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const mapOptions = {
        center: coordinates || defaultCenter,
        zoom: 15,
        mapTypeId: isSatelliteView ? window.google.maps.MapTypeId.SATELLITE : window.google.maps.MapTypeId.ROADMAP,
        
        // Optimized controls for better performance
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        rotateControl: false,
        scaleControl: false,
        
        // Gesture handling optimizations
        gestureHandling: 'greedy',
        disableDoubleClickZoom: false,
        scrollwheel: true,
        draggable: true,
        keyboardShortcuts: false, // Disabled for better performance
        clickableIcons: false,
        
        // Performance optimizations
        backgroundColor: '#f5f5f5',
        maxZoom: 20,
        minZoom: 3,
        
        // Zoom control positioning
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        
        // Styling optimizations
        styles: isSatelliteView ? [] : [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
          }
        ]
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Optimized marker creation
      const marker = new window.google.maps.Marker({
        position: coordinates || defaultCenter,
        map: map,
        draggable: true,
        title: "Attendance Location",
        animation: null, // Disable animations for better performance
        optimized: true // Use optimized rendering
      });
      markerRef.current = marker;

      // Optimized event listeners with proper cleanup
      const listeners = [];
      
      // Map click handler
      listeners.push(
        window.google.maps.event.addListener(map, 'click', (event: any) => {
          if (event.latLng) {
            const location = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            setCoordinates(location);
            marker.setPosition(location);
            reverseGeocode(location);
          }
        })
      );

      // Marker drag handlers with optimized performance
      listeners.push(
        window.google.maps.event.addListener(marker, 'drag', handleMarkerDrag)
      );
      
      listeners.push(
        window.google.maps.event.addListener(marker, 'dragend', () => {
          const position = marker.getPosition();
          if (position) {
            const location = {
              lat: position.lat(),
              lng: position.lng()
            };
            setCoordinates(location);
            reverseGeocode(location);
          }
        })
      );

      // Cleanup function
      return () => {
        listeners.forEach(listener => {
          if (listener) {
            window.google.maps.event.removeListener(listener);
          }
        });
        
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }
      };

    } catch (error) {
      console.error('Map initialization error:', error);
      setHasError(true);
      setErrorMessage("Failed to initialize map. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, coordinates, defaultCenter, reverseGeocode, handleMarkerDrag, isSatelliteView]);

  // Update map type when satellite view changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const newMapTypeId = isSatelliteView 
        ? window.google.maps.MapTypeId.SATELLITE 
        : window.google.maps.MapTypeId.ROADMAP;
        
      mapInstanceRef.current.setOptions({
        mapTypeId: newMapTypeId,
        styles: isSatelliteView ? [] : [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
    }
  }, [isSatelliteView]);

  // Update map and marker when coordinates change externally
  useEffect(() => {
    if (coordinates && mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter(coordinates);
      markerRef.current.setPosition(coordinates);
    }
  }, [coordinates]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
    };
  }, []);

  // Optimized suggestion fetching
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || !window.google?.maps) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    try {
      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: query,
        componentRestrictions: { country: 'in' },
        types: ['(cities)']
      };

      service.getPlacePredictions(request, (predictions: any, status: any) => {
        setIsLoadingSuggestions(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions = predictions.slice(0, 5).map((prediction: any) => ({
            name: prediction.description,
            formatted_address: prediction.description,
            place_id: prediction.place_id,
            source: 'google'
          }));
          
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Handle address input changes
  const handleAddressChange = useCallback((value: string) => {
    setAddress(value);
    debouncedAddressSearch(value);
  }, [debouncedAddressSearch]);

  // Handle suggestion selection
  const selectSuggestion = useCallback((suggestion: any) => {
    if (!mapInstanceRef.current) return;

    if (suggestion.place_id) {
      const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
      service.getDetails({
        placeId: suggestion.place_id,
        fields: ['geometry', 'formatted_address', 'name']
      }, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          setCoordinates(location);
          setAddress(place.formatted_address || suggestion.formatted_address);
          setShowSuggestions(false);
          
          if (markerRef.current) {
            markerRef.current.setPosition(location);
          }
          
          onLocationSelect({
            address: place.formatted_address || suggestion.formatted_address,
            latitude: location.lat,
            longitude: location.lng
          });
        }
      });
    }
  }, [onLocationSelect]);

  // Clear location handler
  const clearLocation = useCallback(() => {
    setAddress('');
    setCoordinates(null);
    setSuggestions([]);
    setShowSuggestions(false);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setPosition(defaultCenter);
      mapInstanceRef.current.setCenter(defaultCenter);
    }
    
    onLocationSelect({
      address: '',
      latitude: 0,
      longitude: 0
    });
  }, [defaultCenter, onLocationSelect]);

  // Manual coordinate update handler
  const updateCoordinates = useCallback((field: 'lat' | 'lng', value: number) => {
    if (isNaN(value)) return;
    
    const newCoords = {
      lat: field === 'lat' ? value : (coordinates?.lat || 0),
      lng: field === 'lng' ? value : (coordinates?.lng || 0)
    };
    
    setCoordinates(newCoords);
    onLocationSelect({
      address: address || 'Manual Location',
      latitude: newCoords.lat,
      longitude: newCoords.lng
    });
  }, [coordinates, address, onLocationSelect]);

  if (hasError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Google Maps Error
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Retry Loading Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading Google Maps...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-green-600">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Location Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Mode Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Location Selection Method
          </Label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setLocationMode('map')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                locationMode === 'map'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Select from Map
            </button>
            <button
              type="button"
              onClick={() => setLocationMode('manual')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                locationMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Manual Geo Location
            </button>
          </div>
        </div>

        {/* Map Mode */}
        {locationMode === 'map' && (
          <>
            {/* Address Input */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Address
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Type an address in India..."
                    disabled={disabled || isLoading}
                    className="pr-10"
                    autoComplete="off"
                  />
                  {address && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearLocation}
                      disabled={disabled}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Button>
                  )}
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingSuggestions ? (
                        <div className="px-4 py-3 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          Loading suggestions...
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            onClick={() => selectSuggestion(suggestion)}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              {suggestion.name || suggestion.formatted_address}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interactive Map
                </Label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Road</span>
                  <button
                    type="button"
                    onClick={() => setIsSatelliteView(!isSatelliteView)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isSatelliteView ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isSatelliteView ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Satellite</span>
                </div>
              </div>
              
              <div 
                ref={mapRef} 
                className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700"
                style={{ 
                  minHeight: '256px',
                  touchAction: 'pan-x pan-y'
                }}
              />
              
              {coordinates && (
                <div className="mt-2 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        📍 Position:
                      </span>
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (markerRef.current) {
                          const position = markerRef.current.getPosition();
                          if (position) {
                            const currentCoords = {
                              lat: position.lat(),
                              lng: position.lng()
                            };
                            setCoordinates(currentCoords);
                            reverseGeocode(currentCoords);
                          }
                        }
                      }}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Set Location
                    </button>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click on the map or drag the marker to set location
              </p>
            </div>
          </>
        )}

        {/* Manual Mode */}
        {locationMode === 'manual' && (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Manual Geo Location Input
            </Label>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Latitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 28.6139"
                  value={coordinates?.lat || ''}
                  onChange={(e) => updateCoordinates('lat', parseFloat(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Longitude
                </Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 77.2090"
                  value={coordinates?.lng || ''}
                  onChange={(e) => updateCoordinates('lng', parseFloat(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Coordinates Display */}
        {coordinates && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Latitude
              </Label>
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                {coordinates.lat.toFixed(6)}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Longitude
              </Label>
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Initializing map...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}