import React, { useState, useMemo } from 'react';
import { LoreFragment } from '../../types/game.types';
import './LoreBook.css';

export interface LoreBookProps {
  loreFragments: LoreFragment[];
  onClose: () => void;
}

export const LoreBook: React.FC<LoreBookProps> = ({
  loreFragments,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFragment, setSelectedFragment] = useState<LoreFragment | null>(
    null,
  );

  // Group fragments by category
  const categorizedFragments = useMemo(() => {
    const categories: { [key: string]: LoreFragment[] } = {};

    loreFragments.forEach((fragment) => {
      const category = fragment.type || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(fragment);
    });

    return categories;
  }, [loreFragments]);

  // Filter fragments based on search and category
  const filteredFragments = useMemo(() => {
    let fragments = loreFragments;

    if (selectedCategory !== 'all') {
      fragments = fragments.filter(
        (fragment) => fragment.type === selectedCategory,
      );
    }

    if (searchTerm) {
      fragments = fragments.filter((fragment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          fragment.name?.toLowerCase().includes(searchLower) ||
          fragment.title?.toLowerCase().includes(searchLower) ||
          fragment.description?.toLowerCase().includes(searchLower) ||
          fragment.content?.toLowerCase().includes(searchLower)
        );
      });
    }

    return fragments;
  }, [loreFragments, selectedCategory, searchTerm]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'npc':
        return '👥';
      case 'item':
        return '⚔️';
      case 'location':
        return '🏰';
      case 'general':
        return '📜';
      default:
        return '📖';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'npc':
        return 'NPCs';
      case 'item':
        return 'Items';
      case 'location':
        return 'Locations';
      case 'general':
        return 'General';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getFragmentTitle = (fragment: LoreFragment) => {
    return fragment.title || fragment.name || fragment.Name || 'Unknown';
  };

  const getFragmentDescription = (fragment: LoreFragment) => {
    return (
      fragment.description ||
      fragment.Description ||
      fragment.content ||
      'No description available'
    );
  };

  const categories = ['all', ...Object.keys(categorizedFragments)];

  return (
    <div className="lore-book">
      <div className="lore-book__header">
        <h2 className="lore-book__title">📚 Lore Book</h2>
        <button
          className="lore-book__close"
          onClick={onClose}
          aria-label="Close lore book"
        >
          ×
        </button>
      </div>

      <div className="lore-book__controls">
        {/* Search */}
        <div className="lore-book__search">
          <input
            type="text"
            placeholder="Search lore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lore-book__search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="lore-book__categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`lore-book__category ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? '📖' : getCategoryIcon(category)}
              {category === 'all' ? 'All' : getCategoryLabel(category)}
              <span className="category-count">
                {category === 'all'
                  ? loreFragments.length
                  : categorizedFragments[category]?.length || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="lore-book__content">
        {filteredFragments.length === 0 ? (
          <div className="lore-book__empty">
            <p>📖 No lore entries found.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="lore-book__clear-search"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="lore-book__grid">
            {filteredFragments.map((fragment, index) => (
              <div
                key={index}
                className={`lore-fragment lore-fragment--${fragment.type}`}
                onClick={() => setSelectedFragment(fragment)}
              >
                <div className="lore-fragment__header">
                  <div className="lore-fragment__icon">
                    {getCategoryIcon(fragment.type)}
                  </div>
                  <div className="lore-fragment__meta">
                    <h3 className="lore-fragment__title">
                      {getFragmentTitle(fragment)}
                    </h3>
                    <span className="lore-fragment__type">
                      {getCategoryLabel(fragment.type)}
                    </span>
                  </div>
                </div>
                <p className="lore-fragment__description">
                  {getFragmentDescription(fragment).slice(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFragment && (
        <div
          className="lore-book__modal-overlay"
          onClick={() => setSelectedFragment(null)}
        >
          <div
            className="lore-book__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lore-book__modal-header">
              <div className="lore-book__modal-title">
                <span className="lore-book__modal-icon">
                  {getCategoryIcon(selectedFragment.type)}
                </span>
                <h3>{getFragmentTitle(selectedFragment)}</h3>
              </div>
              <button
                className="lore-book__modal-close"
                onClick={() => setSelectedFragment(null)}
              >
                ×
              </button>
            </div>

            <div className="lore-book__modal-content">
              <div className="lore-book__modal-type">
                {getCategoryLabel(selectedFragment.type)}
              </div>

              <div className="lore-book__modal-description">
                <p>{getFragmentDescription(selectedFragment)}</p>
              </div>

              {/* Additional NPC attributes */}
              {selectedFragment.type === 'npc' && (
                <div className="lore-book__modal-attributes">
                  {selectedFragment.Age && (
                    <div className="attribute">
                      <strong>Age:</strong> {selectedFragment.Age}
                    </div>
                  )}
                  {selectedFragment.Gender && (
                    <div className="attribute">
                      <strong>Gender:</strong> {selectedFragment.Gender}
                    </div>
                  )}
                  {selectedFragment.Occupation && (
                    <div className="attribute">
                      <strong>Occupation:</strong> {selectedFragment.Occupation}
                    </div>
                  )}
                  {selectedFragment.Location && (
                    <div className="attribute">
                      <strong>Location:</strong> {selectedFragment.Location}
                    </div>
                  )}
                  {selectedFragment.Personality && (
                    <div className="attribute">
                      <strong>Personality:</strong>{' '}
                      {selectedFragment.Personality}
                    </div>
                  )}
                  {selectedFragment.Background && (
                    <div className="attribute">
                      <strong>Background:</strong> {selectedFragment.Background}
                    </div>
                  )}
                  {selectedFragment.Motivation && (
                    <div className="attribute">
                      <strong>Motivation:</strong> {selectedFragment.Motivation}
                    </div>
                  )}
                  {selectedFragment.Connections && (
                    <div className="attribute">
                      <strong>Connections:</strong>{' '}
                      {selectedFragment.Connections}
                    </div>
                  )}
                  {selectedFragment.KnownAttributes && (
                    <div className="attribute">
                      <strong>Known Attributes:</strong>{' '}
                      {selectedFragment.KnownAttributes}
                    </div>
                  )}
                  {selectedFragment.Disposition && (
                    <div className="attribute">
                      <strong>Disposition:</strong>{' '}
                      {selectedFragment.Disposition}
                    </div>
                  )}
                  {selectedFragment.Importance && (
                    <div className="attribute">
                      <strong>Importance:</strong> {selectedFragment.Importance}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoreBook;
