import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import MapPicker from './MapPicker';
import { STORAGE_KEYS } from '../constants';

type TabKey = 'dashboard' | 'trails' | 'updates' | 'users' | 'leaderboard';

// A Trail is the curated wrapper; its Stops are managed separately. See docs/adr/0004.
interface Trail {
    id: string;
    name: string;
    description: string;
    region: string;
    coverImage: string;
    url: string;
    date: string;
    legacyLocationId?: number;
}

interface Stop {
    id: string;
    trailId: string;
    order: number;
    points: number;
    title: string;
    riddle: string;
    coordinates: string;
    // Per-Stop check-in radius in metres; empty falls back to the client default. See docs/adr/0006.
    radius: number | null;
    image: string;
    visitCount: number;
}

interface UpdateItem {
    updateNumber: number;
    date: string;
    locationUpdate: string;
    leaderboardUpdate: string;
    image: string;
}

interface UserItem {
    playerId: string;
    email: string;
    favoriteColor: string;
    favoriteFood: string;
    favoriteAnimal: string;
    points: number;
    isDisabled: boolean;
}

interface LeaderboardItem {
    playerId: string;
    email: string;
    points: number;
}

interface DashboardData {
    totalTrails: number;
    totalUsers: number;
    totalUpdates: number;
    popularTrails: Array<{ id: string; title: string; location: string; visitCount: number }>;
    leaderboard: LeaderboardItem[];
    latestUpdates: Array<{ updateNumber: number; date: string; locationUpdate: string; leaderboardUpdate: string }>;
}

const emptyTrail: Trail = {
    id: '',
    name: '',
    description: '',
    region: '',
    coverImage: '',
    url: '',
    date: '',
};

const emptyStop: Stop = {
    id: '',
    trailId: '',
    order: 1,
    points: 10,
    title: '',
    riddle: '',
    coordinates: '',
    radius: null,
    image: '',
    visitCount: 0,
};

const emptyUpdate: UpdateItem = {
    updateNumber: 0,
    date: '',
    locationUpdate: '',
    leaderboardUpdate: '',
    image: '',
};

const emptyUser: UserItem = {
    playerId: '',
    email: '',
    favoriteColor: '',
    favoriteFood: '',
    favoriteAnimal: '',
    points: 0,
    isDisabled: false,
};

