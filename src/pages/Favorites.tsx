import { useState, useEffect } from 'react';
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
    CircularProgress,
    Avatar,
    Divider,
    Badge,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    TextField,
    Pagination,
    CardActions,
    styled
} from '@mui/material';
import { Favorite, Star, Movie, Person, Add, Search } from '@mui/icons-material';
import type { MediaItem, ActorItem } from '../types';
import { getTVDetails, getPersonDetails, fetchPopularTVShows, fetchPopularActors } from '../api/favorites';

type FavoriteType = 'tv' | 'actor';

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
    const [favorites, setFavorites] = useState<{
        tv: MediaItem[];
        actor: ActorItem[];
    }>({ tv: [], actor: [] });
    const [loading, setLoading] = useState(true);
    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState<(MediaItem | ActorItem)[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // Load favorites on mount
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                // Demo data for first-time users (remove in production)
                if (import.meta.env.DEV || !localStorage.getItem('hasSeenDemo')) {
                    const demoTVIds = [1399, 60574, 66732]; // Game of Thrones, Lucifer, Stranger Things
                    const demoActorIds = [1245, 976, 1136406]; // Tom Hanks, Jason Statham, Tom Holland

                    if (getLocalFavorites('tv').length === 0) {
                        saveLocalFavorites('tv', demoTVIds);
                    }

                    if (getLocalFavorites('actor').length === 0) {
                        saveLocalFavorites('actor', demoActorIds);
                    }

                    localStorage.setItem('hasSeenDemo', 'true');
                }

                const [tvShows, actors] = await Promise.all([
                    Promise.all(getLocalFavorites('tv').map(id => getTVDetails(id))),
                    Promise.all(getLocalFavorites('actor').map(id => getPersonDetails(id)))
                ]);

                setFavorites({
                    tv: tvShows.filter(show => show),
                    actor: actors.filter(actor => actor)
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
            let data;
            if (activeTab === 'tv') {
                const response = await fetchPopularTVShows(page);
                data = response;
                setTotalPages(10);
            } else {
                const response = await fetchPopularActors(page);
                data = response;
                setTotalPages(10);
            }
            setSuggestedItems(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleQuickAddOpen = () => {
        setQuickAddOpen(true);
        fetchSuggestions();
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {
        if (quickAddOpen) {
            fetchSuggestions();
        }
    }, [page, activeTab, quickAddOpen]);

    const addToFavorites = (item: MediaItem | ActorItem) => {
        const type = activeTab;
        const currentFavorites = getLocalFavorites(type);

        if (!currentFavorites.includes(item.id)) {
            const updated = [...currentFavorites, item.id];
            saveLocalFavorites(type, updated);

            // Update local state
            if (type === 'tv') {
                setFavorites(prev => ({ ...prev, tv: [...prev.tv, item as MediaItem] }));
            } else {
                setFavorites(prev => ({ ...prev, actor: [...prev.actor, item as ActorItem] }));
            }
        }
    };

    const currentItems = favorites[activeTab];
    const isEmpty = currentItems.length === 0;

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
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ flexGrow: 1 }}
                >
                    <Tab
                        value="tv"
                        label={
                            <Badge badgeContent={favorites.tv.length} color="primary" showZero>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Movie /> TV Shows
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
                            <Movie sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary">
                                No favorite TV shows yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                                Add some TV shows to see them here
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary">
                                No favorite actors yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                                Add some actors to see them here
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
            ) : activeTab === 'tv' ? (
                <ItemsContainer>
                    {favorites.tv.map((show) => (
                        <ItemCard key={show.id}>
                            <CardMedia
                                component="img"
                                height="300"
                                image={
                                    show.poster_path
                                        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                                        : '/placeholder-tv.png'
                                }
                                alt={show.name}
                                onClick={() => navigate(`/tv/${show.id}`)}
                                sx={{ cursor: 'pointer', objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h6" component="div">
                                    {show.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Star color="warning" />
                                    <Typography variant="body2">
                                        {show.vote_average.toFixed(1)}
                                    </Typography>
                                    {show.first_air_date && (
                                        <Typography variant="body2" sx={{ ml: 'auto' }}>
                                            {new Date(show.first_air_date).getFullYear()}
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
                                    onClick={() => handleRemoveFavorite(show.id, 'tv')}
                                >
                                    Remove
                                </Button>
                            </Box>
                        </ItemCard>
                    ))}
                </ItemsContainer>
            ) : (
                <ItemsContainer>
                    {favorites.actor.map((actor) => (
                        <ItemCard key={actor.id}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
                                <Avatar
                                    src={
                                        actor.profile_path
                                            ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                                            : '/actor-placeholder.png'
                                    }
                                    alt={actor.name}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        cursor: 'pointer',
                                        border: '3px solid',
                                        borderColor: 'primary.main'
                                    }}
                                    onClick={() => navigate(`/person/${actor.id}`)}
                                />
                            </Box>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography gutterBottom variant="h6" component="div">
                                    {actor.name}
                                </Typography>
                                <Chip
                                    label={actor.known_for_department}
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
                                    onClick={() => handleRemoveFavorite(actor.id, 'actor')}
                                >
                                    Remove
                                </Button>
                            </Box>
                        </ItemCard>
                    ))}
                </ItemsContainer>
            )}

            {/* Quick Add Dialog */}
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
// Update the Quick Add dialog section in your Favorites.tsx
                        {suggestedItems.map(item => (
                            <Card key={item.id} sx={{ width: 175 }}>
                                {activeTab === 'tv' ? (
                                    <>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={
                                                'poster_path' in item && item.poster_path
                                                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                                    : '/placeholder-tv.png'
                                            }
                                            alt={'name' in item ? item.name : item.title || ''}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/tv/${item.id}`)}
                                        />
                                        <CardContent>
                                            <Typography variant="body2" noWrap textAlign="center">
                                                {'name' in item ? item.name : item.title || ''}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                                <Star color="warning" fontSize="small" />
                                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                    {'vote_average' in item ? item.vote_average.toFixed(1) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </>
                                ) : (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                                            <Avatar
                                                src={
                                                    'profile_path' in item && item.profile_path
                                                        ? `https://image.tmdb.org/t/p/w500${item.profile_path}`
                                                        : '/actor-placeholder.png'
                                                }
                                                sx={{ width: 100, height: 100, cursor: 'pointer' }}
                                                onClick={() => navigate(`/person/${item.id}`)}
                                            />
                                        </Box>
                                        <CardContent>
                                            <Typography variant="body2" noWrap textAlign="center">
                                                {item.name}
                                            </Typography>
                                            <Chip
                                                label={'known_for_department' in item ? item.known_for_department : 'Actor'}
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