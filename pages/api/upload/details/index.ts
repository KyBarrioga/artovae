import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const apiClient = axios.create({
  baseURL: process.env.PICSAL_API_URL ?? "http://127.0.0.1:8000/api/",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function PostImageDetails(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res
      .status(403)
      .json({ message: "You have no permission to access this resource." });
    return;
  }

  const authorizationHeader = req.headers.authorization;
  const contentType = req.headers["content-type"];

  if (!authorizationHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token." });
    return;
  }

  if (!contentType?.startsWith("multipart/form-data")) {
    res.status(422).json({ error: "Image upload must use multipart/form-data." });
    return;
  }

  try {
    const response = await apiClient.post(
      "uploads/",
      req,
      {
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": contentType,
          ...(req.headers["content-length"]
            ? { "Content-Length": req.headers["content-length"] }
            : {}),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json(error.response.data);
      return;
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
