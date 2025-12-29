// App.js - React frontend to display articles from the backend API

import React, { useState, useEffect } from 'react'; // React hooks for state and lifecycle
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; // For HTTP requests
import './App.css'; // Styles for the app

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ArticleList />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 6;

  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  useEffect(() => {
    let filtered = articles;
    if (searchTerm) {
      filtered = filtered.filter(article => article.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter) {
      filtered = filtered.filter(article => article.status === statusFilter);
    }
    setFilteredArticles(filtered);
  }, [articles, searchTerm, statusFilter]);

  const fetchArticles = async (pageNumber) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${API_URL}/api/articles?page=${pageNumber}&limit=${LIMIT}`);
      setArticles(response.data.data.articles);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>BeyondChats Articles</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="original">Original</option>
          <option value="ai_updated">AI-Updated</option>
        </select>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="articles">
          {filteredArticles.map(article => (
            <div key={article._id} className="article-card">
              <h2>{article.title}</h2>
              <p className="excerpt">{article.excerpt}</p>
              <p><strong>Status:</strong> <span className={`status ${article.status}`}>{article.status === 'original' ? 'Original' : 'AI-Updated'}</span></p>
              <p><strong>Publish Date:</strong> {article.published_date}</p>
              <p><strong>Source:</strong> {article.source}</p>
              <button onClick={() => window.location.href = `/article/${article._id}`}>Read More</button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ArticleDetail() {
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/articles/${id}`);
      setArticle(response.data);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article.');
    }
  };

  if (error) return <p>{error}</p>;
  if (!article) return <p>Loading...</p>;

  return (
    <div className="article-detail">
      <button onClick={() => window.location.href = '/'}>Back to List</button>
      <h1>{article.title}</h1>
      <p><strong>Publish Date:</strong> {article.published_date}</p>
      <p><strong>Type:</strong> {article.status === 'original' ? 'Original' : 'AI-Generated'}</p>
      <p><strong>Last Updated:</strong> {new Date(article.updatedAt).toLocaleDateString()}</p>
      <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }} />
      {article.references && article.references.length > 0 && (
        <div className="references">
          <h3>References</h3>
          <ul>
            {article.references.map((ref, index) => (
              <li key={index}><a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;