export type ApiResponse = {
  message: string;
  success: boolean;
}

export type PaginationResponse = {
  success: boolean;
  message?: string;
  totalPages?: number;
  page?: number;
  pageSize?: number;
  data?: {
    center: {
      lat: number;
      lon: number;
    };
    items: ExtendedProxyResultItem[];
  };
}

export type ProxyResultItem = {
  lat: number;
  lon: number;
}

export type ProxyResponse = {
  result: ProxyResultItem[];
}

export type ExtendedProxyResultItem = ProxyResultItem & {
  location: string;  
  imagePath: string;
}