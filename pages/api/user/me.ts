import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const apiClient = axios.create({
  baseURL: process.env.PICSAL_API_URL ?? "http://127.0.0.1:8000/api/",
  withCredentials: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "You have no permission to access this resource." });
    return;
  }

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    res.status(401).json({ error: "Missing auth cookie." });
    return;
  }

  try {
    const response = await fetchUserMeWithRefresh(cookieHeader);
    forwardSetCookieHeaders(res, response.headers["set-cookie"]);

    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      forwardSetCookieHeaders(res, error.response.headers["set-cookie"]);

      res.status(error.response.status).json(error.response.data);
      return;
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function fetchUserMeWithRefresh(cookieHeader: string) {
  try {
    return await apiClient.get("user/me/", {
      headers: {
        Cookie: cookieHeader,
      },
      withCredentials: true,
    });
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw error;
    }

    const status = error.response.status;
    const detail = extractErrorDetail(error.response.data);
    const canRefresh =
      (status === 401 || status === 403) &&
      detail.toLowerCase().includes("authentication credentials");

    if (!canRefresh) {
      throw error;
    }

    const refreshResponse = await apiClient.post(
      "auth/refresh/",
      {},
      {
        headers: {
          Cookie: cookieHeader,
        },
        withCredentials: true,
      }
    );

    const refreshedCookieHeader = mergeCookieHeaders(
      cookieHeader,
      refreshResponse.headers["set-cookie"]
    );

    const userMeResponse = await apiClient.get("user/me/", {
      headers: {
        Cookie: refreshedCookieHeader,
      },
      withCredentials: true,
    });

    userMeResponse.headers["set-cookie"] = [
      ...normalizeSetCookieHeaders(refreshResponse.headers["set-cookie"]),
      ...normalizeSetCookieHeaders(userMeResponse.headers["set-cookie"]),
    ];

    return userMeResponse;
  }
}

function extractErrorDetail(data: unknown) {
  if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
    return data.detail;
  }

  return "";
}

function forwardSetCookieHeaders(
  res: NextApiResponse,
  setCookieHeader: string[] | string | undefined
) {
  const cookies = normalizeSetCookieHeaders(setCookieHeader);

  if (cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }
}

function normalizeSetCookieHeaders(setCookieHeader: string[] | string | undefined) {
  if (!setCookieHeader) {
    return [] as string[];
  }

  return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
}

function mergeCookieHeaders(
  originalCookieHeader: string,
  setCookieHeader: string[] | string | undefined
) {
  const cookieMap = new Map<string, string>();

  originalCookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return;
      }

      const name = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookieMap.set(name, value);
    });

  normalizeSetCookieHeaders(setCookieHeader).forEach((cookie) => {
    const [nameValuePair] = cookie.split(";");
    const separatorIndex = nameValuePair.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const name = nameValuePair.slice(0, separatorIndex).trim();
    const value = nameValuePair.slice(separatorIndex + 1).trim();
    cookieMap.set(name, value);
  });

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}
