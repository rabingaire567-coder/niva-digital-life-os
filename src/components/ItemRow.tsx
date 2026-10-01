import { Link } from 'react-router-dom';
import type { LifeItem } from '@/types';
import { countdown, formatDate, urgencyFor } from '@/lib/date';
import { CATEGORY_ICON, CATEGORY_LABEL, JURISDICTION_LABEL } from '@/lib/knowledge';

export function UrgencyBadge({ item }: { item: LifeItem }) {
  const u = urgencyFor(item);
  return (
    <span className={`badge ${u.level === 'overdue' ? 'red' : u.level}`} title={`${formatDate(item.due)} · ${countdown(item)}`}>
      {u.label}
    </span>
  );
}

export default function ItemRow({ item, onOpen }: { item: LifeItem; onOpen?: () => void }) {
  const u = urgencyFor(item);
  const done = item.status === 'done';
  const body = (
    <>
      <span className="qrail" style={{ background: done ? 'var(--line-strong)' : u.color }} />
      <span className="qemoji" aria-hidden="true">
        {CATEGORY_ICON[item.category] ?? '•'}
      </span>
      <span className="qmain">
        <span className="qtitle">{item.title}</span>
        <span className="qmeta">
          <span>{CATEGORY_LABEL[item.category]}</span>
          <span className="qdot">·</span>
          <span>{JURISDICTION_LABEL[item.jurisdiction]}</span>
          {item.issuer ? (
            <>
              <span className="qdot">·</span>
              <span>{item.issuer}</span>
            </>
          ) : null}
          {item.source === 'ai' ? (
            <>
              <span className="qdot">·</span>
              <span className="badge brand" style={{ fontSize: '0.66rem', padding: '1px 7px' }}>AI captured</span>
            </>
          ) : null}
        </span>
      </span>
      <span className="qwhen" style={{ '--tone': done ? 'var(--text-3)' : u.color } as React.CSSProperties}>
        {done ? 'Done' : countdown(item)}
        <small>{formatDate(item.due, 'short')}</small>
      </span>
    </>
  );

  const cls = `qitem${done ? ' is-done' : ''}`;

  if (onOpen) {
    return (
      <button type="button" className={cls} onClick={onOpen} style={{ '--tone': u.color } as React.CSSProperties}>
        {body}
      </button>
    );
  }
  return (
    <Link to={`/item/${item.id}`} className={cls} style={{ '--tone': u.color } as React.CSSProperties}>
      {body}
    </Link>
  );
}
