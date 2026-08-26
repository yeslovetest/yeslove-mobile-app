import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');
const APP_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
const LOGS_PER_PAGE = 12;

const FILTERS = {
  status: ['', 'flagged', 'blocked', 'reviewed'],
  severity: ['', 'low', 'medium', 'high'],
  content_type: ['', 'post', 'comment', 'chat'],
};

const REVIEW_ACTIONS = [
  { value: 'approved', label: 'Approve' },
  { value: 'rejected', label: 'Reject' },
  { value: 'escalated', label: 'Escalate' },
];

const SECTIONS = [
  { id: 'moderation', label: 'Moderation' },
  { id: 'professionals', label: 'Professionals' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'events', label: 'Events' },
];

const emptyStats = {
  severity_stats: {},
  content_stats: {},
  suspended_users: 0,
  pending_reviews: 0,
  total_logs: 0,
};

const initialEventForm = {
  name: '',
  description: '',
  location: '',
  eventTime: '',
  creatorAttending: true,
  imageUrl: '',
  imageFile: null,
  addressNumber: '',
  addressStreet: '',
  addressCity: '',
  addressCounty: '',
  addressCountry: 'UK',
  postCode: '',
};

function titleCase(value) {
  if (!value) {
    return 'All';
  }

  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
}

function formatDate(value) {
  if (!value) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getErrorMessage(error) {
  if (error?.silent) {
    return '';
  }

  if (error?.response?.status === 401) {
    return 'Session expired. Please sign in again.';
  }

  const message = error.response?.data?.message || error.message || 'Request failed';

  if (message.includes('Invalid or expired token') || message.includes('Missing Authorization Header')) {
    return 'Session expired. Please sign in again.';
  }

  return message.replace(/^❌\s*/, '');
}

function parseJwt(token) {
  try {
    const [, payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalized));
  } catch {
    return null;
  }
}

function isAdminToken(token) {
  const payload = parseJwt(token);
  return Boolean(payload?.realm_access?.roles?.includes('admin'));
}

