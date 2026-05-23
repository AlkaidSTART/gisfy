import qiniu from "qiniu";

export async function uploadBase64ToQiniu(input: {
  key: string;
  base64: string;
}) {
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const bucket = process.env.QINIU_BUCKET;
  const domain = process.env.QINIU_DOMAIN;

  if (!accessKey || !secretKey || !bucket || !domain) {
    throw new Error("Qiniu env is incomplete");
  }

  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket });
  const uploadToken = putPolicy.uploadToken(mac);

  const config = new qiniu.conf.Config();
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  const pureBase64 = input.base64.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(pureBase64, "base64");

  const info = await new Promise<qiniu.form_up.PutRet>((resolve, reject) => {
    formUploader.put(uploadToken, input.key, buffer, putExtra, (err, body, respInfo) => {
      if (err) return reject(err);
      if (respInfo.statusCode !== 200) {
        return reject(new Error(`Qiniu upload failed: ${respInfo.statusCode}`));
      }
      resolve(body as qiniu.form_up.PutRet);
    });
  });

  return {
    key: info.key || input.key,
    hash: info.hash,
    cdnUrl: `${domain.replace(/\/$/, "")}/${info.key || input.key}`,
    size: buffer.length,
    mimeType: "image/png",
  };
}
