import { Icon } from '@iconify/react';

export default function PasswordVisibleButton({ isVisible, setIsVisible }) {
  return (
    <button
      type='button'
      className='focus:outline-none'
      onClick={() => setIsVisible(!isVisible)}
    >
      {isVisible ? (
        <Icon icon='lucide:eye' fontSize='1.5rem' />
      ) : (
        <Icon icon='lucide:eye-off' fontSize='1.5rem' />
      )}
    </button>
  );
}
