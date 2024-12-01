import { db } from "@/db";
import { userQRCodes } from "@/db/schema";
import { Hono } from "hono";

const callback = new Hono();

callback.post("/upload", async (c) => {
  const body = await c.req.json();

  try {
    const qrcode = await db.insert(userQRCodes).values({
      name: body.name,
      url: body.url,
      user_id: body.userId,
    });

    return c.json({ success: true, qrcode });
  } catch (error) {
    console.error(error);
    c.text("Something went wrong", 500);
  }
});

export default callback;
