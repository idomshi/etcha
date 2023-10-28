export function usePenState() {
  const erase = useState('erase', () => false);
  return {
    erase
  }
}