function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [trails, setTrails] = useState<Trail[]>([]);
    const [updates, setUpdates] = useState<UpdateItem[]>([]);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

    const [trailForm, setTrailForm] = useState<Trail>(emptyTrail);
    const [editingTrailId, setEditingTrailId] = useState<string | null>(null);

    // When set, the Trails tab shows the Stop manager for this Trail.
    const [stopsTrail, setStopsTrail] = useState<Trail | null>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [stopForm, setStopForm] = useState<Stop>(emptyStop);
    const [editingStopId, setEditingStopId] = useState<string | null>(null);

    const [updateForm, setUpdateForm] = useState<UpdateItem>(emptyUpdate);
    const [editingUpdateNumber, setEditingUpdateNumber] = useState<number | null>(null);

    const [userForm, setUserForm] = useState<UserItem>(emptyUser);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [resetPin, setResetPin] = useState('');

    const topTrailName = useMemo(() => dashboard?.popularTrails?.[0]?.title ?? 'N/A', [dashboard]);

    // Every /admin/* call carries the Admin bearer token. A 401 means the token is
    // missing or expired, so drop it and send the Admin back to login. See
    // docs/adr/0003.
    const authedFetch = useCallback(async (input: string, init: RequestInit = {}) => {
        const token = sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
        const response = await fetch(input, {
            ...init,
            headers: {
                ...(init.headers ?? {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (response.status === 401) {
            sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
            navigate('/admin/login');
        }

        return response;
    }, [navigate]);

    useEffect(() => {
        const token = sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
        if (!token) {
            navigate('/admin/login');
            return;
        }

        void loadAllData();
    }, [navigate]);

    const loadAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const [dashboardRes, trailsRes, updatesRes, usersRes, leaderboardRes] = await Promise.all([
                authedFetch('/api/admin/dashboard'),
                authedFetch('/api/admin/trails'),
                authedFetch('/api/admin/updates'),
                authedFetch('/api/admin/users'),
                authedFetch('/api/admin/leaderboard'),
            ]);

            if (!dashboardRes.ok || !trailsRes.ok || !updatesRes.ok || !usersRes.ok || !leaderboardRes.ok) {
                throw new Error('Failed to load one or more admin resources.');
            }

            setDashboard((await dashboardRes.json()) as DashboardData);
            setTrails((await trailsRes.json()) as Trail[]);
            setUpdates((await updatesRes.json()) as UpdateItem[]);
            setUsers((await usersRes.json()) as UserItem[]);
            setLeaderboard((await leaderboardRes.json()) as LeaderboardItem[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error occurred.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        navigate('/admin/login');
    };

    // ----- Trails -----

    const onTrailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingTrailId === null ? '/api/admin/trails' : `/api/admin/trails/${editingTrailId}`;
        const method = editingTrailId === null ? 'POST' : 'PUT';

        const response = await authedFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trailForm),
        });

        if (!response.ok) {
            setError(`Trail save failed: ${await response.text()}`);
            return;
        }

        setTrailForm(emptyTrail);
        setEditingTrailId(null);
        await loadAllData();
    };

    const editTrail = (trail: Trail) => {
        setTrailForm(trail);
        setEditingTrailId(trail.id);
        setActiveTab('trails');
    };

    const deleteTrail = async (trail: Trail) => {
        if (!confirm(`Delete trail "${trail.name}" and all its stops?`)) return;

        const response = await authedFetch(`/api/admin/trails/${trail.id}`, { method: 'DELETE' });
        if (!response.ok) {
            setError(`Trail delete failed: ${await response.text()}`);
            return;
        }

        await loadAllData();
    };

    // ----- Stops -----

    const loadStops = useCallback(async (trailId: string) => {
        const response = await authedFetch(`/api/admin/trails/${trailId}/stops`);
        if (!response.ok) {
            setError(`Failed to load stops: ${await response.text()}`);
            return;
        }
        setStops((await response.json()) as Stop[]);
    }, [authedFetch]);

    const manageStops = async (trail: Trail) => {
        setStopsTrail(trail);
        setStopForm({ ...emptyStop, order: 1 });
        setEditingStopId(null);
        setActiveTab('trails');
        await loadStops(trail.id);
    };

    const closeStops = () => {
        setStopsTrail(null);
        setStops([]);
        setStopForm(emptyStop);
        setEditingStopId(null);
    };

    const onStopSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stopsTrail) return;

        const url = editingStopId === null
            ? `/api/admin/trails/${stopsTrail.id}/stops`
            : `/api/admin/stops/${editingStopId}`;
        const method = editingStopId === null ? 'POST' : 'PUT';

        const response = await authedFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stopForm),
        });

        if (!response.ok) {
            setError(`Stop save failed: ${await response.text()}`);
            return;
        }

        setStopForm({ ...emptyStop, order: stops.length + 1 });
        setEditingStopId(null);
        await loadStops(stopsTrail.id);
    };

    const editStop = (stop: Stop) => {
        setStopForm(stop);
        setEditingStopId(stop.id);
    };

    const deleteStop = async (stop: Stop) => {
        if (!stopsTrail) return;
        if (!confirm(`Delete stop #${stop.order} "${stop.title}"?`)) return;

        const response = await authedFetch(`/api/admin/stops/${stop.id}`, { method: 'DELETE' });
        if (!response.ok) {
            setError(`Stop delete failed: ${await response.text()}`);
            return;
        }

        await loadStops(stopsTrail.id);
    };

    // ----- Updates -----

    const onUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingUpdateNumber === null
            ? '/api/admin/updates'
            : `/api/admin/updates/${editingUpdateNumber}`;
        const method = editingUpdateNumber === null ? 'POST' : 'PUT';

        const response = await authedFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateForm),
        });

        if (!response.ok) {
            setError(`Update save failed: ${await response.text()}`);
            return;
        }

        setUpdateForm(emptyUpdate);
        setEditingUpdateNumber(null);
        await loadAllData();
    };

    const editUpdate = (item: UpdateItem) => {
        setUpdateForm(item);
        setEditingUpdateNumber(item.updateNumber);
        setActiveTab('updates');
    };

    const deleteUpdate = async (updateNumber: number) => {
        if (!confirm(`Delete update #${updateNumber}?`)) return;

        const response = await authedFetch(`/api/admin/updates/${updateNumber}`, { method: 'DELETE' });
        if (!response.ok) {
            setError(`Update delete failed: ${await response.text()}`);
            return;
        }

        await loadAllData();
    };

    // ----- Users -----

    const editUser = (user: UserItem) => {
        setUserForm(user);
        setEditingUserId(user.playerId);
        setResetPin('');
        setActiveTab('users');
    };

    const onUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUserId) {
            setError('Choose a user from the table before updating.');
            return;
        }

        const emailResponse = await authedFetch(`/api/admin/users/${encodeURIComponent(editingUserId)}/email`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userForm.email }),
        });

        if (!emailResponse.ok) {
            setError(`Email update failed: ${await emailResponse.text()}`);
            return;
        }

        const disabledResponse = await authedFetch(`/api/admin/users/${encodeURIComponent(editingUserId)}/disabled`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDisabled: userForm.isDisabled }),
        });

        if (!disabledResponse.ok) {
            setError(`Account status update failed: ${await disabledResponse.text()}`);
            return;
        }

        if (resetPin) {
            const pinResponse = await authedFetch(`/api/admin/users/${encodeURIComponent(editingUserId)}/reset-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: resetPin }),
            });

            if (!pinResponse.ok) {
                setError(`PIN reset failed: ${await pinResponse.text()}`);
                return;
            }
        }

        setUserForm(emptyUser);
        setEditingUserId(null);
        setResetPin('');
        await loadAllData();
    };

    const deleteUser = async (playerId: string) => {
        if (!confirm(`Delete user ${playerId}?`)) return;

        const response = await authedFetch(`/api/admin/users/${encodeURIComponent(playerId)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            setError(`User delete failed: ${await response.text()}`);
            return;
        }

        await loadAllData();
    };

    const renderDashboard = () => (
        <div>
            <div className="row g-3 mb-4">
                <div className="col-md-3"><div className="card p-3"><h6>Total Trails</h6><h3>{dashboard?.totalTrails ?? 0}</h3></div></div>
                <div className="col-md-3"><div className="card p-3"><h6>Total Users</h6><h3>{dashboard?.totalUsers ?? 0}</h3></div></div>
                <div className="col-md-3"><div className="card p-3"><h6>Total Updates</h6><h3>{dashboard?.totalUpdates ?? 0}</h3></div></div>
                <div className="col-md-3"><div className="card p-3"><h6>Most Popular Trail</h6><h6>{topTrailName}</h6></div></div>
            </div>

            <div className="row g-3">
                <div className="col-lg-6">
                    <div className="card p-3 h-100">
                        <h5>Popular Visited Trails</h5>
                        <ul className="list-group list-group-flush">
                            {dashboard?.popularTrails?.map((trail) => (
                                <li className="list-group-item d-flex justify-content-between" key={trail.id}>
                                    <span>{trail.title}</span>
                                    <strong>{trail.visitCount} visits</strong>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card p-3 h-100">
                        <h5>Latest Website Updates</h5>
                        <ul className="list-group list-group-flush">
                            {dashboard?.latestUpdates?.map((item) => (
                                <li className="list-group-item" key={item.updateNumber}>
                                    <div><strong>#{item.updateNumber}</strong> - {item.date}</div>
                                    <div>{item.locationUpdate}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStops = (trail: Trail) => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Stops on "{trail.name}"</h5>
                <button className="btn btn-outline-secondary btn-sm" onClick={closeStops}>← Back to trails</button>
            </div>
            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card p-3">
                        <h6>{editingStopId === null ? 'Add Stop' : `Edit Stop #${stopForm.order}`}</h6>
                        <form onSubmit={onStopSubmit}>
                            <input className="form-control mb-2" placeholder="Order" type="number" min={1} value={stopForm.order}
                                onChange={(e) => setStopForm({ ...stopForm, order: Number(e.target.value) })} required />
                            <input className="form-control mb-2" placeholder="Points" type="number" min={1} value={stopForm.points}
                                onChange={(e) => setStopForm({ ...stopForm, points: Number(e.target.value) })} required />
                            <input className="form-control mb-2" placeholder="Title" value={stopForm.title}
                                onChange={(e) => setStopForm({ ...stopForm, title: e.target.value })} required />
                            <input className="form-control mb-2" placeholder="Coordinates (lat, lon)" value={stopForm.coordinates}
                                onChange={(e) => setStopForm({ ...stopForm, coordinates: e.target.value })} required />
                            <MapPicker value={stopForm.coordinates}
                                onChange={(coords) => setStopForm({ ...stopForm, coordinates: coords })} />
                            <input className="form-control mb-2" placeholder="Check-in radius (m) — blank = default 20" type="number" min={1}
                                value={stopForm.radius ?? ''}
                                onChange={(e) => setStopForm({ ...stopForm, radius: e.target.value === '' ? null : Number(e.target.value) })} />
                            <input className="form-control mb-2" placeholder="Image URL" value={stopForm.image}
                                onChange={(e) => setStopForm({ ...stopForm, image: e.target.value })} />
                            <textarea className="form-control mb-3" placeholder="Riddle" value={stopForm.riddle}
                                onChange={(e) => setStopForm({ ...stopForm, riddle: e.target.value })} required />

                            <button className="btn btn-primary me-2" type="submit">{editingStopId === null ? 'Add Stop' : 'Save Stop'}</button>
                            <button className="btn btn-outline-secondary" type="button"
                                onClick={() => { setStopForm({ ...emptyStop, order: stops.length + 1 }); setEditingStopId(null); }}>Clear</button>
                        </form>
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="card p-3">
                        <h6>Ordered Stops</h6>
                        <div className="table-responsive">
                            <table className="table table-sm table-striped">
                                <thead><tr><th>#</th><th>Title</th><th>Pts</th><th>Visits</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {stops.map((stop) => (
                                        <tr key={stop.id}>
                                            <td>{stop.order}</td>
                                            <td>{stop.title}</td>
                                            <td>{stop.points}</td>
                                            <td>{stop.visitCount}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editStop(stop)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => void deleteStop(stop)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {stops.length === 0 && (
                                        <tr><td colSpan={5} className="text-muted">No stops yet. Add the first one.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTrails = () => {
        if (stopsTrail) return renderStops(stopsTrail);

        return (
            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card p-3">
                        <h5>{editingTrailId === null ? 'Add New Trail' : 'Edit Trail'}</h5>
                        <form onSubmit={onTrailSubmit}>
                            <input className="form-control mb-2" placeholder="Name" value={trailForm.name}
                                onChange={(e) => setTrailForm({ ...trailForm, name: e.target.value })} required />
                            <input className="form-control mb-2" placeholder="Region / Location" value={trailForm.region}
                                onChange={(e) => setTrailForm({ ...trailForm, region: e.target.value })} />
                            <input className="form-control mb-2" placeholder="Cover Image URL" value={trailForm.coverImage}
                                onChange={(e) => setTrailForm({ ...trailForm, coverImage: e.target.value })} />
                            <input className="form-control mb-2" placeholder="Trail URL" value={trailForm.url}
                                onChange={(e) => setTrailForm({ ...trailForm, url: e.target.value })} />
                            <input className="form-control mb-2" placeholder="Date" value={trailForm.date}
                                onChange={(e) => setTrailForm({ ...trailForm, date: e.target.value })} />
                            <textarea className="form-control mb-3" placeholder="Description" value={trailForm.description}
                                onChange={(e) => setTrailForm({ ...trailForm, description: e.target.value })} required />

                            <button className="btn btn-primary me-2" type="submit">{editingTrailId === null ? 'Add Trail' : 'Save Trail'}</button>
                            <button className="btn btn-outline-secondary" type="button" onClick={() => { setTrailForm(emptyTrail); setEditingTrailId(null); }}>Clear</button>
                        </form>
                        {editingTrailId === null && (
                            <p className="text-muted small mt-2 mb-0">Add a trail, then use “Stops” to add its locations.</p>
                        )}
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="card p-3">
                        <h5>Trails</h5>
                        <div className="table-responsive">
                            <table className="table table-sm table-striped">
                                <thead><tr><th>Name</th><th>Region</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {trails.map((trail) => (
                                        <tr key={trail.id}>
                                            <td>{trail.name}</td>
                                            <td>{trail.region}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => void manageStops(trail)}>Stops</button>
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editTrail(trail)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => void deleteTrail(trail)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderUpdates = () => (
        <div className="row g-4">
            <div className="col-lg-5">
                <div className="card p-3">
                    <h5>{editingUpdateNumber === null ? 'Add New Website Information' : `Edit Update #${editingUpdateNumber}`}</h5>
                    <form onSubmit={onUpdateSubmit}>
                        <input className="form-control mb-2" placeholder="Update Number" type="number" value={updateForm.updateNumber}
                            disabled={editingUpdateNumber !== null}
                            onChange={(e) => setUpdateForm({ ...updateForm, updateNumber: Number(e.target.value) })} required />
                        <input className="form-control mb-2" placeholder="Date" value={updateForm.date}
                            onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Location Update" value={updateForm.locationUpdate}
                            onChange={(e) => setUpdateForm({ ...updateForm, locationUpdate: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Leaderboard Update" value={updateForm.leaderboardUpdate}
                            onChange={(e) => setUpdateForm({ ...updateForm, leaderboardUpdate: e.target.value })} required />
                        <input className="form-control mb-3" placeholder="Image URL" value={updateForm.image}
                            onChange={(e) => setUpdateForm({ ...updateForm, image: e.target.value })} required />

                        <button className="btn btn-primary me-2" type="submit">{editingUpdateNumber === null ? 'Add Update' : 'Save Update'}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setUpdateForm(emptyUpdate); setEditingUpdateNumber(null); }}>Clear</button>
                    </form>
                </div>
            </div>
            <div className="col-lg-7">
                <div className="card p-3">
                    <h5>Website Updates</h5>
                    <div className="table-responsive">
                        <table className="table table-sm table-striped">
                            <thead><tr><th>#</th><th>Date</th><th>Location Update</th><th>Actions</th></tr></thead>
                            <tbody>
                                {updates.map((item) => (
                                    <tr key={item.updateNumber}>
                                        <td>{item.updateNumber}</td>
                                        <td>{item.date}</td>
                                        <td>{item.locationUpdate}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editUpdate(item)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => void deleteUpdate(item.updateNumber)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="row g-4">
            <div className="col-lg-5">
                <div className="card p-3">
                    <h5>Manage Information From Users</h5>
                    <form onSubmit={onUserSubmit}>
                        <input className="form-control mb-2" placeholder="Player Id" value={userForm.playerId} disabled />
                        <input className="form-control mb-2" placeholder="Email" value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Favorite Color" value={userForm.favoriteColor} disabled />
                        <input className="form-control mb-2" placeholder="Favorite Food" value={userForm.favoriteFood} disabled />
                        <input className="form-control mb-2" placeholder="Favorite Animal" value={userForm.favoriteAnimal} disabled />
                        <input className="form-control mb-2" placeholder="Points" type="number" value={userForm.points} disabled />
                        <input className="form-control mb-2" placeholder="Reset PIN (four digits)" value={resetPin} maxLength={4}
                            onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />
                        <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" id="user-disabled" checked={userForm.isDisabled}
                                onChange={(e) => setUserForm({ ...userForm, isDisabled: e.target.checked })} />
                            <label className="form-check-label" htmlFor="user-disabled">Account disabled</label>
                        </div>

                        <button className="btn btn-primary me-2" type="submit">Save User</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setUserForm(emptyUser); setEditingUserId(null); setResetPin(''); }}>Clear</button>
                    </form>
                </div>
            </div>
            <div className="col-lg-7">
                <div className="card p-3">
                    <h5>User Statistics</h5>
                    <div className="table-responsive">
                        <table className="table table-sm table-striped">
                            <thead><tr><th>Player</th><th>Email</th><th>Points</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.playerId}>
                                        <td>{user.playerId}</td>
                                        <td>{user.email}</td>
                                        <td>{user.points}</td>
                                        <td>{user.isDisabled ? 'Disabled' : 'Active'}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editUser(user)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => void deleteUser(user.playerId)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLeaderboard = () => (
        <div className="card p-3">
            <h5>View Leaderboard Information</h5>
            <div className="table-responsive">
                <table className="table table-sm table-striped">
                    <thead><tr><th>Rank</th><th>Player ID</th><th>Email</th><th>Points</th></tr></thead>
                    <tbody>
                        {leaderboard.map((entry, index) => (
                            <tr key={entry.playerId}>
                                <td>{index + 1}</td>
                                <td>{entry.playerId}</td>
                                <td>{entry.email}</td>
                                <td>{entry.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Admin Control Panel</h2>
                    <div>
                        <button className="btn btn-outline-secondary me-2" onClick={() => void loadAllData()}>Refresh</button>
                        <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
                    </div>
                </div>

                <div className="btn-group mb-4" role="group" aria-label="Admin sections">
                    <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                    <button className={`btn ${activeTab === 'trails' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('trails')}>Trails</button>
                    <button className={`btn ${activeTab === 'updates' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('updates')}>Website Info</button>
                    <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('users')}>Users</button>
                    <button className={`btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('leaderboard')}>Leaderboard</button>
                </div>

                {loading && <div className="alert alert-info">Loading admin data...</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && (
                    <>
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'trails' && renderTrails()}
                        {activeTab === 'updates' && renderUpdates()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'leaderboard' && renderLeaderboard()}
                    </>
                )}
            </div>
            <Footer />
        </>
    );
}

export default AdminPage;
