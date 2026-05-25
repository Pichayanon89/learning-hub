import { ExternalLink } from 'lucide-react';
import { teacherHero, scienceBanner } from '../assets';

export default function About() {
  return (
    <section className="teacher-section teacher-page" id="teacher">
      <img src={scienceBanner} alt="" className="section-background-img" />
      <div className="teacher-page-content">
        <img src={teacherHero} alt="Teacher" className="teacher-portrait" />
        <div>
          <h2>นายพิชญานนท์ วัจนสุนทร</h2>
          <h4 style={{ color: 'var(--text-light)', marginBottom: '16px' }}>ครูชำนาญการ กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</h4>
          <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, marginBottom: '20px' }}>
            โรงเรียนอนุบาลหนองหานวิทยายน สำนักงานเขตพื้นที่การศึกษาประถมศึกษาอุดรธานี เขต 3<br />
            <strong>ประสบการณ์ราชการ:</strong> 8 ปี | <strong>ครูที่ปรึกษา:</strong> ป.4/2 SMT
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span className="media-tag" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>ICT Teacher</span>
            <span className="media-tag" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>Computational Thinking</span>
            <span className="media-tag" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>Digital Learning</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <a 
              href="https://pichayanon89.github.io/e-portfolio/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="primary-cta"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <ExternalLink size={18} />
              เข้าชมแฟ้มผลงานออนไลน์ (E-Portfolio)
            </a>
          </div>
        </div>
        <div className="teacher-points">
          <span>ครูผู้สอนวิชาวิทยาศาสตร์และเทคโนโลยี</span>
          <span>ห้องเรียนพิเศษ ป.4/2 SMT</span>
          <span>ปีการศึกษา 2568</span>
        </div>
      </div>
    </section>
  );
}
