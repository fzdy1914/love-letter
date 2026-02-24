interface ErrorMessageProps {
  type: 'wrong-password' | 'not-found' | 'missing-params' | 'corrupted' | 'generic';
  message?: string;
}

const messages: Record<ErrorMessageProps['type'], { title: string; body: string }> = {
  'wrong-password': {
    title: '密码不对哦',
    body: '密码似乎不正确，请检查你收到的链接后再试一次。',
  },
  'not-found': {
    title: '找不到这封信',
    body: '我们没有找到这封情书，请确认链接是否正确。',
  },
  'missing-params': {
    title: '链接不完整',
    body: '看起来链接缺少了一些信息。阅读情书需要完整的信件编号和密码。',
  },
  corrupted: {
    title: '出了点问题',
    body: '信件文件似乎已损坏，请联系发送者获取新的链接。',
  },
  generic: {
    title: '出了点问题',
    body: '发生了意外错误，请刷新页面重试。',
  },
};

export function ErrorMessage({ type, message }: ErrorMessageProps) {
  const { title, body } = messages[type];
  return (
    <div className="error-container">
      <div className="error-icon">💌</div>
      <h2>{title}</h2>
      <p>{message || body}</p>
    </div>
  );
}
