import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import "leaflet/dist/leaflet.css";
import MapsLoader from "@/components/MapsLoader";
import { hcWithType } from "server/dist/client";
import { BASE_URL } from "@/constant/Url";
import { useMutation } from "@tanstack/react-query";
import { useList } from "@/hooks/useList";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/")({
  component: Index,
});

const client = hcWithType(BASE_URL);

function Index() {
  const { data, setData } = useList();

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
      {mutation.isPending && !data && (<>
        <div className="w-full h-full flex flex-col items-center justify-center mt-20">
          <Spinner className="mb-4" />
          <p className="text-gray-500">Memuat data tambang ilegal...</p>
        </div>
      </>)}
      {data && <MapsLoader />}
    </div>
  );
}

export default Index;
