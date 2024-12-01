import { db } from "@/db";
import { userQRCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const qrCodes = new Hono();

qrCodes.post("/upload", async (c) => {
  const { name, url, userId } = await c.req.json();

  try {
    const qrCode = await db.insert(userQRCodes).values({
      name,
      url,
      user_id: userId,
    });

    return c.json({ qrCode });
  } catch (error) {
    console.error(error);
    return c.text("Error uploading QR code", 500);
  }
});

qrCodes.post("/:id/:imageLink", async (c) => {
  const imageLink = c.req.param("imageLink");
  const id = c.req.param("id");

  try {
    await db.delete(userQRCodes).where(eq(userQRCodes.id, id));

    const fileKey = imageLink.split("/").pop() as string;

    console.log("fileKey", fileKey);

    utapi.deleteFiles(fileKey);

    return c.json({ message: "QR Code deleted" });
  } catch (error) {
    console.error(error);
    return c.text("Error deleting QR code", 500);
  }
});

export default qrCodes;
