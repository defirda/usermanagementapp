import { redis } from '../utils/redisClient';
import { stringify } from 'csv-stringify/sync';
import {
  getUserListSchema,
  createUserSchema,
  updateUserSchema,
  updateUserPasswordSchema,
  deleteUserSchema,
} from '../validations/user.validation';
import {
  getListUserFromDB,
  getUserByIdFromDB,
  isUsernameTaken,
  createUserToDB,
  updateUserInDB,
  getActiveUserById,
  updateUserPasswordInDB,
  softDeleteUserById,
} from '../repositories/user.repo';
import { logAudit } from '../repositories/audit.repo';
import bcrypt from 'bcryptjs';

type User = {
  id: number;
  username: string;
  name: string;
  role: string;
  createdAt: Date;
};

export async function getListUserService(rawQuery: any) {
  const TTL = 60;
  const result = getUserListSchema.safeParse(rawQuery);
  const errors: Record<string, string> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors[field] = issue.message;
    }
    return { success: false, validations: errors };
  }

  const query = result.data;
  const cacheKey = `list:${JSON.stringify(query)}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return {
      success: true,
      data: parsed,
    };
  }

  const { users, totalData } = await getListUserFromDB(query);
  const totalPage = Math.ceil(totalData / query.limit);

  const listUser = {
    metadata: {
      totalData,
      totalPage,
      currentPage: query.page,
      perPage: query.limit,
    },
    data: users,
  };

  if (listUser && listUser.data?.length > 0) {
    await redis.set(cacheKey, JSON.stringify(listUser), {
      EX: TTL,
      NX: true, // hanya set jika belum ada (opsional)
    });
  }
  return {
    success: true,
    data: listUser,
  };
}

export async function getUserDetailService(id: string) {
  const TTL = 60;
  const numericId = parseInt(id, 10);
  const cacheKey = `user:${numericId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const user = await getUserByIdFromDB(numericId);
  if (user) await redis.set(cacheKey, JSON.stringify(user), { EX: TTL });

  return user;
}

export async function createUserService(body: any, createdBy: number) {
  const result = createUserSchema.safeParse(body);
  const errors: Record<string, string> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors[field] = issue.message;
    }
    return { success: false, validations: errors };
  }

  const { name, username, password, role } = result.data;

  const taken = await isUsernameTaken(username);
  if (taken) {
    errors.username = 'Username is already taken';
    return { success: false, validations: errors };
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await createUserToDB({
    name,
    username,
    passwordHash: hashed,
    role,
    createdBy,
  });

  await logAudit({
    actorId: createdBy,
    entity: 'users',
    entityId: newUser.id,
    action: 'create',
    before: null,
    after: newUser,
  });

  return { success: true, data: newUser };
}

export async function updateUserService(
  targetUserId: number,
  requester: { id: number; role: string },
  body: any
) {
  const result = updateUserSchema.safeParse(body);
  const errors: Record<string, string> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors[field] = issue.message;
    }
    return { success: false, validations: errors };
  }

  const data = result.data;

  // RBAC: user hanya boleh ubah dirinya sendiri
  if (requester.role !== 'admin' && requester.id !== targetUserId) {
    return { success: false, message: 'Forbidden: You can only update your own profile' };
  }

  // Non-admin tidak boleh ubah role
  if (requester.role !== 'admin' && 'role' in data) {
    errors.role = 'Only admin can change role';
    return { success: false, validations: errors };
  }

  // Cek user target aktif
  const targetUser = await getUserByIdFromDB(targetUserId);
  if (!targetUser) {
    return { success: false, message: 'User not found or deleted' };
  }

  // Cek username duplikat
  if (data.username && data.username !== targetUser.username) {
    const taken = await isUsernameTaken(data.username);
    if (taken) {
      errors.username = 'Username is already taken';
      return { success: false, validations: errors };
    }
  }

  const updated = await updateUserInDB(targetUserId, data);
  await logAudit({
    actorId: requester.id,
    entity: 'users',
    entityId: targetUserId,
    action: 'update',
    before: targetUser,
    after: updated,
  });

  return { success: true, data: updated };
}

export async function updateUserPasswordService(
  targetUserId: number,
  requester: { id: number; role: string },
  body: any
) {
  const result = updateUserPasswordSchema.safeParse(body);
  const errors: Record<string, string> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors[field] = issue.message;
    }
    return { success: false, validations: errors };
  }

  const { password } = result.data;

  // RBAC: user hanya boleh ubah dirinya sendiri
  if (requester.role !== 'admin' && requester.id !== targetUserId) {
    return { success: false, message: 'Forbidden: You can only update your own password' };
  }

  // Cek user target aktif
  const targetUser = await getUserByIdFromDB(targetUserId);
  if (!targetUser) {
    return { success: false, message: 'User not found or deleted' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const updated = await updateUserPasswordInDB(targetUserId, hashedPassword);
  await logAudit({
    actorId: requester.id,
    entity: 'users',
    entityId: targetUserId,
    action: 'update',
    before: null,
    after: { passwordHash: true },
  });

  return { success: true, data: updated };
}

export async function deleteUserService(
  targetUserId: number,
  requester: { id: number; role: string; passwordHash: string },
  body: any
) {
  const result = deleteUserSchema.safeParse(body);
  const errors: Record<string, string> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { success: false, validations: errors };
  }

  if (requester.role !== 'admin') {
    return { success: false, message: 'Forbidden: Only admin can delete users' };
  }

  if (requester.id === targetUserId) {
    return { success: false, message: 'You cannot delete yourself' };
  }

  const targetUser = await getActiveUserById(targetUserId);
  if (!targetUser) {
    return { success: false, message: 'User not found or already deleted' };
  }

  const match = await bcrypt.compare(result.data.confirm_password, requester.passwordHash);
  if (!match) {
    errors.confirm_password = 'Incorrect admin password';
    return { success: false, validations: errors };
  }

  const before = await getUserByIdFromDB(requester.id);

  await softDeleteUserById(targetUserId);

  await logAudit({
    actorId: requester.id,
    entity: 'users',
    entityId: requester.id,
    action: 'delete',
    before,
    after: { deletedAt: new Date() },
  });

  return {
    success: true,
    message: 'User deleted successfully',
    data: { id: targetUserId },
  };
}

export async function exportUserCSVService(rawQuery: any) {
  const result = getUserListSchema.safeParse(rawQuery);
  if (!result.success) {
    throw new Error('Invalid input');
  }

  const query = result.data;
  const { users } = await getListUserFromDB(query);

  const records = users.map((user: User) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }));

  const csv = stringify(records, {
    header: true,
    columns: ['id', 'username', 'name', 'role', 'createdAt'],
  });

  return Buffer.from(csv);
}
