import { useMemo, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { grades, typeConfig } from '../data/mockData';
import MediaArtwork from '../components/MediaArtwork';
import MediaTag from '../components/MediaTag';

import { useMediaStorage } from '../hooks/useMediaStorage';

export default function Categories() {
  const { mediaItems, isLoaded } = useMediaStorage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('query') || '';
  const activeGrade = searchParams.get('grade') || 'all';
  const activeType = searchParams.get('type') || 'all';

  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQuery(query);
  }, [query]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ query: localQuery });
  };

  const filteredMedia = useMemo(() => {
    if (!isLoaded) return [];
    const normalized = query.trim().toLowerCase();
    
    return mediaItems.filter((item) => {
      if (!item.isPublished) return false;
      const matchesGrade = activeGrade === 'all' || item.grade === activeGrade;
      const matchesType = activeType === 'all' || item.type === activeType;
      const haystack = `${item.title} ${item.description} ${item.subject} ${item.gradeLabel} ${typeConfig[item.type]?.label || ''} ${item.tags || ''}`.toLowerCase();
      return matchesGrade && matchesType && haystack.includes(normalized);
    });
  }, [isLoaded, mediaItems, activeGrade, activeType, query]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <section className="grade-section" aria-labelledby="grade-title">
        <div className="section-heading">
          <div>
            <h2 id="grade-title">เลือกชั้นปี</h2>
            <p>ค้นหาสื่อการเรียนรู้ที่เหมาะกับชั้นปีของคุณ</p>
          </div>
          
          <form className="search-box category-search" onSubmit={handleSearchSubmit}>
            <Search size={18} />
            <input
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="ค้นหาสื่อ..."
            />
          </form>
        </div>

        <div className="grade-grid">
          {grades.map(({ id, label, helper, color, Icon }) => (
            <button
              className={`grade-card ${color} ${activeGrade === id ? 'active' : ''}`}
              type="button"
              key={id}
              onClick={() => updateParams({ grade: id })}
            >
              <span className="grade-icon">
                <Icon size={28} />
              </span>
              <strong>{label}</strong>
              <small>{helper}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="library-section">
        <div className="section-heading with-controls">
          <div>
            <h2>ผลการค้นหา {filteredMedia.length} รายการ</h2>
          </div>

          <div className="type-filters" aria-label="กรองประเภทสื่อ">
            <button className={activeType === 'all' ? 'active' : ''} type="button" onClick={() => updateParams({ type: 'all' })}>
              ทั้งหมด
            </button>
            {Object.entries(typeConfig).map(([id, config]) => (
              <button
                className={activeType === id ? 'active' : ''}
                type="button"
                key={id}
                onClick={() => updateParams({ type: id })}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div className="media-rail category-results">
          {filteredMedia.length > 0 ? (
            <div className="category-grid">
              {filteredMedia.map((item) => (
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
      </section>
    </>
  );
}
