import { useEffect, useState } from 'react';

function readCalendarYear(): number {
  return new Date().getFullYear();
}

/**
 * Ano civil atual, sempre alinhado à data do dispositivo.
 * Revalida em intervalo curto para que, com a página aberta na virada do ano, o rodapé atualize sem recarregar.
 */
export function useCurrentYear(): number {
  const [year, setYear] = useState(readCalendarYear);

  useEffect(() => {
    const sync = () => {
      const next = readCalendarYear();
      setYear((previous) => (next !== previous ? next : previous));
    };

    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return year;
}
