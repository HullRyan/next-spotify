import styles from "@/styles/Home.module.css";
import { useQuery } from "@tanstack/react-query";
import { getUserTopItems } from "@soundify/web-api";
import { useSpotifyClient } from "@/context/spotify";
import { useEffect } from "react";

export default function Home() {
	const { client, login, logout, setTopArtists } =
		useSpotifyClient();

	
		const {
			status,
			data: topArtists,
			error,
		} = useQuery({
			queryKey: ["user-profile"],
			queryFn: () => getUserTopItems(client, "artists"),
			retry: false,
		});
    

	return (
		<div>
			{client != undefined ? (
				<main>
					<button onClick={logout}>Logout</button>
					{topArtists?.items &&
					(
						<div>
							<h1>Your top artists</h1>
							<ul
								style={{
									display: "flex",
									flexDirection: "column",
									rowGap: "8px",
									paddingLeft: "0",
								}}
							>
								{topArtists?.items.map((artist) => (
									<li
										style={{
											display: "flex",
											alignItems: "center",
											columnGap: "12px",
										}}
										key={artist.id}
									>
										<img
											src={artist.images[0].url}
											height="36px"
											width="36px"
											style={{ borderRadius: "50%" }}
										/>
										<h3 style={{ margin: "0" }}>{artist.name}</h3>
										<p style={{ margin: "0" }}>
											Popularity: {artist.popularity}
										</p>
									</li>
								))}
							</ul>
						</div>
					)}
				</main>
			) : (
				<main>
					<button onClick={login}>Login</button>
				</main>
			)}
		</div>
	);
}
