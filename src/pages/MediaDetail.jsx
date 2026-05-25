import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMediaStorage } from '../hooks/useMediaStorage';
import MediaArtwork from '../components/MediaArtwork';
import MediaTag from '../components/MediaTag';
import { IconPlay, IconDownload } from '../assets';
import { Award, ArrowRight, RotateCcw, Check, X, BookOpen } from 'lucide-react';

export default function MediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMediaById, isLoaded } = useMediaStorage();

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (!isLoaded) return <div>Loading...</div>;

  const selectedMedia = getMediaById(id);

  if (!selectedMedia) {
    return (
      <section className="detail-section">
        <div className="detail-copy">
          <h2>ไม่พบสื่อที่คุณต้องการ</h2>
          <button className="secondary-cta" onClick={() => navigate('/categories')}>กลับไปหน้ารวมสื่อ</button>
        </div>
      </section>
    );
  }

  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(selectedMedia.fileUrl);
  const formatNumber = (value) => new Intl.NumberFormat('th-TH').format(value);
  const questions = selectedMedia.quizQuestions || [];

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizCompleted(false);
    
    // Smooth scroll to quiz block
    setTimeout(() => {
      document.getElementById('quiz-block')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOptionSelect = (optIndex) => {
    if (showExplanation) return;
    setSelectedOption(optIndex);
    const correct = optIndex === questions[currentQuestionIndex].answer;
    if (correct) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  return (
    <>
      <section className="detail-section" aria-labelledby="detail-title">
        <div className={`preview-frame ${selectedMedia.palette}`}>
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={selectedMedia.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <MediaArtwork item={selectedMedia} />
          )}
        </div>

        <div className="detail-copy">
          <div className="tag-row">
            <MediaTag item={selectedMedia} />
            <span>{selectedMedia.subject}</span>
            <span>{selectedMedia.gradeLabel}</span>
          </div>
          <h2 id="detail-title">{selectedMedia.title}</h2>
          <p>{selectedMedia.description}</p>
          
          {selectedMedia.tags && (
            <p className="detail-tags">
              แท็ก: {selectedMedia.tags}
            </p>
          )}

          <div className="detail-stats">
            <span>{formatNumber(selectedMedia.views)} เข้าชม</span>
            <span>{formatNumber(selectedMedia.downloads)} ดาวน์โหลด</span>
            <span>{selectedMedia.duration}</span>
          </div>

          <div className="detail-actions">
            {selectedMedia.type === 'video' ? (
              <>
                <button 
                  className="primary-cta" 
                  type="button"
                  onClick={() => {
                    if (selectedMedia.fileUrl) {
                      window.open(selectedMedia.fileUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <IconPlay size={20} />
                  เริ่มบทเรียนวิดีโอ
                </button>
                {questions.length > 0 && (
                  <button 
                    className="accent-cta" 
                    type="button"
                    onClick={handleStartQuiz}
                  >
                    🎯 ตะลุยควิซสะสมแต้ม
                  </button>
                )}
              </>
            ) : (
              <>
                <button 
                  className="primary-cta" 
                  type="button"
                  onClick={() => {
                    if (selectedMedia.fileUrl) {
                      window.open(selectedMedia.fileUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <IconDownload size={20} />
                  ดาวน์โหลดสื่อ
                </button>
                {questions.length > 0 && (
                  <button 
                    className="accent-cta" 
                    type="button"
                    onClick={handleStartQuiz}
                  >
                    🎯 ตะลุยควิซสะสมแต้ม
                  </button>
                )}
              </>
            )}
            {selectedMedia.fileUrl && (
              <a href={selectedMedia.fileUrl} target="_blank" rel="noreferrer" className="secondary-cta">
                เปิดไฟล์แนบ
              </a>
            )}
          </div>
        </div>
      </section>

      {questions.length > 0 && (
        <section className="quiz-section" id="quiz-block">
          <div className="quiz-card">
            {!quizStarted && !quizCompleted && (
              <div className="quiz-intro">
                <div className="quiz-icon-badge">🎯</div>
                <h3>เกมควิซทดสอบ: ตะลุยความรู้สะเต็มศึกษา!</h3>
                <p>หลังจากรับชมวิดีโอแนะนำสะเต็มศึกษาของ สสวท. แล้ว มาร่วมตอบคำถามเก็บคะแนนเกียรติยศเพื่อพิสูจน์ความเป็นยอดนักคิดสร้างสรรค์กันเถอะครับ!</p>
                <button className="primary-cta quiz-start-btn" onClick={handleStartQuiz}>
                  เริ่มท้าทายตอบคำถาม 🚀
                </button>
              </div>
            )}

            {quizStarted && !quizCompleted && (
              <div className="quiz-play">
                <div className="quiz-progress-header">
                  <span>คำถามข้อที่ {currentQuestionIndex + 1} จาก {questions.length}</span>
                  <span>คะแนนสะสม: {score} / {questions.length}</span>
                </div>
                <div className="quiz-progress-bar-container">
                  <div 
                    className="quiz-progress-bar" 
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                
                <h3 className="quiz-question-text">{questions[currentQuestionIndex].question}</h3>
                
                <div className="quiz-options-grid">
                  {questions[currentQuestionIndex].options.map((option, idx) => {
                    let optionClass = '';
                    if (showExplanation) {
                      if (idx === questions[currentQuestionIndex].answer) {
                        optionClass = 'correct';
                      } else if (idx === selectedOption) {
                        optionClass = 'wrong';
                      } else {
                        optionClass = 'disabled';
                      }
                    } else if (idx === selectedOption) {
                      optionClass = 'selected';
                    }

                    return (
                      <button
                        key={idx}
                        className={`quiz-option-btn ${optionClass}`}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showExplanation}
                        type="button"
                      >
                        <span className="option-letter">{['ก', 'ข', 'ค', 'ง'][idx]}.</span>
                        <span className="option-text">{option}</span>
                        {showExplanation && idx === questions[currentQuestionIndex].answer && (
                          <Check className="option-status-icon text-success" size={18} />
                        )}
                        {showExplanation && idx === selectedOption && idx !== questions[currentQuestionIndex].answer && (
                          <X className="option-status-icon text-danger" size={18} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="quiz-feedback-box">
                    <div className="feedback-title">
                      {selectedOption === questions[currentQuestionIndex].answer ? (
                        <span className="text-success-bold">🎉 ถูกต้องครับ! เก่งมาก ๆ เลย</span>
                      ) : (
                        <span className="text-danger-bold">💡 ลองทำความเข้าใจใหม่น้า!</span>
                      )}
                    </div>
                    <p className="feedback-explanation">
                      <BookOpen size={16} className="explanation-icon" />
                      {questions[currentQuestionIndex].explanation}
                    </p>
                    <button className="primary-cta quiz-next-btn" onClick={handleNextQuestion}>
                      {currentQuestionIndex + 1 === questions.length ? 'ดูคะแนนสรุป 🏆' : 'คำถามข้อถัดไป'}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {quizCompleted && (
              <div className="quiz-result">
                <Award size={48} className="result-gold-award" />
                <h3>ยินดีด้วย! คุณทำแบบทดสอบเสร็จสมบูรณ์</h3>
                <p className="result-score-text">นักเรียนได้คะแนนสะสม {score} จากทั้งหมด {questions.length} คะแนน</p>
                <div className="xp-gain-badge">ได้รับ +{score * 10} XP</div>
                <div className="badge-title-box">
                  {score === questions.length ? (
                    <span className="rank-label elite">🥇 สายลับสะเต็มระดับยอดฝีมือ (Perfect!)</span>
                  ) : score >= 2 ? (
                    <span className="rank-label professional">🥈 นักประดิษฐ์สะเต็มรุ่นประถมศึกษา</span>
                  ) : (
                    <span className="rank-label novice">🥉 ผู้สำรวจสะเต็มการประยุกต์ความรู้</span>
                  )}
                </div>
                <p className="result-cheer">ขอบคุณนักเรียนที่เข้าร่วมตอบคำถามสะกดความรู้ครับ!</p>
                <button className="secondary-cta quiz-retry-btn" onClick={handleResetQuiz}>
                  <RotateCcw size={16} /> ทำแบบทดสอบใหม่อีกรอบ
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
