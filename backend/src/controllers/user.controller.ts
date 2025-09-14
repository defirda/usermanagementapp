import { Request, Response } from 'express';
import {
  getListUserService,
  getUserDetailService,
  createUserService,
  updateUserService,
  updateUserPasswordService,
  deleteUserService,
  exportUserCSVService,
} from '../services/user.service';
import { getActiveUserById } from '../repositories/user.repo';

export async function getListUserController(req: Request, res: Response) {
  const result = await getListUserService(req.query);

  if (!result.success) {
    req.log.warn({ requestId: req.requestId }, 'Gagal ambil list data user.');
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      validations: result.validations,
    });
  }

  req.log.info(
    {
      requestId: req.requestId,
    },
    'Berhasil ambil list data user.'
  );
  return res.status(200).json({
    success: true,
    message: 'User list fetched successfully',
    data: result.data,
  });
}

export async function getUserController(req: Request, res: Response) {
  const numericId = parseInt(req.params.id, 10);
  if (isNaN(numericId)) return res.status(400).json({ message: 'Invalid user ID' });

  if (req.user?.role === 'user' && Number(req.user?.id) !== numericId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const user = await getUserDetailService(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  req.log.info(
    {
      requestId: req.requestId,
    },
    'Berhasil ambil data user.'
  );
  return res.status(200).json({
    success: true,
    message: 'Get data successfully',
    data: user,
  });
}

export async function createUserController(req: Request, res: Response) {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Forbidden: Only admin can create users' });
  }

  const result = await createUserService(req.body, Number(req.user.id));

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      validations: result.validations,
    });
  }

  req.log.info(
    {
      requestId: req.requestId,
    },
    'Berhasil membuat data user.'
  );
  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: result.data,
  });
}

export async function updateUserController(req: Request, res: Response) {
  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing user context' });
  }

  const requester = {
    id: Number(req.user.id),
    role: req.user.role,
  };

  const result = await updateUserService(targetId, requester, req.body);

  if (!result.success) {
    const status = result.validations ? 400 : 403;
    return res.status(status).json(result);
  }

  req.log.info(
    {
      requestId: req.requestId,
    },
    'Berhasil update data user.'
  );
  return res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: result.data,
  });
}

export async function updateUserPasswordController(req: Request, res: Response) {
  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing user context' });
  }

  const requester = {
    id: Number(req.user.id),
    role: req.user.role,
  };

  const result = await updateUserPasswordService(targetId, requester, req.body);

  if (!result.success) {
    const status = result.validations ? 400 : 403;
    return res.status(status).json(result);
  }

  req.log.info(
    {
      requestId: req.requestId,
    },
    'Berhasil update data user.'
  );
  return res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    data: result.data,
  });
}

export async function deleteUserController(req: Request, res: Response) {
  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing user context' });
  }

  const requester = await getActiveUserById(Number(req.user.id));
  if (!requester) {
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid admin context' });
  }

  const result = await deleteUserService(targetId, requester, req.body);

  if (!result.success) {
    const status = result.validations ? 400 : 403;
    return res.status(status).json(result);
  }

  req.log.info(
    {
      requestId: req.requestId,
    },
    'Berhasil delete data user.'
  );
  return res.status(200).json(result);
}

export async function exportUserCSVController(req: Request, res: Response) {
  try {
    const csvBuffer = await exportUserCSVService(req.query);

    req.log.info(
      {
        requestId: req.requestId,
      },
      'Berhasil export list data user.'
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csvBuffer);
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Gagal mengekspor data',
    });
  }
}