function normalizeMediaUrl(url) {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${APP_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('yesloveAdminToken') || '');
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('yesloveAdminRefreshToken') || '');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeSection, setActiveSection] = useState('moderation');
  const [stats, setStats] = useState(emptyStats);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: LOGS_PER_PAGE,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    content_type: '',
  });
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [professionals, setProfessionals] = useState([]);
  const [professionalPagination, setProfessionalPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [professionalFilters, setProfessionalFilters] = useState({
    status: 'pending',
    q: '',
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewNotes, setReviewNotes] = useState({});
  const [suspendForm, setSuspendForm] = useState({
    userId: '',
    reason: '',
    suspend: true,
  });

  const isAuthenticatedAdmin = Boolean(token && isAdminToken(token));

  const logout = useCallback((message = 'Signed out') => {
    setToken('');
    setRefreshToken('');
    localStorage.removeItem('yesloveAdminToken');
    localStorage.removeItem('yesloveAdminRefreshToken');
    setNotice(message);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      throw new Error('Session expired. Please sign in again.');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh_token`, {
      refresh_token: refreshToken,
    });

    const nextAccessToken = response.data.access_token;
    const nextRefreshToken = response.data.refresh_token || refreshToken;

    if (!nextAccessToken || !isAdminToken(nextAccessToken)) {
      throw new Error('Admin session could not be refreshed.');
    }

    setToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
    localStorage.setItem('yesloveAdminToken', nextAccessToken);
    localStorage.setItem('yesloveAdminRefreshToken', nextRefreshToken);
    return nextAccessToken;
  }, [refreshToken]);

  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
    });

    client.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    client.interceptors.response.use(
      (response) => response,
      async (requestError) => {
        const originalRequest = requestError.config;

        if (requestError.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const nextToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${nextToken}`;
            return client(originalRequest);
          } catch (refreshError) {
            logout('Session expired. Please sign in again.');
            return Promise.reject({ silent: true });
          }
        }

        return Promise.reject(requestError);
      }
    );

    return client;
  }, [logout, refreshAccessToken, token]);

  const loadDashboard = useCallback(async (page = 1) => {
    if (!isAuthenticatedAdmin) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        ...filters,
        page,
        per_page: LOGS_PER_PAGE,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const [statsResponse, logsResponse] = await Promise.all([
        apiClient.get('/admin/moderation/stats'),
        apiClient.get('/admin/moderation/logs', { params }),
      ]);

      setStats(statsResponse.data);
      setLogs(logsResponse.data.logs || []);
      setPagination(logsResponse.data.pagination || {
        page,
        per_page: LOGS_PER_PAGE,
        total: 0,
        pages: 1,
        has_next: false,
        has_prev: false,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [apiClient, filters, isAuthenticatedAdmin]);

  useEffect(() => {
    if (activeSection === 'moderation') {
      loadDashboard(1);
    }
  }, [activeSection, loadDashboard]);

  const loadRecentBlogs = useCallback(async () => {
    if (!isAuthenticatedAdmin) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/blog/blog-posts', {
        params: { page: 1, per_page: 10 },
      });
      setRecentBlogs(response.data.items || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [apiClient, isAuthenticatedAdmin]);

  const loadRecentEvents = useCallback(async () => {
    if (!isAuthenticatedAdmin) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/events/events', {
        params: { page: 1, per_page: 5, type: 'all' },
      });
      setRecentEvents(response.data.events || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [apiClient, isAuthenticatedAdmin]);

  const loadProfessionals = useCallback(async (page = 1) => {
    if (!isAuthenticatedAdmin) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/admin/moderation/professionals', {
        params: {
          status: professionalFilters.status,
          q: professionalFilters.q || undefined,
          page,
          per_page: professionalPagination.per_page,
        },
      });
      setProfessionals(response.data.items || []);
      setProfessionalPagination(response.data.pagination || {
        page,
        per_page: professionalPagination.per_page,
        total: 0,
        pages: 1,
        has_next: false,
        has_prev: false,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [apiClient, isAuthenticatedAdmin, professionalFilters, professionalPagination.per_page]);

  useEffect(() => {
    if (activeSection === 'blogs') {
      loadRecentBlogs();
    }

    if (activeSection === 'events') {
      loadRecentEvents();
    }

    if (activeSection === 'professionals') {
      loadProfessionals(1);
    }
  }, [activeSection, loadRecentBlogs, loadRecentEvents, loadProfessionals]);

  const login = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginForm);
      const accessToken = response.data.access_token;
      const nextRefreshToken = response.data.refresh_token;

      if (!accessToken) {
        setError('Login did not return an access token');
        return;
      }

      if (!nextRefreshToken) {
        setError('Login did not return a refresh token');
        return;
      }

      if (!isAdminToken(accessToken)) {
        setError('Admin role required');
        return;
      }

      setToken(accessToken);
      setRefreshToken(nextRefreshToken);
      localStorage.setItem('yesloveAdminToken', accessToken);
      localStorage.setItem('yesloveAdminRefreshToken', nextRefreshToken);
      setLoginForm({ username: '', password: '' });
      setNotice('Signed in');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file, fallbackUrl) => {
    if (!file) {
      return fallbackUrl.trim();
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/media/upload', formData);
    return normalizeMediaUrl(response.data.media_url || (response.data.media_id ? `/api/media/${response.data.media_id}` : ''));
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const reviewLog = async (logId, action) => {
    setActionLoading(`review-${logId}-${action}`);
    setError('');
    setNotice('');

    try {
      await apiClient.put(`/admin/moderation/logs/${logId}/review`, {
        action,
        notes: reviewNotes[logId] || '',
      });
      setNotice(`Moderation log ${action}`);
      await loadDashboard(pagination.page);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading('');
    }
  };

  const submitSuspend = async (event) => {
    event.preventDefault();

    if (!suspendForm.userId) {
      setError('User ID is required');
      return;
    }

    setActionLoading('suspend-user');
    setError('');
    setNotice('');

    try {
      const response = await apiClient.put(`/admin/moderation/users/${suspendForm.userId}/suspend`, {
        suspend: suspendForm.suspend,
        reason: suspendForm.reason,
      });
      setNotice(response.data.message || 'User status updated');
      setSuspendForm({ userId: '', reason: '', suspend: true });
      await loadDashboard(pagination.page);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading('');
    }
  };

  const syncWordPressBlogs = async () => {
    setActionLoading('sync-wordpress-blogs');
    setNotice('');

    try {
      await apiClient.post('/blog/blog-posts/sync', null, {
        params: { page: 1, per_page: 25 },
      });
      await loadRecentBlogs();
      setNotice('Blog cache refreshed from WordPress');
    } finally {
      setActionLoading('');
    }
  };

  const submitEvent = async (event) => {
    event.preventDefault();
    setActionLoading('create-event');
    setError('');
    setNotice('');

    try {
      const imageUrl = await uploadImage(eventForm.imageFile, eventForm.imageUrl);
      const payload = {
        name: eventForm.name,
        description: eventForm.description,
        location: eventForm.location,
        event_time: eventForm.eventTime,
        creator_attending: eventForm.creatorAttending,
        image_url: imageUrl || undefined,
      };

      if (eventForm.addressNumber) {
        Object.assign(payload, {
          address_number: eventForm.addressNumber,
          address_street: eventForm.addressStreet,
          address_city: eventForm.addressCity,
          address_county: eventForm.addressCounty,
          address_country: eventForm.addressCountry,
          post_code: eventForm.postCode,
        });
      }

      const response = await apiClient.post('/events/event_info', payload);
      setEventForm(initialEventForm);
      setNotice(`${response.data.message || 'Event created'}${response.data.event_id ? ` (#${response.data.event_id})` : ''}`);
      await loadRecentEvents();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading('');
    }
  };

  const verifyProfessional = async (professionalId, isVerified) => {
    setActionLoading(`professional-${professionalId}-${isVerified}`);
    setError('');
    setNotice('');

    try {
      const response = await apiClient.put(`/admin/moderation/professionals/${professionalId}/verification`, {
        is_verified: isVerified,
      });
      setNotice(response.data.message || 'Professional verification updated');
      await loadProfessionals(professionalPagination.page);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading('');
    }
  };

  const statCards = [
    { label: 'Pending Reviews', value: stats.pending_reviews, accent: 'amber' },
    { label: 'Total Logs', value: stats.total_logs, accent: 'blue' },
    { label: 'Suspended Users', value: stats.suspended_users, accent: 'red' },
    { label: 'High Severity', value: stats.severity_stats?.high || 0, accent: 'purple' },
  ];

  if (!isAuthenticatedAdmin) {
    return (
      <main className="admin-shell login-shell">
        <section className="login-panel">
          <p className="eyebrow">YesLove Admin</p>
          <h1>Admin Login</h1>
          <form className="admin-form" onSubmit={login}>
            <label>
              <span>Username</span>
              <input
                value={loginForm.username}
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
                autoComplete="username"
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit" disabled={loading}>{loading ? 'Signing in' : 'Sign In'}</button>
          </form>
          {(error || notice) && (
            <section className={`message-bar ${error ? 'error' : 'success'}`} role="status">
              {error || notice}
            </section>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="brand-lockup">
            <div className="brand-mark">Y</div>
            <div>
              <p className="eyebrow">YesLove</p>
              <strong>Admin</strong>
            </div>
          </div>

          <nav className="section-tabs" aria-label="Admin sections">
            {SECTIONS.map((section) => (
              <button
                type="button"
                key={section.id}
                className={activeSection === section.id ? 'active' : ''}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <button className="sign-out-button" type="button" onClick={logout}>
            Sign Out
          </button>
        </aside>

        <section className="admin-workspace">
          <header className="admin-header">
            <div>
              <p className="eyebrow">Admin Console</p>
              <h1>{SECTIONS.find((section) => section.id === activeSection)?.label}</h1>
            </div>
            <div className="header-actions">
              <button className="ghost-button" type="button" onClick={() => loadDashboard(pagination.page)} disabled={activeSection !== 'moderation' || loading}>
                Refresh
              </button>
            </div>
          </header>

          {(error || notice) && (
            <section className={`message-bar ${error ? 'error' : 'success'}`} role="status">
              {error || notice}
            </section>
          )}

          {activeSection === 'moderation' && (
            <ModerationSection
              actionLoading={actionLoading}
              filters={filters}
              loading={loading}
              logs={logs}
              pagination={pagination}
              reviewLog={reviewLog}
              reviewNotes={reviewNotes}
              setReviewNotes={setReviewNotes}
              statCards={statCards}
              stats={stats}
              submitSuspend={submitSuspend}
              suspendForm={suspendForm}
              setSuspendForm={setSuspendForm}
              updateFilter={updateFilter}
              loadDashboard={loadDashboard}
            />
          )}

          {activeSection === 'professionals' && (
            <ProfessionalSection
              actionLoading={actionLoading}
              loading={loading}
              professionals={professionals}
              professionalFilters={professionalFilters}
              professionalPagination={professionalPagination}
              setProfessionalFilters={setProfessionalFilters}
              loadProfessionals={loadProfessionals}
              verifyProfessional={verifyProfessional}
            />
          )}

          {activeSection === 'blogs' && (
            <BlogSection
              actionLoading={actionLoading}
              loading={loading}
              recentBlogs={recentBlogs}
              syncWordPressBlogs={syncWordPressBlogs}
            />
          )}

          {activeSection === 'events' && (
            <EventSection
              actionLoading={actionLoading}
              eventForm={eventForm}
              loading={loading}
              recentEvents={recentEvents}
              setEventForm={setEventForm}
              submitEvent={submitEvent}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function ModerationSection({
  actionLoading,
  filters,
  loading,
  logs,
  pagination,
  reviewLog,
  reviewNotes,
  setReviewNotes,
  statCards,
  stats,
  submitSuspend,
  suspendForm,
  setSuspendForm,
  updateFilter,
  loadDashboard,
}) {
  return (
    <>
      <section className="stats-grid" aria-label="Moderation summary">
        {statCards.map((card) => (
          <article className={`stat-card ${card.accent}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <div className="main-panel">
          <div className="panel-heading">
            <div>
              <h2>Review Queue</h2>
              <p>{pagination.total} records</p>
            </div>
            <div className="filters">
              {Object.entries(FILTERS).map(([name, options]) => (
                <label key={name}>
                  <span>{titleCase(name)}</span>
                  <select value={filters[name]} onChange={(event) => updateFilter(name, event.target.value)}>
                    {options.map((option) => (
                      <option value={option} key={option || 'all'}>
                        {titleCase(option)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="logs-list">
            {loading && <div className="empty-state">Loading moderation records</div>}

            {!loading && !logs.length && (
              <div className="empty-state">No moderation records match the current filters</div>
            )}

            {!loading && logs.map((log) => (
              <article className="log-row" key={log.id}>
                <div className="log-main">
                  <div className="log-title-row">
                    <strong>#{log.id} {log.user}</strong>
                    <span className={`pill severity-${log.severity || 'unknown'}`}>{titleCase(log.severity)}</span>
                    <span className="pill neutral">{titleCase(log.content_type)}</span>
                  </div>
                  <p className="log-content">{log.content || 'No content captured'}</p>
                  <div className="log-meta">
                    <span>Score {Number(log.score || 0).toFixed(2)}</span>
                    <span>Auto {titleCase(log.auto_action)}</span>
                    <span>{formatDate(log.timestamp)}</span>
                    {log.admin_override && <span>Reviewed {titleCase(log.admin_override)}</span>}
                  </div>
                </div>
                <div className="review-controls">
                  <textarea
                    value={reviewNotes[log.id] || ''}
                    onChange={(event) => setReviewNotes((current) => ({ ...current, [log.id]: event.target.value }))}
                    placeholder="Admin notes"
                  />
                  <div className="review-actions">
                    {REVIEW_ACTIONS.map((action) => (
                      <button
                        className={`action-button ${action.value}`}
                        type="button"
                        key={action.value}
                        disabled={Boolean(actionLoading)}
                        onClick={() => reviewLog(log.id, action.value)}
                      >
                        {actionLoading === `review-${log.id}-${action.value}` ? 'Saving' : action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination">
            <button type="button" disabled={!pagination.has_prev || loading} onClick={() => loadDashboard(pagination.page - 1)}>
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button type="button" disabled={!pagination.has_next || loading} onClick={() => loadDashboard(pagination.page + 1)}>
              Next
            </button>
          </div>
        </div>

        <aside className="side-panel">
          <section>
            <h2>User Controls</h2>
            <form className="suspend-form" onSubmit={submitSuspend}>
              <label>
                <span>User ID</span>
                <input
                  type="number"
                  min="1"
                  value={suspendForm.userId}
                  onChange={(event) => setSuspendForm((current) => ({ ...current, userId: event.target.value }))}
                />
              </label>
              <label>
                <span>Reason</span>
                <textarea
                  value={suspendForm.reason}
                  onChange={(event) => setSuspendForm((current) => ({ ...current, reason: event.target.value }))}
                />
              </label>
              <div className="segmented-control" role="group" aria-label="Suspension action">
                <button
                  type="button"
                  className={suspendForm.suspend ? 'active' : ''}
                  onClick={() => setSuspendForm((current) => ({ ...current, suspend: true }))}
                >
                  Suspend
                </button>
                <button
                  type="button"
                  className={!suspendForm.suspend ? 'active' : ''}
                  onClick={() => setSuspendForm((current) => ({ ...current, suspend: false }))}
                >
                  Unsuspend
                </button>
              </div>
              <button type="submit" disabled={actionLoading === 'suspend-user'}>
                {actionLoading === 'suspend-user' ? 'Saving' : 'Update User'}
              </button>
            </form>
          </section>

          <section>
            <h2>Severity</h2>
            <MetricList data={stats.severity_stats} />
          </section>

          <section>
            <h2>Content Types</h2>
            <MetricList data={stats.content_stats} />
          </section>
        </aside>
      </section>
    </>
  );
}

function ProfessionalSection({
  actionLoading,
  loading,
  professionals,
  professionalFilters,
  professionalPagination,
  setProfessionalFilters,
  loadProfessionals,
  verifyProfessional,
}) {
  return (
    <section className="main-panel verification-panel">
      <div className="panel-heading">
        <div>
          <h2>Professional Verification</h2>
          <p>{professionalPagination.total} records</p>
        </div>
        <div className="filters">
          <label>
            <span>Status</span>
            <select
              value={professionalFilters.status}
              onChange={(event) => setProfessionalFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="all">All</option>
            </select>
          </label>
          <label>
            <span>Search</span>
            <input
              value={professionalFilters.q}
              onChange={(event) => setProfessionalFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Name, email, license"
            />
          </label>
        </div>
      </div>

      <div className="verification-list">
        {loading && <div className="empty-state">Loading professionals</div>}

        {!loading && !professionals.length && (
          <div className="empty-state">No professional verification records found</div>
        )}

        {!loading && professionals.map((professional) => (
          <article className="verification-row" key={professional.id}>
            <div className="verification-main">
              <div className="log-title-row">
                <strong>{professional.username || 'Unknown user'}</strong>
                <span className={`pill ${professional.is_verified ? 'severity-low' : 'severity-medium'}`}>
                  {professional.is_verified ? 'Verified' : 'Pending'}
                </span>
                {professional.consent_license_data && <span className="pill neutral">Consent</span>}
              </div>
              <div className="verification-grid">
                <Detail label="Email" value={professional.email} />
                <Detail label="Specialization" value={professional.specialization} />
                <Detail label="License Body" value={professional.license_body} />
                <Detail label="License Number" value={professional.license_number} />
                <Detail label="Verified At" value={professional.verified_at ? formatDate(professional.verified_at) : 'Not verified'} />
                <Detail label="Next Review" value={professional.next_reverify_date || 'Not scheduled'} />
              </div>
            </div>
            <div className="verification-actions">
              {professional.registry_url && (
                <a className="secondary-link" href={professional.registry_url} target="_blank" rel="noopener noreferrer">
                  Registry
                </a>
              )}
              <button
                type="button"
                className="action-button approved"
                disabled={Boolean(actionLoading) || professional.is_verified}
                onClick={() => verifyProfessional(professional.id, true)}
              >
                {actionLoading === `professional-${professional.id}-true` ? 'Saving' : 'Verify'}
              </button>
              <button
                type="button"
                className="action-button rejected"
                disabled={Boolean(actionLoading) || !professional.is_verified}
                onClick={() => verifyProfessional(professional.id, false)}
              >
                {actionLoading === `professional-${professional.id}-false` ? 'Saving' : 'Unverify'}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="pagination">
        <button type="button" disabled={!professionalPagination.has_prev || loading} onClick={() => loadProfessionals(professionalPagination.page - 1)}>
          Previous
        </button>
        <span>Page {professionalPagination.page} of {professionalPagination.pages || 1}</span>
        <button type="button" disabled={!professionalPagination.has_next || loading} onClick={() => loadProfessionals(professionalPagination.page + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}

function BlogSection({ actionLoading, loading, recentBlogs, syncWordPressBlogs }) {
  return (
    <section className="main-panel wordpress-panel">
      <div className="panel-heading">
        <div>
          <h2>WordPress Blog Feed</h2>
          <p>yeslove.co.uk is the source of truth for blog content.</p>
        </div>
        <div className="header-actions">
          <a className="secondary-link" href="https://yeslove.co.uk/wp-admin/edit.php" target="_blank" rel="noopener noreferrer">
            WordPress Posts
          </a>
          <button
            type="button"
            className="ghost-button"
            disabled={loading || actionLoading === 'sync-wordpress-blogs'}
            onClick={syncWordPressBlogs}
          >
            {actionLoading === 'sync-wordpress-blogs' ? 'Refreshing' : 'Sync Now'}
          </button>
        </div>
      </div>

      <div className="source-truth-banner">
        <strong>Single source of truth</strong>
        <p>Create and edit blog content in WordPress. The mobile app and admin console read from the WordPress REST API through the YesLove backend.</p>
      </div>

      <div className="wordpress-list">
        {loading && <div className="empty-state">Loading WordPress posts</div>}

        {!loading && !recentBlogs.length && (
          <div className="empty-state">No WordPress blog posts found</div>
        )}

        {!loading && recentBlogs.map((blog) => (
          <article className="wordpress-post" key={blog.id}>
            {blog.image_url ? (
              <img src={blog.image_url} alt="" />
            ) : (
              <div className="post-placeholder">WP</div>
            )}
            <div className="wordpress-post-main">
              <div className="log-title-row">
                <strong>{blog.title || 'Untitled WordPress post'}</strong>
                <span className="pill neutral">WordPress #{blog.wp_post_id || blog.id}</span>
                {blog.status && <span className="pill severity-low">{titleCase(blog.status)}</span>}
              </div>
              <p>{stripHtml(blog.summary || '').slice(0, 180) || 'No excerpt available'}</p>
              <div className="log-meta">
                <span>Published {formatDate(blog.timestamp)}</span>
                {blog.modified && <span>Modified {formatDate(blog.modified)}</span>}
                {blog.slug && <span>{blog.slug}</span>}
              </div>
            </div>
            <div className="wordpress-actions">
              {blog.link && (
                <a className="secondary-link" href={blog.link} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
              )}
              {blog.edit_url && (
                <a className="secondary-link" href={blog.edit_url} target="_blank" rel="noopener noreferrer">
                  Edit
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventSection({ actionLoading, eventForm, loading, recentEvents, setEventForm, submitEvent }) {
  return (
    <section className="editor-layout">
      <div className="editor-panel">
        <div className="panel-heading">
          <div>
            <h2>Create Event</h2>
            <p>Creates a new event and notifies followers of the creator.</p>
          </div>
        </div>
        <form className="admin-form editor-form" onSubmit={submitEvent}>
          <div className="form-two-col">
            <label>
              <span>Name</span>
              <input
                value={eventForm.name}
                onChange={(event) => setEventForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              <span>Date and Time</span>
              <input
                type="datetime-local"
                value={eventForm.eventTime}
                onChange={(event) => setEventForm((current) => ({ ...current, eventTime: event.target.value }))}
                required
              />
            </label>
          </div>
          <label>
            <span>Location</span>
            <input
              value={eventForm.location}
              onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              className="large-textarea"
              value={eventForm.description}
              onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="form-two-col">
            <label>
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setEventForm((current) => ({ ...current, imageFile: event.target.files[0] || null }))}
              />
            </label>
            <label>
              <span>Image URL</span>
              <input
                value={eventForm.imageUrl}
                onChange={(event) => setEventForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="Optional fallback URL"
              />
            </label>
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={eventForm.creatorAttending}
              onChange={(event) => setEventForm((current) => ({ ...current, creatorAttending: event.target.checked }))}
            />
            <span>Creator attending</span>
          </label>
          <div className="form-divider">Address</div>
          <div className="form-two-col">
            <label>
              <span>Number</span>
              <input
                value={eventForm.addressNumber}
                onChange={(event) => setEventForm((current) => ({ ...current, addressNumber: event.target.value }))}
              />
            </label>
            <label>
              <span>Street</span>
              <input
                value={eventForm.addressStreet}
                onChange={(event) => setEventForm((current) => ({ ...current, addressStreet: event.target.value }))}
              />
            </label>
            <label>
              <span>City</span>
              <input
                value={eventForm.addressCity}
                onChange={(event) => setEventForm((current) => ({ ...current, addressCity: event.target.value }))}
              />
            </label>
            <label>
              <span>County</span>
              <input
                value={eventForm.addressCounty}
                onChange={(event) => setEventForm((current) => ({ ...current, addressCounty: event.target.value }))}
              />
            </label>
            <label>
              <span>Country</span>
              <input
                value={eventForm.addressCountry}
                onChange={(event) => setEventForm((current) => ({ ...current, addressCountry: event.target.value }))}
              />
            </label>
            <label>
              <span>Post Code</span>
              <input
                value={eventForm.postCode}
                onChange={(event) => setEventForm((current) => ({ ...current, postCode: event.target.value }))}
              />
            </label>
          </div>
          <button type="submit" disabled={actionLoading === 'create-event'}>
            {actionLoading === 'create-event' ? 'Creating' : 'Create Event'}
          </button>
        </form>
      </div>

      <RecentPanel
        title="Recent Events"
        emptyText={loading ? 'Loading saved events' : 'No events found'}
        items={recentEvents}
        renderItem={(event) => (
          <article className="recent-item" key={event.id}>
            {event.image_url && <img src={event.image_url} alt="" />}
            <div>
              <strong>#{event.id} {event.name}</strong>
              <p>{event.location || 'Event location'}</p>
              <span>{formatDate(event.event_time)}</span>
            </div>
          </article>
        )}
      />
    </section>
  );
}

function RecentPanel({ title, emptyText, items, renderItem }) {
  return (
    <aside className="recent-panel">
      <div className="recent-heading">
        <h2>{title}</h2>
        <span>{items.length}</span>
      </div>
      <div className="recent-list">
        {items.length ? items.map(renderItem) : <p className="muted">{emptyText}</p>}
      </div>
    </aside>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail">
      <span>{label}</span>
      <strong>{value || 'Not provided'}</strong>
    </div>
  );
}

function MetricList({ data }) {
  const entries = Object.entries(data || {});

  if (!entries.length) {
    return <p className="muted">No records</p>;
  }

  return (
    <div className="metric-list">
      {entries.map(([label, value]) => (
        <div className="metric-row" key={label}>
          <span>{titleCase(label)}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default App;
