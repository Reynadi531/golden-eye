export type TileGistItem = {
  lat: number;   
  lon: number; 
  location?: string;
  s3_keys: string[];
};

export type List2Response = {
    success: boolean;
    message?: string;
    data?: {
        center: {
            lat: number;
            lon: number;
        };
        items: {
            lat: number;
            lon: number;
            location: string;
            imagePath: string[];
        }[];
    };
}