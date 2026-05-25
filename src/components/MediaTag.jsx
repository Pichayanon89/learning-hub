import { typeConfig } from '../data/mockData';

export default function MediaTag({ item }) {
  const config = typeConfig[item.type];
  if (!config) return null;
  const Icon = config.Icon;

  return (
    <span className={`media-tag ${config.tone}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}
