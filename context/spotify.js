"use client";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import { PKCECodeFlow, SpotifyClient } from "@soundify/web-api";
import { useRouter } from "next/router";

const appName = "mosaify";

export const SPOTIFY_REFRESH_TOKEN = appName + "-refresh-token";
export const SPOTIFY_ACCESS_TOKEN = appName + "-access-token";
export const CODE_VERIFIER = appName + "-code-verifier";

const SpotifyContext = createContext();

const env = {
	client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
	redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
};

const authFlow = new PKCECodeFlow(env.client_id);

export const SpotifyProvider = ({ children }) => {
	const [topArtists, setTopArtists] = useState();

	const authorize = async () => {
		const { code_challenge, code_verifier } =
			await PKCECodeFlow.generateCodes();
		localStorage.setItem(CODE_VERIFIER, code_verifier);

		location.replace(
			authFlow.getAuthURL({
				code_challenge,
				scopes: ["user-read-private", "user-top-read"],
				redirect_uri: env.redirect_uri,
			})
		);
	};

	const unAuthorize = () => {
		localStorage.removeItem(SPOTIFY_ACCESS_TOKEN);
		localStorage.removeItem(SPOTIFY_REFRESH_TOKEN);
		location.reload();
	};

	if (typeof window !== "undefined") {
		const client = useMemo(() => {
			const access_token = localStorage.getItem(SPOTIFY_ACCESS_TOKEN);
			const refresh_token = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);
			if (!refresh_token) return null;

			const refresher = authFlow.createRefresher(refresh_token);

			return new SpotifyClient(
				{
					refresh: async () => {
						const { access_token, refresh_token } = await refresher();

						localStorage.setItem(SPOTIFY_ACCESS_TOKEN, access_token);
						localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);

						return access_token;
					},
					token: access_token ?? undefined,
				},
				{ onUnauthorized: authorize }
			);
		}, []);

		if (location.pathname === "/callback") {
			return <>{children}</>;
		}

		const login = () => {
			authorize();
		};

		const logout = () => {
			unAuthorize();
		};

		return (
			<SpotifyContext.Provider
				value={{ client, login, logout, topArtists, setTopArtists }}
			>
				{children}
			</SpotifyContext.Provider>
		);
	}
};

export const useSpotifyClient = () => {
	const spotifyContext = useContext(SpotifyContext);
	if (spotifyContext === null) {
		throw new Error("Unreachable: SpotifyContext is null");
	}

	return spotifyContext;
};

export const useHandleCallback = () => {
	return useQuery({
		queryKey: ["spotify-callback"],
		queryFn: async () => {
			const data = PKCECodeFlow.parseCallbackData(
				new URLSearchParams(location.search)
			);
			if ("error" in data) {
				throw new Error(data.error);
			}

			const code_verifier = localStorage.getItem(CODE_VERIFIER);
			if (!code_verifier) {
				throw new Error("Cannot find code_verifier");
			}

			return await authFlow.getGrantData({
				code: data.code,
				code_verifier,
				redirect_uri: env.redirect_uri,
			});
		},
		staleTime: Infinity,
		onSuccess: ({ access_token, refresh_token }) => {
			localStorage.removeItem(CODE_VERIFIER);
			localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
			localStorage.setItem(SPOTIFY_ACCESS_TOKEN, access_token);
			location.replace("/");
		},
		retry: false,
	});
};
