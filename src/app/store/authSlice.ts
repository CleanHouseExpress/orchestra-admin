import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthUser, authApi } from "../services/authApi";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "failed";
  error: string | null;
}

const storedToken = localStorage.getItem("orchestra_token");
const storedUser = localStorage.getItem("orchestra_user");

const initialState: AuthState = {
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) as AuthUser : null,
  status: storedToken ? "authenticated" : "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    return authApi.login(credentials);
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };

    if (state.auth.token) {
      await authApi.logout(state.auth.token).catch(() => undefined);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        localStorage.setItem("orchestra_token", action.payload.token);
        localStorage.setItem("orchestra_user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.token = null;
        state.user = null;
        state.error = action.error.message ?? "Não foi possível fazer login.";
        localStorage.removeItem("orchestra_token");
        localStorage.removeItem("orchestra_user");
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.token = null;
        state.user = null;
        state.error = null;
        localStorage.removeItem("orchestra_token");
        localStorage.removeItem("orchestra_user");
      })
      .addCase(logout.rejected, (state) => {
        state.status = "idle";
        state.token = null;
        state.user = null;
        state.error = null;
        localStorage.removeItem("orchestra_token");
        localStorage.removeItem("orchestra_user");
      });
  },
});

export default authSlice.reducer;
