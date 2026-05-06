import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const apiClient = axios.create({
  baseURL: process.env.PICSAL_API_URL ?? "http://127.0.0.1:8000/api/",
  withCredentials: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  const cookieHeader = req.headers.cookie;
  const username =
    typeof req.body?.username === "string" ? req.body.username.trim() : "";

  if (!cookieHeader) {
    res.status(401).json({ error: "Missing auth cookie." });
    return;
  }

  if (!username) {
    res.status(422).json({ error: "Display name is required." });
    return;
  }

  try {
    const response = await apiClient.patch(
      "user/setup/",
      { username: username },
      {
        headers: {
          Cookie: cookieHeader,
        },
        withCredentials: true,
      }
    );

    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      res.setHeader("Set-Cookie", setCookieHeader);
    }

    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const setCookieHeader = error.response.headers["set-cookie"];
      if (setCookieHeader) {
        res.setHeader("Set-Cookie", setCookieHeader);
      }

      res.status(error.response.status).json(error.response.data);
      return;
    }

    res.status(500).json({ message: "Internal server error" });
  }
}
