'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, Calendar, User, FileText, Clock, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchGlobal } from '@/lib/api/dashboard';
import type {
  SearchResult,
  BookingSearchResult,
  ClientSearchResult,
  QuotationSearchResult,
  RecentSearch,
} from '@/types/dashboard';
import { cn } from '@/lib/utils';

/**
 * GlobalSearch Component
 *
 * A command palette style global search dialog with keyboard shortcuts.
 * Searches across bookings, clients, and quotations.
 *
 * Features:
 * - Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows)
 * - Debounced search (300ms delay)
 * - Minimum 2 characters to trigger search
 * - Grouped results by entity type
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Recent searches stored in localStorage
 * - Loading, empty, and error states
 *
 * @example
 * ```tsx
 * <GlobalSearch isOpen={isOpen} onOpenChange={setIsOpen} />
 * ```
 */

interface GlobalSearchProps {
  /** Controls whether the dialog is open */
  isOpen?: boolean;
  /** Callback when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
}

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;

export function GlobalSearch({ isOpen: controlledIsOpen, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [recentSearches, setRecentSearches] = React.useState<RecentSearch[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  /**
   * Load recent searches from localStorage
   */
  const loadRecentSearches = React.useCallback(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentSearch[];
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  /**
   * Save a search query to recent searches
   */
  const saveRecentSearch = React.useCallback((searchQuery: string) => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      let searches: RecentSearch[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate if exists
      searches = searches.filter(s => s.query !== searchQuery);

      // Add new search at the beginning
      searches.unshift({
        query: searchQuery,
        timestamp: Date.now(),
      });

      // Keep only the most recent searches
      searches = searches.slice(0, MAX_RECENT_SEARCHES);

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, []);

  /**
   * Clear all recent searches
   */
  const clearRecentSearches = React.useCallback(() => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, []);

  /**
   * Perform search API call
   */
  const performSearch = React.useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchGlobal(searchQuery);
      const allResults: SearchResult[] = [
        ...data.results.bookings,
        ...data.results.clients,
        ...data.results.quotations,
      ];
      setResults(allResults);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle result selection
   */
  const handleSelectResult = React.useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query);
      setIsOpen(false);
      router.push(result.link);
    },
    [query, saveRecentSearch, setIsOpen, router]
  );

  /**
   * Handle recent search click
   */
  const handleRecentSearchClick = React.useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  /**
   * Get icon for result type
   */
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'client':
        return User;
      case 'quotation':
        return FileText;
      default:
        return Search;
    }
  };

  /**
   * Get badge variant for status
   */
  const getBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    if (status === 'confirmed' || status === 'accepted' || status === 'B2C' || status === 'B2B') {
      return 'default';
    }
    if (status === 'pending' || status === 'draft' || status === 'sent') {
      return 'secondary';
    }
    return 'outline';
  };

  /**
   * Group results by type
   */
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      Bookings: [],
      Clients: [],
      Quotations: [],
    };

    results.forEach(result => {
      if (result.type === 'booking') {
        groups.Bookings.push(result);
      } else if (result.type === 'client') {
        groups.Clients.push(result);
      } else if (result.type === 'quotation') {
        groups.Quotations.push(result);
      }
    });

    return groups;
  }, [results]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;
      }
    },
    [results, selectedIndex, handleSelectResult]
  );

  /**
   * Global keyboard shortcut handler
   */
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, setIsOpen]);

  /**
   * Focus input when dialog opens
   */
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      loadRecentSearches();
    } else {
      // Reset state when dialog closes
      setQuery('');
      setResults([]);
      setError(null);
      setSelectedIndex(0);
    }
  }, [isOpen, loadRecentSearches]);

  /**
   * Perform search when debounced query changes
   */
  React.useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, performSearch]);

  /**
   * Scroll selected item into view
   */
  React.useEffect(() => {
    const selectedElement = document.getElementById(`search-result-${selectedIndex}`);
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[600px] p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search bookings, clients, quotations..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4"
              aria-label="Search input"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">ESC</span>
              </kbd>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[480px] p-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" label="Searching..." />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={() => performSearch(query)}>
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State - No Query */}
          {!query && !isLoading && recentSearches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Clear History
                </Button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recent.query)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-left transition-colors"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{recent.query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State - No Results */}
          {query && !isLoading && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No results found for{' '}
                <span className="font-medium text-foreground">&quot;{query}&quot;</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Try adjusting your search terms</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedResults).map(([groupName, groupResults]) => {
                if (groupResults.length === 0) return null;

                return (
                  <div key={groupName} className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                      {groupName}
                    </h3>
                    <div className="space-y-1">
                      {groupResults.map((result, index) => {
                        const globalIndex = results.indexOf(result);
                        const Icon = getResultIcon(result.type);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            id={`search-result-${globalIndex}`}
                            onClick={() => handleSelectResult(result)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors',
                              isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                            )}
                            data-selected={isSelected}
                            aria-label={`${result.title} - ${result.subtitle}`}
                          >
                            <div className="flex-shrink-0">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{result.title}</p>
                                <Badge
                                  variant={getBadgeVariant(result.status)}
                                  className="flex-shrink-0"
                                >
                                  {result.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {result.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        {results.length > 0 && (
          <div className="border-t px-4 py-3 bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px]">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px]">
                    ↵
                  </kbd>
                  <span>Select</span>
                </span>
              </div>
              <span>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
