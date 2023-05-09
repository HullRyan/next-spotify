import { useHandleCallback } from "@/context/spotify";
import { useRouter } from 'next/router';

export default function Callback() { 
    const {status, error} = useHandleCallback();
    const router = useRouter();

    if (status === "loading") {
        return <h1>Loading...</h1>;
    } else if (status === "error") {
        return <h1>Error: {error.message}</h1>;
    } else {
        router.push("/next-spotify");
        return <h1>Success!</h1>;
    } 
}
