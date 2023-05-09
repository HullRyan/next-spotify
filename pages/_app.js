import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpotifyProvider } from "@/context/spotify";
import "@/styles/globals.css";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
	return (
		<QueryClientProvider client={queryClient}>
			<SpotifyProvider>
				<Component {...pageProps} />
			</SpotifyProvider>
		</QueryClientProvider>
	);
}
