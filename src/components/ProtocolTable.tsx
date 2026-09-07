import { CLIENT_MESSAGES, SERVER_MESSAGES } from '@/content/projects/switchboard';

export function ProtocolTable() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div>
        <h4 className="font-mono text-t-xs text-muted m-0">ClientMessage · 5</h4>
        <ul className="mt-3 font-mono text-t-sm text-light list-none p-0 m-0 flex flex-col gap-2">
          {CLIENT_MESSAGES.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-mono text-t-xs text-muted m-0">ServerMessage · 7</h4>
        <ul className="mt-3 font-mono text-t-sm text-light list-none p-0 m-0 flex flex-col gap-2">
          {SERVER_MESSAGES.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
