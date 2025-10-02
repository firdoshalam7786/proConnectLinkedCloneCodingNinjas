import axios from "axios";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  console.error("Error: NEXT_PUBLIC_API_URL is not defined in environment variables.");
}

const clientServer = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default clientServer;