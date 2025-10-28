import { createFileRoute } from "@tanstack/react-router";
import Navbar from '@/components/Navbar'
import 'leaflet/dist/leaflet.css';
import MapsLoader from "@/components/MapsLoader";

export const Route = createFileRoute("/")({
	component: Index,
});


function Index() {
	return (
		<div>
			<Navbar />
			<MapsLoader />
		</div>
	);
}

export default Index;
