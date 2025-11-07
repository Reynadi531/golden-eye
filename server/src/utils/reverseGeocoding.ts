import ky from "ky";

type GeocodingResponse = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    county: string;
    state: string;
    region: string;
    country: string;
    country_code: string;
  };
  boundingbox: [string, string, string, string];
}

const reverseGeocoding = async (lat: number, lon: number): Promise<GeocodingResponse> => {
    const response = await ky.get('https://nominatim.openstreetmap.org/reverse', {
        searchParams: {
            lat: lat,
            lon: lon,
            format: 'json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch reverse geocoding data');
    }
    
    const data = await response.json();
    return data as GeocodingResponse;
}

export default reverseGeocoding;