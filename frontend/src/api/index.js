export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '');

export function assetUrl(path) {
	return path ? `${BASE_URL}${path}` : null;
}

function getToken() {
	return localStorage.getItem('token');
}

function authHeaders() {
	return { Authorization: `Bearer ${getToken()}` };
}

function jsonHeaders() {
	return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

async function handleRes(res) {
	const data = await res.json();
	if (res.status === 401) {
		localStorage.removeItem('user');
		localStorage.removeItem('token');
	}
	if (!res.ok) throw new Error(data.error || 'Request failed');
	return data;
}

// Auth
export async function register(data) {
	const res = await fetch(`${BASE_URL}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return handleRes(res);
}

export async function login(data) {
	const res = await fetch(`${BASE_URL}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return handleRes(res);
}

// Games
export async function getGames() {
	const res = await fetch(`${BASE_URL}/games`);
	return handleRes(res);
}

export async function getGame(gameId) {
	const res = await fetch(`${BASE_URL}/games/${gameId}`, { headers: authHeaders() });
	return handleRes(res);
}

export async function createGame(formData) {
	const res = await fetch(`${BASE_URL}/games`, {
		method: 'POST',
		headers: authHeaders(),
		body: formData,
	});
	return handleRes(res);
}

export async function updateGame(gameId, formData) {
	const res = await fetch(`${BASE_URL}/games/${gameId}`, {
		method: 'PUT',
		headers: authHeaders(),
		body: formData,
	});
	return handleRes(res);
}

export async function deleteGame(gameId) {
	const res = await fetch(`${BASE_URL}/games/${gameId}`, {
		method: 'DELETE',
		headers: authHeaders(),
	});
	return handleRes(res);
}

export async function likeGame(gameId) {
	const res = await fetch(`${BASE_URL}/games/${gameId}/like`, {
		method: 'POST',
		headers: authHeaders(),
	});
	return handleRes(res);
}

// Comments
export async function addComment(gameId, text) {
	const res = await fetch(`${BASE_URL}/games/${gameId}/comments`, {
		method: 'POST',
		headers: jsonHeaders(),
		body: JSON.stringify({ text }),
	});
	return handleRes(res);
}

export async function updateComment(id, text) {
	const res = await fetch(`${BASE_URL}/comments/${id}`, {
		method: 'PUT',
		headers: jsonHeaders(),
		body: JSON.stringify({ text }),
	});
	return handleRes(res);
}

export async function deleteComment(id) {
	const res = await fetch(`${BASE_URL}/comments/${id}`, {
		method: 'DELETE',
		headers: authHeaders(),
	});
	return handleRes(res);
}

// Users
export async function getUser(id) {
	const res = await fetch(`${BASE_URL}/users/${id}`);
	return handleRes(res);
}

export async function getUserGames(id) {
	const res = await fetch(`${BASE_URL}/users/${id}/games`);
	return handleRes(res);
}

export async function getUserLikes(id) {
	const res = await fetch(`${BASE_URL}/users/${id}/likes`);
	return handleRes(res);
}

export async function getUserComments(id) {
	const res = await fetch(`${BASE_URL}/users/${id}/comments`);
	return handleRes(res);
}

// Admin
export async function adminGetUsers() {
	const res = await fetch(`${BASE_URL}/admin/users`, { headers: authHeaders() });
	return handleRes(res);
}

export async function adminGetUser(id) {
	const res = await fetch(`${BASE_URL}/admin/users/${id}`, { headers: authHeaders() });
	return handleRes(res);
}

export async function adminBanUser(id) {
	const res = await fetch(`${BASE_URL}/admin/users/${id}/ban`, {
		method: 'PUT',
		headers: authHeaders(),
	});
	return handleRes(res);
}

export async function adminMuteUser(id) {
	const res = await fetch(`${BASE_URL}/admin/users/${id}/mute`, {
		method: 'PUT',
		headers: authHeaders(),
	});
	return handleRes(res);
}

export async function adminDeleteUser(id) {
	const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
		method: 'DELETE',
		headers: authHeaders(),
	});
	return handleRes(res);
}

export async function adminGetGames() {
	const res = await fetch(`${BASE_URL}/admin/games`, { headers: authHeaders() });
	return handleRes(res);
}

export async function adminUpdateGame(id, data) {
	const res = await fetch(`${BASE_URL}/admin/games/${id}`, {
		method: 'PUT',
		headers: jsonHeaders(),
		body: JSON.stringify(data),
	});
	return handleRes(res);
}

export async function adminDeleteGame(id) {
	const res = await fetch(`${BASE_URL}/admin/games/${id}`, {
		method: 'DELETE',
		headers: authHeaders(),
	});
	return handleRes(res);
}

export async function adminDeleteComment(id) {
	const res = await fetch(`${BASE_URL}/admin/comments/${id}`, {
		method: 'DELETE',
		headers: authHeaders(),
	});
	return handleRes(res);
}

// Forum
export async function getDiscussions(gameId) {
	const url = gameId ? `${BASE_URL}/discussions?gameId=${gameId}` : `${BASE_URL}/discussions`;
	const res = await fetch(url);
	return handleRes(res);
}

export async function getDiscussion(id) {
	const res = await fetch(`${BASE_URL}/discussions/${id}`);
	return handleRes(res);
}

export async function createDiscussion(data) {
	const res = await fetch(`${BASE_URL}/discussions`, {
		method: 'POST',
		headers: jsonHeaders(),
		body: JSON.stringify(data),
	});
	return handleRes(res);
}

export async function deleteDiscussion(id) {
	const res = await fetch(`${BASE_URL}/discussions/${id}`, {
		method: 'DELETE',
		headers: authHeaders(),
	});
	return handleRes(res);
}

export async function addReply(discussionId, text) {
	const res = await fetch(`${BASE_URL}/discussions/${discussionId}/replies`, {
		method: 'POST',
		headers: jsonHeaders(),
		body: JSON.stringify({ text }),
	});
	return handleRes(res);
}

export async function deleteReply(id) {
	const res = await fetch(`${BASE_URL}/discussions/replies/${id}`, {
		method: 'DELETE',
		headers: authHeaders(),
	});
	return handleRes(res);
}
