import { useAuthStore } from '@/features/auth/store';
import { useNavigate } from 'react-router';
import { performLogout } from '@/features/auth/session';
import { Button } from '@/shared/ui/button';

const EditorPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const onLogout = async () => {
    await performLogout();
    navigate('/signin');
  };

  return (
    <div>
      {user?.name ?? ''}
      <Button onClick={onLogout}>Log out</Button>
    </div>
  );
};

export { EditorPage };
