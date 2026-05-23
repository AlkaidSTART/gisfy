const DASHSCOPE_BASE = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";

interface DashScopeTaskResult {
  output: {
    task_status: "SUCCEEDED" | "FAILED" | "PENDING" | "RUNNING";
    task_id: string;
    results?: Array<{
      url?: string;
      code?: string;
      message?: string;
    }>;
    message?: string;
  };
  usage?: { image_count: number };
  request_id: string;
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString("base64");
}

async function pollTask(taskId: string, apiKey: string): Promise<DashScopeTaskResult> {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DashScope poll error ${res.status}: ${text}`);
    }
    const data: DashScopeTaskResult = await res.json();
    if (data.output.task_status === "SUCCEEDED") return data;
    if (data.output.task_status === "FAILED") {
      throw new Error(
        `DashScope generation failed: ${data.output.message || "unknown error"}`,
      );
    }
  }
  throw new Error("DashScope task timed out (120s)");
}

export async function generateWithAli(input: {
  prompt: string;
  size: number;
  count: number;
  seed?: number;
}) {
  if (!process.env.ALI_API_KEY) {
    throw new Error("ALI_API_KEY is missing");
  }

  const apiKey = process.env.ALI_API_KEY;
  const modelName = process.env.ALI_MODEL || "wanx2.1-t2i-turbo";
  const startedAt = Date.now();

  const body: Record<string, unknown> = {
    model: modelName,
    input: { prompt: input.prompt },
    parameters: {
      size: `${input.size}*${input.size}`,
      n: input.count,
    },
  };
  if (input.seed) {
    (body.parameters as Record<string, unknown>).seed = input.seed;
  }

  const res = await fetch(DASHSCOPE_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DashScope API error ${res.status}: ${text}`);
  }

  const initial: DashScopeTaskResult = await res.json();

  if (initial.output.task_status === "FAILED") {
    throw new Error(
      `DashScope generation failed: ${initial.output.message || "unknown error"}`,
    );
  }

  // Poll until completed (DashScope requires async mode for this API key)
  const data = await pollTask(initial.output.task_id, apiKey);

  const results = data.output.results || [];

  // Convert result URLs to base64
  const images = await Promise.all(
    results
      .filter((r) => r.url)
      .map(async (r) => ({
        base64: await urlToBase64(r.url!),
      })),
  );

  if (images.length === 0) {
    throw new Error("DashScope returned no images");
  }

  const duration = (Date.now() - startedAt) / 1000;
  return { images, duration };
}
