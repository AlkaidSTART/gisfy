import { createHmac } from "node:crypto";

function toUrlSafeBase64(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function makeUploadToken(input: {
  accessKey: string;
  secretKey: string;
  bucket: string;
}) {
  const putPolicy = {
    scope: input.bucket,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  };
  const encodedPolicy = toUrlSafeBase64(JSON.stringify(putPolicy));
  const sign = createHmac("sha1", input.secretKey).update(encodedPolicy).digest();
  const encodedSign = toUrlSafeBase64(sign);
  return `${input.accessKey}:${encodedSign}:${encodedPolicy}`;
}

export async function uploadBase64ToQiniu(input: { key: string; base64: string }) {
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const bucket = process.env.QINIU_BUCKET;
  const domain = process.env.QINIU_DOMAIN;

  if (!accessKey || !secretKey || !bucket || !domain) {
    throw new Error("Qiniu env is incomplete");
  }

  const token = makeUploadToken({ accessKey, secretKey, bucket });
  const pureBase64 = input.base64.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(pureBase64, "base64");

  const form = new FormData();
  form.set("token", token);
  form.set("key", input.key);
  form.set("file", new Blob([buffer], { type: "image/png" }), input.key);

  const res = await fetch("https://upload.qiniup.com", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Qiniu upload failed: ${res.status}`);
  }

  return {
    key: input.key,
    hash: "",
    cdnUrl: `${domain.replace(/\/$/, "")}/${input.key}`,
    size: buffer.length,
    mimeType: "image/png",
  };
}
