import type { ProxyResultItem } from "shared/dist";

type ICenter = {
    lat: number;
    lon: number;
}

const findCenterCoordinate = (coords: ProxyResultItem[]): ICenter => {
    if (!coords.length) return { lat: 0, lon: 0 };

    // Convert degrees to radians
    const degToRad = (deg: number) => (deg * Math.PI) / 180;
    const radToDeg = (rad: number) => (rad * 180) / Math.PI;

    let x = 0, y = 0, z = 0;

    for (const { lat, lon } of coords) {
        const latRad = degToRad(lat);
        const lonRad = degToRad(lon);

        x += Math.cos(latRad) * Math.cos(lonRad);
        y += Math.cos(latRad) * Math.sin(lonRad);
        z += Math.sin(latRad);
    }

    const total = coords.length;
    x /= total;
    y /= total;
    z /= total;

    const lonCenter = Math.atan2(y, x);
    const hyp = Math.sqrt(x * x + y * y);
    const latCenter = Math.atan2(z, hyp);

    return {
        lat: radToDeg(latCenter),
        lon: radToDeg(lonCenter),
    };
};

export default findCenterCoordinate;