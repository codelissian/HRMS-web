import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : null
  );
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [hoverCoordinates, setHoverCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [locationMode, setLocationMode] = useState<'map' | 'manual'>('map');
  const [displayCoordinates, setDisplayCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const dragUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add a small delay to ensure everything is properly initialized
        setTimeout(() => {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
          } else {
            setHasError(true);
            setErrorMessage("Google Maps loaded but not properly initialized.");
          }
        }, 100);
      };
      script.onerror = (error) => {
        console.error('Google Maps loading error:', error);
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
  }, [toast]);

  // Initialize map and autocomplete
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !autocompleteRef.current) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      // Check if Google Maps is properly loaded
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps not properly loaded');
      }

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: coordinates || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
        zoom: 15,
        mapTypeId: isSatelliteView ? window.google.maps.MapTypeId.SATELLITE : window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: isSatelliteView ? [] : [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Add error listener for map
      window.google.maps.event.addListener(map, 'error', (error: any) => {
        console.error('Google Maps error:', error);
        setHasError(true);
        setErrorMessage('Google Maps encountered an error. Please check your API key and billing settings.');
      });

      mapInstanceRef.current = map;

      // Initialize marker
      const marker = new window.google.maps.Marker({
        position: coordinates || { lat: 28.6139, lng: 77.2090 },
        map: map,
        draggable: true,
        title: "Attendance Location"
      });

      markerRef.current = marker;

      // Map is ready for suggestions

      // Handle marker drag start
      marker.addListener('dragstart', () => {
        setIsDragging(true);
        setIsUpdating(true);
      });

      // Handle marker drag - optimized for smooth performance with throttling
      marker.addListener('drag', () => {
        if (!isUpdating) return; // Prevent multiple simultaneous updates
        
        // Clear existing timeout
        if (dragUpdateTimeoutRef.current) {
          clearTimeout(dragUpdateTimeoutRef.current);
        }
        
        // Throttle updates to 60fps for smooth performance
        dragUpdateTimeoutRef.current = setTimeout(() => {
          const position = marker.getPosition();
          if (position) {
            const location = {
              lat: position.lat(),
              lng: position.lng()
            };
            // Only update display coordinates during drag for smooth UI
            setDisplayCoordinates(location);
            setHoverCoordinates(location);
          }
        }, 16); // ~60fps
      });

      // Handle marker drag end - final coordinates when drag stops
      marker.addListener('dragend', () => {
        setIsDragging(false);
        setIsUpdating(false);
        
        // Clear any pending drag updates
        if (dragUpdateTimeoutRef.current) {
          clearTimeout(dragUpdateTimeoutRef.current);
          dragUpdateTimeoutRef.current = null;
        }
        
        const position = marker.getPosition();
        if (position) {
          const location = {
            lat: position.lat(),
            lng: position.lng()
          };
          setCoordinates(location);
          setHoverCoordinates(null); // Clear hover coordinates
          
          // Reverse geocode to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              const newAddress = results[0].formatted_address;
              setAddress(newAddress);
              onLocationSelect({
                address: newAddress,
                latitude: location.lat,
                longitude: location.lng
              });
            }
          });
        }
      });

      // Handle marker position changes - for non-drag updates
      marker.addListener('position_changed', () => {
        if (!isDragging) { // Only update if not dragging
          const position = marker.getPosition();
          if (position) {
            const location = {
              lat: position.lat(),
              lng: position.lng()
            };
            setCoordinates(location);
            setDisplayCoordinates(location);
          }
        }
      });

      // Handle map click
      map.addListener('click', (event: any) => {
        if (event.latLng) {
          const location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          
          setCoordinates(location);
          marker.setPosition(location);
          
          // Reverse geocode to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              const newAddress = results[0].formatted_address;
              setAddress(newAddress);
              onLocationSelect({
                address: newAddress,
                latitude: location.lat,
                longitude: location.lng
              });
            }
          });
        }
      });

      // Handle mouse move to track pointer position
      map.addListener('mousemove', (event: any) => {
        if (event.latLng) {
          const location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          setHoverCoordinates(location);
        }
      });

      // Clear hover coordinates when mouse leaves map
      map.addListener('mouseout', () => {
        setHoverCoordinates(null);
      });

      // Cleanup function
      return () => {
        if (autocompleteInstanceRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current);
        }
        if (dragUpdateTimeoutRef.current) {
          clearTimeout(dragUpdateTimeoutRef.current);
          dragUpdateTimeoutRef.current = null;
        }
      };

    } catch (error) {
      console.error('Error initializing map:', error);
      
      // Retry logic - try up to 3 times
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setIsLoading(true);
          setHasError(false);
          setErrorMessage('');
        }, 1000 * retryCount); // Exponential backoff
        return;
      }
      
      setHasError(true);
      setErrorMessage("Failed to initialize map after multiple attempts. Please check your Google Maps API key and billing settings.");
      toast({
        title: "Error",
        description: "Failed to initialize map after multiple attempts. Please check your Google Maps API key and billing settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSatelliteView, onLocationSelect, toast]);

  // Update map when coordinates change externally
  useEffect(() => {
    if (coordinates && mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter(coordinates);
      markerRef.current.setPosition(coordinates);
      setDisplayCoordinates(coordinates); // Update display coordinates when coordinates change
    }
  }, [coordinates]);

  // Debug coordinates changes
  useEffect(() => {
    console.log('Coordinates updated:', coordinates);
  }, [coordinates]);

  // Initialize display coordinates when map is loaded
  useEffect(() => {
    if (isLoaded && mapInstanceRef.current && markerRef.current && !displayCoordinates) {
      const position = markerRef.current.getPosition();
      if (position) {
        const location = {
          lat: position.lat(),
          lng: position.lng()
        };
        setDisplayCoordinates(location);
      }
    }
  }, [isLoaded, displayCoordinates]);

  // Update hover coordinates with current marker position
  useEffect(() => {
    if (markerRef.current && !isDragging) {
      const position = markerRef.current.getPosition();
      if (position) {
        const location = {
          lat: position.lat(),
          lng: position.lng()
        };
        setHoverCoordinates(location);
      }
    }
  }, [isDragging]);

  // Continuous marker position tracking - optimized for performance
  useEffect(() => {
    if (!markerRef.current) return;

    const interval = setInterval(() => {
      if (markerRef.current && !isDragging) { // Only update when not dragging
        const position = markerRef.current.getPosition();
        if (position) {
          const location = {
            lat: position.lat(),
            lng: position.lng()
          };
          setHoverCoordinates(location);
          // Only update if coordinates have actually changed
          setCoordinates(prev => {
            if (!prev || Math.abs(prev.lat - location.lat) > 0.000001 || Math.abs(prev.lng - location.lng) > 0.000001) {
              return location;
            }
            return prev;
          });
          setDisplayCoordinates(location);
        }
      }
    }, 500); // Reduced frequency to 500ms for better performance

    return () => clearInterval(interval);
  }, [isDragging]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for suggestions
    if (value.trim().length > 2) {
      setIsLoadingSuggestions(true);
      const timeout = setTimeout(() => {
        getSuggestions(value);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
    }
  };

  // Get suggestions from Google Places API
  const getSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    if (!window.google) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);

    try {
      // Use Google Places Autocomplete service
      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: query,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['(cities)'] // Only cities
      };

      service.getPlacePredictions(request, (predictions: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions = predictions.slice(0, 5).map((prediction: any) => ({
            name: prediction.description,
            formatted_address: prediction.description,
            place_id: prediction.place_id,
            source: 'google'
          }));
          
          setSuggestions(suggestions);
          setShowSuggestions(true);
          setIsLoadingSuggestions(false);
        } else {
          // Fallback to Geocoding API
          getGeocodingSuggestions(query);
        }
      });
    } catch (error) {
      console.error('Google Places error:', error);
      // Fallback to Geocoding API
      getGeocodingSuggestions(query);
    }
  };

  // Fallback method using Geocoding API
  const getGeocodingSuggestions = async (query: string) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const request = {
        address: query + ', India', // Add India to improve results
        region: 'IN'
      };

      geocoder.geocode(request, (results: any, status: any) => {
        if (status === window.google.maps.GeocoderStatus.OK && results) {
          // Convert geocoding results to suggestion format
          const suggestions = results.slice(0, 5).map((result: any) => ({
            name: result.formatted_address,
            formatted_address: result.formatted_address,
            geometry: result.geometry,
            source: 'geocoding'
          }));
          setSuggestions(suggestions);
          setShowSuggestions(true);
          setIsLoadingSuggestions(false);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setIsLoadingSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Geocoding suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
    }
  };

  // Manual address search function
  const searchAddress = async (address: string) => {
    if (!address.trim() || !window.google) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coords = {
            lat: location.lat(),
            lng: location.lng()
          };
          
          setCoordinates(coords);
          setAddress(results[0].formatted_address);
          setShowSuggestions(false);
          
          // Update map and marker
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter(coords);
            markerRef.current.setPosition(coords);
          }
          
          // Notify parent component
          onLocationSelect({
            address: results[0].formatted_address,
            latitude: coords.lat,
            longitude: coords.lng
          });
        }
      });
    } catch (error) {
      console.error('Address search error:', error);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: any) => {
    
    if (suggestion.place_id) {
      // Use Google Places Details API to get coordinates
      getPlaceDetails(suggestion.place_id, suggestion.formatted_address || suggestion.name);
    } else if (suggestion.geometry && suggestion.geometry.location) {
      // Direct selection with coordinates
      const location = {
        lat: suggestion.geometry.location.lat(),
        lng: suggestion.geometry.location.lng()
      };
      
      setCoordinates(location);
      setAddress(suggestion.formatted_address || suggestion.name);
      setShowSuggestions(false);
      
      // Update map and marker
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setCenter(location);
        markerRef.current.setPosition(location);
      }
      
      // Notify parent component
      onLocationSelect({
        address: suggestion.formatted_address || suggestion.name,
        latitude: location.lat,
        longitude: location.lng
      });
    } else {
      // Geocode the selected address
      searchAddress(suggestion.formatted_address || suggestion.name);
    }
  };

  // Get place details from Google Places API
  const getPlaceDetails = (placeId: string, address: string) => {
    if (!window.google || !mapInstanceRef.current) {
      return;
    }

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
    const request = {
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'name']
    };

    service.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setCoordinates(location);
        setAddress(place.formatted_address || address);
        setShowSuggestions(false);
        
        // Update map and marker
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(location);
          markerRef.current.setPosition(location);
        }
        
        // Notify parent component
        onLocationSelect({
          address: place.formatted_address || address,
          latitude: location.lat,
          longitude: location.lng
        });
      } else {
        searchAddress(address);
      }
    });
  };

  const clearLocation = () => {
    setAddress('');
    setCoordinates(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setPosition({ lat: 28.6139, lng: 77.2090 });
      mapInstanceRef.current.setCenter({ lat: 28.6139, lng: 77.2090 });
    }
    onLocationSelect({
      address: '',
      latitude: 0,
      longitude: 0
    });
  };

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
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p><strong>To fix this issue:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Enable billing for your Google Cloud project</li>
                  <li>Verify your API key is correct</li>
                  <li>Ensure Maps JavaScript API is enabled</li>
                  <li>Check API key restrictions</li>
                </ul>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      setHasError(false);
                      setErrorMessage('');
                      setRetryCount(0);
                      setIsLoaded(false);
                      // Force reload the script
                      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
                      if (existingScript) {
                        existingScript.remove();
                      }
                      window.location.reload();
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    🔄 Retry Loading Map
                  </Button>
                </div>
              </div>
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
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                locationMode === 'map'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              Select from Map
            </button>
            <button
              type="button"
              onClick={() => setLocationMode('manual')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                locationMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              Manual Geo Location
            </button>
          </div>
        </div>

        {/* Address Input - Only show in map mode */}
        {locationMode === 'map' && (
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Address
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={autocompleteRef}
                  id="address"
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      searchAddress(address);
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                )}
                
                {/* Custom Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
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
                          {suggestion.formatted_address && suggestion.name !== suggestion.formatted_address && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {suggestion.formatted_address}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                        No suggestions found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={() => searchAddress(address)}
                disabled={disabled || !address.trim()}
                className="px-4"
              >
                Search
              </Button>
            </div>
          </div>
        )}

        {/* Map Container - Only show when map mode is selected */}
        {locationMode === 'map' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Interactive Map
              </Label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400"></span>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                    Road
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSatelliteView(!isSatelliteView);
                    // Re-initialize map with new style
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setOptions({
                        mapTypeId: isSatelliteView 
                          ? window.google.maps.MapTypeId.ROADMAP 
                          : window.google.maps.MapTypeId.SATELLITE,
                        styles: !isSatelliteView ? [] : [
                          {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                          }
                        ]
                      });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSatelliteView ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isSatelliteView ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400"></span>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                    Satellite
                  </Label>
                </div>
              </div>
            </div>
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700"
            style={{ minHeight: '256px' }}
          />
          
          {/* Live Coordinates Display */}
          <div className={`mt-2 p-3 rounded-lg border transition-colors duration-200 ${
            isDragging 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  isDragging 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  📍 Position:
                </span>
                <span className={`text-xs font-mono transition-colors duration-200 ${
                  isDragging 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {displayCoordinates ? `${displayCoordinates.lat.toFixed(6)}, ${displayCoordinates.lng.toFixed(6)}` : 
                   coordinates ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}` : '0.000000, 0.000000'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    // Get current marker position directly
                    if (markerRef.current) {
                      const position = markerRef.current.getPosition();
                      if (position) {
                        const currentCoords = {
                          lat: position.lat(),
                          lng: position.lng()
                        };
                        setCoordinates(currentCoords);
                        setHoverCoordinates(currentCoords);
                        
                        // Reverse geocode to get address
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location: currentCoords }, (results: any, status: any) => {
                          if (status === 'OK' && results && results[0]) {
                            const newAddress = results[0].formatted_address;
                            setAddress(newAddress);
                            onLocationSelect({
                              address: newAddress,
                              latitude: currentCoords.lat,
                              longitude: currentCoords.lng
                            });
                          }
                        });
                      }
                    }
                  }}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Set Location
                </button>
              </div>
            </div>
          </div>
          
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag the red marker to any location to get exact coordinates, or click anywhere on the map
            </p>
          </div>
        )}

        {/* Manual Coordinate Input - Only show when manual mode is selected */}
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
                  onChange={(e) => {
                    const lat = parseFloat(e.target.value);
                    if (!isNaN(lat)) {
                      const newCoords = { 
                        lat, 
                        lng: coordinates?.lng || 0 
                      };
                      setCoordinates(newCoords);
                      onLocationSelect({
                        address: address || 'Manual Location',
                        latitude: newCoords.lat,
                        longitude: newCoords.lng
                      });
                    }
                  }}
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
                  onChange={(e) => {
                    const lng = parseFloat(e.target.value);
                    if (!isNaN(lng)) {
                      const newCoords = { 
                        lat: coordinates?.lat || 0, 
                        lng 
                      };
                      setCoordinates(newCoords);
                      onLocationSelect({
                        address: address || 'Manual Location',
                        latitude: newCoords.lat,
                        longitude: newCoords.lng
                      });
                    }
                  }}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter the exact latitude and longitude coordinates for the attendance location
            </p>
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