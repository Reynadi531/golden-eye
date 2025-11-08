import Navbar from "@/components/Navbar";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BASE_URL } from "@/constant/Url";
import { useList } from "@/hooks/useList";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { hcWithType } from "server/dist/client";

export const Route = createFileRoute("/list")({
  component: RouteComponent,
});

const client = hcWithType(BASE_URL);

function RouteComponent() {
  const { data, setData } = useList();
  const [openPopover, setOpenPopover] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await client.api.list2.$get();
        if (!res.ok) {
          console.log("Error fetching data");
          return;
        }
        const responseData = await res.json();
        setData(responseData);
      } catch (error) {
        console.log(error);
      }
    },
  });

  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || data) return;
    didRun.current = true;
    mutation.mutate();
  }, [data, mutation]);
  return (
    <div>
      <Navbar />
      <div className="mx-4">
        <h1 className="text-2xl font-bold mt-6">Daftar Tambang Illegal</h1>
        <p className="mt-2 text-gray-400">
          Berikut adalah daftar tambang ilegal yang terdeteksi:
        </p>
        <Table className="w-full mt-4">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">No</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mutation.isPending && !data && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {data &&
              data.data?.items.map((item, index) => (
                <Popover
                  key={index}
                  open={openPopover === index}
                  onOpenChange={(open) => {
                    setOpenPopover(open ? index : null);
                  }}
                >
                  <PopoverTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.lat}</TableCell>
                      <TableCell>{item.lon}</TableCell>
                    </TableRow>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{item.location}</h3>
                      <p className="text-sm text-muted-foreground">
                        Koordinat: {item.lat}, {item.lon}
                      </p>
                      {item.imagePath && item.imagePath.length > 0 && (
                        <div className="space-y-2">
                          {item.imagePath.map((img, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={img}
                              alt={`${item.location} - ${imgIndex + 1}`}
                              className="w-full rounded-md"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
