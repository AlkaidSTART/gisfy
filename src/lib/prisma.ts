// ⚠️ 已废弃 — 使用 src/lib/supabase-db.ts 替代
// 保留此文件仅为兼容旧 import，所有数据库操作请改用 supabaseDb
import supabaseDb from "@/lib/supabase-db";
export { supabaseDb as prisma };
