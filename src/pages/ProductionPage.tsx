import { useEffect, useState } from 'react';
import { decrypt } from '../crypto/crypto';
import { LetterDisplay } from '../components/LetterDisplay';
import { LandingMessage } from '../components/LandingMessage';
import { ErrorMessage } from '../components/ErrorMessage';

type PageState =
  | { status: 'landing' }
  | { status: 'missing-params' }
  | { status: 'loading' }
  | { status: 'success'; content: string; letterId: string }
  | { status: 'error'; type: 'wrong-password' | 'not-found' | 'corrupted' | 'generic' };

export function ProductionPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const letterId = params.get('l');
    const password = params.get('p');

    if (!letterId && !password) {
      setState({ status: 'landing' });
      return;
    }

    if (!letterId || !password) {
      setState({ status: 'missing-params' });
      return;
    }

    async function loadAndDecrypt(id: string, pwd: string) {
      try {
        const url = `${import.meta.env.BASE_URL}letters/${encodeURIComponent(id)}.txt`;
        const response = await fetch(url);

        if (!response.ok) {
          setState({ status: 'error', type: 'not-found' });
          return;
        }

        const encryptedText = await response.text();

        if (!encryptedText.trim()) {
          setState({ status: 'error', type: 'not-found' });
          return;
        }

        try {
          const decrypted = await decrypt(encryptedText, pwd);
          setState({ status: 'success', content: decrypted, letterId: id });
        } catch {
          setState({ status: 'error', type: 'wrong-password' });
        }
      } catch {
        setState({ status: 'error', type: 'not-found' });
      }
    }

    loadAndDecrypt(letterId, password);
  }, []);

  // Set letter theme on body for page-level background styling
  useEffect(() => {
    if (state.status === 'success') {
      document.body.dataset.letter = state.letterId;
      return () => { delete document.body.dataset.letter; };
    }
  }, [state]);

  switch (state.status) {
    case 'landing':
      return <LandingMessage />;
    case 'missing-params':
      return <ErrorMessage type="missing-params" />;
    case 'loading':
      return <div className="letter-loading">正在打开你的信...</div>;
    case 'success':
      return <LetterDisplay content={state.content} letterId={state.letterId} />;
    case 'error':
      return <ErrorMessage type={state.type} />;
  }
}
