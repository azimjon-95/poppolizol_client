import axios from "axios";

const mainURL = axios.create({
  baseURL: "http://localhost:5050/api",
  // baseURL: "https://poppolizol-api.vercel.app/api",
  // baseURL: "https://cs89w8t5-5050.euw.devtunnels.ms/api",
});

export default mainURL;
