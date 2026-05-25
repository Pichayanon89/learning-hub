import { useNavigate } from 'react-router-dom';
import { scienceStickers } from '../assets';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <img src={scienceStickers} alt="" className="not-found-art" />
      <h2>404 - ไม่พบหน้าที่คุณค้นหา</h2>
      <p>หน้าเว็บนี้อาจถูกลบ หรือคุณอาจพิมพ์ URL ผิดครับ</p>
      <button className="primary-cta" onClick={() => navigate('/')}>
        กลับสู่หน้าหลัก
      </button>
    </div>
  );
}
