import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string().required('Username wajib diisi'),
  password: yup.string().min(8).required('Password wajib diisi'),
});
