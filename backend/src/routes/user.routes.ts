import { Router } from 'express';
import {
  getListUserController,
  getUserController,
  createUserController,
  updateUserController,
  updateUserPasswordController,
  deleteUserController,
  exportUserCSVController,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get list user with filter, pagination, dan sorting
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Halaman yang ingin diambil
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan username atau nama
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter berdasarkan peran pengguna
 *       - in: query
 *         name: createdFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tanggal dibuat dari
 *       - in: query
 *         name: createdTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tanggal dibuat sampai
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [username, name, role, createdAt, updatedAt]
 *         description: Kolom untuk sorting
 *       - in: query
 *         name: sortDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Arah sorting
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         totalData: { type: integer }
 *                         totalPage: { type: integer }
 *                         currentPage: { type: integer }
 *                         perPage: { type: integer }
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer }
 *                           username: { type: string }
 *                           name: { type: string }
 *                           role: { type: string }
 *                           createdAt: { type: string, format: date-time }
 *       400:
 *         description: Validasi input gagal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 validations:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 */
router.get('/', authenticate, authorize(['admin', 'user']), getListUserController);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user detail by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User detail
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, authorize(['admin', 'user']), getUserController);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *               - confirm_password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 100
 *               username:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 100
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *               confirm_password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Invalid input
 */

router.post('/', authenticate, authorize(['admin']), createUserController);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticate, authorize(['admin', 'user']), updateUserController);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user (admin only)
 *     description: |
 *       Only admin can delete other users. Admin must confirm their own password.
 *       Cannot delete self. Soft delete is applied by setting `deletedAt: true`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirm_password
 *             properties:
 *               confirm_password:
 *                 type: string
 *                 example: RahasiaAdmin123
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, authorize(['admin']), deleteUserController);

/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Update password by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put('/:id/password', authenticate, authorize(['admin']), updateUserPasswordController);

/**
 * @swagger
 * /api/users/export/csv:
 *   get:
 *     tags: [Users]
 *     summary: Export list user to CSV
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: createdFrom
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: createdTo
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [username, name, role, createdAt, updatedAt] }
 *       - in: query
 *         name: sortDir
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: File CSV berhasil dihasilkan
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */

router.get('/export/csv', authenticate, authorize(['admin', 'user']), exportUserCSVController);

export default router;
