import { BASE_PROXY_URL, S3_BUCKET_URL } from "@server/constants/url";
import ky from "ky";

export type TileItem = {
  id: string;
  lat: number;   
  lon: number;  
  score: number; 
  s3_key: string;
};

export type TilesResponse = {
  result: TileItem[];
};

type FuzzyPathImage = (latitude: number, longitude: number, center: {lat: number, lon: number}) => Promise<string>;

const fuzzyPathImage: FuzzyPathImage = async(latitude, longitude, center) => {
    const response = await ky.get(`${BASE_PROXY_URL}/fetch`, {
        searchParams: {
            lat: center.lat,
            lon: center.lon,
            rad: 100,
            limit: 100,
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch image path');
    }

    const data: TilesResponse = await response.json();
    let path = "";

    for (const item of data.result) {
        const latDiff = Math.abs(item.lat - latitude);
        const lonDiff = Math.abs(item.lon - longitude);
        
        const tolerance = 0.01;
        if (latDiff <= tolerance && lonDiff <= tolerance) {
            path = `${S3_BUCKET_URL}/${item.s3_key}`;
            break;
        }
    }

    return path;
}

export default fuzzyPathImage;