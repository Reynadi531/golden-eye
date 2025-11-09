import { Hono, type ValidationTargets } from "hono";
import { cors } from "hono/cors";
import ky from "ky";
import type {
  ExtendedProxyResultItem,
  List2Response,
  PaginationResponse,
  ProxyResponse,
  TileGistItem,
} from "shared/dist";
import { BASE_PROXY_URL, LOCATIONS_URL, S3_BUCKET_URL } from "./constants/url";
import { logger } from "hono/logger";
import { zValidator as zv } from '@hono/zod-validator'
import * as z from "zod";
import { HTTPException } from "hono/http-exception";
import findCenterCoordinate from "./utils/findCenterCoordinate";
import reverseGeocoding from "./utils/reverseGeocoding";
import fuzzyPathImage from "./utils/fuzzyPathImage";

export const zValidator = <T extends z.ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, { cause: result.error })
    }
  })

const app = new Hono()
  .use(cors())
  .use(logger())
  .get("/api/list", zValidator('query', 
    z.object({
      q: z.string().optional(),
      pageSize: z.string().optional(),
      page: z.string().optional(),
    })
  ), async (c) => {
  let query: number = Number(c.req.query("q")) || 100;
  let pagesize: number = Number(c.req.query("pageSize")) || 32;
  let page: number = Number(c.req.query("page")) || 1;

  const response = await ky.get(`${BASE_PROXY_URL}/fetch2`, {
    searchParams: {
      q: query,
      pageSize: pagesize,
      page: page,
    },
  });

  if (!response.ok) {
    return c.json(
      {
        message: "Failed to fetch data",
        success: false,
      } as PaginationResponse,
      { status: 500 }
    );
  }

  const proxyData: ProxyResponse = await response.json();

  const centerCoordinate = findCenterCoordinate(proxyData.result);

  const modifiedResults: ExtendedProxyResultItem[] = await Promise.all(proxyData.result.map(async(item) => ({
    ...item,
    location: (await reverseGeocoding(item.lat, item.lon)).display_name,
    imagePath: (await fuzzyPathImage(item.lat, item.lon, centerCoordinate)),
  } as ExtendedProxyResultItem)));

  const data: PaginationResponse = {
    success: true,
    totalPages: 1,
    page: page,
    pageSize: pagesize,
    data: {
      center: centerCoordinate,
      items: modifiedResults,
    },
  };

  return c.json(data, { status: 200 });
})
.get("/api/list2", async(c) => {
  const response = await ky.get(LOCATIONS_URL as string);
  if (!response.ok) {
    return c.json(
      {
        success: false,
        message: "Failed to fetch data",
      } as List2Response,
      { status: 500 }
    );
  }

  const data: TileGistItem[] = await response.json();
  
  const extendedData: List2Response = {
    success: true,
    data: {
      center: findCenterCoordinate(data.map(item => ({ lat: item.lat, lon: item.lon }))),
      items: await Promise.all(data.map(async(item) => ({
        lat: item.lat,
        lon: item.lon,
        location: item.location || "", 
        imagePath: item.s3_keys.map((url) => `${S3_BUCKET_URL}/${url}`),
      }))),
    },
  }

  return c.json(extendedData, { status: 200 });
})


export default app;