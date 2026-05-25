import { Mail, MessageCircle, Phone } from 'lucide-react';
import { teacherHero } from '../assets';

export default function Contact() {
  return (
    <section className="contact-section contact-page" id="contact">
      <div className="contact-wrapper">
        <div className="contact-visual">
          <img src={teacherHero} alt="ครูพิชญานนท์ วัจนสุนทร" className="contact-portrait-img" />
        </div>
        
        <div className="contact-info">
          <h2>ติดต่อสอบถาม</h2>
          <p className="contact-description">
            หากมีข้อสงสัยเกี่ยวกับสื่อการเรียนรู้ หรือต้องการสอบถามรายละเอียดเพิ่มเติม 
            สามารถติดต่อครูพิชญานนท์ได้โดยตรงตามช่องทางออนไลน์ด้านล่างนี้ครับ ยินดีให้บริการทุกคำถามครับ
          </p>
          
          <div className="contact-container">
            <a className="contact-button" href="mailto:pichayanon@udonthani3.go.th">
              <Mail size={18} />
              <span>pichayanon@udonthani3.go.th</span>
            </a>
            <a className="contact-button contact-button-fb" href="https://www.facebook.com/krupichayanon" target="_blank" rel="noreferrer">
              <MessageCircle size={18} />
              <span>เพจ ครูพิชญานนท์</span>
            </a>
            <a className="contact-button contact-button-line" href="tel:0899374390">
              <Phone size={18} />
              <span>0899374390</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
