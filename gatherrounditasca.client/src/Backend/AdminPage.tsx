import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';

type TabKey = 'dashboard' | 'trails' | 'updates' | 'users' | 'leaderboard';

interface Trail {
    id: number;
    date: string;
    location: string;
    image: string;
    url: string;
    title: string;
    description: string;
    coordinates: string;
    riddle: string;
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
    popularTrails: Array<{ id: number; title: string; location: string; visitCount: number }>;
    leaderboard: LeaderboardItem[];
    latestUpdates: Array<{ updateNumber: number; date: string; locationUpdate: string; leaderboardUpdate: string }>;
}

const emptyTrail: Trail = {
    id: 0,
    date: '',
    location: '',
    image: '',
    url: '',
    title: '',
    description: '',
    coordinates: '',
    riddle: '',
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
    const [editingTrailId, setEditingTrailId] = useState<number | null>(null);

    const [updateForm, setUpdateForm] = useState<UpdateItem>(emptyUpdate);
    const [editingUpdateNumber, setEditingUpdateNumber] = useState<number | null>(null);

    const [userForm, setUserForm] = useState<UserItem>(emptyUser);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const topTrailName = useMemo(() => dashboard?.popularTrails?.[0]?.title ?? 'N/A', [dashboard]);

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        void loadAllData();
    }, [navigate]);

    const loadAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const [dashboardRes, trailsRes, updatesRes, usersRes, leaderboardRes] = await Promise.all([
                fetch('/api/admin/dashboard'),
                fetch('/api/admin/trails'),
                fetch('/api/admin/updates'),
                fetch('/api/admin/users'),
                fetch('/api/admin/leaderboard'),
            ]);

            if (!dashboardRes.ok || !trailsRes.ok || !updatesRes.ok || !usersRes.ok || !leaderboardRes.ok) {
                throw new Error('Failed to load one or more admin resources.');
            }

            const dashboardData = (await dashboardRes.json()) as DashboardData;
            const trailData = (await trailsRes.json()) as Trail[];
            const updateData = (await updatesRes.json()) as UpdateItem[];
            const userData = (await usersRes.json()) as UserItem[];
            const leaderboardData = (await leaderboardRes.json()) as LeaderboardItem[];

            setDashboard(dashboardData);
            setTrails(trailData);
            setUpdates(updateData);
            setUsers(userData);
            setLeaderboard(leaderboardData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error occurred.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('adminAuthenticated');
        navigate('/login');
    };

    const onTrailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingTrailId === null ? '/api/admin/trails' : `/api/admin/trails/${editingTrailId}`;
        const method = editingTrailId === null ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trailForm),
        });

        if (!response.ok) {
            const text = await response.text();
            setError(`Trail save failed: ${text}`);
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

    const deleteTrail = async (id: number) => {
        if (!confirm(`Delete trail #${id}?`)) return;

        const response = await fetch(`/api/admin/trails/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const text = await response.text();
            setError(`Trail delete failed: ${text}`);
            return;
        }

        await loadAllData();
    };

    const onUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingUpdateNumber === null
            ? '/api/admin/updates'
            : `/api/admin/updates/${editingUpdateNumber}`;
        const method = editingUpdateNumber === null ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateForm),
        });

        if (!response.ok) {
            const text = await response.text();
            setError(`Update save failed: ${text}`);
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

        const response = await fetch(`/api/admin/updates/${updateNumber}`, { method: 'DELETE' });
        if (!response.ok) {
            const text = await response.text();
            setError(`Update delete failed: ${text}`);
            return;
        }

        await loadAllData();
    };

    const editUser = (user: UserItem) => {
        setUserForm(user);
        setEditingUserId(user.playerId);
        setActiveTab('users');
    };

    const onUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUserId) {
            setError('Choose a user from the table before updating.');
            return;
        }

        const response = await fetch(`/api/admin/users/${encodeURIComponent(editingUserId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userForm),
        });

        if (!response.ok) {
            const text = await response.text();
            setError(`User update failed: ${text}`);
            return;
        }

        setUserForm(emptyUser);
        setEditingUserId(null);
        await loadAllData();
    };

    const deleteUser = async (playerId: string) => {
        if (!confirm(`Delete user ${playerId}?`)) return;

        const response = await fetch(`/api/admin/users/${encodeURIComponent(playerId)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const text = await response.text();
            setError(`User delete failed: ${text}`);
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

    const renderTrails = () => (
        <div className="row g-4">
            <div className="col-lg-5">
                <div className="card p-3">
                    <h5>{editingTrailId === null ? 'Add New Trail Information' : `Edit Trail #${editingTrailId}`}</h5>
                    <form onSubmit={onTrailSubmit}>
                        <input className="form-control mb-2" placeholder="Id" type="number" value={trailForm.id}
                            disabled={editingTrailId !== null}
                            onChange={(e) => setTrailForm({ ...trailForm, id: Number(e.target.value) })} required />
                        <input className="form-control mb-2" placeholder="Date" value={trailForm.date}
                            onChange={(e) => setTrailForm({ ...trailForm, date: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Location" value={trailForm.location}
                            onChange={(e) => setTrailForm({ ...trailForm, location: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Title" value={trailForm.title}
                            onChange={(e) => setTrailForm({ ...trailForm, title: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Image URL" value={trailForm.image}
                            onChange={(e) => setTrailForm({ ...trailForm, image: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Trail URL" value={trailForm.url}
                            onChange={(e) => setTrailForm({ ...trailForm, url: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Coordinates" value={trailForm.coordinates}
                            onChange={(e) => setTrailForm({ ...trailForm, coordinates: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Description" value={trailForm.description}
                            onChange={(e) => setTrailForm({ ...trailForm, description: e.target.value })} required />
                        <textarea className="form-control mb-2" placeholder="Riddle" value={trailForm.riddle}
                            onChange={(e) => setTrailForm({ ...trailForm, riddle: e.target.value })} required />
                        <input className="form-control mb-3" placeholder="Visit Count" type="number" min={0}
                            value={trailForm.visitCount}
                            onChange={(e) => setTrailForm({ ...trailForm, visitCount: Number(e.target.value) })} />

                        <button className="btn btn-primary me-2" type="submit">{editingTrailId === null ? 'Add Trail' : 'Save Trail'}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setTrailForm(emptyTrail); setEditingTrailId(null); }}>Clear</button>
                    </form>
                </div>
            </div>
            <div className="col-lg-7">
                <div className="card p-3">
                    <h5>Trail Information</h5>
                    <div className="table-responsive">
                        <table className="table table-sm table-striped">
                            <thead><tr><th>Id</th><th>Title</th><th>Location</th><th>Visits</th><th>Actions</th></tr></thead>
                            <tbody>
                                {trails.map((trail) => (
                                    <tr key={trail.id}>
                                        <td>{trail.id}</td>
                                        <td>{trail.title}</td>
                                        <td>{trail.location}</td>
                                        <td>{trail.visitCount}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editTrail(trail)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => void deleteTrail(trail.id)}>Delete</button>
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
                        <input className="form-control mb-2" placeholder="Favorite Color" value={userForm.favoriteColor}
                            onChange={(e) => setUserForm({ ...userForm, favoriteColor: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Favorite Food" value={userForm.favoriteFood}
                            onChange={(e) => setUserForm({ ...userForm, favoriteFood: e.target.value })} required />
                        <input className="form-control mb-2" placeholder="Favorite Animal" value={userForm.favoriteAnimal}
                            onChange={(e) => setUserForm({ ...userForm, favoriteAnimal: e.target.value })} required />
                        <input className="form-control mb-3" placeholder="Points" type="number" min={0} value={userForm.points}
                            onChange={(e) => setUserForm({ ...userForm, points: Number(e.target.value) })} required />

                        <button className="btn btn-primary me-2" type="submit">Save User</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setUserForm(emptyUser); setEditingUserId(null); }}>Clear</button>
                    </form>
                </div>
            </div>
            <div className="col-lg-7">
                <div className="card p-3">
                    <h5>User Statistics</h5>
                    <div className="table-responsive">
                        <table className="table table-sm table-striped">
                            <thead><tr><th>Player</th><th>Email</th><th>Points</th><th>Actions</th></tr></thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.playerId}>
                                        <td>{user.playerId}</td>
                                        <td>{user.email}</td>
                                        <td>{user.points}</td>
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