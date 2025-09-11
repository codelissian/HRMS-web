# Google Maps Integration Setup

This project includes Google Maps integration for location tracking in attendance policies. To use this feature, you need to set up a Google Maps API key.

## Setup Instructions

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Set up Environment Variable:**
   Create a `.env` file in the project root with:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Features Included:**
   - Address autocomplete with India restriction
   - Interactive map with draggable marker
   - Click-to-select location on map
   - Live latitude/longitude display
   - Reverse geocoding for address lookup

## Security Notes

- Keep your API key secure and never commit it to version control
- Use API key restrictions in Google Cloud Console
- Consider using domain restrictions for production

## Usage

The LocationTracker component is automatically integrated into the attendance policy form when geo-tracking is enabled. Users can:

1. Type an address to see autocomplete suggestions
2. Click on the map to select a location
3. Drag the marker to fine-tune the position
4. View live coordinates as they interact with the map