import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Tab,
    Tabs,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    Button,
    Avatar,
    Divider,
    Badge,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Pagination,
    CardActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    styled
} from '@mui/material';
import { Favorite, Star, Movie as MovieIcon, Person, Add, Search, Sort, FilterAlt } from '@mui/icons-material';
import type { TVSeries, Actor, MediaItem, ActorItem } from '../types';
import { getTVDetails, getPersonDetails, fetchPopularTVShows, fetchPopularActors } from '../api/favorites';

type FavoriteType = 'tv' | 'actor';
type SortOption = 'name-asc' | 'name-desc' | 'rating-asc' | 'rating-desc' | 'date-asc' | 'date-desc';
type FilterOption = 'all' | 'recent' | 'high-rated';

interface FavoritesState {
    tv: Array<TVSeries & MediaItem>;
    actor: Array<Actor & ActorItem>;
}

const ItemsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(3),
    justifyContent: 'flex-start',
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center'
    }
}));

const ItemCard = styled(Card)({
    width: '250px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
});

const FavoritesPage = () => {
    const [activeTab, setActiveTab] = useState<FavoriteType>('tv');
    const [favorites, setFavorites] = useState<FavoritesState>({ tv: [], actor: [] });
    const [loading, setLoading] = useState(true);
    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState<Array<TVSeries | Actor>>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOption, setSortOption] = useState<SortOption>('name-asc');
    const [filterOption, setFilterOption] = useState<FilterOption>('all');
    const navigate = useNavigate();

    const sortedAndFilteredFavorites = useMemo(() => {
        const items = favorites[activeTab];
        
        // Apply filtering
        let filteredItems = [...items];
        if (activeTab === 'tv') {
            const tvItems = filteredItems as Array<TVSeries & MediaItem>;
            if (filterOption === 'recent') {
                filteredItems = tvItems.filter(item => 
                    item.first_air_date && 
                    new Date(item.first_air_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                );
            } else if (filterOption === 'high-rated') {
                filteredItems = tvItems.filter(item => 
                    item.vote_average && item.vote_average >= 7.5
                );
            }
        } else {
            const actorItems = filteredItems as Array<Actor & ActorItem>;
            if (filterOption === 'recent') {
                filteredItems = actorItems.filter(item => 
                    item.popularity && item.popularity > 50
                );
            } else if (filterOption === 'high-rated') {
                filteredItems = actorItems.filter(item => 
                    item.popularity && item.popularity > 75
                );
            }
        }

        // Apply sorting
        return filteredItems.sort((a, b) => {
            const getSortName = (item: (TVSeries & MediaItem) | (Actor & ActorItem)): string => {
                if ('name' in item) return item.name || '';
                return '';
            };

            const nameA = getSortName(a);
            const nameB = getSortName(b);

            switch (sortOption) {
                case 'name-asc': return nameA.localeCompare(nameB);
                case 'name-desc': return nameB.localeCompare(nameA);
                case 'rating-asc': 
                    return ((a as MediaItem).vote_average || 0) - ((b as MediaItem).vote_average || 0);
                case 'rating-desc': 
                    return ((b as MediaItem).vote_average || 0) - ((a as MediaItem).vote_average || 0);
                case 'date-asc':
                    if ('first_air_date' in a && 'first_air_date' in b) {
                        return new Date(a.first_air_date || '').getTime() - new Date(b.first_air_date || '').getTime();
                    }
                    return 0;
                case 'date-desc':
                    if ('first_air_date' in a && 'first_air_date' in b) {
                        return new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime();
                    }
                    return 0;
                default: return 0;
            }
        });
    }, [favorites, activeTab, sortOption, filterOption]);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                if (import.meta.env.DEV || !localStorage.getItem('hasSeenDemo')) {
                    const demoTVIds = [1399, 60574, 66732];
                    const demoActorIds = [1245, 976, 1136406];

                    if (getLocalFavorites('tv').length === 0) {
                        saveLocalFavorites('tv', demoTVIds);
                    }

                    if (getLocalFavorites('actor').length === 0) {
                        saveLocalFavorites('actor', demoActorIds);
                    }

                    localStorage.setItem('hasSeenDemo', 'true');
                }

                // Fetch TV shows with proper typing
                const tvShowPromises = getLocalFavorites('tv').map(async (id) => {
                    const show = await getTVDetails(id);
                    return show as (TVSeries & MediaItem) | null;
                });
                
                // Fetch actors with proper typing
                const actorPromises = getLocalFavorites('actor').map(async (id) => {
                    const actor = await getPersonDetails(id);
                    return actor as (Actor & ActorItem) | null;
                });
                
                const [tvShows, actors] = await Promise.all([
                    Promise.all(tvShowPromises),
                    Promise.all(actorPromises)
                ]);

                setFavorites({
                    tv: tvShows.filter((show): show is TVSeries & MediaItem => show !== null),
                    actor: actors.filter((actor): actor is Actor & ActorItem => actor !== null)
                });
            } catch (error) {
                console.error('Error loading favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, []);

    const getLocalFavorites = (type: FavoriteType): number[] => {
        return JSON.parse(localStorage.getItem(`favorite_${type}s`) || '[]');
    };

    const saveLocalFavorites = (type: FavoriteType, ids: number[]): void => {
        localStorage.setItem(`favorite_${type}s`, JSON.stringify(ids));
    };

    const handleRemoveFavorite = (id: number, type: FavoriteType) => {
        const updatedItems = favorites[type].filter(item => item.id !== id);
        setFavorites(prev => ({ ...prev, [type]: updatedItems }));
        saveLocalFavorites(type, updatedItems.map(item => item.id));
    };

    const fetchSuggestions = async () => {
        try {
            if (activeTab === 'tv') {
                const response = await fetchPopularTVShows(page);
                // Ensure each item in response has TVSeries properties
                setSuggestedItems(response as unknown as Array<TVSeries>);
                setTotalPages(10);
            } else {
                const response = await fetchPopularActors(page);
                // Ensure each item in response has Actor properties
                setSuggestedItems(response as unknown as Array<Actor>);
                setTotalPages(10);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleQuickAddOpen = () => {
        setQuickAddOpen(true);
        fetchSuggestions();
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {
        if (quickAddOpen) {
            fetchSuggestions();
        }
    }, [page, activeTab, quickAddOpen]);

    const addToFavorites = async (item: TVSeries | Actor) => {
        const type = activeTab;
        const currentFavorites = getLocalFavorites(type);

        if (!currentFavorites.includes(item.id)) {
            const updated = [...currentFavorites, item.id];
            saveLocalFavorites(type, updated);

            try {
                // Get full details for the item
                if (type === 'tv') {
                    const detailedItem = await getTVDetails(item.id);
                    if (detailedItem) {
                        setFavorites(prev => ({
                            ...prev,
                            tv: [...prev.tv, detailedItem as TVSeries & MediaItem]
                        }));
                    }
                } else {
                    const detailedItem = await getPersonDetails(item.id);
                    if (detailedItem) {
                        setFavorites(prev => ({
                            ...prev,
                            actor: [...prev.actor, detailedItem as Actor & ActorItem]
                        }));
                    }
                }
            } catch (error) {
                console.error('Error adding to favorites:', error);
                // Revert the local storage change if adding fails
                saveLocalFavorites(type, currentFavorites);
            }
        }
    };

    const isEmpty = sortedAndFilteredFavorites.length === 0;
    const displayedItems = sortedAndFilteredFavorites.filter(item => 
        item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
            }}>
                <Favorite color="error" fontSize="large" />
                My Favorites
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Tabs value={activeTab} onChange={(_e, newValue) => setActiveTab(newValue as FavoriteType)} sx={{ flexGrow: 1 }}>
                    <Tab
                        value="tv"
                        label={
                            <Badge badgeContent={favorites.tv.length} color="primary" showZero>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MovieIcon /> TV Shows
                                </Box>
                            </Badge>
                        }
                        sx={{ textTransform: 'none' }}
                    />
                    <Tab
                        value="actor"
                        label={
                            <Badge badgeContent={favorites.actor.length} color="primary" showZero>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person /> Actors
                                </Box>
                            </Badge>
                        }
                        sx={{ textTransform: 'none' }}
                    />
                </Tabs>

                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleQuickAddOpen}
                    sx={{ ml: 2 }}
                >
                    Quick Add
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel><Sort sx={{ fontSize: 16, mr: 1 }} /> Sort</InputLabel>
                    <Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        label="Sort"
                    >
                        <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                        <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                        <MenuItem value="rating-asc">Rating (Low-High)</MenuItem>
                        <MenuItem value="rating-desc">Rating (High-Low)</MenuItem>
                        {activeTab === 'tv' && <MenuItem value="date-asc">Date (Old-New)</MenuItem>}
                        {activeTab === 'tv' && <MenuItem value="date-desc">Date (New-Old)</MenuItem>}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel><FilterAlt sx={{ fontSize: 16, mr: 1 }} /> Filter</InputLabel>
                    <Select
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                        label="Filter"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="recent">Recent</MenuItem>
                        <MenuItem value="high-rated">High Rated</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder={`Search ${activeTab === 'tv' ? 'TV shows' : 'actors'}...`}
                    sx={{ ml: 'auto', width: 250 }}
                    InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            <Divider sx={{ mb: 4 }} />

            {loading ? (
                <ItemsContainer>
                    {[...Array(4)].map((_, index) => (
                        <ItemCard key={index}>
                            <Skeleton variant="rectangular" height={300} />
                            <CardContent>
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="40%" />
                            </CardContent>
                        </ItemCard>
                    ))}
                </ItemsContainer>
            ) : isEmpty ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 10,
                    textAlign: 'center'
                }}>
                    {activeTab === 'tv' ? (
                        <>
                            <MovieIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary">
                                No favorite TV shows found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                                {filterOption !== 'all' ? 'Try changing your filters' : 'Add some TV shows to see them here'}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary">
                                No favorite actors found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                                {filterOption !== 'all' ? 'Try changing your filters' : 'Add some actors to see them here'}
                            </Typography>
                        </>
                    )}
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleQuickAddOpen}
                    >
                        Add Popular {activeTab === 'tv' ? 'TV Shows' : 'Actors'}
                    </Button>
                </Box>
            ) : (
                <ItemsContainer>
                    {displayedItems.map((item) => (
                        activeTab === 'tv' ? (
                            <ItemCard key={item.id}>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={
                                        (item as TVSeries).poster_path
                                            ? `https://image.tmdb.org/t/p/w500${(item as TVSeries).poster_path}`
                                            : '/placeholder-tv.png'
                                    }
                                    alt={item.name || ''}
                                    onClick={() => navigate(`/tv/${item.id}`)}
                                    sx={{ cursor: 'pointer', objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {item.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Star color="warning" />
                                        <Typography variant="body2">
                                            {((item as MediaItem).vote_average || 0).toFixed(1)}
                                        </Typography>
                                        {(item as TVSeries).first_air_date && (
                                            <Typography variant="body2" sx={{ ml: 'auto' }}>
                                                {new Date((item as TVSeries).first_air_date || '').getFullYear()}
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                                <Box sx={{ p: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<Favorite />}
                                        onClick={() => handleRemoveFavorite(item.id, 'tv')}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </ItemCard>
                        ) : (
                            <ItemCard key={item.id}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
                                    <Avatar
                                        src={
                                            (item as Actor).profile_path
                                                ? `https://image.tmdb.org/t/p/w500${(item as Actor).profile_path}`
                                                : '/actor-placeholder.png'
                                        }
                                        alt={item.name || ''}
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            cursor: 'pointer',
                                            border: '3px solid',
                                            borderColor: 'primary.main'
                                        }}
                                        onClick={() => navigate(`/person/${item.id}`)}
                                    />
                                </Box>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {item.name}
                                    </Typography>
                                    <Chip
                                        label={(item as Actor).known_for_department || 'Actor'}
                                        size="small"
                                        color="primary"
                                        sx={{ mb: 1 }}
                                    />
                                </CardContent>
                                <Box sx={{ p: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<Favorite />}
                                        onClick={() => handleRemoveFavorite(item.id, 'actor')}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </ItemCard>
                        )
                    ))}
                </ItemsContainer>
            )}

            <Dialog
                open={quickAddOpen}
                onClose={() => setQuickAddOpen(false)}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                    Add Popular {activeTab === 'tv' ? 'TV Shows' : 'Actors'}
                    <TextField
                        size="small"
                        placeholder={`Search ${activeTab === 'tv' ? 'TV shows' : 'actors'}...`}
                        sx={{ ml: 2, width: 300 }}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                        }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        pt: 2,
                        justifyContent: 'center'
                    }}>
                        {suggestedItems.map(item => (
                            <Card key={item.id} sx={{ width: 175 }}>
                                {activeTab === 'tv' ? (
                                    <>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={
                                                (item as TVSeries).poster_path
                                                    ? `https://image.tmdb.org/t/p/w500${(item as TVSeries).poster_path}`
                                                    : '/placeholder-tv.png'
                                            }
                                            alt={item.name || 'Unknown'}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/tv/${item.id}`)}
                                        />
                                        <CardContent>
                                            <Typography variant="body2" noWrap textAlign="center">
                                                {item.name || 'Unknown'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                                <Star color="warning" fontSize="small" />
                                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                    {(item as TVSeries).vote_average?.toFixed(1) || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </>
                                ) : (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                                            <Avatar
                                                src={
                                                    (item as Actor).profile_path
                                                        ? `https://image.tmdb.org/t/p/w500${(item as Actor).profile_path}`
                                                        : '/actor-placeholder.png'
                                                }
                                                sx={{ width: 100, height: 100, cursor: 'pointer' }}
                                                onClick={() => navigate(`/person/${item.id}`)}
                                            />
                                        </Box>
                                        <CardContent>
                                            <Typography variant="body2" noWrap textAlign="center">
                                                {item.name || 'Unknown'}
                                            </Typography>
                                            <Chip
                                                label={(item as Actor).known_for_department || 'Actor'}
                                                size="small"
                                                sx={{ mt: 1 }}
                                            />
                                        </CardContent>
                                    </>
                                )}
                                <CardActions sx={{ justifyContent: 'center' }}>
                                    <Button
                                        size="small"
                                        startIcon={<Favorite />}
                                        onClick={() => addToFavorites(item)}
                                        disabled={getLocalFavorites(activeTab).includes(item.id)}
                                    >
                                        {getLocalFavorites(activeTab).includes(item.id) ? 'Added' : 'Add'}
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 1 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FavoritesPage;