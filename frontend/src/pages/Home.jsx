import React, { useState, useEffect, useMemo } from 'react';
import GameCard from '../components/GameCard';
import CustomSelect from '../components/CustomSelect';
import { getGames } from '../api';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Сначала новые' },
  { value: 'oldest',   label: 'Сначала старые' },
  { value: 'likes',    label: 'По лайкам' },
  { value: 'comments', label: 'По комментариям' },
];

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTags, setActiveTags] = useState([]);

  useEffect(() => {
    getGames()
      .then(data => setGames(data))
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const set = new Set();
    games.forEach(g => g.categories.forEach(t => set.add(t)));
    return [...set].sort();
  }, [games]);

  function toggleTag(tag) {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  const filtered = useMemo(() => {
    let result = games;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q));
    }

    if (activeTags.length > 0) {
      result = result.filter(g =>
        activeTags.every(tag => g.categories.includes(tag))
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'newest')   return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'likes')    return b.likes.length - a.likes.length;
      if (sortBy === 'comments') return b.commentCount - a.commentCount;
      return 0;
    });
  }, [games, search, activeTags, sortBy]);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="home">
      <h1>Игры</h1>

      <div className="filter-bar">
        <div className="filter-top">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Поиск по названию..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
          />
        </div>

        {allTags.length > 0 && (
          <div className="filter-tags">
            <span className="filter-tags-label">Теги:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-chip${activeTags.includes(tag) ? ' tag-chip-active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
            {activeTags.length > 0 && (
              <button className="tag-chip tag-chip-clear" onClick={() => setActiveTags([])}>
                ✕ Сбросить
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="loading">
          {games.length === 0 ? 'Пока нет игр. Будьте первым, кто опубликует!' : 'Ничего не найдено.'}
        </div>
      ) : (
        <>
          <p className="filter-count">{filtered.length} {noun(filtered.length)}</p>
          <div className="games-grid">
            {filtered.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function noun(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'игра';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'игры';
  return 'игр';
}
