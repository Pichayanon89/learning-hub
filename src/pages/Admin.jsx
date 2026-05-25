import { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Lock, LogOut, 
  Search, FileText, TrendingUp, Download, Printer 
} from 'lucide-react';
import { useMediaStorage } from '../hooks/useMediaStorage';
import { grades, typeConfig } from '../data/mockData';
import { schoolLogo, teacherOfficial } from '../assets';

export default function Admin() {
  const { mediaItems, isLoaded, addMedia, editMedia, deleteMedia, togglePublish } = useMediaStorage();
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAdminAuth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // States for tab navigation
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'report'

  // States for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000'
      : window.location.origin;

    // Attempt real API login
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAdminAuth', 'true');
        setLoginError('');
        console.log('[PWA API] Successfully logged in via Node.js server authority.');
        return;
      } else {
        setLoginError(data.message || 'รหัสผ่านไม่ถูกต้อง');
        return;
      }
    } catch (err) {
      console.warn('[PWA API] Login API offline, checking local password authority:', err.message);
      // Fallback local authentication
      if (password === 'admin1234') {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAdminAuth', 'true');
        setLoginError('');
      } else {
        setLoginError('รหัสผ่านไม่ถูกต้อง');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAdminAuth');
    setPassword('');
  };

  if (!isLoaded) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">
            <Lock size={40} color="var(--blue)" />
          </div>
          <h2>เข้าสู่ระบบหลังบ้าน</h2>
          <p>กรุณาใส่รหัสผ่านเพื่อจัดการเนื้อหา</p>
          <form onSubmit={handleLogin} className="login-form">
            <input 
              type="password" 
              placeholder="รหัสผ่าน" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoFocus
            />
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="primary-cta login-btn">
              เข้าสู่ระบบ
            </button>
          </form>
          <div className="login-hint">Hint: admin1234</div>
        </div>
      </div>
    );
  }

  const totalViews = mediaItems.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalDownloads = mediaItems.reduce((sum, item) => sum + (item.downloads || 0), 0);

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสื่อนี้? (ไม่สามารถกู้คืนได้)')) {
      deleteMedia(id);
    }
  };

  const formatNumber = (value) => new Intl.NumberFormat('th-TH').format(value);

  const getBadgeClass = (type) => {
    switch (type) {
      case 'video': return 'badge-blue';
      case 'worksheet': return 'badge-green';
      case 'slide': return 'badge-yellow';
      case 'game': return 'badge-coral';
      default: return '';
    }
  };

  // Filtering Logic
  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === '' || item.type === selectedType;
    const matchesGrade = selectedGrade === '' || item.grade === selectedGrade;
    
    return matchesSearch && matchesType && matchesGrade;
  });

  // Sorting Logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'latest') {
      return (b.id || 0) - (a.id || 0);
    }
    if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    if (sortBy === 'downloads') {
      return (b.downloads || 0) - (a.downloads || 0);
    }
    return 0;
  });

  // Calculate dynamic report distributions
  const gradeDistribution = grades.reduce((acc, grade) => {
    acc[grade.id] = { label: grade.label, count: 0, views: 0, downloads: 0 };
    return acc;
  }, {});

  const typeDistribution = Object.keys(typeConfig).reduce((acc, type) => {
    acc[type] = { label: typeConfig[type].label, count: 0, views: 0, downloads: 0 };
    return acc;
  }, {});

  let reportTotalViews = 0;
  let reportTotalDownloads = 0;

  filteredItems.forEach(item => {
    if (gradeDistribution[item.grade]) {
      gradeDistribution[item.grade].count += 1;
      gradeDistribution[item.grade].views += (item.views || 0);
      gradeDistribution[item.grade].downloads += (item.downloads || 0);
    }
    if (typeDistribution[item.type]) {
      typeDistribution[item.type].count += 1;
      typeDistribution[item.type].views += (item.views || 0);
      typeDistribution[item.type].downloads += (item.downloads || 0);
    }
    reportTotalViews += (item.views || 0);
    reportTotalDownloads += (item.downloads || 0);
  });

  // Calculate dynamic data for Visual CSS charts
  const totalCount = filteredItems.length || 1;
  const videoCount = typeDistribution.video?.count || 0;
  const worksheetCount = typeDistribution.worksheet?.count || 0;
  const slideCount = typeDistribution.slide?.count || 0;
  const gameCount = typeDistribution.game?.count || 0;

  const videoPct = Math.round((videoCount / totalCount) * 100);
  const worksheetPct = Math.round((worksheetCount / totalCount) * 100);
  const slidePct = Math.round((slideCount / totalCount) * 100);
  const gamePct = Math.round((gameCount / totalCount) * 100);

  // Find max views for scaling the vertical bar chart (exclude 'all')
  const gradeViews = grades.filter(g => g.id !== 'all').map(g => gradeDistribution[g.id]?.views || 0);
  const maxGradeViews = Math.max(...gradeViews, 1);

  return (
    <section className="admin-panel open" aria-labelledby="admin-title">
      {/* Header and Logout button (Hidden when printing) */}
      <div className="admin-copy admin-heading-row no-print">
        <div>
          <h2 id="admin-title">หลังบ้านครู (ระบบจัดการเนื้อหา)</h2>
          <p>จัดการสื่อการเรียนรู้ แผงสถิติ และจัดพิมพ์สรุปรายงานเสนอราชการ</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary-cta" onClick={handleLogout} title="ออกจากระบบ">
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Hidden when printing) */}
      <div className="admin-tabs no-print">
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          จัดการสื่อการเรียนรู้
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          รายงานการเผยแพร่สื่อ
        </button>
      </div>

      {/* Active Tab rendering */}
      {activeTab === 'manage' ? (
        <>
          {/* TAB 1: Manage Media */}
          {/* Premium Statistics */}
          <div className="admin-stats no-print">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <FileText size={24} />
              </div>
              <div className="stat-info">
                <strong>{mediaItems.length}</strong>
                <span>สื่อการเรียนรู้ทั้งหมด</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <strong>{formatNumber(totalViews)}</strong>
                <span>ยอดเข้าชมรวม</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Download size={24} />
              </div>
              <div className="stat-info">
                <strong>{formatNumber(totalDownloads)}</strong>
                <span>ดาวน์โหลดรวม</span>
              </div>
            </div>
          </div>

          {/* Controls: Search & Filters */}
          <div className="admin-controls no-print">
            <div className="search-wrapper">
              <Search size={18} />
              <input 
                type="text"
                placeholder="ค้นหาชื่อสื่อ หรือคีย์เวิร์ด..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="control-select"
            >
              <option value="">ทุกประเภทสื่อ</option>
              {Object.entries(typeConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="control-select"
            >
              <option value="">ทุกระดับชั้นปี</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="latest">มาใหม่ล่าสุด</option>
              <option value="views">ยอดเข้าชมสูงสุด</option>
              <option value="downloads">ยอดดาวน์โหลดสูงสุด</option>
            </select>

            <button className="primary-cta" onClick={() => setIsAdding(true)}>
              <Plus size={18} /> เพิ่มสื่อใหม่
            </button>
          </div>

          {sortedItems.length === 0 ? (
            <div className="empty-state no-print" style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>ไม่พบข้อมูลสื่อการเรียนรู้ที่ตรงกับเงื่อนไขการค้นหาของคุณ</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--muted)' }}>ลองเปลี่ยนคำค้นหาหรือตัวกรองอื่นเพื่อเริ่มต้นใหม่</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="admin-table-container no-print">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ชื่อสื่อการเรียนรู้</th>
                      <th>ประเภทสื่อ</th>
                      <th>ระดับชั้นปี</th>
                      <th>การเผยแพร่</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="admin-media-cell">
                            <span className="admin-media-title">{item.title}</span>
                            <div className="admin-media-meta">
                              <span><Eye size={13} /> {formatNumber(item.views || 0)} views</span>
                              <span><Download size={13} /> {formatNumber(item.downloads || 0)} downloads</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge ${getBadgeClass(item.type)}`}>
                            {typeConfig[item.type]?.label || item.type}
                          </span>
                        </td>
                        <td>{item.gradeLabel}</td>
                        <td>
                          <button 
                            type="button" 
                            onClick={() => togglePublish(item.id)}
                            className={`publish-toggle-pill ${item.isPublished ? 'is-published' : 'is-hidden'}`}
                          >
                            {item.isPublished ? <><Eye size={14} /> เผยแพร่แล้ว</> : <><EyeOff size={14} /> ซ่อนอยู่</>}
                          </button>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button 
                              type="button" 
                              onClick={() => handleEditClick(item)} 
                              className="admin-btn-action btn-edit"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDelete(item.id)} 
                              className="admin-btn-action btn-delete"
                              title="ลบข้อมูล"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="admin-mobile-list no-print">
                {sortedItems.map(item => (
                  <div key={item.id} className="admin-mobile-card">
                    <div className="mobile-card-header">
                      <h4 className="mobile-card-title">{item.title}</h4>
                      <div className="mobile-card-badges">
                        <span className={`admin-badge ${getBadgeClass(item.type)}`}>
                          {typeConfig[item.type]?.label || item.type}
                        </span>
                        <span className="admin-badge">{item.gradeLabel}</span>
                      </div>
                    </div>
                    
                    <div className="mobile-card-meta">
                      <span><Eye size={14} /> {formatNumber(item.views || 0)} เข้าชม</span>
                      <span><Download size={14} /> {formatNumber(item.downloads || 0)} ดาวน์โหลด</span>
                    </div>
                    
                    <div className="mobile-card-actions">
                      <button 
                        type="button" 
                        onClick={() => togglePublish(item.id)}
                        className={`publish-toggle-pill ${item.isPublished ? 'is-published' : 'is-hidden'}`}
                      >
                        {item.isPublished ? <><Eye size={14} /> เผยแพร่แล้ว</> : <><EyeOff size={14} /> ซ่อนอยู่</>}
                      </button>
                      
                      <div className="admin-actions">
                        <button 
                          type="button" 
                          onClick={() => handleEditClick(item)} 
                          className="admin-btn-action btn-edit"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDelete(item.id)} 
                          className="admin-btn-action btn-delete"
                          title="ลบข้อมูล"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Floating Side Drawer for Add/Edit Form */}
          <div 
            className={`drawer-overlay ${(isAdding || editingItem) ? 'open' : ''}`} 
            onClick={() => {
              setIsAdding(false);
              setEditingItem(null);
            }}
          />
          
          <div className={`drawer-content ${(isAdding || editingItem) ? 'open' : ''}`}>
            <div className="drawer-header">
              <h3>{editingItem ? 'แก้ไขสื่อการเรียนรู้' : 'เพิ่มสื่อการเรียนรู้ใหม่'}</h3>
              <button 
                type="button" 
                className="drawer-close-btn" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                }}
                aria-label="ปิด"
              >
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">
              {(isAdding || editingItem) && (
                <MediaForm 
                  initialData={editingItem} 
                  onSave={(data) => {
                    if (isAdding) {
                      addMedia(data);
                    } else {
                      editMedia(editingItem.id, data);
                    }
                    setIsAdding(false);
                    setEditingItem(null);
                  }}
                  onCancel={() => {
                    setIsAdding(false);
                    setEditingItem(null);
                  }}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* TAB 2: Official Publishing Report */}
          {/* Controls toolbar específicos report (Hidden when printing) */}
          <div className="admin-controls no-print" style={{ marginBottom: '24px' }}>
            <div className="search-wrapper">
              <Search size={18} />
              <input 
                type="text"
                placeholder="ค้นหาชื่อสื่อในรายงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="control-select"
            >
              <option value="">ทุกประเภทสื่อ</option>
              {Object.entries(typeConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="control-select"
            >
              <option value="">ทุกระดับชั้นปี</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>

            <button 
              type="button" 
              className="primary-cta" 
              onClick={() => window.print()}
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
            >
              <Printer size={18} /> พิมพ์รายงาน / Export PDF
            </button>
          </div>

          {/* Printable Official Document Layout */}
          <div className="official-report">
            {/* Header */}
            <header className="report-header">
              <img src={schoolLogo} alt="โลโก้โรงเรียนอนุบาลหนองหานวิทยายน" className="report-logo" />
              <div className="report-title-group">
                <h1>รายงานสรุปการจัดทำและเผยแพร่สื่อการเรียนรู้ออนไลน์</h1>
                <p>คลังสื่อการเรียนรู้ดิจิทัล กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</p>
              </div>
            </header>

            {/* Teacher and School Meta with Portrait Photo */}
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <table className="report-meta-table" style={{ flex: 1, margin: 0 }}>
                <tbody>
                  <tr>
                    <td style={{ width: '60%' }}><strong>ผู้เสนอรายงาน:</strong> นายพิชญานนท์ วัจนสุนทร (ครูผู้จัดทำระบบ)</td>
                    <td><strong>วันที่ออกรายงาน:</strong> {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td><strong>ตำแหน่ง:</strong> ครูชำนาญการ กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี</td>
                    <td><strong>หน่วยงาน:</strong> โรงเรียนอนุบาลหนองหานวิทยายน</td>
                  </tr>
                  <tr>
                    <td><strong>สังกัด:</strong> สำนักงานเขตพื้นที่การศึกษาประถมศึกษาอุดรธานี เขต 3</td>
                    <td><strong>ปีการศึกษา:</strong> 2568</td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ width: '90px', height: '120px', border: '1px solid #000000', padding: '2px', background: '#ffffff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="report-portrait-container">
                <img src={teacherOfficial} alt="ภาพถ่ายข้าราชการครูพิชญานนท์" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Dynamic Summary Section */}
            <div className="report-summary-box">
              <h3>1. ตารางแจกแจงทางสถิติจำนวนและการเข้าชมสื่อ (ภาพรวม)</h3>
              <div className="report-summary-grid">
                {/* Grade Distribution */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#1e293b', textAlign: 'left' }}>ตารางแจกแจงจำแนกตามระดับชั้น</h4>
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>ระดับชั้น</th>
                        <th>จำนวนสื่อ</th>
                        <th>ยอดเข้าชม</th>
                        <th>ดาวน์โหลด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map(g => {
                        const dist = gradeDistribution[g.id] || { count: 0, views: 0, downloads: 0 };
                        return (
                          <tr key={g.id}>
                            <td>{g.label}</td>
                            <td>{dist.count} ชิ้น</td>
                            <td>{formatNumber(dist.views)}</td>
                            <td>{formatNumber(dist.downloads)}</td>
                          </tr>
                        );
                      })}
                      <tr className="total-row">
                        <td><strong>รวมทั้งหมด</strong></td>
                        <td><strong>{filteredItems.length} ชิ้น</strong></td>
                        <td><strong>{formatNumber(reportTotalViews)}</strong></td>
                        <td><strong>{formatNumber(reportTotalDownloads)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Type Distribution */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#1e293b', textAlign: 'left' }}>ตารางแจกแจงจำแนกตามประเภทสื่อ</h4>
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>ประเภทสื่อ</th>
                        <th>จำนวนสื่อ</th>
                        <th>ยอดเข้าชม</th>
                        <th>ดาวน์โหลด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(typeConfig).map(type => {
                        const dist = typeDistribution[type] || { label: type, count: 0, views: 0, downloads: 0 };
                        return (
                          <tr key={type}>
                            <td>{dist.label}</td>
                            <td>{dist.count} ชิ้น</td>
                            <td>{formatNumber(dist.views)}</td>
                            <td>{formatNumber(dist.downloads)}</td>
                          </tr>
                        );
                      })}
                      <tr className="total-row">
                        <td><strong>รวมทั้งหมด</strong></td>
                        <td><strong>{filteredItems.length} ชิ้น</strong></td>
                        <td><strong>{formatNumber(reportTotalViews)}</strong></td>
                        <td><strong>{formatNumber(reportTotalDownloads)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual Analytics Charts Section */}
              <div className="report-charts-grid">
                {/* Chart 1: Donut Chart for Media Types */}
                <div className="chart-glass-panel donut-chart-panel">
                  <h4>📊 สัดส่วนประเภทสื่อการเรียนรู้</h4>
                  <div className="donut-chart-container">
                    <div 
                      className="css-donut-chart" 
                      style={{
                        background: `conic-gradient(
                          #0f766e 0% ${videoPct}%, 
                          #10b981 ${videoPct}% ${videoPct + worksheetPct}%, 
                          #f59e0b ${videoPct + worksheetPct}% ${videoPct + worksheetPct + slidePct}%, 
                          #ef4444 ${videoPct + worksheetPct + slidePct}% 100%
                        )`
                      }}
                    >
                      <div className="donut-center-glass">
                        <strong>{filteredItems.length}</strong>
                        <span>สื่อทั้งหมด</span>
                      </div>
                    </div>
                    <div className="chart-legends">
                      <div className="legend-item">
                        <span className="legend-dot video" />
                        <span>วิดีโอ ({videoPct}%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot worksheet" />
                        <span>ใบงาน ({worksheetPct}%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot slide" />
                        <span>สไลด์ ({slidePct}%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot game" />
                        <span>เกม ({gamePct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Vertical Bar Chart for Grade Engagement */}
                <div className="chart-glass-panel bar-chart-panel">
                  <h4>📈 ระดับการเข้าชมรายชั้นเรียน (ยอดวิวสะสม)</h4>
                  <div className="bar-chart-container">
                    {grades.filter(g => g.id !== 'all').map(g => {
                      const dist = gradeDistribution[g.id] || { views: 0 };
                      const heightPct = Math.round((dist.views / maxGradeViews) * 100);
                      return (
                        <div className="bar-column" key={g.id}>
                          <div className="bar-value-label">{formatNumber(dist.views)}</div>
                          <div className="bar-track">
                            <div 
                              className="bar-fill" 
                              style={{ height: `${Math.max(heightPct, 6)}%` }}
                              title={`${g.label}: ${formatNumber(dist.views)} ยอดเข้าชม`}
                            />
                          </div>
                          <div className="bar-axis-label">{g.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="report-data-table-container">
              <h3>2. รายละเอียดและสถิติดิจิทัลรายชิ้นสื่อการเรียนรู้ที่จัดทำ</h3>
              {sortedItems.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px', border: '1px dashed #cbd5e1', margin: 0, borderRadius: '8px' }}>
                  ไม่พบสื่อตามหัวข้อหรือประเภทการคัดกรองที่ระบุ
                </p>
              ) : (
                <table className="report-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%', textAlign: 'center' }}>ลำดับ</th>
                      <th style={{ width: '45%' }}>ชื่อสื่อการเรียนรู้/หน่วยการเรียน</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>ประเภทสื่อ</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>ระดับชั้น</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>ยอดเข้าชม</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>ยอดดาวน์โหลด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="center" style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          <strong>{item.title}</strong>
                          {item.description && (
                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="center" style={{ textAlign: 'center' }}>{typeConfig[item.type]?.label || item.type}</td>
                        <td className="center" style={{ textAlign: 'center' }}>{item.gradeLabel}</td>
                        <td className="center" style={{ textAlign: 'center' }}>{formatNumber(item.views || 0)} ครั้ง</td>
                        <td className="center" style={{ textAlign: 'center' }}>{formatNumber(item.downloads || 0)} ครั้ง</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Signatures */}
            <footer className="signature-section">
              <div className="signature-box">
                <p style={{ margin: 0, fontSize: '14px' }}>ขอรับรองว่ารายงานดังกล่าวเป็นความจริงทุกประการ</p>
                <div className="signature-line-group">
                  <div className="signature-line"></div>
                  <div className="signature-name">( นายพิชญานนท์ )</div>
                  <div className="signature-title">ครูผู้รายงานและจัดทำคลังระบบสื่อ</div>
                </div>
              </div>
              
              <div className="signature-box">
                <p style={{ margin: 0, fontSize: '14px' }}>ผู้ตรวจและอนุมัติรับรองรายงาน</p>
                <div className="signature-line-group">
                  <div className="signature-line"></div>
                  <div className="signature-name">( ............................................................ )</div>
                  <div className="signature-title">ผู้อำนวยการโรงเรียนอนุบาลหนองหานวิทยายน</div>
                </div>
              </div>
            </footer>
          </div>
        </>
      )}
    </section>
  );
}

function MediaForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    grade: 'p1',
    gradeLabel: 'ป.1',
    subject: 'วิทยาศาสตร์',
    type: 'video',
    duration: '',
    palette: 'blue',
    tags: '',
    thumbnail: '',
    fileUrl: '',
    isPublished: true,
    views: 0,
    downloads: 0,
    featured: false,
    popular: false,
    new: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('กรุณากรอกชื่อสื่อ');
      return;
    }
    
    const gradeObj = grades.find(g => g.id === formData.grade);
    const dataToSave = {
      ...formData,
      gradeLabel: formData.grade === 'all' ? 'ทุกชั้นปี' : gradeObj?.label || formData.gradeLabel
    };
    
    onSave(dataToSave);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form-container">
      <div className="admin-form-grid">
        <div className="form-group">
          <label>ชื่อสื่อการเรียนรู้ <span className="required-mark">*</span></label>
          <input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            placeholder="เช่น โครงสร้างโลกและชั้นบรรยากาศ ป.4"
            className="form-input" 
          />
        </div>
        
        <div className="form-group">
          <label>คำอธิบายรายละเอียด</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="รายละเอียดและคำอธิบายเพิ่มเติมเกี่ยวกับเนื้อหาสื่อ..."
            className="form-input form-textarea" 
          />
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label>ประเภทสื่อ</label>
            <select name="type" value={formData.type} onChange={handleChange} className="form-input">
              {Object.entries(typeConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ระดับชั้นปี</label>
            <select name="grade" value={formData.grade} onChange={handleChange} className="form-input">
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label>ความยาว / จำนวนหน้า</label>
            <input 
              name="duration" 
              value={formData.duration} 
              onChange={handleChange} 
              placeholder="เช่น 10 นาที, PDF 2 หน้า, 15 สไลด์" 
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label>URL ไฟล์ดาวน์โหลด / ลิงก์ภายนอก</label>
            <input 
              name="fileUrl" 
              value={formData.fileUrl} 
              onChange={handleChange} 
              placeholder="https://..." 
              className="form-input" 
            />
          </div>
        </div>

        <div className="form-group">
          <label>แท็กคีย์เวิร์ด (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
          <input 
            name="tags" 
            value={formData.tags} 
            onChange={handleChange} 
            placeholder="เช่น วิทยาศาสตร์, โลกและอวกาศ, ป.4" 
            className="form-input" 
          />
        </div>
        
        <div className="form-group">
          <label>การนำเสนอและเผยแพร่</label>
          <div className="form-checks">
            <label>
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> แนะนำ
            </label>
            <label>
              <input type="checkbox" name="popular" checked={formData.popular} onChange={handleChange} /> ยอดนิยม
            </label>
            <label>
              <input type="checkbox" name="new" checked={formData.new} onChange={handleChange} /> มาใหม่
            </label>
            <label>
              <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} /> เผยแพร่ทันที
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-cta">
          <Save size={18} /> บันทึกข้อมูล
        </button>
        <button type="button" className="secondary-cta" onClick={onCancel}>
          <X size={18} /> ยกเลิก
        </button>
      </div>
    </form>
  );
}
