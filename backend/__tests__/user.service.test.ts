import {
  getListUserService,
  getUserDetailService,
  createUserService,
  updateUserService,
  updateUserPasswordService,
  deleteUserService,
  exportUserCSVService,
} from '../src/services/user.service';

import * as userRepo from '../src/repositories/user.repo';
import * as auditRepo from '../src/repositories/audit.repo';
import * as validation from '../src/validations/user.validation';
import { redis } from '../src/utils/redisClient';
import bcrypt from 'bcryptjs';
import { stringify } from 'csv-stringify/sync';

jest.mock('../src/repositories/user.repo');
jest.mock('../src/repositories/audit.repo');
jest.mock('../src/utils/redisClient', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock('csv-stringify/sync', () => ({
  stringify: jest.fn(),
}));
jest.mock('../src/validations/user.validation', () => ({
  getUserListSchema: { safeParse: jest.fn() },
  createUserSchema: { safeParse: jest.fn() },
  updateUserSchema: { safeParse: jest.fn() },
  updateUserPasswordSchema: { safeParse: jest.fn() },
  deleteUserSchema: { safeParse: jest.fn() },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getListUserService
  it('should return cached user list if available', async () => {
    (validation.getUserListSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { page: 1, limit: 10 },
    });
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify({ cached: true }));

    const result = await getListUserService({ page: 1, limit: 10 });
    expect(result.success).toBe(true);
    expect(result.data.cached).toBe(true);
  });

  it('should return validation error for user list', async () => {
    (validation.getUserListSchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: { issues: [{ path: ['page'], message: 'Invalid page' }] },
    });

    const result = await getListUserService({});
    expect(result.success).toBe(false);
    expect(result.validations?.page).toBe('Invalid page');
  });

  // getUserDetailService
  it('should return cached user detail if available', async () => {
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify({ id: 1, name: 'Cached User' }));

    const result = await getUserDetailService('1');
    expect(result.name).toBe('Cached User');
  });

  it('should fetch user from DB if cache is missing', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    (userRepo.getUserByIdFromDB as jest.Mock).mockResolvedValue({ id: 1, name: 'DB User' });

    const result = await getUserDetailService('1');
    expect(result.id).toBe(1);
    expect(redis.set).toHaveBeenCalled();
  });

  // createUserService
  it('should return validation error if input is invalid', async () => {
    (validation.createUserSchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: { issues: [{ path: ['username'], message: 'Username must be at least 4 characters' }] },
    });

    const result = await createUserService({}, 99);
    expect(result.success).toBe(false);
    expect(result.validations?.username).toBe('Username must be at least 4 characters');
  });

  it('should return error if username is taken', async () => {
    const body = { name: 'John', username: 'john', password: '123', role: 'user' };
    (validation.createUserSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: body });
    (userRepo.isUsernameTaken as jest.Mock).mockResolvedValue(true);

    const result = await createUserService(body, 99);
    expect(result.success).toBe(false);
    expect(result.validations?.username).toBe('Username is already taken');
  });

  it('should create user successfully', async () => {
    const body = { name: 'John', username: 'john', password: '123', role: 'user' };
    (validation.createUserSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: body });
    (userRepo.isUsernameTaken as jest.Mock).mockResolvedValue(false);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (userRepo.createUserToDB as jest.Mock).mockResolvedValue({ id: 1, ...body, passwordHash: 'hashed' });

    const result = await createUserService(body, 99);
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
    expect(result.data).not.toBeNull();
    expect(result.data).not.toBeUndefined();
  });

  // updateUserService
  it('should reject role update by non-admin', async () => {
    (validation.updateUserSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { role: 'admin' },
    });

    const result = await updateUserService(1, { id: 1, role: 'user' }, { role: 'admin' });
    expect(result.success).toBe(false);
    expect(result.validations?.role).toBe('Only admin can change role');
  });

  it('should reject update if non-admin tries to update another user', async () => {
    (validation.updateUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { name: 'New Name' },
    });

    const requester = { id: 1, role: 'user' }; // bukan admin
    const targetUserId = 2; // berbeda dengan requester.id

    const result = await updateUserService(targetUserId, requester, { name: 'New Name' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Forbidden: You can only update your own profile');
  });

  it('should return validation error on updateUserService', async () => {
    (validation.updateUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: { issues: [{ path: ['username'], message: 'Invalid username' }] },
    });

    const result = await updateUserService(1, { id: 1, role: 'admin' }, {});
    expect(result.success).toBe(false);
    expect(result.validations?.username).toBe('Invalid username');
  });

  it('should return error if target user not found', async () => {
    (validation.updateUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { username: 'newuser' },
    });
    (userRepo.getUserByIdFromDB as jest.Mock).mockResolvedValue(null);

    const result = await updateUserService(1, { id: 1, role: 'admin' }, { username: 'newuser' });
    expect(result.success).toBe(false);
    expect(result.message).toBe('User not found or deleted');
  });

  it('should reject password update if non-admin tries to update another user', async () => {
    (validation.updateUserPasswordSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { password: 'newpass123' },
    });

    const requester = { id: 1, role: 'user' }; // bukan admin
    const targetUserId = 2; // berbeda dengan requester.id

    const result = await updateUserPasswordService(targetUserId, requester, { password: 'newpass123' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Forbidden: You can only update your own password');
  });


  // updateUserPasswordService
  it('should update password successfully', async () => {
    (validation.updateUserPasswordSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { password: 'newpass' },
    });
    (userRepo.getUserByIdFromDB as jest.Mock).mockResolvedValue({ id: 1 });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (userRepo.updateUserPasswordInDB as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await updateUserPasswordService(1, { id: 1, role: 'user' }, { password: 'newpass' });
    expect(result.success).toBe(true);
  });

  // deleteUserService
  it('should reject delete if admin password is incorrect', async () => {
    (validation.deleteUserSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { confirm_password: 'wrongpass' },
    });
    (userRepo.getActiveUserById as jest.Mock).mockResolvedValue({ id: 2 });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await deleteUserService(2, { id: 1, role: 'admin', passwordHash: 'hashed' }, { confirm_password: 'wrongpass' });
    expect(result.success).toBe(false);
    expect(result.validations?.confirm_password).toBe('Incorrect admin password');
  });

  it('should return validation error on deleteUserService', async () => {
    (validation.deleteUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: { issues: [{ path: ['confirm_password'], message: 'Required' }] },
    });

    const result = await deleteUserService(2, { id: 1, role: 'admin', passwordHash: 'hashed' }, {});
    expect(result.success).toBe(false);
    expect(result.validations?.confirm_password).toBe('Required');
  });

  it('should prevent admin from deleting themselves', async () => {
    (validation.deleteUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { confirm_password: '123' },
    });

    const result = await deleteUserService(1, { id: 1, role: 'admin', passwordHash: 'hashed' }, { confirm_password: '123' });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/cannot delete yourself/);
  });


  // exportUserCSVService
  it('should throw error if export input is invalid', async () => {
    (validation.getUserListSchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: { issues: [] },
    });

    await expect(exportUserCSVService({})).rejects.toThrow('Invalid input');
  });

  it('should export user list as CSV buffer', async () => {
    (validation.getUserListSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: {} });
    (userRepo.getListUserFromDB as jest.Mock).mockResolvedValue({
      users: [{ id: 1, username: 'john', name: 'John', role: 'user', createdAt: new Date() }],
    });
    (stringify as jest.Mock).mockReturnValue('id,username,name,role,createdAt\n1,john,John,user,2025-09-14');

    const result = await exportUserCSVService({});
    expect(result).toBeInstanceOf(Buffer);
  });
});
