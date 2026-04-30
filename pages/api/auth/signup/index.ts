import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const apiClient = axios.create({
  baseURL: process.env.PICSAL_API_URL ?? "http://127.0.0.1:8000/api/",
  withCredentials: true,
});

export default async function signupApi(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "You have no permission to access this resource." });
    return;
  }

  const { email, password, emailRedirectTo } = req.body ?? {};

  if (!email || !password) {
    res.status(422).json({ error: "Email and password are required." });
    return;
  }

  try {
    const response = await apiClient.post(
      "auth/signup/",
      { email, password, email_redirect_to: emailRedirectTo },
      {
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
