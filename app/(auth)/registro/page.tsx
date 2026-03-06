import { RegisterForm } from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
