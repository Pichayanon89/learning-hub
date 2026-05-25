import { typeConfig } from '../data/mockData';

export default function MediaArtwork({ item, compact = false }) {
  const config = typeConfig[item.type];
  if (!config) return null;
  const TypeIcon = config.Icon;

  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(item.fileUrl);
  const coverUrl = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` 
    : item.cover;

  if (coverUrl) {
    return (
      <div className={`cover-artwork ${compact ? 'compact' : ''}`}>
        <img src={coverUrl} alt="" className="cover-artwork-image" />
        <div className="cover-artwork-label">
          <div className="cover-artwork-icon">
            <TypeIcon size={compact ? 18 : 24} />
          </div>
          <div>
            <strong>{item.subject}</strong>
            <span>{item.gradeLabel}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`artwork-content ${compact ? 'compact' : ''}`}>
      <div className="artwork-icon">
        <TypeIcon size={compact ? 26 : 42} />
      </div>
      <strong>{item.subject}</strong>
      <span>{item.gradeLabel}</span>
    </div>
  );
}

