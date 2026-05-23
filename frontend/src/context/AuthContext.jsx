import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const storedToken = localStorage.getItem("token");
		if (storedUser) setUser(JSON.parse(storedUser));
		if (storedToken) setToken(storedToken);
	}, []);

	useEffect(() => {
		const handleStorageChange = () => {
			const storedUser = localStorage.getItem("user");
			const storedToken = localStorage.getItem("token");
			setUser(storedUser ? JSON.parse(storedUser) : null);
			setToken(storedToken);
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	const login = (userData, tokenData) => {
		setUser(userData);
		setToken(tokenData);
		localStorage.setItem("user", JSON.stringify(userData));
		localStorage.setItem("token", tokenData);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	};

	return (
		<AuthContext.Provider value={{ user, token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
