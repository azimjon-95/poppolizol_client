import axios from "axios";

const mainURL = axios.create({
  baseURL: "http://localhost:5050/api",
  // baseURL: "https://qarshi-med.vercel.app/api",
});

export default mainURL;
