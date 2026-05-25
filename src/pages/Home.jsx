import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MediaRail from '../components/MediaRail';
import { useMediaStorage } from '../hooks/useMediaStorage';
import { teacherHero, scienceBanner, scienceStickers, IconPlay } from '../assets';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { mediaItems, isLoaded } = useMediaStorage();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/categories?query=${encodeURIComponent(query)}`);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  const publishedMedia = mediaItems.filter(m => m.isPublished);
  const latestMedia = [...publishedMedia].sort((a, b) => (b.id || 0) - (a.id || 0));
  const newMedia = publishedMedia.filter(m => m.new);
  const popularMedia = publishedMedia.filter(m => m.popular);
  const featuredMedia = publishedMedia.filter(m => m.featured);

  return (
    <>
      <section className="hero-section" id="home">
        <img src={scienceBanner} alt="" className="hero-background-img" />
        <img src={scienceStickers} alt="" className="hero-stickers" />
        
        <div className="hero-copy relative-z2">
          <h1>ยินดีต้อนรับสู่คลังความรู้แสนสนุกครับเด็กๆ!</h1>
          <p>
            รวมสื่อการเรียนจริงของห้อง ป.4/2 ปีการศึกษา 2569 ทั้ง STEM
            คณิตสืบเสาะ วิทยาการคอมพิวเตอร์ และการงานอาชีพ
          </p>

          <form className="search-box" onSubmit={handleSearch}>
            <Search size={22} />
            <input
              id="media-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาสื่อ ใบงาน หรือบทเรียน"
            />
          </form>

          <div className="hero-actions">
            {publishedMedia.length > 0 && (
              <>
                <button className="primary-cta" type="button" onClick={() => navigate(`/media/${publishedMedia[0].id}`)}>
                  <IconPlay size={20} />
                  เริ่มบทเรียนแนะนำ
                </button>
                <button className="secondary-cta" type="button" onClick={() => navigate('/categories')}>
                  ดูสื่อทั้งหมด
                </button>
              </>
            )}
          </div>
        </div>

        <div className="hero-visual relative-z2" aria-label="ภาพประกอบครูพิชญานนท์และสื่อวิทยาศาสตร์">
          <img src={teacherHero} alt="Teacher" />
          <div className="hero-note">
            <strong>คลังสื่อ ป.4/2</strong>
            <span>สื่อจริง ป.4/2 ปีการศึกษา 2569</span>
          </div>
        </div>
      </section>

      <section className="library-section" id="library">
        <div className="section-heading">
          <div>
            <h2>สื่อแนะนำประจำสัปดาห์</h2>
            <p>ค้นหาและเริ่มเรียนรู้กับสื่อที่คัดสรรมาเป็นพิเศษ</p>
          </div>
        </div>

        <MediaRail title="เพิ่มล่าสุด" items={latestMedia} />
        <MediaRail title="มาใหม่" items={newMedia} />
        <MediaRail title="ยอดนิยม" items={popularMedia} />
        <MediaRail title="เหมาะกับคาบเรียนนี้" items={featuredMedia} />
      </section>
    </>
  );
}
