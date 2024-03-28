import { Eye, EyeOff } from 'lucide-react';

export default function PasswordVisibleButton({ isVisible, setIsVisible }) {
  return (
    <button
      type='button'
      className='focus:outline-none'
      onClick={() => setIsVisible(!isVisible)}
    >
      {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
    </button>
  );
}
