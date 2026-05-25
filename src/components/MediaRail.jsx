import { ChevronRight } from 'lucide-react';
import MediaArtwork from './MediaArtwork';
import MediaTag from './MediaTag';
import { useNavigate } from 'react-router-dom';

export default function MediaRail({ title, items }) {
  const navigate = useNavigate();

  return (
    <div className="media-rail">
      <div className="rail-title">
        <h3>{title}</h3>
        <ChevronRight size={20} />
      </div>
      {items.length > 0 ? (
        <div className="media-row">
          {items.map((item) => (
            <button 
              className="media-card" 
              key={item.id} 
              type="button" 
              onClick={() => navigate(`/media/${item.id}`)}
            >
              <div className={`media-art ${item.palette}`}>
                <MediaArtwork item={item} compact />
              </div>
              <div className="media-body">
                <div className="tag-row">
                  <MediaTag item={item} />
                  <span>{item.gradeLabel}</span>
                </div>
                <h4>{item.title}</h4>
                <p>{item.duration}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">ไม่พบสื่อที่ตรงกับเงื่อนไขนี้</div>
      )}
    </div>
  );
}
