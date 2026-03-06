import { redirect } from 'next/navigation';

// La raíz redirige al layout principal
export default function RootPage() {
  redirect('/(main)');
}
