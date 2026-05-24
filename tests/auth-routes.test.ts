import { describe, expect, it, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// ─── Hoisted mocks (run before vi.mock) ─────────────────────────────

const {
  mockFindUnique,
  mockCreate,
  mockCreateSession,
  mockSetSessionCookie,
  mockGetSession,
  mockDestroySession,
  mockClearSessionCookie,
} = vi.hoisted(() => {
  // In-memory fake DB for tests that need it (register flow)
  let _nextId = 1;
  const _store: Map<
    string,
    { id: string; email: string; name: string; password: string }
  > = new Map();

  return {
    mockFindUnique: vi.fn(
      (args: { where: { id?: string; email?: string } }) => {
        if (args.where.email) {
          return Promise.resolve(_store.get(args.where.email) ?? null);
        }
        if (args.where.id) {
          for (const u of _store.values()) {
            if (u.id === args.where.id) return Promise.resolve(u);
          }
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      },
    ),
    mockCreate: vi.fn(
      (args: {
        data: { id?: string; email: string; name: string; password: string };
      }) => {
        const user = {
          id: args.data.id ?? `user-${_nextId++}`,
          email: args.data.email,
          name: args.data.name,
          password: args.data.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        _store.set(user.email, user);
        return Promise.resolve(user);
      },
    ),
    mockCreateSession: vi.fn().mockResolvedValue("mock-session-id"),
    mockSetSessionCookie: vi.fn().mockResolvedValue(undefined),
    mockGetSession: vi.fn().mockResolvedValue(null),
    mockDestroySession: vi.fn().mockResolvedValue(undefined),
    mockClearSessionCookie: vi.fn().mockResolvedValue(undefined),
  };
});

// ─── Module mocks ───────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  createSession: mockCreateSession,
  setSessionCookie: mockSetSessionCookie,
  getSession: mockGetSession,
  destroySession: mockDestroySession,
  clearSessionCookie: mockClearSessionCookie,
}));

// ─── Imports (after mocks) ──────────────────────────

import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as userGet } from "@/app/api/auth/[userid]/route";

// ─── Helpers ────────────────────────────────────────

function makeReq(method: string, body?: unknown, url = "http://localhost") {
  return new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── Tests ──────────────────────────────────────────

describe("Auth API – register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应成功注册新用户", async () => {
    const res = await registerPost(
      makeReq("POST", {
        email: "newuser@test.com",
        name: "新用户",
        password: "password123",
      }),
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.email).toBe("newuser@test.com");
    expect(json.data.name).toBe("新用户");

    // 验证用户通过 prisma.create 保存
    expect(mockCreate).toHaveBeenCalledOnce();
    const call = mockCreate.mock.calls[0][0];
    expect(call.data.email).toBe("newuser@test.com");

    // 验证 session 已创建
    expect(mockCreateSession).toHaveBeenCalledOnce();
    expect(mockSetSessionCookie).toHaveBeenCalledOnce();
  });

  it("重复邮箱应返回 409", async () => {
    const res = await registerPost(
      makeReq("POST", {
        email: "dup@test.com",
        name: "用户A",
        password: "password123",
      }),
    );
    expect(res.status).toBe(201);

    const res2 = await registerPost(
      makeReq("POST", {
        email: "dup@test.com",
        name: "用户B",
        password: "password456",
      }),
    );
    expect(res2.status).toBe(409);
    const json = await res2.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("CONFLICT");
  });

  it("邮箱格式错误应返回 400", async () => {
    const res = await registerPost(
      makeReq("POST", {
        email: "not-an-email",
        name: "用户",
        password: "password123",
      }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("密码太短应返回 400", async () => {
    const res = await registerPost(
      makeReq("POST", {
        email: "valid@test.com",
        name: "用户",
        password: "123",
      }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("缺少 name 应返回 400", async () => {
    const res = await registerPost(
      makeReq("POST", {
        email: "valid@test.com",
        password: "password123",
      }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});

describe("Auth API – login", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // 预注册一个用户用于登录测试
    const hashedPw = await bcrypt.hash("correct-pw", 4);
    mockFindUnique.mockImplementation(
      (args: { where: { id?: string; email?: string } }) => {
        if (args.where?.email === "existing@test.com") {
          return Promise.resolve({
            id: "user-existing",
            email: "existing@test.com",
            name: "老王",
            password: hashedPw,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      },
    );
  });

  it("应成功登录", async () => {
    const res = await loginPost(
      makeReq("POST", {
        email: "existing@test.com",
        password: "correct-pw",
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.email).toBe("existing@test.com");
    expect(json.data.name).toBe("老王");
    expect(mockCreateSession).toHaveBeenCalledOnce();
    expect(mockSetSessionCookie).toHaveBeenCalledOnce();
  });

  it("错误密码应返回 401", async () => {
    const res = await loginPost(
      makeReq("POST", {
        email: "existing@test.com",
        password: "wrong-pw",
      }),
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("不存在的邮箱应返回 401", async () => {
    const res = await loginPost(
      makeReq("POST", {
        email: "ghost@test.com",
        password: "anything",
      }),
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("邮箱格式错误应返回 400", async () => {
    const res = await loginPost(
      makeReq("POST", {
        email: "bad-email",
        password: "pw",
      }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});

describe("Auth API – logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("未登录时登出应成功（无 session）", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await logoutPost();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockDestroySession).not.toHaveBeenCalled();
    expect(mockClearSessionCookie).toHaveBeenCalledOnce();
  });

  it("已登录时登出应销毁 session", async () => {
    mockGetSession.mockResolvedValue({
      sessionId: "test-sid",
      userId: "test-uid",
      email: "test@test.com",
      name: "测试",
    });
    const res = await logoutPost();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockDestroySession).toHaveBeenCalledWith("test-sid");
    expect(mockClearSessionCookie).toHaveBeenCalledOnce();
  });
});

describe("Auth API – user profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应返回已存在的用户", async () => {
    mockFindUnique.mockImplementation(
      (args: { where: { id?: string; email?: string } }) => {
        if (args.where?.id === "user-1") {
          return Promise.resolve({
            id: "user-1",
            email: "user1@test.com",
            name: "用户1",
            password: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      },
    );

    const req = new Request("http://localhost/api/auth/user-1");
    const res = await userGet(req, {
      params: Promise.resolve({ userid: "user-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("user-1");
    expect(json.data.email).toBe("user1@test.com");
  });

  it("不存在时自动创建（hackathon demo 模式）", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockImplementation(
      (args: {
        data: { id: string; email: string; name: string; password: string };
      }) =>
        Promise.resolve({
          id: args.data.id,
          email: args.data.email,
          name: args.data.name,
          password: args.data.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    );

    const req = new Request("http://localhost/api/auth/auto-user");
    const res = await userGet(req, {
      params: Promise.resolve({ userid: "auto-user" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("auto-user");
    expect(json.data.email).toBe("auto-user@gisfy.local");
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("缺少 userid 应返回 400", async () => {
    const req = new Request("http://localhost/api/auth/");
    const res = await userGet(req, {
      params: Promise.resolve({ userid: "" }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
