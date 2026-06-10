import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiCompany, CompanyMetrics, CompanyPayload, companiesApi } from "../services/companiesApi";

const ITEMS_PER_PAGE = 8;

interface CompanyFilters {
  search: string;
  segmento: string;
  plano: string;
  status: string;
}

interface CompaniesState {
  items: ApiCompany[];
  metrics: CompanyMetrics | null;
  totalPages: number;
  page: number;
  filters: CompanyFilters;
  tableStatus: "idle" | "loading" | "succeeded" | "failed";
  metricsStatus: "idle" | "loading" | "succeeded" | "failed";
  tableError: string | null;
  metricsError: string | null;
}

const initialState: CompaniesState = {
  items: [],
  metrics: null,
  totalPages: 1,
  page: 1,
  filters: {
    search: "",
    segmento: "Todos",
    plano: "Todos",
    status: "Todos",
  },
  tableStatus: "idle",
  metricsStatus: "idle",
  tableError: null,
  metricsError: null,
};

export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (_, { getState }) => {
    const state = getState() as { companies: CompaniesState };
    const { page, filters } = state.companies;

    return companiesApi.list({
      page,
      per_page: ITEMS_PER_PAGE,
      search: filters.search.trim(),
      segment: filters.segmento === "Todos" ? undefined : filters.segmento,
      plan: filters.plano === "Todos" ? undefined : filters.plano,
      status: filters.status === "Todos" ? undefined : filters.status,
    });
  },
);

export const fetchCompanyMetrics = createAsyncThunk(
  "companies/fetchCompanyMetrics",
  async () => {
    return companiesApi.metrics();
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { companies: CompaniesState };
      return state.companies.metricsStatus !== "loading" && state.companies.metricsStatus !== "succeeded";
    },
  },
);

export const refreshCompanyMetrics = createAsyncThunk(
  "companies/refreshCompanyMetrics",
  async () => {
    return companiesApi.metrics();
  },
);

export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (payload: CompanyPayload) => {
    return companiesApi.create(payload);
  },
);

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setSegmento(state, action: PayloadAction<string>) {
      state.filters.segmento = action.payload;
      state.page = 1;
    },
    setPlano(state, action: PayloadAction<string>) {
      state.filters.plano = action.payload;
      state.page = 1;
    },
    setStatus(state, action: PayloadAction<string>) {
      state.filters.status = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.tableStatus = "loading";
        state.tableError = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.tableStatus = "succeeded";
        state.items = action.payload.data;
        state.tableError = null;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.tableStatus = "failed";
        state.items = [];
        state.tableError = action.error.message ?? "Não foi possível carregar as empresas.";
      })
      .addCase(fetchCompanyMetrics.pending, (state) => {
        state.metricsStatus = "loading";
        state.metricsError = null;
      })
      .addCase(fetchCompanyMetrics.fulfilled, (state, action) => {
        state.metricsStatus = "succeeded";
        state.metrics = action.payload;
        state.totalPages = Math.max(Math.ceil(action.payload.total_companies / ITEMS_PER_PAGE), 1);
        state.metricsError = null;
      })
      .addCase(fetchCompanyMetrics.rejected, (state, action) => {
        state.metricsStatus = "failed";
        state.metrics = null;
        state.totalPages = 1;
        state.metricsError = action.error.message ?? "Não foi possível carregar as métricas.";
      })
      .addCase(refreshCompanyMetrics.pending, (state) => {
        state.metricsStatus = "loading";
        state.metricsError = null;
      })
      .addCase(refreshCompanyMetrics.fulfilled, (state, action) => {
        state.metricsStatus = "succeeded";
        state.metrics = action.payload;
        state.totalPages = Math.max(Math.ceil(action.payload.total_companies / ITEMS_PER_PAGE), 1);
        state.metricsError = null;
      })
      .addCase(refreshCompanyMetrics.rejected, (state, action) => {
        state.metricsStatus = "failed";
        state.metricsError = action.error.message ?? "Não foi possível carregar as métricas.";
      });
  },
});

export const { setSearch, setSegmento, setPlano, setStatus, setPage } = companiesSlice.actions;
export { ITEMS_PER_PAGE };
export default companiesSlice.reducer;
